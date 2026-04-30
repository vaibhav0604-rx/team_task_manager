import axios from 'axios';

const API = axios.create({
  baseURL: 'https://teamtaskmanager-production-a94b.up.railway.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;