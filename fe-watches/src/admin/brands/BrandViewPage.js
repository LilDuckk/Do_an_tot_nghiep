import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

export default function BrandViewPage() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${PRODUCT_ENDPOINTS.BRANDS}${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setBrand(await res.json());
        } else {
          setError('Không tìm thấy thương hiệu');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchBrand();
  }, [id]);

  if (!hasModulePermission('brand', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem thương hiệu.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!brand) return null;

  return (
    <div className="admin-view-container">
      <h2>Chi tiết thương hiệu</h2>
      <div><b>ID:</b> {brand.id}</div>
      <div><b>Tên thương hiệu:</b> {brand.name}</div>
      <div><b>Mô tả:</b> {brand.description}</div>
      <div><b>Logo:</b> {brand.logo_url ? <img src={brand.logo_url} alt={brand.name} style={{width:60}}/> : 'Không có'}</div>
      <div><b>Thứ tự hiển thị:</b> {brand.display_order}</div>
      <div><b>Trạng thái:</b> {brand.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      <button className="admin-btn" onClick={() => navigate('/admin/brands')}>Quay lại</button>
    </div>
  );
} 