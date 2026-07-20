import axios from 'axios';

// Store the logout callback to avoid circular dependencies
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
});

/**
 * Request Interceptor: Attach auth token to every request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle 401 Unauthorized responses
 * Automatically clears auth state and redirects to login on token expiration
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized (401) - Token expired or invalid');
      
      // Call logout callback if it's set
      if (logoutCallback) {
        logoutCallback();
      } else {
        // Fallback: directly clear storage and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
