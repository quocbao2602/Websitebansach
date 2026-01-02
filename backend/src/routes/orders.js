const express = require('express');
const { Order, OrderItem, Book, User } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create order from cart
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, shippingPhone, paymentMethod, paymentStatus } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderCode = `ORD-${Date.now()}`;

    const order = await Order.create({
      orderCode,
      userId: req.user.id,
      totalAmount: 0,
      finalAmount: 0,
      shippingAddress,
      shippingPhone,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentStatus || 'pending'
    });

    for (const item of items) {
      const book = await Book.findByPk(item.bookId);
      if (!book) throw new Error(`Book ${item.bookId} not found`);
      
      const subtotal = book.price * item.quantity;
      totalAmount += subtotal;

      await OrderItem.create({
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: book.price,
        subtotal
      });

      // Decrease stock
      await book.update({ stock: book.stock - item.quantity });
    }

    await order.update({
      totalAmount,
      finalAmount: totalAmount
    });

    res.status(201).json({ message: 'Order created', orderId: order.id, orderCode });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [Book] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order detail
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem, include: [Book] }, { model: User }]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel order (pending/processing only) and restock items
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem }]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ error: 'Đơn hàng không thể hủy ở trạng thái hiện tại' });
    }

    // Restock books
    for (const item of order.OrderItems) {
      const book = await Book.findByPk(item.bookId);
      if (book) {
        await book.update({ stock: book.stock + item.quantity });
      }
    }

    await order.update({ status: 'cancelled' });

    res.json({ message: 'Đã hủy đơn hàng', order });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
