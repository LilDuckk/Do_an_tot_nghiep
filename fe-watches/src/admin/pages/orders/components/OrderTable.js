/**
 * Component bảng đơn hàng
 * 
 * Yêu cầu:
 * - Sử dụng Ant Design Table
 * - Hiển thị đầy đủ thông tin đơn hàng
 * - Tích hợp với ActionButtons component
 * - Xử lý sorting và pagination
 * - Responsive design
 * - Loading states
 * - Empty states
 * - Tối ưu performance với React.memo
 * - Tích hợp với useOrderData và useOrderActions
 */

import React, { useMemo } from 'react';
import { Table, Space, Tooltip, Button, Badge } from 'antd';
import { 
  SettingOutlined, 
  CarOutlined, 
  CheckCircleOutlined, 
  StopOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import ActionButtons from '@/admin/components/common/ActionButtons';
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentMethod } from '@/admin/utils/formatters';
import { ORDER_STATUSES, MAIN_TABLE_COLUMNS } from '@/admin/pages/orders/utils';

const OrderTable = React.memo(({ 
  orders, 
  loading, 
  pagination,
  onTableChange,
  onView,
  onEdit,
  onDelete,
  onProcessOrder,
  onShipOrder,
  onConfirmOrder,
  onCancelOrder,
  hasAccess = true,
  scroll = { x: 1200 }
}) => {
  // Tạo columns với memo để tối ưu performance
  const columns = useMemo(() => [
    {
      ...MAIN_TABLE_COLUMNS.ID,
    },
    {
      ...MAIN_TABLE_COLUMNS.CUSTOMER,
    },
    {
      ...MAIN_TABLE_COLUMNS.STORE,
    },
    {
      ...MAIN_TABLE_COLUMNS.STATUS,
      render: (status) => formatOrderStatus(status),
    },
    {
      ...MAIN_TABLE_COLUMNS.PAYMENT_METHOD,
      render: (method) => formatPaymentMethod(method),
    },
    {
      ...MAIN_TABLE_COLUMNS.TOTAL_AMOUNT,
      render: (amount) => formatCurrency(amount),
    },
    {
      ...MAIN_TABLE_COLUMNS.CREATED_AT,
      render: (date) => formatDate(date),
    },
    {
      ...MAIN_TABLE_COLUMNS.EMPLOYEE,
      render: (employee) => {
        if (!employee) return '-';
        
        // Nếu employee là object
        if (typeof employee === 'object') {
          return (
            <div>
              <div className="employee-name">
                {employee.name || employee.employee_code || (employee.user_details && employee.user_details.username) || '-'}
              </div>
              {employee.position && (
                <div className="employee-position">
                  {employee.position}
                </div>
              )}
            </div>
          );
        }
        
        // Nếu employee là string hoặc number
        return employee;
      }
    },
    {
      ...MAIN_TABLE_COLUMNS.ACTIONS,
      render: (_, record) => {
        const additionalActions = [];
        
        // Thêm action theo trạng thái đơn hàng
        if (record.status === ORDER_STATUSES.PENDING) {
          additionalActions.push({
            key: 'process',
            icon: <SettingOutlined />,
            onClick: () => onProcessOrder?.(record),
            type: 'default',
            tooltip: 'Chuyển sang đang xử lý',
            style: { background: '#1890ff', borderColor: '#1890ff', color: '#fff' }
          });
        }
        
        if (record.status === ORDER_STATUSES.PROCESSING) {
          additionalActions.push({
            key: 'ship',
            icon: <CarOutlined />,
            onClick: () => onShipOrder?.(record),
            type: 'default',
            tooltip: 'Chuyển sang đang giao hàng',
            style: { background: '#1890ff', borderColor: '#1890ff', color: '#fff' }
          });
        }
        
        if (record.status === ORDER_STATUSES.SHIPPED) {
          additionalActions.push({
            key: 'confirm',
            icon: <CheckCircleOutlined />,
            onClick: () => onConfirmOrder?.(record),
            type: 'default',
            tooltip: 'Xác nhận hoàn thành',
            style: { background: '#52c41a', borderColor: '#52c41a', color: '#fff' }
          });
        }
        
        if (record.status !== ORDER_STATUSES.DELIVERED && record.status !== ORDER_STATUSES.CANCELLED) {
          additionalActions.push({
            key: 'cancel',
            icon: <StopOutlined />,
            onClick: () => onCancelOrder?.(record),
            type: 'default',
            danger: true,
            tooltip: 'Hủy đơn hàng',
            style: { borderColor: '#ff4d4f', color: '#ff4d4f', background: '#fff' }
          });
        }

        return (
          <ActionButtons
            record={record}
            onView={() => onView?.(record)}
            onEdit={() => onEdit?.(record)}
            onDelete={() => onDelete?.(record)}
            hasAccess={hasAccess}
            showView={true}
            showEdit={true}
            showDelete={false}
            additionalActions={additionalActions}
            entityName="đơn hàng"
          />
        );
      },
    },
  ], [onProcessOrder, onShipOrder, onConfirmOrder, onCancelOrder, onView, onEdit, onDelete, hasAccess]);

  return (
    <Table
      columns={columns}
      dataSource={orders}
      loading={loading}
      rowKey="id"
      className="admin-table"
      scroll={scroll}
      pagination={pagination}
      onChange={onTableChange}
      locale={{
        emptyText: (
          <div className="empty-state">
            <ShoppingCartOutlined className="empty-state-icon" />
            <div className="empty-state-title">
              Không có đơn hàng nào
            </div>
            <div className="empty-state-description">
              Hãy tạo đơn hàng mới hoặc kiểm tra lại bộ lọc
            </div>
          </div>
        )
      }}
    />
  );
});

OrderTable.displayName = 'OrderTable';

export default OrderTable; 