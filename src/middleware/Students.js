const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado! Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err)
    return res.status(403).json({ message: "Token inválido ou expirado!" });
  }
};

exports.definePasswordMiddleware = (req, res, next) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)  
      .json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
  }
  if (newPassword.length > 10) {
    return res
      .status(400)
      .json({ message: "A nova senha deve ter no máximo 10 caracteres." });
  }
  if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
    return res
      .status(400)
      .json({ message: "A nova senha deve conter letras, números e caracteres especiais." });
  }

  next();
}