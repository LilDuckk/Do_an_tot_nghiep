import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function CategoryViewPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/products/categories/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCategory(await res.json());
        } else {
          setError('Không tìm thấy danh mục');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchCategory();
  }, [id]);

  if (!hasModulePermission('category', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem danh mục.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!category) return null;

  return (
    <div className="admin-group-view">
      <h2>Chi tiết danh mục</h2>
      <div><b>ID:</b> {category.id}</div>
      <div><b>Tên danh mục:</b> {category.name}</div>
      <div><b>Mô tả:</b> {category.description}</div>
      <div><b>Danh mục cha:</b> {category.parent}</div>
      <div><b>Thứ tự hiển thị:</b> {category.display_order}</div>
      <div><b>Trạng thái:</b> {category.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      <button className="admin-btn" onClick={() => navigate('/admin/categories')}>Quay lại</button>
    </div>
  );
} 