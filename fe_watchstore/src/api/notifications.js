import api from './index';

export const notificationApi = {
  // Lấy danh sách thông báo
  getAll: (params) => api.get('/notifications/', { params }),
  
  // Lấy chi tiết thông báo
  getById: (id) => api.get(`/notifications/${id}/`),
  
  // Tạo thông báo mới
  create: (data) => api.post('/notifications/', data),
  
  // Cập nhật thông báo
  update: (id, data) => api.put(`/notifications/${id}/`, data),
  
  // Xóa thông báo
  delete: (id) => api.delete(`/notifications/${id}/`),
  
  // Đánh dấu đã đọc
  markAsRead: (id) => api.put(`/notifications/${id}/read/`),
  
  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => api.put('/notifications/mark-all-read/'),
  
  // Lọc thông báo
  filter: (filters) => api.get('/notifications/', { params: filters }),
  
  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: () => api.get('/notifications/unread-count/'),
}; 