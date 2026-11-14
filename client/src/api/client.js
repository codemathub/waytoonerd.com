import axios from 'axios';

// When deployed on VPS with reverse proxy (e.g., /api mapped in Nginx/Traefik),
// VITE_API_URL can be set to '' or '/api'
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.PROD ? '' : 'http://localhost:5001');

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('waytoonerd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Format clean relative path: e.g. /uploads/2019/05/...
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

export default api;
