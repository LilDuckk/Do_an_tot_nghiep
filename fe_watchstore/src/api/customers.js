import api from './index';

export const customerApi = {
  // Lấy danh sách khách hàng
  getAll: (params) => api.get('/customers/', { params }),
  
  // Lấy chi tiết khách hàng
  getById: (id) => api.get(`/customers/${id}/`),
  
  // Tạo khách hàng mới
  create: (data) => api.post('/customers/', data),
  
  // Cập nhật thông tin khách hàng
  update: (id, data) => api.put(`/customers/${id}/`, data),
  
  // Xóa khách hàng
  delete: (id) => api.delete(`/customers/${id}/`),
  
  // Tìm kiếm khách hàng
  search: (keyword) => api.get('/customers/', { params: { search: keyword } }),
  
  // Lọc khách hàng
  filter: (filters) => api.get('/customers/', { params: filters }),
  
  // Lấy lịch sử mua hàng
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchase-history/`),
}; 