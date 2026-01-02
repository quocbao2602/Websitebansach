require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Author, Publisher, Book } = require('../src/models');

const seedDatabase = async () => {
  try {
    console.log('Starting database setup and seeding...');

    // Try to create database if MySQL is available
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });

      const dbName = process.env.DB_NAME || 'bookstore_db';
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
      console.log(`✓ Database '${dbName}' ensured`);
      await connection.end();
    } catch (mysqlErr) {
      console.warn('⚠ MySQL connection failed, using SQLite fallback or continuing without pre-creation');
    }

    // Sync database tables
    try {
      await sequelize.sync({ force: false, alter: false });
    } catch (syncErr) {
      console.warn('⚠ Sync error (may be due to foreign keys):', syncErr.message);
      // Continue anyway, tables might already exist
    }
    console.log('✓ Database tables synchronized');

    // Create admin user
    const adminEmail = 'admin@bookstore.com';
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '0123456789',
        role: 'admin',
        isActive: true
      });
      console.log(`✓ Admin created: ${adminEmail}`);
    } else {
      console.log(`✓ Admin already exists: ${adminEmail}`);
    }

    // Create categories
    const categories = [
      { name: 'Tiểu thuyết', description: 'Sách tiểu thuyết văn học' },
      { name: 'Khoa học', description: 'Sách khoa học tự nhiên' },
      { name: 'Lịch sử', description: 'Sách lịch sử và văn hóa' },
      { name: 'Tâm lý học', description: 'Sách tâm lý và phát triển bản thân' },
      { name: 'Công nghệ', description: 'Sách về công nghệ thông tin' },
      { name: 'Kinh tế', description: 'Sách kinh tế và tài chính' },
      { name: 'Kinh doanh', description: 'Sách về kinh doanh và quản trị' },
      { name: 'Marketing', description: 'Sách về marketing và bán hàng' },
      { name: 'Kỹ năng sống', description: 'Sách kỹ năng mềm và cuộc sống' },
      { name: 'Giáo dục', description: 'Sách giáo khoa và học tập' },
      { name: 'Y học', description: 'Sách y học và sức khỏe' },
      { name: 'Nghệ thuật', description: 'Sách về nghệ thuật và âm nhạc' },
      { name: 'Thể thao', description: 'Sách về thể thao và thể dục' },
      { name: 'Nấu ăn', description: 'Sách dạy nấu ăn và ẩm thực' },
      { name: 'Du lịch', description: 'Sách hướng dẫn du lịch' },
      { name: 'Thiếu nhi', description: 'Sách dành cho trẻ em' },
      { name: 'Triết học', description: 'Sách triết học và tư tưởng' },
      { name: 'Chính trị', description: 'Sách về chính trị và xã hội' },
      { name: 'Pháp luật', description: 'Sách luật và quy định' },
      { name: 'Truyện tranh', description: 'Manga và truyện tranh' },
      { name: 'Tôn giáo', description: 'Sách về tôn giáo và tâm linh' },
      { name: 'Ngoại ngữ', description: 'Sách học ngoại ngữ' },
      { name: 'Văn học nước ngoài', description: 'Văn học thế giới' },
      { name: 'Văn học Việt Nam', description: 'Văn học trong nước' },
      { name: 'Sách thiếu niên', description: 'Sách dành cho thanh thiếu niên' }
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ where: { name: cat.name } });
      if (!existing) {
        await Category.create(cat);
      }
    }
    console.log('✓ Categories ensured');

    // Create authors
    const authors = [
      { name: 'Nguyễn Nhật Ánh', biography: 'Tác giả nổi tiếng Việt Nam', nationality: 'Vietnam' },
      { name: 'Haruki Murakami', biography: 'Tác giả Nhật Bản', nationality: 'Japan' },
      { name: 'Stephen Hawking', biography: 'Nhà vật lý lý thuyết', nationality: 'UK' }
    ];

    for (const author of authors) {
      const existing = await Author.findOne({ where: { name: author.name } });
      if (!existing) {
        await Author.create(author);
      }
    }
    console.log('✓ Authors ensured');

    // Create publishers
    const publishers = [
      { name: 'NXB Trẻ', address: 'Hà Nội', phone: '024-3999-0000' },
      { name: 'NXB Kim Đồng', address: 'Hà Nội', phone: '024-3937-2121' },
      { name: 'Penguin Books', address: 'London', phone: '+44-123' }
    ];

    for (const pub of publishers) {
      const existing = await Publisher.findOne({ where: { name: pub.name } });
      if (!existing) {
        await Publisher.create(pub);
      }
    }
    console.log('✓ Publishers ensured');

    // Create sample books
    const sampleBooks = [
      {
        title: 'Chuyện Kể Về Tuổi Thơ',
        description: 'Một bộ sách hay về tuổi thơ',
        price: 85000,
        stock: 50,
        language: 'Vietnamese',
        imageUrl: 'https://salt.tikicdn.com/cache/w1200/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
        isbn: '978-6041153447',
        publicationYear: 2015,
        authorId: 1,
        publisherId: 1,
        categoryId: 1
      },
      {
        title: 'Norwegian Wood',
        description: 'Tiểu thuyết nổi tiếng của Murakami',
        price: 120000,
        stock: 30,
        language: 'Vietnamese',
        imageUrl: 'https://salt.tikicdn.com/cache/w1200/ts/product/d5/00/92/8dc8a8cf2a2a8f264db216d7e0e4e798.jpg',
        isbn: '978-6041099067',
        publicationYear: 2018,
        authorId: 2,
        publisherId: 2,
        categoryId: 1
      },
      {
        title: 'A Brief History of Time',
        description: 'Lịch sử thời gian của Stephen Hawking',
        price: 150000,
        stock: 20,
        language: 'Vietnamese',
        imageUrl: 'https://salt.tikicdn.com/cache/w1200/ts/product/ed/53/62/39a46514e2a8e8b6b35ccaafe5ebdb81.jpg',
        isbn: '978-6041153454',
        publicationYear: 2020,
        authorId: 3,
        publisherId: 3,
        categoryId: 2
      }
    ];

    for (const bookData of sampleBooks) {
      const existing = await Book.findOne({ where: { title: bookData.title } });
      if (!existing) {
        await Book.create(bookData);
      }
    }
    console.log('✓ Sample books ensured');

    // Create test user
    const testEmail = 'user@bookstore.com';
    let testUser = await User.findOne({ where: { email: testEmail } });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('user123456', 10);
      testUser = await User.create({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        phone: '0987654321',
        role: 'user',
        isActive: true
      });
      console.log(`✓ Test user created: ${testEmail}`);
    }

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin: admin@bookstore.com / admin123456');
    console.log('  User: user@bookstore.com / user123456');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
