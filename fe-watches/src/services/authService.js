import axiosInstance from './axiosConfig';
import { AUTH_ENDPOINTS } from '../config/api';

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
    const token = localStorage.getItem(TOKEN_KEY);
    return token;
  },

  // Lấy refresh token
  getRefreshToken() {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    return token;
  },

  // Kiểm tra token còn hiệu lực không
  async isTokenValid() {
    const token = this.getAccessToken();
    try {
      if (!token) return false;
      await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_TOKEN, { token });
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