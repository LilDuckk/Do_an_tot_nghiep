import React, { useEffect, useState } from 'react';
import '../static/AdminCommon.css';

export default function PermissionsListPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/account/auth/permissions/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPermissions(await res.json());
      else setError('Không lấy được danh sách quyền');
      setLoading(false);
    };
    fetchPermissions();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-permissions-list">
      <h2>Danh sách quyền</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên quyền</th>
            <th>Codename</th>
            <th>Content Type</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.codename}</td>
              <td>{p.content_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}