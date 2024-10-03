import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = {
  getCategories: () => axios.get(`${API_URL}/activity-categories`),
  createCategory: (categoryData) =>
    axios.post(`${API_URL}/activity-categories`, categoryData),
  updateCategory: (id, categoryData) =>
    axios.put(`${API_URL}/activity-categories/${id}`, categoryData),
  deleteCategory: (id) => axios.delete(`${API_URL}/activity-categories/${id}`),

  getPreferenceTags: () => axios.get(`${API_URL}/preference-tags`),
  createPreferenceTag: (tagData) =>
    axios.post(`${API_URL}/preference-tags`, tagData),
  updatePreferenceTag: (id, tagData) =>
    axios.put(`${API_URL}/preference-tags/${id}`, tagData),
  deletePreferenceTag: (id) => axios.delete(`${API_URL}/preference-tags/${id}`),

  getTags: () => axios.get(`${API_URL}/tags`),
  createTag: (tagData) => axios.post(`${API_URL}/tags`, tagData),
  deleteTag: (id) => axios.delete(`${API_URL}/tags/${id}`),
};

export default api;
