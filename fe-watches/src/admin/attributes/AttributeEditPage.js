import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function AttributeEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    type: ''
  });
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
          const data = await res.json();
          setForm({
            name: data.name || '',
            type: data.type || ''
          });
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

  if (!hasModulePermission('attribute', 'edit')) {
    return <div className="admin-error">Bạn không có quyền sửa thuộc tính.</div>;
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
      const res = await fetch(`http://localhost:8000/api/products/attributesvalue/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate('/admin/attributes');
      } else {
        const data = await res.json();
        setError(data.error || 'Cập nhật thuộc tính thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Chỉnh sửa thuộc tính</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên thuộc tính" required />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Loại thuộc tính" required />
        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/attributes')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 