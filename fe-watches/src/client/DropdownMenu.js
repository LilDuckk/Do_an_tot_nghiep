import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './static/DropdownMenu.css';

export default function DropdownMenu({ items = [], onClose, type = 'brand', anchorRef }) {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const headerHeight = anchorRef?.current?.offsetHeight || 80;

  const handleItemClick = (id) => {
    // Đảm bảo id là số
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return;

    const url = type === 'brand' 
      ? `/products?search=&brand=${numericId}&category=&ordering=`
      : `/products?search=&brand=&category=${numericId}&ordering=`;
    navigate(url);
    onClose();
  };

  return (
    <div
      className="global-dropdown-menu"
      style={{
        position: 'fixed',
        top: headerHeight,
        left: 0,
        width: '100vw',
        zIndex: 10010,
      }}
    >
      <div className="global-dropdown-inner">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`global-dropdown-item ${hoveredItem === item.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div 
              className="global-dropdown-item-content"
              onClick={() => handleItemClick(item.id)}
            >
              {item.name}
            </div>
            {type === 'category' && item.children && item.children.length > 0 && (
              <div className="global-dropdown-submenu">
                {item.children.map(child => (
                  <div 
                    key={child.id} 
                    className={`global-dropdown-subitem ${hoveredItem === child.id ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredItem(child.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(child.id)}
                  >
                    {child.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 