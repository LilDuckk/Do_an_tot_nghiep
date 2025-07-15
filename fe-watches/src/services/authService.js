import axiosInstance from './axiosConfig';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authService = {
  // Lưu token
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
  async isTokenValid() {
    try {
      const token = this.getAccessToken();
      if (!token) return false;

      // Gọi API để verify token
      await axiosInstance.post('/account/auth/token/verify/', {
        token: token
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  // Kiểm tra và refresh token nếu cần
  async checkAndRefreshToken() {
    try {
      const isValid = await this.isTokenValid();
      if (!isValid) {
        return await this.refreshToken();
      }
      return this.getAccessToken();
    } catch (error) {
      this.clearTokens();
      throw error;
    }
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
  }
}; 