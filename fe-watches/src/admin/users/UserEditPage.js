import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../static/AdminCommon.css';

export default function UserEditPage() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        // Lấy user
        const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) {
          setError('Bạn không có quyền sửa mục này.');
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Lỗi khi lấy thông tin người dùng');
        const data = await res.json();
        setUser(data);
        setSelectedGroups(Array.isArray(data.groups) ? data.groups.map(g => g.id) : []);
        // Lấy danh sách nhóm
        const resGroups = await fetch('http://localhost:8000/api/account/auth/groups/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resGroups.ok) {
          const data = await resGroups.json();
          setGroups(Array.isArray(data) ? data : (data.results || []));
        } else {
          setGroups([]);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchUserAndGroups();
  }, [id]);

  const handleAddGroup = (gid) => {
    setSelectedGroups(prev => [...prev, gid]);
  };

  const handleRemoveGroup = (gid) => {
    setSelectedGroups(prev => prev.filter(id => id !== gid));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = {
        username: e.target.username.value,
        email: e.target.email.value,
        is_active: e.target.is_active.checked,
        is_staff: e.target.is_staff.checked,
        groups_id: selectedGroups
      };
      const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (res.status === 403) {
        setError('Bạn không có quyền sửa mục này.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi cập nhật người dùng');
      setSuccess('Cập nhật thành công!');
      navigate('/admin/users');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!user) return <div>Không tìm thấy người dùng</div>;

  // Phân loại nhóm đã chọn và chưa chọn
  const selectedGroupObjs = Array.isArray(groups) ? groups.filter(g => selectedGroups.includes(g.id)) : [];
  const availableGroups = Array.isArray(groups) ? groups.filter(g => !selectedGroups.includes(g.id)) : [];

  return (
    <div className="admin-section">
      <h2>Chỉnh sửa người dùng</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
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
        <div className="admin-perm-2col">
          <div className="admin-perm-col">
            <b>Nhóm chưa chọn</b>
            <div className="admin-perm-list">
              {availableGroups.length > 0 ? availableGroups.map(g => (
                <div key={g.id} className="admin-perm-item">
                  <span>{g.name} <span style={{color:'#888', fontSize:'0.95em'}}>#{g.id}</span></span>
                  <button type="button" className="admin-perm-move-btn" onClick={() => handleAddGroup(g.id)}>&gt;&gt;</button>
                </div>
              )) : <div className="admin-perm-empty">Không còn nhóm nào</div>}
            </div>
          </div>
          <div className="admin-perm-col">
            <b>Nhóm đã chọn</b>
            <div className="admin-perm-list">
              {selectedGroupObjs.length > 0 ? selectedGroupObjs.map(g => (
                <div key={g.id} className="admin-perm-item">
                  <span>{g.name} <span style={{color:'#888', fontSize:'0.95em'}}>#{g.id}</span></span>
                  <button type="button" className="admin-perm-move-btn" onClick={() => handleRemoveGroup(g.id)}>&lt;&lt;</button>
                </div>
              )) : <div className="admin-perm-empty">Chưa chọn nhóm nào</div>}
            </div>
          </div>
        </div>
        <label className="admin-checkbox">
          <input 
            type="checkbox" 
            name="is_active" 
            defaultChecked={user.is_active} 
          />
          <span className="admin-checkbox-custom"></span>
          <span>Hoạt động</span>
        </label>
        <label className="admin-checkbox">
          <input 
            type="checkbox" 
            name="is_staff" 
            defaultChecked={user.is_staff} 
          />
          <span className="admin-checkbox-custom"></span>
          <span>Nhân viên</span>
        </label>
        <button type="submit" className="admin-btn primary">Cập nhật</button>
      </form>
      {success && <div className="admin-success">{success}</div>}
    </div>
  );
}
