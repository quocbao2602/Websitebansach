const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Author', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    biography: { type: DataTypes.TEXT },
    birthDate: { type: DataTypes.DATE },
    nationality: { type: DataTypes.STRING(50) },
    avatar: { type: DataTypes.STRING(255) }
  }, {
    timestamps: true,
    tableName: 'authors'
  });
};
