import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function CategoryEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    description: '',
    parent: '',
    display_order: '',
    is_active: true
  });
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
          const data = await res.json();
          setForm({
            name: data.name || '',
            description: data.description || '',
            parent: data.parent || '',
            display_order: data.display_order || '',
            is_active: data.is_active !== undefined ? data.is_active : true
          });
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

  if (!hasModulePermission('category', 'edit')) {
    return <div className="admin-error">Bạn không có quyền sửa danh mục.</div>;
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
      const res = await fetch(`http://localhost:8000/api/products/categories/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate('/admin/categories');
      } else {
        const data = await res.json();
        setError(data.error || 'Cập nhật danh mục thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Chỉnh sửa danh mục</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên danh mục" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
        <input name="parent" value={form.parent} onChange={handleChange} placeholder="ID Danh mục cha (nếu có)" />
        <input name="display_order" value={form.display_order} onChange={handleChange} placeholder="Thứ tự hiển thị" type="number" />
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/categories')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 