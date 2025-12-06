import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://food-delivery-tidq.onrender.com
';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
};

export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getMenu: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getTracking: (orderId) => api.get(`/orders/${orderId}/tracking`),
};

export default api;


