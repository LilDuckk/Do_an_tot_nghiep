import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';


export default function ProductViewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`http://localhost:8000/api/products/products/${id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setProduct(await res.json());
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch {
        setError('Lỗi kết nối');
      }
      setLoading(false);
    };
    fetchProduct();
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
      <div><b>ID:</b> {product.id}</div>
      <div><b>Tên sản phẩm:</b> {product.name}</div>
      <div><b>Mô tả:</b> {product.description}</div>
      <div><b>Thương hiệu:</b> {product.brand}</div>
      <div><b>Danh mục:</b> {product.category}</div>
      <div><b>Giá gốc:</b> {product.base_price} VND</div>
      <div><b>Bảo hành:</b> {product.warranty_period} tháng</div>
      <div><b>Slug:</b> {product.slug}</div>
      <div><b>Meta title:</b> {product.meta_title}</div>
      <div><b>Meta description:</b> {product.meta_description}</div>
      <div><b>SKU:</b> {product.sku}</div>
      <div><b>Nổi bật:</b> {product.is_featured ? 'Có' : 'Không'}</div>
      <div><b>Trạng thái:</b> {product.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      {Array.isArray(product.images) && product.images.length > 0 && (
        <div className="product-images-section">
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
      <button className="admin-btn" onClick={() => navigate('/admin/products')}>Quay lại</button>
    </div>
  );
} 