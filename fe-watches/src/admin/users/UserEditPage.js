import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../static/AdminCommon.css';

export default function UserEditPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8000/api/account/users/${id}/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = {
        username: e.target.username.value,
        email: e.target.email.value,
        is_active: e.target.is_active.checked,
        is_staff: e.target.is_staff.checked,
        groups: e.target.groups.value ? [parseInt(e.target.groups.value)] : []
      };

      await axios.put(`http://localhost:8000/api/account/users/${id}/`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigate('/admin/users');
    } catch (err) {
      setError('Không thể cập nhật người dùng');
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  return (
    <div className="admin-section">
      <h2>Chỉnh sửa người dùng</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="username" 
          defaultValue={user.username} 
          placeholder="Tên người dùng" 
          required 
        />
        <input 
          type="email" 
          name="email" 
          defaultValue={user.email} 
          placeholder="Email" 
          required 
        />
        <label>
          <input 
            type="checkbox" 
            name="is_active" 
            defaultChecked={user.is_active} 
          /> 
          Hoạt động
        </label>
        <label>
          <input 
            type="checkbox" 
            name="is_staff" 
            defaultChecked={user.is_staff} 
          /> 
          Nhân viên
        </label>
        <input 
          type="text" 
          name="groups" 
          defaultValue={user.groups.length > 0 ? user.groups[0].id : ''} 
          placeholder="ID Nhóm" 
        />
        <button type="submit">Cập nhật</button>
      </form>
    </div>
  );
}
