import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './static/Header.css';
import DropdownMenu from './DropdownMenu';

export default function Header() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null); // 'brand' | 'category' | null
  const headerRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    // Fetch brands
    fetch('http://localhost:8000/api/products/brands/list_all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBrands(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setBrands(data.data);
        } else {
          console.error('Invalid brands data format:', data);
          setBrands([]);
        }
      })
      .catch(err => {
        console.error('Error fetching brands:', err);
        setBrands([]);
      });

    // Fetch categories
    fetch('http://localhost:8000/api/products/categories/list_all')
      .then(res => res.json())
      .then(data => {
        const categoriesData = Array.isArray(data) ? data : (data && data.data && Array.isArray(data.data) ? data.data : []);
        const categoryMap = new Map();
        const rootCategories = [];
        categoriesData.forEach(category => {
          categoryMap.set(category.id, { ...category, children: [] });
        });
        categoriesData.forEach(category => {
          if (category.parent) {
            const parent = categoryMap.get(category.parent);
            if (parent) {
              parent.children.push(categoryMap.get(category.id));
            }
          } else {
            rootCategories.push(categoryMap.get(category.id));
          }
        });
        setCategories(rootCategories);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleDropdownToggle = (type) => {
    setShowDropdown(prev => (prev === type ? null : type));
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
            <li><Link to="/maintenance">BẢO DƯỠNG</Link></li>
            <li><Link to="/contact">LIÊN HỆ</Link></li>
          </ul>
        </nav>
        <div className="header__icons">
          <span className="icon search" />
          <span className="icon cart" />
        </div>
      </header>
      {showDropdown === 'brand' && brands.length > 0 && (
        <div ref={dropdownRef}>
          <DropdownMenu
            items={brands}
            onClose={() => setShowDropdown(null)}
            type="brand"
            anchorRef={headerRef}
          />
        </div>
      )}
      {showDropdown === 'category' && categories.length > 0 && (
        <div ref={dropdownRef}>
          <DropdownMenu
            items={categories}
            onClose={() => setShowDropdown(null)}
            type="category"
            anchorRef={headerRef}
          />
        </div>
      )}
    </>
  );
} 