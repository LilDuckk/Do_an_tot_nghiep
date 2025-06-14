import React, { useState, useEffect } from 'react';
import { PRODUCT_ENDPOINTS } from '../config/api';
import './static/WatchSuggest.css';

export default function WatchSuggest() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu sản phẩm');
        }
        const data = await response.json();
        
        // Lấy 4 sản phẩm ngẫu nhiên
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);
        
        setProducts(selected);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <section className="watch-suggest">
      <h4 className="watch-suggest__title">CHỌN ĐỒNG HỒ PHÙ HỢP</h4>
      <div className="watch-suggest__desc">VIET&CO. giúp bạn chọn đồng hồ phù hợp với phong cách, cá tính và nhu cầu sử dụng.</div>
      <div className="watch-suggest__list">
        {products.map((product) => (
          <div className="watch-suggest__item" key={product.id}>
            <img 
              src={product.images[0]?.image || ''} 
              alt={product.images[0]?.alt_text || product.name} 
            />
            <div className="watch-suggest__label">{product.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 