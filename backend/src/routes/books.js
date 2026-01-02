const express = require('express');
const { Book, Author, Publisher, Category, Review, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all books with filters
router.get('/', async (req, res) => {
  try {
    const { categoryId, authorId, search, sort, page = 1, limit = 12 } = req.query;
    const where = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (search) where.title = { [require('sequelize').Op.like]: `%${search}%` };

    const order = [];
    if (sort === 'price-asc') order.push(['price', 'ASC']);
    if (sort === 'price-desc') order.push(['price', 'DESC']);
    if (sort === 'rating') order.push(['rating', 'DESC']);
    if (sort === 'newest') order.push(['createdAt', 'DESC']);

    const books = await Book.findAll({
      where,
      include: [
        { model: Author, attributes: ['id', 'name'] },
        { model: Publisher, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'] }
      ],
      order: order.length > 0 ? order : [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book detail
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Author, attributes: ['id', 'name', 'biography'] },
        { model: Publisher, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'] },
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    
    // Increment views
    await book.update({ views: book.views + 1 });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create book (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, price, stock, authorId, publisherId, categoryId } = req.body;
    const book = await Book.create({ title, price, stock, authorId, publisherId, categoryId });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
