const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    isbn: { type: DataTypes.STRING(20), unique: true, allowNull: true },
    publishedDate: { type: DataTypes.DATE },
    publicationYear: { type: DataTypes.INTEGER },
    pages: { type: DataTypes.INTEGER },
    language: { type: DataTypes.STRING(50), defaultValue: 'Vietnamese' },
    image: { type: DataTypes.STRING(255) },
    imageUrl: { type: DataTypes.STRING(255) },
    authorId: { type: DataTypes.INTEGER },
    publisherId: { type: DataTypes.INTEGER },
    categoryId: { type: DataTypes.INTEGER },
    promotionId: { type: DataTypes.INTEGER },
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    timestamps: true,
    tableName: 'books'
  });
};
