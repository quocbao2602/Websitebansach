require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Try MySQL first, fallback to SQLite if not available
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const useMySQL = dbHost && dbHost.trim() !== '' && dbUser && dbUser.trim() !== '';

let sequelize;

if (useMySQL) {
  console.log('Using MySQL database...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'bookstore_db',
    dbUser,
    process.env.DB_PASSWORD || '',
    {
      host: dbHost,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('Using SQLite database (development)...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/bookstore.sqlite'),
    logging: false
  });
}

// Define models
const User = require('./user')(sequelize);
const Book = require('./book')(sequelize);
const Author = require('./author')(sequelize);
const Publisher = require('./publisher')(sequelize);
const Category = require('./category')(sequelize);
const Order = require('./order')(sequelize);
const OrderItem = require('./orderItem')(sequelize);
const Review = require('./review')(sequelize);
const Promotion = require('./promotion')(sequelize);
const Notification = require('./notification')(sequelize);
const Cart = require('./cart')(sequelize);
const CartItem = require('./cartItem')(sequelize);

// Define associations
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Book.hasMany(OrderItem, { foreignKey: 'bookId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Book.belongsTo(Author, { foreignKey: 'authorId', onDelete: 'SET NULL' });
Author.hasMany(Book, { foreignKey: 'authorId' });

Book.belongsTo(Publisher, { foreignKey: 'publisherId', onDelete: 'SET NULL' });
Publisher.hasMany(Book, { foreignKey: 'publisherId' });

Book.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Category.hasMany(Book, { foreignKey: 'categoryId' });

Book.hasMany(Review, { foreignKey: 'bookId', onDelete: 'CASCADE' });
Review.belongsTo(Book, { foreignKey: 'bookId' });

Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Book.hasMany(CartItem, { foreignKey: 'bookId', onDelete: 'CASCADE' });
CartItem.belongsTo(Book, { foreignKey: 'bookId' });

Promotion.hasMany(Book, { foreignKey: 'promotionId', onDelete: 'SET NULL' });
Book.belongsTo(Promotion, { foreignKey: 'promotionId' });

module.exports = {
  sequelize,
  User,
  Book,
  Author,
  Publisher,
  Category,
  Order,
  OrderItem,
  Review,
  Promotion,
  Notification,
  Cart,
  CartItem
};
