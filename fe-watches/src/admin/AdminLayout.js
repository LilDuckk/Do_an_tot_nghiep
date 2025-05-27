import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './static/AdminLayout.css';

const menuConfig = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: '🏠' },
  { label: 'Người dùng', icon: '👤', children: [
    { label: 'Quản lý người dùng', to: '/admin/users' },
    { label: 'Nhóm quyền', to: '/admin/groups' },
    { label: 'Quyền', to: '/admin/permissions' },
  ]},
  { label: 'Sản phẩm', icon: '⌚', children: [
    { label: 'Quản lý sản phẩm', to: '/admin/products' },
    { label: 'Danh mục', to: '/admin/categories' },
    { label: 'Thương hiệu', to: '/admin/brands' },
    { label: 'Biến thể', to: '/admin/variants' },
    { label: 'Thuộc tính', to: '/admin/attributes' },
  ]},
  { label: 'Đơn hàng', icon: '🧾', children: [
    { label: 'Quản lý đơn hàng', to: '/admin/orders' },
    { label: 'Trả hàng', to: '/admin/return-orders' },
    { label: 'Quản lý khuyến mãi', to: '/admin/coupons' },
    { label: 'Quản lý khách hàng', to: '/admin/customers' },
  ]},
  { label: 'Cửa hàng', icon: '🏬', children: [
    { label: 'Quản lý cửa hàng', to: '/admin/stores' },
    { label: 'Tồn kho', to: '/admin/inventories' },
    { label: 'Kiểm kê', to: '/admin/stock-takes' },
    { label: 'Chuyển kho', to: '/admin/stock-transfers' },
  ]},
  { label: 'Hệ thống', icon: '⚙️', children: [
    { label: 'Quản lý ảnh bìa', to: '/admin/system/banners' },
    { label: 'Thông tin liên hệ', to: '/admin/system/contact' },
    { label: 'Thông tin chân trang', to: '/admin/system/footer' },
    { label: 'Quản lý tin tức', to: '/admin/system/news' },
  ]},
  { label: 'Bảo hành', icon: '🛡️', to: '/admin/warranties' },
  { label: 'Lịch sử thao tác', icon: '📜', to: '/admin/audit-logs' },
  { label: 'Đăng xuất', icon: '🚪', to: '/admin/logout' },
];

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [openDropdown, setOpenDropdown] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-admin-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('adminTheme', newTheme);
    document.body.setAttribute('data-admin-theme', newTheme);
  };

  const handleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? '' : label);
  };

  return (
    <div className={`admin-layout${collapsed ? ' collapsed' : ''}`}> 
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '☰' : '✖'}
          </button>
          {!collapsed && <h2>Admin Panel</h2>}
        </div>
        <nav>
          <ul>
            {menuConfig.map((item, idx) => (
              <li key={item.label} className={item.children ? 'has-dropdown' : ''}>
                {item.children ? (
                  <>
                    <div
                      className={`dropdown-label${openDropdown === item.label ? ' open' : ''}`}
                      onClick={() => !collapsed && handleDropdown(item.label)}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && <span className="dropdown-arrow">{openDropdown === item.label ? '▲' : '▼'}</span>}
                    </div>
                    {!collapsed && (
                      <ul className={`dropdown-menu${openDropdown === item.label ? ' show' : ''}`}>
                        {item.children.map(child => (
                          <li key={child.to}>
                            <Link to={child.to} className={location.pathname === child.to ? 'active' : ''}>{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link to={item.to} className={location.pathname === item.to ? 'active' : ''}>
                    <span className="sidebar-icon">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <button className="theme-toggle" onClick={toggleTheme} title="Đổi theme">
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
          <div className="admin-user-info" onClick={() => navigate('/admin/profile')}>
            <span className="admin-user-name">{user.username || 'Admin'}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
