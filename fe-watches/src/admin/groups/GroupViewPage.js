import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';

export default function GroupViewPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403) {
          setError('Bạn không có quyền xem thông tin này.');
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Lỗi khi lấy thông tin nhóm');
        const data = await res.json();
        setGroup(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchGroup();
  }, [id]);

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/account/auth/permissions/all/', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPermissions(Array.isArray(data) ? data : []);
      } else {
        setError('Không lấy được dữ liệu');
      }
    };
    fetchPermissions();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!group) return null;

  const groupPerms = permissions.filter(
    p => Array.isArray(group.permissions) && group.permissions.includes(p.id)
  );

  return (
    <div className="admin-group-view">
      <h2>Chi tiết nhóm quyền</h2>
      <div><b>ID:</b> {group.id}</div>
      <div><b>Tên nhóm:</b> {group.name}</div>
      <div><b>Quyền:</b>
        <ul>
          {groupPerms.length > 0 ? (
            groupPerms.map(p => (
              <li key={p.id}>
                {p.name} <span style={{color:'#888'}}>({p.codename})</span>
              </li>
            ))
          ) : (
            <li>Nhóm này chưa có quyền nào.</li>
          )}
        </ul>
      </div>
      {hasModulePermission('user', 'edit') && (
                  <button className="admin-btn" onClick={() => navigate(`/admin/users/${group.id}/edit`)}>Sửa</button>
                )}
      <Link to="/admin/groups" className="admin-btn">Quay lại</Link>
    </div>
  );
} 