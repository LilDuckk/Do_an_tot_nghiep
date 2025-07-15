import React from 'react';
import { useBannerContext } from './contexts/BannerContext';
import { API_BASE_URL } from '@/config/api';
import './static/HomeHero.css';

export default function HomeHero() {
  const { banners, loading, error } = useBannerContext();

  if (loading) {
    return (
      <section className="home-hero">
        <div className="home-hero__main" style={{paddingTop: '90px'}}>
          <div style={{height: 800, background: '#222', width: '100vw'}} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="home-hero">
        <div className="home-hero__main" style={{paddingTop: '90px'}}>
          <div style={{height: 800, background: '#222', width: '100vw'}} />
        </div>
      </section>
    );
  }

  // Lọc banner cho homepage và sắp xếp theo display_order
  const homeBanners = banners
    .filter(b => b.banner_location === 'homepage' && b.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  
  const homeBanner = homeBanners[0]; // Lấy banner đầu tiên

  // Tạo base URL từ API_BASE_URL
  const baseUrl = API_BASE_URL.replace('/api', '');

  return (
    <section className="home-hero">
      <div className="home-hero__main" style={{paddingTop: '90px'}}>
        {homeBanner && homeBanner.image_url ? (
          <img 
            className="home-hero__img" 
            src={`${baseUrl}${homeBanner.image_url}`}
            alt={homeBanner.alt_text || homeBanner.title || 'Banner'} 
          />
        ) : (
          <div style={{height: 800, background: '#222', width: '100vw'}} />
        )}
        <div className="home-hero__info">
          <h2 className="home-hero__brand">{homeBanner?.title || ''}</h2>
          <div className="home-hero__model">{homeBanner?.alt_text || ''}</div>
          <button className="home-hero__cta">XEM TẤT CẢ</button>
        </div>
      </div>
      <div className="home-hero__services">
        <div className="service"><span role="img" aria-label="check">✔️</span> Đa dạng mẫu mã</div>
        <div className="service"><span role="img" aria-label="truck">🚚</span> Miễn phí vận chuyển</div>
        <div className="service"><span role="img" aria-label="refresh">🔄</span> Đổi trả trong 7 ngày</div>
        <div className="service"><span role="img" aria-label="shield">🛡️</span> Bảo hành 5 năm</div>
      </div>
    </section>
  );
}
