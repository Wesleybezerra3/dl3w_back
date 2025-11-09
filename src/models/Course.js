module.exports = (sequelize, DataTypes) => {
  const Curso = sequelize.define('Curso', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    duracao_meses: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'curso',
    timestamps: false,
  });

  Curso.associate = (models) => {
    Curso.hasMany(models.Turma, { foreignKey: 'id_curso' });
  };

  return Curso;
};
