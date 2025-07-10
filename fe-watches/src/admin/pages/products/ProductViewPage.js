import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '@/services/permission';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

export default function ProductViewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productAttributes, setProductAttributes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch product với đầy đủ thông tin
        const productRes = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (productRes.ok) {
          const data = await productRes.json();
          setProduct(data);
        } else {
          setError('Không tìm thấy sản phẩm');
        }

        // Fetch variants của sản phẩm
        const variantsRes = await fetch(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(id), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (variantsRes.ok) {
          const variantsData = await variantsRes.json();
          setVariants(Array.isArray(variantsData) ? variantsData : []);
          
          // Lấy thông tin attributes từ variants
          const allAttributes = [];
          variantsData.forEach(variant => {
            if (variant.attribute_values_detail) {
              variant.attribute_values_detail.forEach(attr => {
                allAttributes.push({
                  attribute_type_name: attr.attribute_type.name,
                  value: attr.value,
                  variant_id: variant.id
                });
              });
            }
          });
          setAttributes(allAttributes);
        }

      } catch (error) {
        setError('Lỗi khi tải dữ liệu');
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Hàm lấy url ảnh đúng
  const getImageUrl = (img) => {
    const url = img?.image_url || img?.image || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  if (!hasModulePermission('product', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem sản phẩm.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!product) return null;

  return (
    <div className="admin-group-view">
      <h2>Chi tiết sản phẩm</h2>
      
      {/* Thông tin cơ bản */}
      <div className="form-section">
        <h3>Thông tin cơ bản</h3>
        <div><b>ID:</b> {product.id}</div>
        <div><b>Tên sản phẩm:</b> {product.name}</div>
        <div><b>Mô tả:</b> {product.description}</div>
        <div><b>Thương hiệu:</b> {product.brand_detail?.name || product.brand}</div>
        <div><b>Danh mục:</b> {product.category_detail?.name || product.category}</div>
        <div><b>Giá gốc:</b> {product.base_price} VND</div>
        <div><b>Bảo hành:</b> {product.warranty_period} tháng</div>
        <div><b>Slug:</b> {product.slug}</div>
        <div><b>Meta title:</b> {product.meta_title}</div>
        <div><b>Meta description:</b> {product.meta_description}</div>
        <div><b>SKU:</b> {product.sku}</div>
        <div><b>Nổi bật:</b> {product.is_featured ? 'Có' : 'Không'}</div>
        <div><b>Trạng thái:</b> {product.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      </div>

      {/* Ảnh sản phẩm */}
      {Array.isArray(product.images) && product.images.length > 0 && (
        <div className="form-section">
          <h3>Ảnh sản phẩm</h3>
          <div className="product-images-grid">
            {product.images.map((img, idx) => {
              const url = getImageUrl(img);
              if (!url) return null;
              return (
                <div key={img.id || idx} className="product-image-item" style={{border: img.is_primary ? '2px solid #4CAF50' : ''}}>
                  <img src={url} alt={img.alt_text || 'Product image'} />
                  {img.is_primary && <span className="primary-badge">Ảnh chính</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Thuộc tính sản phẩm */}
      {/* {attributes.length > 0 && (
        <div className="form-section">
          <h3>Thuộc tính sản phẩm</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Loại thuộc tính</th>
                <th>Giá trị</th>
                <th>Biến thể</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td>{attr.attribute_type_name || 'N/A'}</td>
                  <td>{attr.value || 'N/A'}</td>
                  <td>{variants.find(v => v.id === attr.variant_id)?.sku || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}

      {/* Biến thể sản phẩm */}
      {variants.length > 0 && (
        <div className="form-section">
          <h3>Biến thể sản phẩm</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Giá điều chỉnh</th>
                <th>Ngưỡng cảnh báo</th>
                <th>Mã vạch</th>
                <th>Trạng thái</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="admin-btn" onClick={() => navigate('/admin/products')}>Quay lại</button>
    </div>
  );
} 