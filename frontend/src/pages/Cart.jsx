import React, { useState, useEffect } from 'react';
import './Cart.css';

export default function Cart({ onCheckout }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item =>
      item.id === bookId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (bookId) => {
    const updatedCart = cartItems.filter(item => item.id !== bookId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (window.confirm('Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h2>🛒 Giỏ Hàng</h2>
          <div className="empty-cart">
            <p>Giỏ hàng của bạn đang trống</p>
            <button className="btn-primary" onClick={() => window.history.back()}>
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h2>🛒 Giỏ Hàng ({cartItems.length} sản phẩm)</h2>
          <button className="btn-clear" onClick={clearCart}>
            🗑️ Xóa tất cả
          </button>
        </div>

        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.title}</h3>
                <p className="item-price">{item.price?.toLocaleString('vi-VN')}₫</p>
              </div>
              <div className="item-actions">
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>
                <button className="btn-remove" onClick={() => removeItem(item.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{getTotalAmount().toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>30,000₫</span>
          </div>
          <div className="summary-row total">
            <span>Tổng cộng:</span>
            <span>{(getTotalAmount() + 30000).toLocaleString('vi-VN')}₫</span>
          </div>
          <button className="btn-checkout" onClick={() => onCheckout(cartItems)}>
            Tiến hành đặt hàng →
          </button>
        </div>
      </div>
    </div>
  );
}
