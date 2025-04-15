import api from './index';

export const inventoryApi = {
  // Lấy danh sách tồn kho
  getAll: (params) => api.get('/inventory/', { params }),
  
  // Lấy chi tiết tồn kho
  getById: (id) => api.get(`/inventory/${id}/`),
  
  // Tạo bản ghi tồn kho
  create: (data) => api.post('/inventory/', data),
  
  // Cập nhật tồn kho
  update: (id, data) => api.put(`/inventory/${id}/`, data),
  
  // Xóa bản ghi tồn kho
  delete: (id) => api.delete(`/inventory/${id}/`),
  
  // Điều chỉnh số lượng tồn kho
  adjustStock: (id, data) => api.post(`/inventory/${id}/adjust_stock/`, data),
  
  // Tìm kiếm tồn kho
  search: (keyword) => api.get('/inventory/', { params: { search: keyword } }),
  
  // Lọc tồn kho
  filter: (filters) => api.get('/inventory/', { params: filters }),
  
  // Lấy báo cáo tồn kho
  getReport: (params) => api.get('/inventory/report/', { params }),
}; 