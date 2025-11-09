module.exports = (sequelize, DataTypes) => {
  const Turma = sequelize.define('Turma', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    turno: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_curso: {
      type: DataTypes.INTEGER,
      references: {
        model: 'curso',
        key: 'id',
      }
    },
    semestre:{
        type: DataTypes.STRING,
        allowNull: false,
    },
  }, {
    tableName: 'turma',
    timestamps: false,
  });       

   Turma.associate = (models) => {
    Turma.belongsTo(models.Curso, { foreignKey: 'id_curso' });
    Turma.hasMany(models.Aluno, { foreignKey: 'id_turma' });
  };
    return Turma;
};