/**
 * Helper functions cho Orders
 * 
 * Yêu cầu:
 * - copyToClipboard: copy text to clipboard
 * - apiCall: helper function cho API calls
 * - filterEmployeesByStore: lọc nhân viên theo cửa hàng
 * - calculateOrderTotal: tính tổng tiền đơn hàng
 * - formatOrderData: format dữ liệu đơn hàng cho API
 */

import { message } from 'antd';
import { STORE_ENDPOINTS } from '@/config/api';

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text, successMessage = 'Đã copy thành công') => {
  try {
    await navigator.clipboard.writeText(text);
    message.success(successMessage);
  } catch (err) {
    // Fallback cho các trình duyệt cũ
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    message.success(successMessage);
  }
};

/**
 * Helper function cho API calls
 */
export const apiCall = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // Xử lý các response không có body (như 204 No Content)
    if (response.status === 204) {
      return { success: true, status: 204, data: null };
    }

    // Xử lý các response có body
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Nếu không parse được JSON, có thể là response rỗng hoặc text
      const textData = await response.text();
      data = textData || null;
    }
    
    if (!response.ok) {
      // Trả về response với success: false và message từ server
      // Xử lý các format error khác nhau
      let errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      
      // Nếu data là string, có thể là JSON string
      if (typeof data === 'string') {
        try {
          const parsedData = JSON.parse(data);
          errorMessage = parsedData.error || parsedData.message || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, sử dụng data trực tiếp
          errorMessage = data || errorMessage;
        }
      }
      
      return { 
        success: false, 
        status: response.status,
        message: errorMessage,
        data: data 
      };
    }

    return { success: true, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lọc nhân viên theo cửa hàng sử dụng API
 */
export const filterEmployeesByStore = async (storeId) => {
  if (!storeId) {
    return [];
  }
  
  try {
    // Sử dụng endpoint EMPLOYEES_LIST_ALL với param store để lọc nhân viên theo cửa hàng
    const result = await apiCall(`${STORE_ENDPOINTS.EMPLOYEES_LIST_ALL}?store=${storeId}`);
    
    if (result.success && result.data) {
      return Array.isArray(result.data) ? result.data : [];
    } else {
      console.error('Failed to filter employees by store:', result);
      return [];
    }
  } catch (error) {
    console.error('Error filtering employees by store:', error);
    return [];
  }
};

/**
 * Tính tổng tiền đơn hàng
 */
export const calculateOrderTotal = (subtotal = 0, tax = 0, shippingFee = 0, discount = 0) => {
  const subtotalAmount = parseFloat(subtotal) || 0;
  const taxAmount = parseFloat(tax) || 0;
  const shippingFeeAmount = parseFloat(shippingFee) || 0;
  const discountAmount = parseFloat(discount) || 0;

  return subtotalAmount + taxAmount + shippingFeeAmount - discountAmount;
};

/**
 * Format dữ liệu đơn hàng cho API
 */
export const formatOrderData = (values, orderDetails = [], userInfo = {}) => {
  const {
    isSuperUser = false,
    userEmployeeId = null,
    userStoreId = null
  } = userInfo;

  return {
    customer: values.customer || null,
    store: isSuperUser ? values.store : userStoreId,
    employee_id: isSuperUser ? values.employee : userEmployeeId,
    order_date: values.order_date ? values.order_date.format('YYYY-MM-DDTHH:mm:ss[Z]') : null,
    status: values.status || null,
    payment_method: values.payment_method || null,
    payment_status: values.payment_status || null,
    shipping_address: values.shipping_address || null,
    shipping_method: values.shipping_method || null,
    tracking_number: values.tracking_number || null,
    // Các trường tiền tệ có thể để trống, backend sẽ tự động tính
    subtotal: values.subtotal && values.subtotal !== '' ? parseFloat(values.subtotal).toFixed(2) : null,
    tax: values.tax && values.tax !== '' ? parseFloat(values.tax).toFixed(2) : 0,
    shipping_fee: values.shipping_fee && values.shipping_fee !== '' ? parseFloat(values.shipping_fee).toFixed(2) : 0,
    discount: values.discount && values.discount !== '' ? parseFloat(values.discount).toFixed(2) : 0,
    total_amount: values.total_amount && values.total_amount !== '' ? parseFloat(values.total_amount).toFixed(2) : null,
    note: values.note || null,
    is_online_order: values.is_online_order || false,
    order_details: orderDetails.map(detail => ({
      id: detail.id,
      product_variant: detail.variant?.id || detail.product_variant,
      quantity: detail.quantity,
      coupon_id: detail.coupon?.id && detail.coupon?.id !== '' ? detail.coupon.id : null
    }))
  };
};

/**
 * Format dữ liệu chi tiết đơn hàng cho API
 */
export const formatOrderDetailData = (values, orderId) => {
  // Xử lý coupon_id: nếu undefined hoặc empty string thì gửi null
  const couponId = values.coupon_id && values.coupon_id !== '' ? values.coupon_id : null;
  
  return {
    product_variant: values.product_variant,
    quantity: values.quantity,
    coupon_id: couponId,
    order: orderId
  };
};

/**
 * Lấy thông tin user từ localStorage
 */
export const getUserInfo = () => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const userEmployeeId = user.employee_id || null;
  const userStoreId = user.store_id || null;

  return {
    user,
    isSuperUser,
    userEmployeeId,
    userStoreId
  };
};

/**
 * Tạo URL query params từ object
 */
export const buildQueryParams = (paramsObj) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  return queryParams;
};

/**
 * Xử lý response từ API
 */
export const handleApiResponse = (response, successMessage = 'Thao tác thành công') => {
  if (response.success) {
    message.success(successMessage);
    return { success: true, data: response.data };
  } else {
    // Sử dụng message từ response nếu có
    const errorMessage = response.message || response.error || 'Có lỗi xảy ra';
    message.error(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Xử lý error từ API
 */
export const handleApiError = (error, customMessage = 'Có lỗi xảy ra') => {
  console.error('API Error:', error);
  message.error(customMessage);
  return { success: false, error };
};

/**
 * Extract error message từ response
 */
export const extractErrorMessage = (response) => {
  if (!response) return 'Có lỗi xảy ra';
  
  // Ưu tiên message từ response
  if (response.message) return response.message;
  
  // Kiểm tra error field
  if (response.error) return response.error;
  
  // Kiểm tra data.error nếu có
  if (response.data && response.data.error) return response.data.error;
  
  // Kiểm tra nếu data là string JSON
  if (response.data && typeof response.data === 'string') {
    try {
      const parsedData = JSON.parse(response.data);
      if (parsedData.error) return parsedData.error;
      if (parsedData.message) return parsedData.message;
    } catch (e) {
      // Nếu không parse được, sử dụng data trực tiếp
      return response.data;
    }
  }
  
  return 'Có lỗi xảy ra';
}; 