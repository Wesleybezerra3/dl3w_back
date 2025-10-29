module.exports = (sequelize, DataTypes) => {
  const Adm = sequelize.define('Students', {
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
    data_nascimento: {
        type: DataTypes.Date,
        allowNull: false,
    },
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_turma: {
        type: DataTypes.int,
        allowNull: false,
    },
  }, {
    tableName: 'Alunos',
    timestamps: false,
  });       
    return Adm;
};