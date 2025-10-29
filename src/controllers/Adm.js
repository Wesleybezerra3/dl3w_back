const {Adm} = require('../models');

exports.login = async (req, res) => {
    const nome = req.body.nome;
    const senha = req.body.senha;
    try {
        const admin = await Adm.findOne({ where: { nome: nome} });
        if (admin && admin.senha === senha) {
            res.status(200).json({ message: 'Login successful', admin });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Erro ao buscar administrador:', error);
        res.status(500).json({ error: 'Erro ao buscar administrador' });
    }
};
""