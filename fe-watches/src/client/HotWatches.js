import React, { useState, useEffect } from 'react';
import { CONTENT_ENDPOINTS } from '../config/api';
import './static/HotWatches.css';

export default function HotWatches() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(CONTENT_ENDPOINTS.BANNERS_ALL);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu banner');
        }
        const data = await response.json();
        // Sắp xếp banner theo display_order
        const sortedBanners = data.sort((a, b) => a.display_order - b.display_order);
        setBanners(sortedBanners);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <section className="hot-watches">
      <h3 className="hot-watches__title">HÀNG HOT SIÊU ĐẸP</h3>
      <div className="hot-watches__list">
        {banners.map((banner) => (
          <div key={banner.id} className="hot-watches__item">
            <img 
              src={banner.image} 
              alt={banner.alt_text || banner.title} 
              title={banner.title}
            />
          </div>
        ))}
      </div>
    </section>
  );
} 