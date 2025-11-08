const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const db = {};

// Lê todos os arquivos da pasta models exceto index.js
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const filePath = path.join(__dirname, file);
    try {
      const required = require(filePath);

      // suporta: module.exports = (sequelize, DataTypes) => { ... }
      // ou module.exports = ModelInstance (já criado)
      // ou export default (transpilado)
      let model;
      if (typeof required === 'function') {
        model = required(sequelize, Sequelize.DataTypes);
      } else if (required && typeof required.default === 'function') {
        model = required.default(sequelize, Sequelize.DataTypes);
      } else if (required && required.name && required.findAll) {
        // já é um model instanciado
        model = required;
      } else {
        throw new Error(`Arquivo não exporta uma factory de model: ${file}`);
      }

      if (model && model.name) {
        db[model.name] = model;
      } else {
        throw new Error(`Model inválido (sem name) gerado por: ${file}`);
      }
    } catch (err) {
      console.error(`Erro ao carregar model "${file}": ${err.message}`);
      // opcional: console.error(err);
    }
  });

// Executa associações se existirem
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;