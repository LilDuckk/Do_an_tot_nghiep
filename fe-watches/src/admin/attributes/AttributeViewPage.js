import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function AttributeViewPage() {
  const { id } = useParams();
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/products/attributesvalue/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setAttribute(await res.json());
        } else {
          setError('Không tìm thấy thuộc tính');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchAttribute();
  }, [id]);

  if (!hasModulePermission('attribute', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem thuộc tính.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!attribute) return null;

  return (
    <div className="admin-group-view">
      <h2>Chi tiết thuộc tính</h2>
      <div><b>ID:</b> {attribute.id}</div>
      <div><b>Tên thuộc tính:</b> {attribute.name}</div>
      <div><b>Loại:</b> {attribute.type}</div>
      <button className="admin-btn" onClick={() => navigate('/admin/attributes')}>Quay lại</button>
    </div>
  );
} 