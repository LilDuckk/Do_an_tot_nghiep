import api from './index';

export const couponApi = {
  // Lấy danh sách mã giảm giá
  getAll: (params) => api.get('/coupons/', { params }),
  
  // Lấy chi tiết mã giảm giá
  getById: (id) => api.get(`/coupons/${id}/`),
  
  // Tạo mã giảm giá mới
  create: (data) => api.post('/coupons/', data),
  
  // Cập nhật mã giảm giá
  update: (id, data) => api.put(`/coupons/${id}/`, data),
  
  // Xóa mã giảm giá
  delete: (id) => api.delete(`/coupons/${id}/`),
  
  // Xác thực mã giảm giá
  verify: (code) => api.post('/coupons/verify/', { code }),
  
  // Lấy danh sách mã giảm giá đã sử dụng
  getUsedCoupons: (params) => api.get('/coupons/used/', { params }),
  
  // Lọc mã giảm giá
  filter: (filters) => api.get('/coupons/', { params: filters }),
}; 