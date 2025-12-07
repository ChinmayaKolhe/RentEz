import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (userData) => api.post('/auth/signup', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (formData) => api.put('/auth/profile', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Property API
export const getProperties = (params) => api.get('/properties', { params });
export const getProperty = (id) => api.get(`/properties/${id}`);
export const createProperty = (formData) => api.post('/properties', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProperty = (id, formData) => api.put(`/properties/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const getOwnerProperties = () => api.get('/properties/owner/my-properties');

// Rent API
export const getTenantPayments = () => api.get('/rent/tenant');
export const getOwnerPayments = () => api.get('/rent/owner');
export const createRentPayment = (data) => api.post('/rent', data);
export const updateRentPayment = (id, data) => api.put(`/rent/${id}`, data);
export const getPaymentStats = () => api.get('/rent/stats');

// Chat API
export const getConversations = () => api.get('/chat/conversations');
export const getChatMessages = (userId) => api.get(`/chat/${userId}`);
export const markMessagesAsSeen = (userId) => api.put(`/chat/${userId}/seen`);

// Application API
export const applyForProperty = (propertyId, data) => api.post('/applications', { propertyId, ...data });
export const getMyApplications = () => api.get('/applications/my-applications');
export const getReceivedApplications = (status) => api.get('/applications/received', { params: { status } });
export const getPropertyApplications = (propertyId) => api.get(`/applications/property/${propertyId}`);
export const updateApplicationStatus = (id, data) => api.put(`/applications/${id}/status`, data);
export const getApplicationStats = () => api.get('/applications/stats');

// Lease API
export const createLease = (data) => api.post('/leases', data);
export const getActiveLeases = () => api.get('/leases/active');
export const getLeaseDetails = (id) => api.get(`/leases/${id}`);
export const terminateLease = (id) => api.put(`/leases/${id}/terminate`);

export default api;
