const { Turma } = require("../models");

exports.getClassesAll = async (req, res) => {
    try{
        const classes =  await Turma.findAll();
        if(!classes || classes.length ===0){
            return res.status(404).json({ message: "Nenhuma turma encontrada" });
        }
        res.status(200).json(classes);
    }catch(error){
     console.error("Erro ao listar turmas:", error);
     res.status(500).json({ error: "Erro ao listar turmas" });
    }
}