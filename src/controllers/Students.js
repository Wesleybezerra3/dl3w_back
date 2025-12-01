const { Aluno } = require("../models");
const { Turma } = require("../models");
const { Curso } = require("../models");
const { Professor } = require("../models");
const { Disciplina } = require("../models");
const { where, Op } = require("sequelize");

const generateInitialPassword = require("../utils/passwordInit");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
};

async function generateMatricula() {
    // Busca a maior matrícula já cadastrada
    const lastStudent = await Aluno.findOne({
        order: [
            ["matricula", "DESC"]
        ],
        attributes: ["matricula"],
    });

    // Se não existe nenhum aluno, começa em 1
    const lastMatricula = lastStudent ? parseInt(lastStudent.matricula, 10) : 0;
    return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.login = async(req, res) => {
    const { matricula, senha } = req.body;
    try {
        const student = await Aluno.findOne({ where: { matricula, senha } });
        if(student?.situacao === 'Inativo'){
            res.status(401).json({message:'Aluno inativo, não autorizado'})
        }
        if (student) {
            const token = generateToken(student);
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
        // const user = await Aluno.findByPk(req.user.id, {
        //   include: [
        //    {
        //       model: Turma,
        //       as: "turma",
        //       include: [
        //         {
        //           model: Curso,
        //           as: "curso",
        //         }
        //       ]
        //     }
        //   ],
        // });

        const user = await Aluno.findByPk(req.user.id, {
            include: [{
                model: Turma,
                as: "turma",
                attributes: ["id", "nome", "turno", "semestre"],

                include: [{
                    model: Curso,
                    as: "curso",
                    attributes: ["id", "nome", "duracao_meses"],

                    include: [{
                        model: Disciplina,
                        as: "disciplinas", // M-N entre curso e disciplina
                        attributes: ["id", "nome", "carga_horaria", "modalidade"],

                        through: { attributes: [] }, // remove tabela pivot da resposta

                        include: [{
                            model: Professor,
                            as: "professores", // M-N entre disciplina e professor
                            attributes: ["id", "nome", "titulacao"],
                            through: { attributes: [] },
                        }, ],
                    }, ],
                }, ],
            }, ],
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        return res.status(200).json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro ao buscar usuário!" });
    }
};

exports.createStudent = async(req, res) => {
    try {
        const { nome, cpf, data_nascimento, email, turma } = req.body;
        const id_turma = turma;
        const senha = generateInitialPassword();
        const matricula = await generateMatricula();

        const exists = await Aluno.findOne({ where: { matricula } });
        if (exists) {
            return res
                .status(400)
                .json({ error: "Matrícula já existente, tente novamente." });
        }

        const newStudent = await Aluno.create({
            nome,
            senha,
            cpf,
            data_nascimento,
            email,
            id_turma,
            matricula,
            situacao: "ativo",
        });
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Erro ao criar estudante:", error);
        res.status(500).json({ error: "Erro ao criar estudante" });
    }
};

exports.getStudentByMatricula = async(req, res) => {
    const matricula = req.query.matricula;
    try {
        const student = await Aluno.findOne({
            where: { matricula: matricula },
            include: [{
                model: Turma,
                as: "turma",
                attributes: ["id", "nome", "turno", "semestre"],

                include: [{
                    model: Curso,
                    as: "curso",
                    attributes: ["id", "nome", "duracao_meses"],

                    include: [{
                        model: Disciplina,
                        as: "disciplinas", // M-N entre curso e disciplina
                        attributes: ["id", "nome", "carga_horaria", "modalidade"],

                        through: { attributes: [] }, // remove tabela pivot da resposta

                        include: [{
                            model: Professor,
                            as: "professores", // M-N entre disciplina e professor
                            attributes: ["id", "nome", "titulacao"],
                            through: { attributes: [] },
                        }, ],
                    }, ],
                }, ],
            }, ],
        });
        if (student) {
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: "Estudante não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao buscar estudante:", error);
        res.status(500).json({ error: "Erro ao buscar estudante" });
    }
};

exports.getStudentsAll = async(req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        let offset;

        // Calcula o offset para a paginação dos livros
        if (page && limit) {
            offset = (page - 1) * limit;
        }

        const students = await Aluno.findAll({
            include: [{
                model: Turma,
                as: "turma",
                include: [{
                    model: Curso,
                    as: "curso",
                }, ],
            }, ],
            limit: Number(limit),
            offset: Number(offset),
        });

        const totalStudents = await Aluno.findAll();

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "Nenhum estudante encontrado" });
        }
        res.status(200).json({
            students,
            totalStudents: totalStudents.length,
        });
    } catch (error) {
        console.error("Erro ao listar estudantes:", error);
        res.status(500).json({ error: "Erro ao listar estudantes" });
    }
};


