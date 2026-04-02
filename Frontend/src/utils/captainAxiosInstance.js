import axios from 'axios';

// Separate axios instance for captain — uses 'captainToken' key
const captainAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

captainAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('captainToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

captainAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('captainToken');
      window.location.href = '/captain-login';
    }
    return Promise.reject(error);
  }
);

export default captainAxiosInstance;
