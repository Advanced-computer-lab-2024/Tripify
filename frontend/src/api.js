import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api';

// Helper function to handle API requests
const handleApiRequest = async (request) => {
  try {
    const response = await request();
    return response.data;  // Return the response data for further use
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred during the request');
  }
};

// Register Advertiser
export const registerAdvertiser = async (advertiserData) => {
  return handleApiRequest(() => axios.post(`${API_URL}/advertiser/register`, advertiserData));
};

// Register Seller
export const registerSeller = async (sellerData) => {
  return handleApiRequest(() => axios.post(`${API_URL}/seller/register`, sellerData));
};

// Register Tour Guide
export const registerTourGuide = async (tourGuideData) => {
  return handleApiRequest(() => axios.post(`${API_URL}/tourguide/register`, tourGuideData));
};

// Create User
export const createUser = async (userData) => {
  return handleApiRequest(() => axios.post(`${API_URL}/profile`, userData));
};

// Get User by ID
export const getUserById = async (userId) => {
  return handleApiRequest(() => axios.get(`${API_URL}/profile/${userId}`));
};

// Update User
export const updateUser = async (userId, userData) => {
  return handleApiRequest(() => axios.put(`${API_URL}/profile/${userId}`, userData));
};

// Get Users
export const getUsers = async () => {
  return handleApiRequest(() => axios.get(`${API_URL}/profile`));
};

// Delete User
export const deleteUser = async (userId) => {
  return handleApiRequest(() => axios.delete(`${API_URL}/profile/${userId}`));
};

// Get User Details by Params
export const getUserDetailsByParams = async (params) => {
  return handleApiRequest(() => axios.get(`${API_URL}/profile/details`, { params }));
};
