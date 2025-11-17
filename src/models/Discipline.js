module.exports = (sequelize, DataTypes) => {
  const Disciplina = sequelize.define(
    "Disciplina",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      carga_horaria: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "disciplina",
      timestamps: false,
    }
  );

  Disciplina.associate = (models) => {
    // Muitos-para-muitos com Curso
    Disciplina.belongsToMany(models.Curso, {
      through: "curso_disciplina",
      foreignKey: "id_disciplina",
      otherKey: "id_curso",
      as: "cursos",
    });

    Disciplina.belongsToMany(models.Professor, {
      through: 'professor_disciplina',
      as: "professores",
      foreignKey: "id_disciplina",
    });
  };

  return Disciplina;
};
