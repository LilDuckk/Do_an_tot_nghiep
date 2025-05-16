import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function VariantEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    product: '',
    sku: '',
    price_adjustment: '',
    barcode: '',
    is_active: true
  });
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
          const data = await res.json();
          setForm({
            product: data.product || '',
            sku: data.sku || '',
            price_adjustment: data.price_adjustment || '',
            barcode: data.barcode || '',
            is_active: data.is_active !== undefined ? data.is_active : true
          });
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

  if (!hasModulePermission('variant', 'edit')) {
    return <div className="admin-error">Bạn không có quyền sửa biến thể.</div>;
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/variants/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate('/admin/variants');
      } else {
        const data = await res.json();
        setError(data.error || 'Cập nhật biến thể thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Chỉnh sửa biến thể</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="product" value={form.product} onChange={handleChange} placeholder="ID Sản phẩm" required />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" required />
        <input name="price_adjustment" value={form.price_adjustment} onChange={handleChange} placeholder="Giá điều chỉnh" type="number" />
        <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode" />
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/variants')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 