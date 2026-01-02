import React, { useEffect, useState } from 'react';
import { authAPI } from '../api';
import './Profile.css';

export default function Profile({ user, onUpdated, onAvatarUpdated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load current user info
    (async () => {
      try {
        const res = await authAPI.getMe();
        const u = res.data || user || {};
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || ''
        });
        const savedAvatar = localStorage.getItem('userAvatar') || u.avatar || '';
        setAvatarPreview(savedAvatar);
      } catch (err) {
        setError(err.response?.data?.error || 'Không tải được thông tin');
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = name === 'phone' ? value.replace(/\D/g, '') : value;
    setForm(prev => ({ ...prev, [name]: next }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const payload = { name: form.name, phone: form.phone, address: form.address };
      const res = await authAPI.updateMe(payload);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdated?.(updatedUser);
      }
      if (avatarPreview) {
        try {
          localStorage.setItem('userAvatar', avatarPreview);
          onAvatarUpdated?.(avatarPreview);
        } catch (err) {
          console.log('Persist avatar failed', err);
        }
      }
      alert('Cập nhật thông tin thành công');
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp ảnh hợp lệ');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
    };
    reader.onerror = () => setError('Không thể đọc tệp ảnh');
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Trang Cá Nhân</h2>
        {error && <div className="error">{error}</div>}

        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img src={avatarPreview || 'https://via.placeholder.com/160?text=Avatar'} alt="Avatar" />
            </div>
            <label>Chọn ảnh đại diện từ máy</label>
            <input type="file" accept="image/*" onChange={onAvatarFileChange} />
          </div>

          <form className="profile-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label>Họ và tên *</label>
              <input type="text" name="name" value={form.name} onChange={onChange} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} disabled />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" name="phone" value={form.phone} onChange={onChange} placeholder="Chỉ số, 8-15 ký tự" />
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea name="address" value={form.address} onChange={onChange} rows="3" />
            </div>

            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
