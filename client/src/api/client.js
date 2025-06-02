import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    const error = new Error(message);
    error.status = err.response?.status;
    error.data = err.response?.data;
    return Promise.reject(error);
  }
);

export default api;