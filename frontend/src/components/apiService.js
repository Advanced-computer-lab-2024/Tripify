import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Request account deletion
export const requestAccountDeletion = async (role, token) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/${role}/request-deletion`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : 'Request failed';
  }
};

// Delete account (admin-level)
export const deleteAccount = async (role, userId, token) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/${role}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : 'Deletion failed';
  }
};
