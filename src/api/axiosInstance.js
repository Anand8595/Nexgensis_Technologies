import axios from 'axios';

// Base URL for DummyJSON API
const BASE_URL = 'https://dummyjson.com';

export const AUTH_TOKEN_KEY = 'admin_auth_token';
export const AUTH_USER_KEY = 'admin_auth_user';

/**
 * Shared Axios instance configured with base URL, timeout,
 * request interceptor for bearer token injection, and
 * response interceptor for centralized error formatting.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Injects auth token if present in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for auth token:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling and unauthorized interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error was triggered by AbortController
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    let customErrorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.message) {
      customErrorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      customErrorMessage = 'Network error: Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      customErrorMessage = 'Request timed out. Please try again.';
    } else if (status === 401) {
      customErrorMessage = 'Session expired or invalid credentials. Please log in again.';
      // Clear token if expired or unauthorized
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        // Dispatch custom event for UI to respond if needed
        window.dispatchEvent(new Event('auth:unauthorized'));
      } catch (_e) {
        // ignore
      }
    } else if (status === 404) {
      customErrorMessage = 'The requested resource was not found.';
    } else if (status >= 500) {
      customErrorMessage = 'Server error. DummyJSON service might be experiencing issues.';
    }

    // Attach human-readable normalized message onto the error object
    error.userMessage = customErrorMessage;

    return Promise.reject(error);
  }
);

export default axiosInstance;
