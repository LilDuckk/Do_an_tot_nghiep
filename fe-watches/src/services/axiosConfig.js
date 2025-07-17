import axios from 'axios';
import { authService } from './authService';

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const skipAuthUrls = [
      '/account/auth/login/',
      '/account/auth/token/refresh/'
    ];
    if (skipAuthUrls.some(url => config.url.endsWith(url))) {
      return config;
    }

    // Kiểm tra nếu token sắp hết hạn
    if (authService.isTokenExpiringSoon && authService.isTokenExpiringSoon()) {
      try {
        const newToken = await authService.refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (error) {
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }
    }

    // Thêm token vào header nếu có
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        authService.clearTokens();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 