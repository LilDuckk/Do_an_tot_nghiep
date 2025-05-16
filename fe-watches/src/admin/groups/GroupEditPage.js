import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../static/AdminCommon.css';

export default function GroupEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', permissions: [] });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      const [groupRes, permsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/account/auth/permissions/all/', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (groupRes.status === 403) {
        setError('Bạn không có quyền sửa mục này.');
        setLoading(false);
        return;
      }
      if (groupRes.ok && permsRes.ok) {
        const group = await groupRes.json();
        setForm({
          name: group.name,
          permissions: group.permissions || []
        });
        const data = await permsRes.json();
        setPermissions(Array.isArray(data) ? data : (data.results || []));
      } else {
        setError('Không lấy được dữ liệu');
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

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
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.status === 403) {
        setError('Bạn không có quyền sửa mục này.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi cập nhật nhóm');
      navigate('/admin/groups');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  // Quyền chưa chọn
  const availablePermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => !form.permissions.includes(p.id) && p.name.toLowerCase().includes(searchLeft.toLowerCase())
  );
  // Quyền đã chọn
  const selectedPermissions = (Array.isArray(permissions) ? permissions : []).filter(
    p => form.permissions.includes(p.id) && p.name.toLowerCase().includes(searchRight.toLowerCase())
  );

  return (
    <div className="admin-group-edit">
      <h2>Sửa nhóm quyền</h2>
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
        <button type="submit" className="admin-btn primary" style={{ marginTop: 16 }}>Lưu thay đổi</button>
      </form>
    </div>
  );
} 