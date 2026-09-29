
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,  
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });


export const registerUser = (formData) =>
  api.post('/auth/register', formData);


export const getMe = () =>
  api.get('/auth/me');


export const changePassword = (currentPassword, newPassword) =>
  api.patch('/auth/password', { currentPassword, newPassword });


export const getStores = (params) =>
  api.get('/stores', { params });


export const getStoreById = (id) =>
  api.get(`/stores/${id}`);

export const rateStore = (storeId, rating) =>
  api.put(`/stores/${storeId}/rating`, { rating });


export const getAdminDashboard = () =>
  api.get('/admin/dashboard');


export const getAdminUsers = (params) =>
  api.get('/admin/users', { params });


export const getAdminUserById = (id) =>
  api.get(`/admin/users/${id}`);


export const createAdminUser = (userData) =>
  api.post('/admin/users', userData);


export const getAdminStores = (params) =>
  api.get('/admin/stores', { params });


export const createAdminStore = (storeData) =>
  api.post('/admin/stores', storeData);


export const getOwnerDashboard = () =>
  api.get('/owner/dashboard');


export const getOwnerRatings = () =>
  api.get('/owner/ratings');

export default api;
