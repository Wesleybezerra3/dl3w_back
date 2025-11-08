const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = (req, res, next) => {
  // busca token em Authorization: Bearer <token>, x-access-token ou body
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const bearerToken = authHeader && authHeader.split && authHeader.split(' ')[0] === 'Bearer'
    ? authHeader.split(' ')[1]
    : null;
  const token = bearerToken || req.headers['x-access-token'] || req.body?.token || req.query?.token;

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = { authentication };