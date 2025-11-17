const { Turma } = require("../models");
const { Sala } = require("../models");
const { Curso } = require("../models");
const { Aluno } = require("../models");

exports.getClassesAll = async (req, res) => {
  try {
    const classes = await Turma.findAll({
      include: [
        {
          model: Sala,
          as: "sala",
          attributes: ["id", "nome", "capacidade", "localizacao"],
        },
        {
          model: Curso,
          as: "curso",
          attributes: ["id", "nome", "duracao_meses"],
        },
        {
          model: Aluno,
          as: "alunos",
          attributes: ["id"],
          required: false,
        },
      ],
    });

    // Adiciona a quantidade de alunos em cada turma
    const result = classes.map((turma) => {
      const turmaJson = turma.toJSON();
      turmaJson.qtd_alunos = turmaJson.alunos ? turmaJson.alunos.length : 0;
      delete turmaJson.alunos; // opcional: remove o array de alunos do retorno
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
