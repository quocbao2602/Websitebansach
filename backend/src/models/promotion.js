const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Promotion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    discountPercent: { type: DataTypes.DECIMAL(5, 2) },
    discountAmount: { type: DataTypes.DECIMAL(10, 2) },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    maxUsage: { type: DataTypes.INTEGER },
    currentUsage: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'promotions'
  });
};
