import api from './index';

export const authApi = {
  // Đăng ký
  register: (data) => api.post('/auth/register/', data),
  
  // Đăng nhập
  login: (data) => api.post('/auth/login/', data),
  
  // Làm mới token
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  
  // Lấy thông tin user
  getProfile: () => api.get('/auth/profile/'),
  
  // Cập nhật thông tin user
  updateProfile: (data) => api.put('/auth/profile/', data),
  
  // Đổi mật khẩu
  changePassword: (data) => api.post('/auth/change-password/', data),
}; 