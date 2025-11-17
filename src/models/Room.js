module.exports = (sequelize, DataTypes) => {
  const Sala = sequelize.define('Sala', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacidade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    localizacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'sala',
    timestamps: false,
  });

  // Relacionamento 1:N (uma sala pode ter várias turmas)
  Sala.associate = (models) => {
    Sala.hasMany(models.Turma, {
      foreignKey: 'id_sala',
      as: 'turmas',
    });
  };

  return Sala;
};
