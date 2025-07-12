import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useAccessControl, useApiCall } from '@/admin/hooks';
import { AccessDeniedAlert } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

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

  // Chuẩn hóa kiểm tra quyền truy cập
  const { hasAccess, checkModulePermission } = useAccessControl('product', 'edit');

  // Hook quản lý API calls
  const { get, put } = useApiCall();

  // Thêm các hàm tiện ích
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0.00";
    return Number(price).toFixed(2);
  };

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      const result = await get(
        `${PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)}`,
        {},
        'Lỗi khi lấy thông tin sản phẩm'
      );

      if (result.success) {
        const data = result.data;
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
        setError('Không lấy được thông tin sản phẩm');
      }
    } catch (error) {
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [id, hasAccess, get]);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        PRODUCT_ENDPOINTS.BRANDS_LIST_ALL,
        {},
        'Lỗi khi tải danh sách thương hiệu'
      );

      if (result.success) {
        setBrands(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  }, [hasAccess, get]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        PRODUCT_ENDPOINTS.CATEGORIES_LIST_ALL,
        {},
        'Lỗi khi tải danh sách danh mục'
      );

      if (result.success) {
        setCategories(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [hasAccess, get]);

  // Fetch attribute types
  const fetchAttributeTypes = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        PRODUCT_ENDPOINTS.ATTRIBUTE_TYPES_LIST_ALL,
        {},
        'Lỗi khi tải danh sách loại thuộc tính'
      );

      if (result.success) {
        const data = result.data;
        setAttributeTypes(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Error fetching attribute types:', error);
    }
  }, [hasAccess, get]);

  // Fetch attribute values
  const fetchAttributeValues = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        PRODUCT_ENDPOINTS.ATTRIBUTE_VALUES_LIST_ALL,
        {},
        'Lỗi khi tải danh sách giá trị thuộc tính'
      );

      if (result.success) {
        const data = result.data;
        setAttributeValues(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Error fetching attribute values:', error);
    }
  }, [hasAccess, get]);

  // Fetch current product attributes
  const fetchProductAttributes = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        `${PRODUCT_ENDPOINTS.PRODUCT_ATTRIBUTES(id)}`,
        {},
        'Lỗi khi tải thuộc tính sản phẩm'
      );

      if (result.success) {
        const attributesData = result.data;
        
        // Chuyển đổi cấu trúc dữ liệu cho selectedAttributeValues
        const groupedValues = {};
        attributesData.forEach(type => {
          groupedValues[type.id] = type.values;
        });
        setSelectedAttributeValues(groupedValues);
      }
    } catch (error) {
      console.error('Error fetching product attributes:', error);
    }
  }, [id, hasAccess, get]);

  // Initialize data
  useEffect(() => {
    if (hasAccess) {
      fetchProduct();
      fetchBrands();
      fetchCategories();
      fetchAttributeTypes();
      fetchAttributeValues();
      fetchProductAttributes();
    }
  }, [hasAccess, fetchProduct, fetchBrands, fetchCategories, fetchAttributeTypes, fetchAttributeValues, fetchProductAttributes]);

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
      const res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_IMAGE_DETAIL(imageId)}`, {
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
      const res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_SET_PRIMARY_IMAGE(id)}`, {
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
    const value = attributeValues.find(v => v.id === Number(valueId));
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

    // Kiểm tra quyền edit trước khi submit
    if (!checkModulePermission('product', 'edit')) {
      setError('Bạn không có quyền chỉnh sửa sản phẩm.');
      return;
    }

    try {
      let result;
      
      if (imageFiles.length > 0) {
        // Có upload ảnh, dùng FormData và fetch trực tiếp
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

        // Thêm ảnh mới
        imageFiles.forEach((file, idx) => {
          formData.append(`images`, file);
        });
        formData.append('primary_image_index', primaryImageIndex);

        // Prepare payload with attribute_value_groups
        const attributeValueGroups = Object.entries(selectedAttributeValues).map(
          ([typeId, values]) => values.map(v => Number(v.id))
        );
        formData.append('attribute_value_groups', JSON.stringify(attributeValueGroups));

        // Gửi request bằng fetch trực tiếp
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // KHÔNG set Content-Type để trình duyệt tự set cho FormData
          },
          body: formData
        });
        
        const data = await response.json();
        result = { success: response.ok, data, error: data };
      } else {
        // Không upload ảnh, gửi JSON
        const payload = {
          name: form.name,
          description: form.description,
          category: form.category,
          brand: form.brand,
          base_price: formatPrice(form.base_price),
          warranty_period: form.warranty_period || '',
          meta_title: form.meta_title,
          meta_description: form.meta_description,
          slug: form.slug,
          is_featured: form.is_featured,
          is_active: form.is_active,
          attribute_value_groups: Object.entries(selectedAttributeValues).map(
            ([typeId, values]) => values.map(v => Number(v.id))
          )
        };

        result = await put(
          `${PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)}`,
          payload,
          'Lỗi khi cập nhật sản phẩm'
        );
      }

      if (result.success) {
        message.success('Cập nhật sản phẩm thành công');
        navigate('/admin/products');
      } else {
        // Xử lý lỗi từ response
        if (result.error && Array.isArray(result.error)) {
          // Nếu lỗi là array (thường là validation errors)
          setError(result.error.join(', '));
        } else if (result.error && typeof result.error === 'object') {
          // Nếu lỗi là object, lấy message đầu tiên
          const errorMessages = Object.values(result.error).flat();
          setError(errorMessages.join(', '));
        } else if (result.error && typeof result.error === 'string') {
          // Nếu lỗi là string
          setError(result.error);
        } else {
          setError('Cập nhật thất bại');
        }
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
    }
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-form-container">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="product"
        action="edit"
        showUserInfo={true}
      />

      <h2>Chỉnh sửa sản phẩm</h2>
      
      {error && (
        <div className="admin-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

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
                            {Array.isArray(attributeValues) && attributeValues
                              .filter(value => value.attribute_type === type.id)
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
                            onClick={() => {
                              const select = document.querySelector(`select[onChange*="${type.id}"]`);
                              if (select) handleAttributeSelect(type.id, select.value);
                            }}
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
      </form>
    </div>
  );
} 