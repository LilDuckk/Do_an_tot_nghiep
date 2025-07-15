/**
 * Utility functions để format dữ liệu đơn hàng
 * 
 * Yêu cầu:
 * - formatCurrency: format tiền tệ VND
 * - formatDate: format ngày tháng
 * - formatOrderStatus: format trạng thái đơn hàng
 * - formatPaymentStatus: format trạng thái thanh toán
 * - formatPaymentMethod: format phương thức thanh toán
 * - formatShippingMethod: format phương thức vận chuyển
 * - getStatusColor: lấy màu cho trạng thái
 * - formatOrderId: format mã đơn hàng
 */

import dayjs from 'dayjs';

/**
 * Format tiền tệ VND
 */
export const formatCurrency = (amount) => {
  if (!amount) return '-';
  return `${parseFloat(amount).toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}đ`;
};

/**
 * Format ngày tháng
 */
export const formatDate = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format trạng thái đơn hàng
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'shipped': 'Đã giao hàng',
    'delivered': 'Đã nhận hàng',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

/**
 * Format trạng thái thanh toán
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': 'Chờ thanh toán',
    'paid': 'Đã thanh toán',
    'failed': 'Thanh toán thất bại'
  };
  return statusMap[status] || status;
};

/**
 * Format phương thức thanh toán
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'cash': 'Tiền mặt',
    'credit_card': 'Thẻ tín dụng',
    'bank_transfer': 'Chuyển khoản'
  };
  return methodMap[method] || method;
};

/**
 * Format phương thức vận chuyển
 */
export const formatShippingMethod = (method) => {
  const methodMap = {
    'standard': 'Tiêu chuẩn',
    'express': 'Nhanh',
    'overnight': 'Qua đêm'
  };
  return methodMap[method] || method;
};

/**
 * Lấy màu cho trạng thái
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'pending': '#faad14',
    'processing': '#1890ff',
    'shipped': '#722ed1',
    'delivered': '#52c41a',
    'cancelled': '#ff4d4f'
  };
  return colorMap[status] || '#666666';
};

/**
 * Format mã đơn hàng
 */
export const formatOrderId = (id) => {
  if (!id) return '-';
  return `#${id.toString().padStart(6, '0')}`;
};

/**
 * Format thông tin khách hàng
 */
export const formatCustomerInfo = (customer) => {
  if (!customer) return '-';
  if (typeof customer === 'string') return customer;
  return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.phone || customer.email || '-';
};

/**
 * Format thông tin sản phẩm variant
 */
export const formatProductVariant = (variant) => {
  if (!variant) return '-';
  const attributes = variant.attribute_values_detail?.map(attr => 
    `${attr.attribute_type.name}: ${attr.value}`
  ).join(', ');
  return `${variant.product_name || variant.name || ''} ${attributes ? `(${attributes})` : ''}`.trim();
};

/**
 * Format thông tin bảo hành
 */
export const formatWarrantyInfo = (warrantyInfo) => {
  if (!warrantyInfo || !warrantyInfo.has_warranty) {
    return 'Không có bảo hành';
  }
  return `${warrantyInfo.warranty_period} ${warrantyInfo.warranty_period_unit}`;
}; 

/**
 * Format tiền tệ VND (số nguyên)
 */
export const formatVND = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'decimal', 
    maximumFractionDigits: 1 
  }).format(value);
}; 