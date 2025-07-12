import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { useAccessControl, useApiCall } from '@/admin/hooks';
import { AccessDeniedAlert, ActionButtons } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

export default function ProductViewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Chuẩn hóa kiểm tra quyền truy cập
  const { hasAccess, checkModulePermission } = useAccessControl('product', 'view');

  // Hook quản lý API calls
  const { get } = useApiCall();

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
        setProduct(result.data);
      } else {
        setError('Không lấy được thông tin sản phẩm');
      }
    } catch (error) {
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [id, hasAccess, get]);

  // Fetch variants
  const fetchVariants = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const result = await get(
        PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(id),
        {},
        'Lỗi khi lấy danh sách biến thể'
      );

      if (result.success) {
        const variantsData = result.data;
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
      } else {
        setVariants([]);
        setAttributes([]);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
      setAttributes([]);
    }
  }, [id, hasAccess, get]);

  // Initialize data
  useEffect(() => {
    if (hasAccess) {
      fetchProduct();
      fetchVariants();
    }
  }, [hasAccess, fetchProduct, fetchVariants]);

  // Hàm lấy url ảnh đúng
  const getImageUrl = (img) => {
    const url = img?.image_url || img?.image || '';
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const handleEdit = useCallback(() => {
    navigate(`/admin/products/${id}/edit`);
  }, [navigate, id]);

  const handleBack = useCallback(() => {
    navigate('/admin/products');
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-group-view">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-group-view">
        <div className="admin-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
        <button className="admin-btn" onClick={handleBack}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-group-view">
        <div className="admin-error">Không tìm thấy sản phẩm</div>
        <button className="admin-btn" onClick={handleBack}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-group-view">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="product"
        action="view"
        showUserInfo={true}
      />

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

      <div className="admin-actions" style={{ marginTop: 20 }}>
        <ActionButtons
          record={product}
          onEdit={handleEdit}
          hasAccess={hasAccess}
          showView={false}
          showEdit={checkModulePermission('product', 'edit')}
          showDelete={false}
          additionalActions={[
            {
              key: 'back',
              title: 'Quay lại',
              onClick: handleBack,
              type: 'default',
              style: { borderColor: '#d9d9d9', color: '#666' }
            }
          ]}
        />
      </div>
    </div>
  );
} 