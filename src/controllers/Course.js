const { Curso, Turma, Aluno } = require("../models");
const { fn, col, literal } = require("sequelize");

exports.getStudentsByCourse = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      attributes: [
        "id",
        "nome",
        [fn("COUNT", col("turmas.alunos.id")), "total_alunos"],
      ],
      include: [
        {
          model: Turma,
          as: "turmas",
          attributes: [],
          include: [
            {
              model: Aluno,
              as: "alunos",
              attributes: [],
            },
          ],
        },
      ],
      group: ["curso.id", "curso.nome"],
      order: [[literal("total_alunos"), "DESC"]],
    });

    return res.status(200).json(cursos);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Erro ao buscar alunos por curso.",
        error: error.message,
      });
  }
};
