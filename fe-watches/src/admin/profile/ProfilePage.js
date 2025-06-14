import React, { useEffect, useState } from 'react';
import { AUTH_ENDPOINTS } from '../../config/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    fetch(AUTH_ENDPOINTS.ME, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
        localStorage.setItem('adminUser', JSON.stringify(data));
      })
      .catch(() => {
        setError('Không thể lấy thông tin người dùng!');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Đang tải thông tin...</div>;
  if (error) return <div style={{color:'#e84118'}}>{error}</div>;
  if (!user) return null;

  return (
    <div className="admin-section">
      <h2>Thông tin tài khoản</h2>
      <div style={{fontSize:'1.1rem'}}>
        <p><b>Tên đăng nhập:</b> {user.username}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Nhóm:</b> {user.groups?.map(g => g.name).join(', ') || 'Không có'}</p>
        <p><b>Trạng thái:</b> {user.is_active ? 'Hoạt động' : 'Khóa'}</p>
        <p><b>Quyền:</b> {user.is_superuser ? 'Superuser' : user.is_staff ? 'Staff' : 'User'}</p>
      </div>
    </div>
  );
} 