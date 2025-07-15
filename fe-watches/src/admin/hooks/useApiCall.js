import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * Hook xử lý API calls chung
 * @returns {object} - Các function để xử lý API
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  /**
   * Tạo headers với token authentication
   * @param {object} additionalHeaders - Headers bổ sung
   * @returns {object} - Headers object
   */
  const createAuthHeaders = useCallback((additionalHeaders = {}) => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
  }, []);

  /**
   * Xử lý lỗi API chung
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Thông báo lỗi mặc định
   */
  const handleApiError = useCallback((error, defaultMessage = 'Có lỗi xảy ra') => {
    console.error('API Error:', error);
    
    if (error.message) {
      message.error(error.message);
    } else {
      message.error(defaultMessage);
    }
  }, []);

  /**
   * Tạo query parameters từ object
   * @param {object} params - Object chứa parameters
   * @returns {string} - Query string
   */
  const buildQueryParams = useCallback((params) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    return queryParams.toString();
  }, []);

  /**
   * Kiểm tra response có phải lỗi quyền truy cập không
   * @param {Response} response - Response object
   * @returns {boolean} - True nếu là lỗi quyền truy cập
   */
  const isAccessError = useCallback((response) => {
    return response.status === 403 || response.status === 401;
  }, []);

  /**
   * Parse response data an toàn
   * @param {Response} response - Response object
   * @returns {Promise<object>} - Parsed data hoặc null
   */
  const safeParseResponse = useCallback(async (response) => {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error parsing response:', error);
      return null;
    }
  }, []);

  /**
   * Thực hiện API call với xử lý lỗi
   * @param {Function} apiCallFunction - Function chứa logic API call
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {Promise<boolean>} - True nếu thành công, false nếu thất bại
   */
  const makeApiCall = useCallback(async (apiCallFunction, errorMessage = 'Có lỗi xảy ra') => {
    try {
      const result = await apiCallFunction();
      return result;
    } catch (error) {
      handleApiError(error, errorMessage);
      return false;
    }
  }, [handleApiError]);

  /**
   * Thực hiện GET request
   * @param {string} url - URL endpoint
   * @param {object} params - Query parameters
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {Promise<object>} - Response data
   */
  const get = useCallback(async (url, params = {}, errorMessage = 'Lỗi khi tải dữ liệu') => {
    try {
      setLoading(true);
      const queryString = buildQueryParams(params);
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (isAccessError(response)) {
        throw new Error('Bạn không có quyền truy cập dữ liệu này.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await safeParseResponse(response);
      return { success: true, data, response };
    } catch (error) {
      handleApiError(error, errorMessage);
      return { success: false, error, data: null };
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, isAccessError, safeParseResponse, handleApiError]);

  /**
   * Thực hiện POST request
   * @param {string} url - URL endpoint
   * @param {object} data - Request body
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {Promise<object>} - Response data
   */
  const post = useCallback(async (url, data = {}, errorMessage = 'Lỗi khi tạo dữ liệu') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (isAccessError(response)) {
        throw new Error('Bạn không có quyền tạo dữ liệu này.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await safeParseResponse(response);
      return { success: true, data: responseData, response };
    } catch (error) {
      handleApiError(error, errorMessage);
      return { success: false, error, data: null };
    }
  }, [isAccessError, safeParseResponse, handleApiError]);

  /**
   * Thực hiện PUT request
   * @param {string} url - URL endpoint
   * @param {object} data - Request body
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {Promise<object>} - Response data
   */
  const put = useCallback(async (url, data = {}, errorMessage = 'Lỗi khi cập nhật dữ liệu') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (isAccessError(response)) {
        throw new Error('Bạn không có quyền cập nhật dữ liệu này.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await safeParseResponse(response);
      return { success: true, data: responseData, response };
    } catch (error) {
      handleApiError(error, errorMessage);
      return { success: false, error, data: null };
    }
  }, [isAccessError, safeParseResponse, handleApiError]);

  /**
   * Thực hiện DELETE request
   * @param {string} url - URL endpoint
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {Promise<object>} - Response data
   */
  const del = useCallback(async (url, errorMessage = 'Lỗi khi xóa dữ liệu') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (isAccessError(response)) {
        throw new Error('Bạn không có quyền xóa dữ liệu này.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await safeParseResponse(response);
      return { success: true, data: responseData, response };
    } catch (error) {
      handleApiError(error, errorMessage);
      return { success: false, error, data: null };
    }
  }, [isAccessError, safeParseResponse, handleApiError]);

  return {
    loading,
    setLoading,
    createAuthHeaders,
    handleApiError,
    buildQueryParams,
    makeApiCall,
    get,
    post,
    put,
    del,
    isAccessError,
    safeParseResponse
  };
}; 