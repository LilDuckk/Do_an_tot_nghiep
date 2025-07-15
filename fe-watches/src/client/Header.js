import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import './static/Header.css';
import DropdownMenu from './DropdownMenu';
import DropdownCart from './DropdownCart';
import { getCartCount } from './cartUtils';
import { useSharedData } from './hooks/useSharedData';

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(null); // 'brand' | 'category' | null
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const headerRef = useRef();
  const dropdownRef = useRef();
  const cartIconRef = useRef();
  const searchInputRef = useRef();
  
  // Sử dụng shared data hook
  const { data, loading, fetchBrands, fetchCategories } = useSharedData();

  // Fetch data khi component mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };
    
    updateCartCount();
    
    // Listen for cart changes
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!showDropdown && !showSearchInput) return;
    function handleClickOutside(event) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(null);
        setShowSearchInput(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, showSearchInput]);

  // Điều chỉnh vị trí form tìm kiếm khi window resize
  useEffect(() => {
    if (showSearchInput) {
      const handleResize = () => {
        adjustSearchFormPosition();
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showSearchInput]);

  const handleDropdownToggle = (type) => {
    setShowDropdown(prev => (prev === type ? null : type));
    setShowCartDropdown(false);
    setShowSearchInput(false);
  };

  const handleCartToggle = () => {
    setShowCartDropdown(prev => !prev);
    setShowDropdown(null);
    setShowSearchInput(false);
  };

  const handleSearchToggle = () => {
    setShowSearchInput(prev => !prev);
    setShowDropdown(null);
    setShowCartDropdown(false);
    // Focus vào input khi mở
    if (!showSearchInput) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        // Kiểm tra và điều chỉnh vị trí form nếu cần
        adjustSearchFormPosition();
      }, 100);
    }
  };

  const adjustSearchFormPosition = () => {
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
      const rect = searchForm.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      // Nếu form bị tràn ra ngoài màn hình bên phải
      if (rect.right > windowWidth) {
        const overflow = rect.right - windowWidth;
        searchForm.style.right = `-${overflow + 20}px`;
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSearchInput(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchInput(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearchSubmit(e);
    }
  };

  return (
    <>
      <header className="header" ref={headerRef}>
        <div className="header__logo"><Link to="/">VIET&amp;CO.</Link></div>
        <nav className="header__nav">
          <ul>
            <li><Link to="/products">SẢN PHẨM</Link></li>
            <li
              className="nav-item"
              onClick={() => handleDropdownToggle('brand')}
            >
              <div className="nav-link" style={{userSelect: 'none'}}>
                THƯƠNG HIỆU <span className="arrow">▼</span>
              </div>
            </li>
            <li
              className="nav-item"
              onClick={() => handleDropdownToggle('category')}
            >
              <div className="nav-link" style={{userSelect: 'none'}}>
                DANH MỤC <span className="arrow">▼</span>
              </div>
            </li>
            <li><Link to="/news">TIN TỨC</Link></li>
            <li><Link to="/maintenance">BẢO DƯỠNG</Link></li>
            <li><Link to="/contact">LIÊN HỆ</Link></li>
          </ul>
        </nav>
        <div className="header__icons">
          <div className="search-container">
            {showSearchInput ? (
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="search-input"
                />
                <button type="submit" className="search-submit">
                  <span className="icon search" />
                </button>
                <button 
                  type="button" 
                  className="search-close"
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchTerm('');
                  }}
                >
                  ✕
                </button>
              </form>
            ) : (
              <span className="icon search" onClick={handleSearchToggle} />
            )}
          </div>
          <div className="cart-icon-container" ref={cartIconRef} onClick={handleCartToggle}>
            <span className="icon cart" />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
            {showCartDropdown && (
              <DropdownCart
                onClose={() => setShowCartDropdown(false)}
                anchorRef={cartIconRef}
              />
            )}
          </div>
        </div>
      </header>
      {showDropdown === 'brand' && data.brands && data.brands.length > 0 && (
        <div ref={dropdownRef}>
          <DropdownMenu
            items={data.brands}
            onClose={() => setShowDropdown(null)}
            type="brand"
            anchorRef={headerRef}
          />
        </div>
      )}
      {showDropdown === 'category' && data.categories && data.categories.length > 0 && (
        <div ref={dropdownRef}>
          <DropdownMenu
            items={data.categories}
            onClose={() => setShowDropdown(null)}
            type="category"
            anchorRef={headerRef}
          />
        </div>
      )}
    </>
  );
} 