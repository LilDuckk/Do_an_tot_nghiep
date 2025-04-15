import api from './index';

export const productApi = {
  // Lấy danh sách sản phẩm
  getAll: (params) => api.get('/products/', { params }),
  
  // Lấy chi tiết sản phẩm
  getById: (id) => api.get(`/products/${id}/`),
  
  // Tạo sản phẩm mới
  create: (data) => api.post('/products/', data),
  
  // Cập nhật sản phẩm
  update: (id, data) => api.put(`/products/${id}/`, data),
  
  // Xóa sản phẩm
  delete: (id) => api.delete(`/products/${id}/`),
  
  // Tìm kiếm sản phẩm
  search: (keyword) => api.get('/products/', { params: { search: keyword } }),
  
  // Lọc sản phẩm
  filter: (filters) => api.get('/products/', { params: filters }),
  
  // Lấy danh sách đánh giá sản phẩm
  getReviews: (productId) => api.get(`/products/${productId}/reviews/`),
  
  // Thêm đánh giá sản phẩm
  addReview: (productId, data) => api.post(`/products/${productId}/reviews/`, data),
}; 