const { Professor } = require("../models");
const { Disciplina } = require("../models");
const { Turma } = require("../models");
const { Aluno } = require("../models");
const { Curso, prisma } = require("../models");


const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
};

const generateInitialPassword = require("../utils/passwordInit");

async function generateMatricula() {
    // Busca a maior matrícula já cadastrada
    const lastTeacher = await Professor.findFirst({ orderBy: { matricula: "desc" }, select: { matricula: true } });

    // Se não existe nenhum aluno, começa em 1
    const lastMatricula = lastTeacher ? parseInt(lastTeacher.matricula, 10) : 0;
    return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.login = async(req, res) => {
    const { matricula, senha } = req.body;
    try {
        const teacher = await Professor.findFirst({ where: { matricula, senha } });
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
        const user = await Professor.findUnique({ where: { id: Number(req.user.id) }, include: { disciplinas: { include: { disciplina: { include: { cursos: { include: { curso: { include: { turmas: { include: { alunos: true } } } } } } } } } } } });
        if (user) user.disciplinas = user.disciplinas.map(({ disciplina }) => ({ ...disciplina, curso: disciplina.cursos[0]?.curso }));

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
        const professores = await Professor.findMany({ include: { disciplinas: { include: { disciplina: true } } }, take: Number(limit), skip: Number(offset) });
        const professoresFormatados = professores.map(({ disciplinas, ...professor }) => ({ ...professor, disciplinas: disciplinas.map(({ disciplina }) => disciplina) }));

        const totalTeachers = await Professor.count();

        if (professores.length === 0) {
            return res.status(404).json({ message: "Nenhum professor encontrado" });
        }
        // Retornar a lista de professores

        res.status(200).json({
            professores: professoresFormatados,
            totalTeachers,
        });
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        res.status(500).json({ message: "Erro ao buscar professores" });
    }
};

exports.getByMatricula = async(req, res) => {
    const matricula = req.query.matricula;
    try {
        const teacher = await Professor.findFirst({
            where: { matricula: matricula },
            include: { disciplinas: { include: { disciplina: true } } },
        });
        if (teacher) teacher.disciplinas = teacher.disciplinas.map(({ disciplina }) => disciplina);
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

        const exists = await Professor.findFirst({ where: { matricula } });
        if (exists) {
            return res
                .status(400)
                .json({ error: "Matrícula já existente, tente novamente." });
        }

        const newTeacher = await Professor.create({
            nome,
            senha,
            cpf,
            dataNascimento: data_nascimento ? new Date(data_nascimento) : null,
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
        const professor = await Professor.findFirst({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Estudante não encontrado" });
        }

        // Atualizações básicas
        const updatedProfessor = await Professor.update({ where: { matricula }, data: { ...(nome ? { nome } : {}), ...(cpf ? { cpf } : {}), ...(data_nascimento ? { dataNascimento: new Date(data_nascimento) } : {}), ...(email ? { email } : {}), ...(titulacao ? { titulacao } : {}) } });

        return res.status(200).json({
            message: "Dados atualizados com sucesso",
            professor: updatedProfessor,
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
            teacher = await Sala.findMany();
            return res.status(404).json({ message: "O nome não foi fornecido" });
        } else {
            // Busca salas cujo título contém a string especificada
            teacher = await Professor.findMany({
                where: {
                    nome: {
                        contains: teacherName,
                    },
                },
            });
        }

        if (teacher.length === 0) {
            return res.status(200).json([]);
        }

        // Converte os resultados em objetos simples
        const teacherData = teacher;

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
        const professor = await Professor.findUnique({ where: { id: Number(id_professor) } });
        if (!professor) {
            return res.status(404).json({ error: "Professor não encontrado." });
        }

        // Verifica se disciplina existe
        const disciplina = await Disciplina.findUnique({ where: { id: Number(id_disciplina) } });
        if (!disciplina) {
            return res.status(404).json({ error: "Disciplina não encontrada." });
        }

        // Verifica se já está vinculado
        const isDiscipline = await prisma.professorDisciplina.findUnique({ where: { idProfessor_idDisciplina: { idProfessor: Number(id_professor), idDisciplina: Number(id_disciplina) } } });
        if (isDiscipline) {
            return res
                .status(400)
                .json({ error: "Esta disciplina já está vinculada a este professor." });
        }

        // Faz vínculo
        await prisma.professorDisciplina.create({ data: { idProfessor: Number(id_professor), idDisciplina: Number(id_disciplina) } });

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

        const professor = await Professor.findFirst({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }

        const updatedProfessor = await Professor.update({ where: { matricula }, data: { situacao } });

        return res.status(200).json({
            message: "Situação atualizada com sucesso",
            professor: updatedProfessor,
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

        const professor = await Professor.findFirst({ where: { matricula } });

        if (!professor) {
            return res.status(404).json({ message: "Professor não encontrado" });
        }

        // Gera nova senha automaticamente
        const newPassword = generateInitialPassword();

        // Atualiza no banco
        await Professor.update({ where: { matricula }, data: { senha: newPassword } });

        return res.status(200).json({
            message: "Senha redefinida com sucesso",
            novaSenha: newPassword,
        });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ message: "Erro interno ao redefinir senha" });
    }
};