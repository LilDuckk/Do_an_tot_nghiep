import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useAccessControl, useApiCall } from '@/admin/hooks';
import { AccessDeniedAlert } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

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
    is_featured: false,
    is_active: true
  });

  // States cho thuộc tính và biến thể
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const navigate = useNavigate();

  // Chuẩn hóa kiểm tra quyền truy cập
  const { hasAccess, checkModulePermission } = useAccessControl('product', 'create');

  // Hook quản lý API calls
  const { get, post } = useApiCall();

  // Thêm các hàm tiện ích
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0.00";
    return Number(price).toFixed(2);
  };

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

  // Initialize data
  useEffect(() => {
    if (hasAccess) {
      fetchBrands();
      fetchCategories();
      fetchAttributeTypes();
      fetchAttributeValues();
    }
  }, [hasAccess, fetchBrands, fetchCategories, fetchAttributeTypes, fetchAttributeValues]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = e => {
    setImageFiles(Array.from(e.target.files));
    setPrimaryImageIndex(0);
  };

  // Hàm chọn thuộc tính
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

    // Kiểm tra quyền create trước khi submit
    if (!checkModulePermission('product', 'create')) {
      setError('Bạn không có quyền tạo sản phẩm mới.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('brand', form.brand);
      formData.append('base_price', formatPrice(form.base_price));
      formData.append('warranty_period', form.warranty_period || '');
      formData.append('slug', form.slug);
      formData.append('meta_title', form.meta_title);
      formData.append('meta_description', form.meta_description);
      formData.append('is_featured', form.is_featured);
      formData.append('is_active', form.is_active);
      imageFiles.forEach((file, idx) => {
        formData.append(`images`, file);
      });
      formData.append('primary_image_index', primaryImageIndex);

      // Prepare payload with attribute_value_groups
      const attributeValueGroups = Object.entries(selectedAttributeValues).map(
        ([typeId, values]) => values.map(v => Number(v.id)) // Đảm bảo số
      );
      
      // Convert to a JSON string that can be parsed by Python
      formData.append('attribute_value_groups', JSON.stringify(attributeValueGroups));

      const result = await post(
        PRODUCT_ENDPOINTS.PRODUCTS,
        formData,
        'Lỗi khi tạo sản phẩm'
      );

      if (result.success) {
        message.success('Tạo sản phẩm thành công');
        navigate('/admin/products');
      } else {
        setError('Tạo sản phẩm thất bại');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="product"
        action="create"
        showUserInfo={true}
      />

      <h2>Thêm sản phẩm mới</h2>
      
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

        <button type="submit" className="admin-btn primary">Thêm mới</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Hủy</button>
      </form>
    </div>
  );
}
