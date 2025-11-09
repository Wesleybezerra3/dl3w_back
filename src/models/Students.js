module.exports = (sequelize, DataTypes) => {
  const Aluno = sequelize.define('Aluno', {
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
      allowNull: true,
      references: {
        model: 'turma',
        key: 'id'
      }
    },
    matricula:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    situacao: {
        type: DataTypes.STRING,
    },
  }, {
    tableName: 'aluno',
    timestamps: false,
  });

   Aluno.associate = (models) => {
    Aluno.belongsTo(models.Turma, { foreignKey: 'id_turma' });
  };
    return Aluno;
};