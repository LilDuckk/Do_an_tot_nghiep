import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function BrandCreatePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    logo_url: '',
    display_order: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!hasModulePermission('brand', 'create')) {
    return <div className="admin-error">Bạn không có quyền thêm thương hiệu.</div>;
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
      const res = await fetch('http://localhost:8000/api/products/brands/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        navigate('/admin/brands');
      } else {
        const data = await res.json();
        setError(data.error || 'Tạo thương hiệu thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Thêm thương hiệu mới</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên thương hiệu" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
        <input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="Logo URL" />
        <input name="display_order" value={form.display_order} onChange={handleChange} placeholder="Thứ tự hiển thị" type="number" />
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/brands')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 