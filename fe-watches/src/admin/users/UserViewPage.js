import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UsersPage.css';

export default function UserViewPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access');
      const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUser(await res.json());
      else setError('Không lấy được thông tin người dùng');
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!user) return null;

  return (
    <div className="admin-user-view">
      <h2>Chi tiết người dùng</h2>
      <div><b>ID:</b> {user.id}</div>
      <div><b>Tên đăng nhập:</b> {user.username}</div>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Nhóm quyền:</b> {user.groups && user.groups.map(g => g.name).join(', ')}</div>
      <div><b>Trạng thái:</b> {user.is_active ? 'Hoạt động' : 'Khóa'}</div>
      <div><b>Staff:</b> {user.is_staff ? 'Có' : 'Không'}</div>
      <div><b>Superuser:</b> {user.is_superuser ? 'Có' : 'Không'}</div>
      <Link to={`/admin/users/${user.id}/edit`} className="admin-btn">Sửa</Link>
      <Link to="/admin/users" className="admin-btn">Quay lại</Link>
    </div>
  );
} 