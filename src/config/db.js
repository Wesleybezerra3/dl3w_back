require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASSWORD,
  {
    host: process.env.DBHOST,
    port:process.env.DBPORT,
    dialect: "mysql",
  }
);

sequelize.authenticate()
  .then(() => {
    console.log("Banco de dados conectado com sucesso!");
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco de dados:", err);
  });

module.exports = sequelize;