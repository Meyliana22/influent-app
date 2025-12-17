/**
 * Transaction Service
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

const transactionService = {
  getMyTransactions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await authFetch(`${API_BASE_URL}/transactions/my-transactions?${queryParams}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  getBalance: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/transactions/balance`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  }
};

export default transactionService;
