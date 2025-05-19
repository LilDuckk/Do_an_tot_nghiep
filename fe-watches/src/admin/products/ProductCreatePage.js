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

  // States cho thuộc tính và biến thể
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    sku: '',
    price_adjustment: '',
    stock_alert_threshold: '',
    barcode: '',
    is_active: true,
    attributes: []
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const navigate = useNavigate();

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
        const typesRes = await fetch('http://localhost:8000/api/products/attributestype/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (typesRes.ok) {
          setAttributeTypes(await typesRes.json());
        }

        // Fetch attribute values
        const valuesRes = await fetch('http://localhost:8000/api/products/attributesvalue/list_all/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (valuesRes.ok) {
          setAttributeValues(await valuesRes.json());
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

  // Xử lý thuộc tính
  const handleAttributeSelect = (typeId, valueId) => {
    const existingIndex = selectedAttributes.findIndex(attr => attr.typeId === typeId);
    if (existingIndex >= 0) {
      const newAttributes = [...selectedAttributes];
      newAttributes[existingIndex].valueId = valueId;
      setSelectedAttributes(newAttributes);
    } else {
      setSelectedAttributes([...selectedAttributes, { typeId, valueId }]);
    }
  };

  // Xử lý biến thể
  const handleVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVariant(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddVariant = () => {
    if (!newVariant.sku) {
      setError('Vui lòng nhập SKU cho biến thể');
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({
      sku: '',
      price_adjustment: '',
      stock_alert_threshold: '',
      barcode: '',
      is_active: true,
      attributes: []
    });
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.brand || !form.category || !form.base_price || !form.slug) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Thương hiệu, Danh mục, Giá gốc.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // 1. Tạo sản phẩm
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      imageFiles.forEach((file, idx) => {
        formData.append('images', file);
      });
      formData.append('primary_image_index', primaryImageIndex);

      const productRes = await fetch('http://localhost:8000/api/products/products/create_with_images/', {
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

      const productData = await productRes.json();
      const productId = productData.id;

      // 2. Tạo các biến thể
      for (const variant of variants) {
        const variantRes = await fetch('http://localhost:8000/api/products/product-variants/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: productId,
            sku: variant.sku,
            price_adjustment: variant.price_adjustment,
            stock_alert_threshold: variant.stock_alert_threshold,
            barcode: variant.barcode,
            is_active: variant.is_active
          })
        });

        if (!variantRes.ok) {
          throw new Error('Tạo biến thể thất bại');
        }

        const variantData = await variantRes.json();

        // 3. Tạo các thuộc tính cho biến thể
        for (const attr of selectedAttributes) {
          await fetch('http://localhost:8000/api/products/product-variant-attributes/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product_variant: variantData.id,
              attribute_value: attr.valueId
            })
          });
        }
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
          {attributeTypes.map(type => (
            <div key={type.id} className="attribute-group">
              <label>{type.name}</label>
              <select
                value={selectedAttributes.find(attr => attr.typeId === type.id)?.valueId || ''}
                onChange={(e) => handleAttributeSelect(type.id, e.target.value)}
              >
                <option value="">-- Chọn giá trị --</option>
                {attributeValues
                  .filter(value => value.attribute_type === type.id)
                  .map(value => (
                    <option key={value.id} value={value.id}>
                      {value.value}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        {/* Biến thể sản phẩm */}
        <div className="form-section">
          <h3>Biến thể sản phẩm</h3>
          <div className="variant-form">
            <input
              name="sku"
              value={newVariant.sku}
              onChange={handleVariantChange}
              placeholder="SKU biến thể"
              required
            />
            <input
              name="price_adjustment"
              value={newVariant.price_adjustment}
              onChange={handleVariantChange}
              placeholder="Giá điều chỉnh"
              type="number"
            />
            <input
              name="stock_alert_threshold"
              value={newVariant.stock_alert_threshold}
              onChange={handleVariantChange}
              placeholder="Ngưỡng cảnh báo tồn kho"
              type="number"
            />
            <input
              name="barcode"
              value={newVariant.barcode}
              onChange={handleVariantChange}
              placeholder="Mã vạch"
            />
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={newVariant.is_active}
                onChange={handleVariantChange}
              /> Hiển thị
            </label>
            <button type="button" className="admin-btn" onClick={handleAddVariant}>
              Thêm biến thể
            </button>
          </div>

          {/* Danh sách biến thể đã thêm */}
          {variants.length > 0 && (
            <div className="variants-list">
              <h4>Danh sách biến thể</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Giá điều chỉnh</th>
                    <th>Ngưỡng cảnh báo</th>
                    <th>Mã vạch</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => (
                    <tr key={index}>
                      <td>{variant.sku}</td>
                      <td>{variant.price_adjustment}</td>
                      <td>{variant.stock_alert_threshold}</td>
                      <td>{variant.barcode}</td>
                      <td>{variant.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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