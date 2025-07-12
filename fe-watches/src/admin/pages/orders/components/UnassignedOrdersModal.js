/**
 * Component modal đơn hàng chưa gán cửa hàng
 * 
 * Yêu cầu:
 * - Hiển thị danh sách đơn hàng chưa gán
 * - Thống kê số lượng đơn hàng theo trạng thái
 * - Hướng dẫn sử dụng
 * - Tích hợp với useUnassignedOrders hook
 * - Responsive design
 * - Loading states
 * - Empty states
 * - Tối ưu performance với React.memo
 */

import React, { useMemo } from 'react';
import { 
  Modal, 
  Table, 
  Button, 
  Space, 
  Tooltip, 
  Badge, 
  Row, 
  Col, 
  Card 
} from 'antd';
import { 
  BellOutlined, 
  SearchOutlined, 
  ShoppingCartOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency } from '@/admin/utils/formatters';
import { ORDER_STATUSES, UNASSIGNED_ORDER_COLUMNS } from '@/admin/pages/orders/utils';

const UnassignedOrdersModal = React.memo(({
  visible,
  onCancel,
  unassignedOrders = [],
  loading = false,
  onRefresh,
  onViewOrderDetails,
  onAssignOrder,
  unassignedOrdersCount = 0
}) => {
  // Columns cho bảng đơn hàng chưa gán cửa hàng
  const columns = useMemo(() => [
    {
      ...UNASSIGNED_ORDER_COLUMNS.ID,
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.CUSTOMER,
      render: (name, record) => (
        <div>
          <div className="customer-name">{name}</div>
          <div className="customer-id">
            ID: {record.customer || '-'}
          </div>
        </div>
      ),
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.SHIPPING_ADDRESS,
      render: (address) => (
        <div className="shipping-address">
          {address || 'Chưa có địa chỉ'}
        </div>
      ),
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.NOTE,
      render: (note) => (
        <div className="order-note">
          {note || 'Không có ghi chú'}
        </div>
      ),
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.STATUS,
      render: (status) => {
        const statusMap = {
          [ORDER_STATUSES.PENDING]: 'Chờ xử lý',
          [ORDER_STATUSES.PROCESSING]: 'Đang xử lý',
          [ORDER_STATUSES.SHIPPED]: 'Đã giao hàng',
          [ORDER_STATUSES.DELIVERED]: 'Đã nhận hàng',
          [ORDER_STATUSES.CANCELLED]: 'Đã hủy'
        };
        return (
          <span className={`order-status ${status}`}>
            {statusMap[status] || status}
          </span>
        );
      }
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.TOTAL_AMOUNT,
      render: (amount) => formatCurrency(amount),
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.CREATED_AT,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      ...UNASSIGNED_ORDER_COLUMNS.ACTIONS,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => onViewOrderDetails?.(record)}
              size="small"
            />
          </Tooltip>
          {record.status === ORDER_STATUSES.PENDING && (
            <Tooltip title="Nhận đơn hàng">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onAssignOrder?.(record.id)}
                size="small"
                className="btn-assign"
              >
                Nhận
              </Button>
            </Tooltip>
          )}
          {record.status === ORDER_STATUSES.CANCELLED && (
            <Tooltip title="Đơn hàng đã hủy">
              <Button
                disabled
                size="small"
                className="btn-cancelled"
              >
                Đã hủy
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ], [onViewOrderDetails, onAssignOrder]);

  // Tính toán stats
  const stats = useMemo(() => ({
    total: unassignedOrdersCount,
    pending: unassignedOrders.filter(order => order.status === 'pending').length,
    cancelled: unassignedOrders.filter(order => order.status === 'cancelled').length
  }), [unassignedOrders, unassignedOrdersCount]);

  return (
    <Modal
      title={
        <div className="modal-header-with-icon">
          <BellOutlined className="modal-header-icon" />
          <span>Đơn hàng chưa gán cửa hàng</span>
          {unassignedOrdersCount > 0 && (
            <Badge count={unassignedOrdersCount} size="small" />
          )}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
    >
      <div className="guide-section">
        <div className="guide-content">
          <div className="guide-title">
            📋 Hướng dẫn nhận đơn hàng
          </div>
          <div className="guide-text">
            • Đây là danh sách các đơn hàng online chưa được gán cho cửa hàng nào
          </div>
          <div className="guide-text">
            • Chỉ có thể nhận đơn hàng có trạng thái "Chờ xử lý" (pending)
          </div>
          <div className="guide-text">
            • Nhấn nút "Nhận" để nhận đơn hàng về cửa hàng của bạn
          </div>
          <div className="guide-text">
            • Sau khi nhận, đơn hàng sẽ xuất hiện trong danh sách đơn hàng chính
          </div>
        </div>
        
        <Row gutter={16} className="stats-row">
          <Col span={8}>
            <Card size="small" className="stats-card">
              <div className="stats-number total">
                {stats.total}
              </div>
              <div className="stats-label">
                Tổng đơn hàng
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="stats-card">
              <div className="stats-number pending">
                {stats.pending}
              </div>
              <div className="stats-label">
                Chờ xử lý
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="stats-card">
              <div className="stats-number cancelled">
                {stats.cancelled}
              </div>
              <div className="stats-label">
                Đã hủy
              </div>
            </Card>
          </Col>
        </Row>
        
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          Làm mới danh sách
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={unassignedOrders}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        className="admin-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} đơn hàng`,
          pageSizeOptions: ['10', '20', '50'],
          position: ['bottomCenter'],
        }}
        locale={{
          emptyText: (
            <div className="empty-state">
              <BellOutlined className="empty-state-icon" />
              <div className="empty-state-title">
                Không có đơn hàng mới
              </div>
              <div className="empty-state-description">
                Tất cả đơn hàng đã được gán cho các cửa hàng
              </div>
            </div>
          )
        }}
      />
    </Modal>
  );
});

UnassignedOrdersModal.displayName = 'UnassignedOrdersModal';

export default UnassignedOrdersModal; 