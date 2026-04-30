import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || 'https://teamtaskmanager-production-a94b.up.railway.app/api').trim();

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