exports.searchStudent = async(req, res) => {
    try {
        const { studentName } = req.query; // Obtém o título da consulta
        let alunos;

        // Se o título não for fornecido, retorna todos os salas
        if (!studentName) {
            alunos = await Sala.findAll();
            return res.status(404).json({ message: 'O nome não foi fornecido' });
        } else {
            // Busca salas cujo título contém a string especificada
            alunos = await Aluno.findAll({
                where: {
                    nome: {
                        [Op.like]: `%${studentName}%`, // Filtro "contém" com wildcard (%)
                    },
                },
            });
        }

        if (alunos.length === 0) {
            return res.status(200).json([]);
        }

        // Converte os resultados em objetos simples
        const alunosData = alunos.map((aluno) => aluno.get({ plain: true }));

        return res.status(200).json(alunosData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar salas!" });
    }
};

exports.definePassword = async(req, res) => {
    try {
        const { matricula, oldPassword, newPassword } = req.body;
        const student = await Aluno.findOne({ where: { matricula: matricula } });
        if (!student) {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }
        if (student.senha !== oldPassword) {
            return res.status(400).json({ message: "Senha anterior incorreta" });
        }
        student.senha = newPassword;
        await student.save();
        res.status(200).json({ message: "Senha atualizada com sucesso" });
    } catch (error) {
        console.error("Erro ao definir senha:", error);
        res.status(500).json({ error: "Erro ao definir senha" });
    }
};


exports.updateStudent = async(req, res) => {
    try {
        const { matricula } = req.query;
        const { nome, cpf, data_nascimento, email, id_turma } = req.body;

        if (!matricula) {
            return res.status(400).json({ message: "Matrícula não informada" });
        }

        // Busca o estudante pela matrícula
        const student = await Aluno.findOne({ where: { matricula } });

        if (!student) {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }

        // Atualizações básicas
        if (nome) student.nome = nome;
        if (cpf) student.cpf = cpf;
        if (data_nascimento) student.data_nascimento = data_nascimento;
        if (email) student.email = email;

        // Troca de turma
        if (id_turma) {
            const turma = await Turma.findByPk(id_turma);
            if (!turma) {
                return res.status(400).json({ message: "Turma informada não existe" });
            }

            student.id_turma = id_turma;
        }

        await student.save();

        return res.status(200).json({
            message: "Dados atualizados com sucesso",
            student
        });

    } catch (error) {
        console.error("Erro ao atualizar estudante:", error);
        return res.status(500).json({ message: "Erro ao atualizar estudante" });
    }
};


//Ações adm

exports.changeClass = async (req, res) => {
    try {
        const { matricula, id_turma } = req.body;

        if (!matricula || !id_turma) {
            return res.status(400).json({ message: "Matrícula e nova turma obrigatórias." });
        }

        const student = await Aluno.findOne({ where: { matricula } });
        if (!student) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        const turma = await Turma.findByPk(id_turma);
        if (!turma) {
            return res.status(400).json({ message: "Turma informada não existe" });
        }

        student.id_turma = id_turma;
        await student.save();

        return res.status(200).json({ message: "Turma alterada com sucesso", student });

    } catch (error) {
        console.error("Erro ao mudar turma:", error);
        res.status(500).json({ message: "Erro interno ao mudar turma" });
    }
};

exports.changeCourse = async (req, res) => {
    try {
        const { matricula, id_curso } = req.body;

        if (!matricula || !id_curso) {
            return res.status(400).json({ message: "Matrícula e novo curso são obrigatórios." });
        }

        const student = await Aluno.findOne({ where: { matricula } });
        if (!student) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        const curso = await Curso.findByPk(id_curso);
        if (!curso) {
            return res.status(400).json({ message: "Curso informado não existe" });
        }

        // Buscar turmas do curso
        const turmas = await Turma.findAll({
            where: { id_curso },
            order: [["semestre", "ASC"]] // opcional: pega a turma mais básica
        });

        if (turmas.length === 0) {
            return res.status(400).json({
                message: "Curso encontrado, porém não há turmas cadastradas para ele."
            });
        }

        // Seleciona a primeira turma disponível
        const novaTurma = turmas[0];

        // Atualizando aluno
        student.id_curso = id_curso;
        student.id_turma = novaTurma.id;

        await student.save();

        return res.status(200).json({
            message: `Curso alterado com sucesso!`,
            turma: novaTurma,
            student
        });

    } catch (error) {
        console.error("Erro ao mudar curso:", error);
        res.status(500).json({ message: "Erro interno ao mudar curso" });
    }
};

exports.changeStatus = async (req, res) => {
    try {
        const { matricula, situacao } = req.body;

        if (!matricula || !situacao) {
            return res.status(400).json({ message: "Matrícula e nova situação obrigatórios." });
        }

        const student = await Aluno.findOne({ where: { matricula } });

        if (!student) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        student.situacao = situacao;
        await student.save();

        return res.status(200).json({
            message: "Situação atualizada com sucesso",
            student
        });

    } catch (error) {
        console.error("Erro ao alterar situação:", error);
        res.status(500).json({ message: "Erro interno ao alterar situação" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { matricula } = req.body;

        if (!matricula) {
            return res.status(400).json({ message: "Matrícula é obrigatória." });
        }

        const student = await Aluno.findOne({ where: { matricula } });

        if (!student) {
            return res.status(404).json({ message: "Aluno não encontrado" });
        }

        // Gera nova senha automaticamente
        const newPassword = generateInitialPassword();

        // Atualiza no banco
        student.senha = newPassword;
        await student.save();

        return res.status(200).json({
            message: "Senha redefinida com sucesso",
            novaSenha: newPassword
        });

    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ message: "Erro interno ao redefinir senha" });
    }
};

//Relatorios

exports.getStudentsActive = async (req, res) => {
    try {
        const students = await Aluno.findAll({
            where: { situacao: "ativo" },
            include: [
                {
                    model: Turma,
                    as: "turma",
                    include: [{ model: Curso, as: "curso" }]
                }
            ],
            order: [["nome", "ASC"]]
        });

        return res.status(200).json({ students });
    } catch (error) {
        console.error("Erro ao gerar relatório de alunos ativos:", error);
        res.status(500).json({ message: "Erro interno ao gerar relatório." });
    }
};
exports.getStudentsInactive = async (req, res) => {
    try {
        const students = await Aluno.findAll({
            where: { situacao: "inativo" },
            include: [
                {
                    model: Turma,
                    as: "turma",
                    include: [{ model: Curso, as: "curso" }]
                }
            ],
            order: [["nome", "ASC"]]
        });

        return res.status(200).json({ students });
    } catch (error) {
        console.error("Erro ao gerar relatório de alunos inativos:", error);
        res.status(500).json({ message: "Erro interno ao gerar relatório." });
    }
};

exports.getAllTurmasWithStudents = async (req, res) => {
    try {
        const turmas = await Turma.findAll({
            include: [
                {
                    model: Curso,
                    as: "curso"
                },
                {
                    model: Aluno,
                    as: "alunos",
                    include: [
                        {
                            model: Turma,
                            as: "turma",
                            include: [{ model: Curso, as: "curso" }]
                        }
                    ],
                    order: [["nome", "ASC"]]
                }
            ],
            order: [["nome", "ASC"]]
        });

        return res.status(200).json({ turmas });
    } catch (error) {
        console.error("Erro ao retornar turmas e alunos:", error);
        res.status(500).json({ message: "Erro interno ao buscar dados." });
    }
};
