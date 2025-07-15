import React from 'react';
import { Input, Button, Card } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  FilterOutlined 
} from '@ant-design/icons';

/**
 * Component Header nâng cao cho các trang phức tạp như OrdersPage
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
 * @param {React.ReactNode} props.filterContent - Nội dung filter panel
 * @param {function} props.onClearFilters - Callback khi clear filters
 * @param {boolean} props.hasActiveFilters - Có filter nào active không
 * @param {object} props.extraButtons - Các nút bổ sung (VD: đơn hàng mới)
 * @param {React.ReactNode} props.statistics - Thống kê (optional)
 * @returns {JSX.Element} - AdvancedPageHeader component
 */
const AdvancedPageHeader = ({
  title,
  searchText,
  onSearchChange,
  onAdd,
  hasAccess = true,
  searchPlaceholder = "Tìm kiếm...",
  addButtonText = "Thêm mới",
  showFilters = false,
  onToggleFilters,
  filterContent = null,
  onClearFilters,
  hasActiveFilters = false,
  extraButtons = [],
  statistics = null
}) => {
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="admin-list-header">
      <h2>{title}</h2>
      
      {/* Thống kê nếu có */}
      {statistics && (
        <div style={{ marginBottom: 16 }}>
          {statistics}
        </div>
      )}
      
      <div className="search-bar">
        {/* Nút thêm mới */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          {addButtonText}
        </Button>
        
        {/* Các nút bổ sung */}
        {extraButtons.map((button, index) => (
          <div key={index} style={{ marginLeft: 8 }}>
            {button}
          </div>
        ))}
        
        {/* Nút toggle filter */}
        {onToggleFilters && (
          <Button
            className="filter-toggle-btn"
            type="primary"
            icon={<FilterOutlined />}
            onClick={onToggleFilters}
            style={{
              background: showFilters ? '#52c41a' : '#1890ff',
              borderColor: showFilters ? '#52c41a' : '#1890ff',
              marginLeft: 8,
              minWidth: 140
            }}
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
          </Button>
        )}
        
        {/* Search input ở cuối */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && filterContent && (
        <Card
          className="filter-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined />
              <span>Tìm kiếm và bộ lọc</span>
            </div>
          }
          style={{ marginTop: 16, marginBottom: 16 }}
          extra={
            onClearFilters && (
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
              >
                Xóa bộ lọc
              </Button>
            )
          }
        >
          <div className={`filter-container filter-show`}>
            {filterContent}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPageHeader; 