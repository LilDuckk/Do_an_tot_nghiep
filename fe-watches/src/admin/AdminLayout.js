import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import './static/AdminLayout.css';

function hasAnyPermission(userPermissions, requiredPermissions) {
  if (localStorage.getItem('is_superuser') === 'true') return true;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some(p => userPermissions.includes(p));
}

const menuConfig = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: '🏠' },
  { label: 'Người dùng', icon: '👤', requiredPermissions: ['view_useraccount', 'view_group', 'view_permission'], children: [
    { label: 'Quản lý người dùng', to: '/admin/users', requiredPermissions: ['view_useraccount'] },
    { label: 'Nhóm quyền', to: '/admin/groups', requiredPermissions: ['view_group'] },
    { label: 'Quyền', to: '/admin/permissions', requiredPermissions: ['view_permission'] },
  ]},
  { label: 'Sản phẩm', icon: '⌚', requiredPermissions: ['view_product', 'view_category', 'view_brand', 'view_productvariant', 'view_attributetype', 'view_attributevalue'], children: [
    { label: 'Quản lý sản phẩm', to: '/admin/products', requiredPermissions: ['view_product'] },
    { label: 'Danh mục', to: '/admin/categories', requiredPermissions: ['view_category'] },
    { label: 'Thương hiệu', to: '/admin/brands', requiredPermissions: ['view_brand'] },
    { label: 'Biến thể', to: '/admin/variants', requiredPermissions: ['view_productvariant'] },
    { label: 'Thuộc tính', to: '/admin/attributes', requiredPermissions: ['view_attributetype', 'view_attributevalue'] },
  ]},
  { label: 'Đơn hàng', icon: '🧾', requiredPermissions: ['view_orders', 'view_returnorder', 'view_coupon', 'view_customer'], children: [
    { label: 'Quản lý đơn hàng', to: '/admin/orders', requiredPermissions: ['view_orders'] },
    { label: 'Trả hàng', to: '/admin/return-orders', requiredPermissions: ['view_returnorder'] },
    { label: 'Quản lý khuyến mãi', to: '/admin/coupons', requiredPermissions: ['view_coupon'] },
    { label: 'Quản lý khách hàng', to: '/admin/customers', requiredPermissions: ['view_customer'] },
  ]},
  { label: 'Cửa hàng', icon: '🏬', requiredPermissions: ['view_store', 'view_employee', 'view_inventory', 'view_stocktake', 'view_stocktransfer'], children: [
    { label: 'Quản lý cửa hàng', to: '/admin/stores', requiredPermissions: ['view_store'] },
    { label: 'Quản lý nhân viên', to: '/admin/employees', requiredPermissions: ['view_employee'] },
    { label: 'Tồn kho', to: '/admin/inventories', requiredPermissions: ['view_inventory'] },
    { label: 'Kiểm kê', to: '/admin/stock-takes', requiredPermissions: ['view_stocktake'] },
    { label: 'Chuyển kho', to: '/admin/stock-transfers', requiredPermissions: ['view_stocktransfer'] },
  ]},
  { label: 'Hệ thống', icon: '⚙️', requiredPermissions: ['view_banner', 'view_contactinfo', 'view_footercategory', 'view_footerlink', 'view_news'], children: [
    { label: 'Quản lý ảnh bìa', to: '/admin/system/banners', requiredPermissions: ['view_banner'] },
    { label: 'Thông tin liên hệ', to: '/admin/system/contact', requiredPermissions: ['view_contactinfo'] },
    { label: 'Thông tin chân trang', to: '/admin/system/footer', requiredPermissions: ['view_footercategory', 'view_footerlink'] },
    { label: 'Quản lý tin tức', to: '/admin/system/news', requiredPermissions: ['view_news'] },
  ]},
  { label: 'Bảo hành', icon: '🛡️', to: '/admin/warranties', requiredPermissions: ['view_warranty'] },
  { label: 'Lịch sử thao tác', icon: '📜', to: '/admin/audit-logs', requiredPermissions: ['view_auditlog'] },
  { label: 'Đăng xuất', icon: '🚪', to: '/admin/logout' },
];

export default function AdminLayout() {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const userPermissions = JSON.parse(localStorage.getItem('user_permission_codenames') || '[]');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
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
            {menuConfig.map((item, idx) => {
              // Ẩn mục nếu không có quyền
              if (!hasAnyPermission(userPermissions, item.requiredPermissions)) return null;
              if (item.children) {
                // Lọc các mục con theo quyền
                const visibleChildren = item.children.filter(child => hasAnyPermission(userPermissions, child.requiredPermissions));
                if (visibleChildren.length === 0) return null;
                return (
                  <li key={item.label} className={item.children ? 'has-dropdown' : ''}>
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
                          {visibleChildren.map(child => (
                            <li key={child.to}>
                              <Link to={child.to} className={location.pathname === child.to ? 'active' : ''}>{child.label}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  </li>
                );
              } else {
                return (
                  <li key={item.label}>
                    <Link to={item.to} className={location.pathname === item.to ? 'active' : ''}>
                      <span className="sidebar-icon">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              }
            })}
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
