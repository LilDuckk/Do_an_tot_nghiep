import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { formatDate } from '@/utils/formatters';
import Header from './Header';
import Footer from './Footer';
import '@/client/static/News.css';

export default function NewsDetail() {
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { slug } = useParams();

  // Fetch news detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Find news by slug
        const response = await fetch(CONTENT_ENDPOINTS.NEWS);
        if (response.ok) {
          const data = await response.json();
          const newsItem = data.results?.find(item => item.slug === slug);
          
          if (newsItem) {
            setNews(newsItem);
            
            // Fetch related news from same category
            if (newsItem.category) {
              const relatedResponse = await fetch(
                `${CONTENT_ENDPOINTS.NEWS}?category=${newsItem.category}&page_size=4`
              );
              if (relatedResponse.ok) {
                const relatedData = await relatedResponse.json();
                const filtered = relatedData.results?.filter(item => item.id !== newsItem.id) || [];
                setRelatedNews(filtered.slice(0, 3));
              }
            }
          } else {
            setError('Không tìm thấy tin tức');
          }
        } else {
          setError('Có lỗi xảy ra khi tải tin tức');
        }
      } catch (error) {
        console.error('Error fetching news detail:', error);
        setError('Có lỗi xảy ra khi tải tin tức');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="news-detail-page">
          <div className="container">
            <div className="news-detail-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải tin tức...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !news) {
    return (
      <>
        <Header />
        <div className="news-detail-page">
          <div className="container">
            <div className="news-detail-error">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Không tìm thấy tin tức</h2>
              <p>{error || 'Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
              <Link to="/news" className="error-back-btn">
                <i className="fas fa-arrow-left"></i>
                Quay lại trang tin tức
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="news-detail-page">
      {/* Breadcrumb */}
      <div className="news-breadcrumb">
        <div className="container">
          <nav className="breadcrumb-nav">
            <Link to="/" className="breadcrumb-item">Trang chủ</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/news" className="breadcrumb-item">Tin tức</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">{news.title}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="news-detail-content">
          {/* Main Article */}
          <article className="news-detail-main">
            {/* Article Header */}
            <header className="news-detail-header">
              <div className="news-detail-meta">
                <span className="news-category">
                  {news.category_details?.name || 'Chưa phân loại'}
                </span>
                <span className="news-date">
                  <i className="fas fa-calendar-alt"></i>
                  {formatDate(news.created_at)}
                </span>
                {news.view_count && (
                  <span className="news-views">
                    <i className="fas fa-eye"></i>
                    {news.view_count} lượt xem
                  </span>
                )}
              </div>
              
              <h1 className="news-detail-title">{news.title}</h1>
              
              {news.summary && (
                <p className="news-detail-summary">{news.summary}</p>
              )}
            </header>

            {/* Featured Image */}
            {news.featured_image && (
              <div className="news-detail-image">
                <img src={news.featured_image} alt={news.title} />
              </div>
            )}

            {/* Article Content */}
            <div className="news-detail-body">
              <div className="news-content-text">
                {news.content?.split('\n').map((paragraph, index) => (
                  <p key={index} className="news-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Article Footer */}
            <footer className="news-detail-footer">
              <div className="news-detail-tags">
                <span className="news-tag">
                  <i className="fas fa-tag"></i>
                  {news.category_details?.name || 'Tin tức'}
                </span>
                {news.meta_title && (
                  <span className="news-tag">
                    <i className="fas fa-tag"></i>
                    {news.meta_title}
                  </span>
                )}
              </div>
              
              <div className="news-detail-share">
                <span className="share-label">Chia sẻ:</span>
                <div className="share-buttons">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn twitter"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn linkedin"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </footer>
          </article>

          {/* Sidebar */}
          <aside className="news-detail-sidebar">
            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="news-related-section">
                <h3>Tin tức liên quan</h3>
                <div className="news-related-list">
                  {relatedNews.map((item) => (
                    <div key={item.id} className="news-related-item">
                      <div className="news-related-image">
                        {item.featured_image ? (
                          <img src={item.featured_image} alt={item.title} />
                        ) : (
                          <div className="news-placeholder-image">
                            <i className="fas fa-newspaper"></i>
                          </div>
                        )}
                      </div>
                      <div className="news-related-content">
                        <h4 className="news-related-title">
                          <Link to={`/news/${item.slug}`}>
                            {truncateText(item.title, 60)}
                          </Link>
                        </h4>
                        <p className="news-related-date">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to News */}
            <div className="news-back-section">
              <Link to="/news" className="news-back-btn">
                <i className="fas fa-arrow-left"></i>
                Quay lại trang tin tức
              </Link>
            </div>
          </aside>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
} 