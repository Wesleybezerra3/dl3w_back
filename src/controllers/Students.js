const { Aluno } = require("../models");
const { Turma } = require("../models");
const { Curso } = require("../models");
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
    order: [["matricula", "DESC"]],
    attributes: ["matricula"],
  });

  // Se não existe nenhum aluno, começa em 1
  const lastMatricula = lastStudent ? parseInt(lastStudent.matricula, 10) : 0;
  return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.login = async (req, res) => {
  const { matricula, senha } = req.body;
  try {
    const student = await Aluno.findOne({ where: { matricula, senha } });
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

exports.me = async (req, res) => {
  try {
    const user = await Aluno.findByPk(req.user.id, {
      include: [
        {
          model: Turma,
          as: "turma",
          include: [Curso],
        },
      ],
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
        as: "turma",
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



exports.definePassword = async (req, res) => {
  try{
  const { matricula, oldPassword ,newPassword } = req.body;
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
  }catch(error){
    console.error("Erro ao definir senha:", error);
    res.status(500).json({ error: "Erro ao definir senha" });
  }
}