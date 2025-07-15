import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import Header from './Header';
import Footer from './Footer';
import './static/ProductList.css';

export default function ProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    min_price: '',
    max_price: ''
  });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  // Refs để tránh re-render không cần thiết
  const isInitialized = useRef(false);
  const lastFetchParams = useRef({});

  // Xây dựng cây danh mục từ dữ liệu phẳng
  const buildCategoryTree = useCallback((categories) => {
    const categoryMap = {};
    const tree = [];

    // Tạo map cho tất cả danh mục
    categories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        children: []
      };
    });

    // Xây dựng cây
    categories.forEach(category => {
      if (category.parent === null) {
        // Danh mục gốc
        tree.push(categoryMap[category.id]);
      } else {
        // Danh mục con
        const parent = categoryMap[category.parent];
        if (parent) {
          parent.children.push(categoryMap[category.id]);
        }
      }
    });

    return tree;
  }, []);

  // Lấy danh sách brands và categories (chỉ gọi 1 lần khi component mount)
  useEffect(() => {
    const fetchBrandsAndCategories = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch(PRODUCT_ENDPOINTS.BRANDS_LIST_ALL),
          fetch(PRODUCT_ENDPOINTS.CATEGORIES_LIST_ALL)
        ]);
        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setCategoryTree(buildCategoryTree(categoriesData));
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        setBrands([]);
        setCategories([]);
        setCategoryTree([]);
      }
    };
    fetchBrandsAndCategories();
  }, [buildCategoryTree]);

  // Function gọi API sản phẩm
  const fetchProducts = useCallback(async (currentFilters, currentPage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Chỉ thêm các tham số có giá trị
      if (currentFilters.search) queryParams.append('search', currentFilters.search);
      if (currentFilters.brand) queryParams.append('brand', currentFilters.brand);
      if (currentFilters.category) queryParams.append('category', currentFilters.category);
      if (currentFilters.min_price) queryParams.append('min_price', currentFilters.min_price);
      if (currentFilters.max_price) queryParams.append('max_price', currentFilters.max_price);
      
      // Thêm is_active=true để chỉ lấy sản phẩm đang hoạt động
      queryParams.append('is_active', 'true');
      queryParams.append('page', currentPage);
      queryParams.append('page_size', pageSize);

      // Sử dụng API tối ưu hơn
      const response = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS_LIST_BASIC}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Lỗi khi tải dữ liệu sản phẩm');
      }
      const data = await response.json();
      
      // Xử lý dữ liệu response mới
      if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalCount(data.count || data.results.length);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect chính - xử lý URL và gọi API
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const search = searchParams.get('search');
    const pageParam = searchParams.get('page');
    
    // Xử lý category từ URL
    const categoryParam = category ? category.split(',') : [];
    setSelectedCategories(new Set(categoryParam));
    
    const newFilters = {
      search: search || '',
      brand: brand || '',
      category: category || '',
      min_price: min_price || '',
      max_price: max_price || ''
    };
    
    const newPage = pageParam ? parseInt(pageParam, 10) : 1;
    
    // Cập nhật state
    setFilters(newFilters);
    setPage(newPage);
    
    // Kiểm tra xem có cần gọi API không
    const currentParams = JSON.stringify({ filters: newFilters, page: newPage });
    if (!isInitialized.current || currentParams !== lastFetchParams.current) {
      lastFetchParams.current = currentParams;
      fetchProducts(newFilters, newPage);
    }
    
    isInitialized.current = true;
  }, [location.search, fetchProducts]);

  // Cập nhật URL khi filters/page thay đổi (debounced)
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const timeoutId = setTimeout(() => {
    const searchParams = new URLSearchParams();
    
    if (filters.search) searchParams.append('search', filters.search);
    if (filters.brand) searchParams.append('brand', filters.brand);
    if (filters.category) searchParams.append('category', filters.category);
    if (filters.min_price) searchParams.append('min_price', filters.min_price);
    if (filters.max_price) searchParams.append('max_price', filters.max_price);
    if (page > 1) searchParams.append('page', page);

    const newUrl = `/products?${searchParams.toString()}`;
    if (location.pathname + location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, page, navigate, location.pathname, location.search]);

  const handleFilterChange = useCallback((type, value) => {
    const newFilters = {
      ...filters,
      [type]: value
    };
    setFilters(newFilters);
    setPage(1);
    
    // Cuộn lên đầu trang khi thay đổi filter
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [filters]);

  const handleCategoryChange = useCallback((categoryId, isParent = false) => {
    const newSelectedCategories = new Set(selectedCategories);
    
    if (isParent) {
      // Nếu là danh mục cha
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        if (newSelectedCategories.has(categoryId.toString())) {
          // Bỏ chọn danh mục cha và tất cả danh mục con
          newSelectedCategories.delete(categoryId.toString());
          // Tìm và bỏ chọn tất cả danh mục con
          categories.forEach(c => {
            if (c.parent === categoryId) {
              newSelectedCategories.delete(c.id.toString());
            }
          });
        } else {
          // Chọn danh mục cha và tất cả danh mục con
          newSelectedCategories.add(categoryId.toString());
          // Tìm và chọn tất cả danh mục con
          categories.forEach(c => {
            if (c.parent === categoryId) {
              newSelectedCategories.add(c.id.toString());
            }
          });
        }
      }
    } else {
      // Nếu là danh mục con
      if (newSelectedCategories.has(categoryId.toString())) {
        newSelectedCategories.delete(categoryId.toString());
      } else {
        newSelectedCategories.add(categoryId.toString());
      }
    }

    setSelectedCategories(newSelectedCategories);
    
    // Cập nhật URL với danh sách category mới
    const categoryString = Array.from(newSelectedCategories).join(',');
    handleFilterChange('category', categoryString);
  }, [selectedCategories, categories, handleFilterChange]);

  const handlePriceFilter = useCallback((minPrice, maxPrice) => {
    const newFilters = {
      ...filters,
      min_price: minPrice,
      max_price: maxPrice
    };
    setFilters(newFilters);
    setPage(1);
    
    // Cuộn lên đầu trang khi thay đổi price filter
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [filters]);

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // Cuộn lên đầu trang
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleCategory = useCallback((categoryId) => {
    const newCollapsedCategories = new Set(collapsedCategories);
    if (newCollapsedCategories.has(categoryId)) {
      newCollapsedCategories.delete(categoryId);
    } else {
      newCollapsedCategories.add(categoryId);
    }
    setCollapsedCategories(newCollapsedCategories);
  }, [collapsedCategories]);

  // Render danh mục theo cấu trúc cây
  const renderCategoryTree = useCallback((categories) => {
    return categories.map(category => (
      <div 
        key={category.id} 
        className={`category-group ${collapsedCategories.has(category.id) ? 'collapsed' : ''}`}
      >
        <label 
          className="filter-option parent-category"
          onClick={(e) => {
            if (e.target.tagName !== 'INPUT') {
              toggleCategory(category.id);
            }
          }}
        >
          <input 
            type="checkbox" 
            checked={selectedCategories.has(category.id.toString())}
            onChange={() => handleCategoryChange(category.id, true)}
          /> {category.name}
        </label>
        {category.children && category.children.length > 0 && (
          <div className="subcategory-group">
            {category.children.map(child => (
              <label key={child.id} className="filter-option subcategory">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.has(child.id.toString())}
                  onChange={() => handleCategoryChange(child.id)}
                /> {child.name}
              </label>
            ))}
          </div>
        )}
      </div>
    ));
  }, [collapsedCategories, selectedCategories, toggleCategory, handleCategoryChange]);

  return (
    <div>
      <Header />
      <div className="product-list-container">
        <aside className="filter-sidebar">
          <div className="filter-section">
            <h3>Danh mục</h3>
            <div className="filter-options">
              {renderCategoryTree(categoryTree)}
            </div>
          </div>

          <div className="filter-section">
            <h3>Thương hiệu</h3>
            <div className="filter-options">
              {Array.isArray(brands) && brands.map(brand => (
                <label key={brand.id} className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={filters.brand === brand.id.toString()}
                    onChange={(e) => handleFilterChange('brand', e.target.checked ? brand.id.toString() : '')}
                  /> {brand.name}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Khoảng giá</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.min_price === '0' && filters.max_price === '5000000'}
                  onChange={(e) => handlePriceFilter(e.target.checked ? '0' : '', e.target.checked ? '5000000' : '')}
                /> Dưới 5 triệu
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.min_price === '5000000' && filters.max_price === '10000000'}
                  onChange={(e) => handlePriceFilter(e.target.checked ? '5000000' : '', e.target.checked ? '10000000' : '')}
                /> 5 - 10 triệu
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.min_price === '10000000' && filters.max_price === '20000000'}
                  onChange={(e) => handlePriceFilter(e.target.checked ? '10000000' : '', e.target.checked ? '20000000' : '')}
                /> 10 - 20 triệu
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.min_price === '20000000' && filters.max_price === ''}
                  onChange={(e) => handlePriceFilter(e.target.checked ? '20000000' : '', '')}
                /> Trên 20 triệu
              </label>
            </div>
          </div>
        </aside>

        <main className="product-list-main">
          <h2>Danh sách sản phẩm</h2>
          {filters.search && (
            <div className="search-results-info">
              <p>
                Kết quả tìm kiếm cho: <strong>"{filters.search}"</strong>
                {!loading && (
                  <span> - Tìm thấy {totalCount} sản phẩm</span>
                )}
              </p>
            </div>
          )}
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              <div className="product-list-grid">
                {Array.isArray(products) && products.map(product => {
                  // Sử dụng cấu trúc dữ liệu mới
                  const primaryImage = product.primary_image;
                  const priceDisplay = product.price_range?.display || 'Liên hệ';
                  
                  return (
                    <div 
                      className={`product-card ${product.is_featured ? 'product-card--featured' : ''}`}
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.is_featured && (
                        <div className="featured-badge">
                          <span className="featured-icon">⭐</span>
                          <span className="featured-text">Nổi bật</span>
                        </div>
                      )}
                      <img 
                        src={primaryImage?.image_url ? `http://localhost:8000${primaryImage.image_url}` : 'https://i.imgur.com/1Q9Z1Zm.png'} 
                        alt={primaryImage?.alt_text || product.name} 
                      />
                      <div className="product-card__name">{product.name}</div>
                      <div className="product-card__price">
                        {priceDisplay}
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`pagination-btn${p === page ? ' active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn" 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
} 