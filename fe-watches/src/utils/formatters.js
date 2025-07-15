/**
 * Utility functions để format dữ liệu cho client
 */

import dayjs from 'dayjs';

/**
 * Format ngày tháng
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format ngày tháng với giờ
 */
export const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format tiền tệ VND
 */
export const formatCurrency = (amount) => {
  if (!amount) return '-';
  return `${parseFloat(amount).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}đ`;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Format số lượng
 */
export const formatQuantity = (quantity) => {
  if (!quantity) return '0';
  return quantity.toString();
};

/**
 * Format trạng thái
 */
export const formatStatus = (status) => {
  const statusMap = {
    'active': 'Hoạt động',
    'inactive': 'Ẩn',
    'published': 'Đã đăng',
    'draft': 'Bản nháp',
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
}; 