const express = require('express');
const { Review, Book, User, OrderItem, Order } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper to update book average rating
async function updateBookRating(bookId) {
  const stats = await Review.findAll({
    where: { bookId },
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating'],
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
    ],
    raw: true
  });
  const avg = parseFloat(stats?.[0]?.avgRating || 0) || 0;
  const book = await Book.findByPk(bookId);
  if (book) {
    await book.update({ rating: avg.toFixed(2) });
  }
  return avg;
}

// Get all reviews for a book (latest first)
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { bookId: req.params.bookId },
      include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create review (must be authenticated and purchased)
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    if (!bookId || !rating) {
      return res.status(400).json({ error: 'Thiếu thông tin đánh giá' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Điểm đánh giá phải từ 1-5' });
    }

    // Ensure user bought this book
    const purchased = await OrderItem.findOne({
      where: { bookId },
      include: [{ model: Order, where: { userId: req.user.id } }]
    });
    if (!purchased) {
      return res.status(403).json({ error: 'Bạn cần mua sách trước khi đánh giá' });
    }

    // Prevent duplicate review per user-book
    const existing = await Review.findOne({ where: { userId: req.user.id, bookId } });
    if (existing) {
      return res.status(400).json({ error: 'Bạn đã đánh giá sách này rồi' });
    }

    const review = await Review.create({
      userId: req.user.id,
      bookId,
      rating,
      comment: comment || '',
      isVerifiedPurchase: true
    });

    const avg = await updateBookRating(bookId);

    const withUser = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
    });

    res.status(201).json({ review: withUser, avgRating: avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
