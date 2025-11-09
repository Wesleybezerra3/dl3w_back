const { Aluno } = require("../models");
const { Turma } = require("../models");
const { Curso } = require("../models");
const generateInitialPassword = require("../utils/passwordInit");

async function generateMatricula() {
  // Busca a maior matrícula já cadastrada
  const lastStudent = await Aluno.findOne({
    order: [["matricula", "DESC"]],
    attributes: ["matricula"],
  });

  // Se não existe nenhum aluno, começa em 1
  const lastMatricula = lastStudent ? parseInt(lastStudent.matricula, 10) : 0;
  return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.createStudent = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, email } = req.body;
    let id_turma = 9;
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

exports.getStudentByMatricula = async (req, res) => {
  const matricula = req.params.matricula;
  try {
    const student = await Aluno.findOne({ where: { matricula: matricula } });
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

exports.getStudentsAll = async (req, res) => {
  try {
    const students = await Aluno.findAll({
      include: {
        model: Turma,
        include: Curso,
      },
    });
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Nenhum estudante encontrado" });
    }
    res.status(200).json(students);
  } catch (error) {
    console.error("Erro ao listar estudantes:", error);
    res.status(500).json({ error: "Erro ao listar estudantes" });
  }
};
