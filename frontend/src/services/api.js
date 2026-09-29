// src/services/api.js
// ---------------------------------------------------------------
// Central API service file.
// All requests to the backend go through this file.
//
// What it does:
//   1. Creates an axios instance with the base URL set to /api
//      (Vite's proxy forwards /api to http://localhost:5000)
//   2. Before every request, it reads the JWT token from
//      localStorage and adds it to the Authorization header.
//   3. If the backend returns 401 (token expired / invalid),
//      it clears the token and redirects to /login.
// ---------------------------------------------------------------

import axios from 'axios';

// Create an axios instance.
// baseURL is /api — Vite proxy will forward this to http://localhost:5000/api
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------
// Request Interceptor
// Runs BEFORE every request is sent.
// Reads the token from localStorage and adds it to the header.
// ---------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // The backend's authenticate middleware expects this format:
      // Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------
// Response Interceptor
// Runs AFTER every response is received.
// If 401 → token is expired or invalid → log the user out.
// ---------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,  // If successful, just return the response
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired — clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------
// AUTH endpoints
// ---------------------------------------------------------------

// POST /api/auth/login
// Body: { email, password }
// Returns: { success, data: { token, user: { id, name, email, role } } }
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

// POST /api/auth/register
// Body: { name, email, password, address }
// Returns: { success, message, data: { id, email, role } }
export const registerUser = (formData) =>
  api.post('/auth/register', formData);

// GET /api/auth/me
// Returns: { success, data: { id, name, email, address, role, created_at } }
export const getMe = () =>
  api.get('/auth/me');

// PATCH /api/auth/password
// Body: { currentPassword, newPassword }
// Returns: { success, message }
export const changePassword = (currentPassword, newPassword) =>
  api.patch('/auth/password', { currentPassword, newPassword });

// ---------------------------------------------------------------
// STORE endpoints (for normal users)
// ---------------------------------------------------------------

// GET /api/stores?name=&address=
// Returns: { success, count, data: [ { id, name, address, avg_rating, total_ratings, user_rating } ] }
export const getStores = (params) =>
  api.get('/stores', { params });

// GET /api/stores/:id
// Returns: { success, data: { id, name, email, address, avg_rating, total_ratings, user_rating } }
export const getStoreById = (id) =>
  api.get(`/stores/${id}`);

// PUT /api/stores/:id/rating
// Body: { rating }   (integer 1–5)
// Returns: { success, message, data: { store_id, user_rating, avg_rating } }
export const rateStore = (storeId, rating) =>
  api.put(`/stores/${storeId}/rating`, { rating });

// ---------------------------------------------------------------
// ADMIN endpoints
// ---------------------------------------------------------------

// GET /api/admin/dashboard
// Returns: { success, data: { total_users, total_stores, total_ratings } }
export const getAdminDashboard = () =>
  api.get('/admin/dashboard');

// GET /api/admin/users?name=&email=&address=&role=&sort=&order=
// Returns: { success, count, data: [ users ] }
export const getAdminUsers = (params) =>
  api.get('/admin/users', { params });

// GET /api/admin/users/:id
// Returns: { success, data: { ...user, stores?: [...] } }
export const getAdminUserById = (id) =>
  api.get(`/admin/users/${id}`);

// POST /api/admin/users
// Body: { name, email, password, address, role }
// Returns: { success, message, data: { id, name, email, role } }
export const createAdminUser = (userData) =>
  api.post('/admin/users', userData);

// GET /api/admin/stores?name=&email=&address=&sort=&order=
// Returns: { success, count, data: [ stores ] }
export const getAdminStores = (params) =>
  api.get('/admin/stores', { params });

// POST /api/admin/stores
// Body: { name, email, address, owner_id }
// Returns: { success, message, data: { id, name, email, address, owner_id, owner_name } }
export const createAdminStore = (storeData) =>
  api.post('/admin/stores', storeData);

// ---------------------------------------------------------------
// STORE OWNER endpoints
// ---------------------------------------------------------------

// GET /api/owner/dashboard
// Returns: { success, data: [ { store_id, store_name, avg_rating, total_ratings, ... } ] }
export const getOwnerDashboard = () =>
  api.get('/owner/dashboard');

// GET /api/owner/ratings
// Returns: { success, count, data: [ { rating_id, rating, user_name, user_email, store_name, ... } ] }
export const getOwnerRatings = () =>
  api.get('/owner/ratings');

export default api;
