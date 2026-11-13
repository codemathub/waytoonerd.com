import axios from 'axios';

// When deployed on VPS with reverse proxy (e.g., /api mapped in Nginx),
// VITE_API_URL can be set to '' or '/api' or full backend URL like 'https://api.waytoonerd.com'
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.PROD ? '' : 'http://localhost:5001');

// Base URL for Backblaze B2 public assets
export const B2_PUBLIC_URL = import.meta.env.VITE_B2_URL || 'https://calthx.s3.us-east-005.backblazeb2.com/waytoonerd';

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
  
  // If B2 public URL is available and path is an /uploads/ path, route directly to B2
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (B2_PUBLIC_URL && cleanPath.startsWith('/uploads/')) {
    const b2Key = cleanPath.replace(/^\/uploads\//, '');
    return `${B2_PUBLIC_URL}/${b2Key}`;
  }

  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

export default api;
