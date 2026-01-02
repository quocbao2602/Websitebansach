const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Publisher', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    address: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(100) },
    website: { type: DataTypes.STRING(255) }
  }, {
    timestamps: true,
    tableName: 'publishers'
  });
};
