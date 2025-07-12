/**
 * Component thống kê đơn hàng
 * 
 * Yêu cầu:
 * - Hiển thị các metrics: tổng đơn hàng, đơn hàng mới, đơn hàng đang xử lý, v.v.
 * - Sử dụng Ant Design Card và Statistic
 * - Responsive design
 * - Loading states
 * - Tối ưu performance với React.memo
 * - Tích hợp với useOrderData
 * - Có thể click để filter theo trạng thái
 */

import React, { useMemo } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { 
  ShoppingCartOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { formatCurrency } from '@/admin/utils/formatters';
import { ORDER_STATUSES } from '@/admin/pages/orders/utils';

const OrderStats = React.memo(({ 
  stats, 
  loading = false, 
  onStatClick,
  className = ''
}) => {
  // Tính toán stats từ data nếu không có stats được truyền vào
  const calculatedStats = useMemo(() => {
    if (stats) return stats;
    
    // Fallback stats nếu không có data
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalAmount: 0,
      averageAmount: 0
    };
  }, [stats]);

  const statItems = useMemo(() => [
    {
      key: 'total',
      title: 'Tổng đơn hàng',
      value: calculatedStats.total,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      status: null,
      suffix: 'đơn'
    },
    {
      key: 'pending',
      title: 'Chờ xử lý',
      value: calculatedStats.pending,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      status: ORDER_STATUSES.PENDING,
      suffix: 'đơn'
    },
    {
      key: 'processing',
      title: 'Đang xử lý',
      value: calculatedStats.processing,
      icon: <CarOutlined />,
      color: '#1890ff',
      status: ORDER_STATUSES.PROCESSING,
      suffix: 'đơn'
    },
    {
      key: 'shipped',
      title: 'Đã giao hàng',
      value: calculatedStats.shipped,
      icon: <CarOutlined />,
      color: '#722ed1',
      status: ORDER_STATUSES.SHIPPED,
      suffix: 'đơn'
    },
    {
      key: 'delivered',
      title: 'Đã hoàn thành',
      value: calculatedStats.delivered,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      status: ORDER_STATUSES.DELIVERED,
      suffix: 'đơn'
    },
    {
      key: 'cancelled',
      title: 'Đã hủy',
      value: calculatedStats.cancelled,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
      status: ORDER_STATUSES.CANCELLED,
      suffix: 'đơn'
    },
    {
      key: 'totalAmount',
      title: 'Tổng doanh thu',
      value: calculatedStats.totalAmount,
      icon: <DollarOutlined />,
      color: '#52c41a',
      status: null,
      suffix: 'VNĐ',
      formatter: (value) => formatCurrency(value)
    },
    {
      key: 'averageAmount',
      title: 'Trung bình/đơn',
      value: calculatedStats.averageAmount,
      icon: <DollarOutlined />,
      color: '#722ed1',
      status: null,
      suffix: 'VNĐ',
      formatter: (value) => formatCurrency(value)
    }
  ], [calculatedStats]);

  const handleCardClick = (item) => {
    if (onStatClick && item.status) {
      onStatClick(item.status);
    }
  };

  if (loading) {
    return (
      <Row gutter={16} className={`admin-statistics-section ${className}`}>
        {statItems.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Card size="small" className="admin-statistics-card">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={16} className={`admin-statistics-section ${className}`}>
      {statItems.map(item => (
        <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
          <Card 
            size="small" 
            className={`admin-statistics-card ${item.status ? 'clickable' : ''}`}
            onClick={() => handleCardClick(item)}
            style={{ 
              cursor: item.status ? 'pointer' : 'default',
              transition: 'all 0.3s ease'
            }}
            hoverable={!!item.status}
          >
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              }
              value={item.value}
              suffix={item.suffix}
              valueStyle={{ 
                color: item.color,
                fontSize: '24px',
                fontWeight: 'bold'
              }}
              formatter={item.formatter}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
});

OrderStats.displayName = 'OrderStats';

export default OrderStats; 