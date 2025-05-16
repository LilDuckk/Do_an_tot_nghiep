import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function ProductEditPage() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/products/products/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || '',
            description: data.description || '',
            brand: data.brand || '',
            category: data.category || '',
            base_price: data.base_price || '',
            warranty_period: data.warranty_period || '',
            slug: data.slug || '',
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            sku: data.sku || '',
            is_featured: data.is_featured || false,
            is_active: data.is_active !== undefined ? data.is_active : true
          });
          setProductImages(Array.isArray(data.images) ? data.images : []);
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };

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

    fetchProduct();
    fetchBrands();
    fetchCategories();
  }, [id]);

  if (!hasModulePermission('product', 'edit')) {
    return <div className="admin-error">Bạn không có quyền sửa sản phẩm.</div>;
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = e => {
    setImageFiles(Array.from(e.target.files));
    setPrimaryImageIndex(0);
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/product-images/${imageId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProductImages(images => images.filter(img => img.id !== imageId));
      } else {
        setError('Xóa ảnh thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/product-images/${imageId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_primary: true })
      });
      if (res.ok) {
        setProductImages(images => 
          images.map(img => ({
            ...img,
            is_primary: img.id === imageId
          }))
        );
      } else {
        setError('Đặt ảnh chính thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Validate các trường bắt buộc
    if (!form.name || !form.brand || !form.category || !form.base_price || !form.slug) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Thương hiệu, Danh mục, Giá gốc, Slug.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      const safeForm = {
        ...form,
        brand: Number(form.brand),
        category: Number(form.category),
        base_price: form.base_price,
        warranty_period: form.warranty_period,
        is_featured: form.is_featured ? 'true' : 'false',
        is_active: form.is_active ? 'true' : 'false',
      };
      Object.entries(safeForm).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
        formData.append('primary_image_index', primaryImageIndex);
      }
      const res = await fetch(`http://localhost:8000/api/products/products/${id}/update_with_images/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (res.ok) {
        if (imageFiles.length > 0) {
          setImageFiles([]);
        }
        navigate('/admin/products');
      } else {
        const data = await res.json();
        setError(data.error || 'Cập nhật sản phẩm thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  // Hàm lấy url ảnh đúng
  const getImageUrl = (img) => {
    const url = img.image_url || img.image || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Chỉnh sửa sản phẩm</h2>
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
          <div className="product-images-grid">
            {Array.isArray(productImages) && productImages.length > 0 && productImages.map((image, idx) => {
              const url = getImageUrl(image);
              if (!url) return null;
              return (
                <div key={image.id} className="product-image-item" style={{border: image.is_primary ? '2px solid #4CAF50' : ''}}>
                  <img src={url} alt={image.alt_text || 'Product image'} />
                  <div className="image-actions">
                    {!image.is_primary && (
                      <button 
                        type="button" 
                        className="admin-btn small"
                        onClick={() => handleSetPrimaryImage(image.id)}
                      >
                        Đặt làm ảnh chính
                      </button>
                    )}
                    {image.is_primary && <span className="primary-badge">Ảnh chính</span>}
                    <button 
                      type="button" 
                      className="admin-btn small danger"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 