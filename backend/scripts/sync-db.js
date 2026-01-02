require('dotenv').config();
const { sequelize } = require('../src/models');

const syncDatabase = async () => {
  try {
    console.log('Syncing database with alter...');
    await sequelize.sync({ alter: true });
    console.log('✓ Database schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Sync error:', error);
    process.exit(1);
  }
};

syncDatabase();
