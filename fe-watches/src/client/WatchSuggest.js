import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '../config/api';
import './static/WatchSuggest.css';

export default function WatchSuggest() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hàm random 4 sản phẩm
  const getRandomProducts = (productList) => {
    const shuffled = [...productList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // Hàm thay đổi sản phẩm với hiệu ứng
  const changeProducts = () => {
    if (allProducts.length === 0) return;
    
    setIsTransitioning(true);
    
    // Đợi hiệu ứng fade out hoàn thành
    setTimeout(() => {
      const newProducts = getRandomProducts(allProducts);
      setProducts(newProducts);
      
      // Đợi một chút rồi fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  // Hàm xử lý click vào sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu sản phẩm');
        }
        const data = await response.json();
        
        // Lưu tất cả sản phẩm
        setAllProducts(data);
        
        // Lấy 4 sản phẩm ngẫu nhiên ban đầu
        const initialProducts = getRandomProducts(data);
        setProducts(initialProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Tự động thay đổi sản phẩm mỗi 5 giây
  useEffect(() => {
    if (allProducts.length === 0) return;

    const interval = setInterval(() => {
      changeProducts();
    }, 10000);

    return () => clearInterval(interval);
  }, [allProducts]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <section className="watch-suggest">
      <h4 className="watch-suggest__title">CHỌN ĐỒNG HỒ PHÙ HỢP</h4>
      <div className="watch-suggest__desc">VIET&CO. giúp bạn chọn đồng hồ phù hợp với phong cách, cá tính và nhu cầu sử dụng.</div>
      
      <div className="watch-suggest__controls">
        <button 
          className="watch-suggest__refresh-btn"
          onClick={changeProducts}
          disabled={isTransitioning}
        >
          <span className="refresh-icon">🔄</span>
          Đổi sản phẩm
        </button>
      </div>
      
      <div className={`watch-suggest__list ${isTransitioning ? 'transitioning' : ''}`}>
        {products.map((product, index) => {
          // Lấy ảnh chính từ primary_image_index hoặc ảnh đầu tiên
          const primaryImageIndex = product.primary_image_index || 0;
          const primaryImage = product.images?.[primaryImageIndex] || product.images?.[0];
          
          return (
            <div 
              className="watch-suggest__item" 
              key={`${product.id}-${Date.now()}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleProductClick(product.id)}
            >
              <img 
                src={primaryImage?.image || 'https://i.imgur.com/1Q9Z1Zm.png'} 
                alt={primaryImage?.alt_text || product.name} 
              />
              <div className="watch-suggest__label">{product.name}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 