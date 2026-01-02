const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20) },
    password: { type: DataTypes.STRING(255) },
    googleId: { type: DataTypes.STRING(100), unique: true, allowNull: true },
    address: { type: DataTypes.TEXT },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    avatar: { type: DataTypes.STRING(255) },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    timestamps: true,
    tableName: 'users'
  });
};
