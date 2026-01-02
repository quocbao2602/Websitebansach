import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './OrderManagement.css';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      alert('Lỗi tải danh sách đơn hàng: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Bạn chắc chắn muốn đổi trạng thái thành "${newStatus}"?`)) {
      return;
    }

    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      alert('Cập nhật trạng thái thành công!');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      processing: '#3498db',
      shipped: '#9b59b6',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="order-management">
      <h2>Quản Lý Đơn Hàng</h2>

      {loading && <p>Đang tải...</p>}

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách Hàng</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Ngày Đặt</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''}>
                <td>{order.id}</td>
                <td>{order.User?.name || 'N/A'}</td>
                <td>{order.totalAmount?.toLocaleString('vi-VN')}₫</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button
                    className="btn-sm btn-view"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Chi Tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="order-detail">
          <div className="detail-content">
            <button className="btn-close" onClick={() => setSelectedOrder(null)}>×</button>
            <h3>Chi Tiết Đơn Hàng #{selectedOrder.id}</h3>
            <p><strong>Khách hàng:</strong> {selectedOrder.User?.name}</p>
            <p><strong>Email:</strong> {selectedOrder.User?.email}</p>
            <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount?.toLocaleString('vi-VN')}₫</p>
            <p>
              <strong>Trạng thái hiện tại:</strong>{' '}
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
              >
                {selectedOrder.status}
              </span>
            </p>

            <h4>Sách trong đơn hàng:</h4>
            <ul className="items-list">
              {selectedOrder.OrderItems?.map(item => (
                <li key={item.id}>
                  {item.Book?.title} - Số lượng: {item.quantity} - Giá: {item.price?.toLocaleString('vi-VN')}₫
                </li>
              ))}
            </ul>

            <div className="status-options">
              <p><strong>Cập nhật trạng thái:</strong></p>
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`btn-status ${selectedOrder.status === status ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedOrder.id, status)}
                  disabled={selectedOrder.status === status}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && <p className="empty-message">Không có đơn hàng nào</p>}
    </div>
  );
}
