import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function GroupViewPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      const [groupRes, permsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/account/auth/groups/${id}/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/account/auth/permissions/', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (groupRes.ok && permsRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData);
        setPermissions(await permsRes.json());
      } else {
        setError('Không lấy được dữ liệu');
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!group) return null;

  const groupPerms = permissions.filter(p => group.permissions && group.permissions.includes(p.id));

  return (
    <div className="admin-group-view">
      <h2>Chi tiết nhóm quyền</h2>
      <div><b>ID:</b> {group.id}</div>
      <div><b>Tên nhóm:</b> {group.name}</div>
      <div><b>Quyền:</b>
        <ul>
          {groupPerms.map(p => <li key={p.id}>{p.name} ({p.codename})</li>)}
        </ul>
      </div>
      <Link to={`/admin/groups/${group.id}/edit`} className="admin-btn">Sửa</Link>
      <Link to="/admin/groups" className="admin-btn">Quay lại</Link>
    </div>
  );
} 