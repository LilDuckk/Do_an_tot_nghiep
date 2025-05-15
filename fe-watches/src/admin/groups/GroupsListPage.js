import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../static/AdminCommon.css';

export default function GroupsListPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/account/auth/groups/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách nhóm');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhóm này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) fetchGroups();
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-groups-list">
      <div className="admin-list-header">
        <h2>Quản lý nhóm quyền</h2>
        <Link to="/admin/groups/create" className="admin-btn primary">+ Thêm mới</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên nhóm</th>
            <th>Quyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.name}</td>
              <td>{g.permissions && g.permissions.length}</td>
              <td>
                <button onClick={() => navigate(`/admin/groups/${g.id}`)}>Xem</button>
                <button onClick={() => navigate(`/admin/groups/${g.id}/edit`)}>Sửa</button>
                <button onClick={() => handleDelete(g.id)} className="danger">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 