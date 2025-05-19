import React, { useState, useEffect, useCallback } from 'react';
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

  // States cho thuộc tính và biến thể
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [variants, setVariants] = useState([]);
  const [attributePriceAdjustments, setAttributePriceAdjustments] = useState({});

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const navigate = useNavigate();

  // Hàm tạo tổ hợp thuộc tính và cập nhật variants
  const updateVariantsFromAttributes = useCallback(() => {
    // Tạo các biến thể dựa trên các thuộc tính đã chọn
    const selectedValues = Object.entries(selectedAttributeValues).map(([typeId, values]) => 
      values.map(value => ({
        attribute_value: value.id,
        required: true,
        price_adjustment: attributePriceAdjustments[value.id] || "0"
      }))
    );

    // Tạo các tổ hợp thuộc tính
    const combinations = selectedValues.reduce((acc, curr) => {
      if (acc.length === 0) {
        return curr.map(item => [item]);
      }
      return acc.flatMap(combo => 
        curr.map(item => [...combo, item])
      );
    }, []);

    // Tạo biến thể cho mỗi tổ hợp
    const newVariants = combinations.map(combo => ({
      price_adjustment: "0.00",
      stock_alert_threshold: null,
      barcode: "",
      is_active: true,
      attributes: combo
    }));

    // Nếu không có thuộc tính nào được chọn, tạo một biến thể mặc định
    if (newVariants.length === 0) {
      newVariants.push({
        price_adjustment: "0.00",
        stock_alert_threshold: null,
        barcode: "",
        is_active: true,
        attributes: []
      });
    }

    setVariants(newVariants);
  }, [selectedAttributeValues, attributePriceAdjustments]);

  // Cập nhật variants khi thay đổi thuộc tính hoặc giá điều chỉnh
  useEffect(() => {
    updateVariantsFromAttributes();
  }, [updateVariantsFromAttributes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
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

        // Fetch attribute types
        const typesRes = await fetch('http://localhost:8000/api/products/attribute-types/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (typesRes.ok) {
          const data = await typesRes.json();
          setAttributeTypes(Array.isArray(data) ? data : data.results || []);
        }

        // Fetch attribute values
        const valuesRes = await fetch('http://localhost:8000/api/products/attribute-values/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (valuesRes.ok) {
          const data = await valuesRes.json();
          setAttributeValues(Array.isArray(data) ? data : data.results || []);
        }
      } catch (error) {
        setError('Lỗi khi tải dữ liệu');
      }
    };

    fetchData();
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

  // Cập nhật hàm xử lý thuộc tính
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

    // Khởi tạo giá điều chỉnh mặc định là 0
    setAttributePriceAdjustments(prev => ({
      ...prev,
      [value.id]: "0"
    }));
  };

  const handleRemoveAttributeValue = (typeId, valueId) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [typeId]: (prev[typeId] || []).filter(v => v.id !== valueId)
    }));

    // Xóa giá điều chỉnh khi xóa thuộc tính
    setAttributePriceAdjustments(prev => {
      const newAdjustments = { ...prev };
      delete newAdjustments[valueId];
      return newAdjustments;
    });
  };

  const handlePriceAdjustmentChange = (valueId, price) => {
    setAttributePriceAdjustments(prev => ({
      ...prev,
      [valueId]: price
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
      formData.append('category', form.brand);
      formData.append('brand', form.category);
      formData.append('base_price', form.base_price);
      formData.append('warranty_period', form.warranty_period || '');
      formData.append('meta_title', form.meta_title);
      formData.append('meta_description', form.meta_description);
      formData.append('is_featured', form.is_featured);
      formData.append('is_active', form.is_active);

      // Thêm ảnh
      imageFiles.forEach((file, idx) => {
        formData.append(`images[${idx}]`, file);
      });
      formData.append('primary_image_index', primaryImageIndex);

      // Chuẩn bị variants_data
      const variantsData = variants.map(variant => ({
        price_adjustment: variant.price_adjustment,
        stock_alert_threshold: variant.stock_alert_threshold,
        barcode: variant.barcode,
        is_active: variant.is_active,
        attributes: variant.attributes.map(attr => ({
          attribute_value: attr.attribute_value,
          required: attr.required,
          price_adjustment: attr.price_adjustment
        }))
      }));

      // Thêm variants_data vào FormData
      formData.append('variants_data', JSON.stringify(variantsData));

      const productRes = await fetch('http://localhost:8000/api/products/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!productRes.ok) {
        const data = await productRes.json();
        throw new Error(data.error || 'Tạo sản phẩm thất bại');
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Thêm sản phẩm mới</h2>
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
          <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" />
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
                      <th>Giá tiền điều chỉnh</th>
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
                            <input
                              type="number"
                              value={attributePriceAdjustments[value.id] || "0"}
                              onChange={(e) => handlePriceAdjustmentChange(value.id, e.target.value)}
                              placeholder="Giá điều chỉnh"
                            />
                          </td>
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
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 