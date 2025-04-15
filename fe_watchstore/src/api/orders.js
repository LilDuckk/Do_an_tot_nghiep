import api from './index';

export const orderApi = {
  // Lấy danh sách đơn hàng
  getAll: (params) => api.get('/orders/', { params }),
  
  // Lấy chi tiết đơn hàng
  getById: (id) => api.get(`/orders/${id}/`),
  
  // Tạo đơn hàng mới
  create: (data) => api.post('/orders/', data),
  
  // Cập nhật trạng thái đơn hàng
  updateStatus: (id, status) => api.put(`/orders/${id}/`, { status }),
  
  // Xóa đơn hàng
  delete: (id) => api.delete(`/orders/${id}/`),
  
  // Hủy đơn hàng
  cancel: (id) => api.post(`/orders/${id}/cancel/`),
  
  // Tìm kiếm đơn hàng
  search: (keyword) => api.get('/orders/', { params: { search: keyword } }),
  
  // Lọc đơn hàng
  filter: (filters) => api.get('/orders/', { params: filters }),
  
  // Lấy lịch sử đơn hàng
  getHistory: (id) => api.get(`/orders/${id}/history/`),
}; 