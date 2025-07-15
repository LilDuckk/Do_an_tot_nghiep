import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';

/**
 * Component Header chung cho tất cả trang admin
 * @param {object} props - Props của component
 * @param {string} props.title - Tiêu đề trang
 * @param {string} props.searchText - Text tìm kiếm
 * @param {function} props.onSearchChange - Callback khi search thay đổi
 * @param {function} props.onAdd - Callback khi click nút thêm mới
 * @param {boolean} props.hasAccess - Có quyền truy cập không
 * @param {string} props.searchPlaceholder - Placeholder cho search input
 * @param {string} props.addButtonText - Text cho nút thêm mới
 * @param {boolean} props.showFilters - Hiển thị filter panel không
 * @param {function} props.onToggleFilters - Callback khi toggle filter
 * @param {React.ReactNode} props.children - Các nút bổ sung
 * @returns {JSX.Element} - AdminPageHeader component
 */
const AdminPageHeader = ({
  title,
  searchText,
  onSearchChange,
  onAdd,
  hasAccess = true,
  searchPlaceholder = "Tìm kiếm...",
  addButtonText = "Thêm mới",
  showFilters = false,
  onToggleFilters = null,
  children = null
}) => {
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="admin-list-header">
      <h2>{title}</h2>
      <div className="search-bar">
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          {addButtonText}
        </Button>
        
        {/* Các nút bổ sung */}
        {children}
        
        {/* Nút hiển thị bộ lọc ngoài cùng bên phải */}
        {onToggleFilters && (
          <div className="header-actions">
            <Button
              className={`filter-toggle-btn btn-filter-toggle ${showFilters ? 'showing' : 'hiding'}`}
              type="primary"
              icon={<FilterOutlined />}
              onClick={onToggleFilters}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader; 