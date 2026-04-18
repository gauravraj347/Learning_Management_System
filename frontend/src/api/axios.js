import axios from 'axios';

// In production (Vercel): VITE_API_URL = https://your-app.onrender.com/api/v1
// In development: falls back to /api/v1 (Vite proxy handles it)
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Attach JWT token to every request
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

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (backend down)
    if (!error.response) {
      console.warn('Network error — backend may be down');
      return Promise.reject(error);
    }

    // 401 — token expired, redirect to login
    if (error.response.status === 401) {
      const path = window.location.pathname;
      // Don't redirect if already on login/register
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
