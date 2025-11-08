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
        type: DataTypes.DATE,
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
        type: DataTypes.INTEGER,
        allowNull: false,
    },
  }, {
    tableName: 'Aluno',
    timestamps: false,
  });       
    return Adm;
};