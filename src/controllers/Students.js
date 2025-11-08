const { Students } = require("../models");
const generateInitialPassword = require("../utils/passwordInit");

exports.createStudent = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, email, curso} = req.body;
    let id_turma = 1;
    const senha = generateInitialPassword();
    const newStudent = await Students.create({
      nome,
      senha,
      cpf,
      data_nascimento,
      email,
      curso,
      id_turma,
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
    const student = await Students.findOne({ where: { matricula: matricula } });
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
    const students = await Students.findAll();
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Nenhum estudante encontrado" });
    }
    res.status(200).json(students);
  } catch (error) {
    console.error("Erro ao listar estudantes:", error);
    res.status(500).json({ error: "Erro ao listar estudantes" });
  }
};
