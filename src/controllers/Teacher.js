const {Professor} = require("../models");
const { Disciplina } = require("../models");
const generateInitialPassword = require("../utils/passwordInit");


async function generateMatricula() {
  // Busca a maior matrícula já cadastrada
  const lastTeacher = await Professor.findOne({
    order: [["matricula", "DESC"]],
    attributes: ["matricula"],
  });

  // Se não existe nenhum aluno, começa em 1
  const lastMatricula = lastTeacher ? parseInt(lastTeacher.matricula, 10) : 0;
  return (lastMatricula + 1).toString().padStart(6, "0"); // Ex: '000001'
}

exports.getAllTeacher = async (req, res) => {
    try{
        // Buscar todos os professores com suas disciplinas
        const professores = await Professor.findAll({
            include: [
                {
                    model: Disciplina,
                    as: "disciplinas",
                    attributes: ["id", "nome", "carga_horaria"],
                    through: { attributes: [] }, // remove tabela pivot da resposta
                },
            ],
        });
        if (professores.length === 0) {
            return res.status(404).json({ message: "Nenhum professor encontrado" });
        }
        // Retornar a lista de professores

        res.status(200).json(professores);

    }catch(error) {
        console.error("Erro ao buscar professores:", error);
        res.status(500).json({ message: "Erro ao buscar professores" });
    }
}

exports.createTeacher = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, email, titulacao } = req.body;
    const senha = generateInitialPassword();
    const matricula = await generateMatricula();

    const exists = await Professor.findOne({ where: { matricula } });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Matrícula já existente, tente novamente." });
    }

    const newTeacher = await Professor.create({
      nome,
      senha,
      cpf,
      data_nascimento,
      email,
      titulacao,
      matricula,
      situacao: "ativo",
    });
    res.status(201).json(newTeacher);
  } catch (error) {
    console.error("Erro ao criar professor:", error);
    res.status(500).json({ error: "Erro ao criar professor" });
  }
};
   

//  nome            | varchar(255)            | NO   |     | NULL    |                |
// | senha           | varchar(255)            | NO   |     | NULL    |                |
// | data_nascimento | date                    | YES  |     | NULL    |                |
// | cpf             | varchar(11)             | NO   | UNI | NULL    |                |
// | email           | varchar(255)            | NO   | UNI | NULL    |                |
// | titulacao       | varchar(50)             | YES  |     | NULL    |                |
// | situacao        | enum('ativo','inativo') | NO   |     | ativo   |                |
// | matricula 