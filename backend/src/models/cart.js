const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    totalItems: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'carts'
  });
};
