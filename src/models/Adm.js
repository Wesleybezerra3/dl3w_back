module.exports = (sequelize, DataTypes) => {
  const Adm = sequelize.define('Adm', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  }, {
    tableName: 'administrador',
    timestamps: false,
  });       
    return Adm;
};