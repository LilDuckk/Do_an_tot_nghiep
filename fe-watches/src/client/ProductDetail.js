import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './static/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/products/products/${id}/`);
      const data = await response.json();
      setProduct(data);
      // Tìm index ảnh chính hoặc lấy index 0
      const primaryImageIndex = data.images.findIndex(img => img.is_primary);
      setCurrentImageIndex(primaryImageIndex !== -1 ? primaryImageIndex : 0);
    } catch (error) {
      console.error('Lỗi khi tải thông tin sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const handlePrevImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    if (!product?.images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">Đang tải thông tin sản phẩm...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="error">Không tìm thấy thông tin sản phẩm</div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || { image: 'https://i.imgur.com/1Q9Z1Zm.png' };

  return (
    <div>
      <Header />
      <div className="product-detail-container">
        <div className="product-detail-gallery">
          <div className="main-image">
            <img 
              src={currentImage.image || 'https://i.imgur.com/1Q9Z1Zm.png'} 
              alt={product.name} 
            />
            {images.length > 1 && (
              <>
                <button 
                  className="nav-button prev-button"
                  onClick={handlePrevImage}
                  aria-label="Ảnh trước"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button 
                  className="nav-button next-button"
                  onClick={handleNextImage}
                  aria-label="Ảnh sau"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="thumbnail-list">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={image.image} alt={image.alt_text || product.name} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <div className="product-detail-price">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.base_price)}
          </div>
          
          <div className="product-detail-desc">
            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </div>

          <ul className="product-detail-attrs">
            <li>
              <strong>Thương hiệu:</strong> {product.brand_detail.name}
            </li>
            <li>
              <strong>Danh mục:</strong> {product.category_detail.name}
            </li>
            <li>
              <strong>Bảo hành:</strong> {product.warranty_period} tháng
            </li>
            <li>
              <strong>Mã sản phẩm:</strong> {product.id}
            </li>
          </ul>

          <button className="contact-buy-btn" onClick={() => setShowForm(true)}>
            Liên hệ mua
          </button>

          {showForm && (
            <form className="contact-buy-form" onSubmit={e => e.preventDefault()}>
              <h4>Đăng ký mua hàng</h4>
              <input type="text" placeholder="Họ tên" required />
              <input type="tel" placeholder="Số điện thoại" required />
              <input type="email" placeholder="Email" />
              <textarea placeholder="Ghi chú" />
              <button type="submit">Gửi thông tin</button>
              <span className="close-form" onClick={() => setShowForm(false)}>Đóng</span>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 