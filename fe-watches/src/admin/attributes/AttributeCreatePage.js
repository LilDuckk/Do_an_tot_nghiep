import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function AttributeCreatePage() {
  const [form, setForm] = useState({
    name: '',
    type: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!hasModulePermission('attribute', 'create')) {
    return <div className="admin-error">Bạn không có quyền thêm thuộc tính.</div>;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/products/attributesvalue/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        navigate('/admin/attributes');
      } else {
        const data = await res.json();
        setError(data.error || 'Tạo thuộc tính thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Thêm thuộc tính mới</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên thuộc tính" required />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Loại thuộc tính" required />
        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/attributes')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 