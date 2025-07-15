import { Tag, Tooltip as AntTooltip } from 'antd';
import { formatVND } from '@/admin/utils/formatters';

export const bestSellersColumns = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
    render: (text, record) => (
      <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
        <div>
          <div style={{fontWeight: 600}}>{text}</div>
          <div style={{fontSize: 12, color: '#666'}}>{record.brand_name || 'N/A'}</div>
        </div>
      </AntTooltip>
    ),
  },
  {
    title: 'Số lượng bán',
    dataIndex: 'total_quantity',
    key: 'total_quantity',
    sorter: (a, b) => a.total_quantity - b.total_quantity,
    render: (value) => (
      <Tag color="blue">{value}</Tag>
    ),
  },
  {
    title: 'Doanh thu',
    dataIndex: 'total_revenue',
    key: 'total_revenue',
    sorter: (a, b) => a.total_revenue - b.total_revenue,
    render: (value) => (
      <span style={{fontWeight: 600, color: '#52c41a'}}>
        {formatVND(value)}₫
      </span>
    ),
  },
  {
    title: 'Giảm giá',
    dataIndex: 'total_discount',
    key: 'total_discount',
    render: (value) => (
      <span style={{color: '#faad14'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
  {
    title: 'Doanh thu ròng',
    dataIndex: 'net_revenue',
    key: 'net_revenue',
    render: (value) => (
      <span style={{fontWeight: 600, color: '#1890ff'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
  {
    title: 'Tồn kho',
    dataIndex: 'current_stock',
    key: 'current_stock',
    render: (value) => (
      <Tag color={value < 10 ? 'red' : value < 50 ? 'orange' : 'green'}>
        {value || 0}
      </Tag>
    ),
  },
];

export const turnoverColumns = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 200,
    render: (text, record) => (
      <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
        <div>
          <div style={{fontWeight: 600}}>{text}</div>
          <div style={{fontSize: 12, color: '#666'}}>{record.sku || 'N/A'}</div>
        </div>
      </AntTooltip>
    ),
  },
  {
    title: 'Tỷ lệ luân chuyển',
    dataIndex: 'turnover_rate',
    key: 'turnover_rate',
    width: 120,
    sorter: (a, b) => a.turnover_rate - b.turnover_rate,
    render: (value) => {
      let color = 'red';
      if (value > 100) color = 'green';
      else if (value > 50) color = 'blue';
      else if (value > 20) color = 'orange';
      
      return (
        <Tag color={color}>
          {value.toFixed(1)}
        </Tag>
      );
    },
  },
  {
    title: 'Số lượng bán',
    dataIndex: 'total_sold',
    key: 'total_sold',
    width: 100,
    render: (value) => (
      <span style={{fontWeight: 600, color: '#52c41a'}}>
        {value || 0}
      </span>
    ),
  },
  {
    title: 'Tồn kho hiện tại',
    dataIndex: 'current_stock',
    key: 'current_stock',
    width: 120,
    render: (value) => (
      <Tag color={value < 10 ? 'red' : value < 50 ? 'orange' : 'green'}>
        {value || 0}
      </Tag>
    ),
  },
  {
    title: 'Ngày tồn kho',
    dataIndex: 'days_of_inventory',
    key: 'days_of_inventory',
    width: 120,
    render: (value) => {
      let color = 'red';
      if (value < 30) color = 'green';
      else if (value < 90) color = 'orange';
      
      return (
        <Tag color={color}>
          {value || 0} ngày
        </Tag>
      );
    },
  },
  {
    title: 'Đơn hàng',
    dataIndex: 'total_orders',
    key: 'total_orders',
    width: 80,
    render: (value) => (
      <Tag color="blue">{value || 0}</Tag>
    ),
  },
  {
    title: 'TB/đơn',
    dataIndex: 'average_quantity_per_order',
    key: 'average_quantity_per_order',
    width: 80,
    render: (value) => (
      <span style={{fontSize: 12}}>
        {(value || 0).toFixed(1)}
      </span>
    ),
  },
  {
    title: 'Doanh thu',
    dataIndex: 'total_revenue',
    key: 'total_revenue',
    width: 120,
    render: (value) => (
      <span style={{fontWeight: 600, color: '#1890ff'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
  {
    title: 'Giá/đơn vị',
    dataIndex: 'revenue_per_unit',
    key: 'revenue_per_unit',
    width: 120,
    render: (value) => (
      <span style={{fontSize: 12, color: '#666'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
];

export const returnOrdersColumns = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
    render: (text, record) => (
      <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
        <div>
          <div style={{fontWeight: 600}}>{text}</div>
          <div style={{fontSize: 12, color: '#666'}}>{record.brand_name || 'N/A'}</div>
        </div>
      </AntTooltip>
    ),
  },
  {
    title: 'Số lượng bán',
    dataIndex: 'total_sold_quantity',
    key: 'total_sold_quantity',
    render: (value) => value || 0,
  },
  {
    title: 'Số lượng trả',
    dataIndex: 'total_returned_quantity',
    key: 'total_returned_quantity',
    sorter: (a, b) => a.total_returned_quantity - b.total_returned_quantity,
    render: (value) => (
      <Tag color="red">{value || 0}</Tag>
    ),
  },
  {
    title: 'Tỷ lệ trả',
    dataIndex: 'return_rate',
    key: 'return_rate',
    sorter: (a, b) => a.return_rate - b.return_rate,
    render: (value) => (
      <Tag color={value > 10 ? 'red' : value > 5 ? 'orange' : 'green'}>
        {value.toFixed(2)}%
      </Tag>
    ),
  },
  {
    title: 'Tiền hoàn',
    dataIndex: 'total_refund_amount',
    key: 'total_refund_amount',
    render: (value) => (
      <span style={{fontWeight: 600, color: '#ff4d4f'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
  {
    title: 'Đơn trả',
    dataIndex: 'return_orders_count',
    key: 'return_orders_count',
    render: (value) => (
      <Tag color="blue">{value || 0}</Tag>
    ),
  },
];

export const warrantyColumns = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product_name',
    key: 'product_name',
    render: (text, record) => (
      <AntTooltip title={`SKU: ${record.sku || 'N/A'}`}>
        <div>
          <div style={{fontWeight: 600}}>{text}</div>
          <div style={{fontSize: 12, color: '#666'}}>{record.brand_name || 'N/A'}</div>
        </div>
      </AntTooltip>
    ),
  },
  {
    title: 'Số lượng bảo hành',
    dataIndex: 'total_warranties',
    key: 'total_warranties',
    render: (value) => value || 0,
  },
  {
    title: 'Số lần bảo hành',
    dataIndex: 'total_claims',
    key: 'total_claims',
    sorter: (a, b) => a.total_claims - b.total_claims,
    render: (value) => (
      <Tag color="blue">{value || 0}</Tag>
    ),
  },
  {
    title: 'Tỷ lệ bảo hành',
    dataIndex: 'claim_rate',
    key: 'claim_rate',
    sorter: (a, b) => a.claim_rate - b.claim_rate,
    render: (value) => (
      <Tag color={value > 10 ? 'red' : value > 5 ? 'orange' : 'green'}>
        {value.toFixed(2)}%
      </Tag>
    ),
  },
  {
    title: 'Chi phí sửa chữa',
    dataIndex: 'total_repair_cost',
    key: 'total_repair_cost',
    render: (value) => (
      <span style={{fontWeight: 600, color: '#722ed1'}}>
        {formatVND(value || 0)}₫
      </span>
    ),
  },
]; 