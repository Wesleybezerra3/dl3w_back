const {Adm} = require('../models');
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id}, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

exports.login = async (req, res) => {
    const nome = req.body.usuario;
    const senha = req.body.senha;
    // Validação dos campos obrigatórios
    if (!nome || !senha) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const admin = await Adm.findOne({ where: { nome: nome} });
        if (admin && admin.senha === senha) {
            const token = generateToken(admin);
            res.status(200).json({ message: 'Login successful',token});
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Erro ao buscar administrador:', error);
        res.status(500).json({ error: 'Erro ao buscar administrador' });
    }
};

exports.me = async(req, res)=>{
    try{
        const admin = await Adm.findByPk(req.user.id);
        if(admin){
            res.status(200).json({admin});
        }else{
            res.status(404).json({message: 'Administrador não encontrado'});
        }

    }catch(error){
        console.error('Erro ao buscar administrador:', error);
        res.status(500).json({ error: 'Erro ao buscar administrador' });
    }
}