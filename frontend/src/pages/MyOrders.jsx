import React, { useState, useEffect } from 'react';
import { ordersAPI, reviewsAPI } from '../api';
import './MyOrders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewingBookId, setReviewingBookId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Lỗi tải đơn hàng: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', color: '#f39c12' },
      processing: { label: 'Đang xử lý', color: '#3498db' },
      shipped: { label: 'Đang giao', color: '#9b59b6' },
      delivered: { label: 'Đã giao', color: '#27ae60' },
      cancelled: { label: 'Đã hủy', color: '#e74c3c' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: config.color }}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chưa thanh toán', color: '#e67e22' },
      paid: { label: 'Đã thanh toán', color: '#27ae60' },
      failed: { label: 'Thất bại', color: '#e74c3c' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="payment-badge" style={{ backgroundColor: config.color }}>
        {config.label}
      </span>
    );
  };

  const startReview = (bookId) => {
    if (reviewingBookId === bookId) {
      setReviewingBookId(null);
      setComment('');
      setRating(5);
      return;
    }
    setReviewingBookId(bookId);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const submitReview = async () => {
    if (!reviewingBookId) return;
    if (!rating || rating < 1 || rating > 5) {
      setReviewError('Điểm đánh giá phải từ 1-5');
      return;
    }
    try {
      setSubmitting(true);
      setReviewError('');
      await reviewsAPI.create({ bookId: reviewingBookId, rating: Number(rating), comment });
      alert('Đã gửi đánh giá');
      setReviewingBookId(null);
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
    try {
      setCancellingId(orderId);
      await ordersAPI.cancel(orderId);
      await fetchOrders();
      alert('Đã hủy đơn hàng');
    } catch (err) {
      alert(err.response?.data?.error || 'Hủy đơn hàng thất bại');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <h2>📦 Đơn Hàng Của Tôi</h2>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <div className="orders-container">
          <h2>📦 Đơn Hàng Của Tôi</h2>
          <div className="empty-orders">
            <p>Bạn chưa có đơn hàng nào</p>
            <button className="btn-primary" onClick={() => window.history.back()}>
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <h2>📦 Đơn Hàng Của Tôi ({orders.length})</h2>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Đơn hàng #{order.orderCode}</h3>
                  <p className="order-date">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                  {getPaymentBadge(order.paymentStatus)}
                </div>
              </div>

              <div className="order-body">
                <div className="order-items">
                  <h4>Sản phẩm:</h4>
                  {order.OrderItems?.map(item => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.Book?.title || 'N/A'}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        {item.subtotal?.toLocaleString('vi-VN')}₫
                      </span>
                      <button
                        className="btn-review"
                        onClick={() => startReview(item.bookId)}
                      >
                        {reviewingBookId === item.bookId ? '✕ Đóng' : '⭐ Đánh giá'}
                      </button>
                      {reviewingBookId === item.bookId && (
                        <div className="review-inline">
                          <div className="review-row">
                            <label>Số sao:</label>
                            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                          <div className="review-row">
                            <label>Nhận xét:</label>
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows="2"
                              placeholder="Chia sẻ trải nghiệm"
                            />
                          </div>
                          {reviewError && <div className="review-error">{reviewError}</div>}
                          <button className="btn-submit-review" onClick={submitReview} disabled={submitting}>
                            {submitting ? '⏳ Đang gửi...' : '📤 Gửi đánh giá'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span>📍 Địa chỉ:</span>
                    <span>{order.shippingAddress}</span>
                  </div>
                  <div className="detail-row">
                    <span>📞 SĐT:</span>
                    <span>{order.shippingPhone}</span>
                  </div>
                  <div className="detail-row">
                    <span>💳 Thanh toán:</span>
                    <span>
                      {order.paymentMethod === 'cod' && 'COD (Thanh toán khi nhận hàng)'}
                      {order.paymentMethod === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
                      {order.paymentMethod === 'credit_card' && 'Thẻ tín dụng'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Tổng cộng:</span>
                  <span className="total-amount">
                    {order.finalAmount?.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="order-actions">
                  {['pending', 'processing'].includes(order.status) && (
                    <button
                      className="btn-cancel-order"
                      onClick={() => cancelOrder(order.id)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id ? '⏳ Đang hủy...' : '🗑️ Hủy đơn'}
                    </button>
                  )}
                  <button 
                    className="btn-view-detail"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    {selectedOrder?.id === order.id ? 'Ẩn chi tiết ▲' : 'Xem chi tiết ▼'}
                  </button>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="order-extended">
                  <h4>Chi tiết đơn hàng:</h4>
                  <div className="extended-info">
                    <p><strong>Mã đơn:</strong> {order.orderCode}</p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(order.status)}</p>
                    <p><strong>Thanh toán:</strong> {getPaymentBadge(order.paymentStatus)}</p>
                    <p><strong>Tạm tính:</strong> {order.totalAmount?.toLocaleString('vi-VN')}₫</p>
                    <p><strong>Giảm giá:</strong> {order.discountAmount?.toLocaleString('vi-VN') || 0}₫</p>
                    <p><strong>Phí ship:</strong> {order.shippingFee?.toLocaleString('vi-VN') || 0}₫</p>
                    <p><strong>Tổng cuối:</strong> {order.finalAmount?.toLocaleString('vi-VN')}₫</p>
                    <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    <p><strong>Cập nhật:</strong> {new Date(order.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
