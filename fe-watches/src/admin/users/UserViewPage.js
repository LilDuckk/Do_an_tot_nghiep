import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../static/AdminCommon.css';
import { hasModulePermission } from '../../services/permission';

export default function UserViewPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }
        const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) {
          const errorBody = await res.text();
          console.error('Error response:', {
            status: res.status,
            statusText: res.statusText,
            body: errorBody
          });
          throw new Error(`HTTP error! status: ${res.status}, body: ${errorBody}`);
        }

        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error('Fetch user error:', error);
        setError(error.message || 'Không lấy được thông tin người dùng');
      } finally {
        setLoading(false);
      }
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
      {hasModulePermission('user', 'edit') && (
                  <button className="admin-btn" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>Sửa</button>
                )}
      <Link to="/admin/users" className="admin-btn">Quay lại</Link>
    </div>
  );
}
