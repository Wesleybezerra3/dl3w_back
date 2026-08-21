const { Turma } = require("../models");
const { Sala } = require("../models");
const { Curso } = require("../models");
const { Aluno } = require("../models");

exports.getClassesAll = async(req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = 10;
        let offset;

        // Calcula o offset para a paginação dos livros
        if (page && limit) {
            offset = (page - 1) * limit;
        }

        const classes = await Turma.findMany({
            include: { sala: { select: { id: true, nome: true, capacidade: true, localizacao: true } }, curso: { select: { id: true, nome: true, duracaoMeses: true } }, _count: { select: { alunos: true } } },
            take: Number(limit), skip: Number(offset)
        });

        // Adiciona a quantidade de alunos em cada turma
        const result = classes.map((turma) => {
            const { _count, ...turmaJson } = turma;
            turmaJson.qtd_alunos = _count.alunos;
            return turmaJson;
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Nenhuma turma encontrada" });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Erro ao listar turmas:", error);
        res.status(500).json({ error: "Erro ao listar turmas" });
    }
};

exports.getTurmasByCurso = async (req, res) => {
    try {
        const { id } = req.query; // id do curso

        if (!id) {
            return res.status(400).json({ message: "ID do curso é obrigatório." });
        }

        const turmas = await Turma.findMany({ where: { idCurso: Number(id) }, include: { curso: { select: { id: true, nome: true } } } });

        if (!turmas || turmas.length === 0) {
            return res.status(404).json({ message: "Nenhuma turma encontrada para este curso." });
        }

        return res.status(200).json(turmas);

    } catch (error) {
        console.error("Erro ao buscar turmas por curso:", error);
        return res.status(500).json({ message: "Erro interno ao buscar turmas por curso." });
    }
};
