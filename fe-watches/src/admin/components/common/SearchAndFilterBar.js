import React from 'react';
import { Button, Row, Col, Card } from 'antd';
import { 
  FilterOutlined, 
  ClearOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';

/**
 * Component thanh lọc (không bao gồm search)
 * @param {object} props - Props của component
 * @param {boolean} props.showFilters - Hiển thị filter panel không
 * @param {function} props.onToggleFilters - Callback khi toggle filter
 * @param {function} props.onClearFilters - Callback khi clear filters
 * @param {function} props.onRefresh - Callback khi refresh
 * @param {React.ReactNode} props.filterContent - Nội dung filter panel
 * @param {boolean} props.hasActiveFilters - Có filter nào active không
 * @param {string} props.title - Tiêu đề cho filter card
 * @returns {JSX.Element} - SearchAndFilterBar component
 */
const SearchAndFilterBar = ({
  showFilters = false,
  onToggleFilters,
  onClearFilters,
  onRefresh,
  filterContent = null,
  hasActiveFilters = false,
  title = 'Bộ lọc nâng cao'
}) => {
  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterOutlined />
          <span>{title}</span>
        </div>
      }
      style={{ marginBottom: 16 }}
      className="filter-card"
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Refresh Button */}
        {onRefresh && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              style={{ width: '100%' }}
            >
              Làm mới
            </Button>
          </Col>
        )}

        {/* Toggle Filters Button */}
        {onToggleFilters && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={onToggleFilters}
              icon={<FilterOutlined />} 
              className="filter-toggle-btn"
              style={{ 
                width: '100%', 
                background: showFilters ? '#52c41a' : '#1890ff', 
                borderColor: showFilters ? '#52c41a' : '#1890ff', 
                color: '#fff' 
              }}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </Col>
        )}

        {/* Clear Filters Button */}
        {onClearFilters && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={onClearFilters}
              icon={<ClearOutlined />} 
              className="filter-clear-btn"
              style={{ 
                width: '100%', 
                background: '#ff4d4f', 
                borderColor: '#ff4d4f', 
                color: '#fff' 
              }}
              disabled={!hasActiveFilters}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        )}
      </Row>

      {/* Filter Panel */}
      {showFilters && filterContent && (
        <div className={`filter-container filter-show`} style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid #f0f0f0' 
        }}>
          {filterContent}
        </div>
      )}
    </Card>
  );
};

export default SearchAndFilterBar; 