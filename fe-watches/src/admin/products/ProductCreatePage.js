import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function ProductCreatePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    base_price: '',
    warranty_period: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    sku: '',
    is_featured: false,
    is_active: true
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8000/api/products/brands/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setBrands(await res.json());
        }
      } catch {}
    };
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8000/api/products/categories/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setCategories(await res.json());
        }
      } catch {}
    };
    fetchBrands();
    fetchCategories();
  }, []);

  if (!hasModulePermission('product', 'create')) {
    return <div className="admin-error">Bạn không có quyền thêm sản phẩm.</div>;
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = e => {
    setImageFiles(Array.from(e.target.files));
    setPrimaryImageIndex(0);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Validate các trường bắt buộc
    if (!form.name || !form.brand || !form.category || !form.base_price || !form.slug) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Thương hiệu, Danh mục, Giá gốc.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      imageFiles.forEach((file, idx) => {
        formData.append('images', file);
      });
      formData.append('primary_image_index', primaryImageIndex);
      const res = await fetch('http://localhost:8000/api/products/products/create_with_images/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (res.status === 201) {
        navigate('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Tạo sản phẩm thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Thêm sản phẩm mới</h2>
      <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
        <select name="brand" value={form.brand} onChange={handleChange} required>
          <option value="">-- Chọn thương hiệu --</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">-- Chọn danh mục --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="base_price" value={form.base_price} onChange={handleChange} placeholder="Giá gốc (VND)" type="number" min="0" required />
        <input name="warranty_period" value={form.warranty_period} onChange={handleChange} placeholder="Bảo hành (tháng)" type="number" min="0" />
        <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (không dấu, cách nhau bởi -)" />
        <input name="meta_title" value={form.meta_title} onChange={handleChange} placeholder="Meta title" />
        <input name="meta_description" value={form.meta_description} onChange={handleChange} placeholder="Meta description" />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" />
        <label><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /> Sản phẩm nổi bật</label>
        <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        <div className="product-images-section">
          <h3>Ảnh sản phẩm</h3>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          {imageFiles.length > 0 && (
            <div className="product-images-grid">
              {imageFiles.map((file, idx) => (
                <div key={idx} className="product-image-item" style={{border: primaryImageIndex === idx ? '2px solid #4CAF50' : ''}}>
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                  <div className="image-actions">
                    <button type="button" className="admin-btn small" onClick={() => setPrimaryImageIndex(idx)}>
                      {primaryImageIndex === idx ? 'Đang là ảnh chính' : 'Đặt làm ảnh chính'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 