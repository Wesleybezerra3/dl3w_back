const { Disciplina } = require("../models");

exports.getAllDiscipline = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findMany();
    if (disciplinas.length === 0) {
      return res.status(404).json({ message: "Nenhuma disciplina encontrado" });
    }
    // Retornar a lista de professores

    res.status(200).json(disciplinas);
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    res.status(500).json({ message: "Erro ao buscar disciplinas" });
  }
};
