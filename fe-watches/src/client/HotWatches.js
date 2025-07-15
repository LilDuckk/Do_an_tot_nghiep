import React from 'react';
import { useBannerContext } from './contexts/BannerContext';
import { API_BASE_URL } from '@/config/api';
import './static/HotWatches.css';

export default function HotWatches() {
  const { banners, loading, error } = useBannerContext();

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  // Lọc banner cho hot section và sắp xếp theo display_order
  const hotBanners = banners
    .filter(b => b.banner_location === 'hot' && b.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Tạo base URL từ API_BASE_URL
  const baseUrl = API_BASE_URL.replace('/api', '');

  return (
    <section className="hot-watches">
      <h3 className="hot-watches__title">HÀNG HOT SIÊU ĐẸP</h3>
      <div className="hot-watches__list">
        {hotBanners.map((banner) => (
          <div key={banner.id} className="hot-watches__item">
            <img 
              src={`${baseUrl}${banner.image_url}`}
              alt={banner.alt_text || banner.title} 
              title={banner.title}
            />
          </div>
        ))}
      </div>
    </section>
  );
} 