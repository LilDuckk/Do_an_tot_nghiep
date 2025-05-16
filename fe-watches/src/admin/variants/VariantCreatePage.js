import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function VariantCreatePage() {
  const [form, setForm] = useState({
    product: '',
    sku: '',
    price_adjustment: '',
    barcode: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!hasModulePermission('variant', 'create')) {
    return <div className="admin-error">Bạn không có quyền thêm biến thể.</div>;
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
      const res = await fetch('http://localhost:8000/api/products/variants/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        navigate('/admin/variants');
      } else {
        const data = await res.json();
        setError(data.error || 'Tạo biến thể thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Thêm biến thể mới</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="product" value={form.product} onChange={handleChange} placeholder="ID Sản phẩm" required />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" required />
        <input name="price_adjustment" value={form.price_adjustment} onChange={handleChange} placeholder="Giá điều chỉnh" type="number" />
        <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode" />
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/variants')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 