import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  // Xây dựng cây danh mục từ dữ liệu phẳng
  const buildCategoryTree = (categories) => {
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
  };

  // Lấy danh sách brands và categories
  useEffect(() => {
    const fetchBrandsAndCategories = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:8000/api/products/brands/list_all/'),
          fetch('http://localhost:8000/api/products/categories/list_all/')
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
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Chỉ thêm các tham số có giá trị
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.min_price) queryParams.append('min_price', filters.min_price);
      if (filters.max_price) queryParams.append('max_price', filters.max_price);
      
      // Thêm is_active=true để chỉ lấy sản phẩm đang hoạt động
      queryParams.append('is_active', 'true');
      
      queryParams.append('page', page);
      queryParams.append('page_size', pageSize);

      const response = await fetch(`http://localhost:8000/api/products/products/?${queryParams}`);
      if (!response.ok) {
        throw new Error('Lỗi khi tải dữ liệu sản phẩm');
      }
      const data = await response.json();
      
      // Kiểm tra và xử lý dữ liệu trả về
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
      } else if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalCount(data.count || data.results.length);
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
  }, [filters, page]);

  // Gọi API khi component mount và khi filters/page thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cập nhật URL khi filters thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (filters.search) searchParams.append('search', filters.search);
    if (filters.brand) searchParams.append('brand', filters.brand);
    if (filters.category) searchParams.append('category', filters.category);
    if (filters.min_price) searchParams.append('min_price', filters.min_price);
    if (filters.max_price) searchParams.append('max_price', filters.max_price);
    if (page > 1) searchParams.append('page', page);

    navigate(`/products?${searchParams.toString()}`);
  }, [filters, page, navigate]);

  // Cập nhật filters từ URL parameters khi component mount hoặc URL thay đổi
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
    
    setFilters({
      search: search || '',
      brand: brand || '',
      category: category || '',
      min_price: min_price || '',
      max_price: max_price || ''
    });
    
    if (pageParam) {
      setPage(parseInt(pageParam, 10));
    } else {
      setPage(1);
    }
  }, [location.search]);

  const handleFilterChange = (type, value) => {
    const newFilters = {
      ...filters,
      [type]: value
    };
    setFilters(newFilters);
    setPage(1);

    const searchParams = new URLSearchParams();
    
    // Chỉ thêm các tham số có giá trị
    if (newFilters.search) searchParams.append('search', newFilters.search);
    if (newFilters.brand) searchParams.append('brand', newFilters.brand);
    if (newFilters.category) searchParams.append('category', newFilters.category);
    if (newFilters.min_price) searchParams.append('min_price', newFilters.min_price);
    if (newFilters.max_price) searchParams.append('max_price', newFilters.max_price);

    navigate(`/products?${searchParams.toString()}`);
  };

  const handleCategoryChange = (categoryId, isParent = false) => {
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
  };

  const handlePriceFilter = (minPrice, maxPrice) => {
    const newFilters = {
      ...filters,
      min_price: minPrice,
      max_price: maxPrice
    };
    setFilters(newFilters);
    setPage(1);

    const searchParams = new URLSearchParams();
    
    // Chỉ thêm các tham số có giá trị
    if (newFilters.search) searchParams.append('search', newFilters.search);
    if (newFilters.brand) searchParams.append('brand', newFilters.brand);
    if (newFilters.category) searchParams.append('category', newFilters.category);
    if (newFilters.min_price) searchParams.append('min_price', newFilters.min_price);
    if (newFilters.max_price) searchParams.append('max_price', newFilters.max_price);

    navigate(`/products?${searchParams.toString()}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleCategory = (categoryId) => {
    const newCollapsedCategories = new Set(collapsedCategories);
    if (newCollapsedCategories.has(categoryId)) {
      newCollapsedCategories.delete(categoryId);
    } else {
      newCollapsedCategories.add(categoryId);
    }
    setCollapsedCategories(newCollapsedCategories);
  };

  // Render danh mục theo cấu trúc cây
  const renderCategoryTree = (categories) => {
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
  };

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
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <>
              <div className="product-list-grid">
                {Array.isArray(products) && products.map(product => {
                  // Lấy ảnh chính từ primary_image_index hoặc ảnh đầu tiên
                  const primaryImageIndex = product.primary_image_index || 0;
                  const primaryImage = product.images?.[primaryImageIndex] || product.images?.[0];
                  return (
                    <div 
                      className="product-card" 
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={primaryImage?.image ? `${primaryImage.image}` : 'https://i.imgur.com/1Q9Z1Zm.png'} 
                        alt={primaryImage?.alt_text || product.name} 
                      />
                      <div className="product-card__name">{product.name}</div>
                      <div className="product-card__price">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(product.base_price)}
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`pagination-btn${p === page ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn" 
                    onClick={() => setPage(page + 1)} 
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