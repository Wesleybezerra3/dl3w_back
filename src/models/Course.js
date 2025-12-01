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
        Curso.hasMany(models.Turma, { foreignKey: 'id_curso', as: 'turmas' });

        // Muitos-para-muitos com Disciplina
        Curso.belongsToMany(models.Disciplina, {
            through: 'curso_disciplina',
            foreignKey: 'id_curso',
            otherKey: 'id_disciplina',
            as: 'disciplinas',
            timestamps: false,
        });
    };

    return Curso;
};