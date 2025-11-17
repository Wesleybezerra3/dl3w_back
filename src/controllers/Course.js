const { Curso, Turma, Aluno } = require("../models");
const { fn, col, literal } = require("sequelize");

exports.getStudentsByCourse = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      attributes: [
        "id",
        "nome",
        [fn("COUNT", col("turmas->alunos.id")), "total_alunos"],
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
      // Agrupar usando o alias correto (Curso) via col()
      group: [col("Curso.id"), col("Curso.nome")],
      order: [[literal("total_alunos"), "DESC"]],
    });

    return res.status(200).json(cursos);
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({
        message: "Erro ao buscar alunos por curso.",
        error: error.message,
      });
  }
};
exports.getAllCourse = async (req, res) => {
    try{
        // Buscar todos os professores com suas disciplinas
        const cursos = await Curso.findAll();
        if (cursos.length === 0) {
            return res.status(404).json({ message: "Nenhum curso encontrado" });
        }
        // Retornar a lista de professores

        res.status(200).json(cursos);

    }catch(error) {
        console.error("Erro ao buscar cursos:", error);
        res.status(500).json({ message: "Erro ao buscar cursos" });
    }
}
