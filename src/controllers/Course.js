const { Curso } = require("../models");

exports.getStudentsByCourse = async (req, res) => {
  try {
    const cursos = await Curso.findMany({ include: { turmas: { include: { _count: { select: { alunos: true } } } } } });
    const result = cursos.map(({ turmas, ...curso }) => ({ ...curso, total_alunos: turmas.reduce((total, turma) => total + turma._count.alunos, 0) })).sort((a, b) => b.total_alunos - a.total_alunos);

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Erro ao buscar alunos por curso.",
      error: error.message,
    });
  }
};
exports.getAllCourse = async (req, res) => {
  try {
    // Buscar todos os professores com suas disciplinas
    const cursos = await Curso.findMany({ include: { disciplinas: { include: { disciplina: true } } } });
    const result = cursos.map(({ disciplinas, ...curso }) => ({ ...curso, disciplinas: disciplinas.map(({ disciplina }) => disciplina) }));
    if (result.length === 0) {
      return res.status(404).json({ message: "Nenhum curso encontrado" });
    }
    // Retornar a lista de professores

    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    res.status(500).json({ message: "Erro ao buscar cursos" });
  }
};
