import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Summary & Dashboard KPIs
export const getSummaryAPI = async (params = {}) => {
  const response = await api.get('/transactions/summary', { params });
  return response.data;
};

// Transactions List
export const getTransactionsAPI = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

// Create Sale or Expense
export const createTransactionAPI = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

// Update Transaction
export const updateTransactionAPI = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

// Delete Transaction
export const deleteTransactionAPI = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Seed Demo Data
export const seedDemoDataAPI = async () => {
  const response = await api.post('/seed');
  return response.data;
};

export default api;
