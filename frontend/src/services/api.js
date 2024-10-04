import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = {
  // Activity Categories
  getCategories: () => axios.get(`${API_URL}/activities/category`),
  createCategory: (categoryData) =>
    axios.post(`${API_URL}/activities/category`, categoryData),
  updateCategory: (id, categoryData) =>
    axios.put(`${API_URL}/activities/category/${id}`, categoryData),
  deleteCategory: (id) => axios.delete(`${API_URL}/activities/category/${id}`),

  // Preference Tags
  getPreferenceTags: () => axios.get(`${API_URL}/preference-tags`),
  createPreferenceTag: (tagData) =>
    axios.post(`${API_URL}/preference-tags`, tagData),
  updatePreferenceTag: (id, tagData) =>
    axios.put(`${API_URL}/preference-tags/${id}`, tagData),
  deletePreferenceTag: (id) => axios.delete(`${API_URL}/preference-tags/${id}`),

  // Tags
  getTags: () => axios.get(`${API_URL}/tags`),
  createTag: (tagData) => axios.post(`${API_URL}/tags`, tagData),
  deleteTag: (id) => axios.delete(`${API_URL}/tags/${id}`),
};

export default api;
