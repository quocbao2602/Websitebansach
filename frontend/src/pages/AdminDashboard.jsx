import React, { useState } from 'react';
import './AdminDashboard.css';
import BookManagement from '../components/BookManagement.jsx';
import UserManagement from '../components/UserManagement.jsx';
import OrderManagement from '../components/OrderManagement.jsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Quản lý hệ thống Book Store</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 Quản Lý Sách
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Quản Lý Người Dùng
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Quản Lý Đơn Hàng
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'books' && <BookManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'orders' && <OrderManagement />}
      </div>
    </div>
  );
}
