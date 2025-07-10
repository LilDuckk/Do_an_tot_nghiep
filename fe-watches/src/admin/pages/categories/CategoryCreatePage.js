import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '@/services/permission';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

export default function CategoryCreatePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    parent: '',
    display_order: '',
    is_active: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(PRODUCT_ENDPOINTS.CATEGORIES_LIST_ALL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (!hasModulePermission('category', 'create')) {
    return <div className="admin-error">Bạn không có quyền thêm danh mục.</div>;
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
      const res = await fetch(PRODUCT_ENDPOINTS.PRODUCT_CATEGORIES, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          parent: form.parent || null
        }),
      });
      if (res.status === 201) {
        navigate('/admin/categories');
      } else {
        const data = await res.json();
        setError(data.error || 'Tạo danh mục thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Thêm danh mục mới</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên danh mục" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
        <select name="parent" value={form.parent} onChange={handleChange}>
          <option value="">Không có danh mục cha</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input name="display_order" value={form.display_order} onChange={handleChange} placeholder="Thứ tự hiển thị" type="number" />
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/categories')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 