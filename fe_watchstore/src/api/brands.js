import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const brandApi = {
  getAll: () => axios.get(`${API_URL}/brands/`),
  getById: (id) => axios.get(`${API_URL}/brands/${id}/`),
  create: (data) => axios.post(`${API_URL}/brands/`, data),
  update: (id, data) => axios.put(`${API_URL}/brands/${id}/`, data),
  delete: (id) => axios.delete(`${API_URL}/brands/${id}/`)
}; 