import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import '../static/AdminCommon.css';

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // States cho form
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    base_price: '',
    warranty_period: '',
    meta_title: '',
    meta_description: '',
    slug: '',
    is_featured: false,
    is_active: true
  });

  // States cho UI và data khác
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // States cho thuộc tính sản phẩm
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});

  // Thêm các hàm tiện ích
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0.00";
    return Number(price).toFixed(2);
  };

  // Fetch data khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch product với đầy đủ thông tin
        const productRes = await fetch(`http://localhost:8000/api/products/products/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productRes.ok) {
          const data = await productRes.json();
          setForm({
            name: data.name || '',
            description: data.description || '',
            brand: data.brand || '',
            category: data.category || '',
            base_price: data.base_price || '',
            warranty_period: data.warranty_period || '',
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            slug: data.slug || '',
            is_featured: data.is_featured || false,
            is_active: data.is_active !== undefined ? data.is_active : true
          });
          setProductImages(Array.isArray(data.images) ? data.images : []);
        } else {
          setError('Không tìm thấy sản phẩm');
        }

        // Fetch brands
        const brandsRes = await fetch('http://localhost:8000/api/products/brands/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (brandsRes.ok) {
          setBrands(await brandsRes.json());
        }

        // Fetch categories
        const categoriesRes = await fetch('http://localhost:8000/api/products/categories/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }

        // Fetch current product attributes using new endpoint
        const attributesRes = await fetch(`http://localhost:8000/api/products/products/${id}/get_attributes/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (attributesRes.ok) {
          const attributesData = await attributesRes.json();
          setAttributeTypes(attributesData);
          
          // Chuyển đổi cấu trúc dữ liệu cho selectedAttributeValues
          const groupedValues = {};
          attributesData.forEach(type => {
            groupedValues[type.id] = type.values;
          });
          setSelectedAttributeValues(groupedValues);
        }
      } catch (error) {
        setError('Lỗi khi tải dữ liệu');
      }
      setLoading(false);
    };

    fetchData();
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
      const res = await fetch(`http://localhost:8000/api/products/products/${id}/set_primary_image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_id: imageId })
      });
      if (res.ok) {
        const data = await res.json();
        // Cập nhật lại danh sách ảnh với ảnh chính mới
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

  // Hàm lấy url ảnh đúng
  const getImageUrl = (img) => {
    const url = img.image_url || img.image || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  // Hàm xử lý thuộc tính
  const handleAttributeSelect = (typeId, valueId) => {
    if (!valueId) return;
    const type = attributeTypes.find(t => t.id === Number(typeId));
    if (!type) return;
    
    const value = type.values.find(v => v.id === Number(valueId));
    if (!value) return;

    setSelectedAttributeValues(prev => {
      const currentValues = prev[typeId] || [];
      if (currentValues.some(v => v.id === value.id)) return prev;
      return {
        ...prev,
        [typeId]: [...currentValues, value]
      };
    });
  };

  const handleRemoveAttributeValue = (typeId, valueId) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [typeId]: (prev[typeId] || []).filter(v => v.id !== valueId)
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.brand || !form.category || !form.base_price) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Thương hiệu, Danh mục, Giá gốc.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Tạo FormData
      const formData = new FormData();
      
      // Thêm các trường cơ bản
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('brand', form.brand);
      formData.append('base_price', formatPrice(form.base_price));
      formData.append('warranty_period', form.warranty_period || '');
      formData.append('meta_title', form.meta_title);
      formData.append('meta_description', form.meta_description);
      formData.append('slug', form.slug);
      formData.append('is_featured', form.is_featured);
      formData.append('is_active', form.is_active);

      // Thêm ảnh mới nếu có
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, idx) => {
          formData.append(`images`, file);
        });
        formData.append('primary_image_index', primaryImageIndex);
      }

      // Prepare payload with attribute_value_groups
      const attributeValueGroups = Object.entries(selectedAttributeValues).map(
        ([typeId, values]) => values.map(v => Number(v.id))
      );
      formData.append('attribute_value_groups', JSON.stringify(attributeValueGroups));

      const productRes = await fetch(`http://localhost:8000/api/products/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!productRes.ok) {
        const data = await productRes.json();
        throw new Error(data.error || 'Cập nhật sản phẩm thất bại');
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-form-container">
      <h2>Chỉnh sửa sản phẩm</h2>
      <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
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
          <label><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /> Sản phẩm nổi bật</label>
          <label><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Hiển thị</label>
        </div>

        {/* Ảnh sản phẩm */}
        <div className="form-section">
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

        {/* Thuộc tính sản phẩm */}
        <div className="form-section">
          <h3>Thuộc tính sản phẩm</h3>
          {Array.isArray(attributeTypes) && attributeTypes.length > 0 ? (
            <div className="attributes-container">
              {/* Bảng chọn giá trị thuộc tính */}
              <div className="attributes-selection">
                <h4>Chọn giá trị thuộc tính</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Loại thuộc tính</th>
                      <th>Giá trị</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributeTypes.map(type => (
                      <tr key={type.id}>
                        <td>{type.name}</td>
                        <td>
                          <select
                            value=""
                            onChange={(e) => handleAttributeSelect(type.id, e.target.value)}
                          >
                            <option value="">-- Chọn giá trị --</option>
                            {type.values
                              .filter(value => !selectedAttributeValues[type.id]?.some(v => v.id === value.id))
                              .map(value => (
                                <option key={value.id} value={value.id}>
                                  {value.value}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => handleAttributeSelect(type.id, document.querySelector(`select[data-type-id="${type.id}"]`).value)}
                          >
                            Thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bảng giá trị đã chọn */}
              <div className="selected-attributes">
                <h4>Giá trị thuộc tính đã chọn</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Loại thuộc tính</th>
                      <th>Giá trị</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedAttributeValues).map(([typeId, values]) => (
                      values.map(value => (
                        <tr key={`${typeId}-${value.id}`}>
                          <td>{attributeTypes.find(t => t.id === Number(typeId))?.name}</td>
                          <td>{value.value}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn danger"
                              onClick={() => handleRemoveAttributeValue(Number(typeId), value.id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p>Không có loại thuộc tính nào</p>
          )}
        </div>

        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 