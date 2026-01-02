const express = require('express');
const { Book, Category, Author, Publisher, Order, User, OrderItem } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// --- Categories CRUD ---
router.get('/categories', auth, adminOnly, async (req, res) => {
  try {
    const cats = await Category.findAll();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', auth, adminOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.update(req.body);
    res.json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/categories/:id', auth, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    await cat.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Authors CRUD ---
router.get('/authors', auth, adminOnly, async (req, res) => {
  try {
    const authors = await Author.findAll();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/authors', auth, adminOnly, async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Publishers CRUD ---
router.get('/publishers', auth, adminOnly, async (req, res) => {
  try {
    const publishers = await Publisher.findAll();
    res.json(publishers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/publishers', auth, adminOnly, async (req, res) => {
  try {
    const publisher = await Publisher.create(req.body);
    res.status(201).json(publisher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Books Management ---
router.get('/books', auth, adminOnly, async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [Author, Publisher, Category]
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/books', auth, adminOnly, async (req, res) => {
  try {
    const bookData = { ...req.body };

    // Convert number fields
    if (bookData.price) bookData.price = parseFloat(bookData.price) || null;
    if (bookData.stock) bookData.stock = parseInt(bookData.stock) || 0;
    if (bookData.publicationYear && bookData.publicationYear.toString().trim() !== '') {
      bookData.publicationYear = parseInt(bookData.publicationYear);
    } else {
      bookData.publicationYear = null;
    }

    // Handle ISBN - if empty, set to null to avoid unique constraint error
    if (!bookData.isbn || bookData.isbn.trim() === '') {
      bookData.isbn = null;
    }

    // Handle author - find or create by name
    if (req.body.authorName && req.body.authorName.trim()) {
      let author = await Author.findOne({ where: { name: req.body.authorName.trim() } });
      if (!author) {
        author = await Author.create({ name: req.body.authorName.trim() });
        console.log(`✓ Created new author: ${req.body.authorName.trim()}`);
      }
      bookData.authorId = author.id;
    }
    delete bookData.authorName;

    // Handle publisher - find or create by name
    if (req.body.publisherName && req.body.publisherName.trim()) {
      let publisher = await Publisher.findOne({ where: { name: req.body.publisherName.trim() } });
      if (!publisher) {
        publisher = await Publisher.create({ name: req.body.publisherName.trim() });
        console.log(`✓ Created new publisher: ${req.body.publisherName.trim()}`);
      }
      bookData.publisherId = publisher.id;
    }
    delete bookData.publisherName;

    // Handle category - find or create by name
    if (req.body.categoryName && req.body.categoryName.trim()) {
      let category = await Category.findOne({ where: { name: req.body.categoryName.trim() } });
      if (!category) {
        category = await Category.create({ 
          name: req.body.categoryName.trim(),
          description: `Danh mục ${req.body.categoryName.trim()}`
        });
        console.log(`✓ Created new category: ${req.body.categoryName.trim()}`);
      }
      bookData.categoryId = category.id;
    }
    delete bookData.categoryName;

    // Map imageUrl to image for backward compatibility
    if (bookData.imageUrl && !bookData.image) {
      bookData.image = bookData.imageUrl;
    }

    const book = await Book.create(bookData);
    const fullBook = await Book.findByPk(book.id, {
      include: [Author, Publisher, Category]
    });
    res.status(201).json(fullBook);
  } catch (err) {
    console.error('Create book error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/books/:id', auth, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    const bookData = { ...req.body };

    // Convert number fields
    if (bookData.price) bookData.price = parseFloat(bookData.price) || null;
    if (bookData.stock) bookData.stock = parseInt(bookData.stock) || 0;
    if (bookData.publicationYear && bookData.publicationYear.toString().trim() !== '') {
      bookData.publicationYear = parseInt(bookData.publicationYear);
    } else {
      bookData.publicationYear = null;
    }

    // Handle ISBN - if empty, set to null to avoid unique constraint error
    if (!bookData.isbn || bookData.isbn.trim() === '') {
      bookData.isbn = null;
    }

    // Handle author - find or create by name
    if (req.body.authorName && req.body.authorName.trim()) {
      let author = await Author.findOne({ where: { name: req.body.authorName.trim() } });
      if (!author) {
        author = await Author.create({ name: req.body.authorName.trim() });
        console.log(`✓ Created new author: ${req.body.authorName.trim()}`);
      }
      bookData.authorId = author.id;
    }
    delete bookData.authorName;

    // Handle publisher - find or create by name
    if (req.body.publisherName && req.body.publisherName.trim()) {
      let publisher = await Publisher.findOne({ where: { name: req.body.publisherName.trim() } });
      if (!publisher) {
        publisher = await Publisher.create({ name: req.body.publisherName.trim() });
        console.log(`✓ Created new publisher: ${req.body.publisherName.trim()}`);
      }
      bookData.publisherId = publisher.id;
    }
    delete bookData.publisherName;

    // Handle category - find or create by name
    if (req.body.categoryName && req.body.categoryName.trim()) {
      let category = await Category.findOne({ where: { name: req.body.categoryName.trim() } });
      if (!category) {
        category = await Category.create({ 
          name: req.body.categoryName.trim(),
          description: `Danh mục ${req.body.categoryName.trim()}`
        });
        console.log(`✓ Created new category: ${req.body.categoryName.trim()}`);
      }
      bookData.categoryId = category.id;
    }
    delete bookData.categoryName;

    // Map imageUrl to image for backward compatibility
    if (bookData.imageUrl && !bookData.image) {
      bookData.image = bookData.imageUrl;
    }

    await book.update(bookData);
    const fullBook = await Book.findByPk(book.id, {
      include: [Author, Publisher, Category]
    });
    res.json(fullBook);
  } catch (err) {
    console.error('Update book error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/books/:id', auth, adminOnly, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    await book.destroy();
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Orders Management ---
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User }, { model: OrderItem, include: [Book] }]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (status) await order.update({ status });
    if (paymentStatus) await order.update({ paymentStatus });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Users Management ---
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    console.log(`[DEBUG] Update user role: ID=${req.params.id}, Role=${role}`);
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ role });
    console.log(`[DEBUG] User role updated successfully: ${user.email} -> ${role}`);
    res.json({ message: 'User role updated', user });
  } catch (err) {
    console.error(`[ERROR] Update user role error:`, err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
