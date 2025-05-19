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
  const [productAttributes, setProductAttributes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch product
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

        // Fetch variants
        const variantsRes = await fetch(`http://localhost:8000/api/products/product-variants/?product=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (variantsRes.ok) {
          const variantsData = await variantsRes.json();
          setVariants(variantsData.results || variantsData);

          // Fetch attributes for each variant
          for (const variant of (variantsData.results || variantsData)) {
            const attributesRes = await fetch(`http://localhost:8000/api/products/product-variant-attributes/?product_variant=${variant.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (attributesRes.ok) {
              const attributesData = await attributesRes.json();
              const attributes = attributesData.results || attributesData;
              setSelectedAttributes(prev => [...prev, ...attributes.map(attr => ({
                typeId: attr.attribute_value.attribute_type,
                valueId: attr.attribute_value.id
              }))]);
            }
          }
        }

        // Fetch product attributes
        const attributesRes = await fetch(`http://localhost:8000/api/products/product-variant-attributes/?product_variant__product=${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (attributesRes.ok) {
          const attributesData = await attributesRes.json();
          setProductAttributes(attributesData.results || attributesData);
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

  const handleRemoveVariant = async (variantId) => {
    if (!window.confirm('Bạn có chắc muốn xóa biến thể này?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/product-variants/${variantId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVariants(variants.filter(v => v.id !== variantId));
      } else {
        setError('Xóa biến thể thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const handleRemoveAttribute = async (attributeId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thuộc tính này?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/product-variant-attributes/${attributeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProductAttributes(prev => prev.filter(attr => attr.id !== attributeId));
      } else {
        setError('Xóa thuộc tính thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!form.name || !form.brand || !form.category || !form.base_price || !form.slug) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc: Tên, Thương hiệu, Danh mục, Giá gốc, Slug.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // 1. Cập nhật sản phẩm
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

      const productRes = await fetch(`http://localhost:8000/api/products/products/${id}/update_with_images/`, {
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

      // 2. Cập nhật các biến thể
      for (const variant of variants) {
        if (variant.id) {
          // Cập nhật biến thể hiện có
          const variantRes = await fetch(`http://localhost:8000/api/products/product-variants/${variant.id}/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product_id: id,
              sku: variant.sku,
              price_adjustment: variant.price_adjustment,
              stock_alert_threshold: variant.stock_alert_threshold,
              barcode: variant.barcode,
              is_active: variant.is_active
            })
          });

          if (!variantRes.ok) {
            throw new Error('Cập nhật biến thể thất bại');
          }
        } else {
          // Tạo biến thể mới
          const variantRes = await fetch('http://localhost:8000/api/products/product-variants/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              product_id: id,
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

          // Tạo các thuộc tính cho biến thể mới
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
      }

      if (imageFiles.length > 0) {
        setImageFiles([]);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
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
          
          {/* Hiển thị thuộc tính hiện tại */}
          {productAttributes.length > 0 && (
            <div className="current-attributes">
              <h4>Thuộc tính hiện tại</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Loại thuộc tính</th>
                    <th>Giá trị</th>
                    <th>Biến thể</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {productAttributes.map((attr, index) => (
                    <tr key={index}>
                      <td>{attr.attribute_value?.attribute_type_name || 'N/A'}</td>
                      <td>{attr.attribute_value?.value || 'N/A'}</td>
                      <td>{variants.find(v => v.id === attr.product_variant)?.sku || 'N/A'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={() => handleRemoveAttribute(attr.id)}
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

          {/* Form thêm thuộc tính mới */}
          <div className="add-attributes">
            <h4>Thêm thuộc tính mới</h4>
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

          {/* Danh sách biến thể */}
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
                    <tr key={variant.id || index}>
                      <td>{variant.sku}</td>
                      <td>{variant.price_adjustment}</td>
                      <td>{variant.stock_alert_threshold}</td>
                      <td>{variant.barcode}</td>
                      <td>{variant.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={() => handleRemoveVariant(variant.id)}
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

        <button type="submit" className="admin-btn primary">Cập nhật</button>
        <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Hủy</button>
        {error && <div className="admin-error">{error}</div>}
      </form>
    </div>
  );
} 