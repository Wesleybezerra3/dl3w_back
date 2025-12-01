const { Professor } = require("../models");
const { Disciplina } = require("../models");
const { Turma } = require("../models");
const { Aluno } = require("../models");
const { Curso } = require("../models");

const { where, Op } = require("sequelize");

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
};

const generateInitialPassword = require("../utils/passwordInit");

async function generateMatricula() {
    // Busca a maior matrícula já cadastrada
    const lastTeacher = await Professor.findOne({
        order: [
            ["matricula", "DESC"]
        ],
        attributes: ["matricula"],
    });

    // Se não existe nenhum aluno, começa em 1
    const lastMatricula = lastTeacher ? parseInt(lastTeacher.matricula, 10) : 0;
    return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.login = async(req, res) => {
    const { matricula, senha } = req.body;
    try {
        const teacher = await Professor.findOne({ where: { matricula, senha } });
        // if (teacher.situacao === 'Inativo') {
        //     res.status(401).json({ message: 'Professor inativo, não autorizado' })
        // }
        if (teacher) {
            const token = generateToken(teacher);
            res.status(200).json({ message: "Login realizado com sucesso", token });
        } else {
            res.status(401).json({ message: "Matrícula ou senha incorretos" });
        }
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        res.status(500).json({ error: "Erro ao realizar login" });
    }
};

exports.me = async(req, res) => {
    try {
        const user = await Professor.findByPk(req.user.id, {
            include: [{
                model: Disciplina,
                as: "disciplinas",
                include: [{
                    model: Curso,
                    as: "curso",
                    include: [{
                        model: Turma,
                        as: "turmas",
                        include: [{
                            model: Aluno,
                            as: "alunos",
                        }],
                    }],
                }],
            }],
        });

        if (!user) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }

        // Monta dados completos por disciplina
        const resultado = user.disciplinas.map((disciplina) => {
            const turmas = disciplina.curso?.turmas || [];
            // Somar total
            let totalAlunos = 0;

            // Formatar lista de turmas + alunos
            const turmasFormatadas = turmas.map(turma => {
                const alunos = turma.alunos || [];
                totalAlunos += alunos.length;

                return {
                    id: turma.id,
                    nome: turma.nome,
                    turno: turma.turno,
                    quantidadeAlunos: alunos.length,
                    alunos: alunos.map(a => ({
                        id: a.id,
                        nome: a.nome,
                        email: a.email,
                        cpf: a.cpf,
                    }))
                };
            });

            return {
                id: disciplina.id,
                nome: disciplina.nome,
                totalAlunos,
                turmas: turmasFormatadas
            };
        });

        return res.json({
            professor: {
                id: user.id,
                nome: user.nome,
            },
            disciplinas: resultado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao buscar dados" });
    }
};


exports.getAllTeacher = async(req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        let offset;

        // Calcula o offset para a paginação dos livros
        if (page && limit) {
            offset = (page - 1) * limit;
        }
        // Buscar todos os professores com suas disciplinas
        const professores = await Professor.findAll({
            include: [{
                model: Disciplina,
                as: "disciplinas",
                attributes: ["id", "nome", "carga_horaria"],
                through: { attributes: [] }, // remove tabela pivot da resposta
            }, ],
            limit: Number(limit),
            offset: Number(offset),
        });

        const totalTeachers = await Professor.findAll();

        if (professores.length === 0) {
            return res.status(404).json({ message: "Nenhum professor encontrado" });
        }
        // Retornar a lista de professores

        res.status(200).json({
            professores,
            totalTeachers: totalTeachers.length,
        });
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        res.status(500).json({ message: "Erro ao buscar professores" });
    }
};

exports.getByMatricula = async(req, res) => {
    const matricula = req.query.matricula;
    try {
        const teacher = await Professor.findOne({
            where: { matricula: matricula },
            include: [{
                model: Disciplina,
                as: "disciplinas",
                attributes: ["id", "nome", "carga_horaria"],
                through: { attributes: [] },
            }, ],
        });
        if (teacher) {
            res.status(200).json(teacher);
        } else {
            res.status(404).json({ message: "Professor não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar professor:", error);
        res.status(500).json({ message: "Erro ao buscar professor" });
    }
};

exports.createTeacher = async(req, res) => {
    try {
        const { nome, cpf, data_nascimento, email, titulacao } = req.body;
        const senha = generateInitialPassword();
        const matricula = await generateMatricula();

        const exists = await Professor.findOne({ where: { matricula } });
        if (exists) {
            return res
                .status(400)
                .json({ error: "Matrícula já existente, tente novamente." });
        }

        const newTeacher = await Professor.create({
            nome,
            senha,
            cpf,
            data_nascimento,
            email,
            titulacao,
            matricula,
            situacao: "ativo",
        });
        res.status(201).json(newTeacher);
    } catch (error) {
        console.error("Erro ao criar professor:", error);
        res.status(500).json({ error: "Erro ao criar professor" });
    }
};

exports.updateTeacher = async(req, res) => {
    try {
        const { matricula } = req.query;
        const { nome, cpf, data_nascimento, email, titulacao } = req.body;
        if (!matricula) {
            return res.status(400).json({ message: "id não informada" });
        }

        // Busca o estudante pela matrícula
        const professor = await Professor.findOne({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }

        // Atualizações básicas
        if (nome) professor.nome = nome;
        if (cpf) professor.cpf = cpf;
        if (data_nascimento) professor.data_nascimento = data_nascimento;
        if (email) professor.email = email;
        if (titulacao) professor.titulacao = titulacao;

        await professor.save();

        return res.status(200).json({
            message: "Dados atualizados com sucesso",
            professor,
        });
    } catch (error) {
        console.error("Erro ao atualizar da professor:", error);
        return res.status(500).json({ message: "Erro ao atualizar professor" });
    }
};

exports.searchTeacher = async(req, res) => {
    try {
        const { teacherName } = req.query; // Obtém o título da consulta
        let teacher;

        // Se o título não for fornecido, retorna todos os salas
        if (!teacherName) {
            teacher = await Sala.findAll();
            return res.status(404).json({ message: "O nome não foi fornecido" });
        } else {
            // Busca salas cujo título contém a string especificada
            teacher = await Professor.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${teacherName}%`, // Filtro "contém" com wildcard (%)
                    },
                },
            });
        }

        if (teacher.length === 0) {
            return res.status(200).json([]);
        }

        // Converte os resultados em objetos simples
        const teacherData = teacher.map((professor) =>
            professor.get({ plain: true })
        );

        return res.status(200).json(teacherData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar professores!" });
    }
};

exports.addDisciplineToTeacher = async(req, res) => {
    try {
        const { id_professor, id_disciplina } = req.body;

        if (!id_professor || !id_disciplina) {
            return res
                .status(400)
                .json({ error: "professorId e disciplinaId são obrigatórios." });
        }

        // Verifica se o professor existe
        const professor = await Professor.findByPk(id_professor);
        if (!professor) {
            return res.status(404).json({ error: "Professor não encontrado." });
        }

        // Verifica se disciplina existe
        const disciplina = await Disciplina.findByPk(id_disciplina);
        if (!disciplina) {
            return res.status(404).json({ error: "Disciplina não encontrada." });
        }

        // Verifica se já está vinculado
        const isDiscipline = await professor.hasDisciplina(disciplina);
        if (isDiscipline) {
            return res
                .status(400)
                .json({ error: "Esta disciplina já está vinculada a este professor." });
        }

        // Faz vínculo
        await professor.addDisciplina(disciplina);

        return res.status(201).json({
            message: "Disciplina adicionada ao professor com sucesso!",
        });
    } catch (error) {
        console.error("Erro ao adicionar disciplina ao professor:", error);
        return res
            .status(500)
            .json({ error: "Erro ao adicionar disciplina ao professor" });
    }
};

exports.changeStatus = async(req, res) => {
    try {
        const { matricula, situacao } = req.body;

        if (!matricula || !situacao) {
            return res
                .status(400)
                .json({ message: "Matrícula e nova situação obrigatórios." });
        }

        const professor = await Professor.findOne({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }

        professor.situacao = situacao;
        await professor.save();

        return res.status(200).json({
            message: "Situação atualizada com sucesso",
            professor,
        });
    } catch (error) {
        console.error("Erro ao alterar situação:", error);
        res.status(500).json({ message: "Erro interno ao alterar situação" });
    }
};

exports.resetPassword = async(req, res) => {
    try {
        const { matricula } = req.body;

        if (!matricula) {
            return res.status(400).json({ message: "Matrícula é obrigatória." });
        }

        const professor = await Professor.findOne({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }

        // Gera nova senha automaticamente
        const newPassword = generateInitialPassword();

        // Atualiza no banco
        professor.senha = newPassword;
        await professor.save();

        return res.status(200).json({
            message: "Senha redefinida com sucesso",
            novaSenha: newPassword,
        });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ message: "Erro interno ao redefinir senha" });
    }
};