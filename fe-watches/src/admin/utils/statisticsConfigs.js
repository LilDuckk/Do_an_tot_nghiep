// Config cho Return Orders Statistics
export const getReturnOrderStatisticsConfig = (statistics) => [
  {
    title: 'Tổng đơn trả hàng',
    value: statistics.total_returns,
    suffix: 'đơn',
    cardType: 'info'
  },
  {
    title: 'Chờ duyệt',
    value: statistics.pending_returns,
    suffix: 'đơn',
    cardType: 'warning'
  },
  {
    title: 'Đã duyệt',
    value: statistics.approved_returns,
    suffix: 'đơn',
    cardType: 'info'
  },
  {
    title: 'Hoàn thành',
    value: statistics.completed_returns,
    suffix: 'đơn',
    cardType: 'success'
  },
  {
    title: 'Tổng tiền hoàn',
    value: statistics.total_refund_amount,
    suffix: 'VNĐ',
    formatter: value => `${parseFloat(value || 0).toLocaleString('vi-VN')}`,
    cardType: 'info'
  },
  {
    title: 'Tỷ lệ đơn đã duyệt',
    value: statistics.total_returns > 0 ? Math.round((statistics.approved_returns / statistics.total_returns) * 100) : 0,
    suffix: '%',
    cardType: 'success'
  }
];

// Config cho Inventory Transactions Statistics
export const getInventoryTransactionStatisticsConfig = (summary = {}, currentPage = 1, totalPages = 1) => [
  {
    title: 'Tổng giao dịch',
    value: summary.total_transactions || 0,
    suffix: 'giao dịch',
    cardType: 'info'
  },
  {
    title: 'Tổng nhập kho',
    value: summary.total_in || 0,
    suffix: 'sản phẩm',
    cardType: 'success'
  },
  {
    title: 'Tổng xuất kho',
    value: summary.total_out || 0,
    suffix: 'sản phẩm',
    cardType: 'danger'
  },
  {
    title: 'Chênh lệch',
    value: summary.net_change || 0,
    suffix: 'sản phẩm',
    cardType: 'info'
  }
];

// Config cho Inventory Transactions với thông tin trang
export const getInventoryTransactionStatisticsConfigWithPage = (summary = {}, currentPage = 1, totalPages = 1) => [
  {
    title: 'Tổng giao dịch',
    value: summary.total_transactions || 0,
    suffix: 'giao dịch',
    cardType: 'info',
    extra: `Trang ${currentPage} / ${totalPages}`
  },
  {
    title: 'Tổng nhập kho',
    value: summary.total_in || 0,
    suffix: 'sản phẩm',
    cardType: 'success'
  },
  {
    title: 'Tổng xuất kho',
    value: summary.total_out || 0,
    suffix: 'sản phẩm',
    cardType: 'danger'
  },
  {
    title: 'Chênh lệch',
    value: summary.net_change || 0,
    suffix: 'sản phẩm',
    cardType: 'info'
  }
]; 