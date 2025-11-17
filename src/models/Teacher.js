//Faça o model de Teacher aqui
module.exports = (sequelize, DataTypes) => {
  const Professor = sequelize.define(
    "Professor",
    {
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
        allowNull: true,
      },
      cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      titulacao: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      matricula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },

      situacao: {
        type: DataTypes.ENUM("ativo", "inativo"),
        allowNull: false,
        defaultValue: "ativo",
      },
    },
    {
      tableName: "professor",
      timestamps: false,
    }
  );

  Professor.associate = (models) => {
    // Relacionamento M:N com disciplina
    Professor.belongsToMany(models.Disciplina, {
      through: "professor_disciplina",
      as: "disciplinas",
      foreignKey: "id_professor",
      otherKey: "id_disciplina",
    });
  };

  return Professor;
};
