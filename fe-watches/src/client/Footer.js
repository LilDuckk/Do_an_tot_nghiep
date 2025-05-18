import React, { useEffect, useState } from 'react';
import './static/Footer.css';

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkRes, catRes] = await Promise.all([
          fetch('http://localhost:8000/api/content/footer-links/all/'),
          fetch('http://localhost:8000/api/content/footer-categories/all/')
        ]);
        if (!linkRes.ok || !catRes.ok) throw new Error('API trả về lỗi');
        const linkData = await linkRes.json();
        const catData = await catRes.json();
        console.log('catData:', catData);
        console.log('linkData:', linkData);
        setCategories(Array.isArray(catData) ? catData : (catData.results || []));
        setLinks(Array.isArray(linkData) ? linkData : (linkData.results || []));
      } catch (err) {
        console.error('Footer fetch error:', err);
        setError('Lỗi khi tải dữ liệu footer');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Đang tải footer...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  // Lọc và sắp xếp category
  const activeCategories = categories.filter(c => c.is_active).sort((a, b) => a.display_order - b.display_order);
  // Lọc và sắp xếp link
  const activeLinks = links.filter(l => l.is_active).sort((a, b) => a.display_order - b.display_order);

  // Tách các category cửa hàng (display_order 3,4,5)
  const storeCategories = activeCategories.filter(c => [3,4,5].includes(c.display_order));
  const infoCategories = activeCategories.filter(c => ![3,4,5,6,7].includes(c.display_order));
  const contactCategories = activeCategories.filter(c => [6,7].includes(c.display_order));

  // Render cột thông tin
  const renderInfoCols = () => infoCategories.map(cat => (
    <div className="footer__col" key={cat.id}>
      <div className="footer__col-title">{cat.name}</div>
      <ul>
        {activeLinks.filter(l => l.category && l.category.id === cat.id).map(link => (
          <li key={link.id}>
            {link.url ? <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a> : link.title}
          </li>
        ))}
      </ul>
    </div>
  ));

  // Render cột cửa hàng
  const renderStoreCol = () => (
    <div className="footer__col footer__col--region">
      {storeCategories.map(cat => (
        <React.Fragment key={cat.id}>
          <div className="footer__col-title">{cat.name}</div>
          <ul>
            {activeLinks.filter(l => l.category && l.category.id === cat.id).map(link => (
              <li key={link.id}>
                <span className="footer__icon">📍</span> {link.title}
                {link.url && <><br /><span className="footer__sub">{link.url}</span></>}
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </div>
  );

  // Render cột liên hệ và mạng xã hội động
  const renderContactCols = () => contactCategories.map(cat => (
    <div className="footer__col" key={cat.id}>
      <div className="footer__col-title">{cat.name}</div>
      <ul>
        {activeLinks.filter(l => l.category && l.category.id === cat.id).map(link => (
          <li key={link.id}>
            {link.url ? <a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a> : link.title}
          </li>
        ))}
      </ul>
    </div>
  ));

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__col-group">
          {renderInfoCols()}
          {renderStoreCol()}
          {renderContactCols()}
        </div>
      </div>
      <div className="footer__copyright">
        ©2020-2025 by VietCo.vn. Hotline: 099.999.9999
      </div>
    </footer>
  );
} 