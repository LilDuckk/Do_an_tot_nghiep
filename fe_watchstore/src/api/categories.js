import api from './index';

export const categoryApi = {
  // Lấy danh sách danh mục
  getAll: (params) => api.get('/categories/', { params }),
  
  // Lấy chi tiết danh mục
  getById: (id) => api.get(`/categories/${id}/`),
  
  // Tạo danh mục mới
  create: (data) => api.post('/categories/', data),
  
  // Cập nhật danh mục
  update: (id, data) => api.put(`/categories/${id}/`, data),
  
  // Xóa danh mục
  delete: (id) => api.delete(`/categories/${id}/`),
  
  // Lấy danh mục con
  getSubcategories: (id) => api.get(`/categories/${id}/subcategories/`),
  
  // Tìm kiếm danh mục
  search: (keyword) => api.get('/categories/', { params: { search: keyword } }),
  
  // Lọc danh mục theo parent
  filterByParent: (parentId) => api.get('/categories/', { params: { parent_id: parentId } }),
}; 