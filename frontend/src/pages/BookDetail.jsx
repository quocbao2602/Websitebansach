import React, { useState, useEffect } from 'react';
import { booksAPI, reviewsAPI } from '../api';
import './BookDetail.css';

export default function BookDetail({ bookId, onBack, onAddToCart, user, onRequireLogin }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchBookDetail();
    fetchReviews();
  }, [bookId]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getById(bookId);
      setBook(res.data);
    } catch (err) {
      console.error('Error fetching book:', err);
      alert('Lỗi tải thông tin sách: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getByBook(bookId);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      onRequireLogin?.();
      return;
    }

    if (quantity < 1 || quantity > book.stock) {
      alert('Số lượng không hợp lệ!');
      return;
    }

    const cartItem = {
      id: book.id,
      title: book.title,
      price: book.price,
      quantity: quantity
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === book.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng!`);
    
    if (onAddToCart) {
      onAddToCart();
    }
  };

  const renderStars = (rating) => {
    if (!rating || Number.isNaN(Number(rating))) return '☆☆☆☆☆';
    const r = Math.round(Number(rating));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(r);
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="detail-container">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="detail-container">
          <p>Không tìm thấy sách</p>
          <button className="btn-back" onClick={onBack}>← Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-page">
      <div className="detail-container">
        <button className="btn-back" onClick={onBack}>← Quay lại</button>

        <div className="book-detail-content">
          <div className="book-image-section">
            <img 
              src={book.image || 'https://via.placeholder.com/400x600?text=No+Image'} 
              alt={book.title} 
            />
          </div>

          <div className="book-info-section">
            <h1>{book.title}</h1>
            
            <div className="book-meta">
              <div className="meta-row">
                <span className="meta-label">✍️ Tác giả:</span>
                <span className="meta-value">{book.Author?.name || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">🏢 Nhà xuất bản:</span>
                <span className="meta-value">{book.Publisher?.name || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">📚 Thể loại:</span>
                <span className="meta-value">{book.Category?.name || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">📖 ISBN:</span>
                <span className="meta-value">{book.isbn || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">📅 Năm xuất bản:</span>
                <span className="meta-value">{book.publishedYear || 'N/A'}</span>
              </div>
            </div>

            <div className="book-price-section">
              <div className="price-info">
                <span className="price-label">Giá:</span>
                <span className="price-value">{book.price?.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="rating-info">
                <span className="rating-stars">{renderStars(book.rating)}</span>
                <span className="rating-value">{Number(book.rating || 0).toFixed(1)} sao</span>
              </div>
              <div className="stock-info">
                <span className={`stock-badge ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {book.description && (
              <div className="book-description">
                <h3>📝 Mô tả sản phẩm</h3>
                <p>{book.description}</p>
              </div>
            )}

            {book.stock > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label>Số lượng:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={book.stock}
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      disabled={quantity >= book.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button className="btn-add-to-cart" onClick={handleAddToCart}>
                  🛒 Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {book.stock === 0 && (
              <div className="out-of-stock-message">
                <p>⚠️ Sản phẩm hiện tại đã hết hàng</p>
              </div>
            )}

            <div className="reviews-section">
              <h3>⭐ Đánh giá & Nhận xét</h3>
              <div className="reviews-list">
                {reviews.length === 0 && <p>Chưa có đánh giá nào</p>}
                {reviews.map(rv => (
                  <div key={rv.id} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        <span className="avatar-circle">{(rv.User?.name || '?').charAt(0).toUpperCase()}</span>
                        <span className="name">{rv.User?.name || 'Ẩn danh'}</span>
                        <span className="rating-stars">{renderStars(rv.rating)}</span>
                      </div>
                      <span className="review-date">{new Date(rv.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="review-comment">{rv.comment || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
