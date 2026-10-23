import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists in storage (fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vyapar_jwt');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle suspension & 401 expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.accountStatus === 'suspended') {
      window.dispatchEvent(new CustomEvent('vyapar:account-suspended'));
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const registerAPI = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginAPI = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const googleAuthAPI = async (payload) => {
  const response = await api.post('/auth/google', payload);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMeAPI = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfileAPI = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const changePasswordAPI = async (passwords) => {
  const response = await api.put('/auth/change-password', passwords);
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordAPI = async (data) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// ==========================================
// Transactions & Summary APIs
// ==========================================
export const getSummaryAPI = async (params = {}) => {
  const response = await api.get('/transactions/summary', { params });
  return response.data;
};

export const getTransactionsAPI = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const createTransactionAPI = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const updateTransactionAPI = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransactionAPI = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

export const seedDemoDataAPI = async () => {
  const response = await api.post('/transactions/seed');
  return response.data;
};

// ==========================================
// Customer & Udhar APIs
// ==========================================
export const getCustomersAPI = async (params = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomerByIdAPI = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomerAPI = async (data) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomerAPI = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const recordCustomerTxnAPI = async (id, data) => {
  const response = await api.post(`/customers/${id}/transaction`, data);
  return response.data;
};

export const deleteCustomerAPI = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// ==========================================
// Reports & Export APIs
// ==========================================
export const exportCSVAPI = async (params = {}) => {
  const response = await api.get('/reports/csv', {
    params,
    responseType: 'blob',
  });
  return response;
};

export const getReportStatementAPI = async (params = {}) => {
  const response = await api.get('/reports/statement', { params });
  return response.data;
};

// ==========================================
// Super Admin APIs
// ==========================================
export const getAdminStatsAPI = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsersAPI = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getAdminUserByIdAPI = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateAdminUserStatusAPI = async (id, accountStatus) => {
  const response = await api.patch(`/admin/users/${id}/status`, { accountStatus });
  return response.data;
};

export const getAdminAuditLogsAPI = async (params = {}) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

export default api;
