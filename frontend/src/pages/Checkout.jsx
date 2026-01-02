import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ordersAPI } from '../api';
import './Checkout.css';

export default function Checkout({ cartItems, onOrderSuccess, user }) {
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingPhone: '',
    paymentMethod: 'cod',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Prefill from user profile (if available) without overriding edits
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: prev.shippingAddress || user.address || '',
        shippingPhone: prev.shippingPhone || (user.phone ? String(user.phone).replace(/\D/g, '') : '')
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'shippingPhone' ? value.replace(/\D/g, '') : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
    
    // Reset QR scanner when changing payment method
    if (name === 'paymentMethod' && value !== 'bank_transfer') {
      setShowQRScanner(false);
      setQrScanned(false);
      setQrResult(null);
      stopQRScanner();
    }
  };

  // Initialize QR Scanner
  useEffect(() => {
    if (showQRScanner && formData.paymentMethod === 'bank_transfer') {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: 250 },
        false
      );

      html5QrcodeScannerRef.current = qrScanner;

      qrScanner.render(
        (decodedText, decodedResult) => {
          setQrResult(decodedText);
          setQrScanned(true);
          stopQRScanner();
          alert('✓ Đã quét mã QR thành công!');
        },
        (error) => {
          // Ignore scanning errors
        }
      );
    }

    return () => {
      stopQRScanner();
    };
  }, [showQRScanner, formData.paymentMethod]);

  const stopQRScanner = () => {
    if (html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.clear();
      } catch (err) {
        console.log('Error stopping scanner:', err);
      }
      html5QrcodeScannerRef.current = null;
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shippingAddress || !formData.shippingPhone) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt hàng.');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: formData.shippingAddress,
        shippingPhone: formData.shippingPhone,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'bank_transfer' && qrScanned ? 'paid' : 'pending'
      };

      const response = await ordersAPI.create(orderData);
      
      // Clear cart
      localStorage.removeItem('cart');
      
      alert('Đặt hàng thành công! Mã đơn hàng: ' + response.data.orderCode);
      onOrderSuccess();
    } catch (err) {
      console.error('Order error:', err);
      alert('Lỗi đặt hàng: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h2>📦 Thanh Toán</h2>

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Thông tin giao hàng</h3>
              
              <div className="form-group">
                <label>Địa chỉ giao hàng *</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Số nhà, đường, phường, quận, thành phố"
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  name="shippingPhone"
                  value={formData.shippingPhone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                  rows="2"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Phương thức thanh toán</h3>
              
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <span>💵 Thanh toán khi nhận hàng (COD)</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                  />
                  <span>🏦 Chuyển khoản ngân hàng</span>
                </label>

                {formData.paymentMethod === 'bank_transfer' && (
                  <div className="payment-details">
                    <div className="qr-section">
                      <h4>💳 Quét mã QR để thanh toán</h4>
                      {!showQRScanner && !qrScanned && (
                        <button 
                          type="button" 
                          className="btn-scan-qr"
                          onClick={() => setShowQRScanner(true)}
                        >
                          📷 Quét mã QR
                        </button>
                      )}
                      
                      {showQRScanner && (
                        <div className="qr-scanner-container">
                          <div id="qr-reader" style={{ width: '100%' }}></div>
                          <button 
                            type="button" 
                            className="btn-cancel-scan"
                            onClick={() => {
                              setShowQRScanner(false);
                              stopQRScanner();
                            }}
                          >
                            ✕ Hủy
                          </button>
                        </div>
                      )}

                      {qrScanned && (
                        <div className="qr-success">
                          <div className="success-icon">✓</div>
                          <p>Đã quét mã QR thành công!</p>
                          <p className="status-paid">✓ Đã thanh toán</p>
                          <button 
                            type="button" 
                            className="btn-scan-again"
                            onClick={() => {
                              setQrScanned(false);
                              setQrResult(null);
                              setShowQRScanner(true);
                            }}
                          >
                            📷 Quét lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                  />
                  <span>💳 Thẻ tín dụng/Ghi nợ</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-place-order" disabled={loading || (formData.paymentMethod === 'bank_transfer' && !qrScanned)}>
              {loading ? 'Đang xử lý...' : formData.paymentMethod === 'bank_transfer' && !qrScanned ? '⏳ Chưa thanh toán QR' : '🛒 Đặt hàng'}
            </button>
          </form>

          <div className="order-summary">
            <h3>Đơn hàng ({cartItems.length} sản phẩm)</h3>
            
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.title} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
