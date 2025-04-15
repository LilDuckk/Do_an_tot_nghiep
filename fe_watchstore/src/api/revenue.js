import api from './index';

export const revenueApi = {
  // Lấy danh sách doanh thu
  getAll: (params) => api.get('/revenue/', { params }),
  
  // Lấy chi tiết doanh thu
  getById: (id) => api.get(`/revenue/${id}/`),
  
  // Tạo bản ghi doanh thu
  create: (data) => api.post('/revenue/', data),
  
  // Cập nhật doanh thu
  update: (id, data) => api.put(`/revenue/${id}/`, data),
  
  // Xóa bản ghi doanh thu
  delete: (id) => api.delete(`/revenue/${id}/`),
  
  // Lấy thống kê doanh thu theo ngày
  getDailyStats: (params) => api.get('/revenue/daily-stats/', { params }),
  
  // Lấy thống kê doanh thu theo tháng
  getMonthlyStats: (params) => api.get('/revenue/monthly-stats/', { params }),
  
  // Lọc doanh thu
  filter: (filters) => api.get('/revenue/', { params: filters }),
  
  // Lấy báo cáo doanh thu
  getReport: (params) => api.get('/revenue/report/', { params }),
}; 