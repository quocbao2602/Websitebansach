import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './UserManagement.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('[DEBUG] Fetching users...');
      const res = await adminAPI.getUsers();
      console.log('[DEBUG] Users fetched:', res.data);
      setUsers(res.data);
    } catch (err) {
      console.error('[ERROR] Error fetching users:', err);
      alert('Lỗi tải danh sách người dùng: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Bạn chắc chắn muốn đổi role thành "${newRole}"?`)) {
      return;
    }

    try {
      console.log(`[DEBUG] Calling updateUserRole: userId=${userId}, newRole=${newRole}`);
      const response = await adminAPI.updateUserRole(userId, newRole);
      console.log(`[DEBUG] Response:`, response);
      alert('Cập nhật role thành công!');
      fetchUsers();
    } catch (err) {
      console.error(`[ERROR] updateUserRole failed:`, err);
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="user-management">
      <h2>Quản Lý Người Dùng</h2>

      {loading && <p>Đang tải...</p>}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  {user.role === 'user' && (
                    <button
                      className="btn-sm btn-promote"
                      onClick={() => handleRoleChange(user.id, 'admin')}
                    >
                      → Admin
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      className="btn-sm btn-demote"
                      onClick={() => handleRoleChange(user.id, 'user')}
                    >
                      → User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && <p className="empty-message">Không có người dùng nào</p>}
    </div>
  );
}
