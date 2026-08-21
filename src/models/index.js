const prisma = require("../config/prisma");

module.exports = {
  Adm: prisma.adm,
  Aluno: prisma.aluno,
  Professor: prisma.professor,
  Curso: prisma.curso,
  Turma: prisma.turma,
  Sala: prisma.sala,
  Disciplina: prisma.disciplina,
  prisma,
};