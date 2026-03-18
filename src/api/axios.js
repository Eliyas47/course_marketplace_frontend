import axios from 'axios';

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = (envBaseUrl || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401s and global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');
    const requestUrl = originalRequest?.url || '';
    
    // Don't retry for these endpoints to avoid infinite loops or redundant errors
    const isAuthRequest = requestUrl.includes('/auth/login/') || 
                         requestUrl.includes('/auth/token/refresh/') ||
                         requestUrl.includes('/auth/register/');

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRequest &&
      !!refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired, log out user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // window.location.href = '/login'; // Handle redirect in the UI layer if needed
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
