/**
 * Withdrawal Service
 */
import authFetch from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

const withdrawalService = {
  getMyWithdrawals: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await authFetch(`${API_BASE_URL}/withdrawals/my-withdrawals?${queryParams}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      throw error;
    }
  },

  getWithdrawalById: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching withdrawal details:", error);
      throw error;
    }
  },

  requestWithdrawal: async (data) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/withdrawals/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      throw error;
    }
  },

  cancelWithdrawal: async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/withdrawals/${id}/cancel`, {
        method: 'DELETE',
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error cancelling withdrawal:", error);
      throw error;
    }
  }
};

export default withdrawalService;
