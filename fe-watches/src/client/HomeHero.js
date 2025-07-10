import React, { useEffect, useState } from 'react';
import { CONTENT_ENDPOINTS } from '@/config/api';
import './static/HomeHero.css';

export default function HomeHero() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(CONTENT_ENDPOINTS.BANNERS_ALL)
      .then(res => res.json())
      .then(data => {
        const homeBanner = data.find(
          b => b.display_order === 1 && b.banner_location === 'homepage'
        );
        setBanner(homeBanner);
      });
  }, []);

  return (
    <section className="home-hero">
      <div className="home-hero__main" style={{paddingTop: '90px'}}>
        {banner && banner.image ? (
          <img className="home-hero__img" src={banner.image} alt={banner.title || 'Banner'} />
        ) : (
          <div style={{height: 800, background: '#222', width: '100vw'}} />
        )}
        <div className="home-hero__info">
          <h2 className="home-hero__brand">{banner?.title || ''}</h2>
          <div className="home-hero__model">{banner?.alt_text || ''}</div>
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
