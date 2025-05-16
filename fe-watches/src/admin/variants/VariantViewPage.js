import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function VariantViewPage() {
  const { id } = useParams();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/products/variants/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setVariant(await res.json());
        } else {
          setError('Không tìm thấy biến thể');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchVariant();
  }, [id]);

  if (!hasModulePermission('variant', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem biến thể.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!variant) return null;

  return (
    <div className="admin-group-view">
      <h2>Chi tiết biến thể sản phẩm</h2>
      <div><b>ID:</b> {variant.id}</div>
      <div><b>ID Sản phẩm:</b> {variant.product}</div>
      <div><b>SKU:</b> {variant.sku}</div>
      <div><b>Giá điều chỉnh:</b> {variant.price_adjustment}</div>
      <div><b>Barcode:</b> {variant.barcode}</div>
      <div><b>Trạng thái:</b> {variant.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      <button className="admin-btn" onClick={() => navigate('/admin/variants')}>Quay lại</button>
    </div>
  );
} 