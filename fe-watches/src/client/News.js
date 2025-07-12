import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { formatDate } from '@/utils/formatters';
import Header from './Header';
import Footer from './Footer';
import '@/client/static/News.css';

export default function News() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  
  // const { slug } = useParams();
  // const [searchParams, setSearchParams] = useSearchParams();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(CONTENT_ENDPOINTS.NEWS_CATEGORIES_ALL);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        let url = CONTENT_ENDPOINTS.NEWS;
        const params = new URLSearchParams();
        
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        
        params.append('page', currentPage);
        params.append('page_size', 12);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setNews(data.results || []);
          setTotalPages(Math.ceil(data.count / 12));
          setTotalNews(data.count);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory, searchTerm, currentPage]);

  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Chưa phân loại';
  };

  // Truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <Header />
      <div className="news-page">
        {/* Hero Section */}
        <div className="news-hero">
          <div className="container">
            <h1 className="news-hero-title">Tin Tức & Sự Kiện</h1>
            <p className="news-hero-subtitle">
              Cập nhật những tin tức mới nhất về đồng hồ, xu hướng thời trang và các sự kiện đặc biệt
            </p>
          </div>
        </div>

        <div className="container">
          <div className="news-content">
            {/* Sidebar */}
            <div className="news-sidebar">
              {/* Search */}
              <div className="news-search-section">
                <h3>Tìm kiếm</h3>
                <form onSubmit={handleSearch} className="news-search-form">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="news-search-input"
                  />
                  <button type="submit" className="news-search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>

              {/* Categories */}
              <div className="news-categories-section">
                <h3>Danh mục tin tức</h3>
                <div className="news-categories-list">
                  <button
                    className={`news-category-item ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(null)}
                  >
                    <span>Tất cả tin tức</span>
                    <span className="category-count">({totalNews})</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`news-category-item ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => handleCategoryFilter(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="category-count">
                        ({news.filter(item => item.category === category.id).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent News */}
              <div className="news-recent-section">
                <h3>Tin tức gần đây</h3>
                <div className="news-recent-list">
                  {news.slice(0, 5).map((item) => (
                    <div key={item.id} className="news-recent-item">
                      <div className="news-recent-image">
                        {item.featured_image ? (
                          <img src={item.featured_image} alt={item.title} />
                        ) : (
                          <div className="news-placeholder-image">
                            <i className="fas fa-newspaper"></i>
                          </div>
                        )}
                      </div>
                      <div className="news-recent-content">
                        <h4 className="news-recent-title">
                          <Link to={`/news/${item.slug}`}>
                            {truncateText(item.title, 50)}
                          </Link>
                        </h4>
                        <p className="news-recent-date">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="news-main">
              {/* Filter Info */}
              <div className="news-filter-info">
                <div className="news-filter-stats">
                  <span className="news-count">
                    Hiển thị {news.length} trong tổng số {totalNews} tin tức
                  </span>
                  {selectedCategory && (
                    <span className="news-category-filter">
                      Danh mục: {getCategoryName(selectedCategory)}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="news-search-filter">
                      Tìm kiếm: "{searchTerm}"
                    </span>
                  )}
                </div>
                
                {selectedCategory || searchTerm ? (
                  <button
                    className="news-clear-filters"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Xóa bộ lọc
                  </button>
                ) : null}
              </div>

              {/* News Grid */}
              {loading ? (
                <div className="news-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải tin tức...</p>
                </div>
              ) : news.length > 0 ? (
                <div className="news-grid">
                  {news.map((item) => (
                    <article key={item.id} className="news-card">
                      <div className="news-card-image">
                        {item.featured_image ? (
                          <img src={item.featured_image} alt={item.title} />
                        ) : (
                          <div className="news-card-placeholder">
                            <i className="fas fa-newspaper"></i>
                          </div>
                        )}
                        <div className="news-card-overlay">
                          <Link to={`/news/${item.slug}`} className="news-read-more">
                            Đọc thêm
                          </Link>
                        </div>
                      </div>
                      
                      <div className="news-card-content">
                        <div className="news-card-meta">
                          <span className="news-category">
                            {getCategoryName(item.category)}
                          </span>
                          <span className="news-date">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        
                        <h3 className="news-card-title">
                          <Link to={`/news/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        
                        {item.summary && (
                          <p className="news-card-summary">
                            {truncateText(item.summary, 120)}
                          </p>
                        )}
                        
                        <div className="news-card-footer">
                          <div className="news-card-stats">
                            {item.view_count && (
                              <span className="news-views">
                                <i className="fas fa-eye"></i>
                                {item.view_count} lượt xem
                              </span>
                            )}
                          </div>
                          
                          <Link to={`/news/${item.slug}`} className="news-card-link">
                            Đọc chi tiết
                            <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="news-empty">
                  <div className="news-empty-icon">
                    <i className="fas fa-newspaper"></i>
                  </div>
                  <h3>Không tìm thấy tin tức</h3>
                  <p>
                    {searchTerm 
                      ? `Không có tin tức nào phù hợp với từ khóa "${searchTerm}"`
                      : 'Hiện tại chưa có tin tức nào được đăng tải.'
                    }
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <button
                      className="news-empty-reset"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                    >
                      Xem tất cả tin tức
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="news-pagination">
                  <button
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                    Trước
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 