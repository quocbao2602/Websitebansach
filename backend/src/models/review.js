const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT },
    isVerifiedPurchase: { type: DataTypes.BOOLEAN, defaultValue: false },
    helpfulCount: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'reviews'
  });
};
