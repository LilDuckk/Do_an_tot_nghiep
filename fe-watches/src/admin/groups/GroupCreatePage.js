import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

export default function GroupCreatePage() {
  const [form, setForm] = useState({ name: '', permissions: [] });
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${AUTH_ENDPOINTS.PERMISSIONS}/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions(Array.isArray(data) ? data : (data.results || []));
      }
    };
    fetchPermissions();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddPermission = (id) => {
    setForm(f => ({ ...f, permissions: [...f.permissions, id] }));
  };

  const handleRemovePermission = (id) => {
    setForm(f => ({ ...f, permissions: f.permissions.filter(pid => pid !== id) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(AUTH_ENDPOINTS.GROUPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.status === 201) navigate('/admin/groups');
      else {
        const data = await res.json();
        setError(data.error || 'Tạo nhóm thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  // Quyền chưa chọn
  const availablePermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => !form.permissions.includes(p.id) && p.name.toLowerCase().includes(searchLeft.toLowerCase())
  );
  // Quyền đã chọn
  const selectedPermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => form.permissions.includes(p.id) && p.name.toLowerCase().includes(searchRight.toLowerCase())
  );

  return (
    <div className="admin-group-create">
      <h2>Thêm nhóm quyền mới</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Tên nhóm:<input name="name" value={form.name} onChange={handleChange} required /></label>
        <div className="admin-perm-2col">
          <div className="admin-perm-col">
            <b>Quyền chưa chọn</b>
            <input
              type="text"
              placeholder="Tìm kiếm quyền..."
              value={searchLeft}
              onChange={e => setSearchLeft(e.target.value)}
            />
            <div className="admin-perm-list">
              {availablePermissions.map(p => (
                <div key={p.id} className="admin-perm-item">
                  <span>{p.name}</span>
                  <button type="button" className="admin-perm-move-btn" onClick={() => handleAddPermission(p.id)}>&gt;&gt;</button>
                </div>
              ))}
              {availablePermissions.length === 0 && <div className="admin-perm-empty">Không có quyền nào</div>}
            </div>
          </div>
          <div className="admin-perm-col">
            <b>Quyền đã chọn</b>
            <input
              type="text"
              placeholder="Tìm kiếm quyền..."
              value={searchRight}
              onChange={e => setSearchRight(e.target.value)}
            />
            <div className="admin-perm-list">
              {selectedPermissions.map(p => (
                <div key={p.id} className="admin-perm-item">
                  <span>{p.name}</span>
                  <button type="button" className="admin-perm-move-btn" onClick={() => handleRemovePermission(p.id)}>&lt;&lt;</button>
                </div>
              ))}
              {selectedPermissions.length === 0 && <div className="admin-perm-empty">Chưa chọn quyền nào</div>}
            </div>
          </div>
        </div>
        <button type="submit" className="admin-btn primary" style={{ marginTop: 16 }}>Tạo mới</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 