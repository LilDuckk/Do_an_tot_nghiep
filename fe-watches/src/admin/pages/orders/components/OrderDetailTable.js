import React from 'react';
import { Table, Space, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/admin/utils/formatters';
import { ORDER_DETAIL_COLUMNS, copyToClipboard } from '@/admin/pages/orders/utils';

export default function OrderDetailTable({
  orderDetails,
  loading,
  onEdit,
  onDelete
}) {
  const columns = [
    {
      ...ORDER_DETAIL_COLUMNS.PRODUCT,
      render: (variant) => (
        <div>
          <div className="product-variant-name">
            {variant?.product_name || '-'}
          </div>
          <div className="product-variant-sku">
            {variant?.sku || '-'}
          </div>
          {variant?.attribute_values_detail && variant.attribute_values_detail.length > 0 && (
            <div className="product-variant-attributes">
              {variant.attribute_values_detail.map(attr => 
                `${attr.attribute_type.name}: ${attr.value}`
              ).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      ...ORDER_DETAIL_COLUMNS.WARRANTY,
      render: (warrantyInfo, record) => {
        if (!warrantyInfo || !warrantyInfo.has_warranty) {
          return <span className="warranty-no-warranty">Không có bảo hành</span>;
        }
        
        return (
          <div>
            <div className="warranty-period">
              {warrantyInfo.warranty_period} {warrantyInfo.warranty_period_unit}
            </div>
            <div className="warranty-message">
              {warrantyInfo.message}
            </div>
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(warrantyInfo.warranty_number, `Đã copy mã bảo hành: ${warrantyInfo.warranty_number}`)}
              className="warranty-copy-btn"
            >
              Copy mã bảo hành
            </Button>
          </div>
        );
      },
    },
    {
      ...ORDER_DETAIL_COLUMNS.QUANTITY,
    },
    {
      ...ORDER_DETAIL_COLUMNS.UNIT_PRICE,
      render: (price) => formatCurrency(price),
    },
    {
      ...ORDER_DETAIL_COLUMNS.FINAL_PRICE,
      render: (total) => formatCurrency(total),
    },
    {
      ...ORDER_DETAIL_COLUMNS.ACTIONS,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa sản phẩm">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orderDetails}
      loading={loading}
      rowKey="id"
      scroll={{ x: 800 }}
      className="admin-table"
      pagination={false}
    />
  );
} 