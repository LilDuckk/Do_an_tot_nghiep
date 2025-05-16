import axiosInstance from './axiosConfig';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const REFRESH_THRESHOLD = 60; // Refresh token 60 giây trước khi hết hạn

export const authService = {
  // Lưu token và thời gian hết hạn
  setTokens(accessToken, refreshToken) {
    const expiryTime = Date.now() + 600 * 1000; // 600 giây = 10 phút
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },

  // Lấy access token
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Lấy refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Kiểm tra token còn hiệu lực không
  isTokenValid() {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;
    return Date.now() < parseInt(expiryTime);
  },

  // Kiểm tra token sắp hết hạn
  isTokenExpiringSoon() {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() + (REFRESH_THRESHOLD * 1000) > parseInt(expiryTime);
  },

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('Không có refresh token');

      const response = await axiosInstance.post('/account/auth/token/refresh/', {
        refresh: refreshToken
      });

      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh);
        return response.data.access;
      }
      throw new Error('Không thể refresh token');
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      this.clearTokens();
      throw error;
    }
  },

  // Xóa token
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}; 