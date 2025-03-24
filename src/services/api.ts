'use client'

// File: platform/dashboard/src/services/api.ts
import axios from 'axios';
import { getAuth } from '../utils/auth';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      // Redirect to login
      const auth = getAuth();
      if (auth.login) {
        auth.login();
      }
    }
    return Promise.reject(error);
  }
);

// Get current authentication information
export const getAuthInfo = () => {
  const auth = getAuth();
  return {
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    userInfo: auth.userInfo,
  };
};

// Application service
export const applicationService = {
  // Get all applications
  getAllApplications: async () => {
    const response = await apiClient.get('/applications');
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id: string) => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  // Search applications
  searchApplications: async (term: string, type: string) => {
    const response = await apiClient.get('/applications/search', {
      params: { term, type },
    });
    return response.data;
  },

  // Deploy new application
  deployApplication: async (applicationData: any) => {
    const response = await apiClient.post('/applications', applicationData);
    return response.data;
  },

  // Restart application
  restartApplication: async (id: string) => {
    const response = await apiClient.post(`/applications/${id}/restart`);
    return response.data;
  },

  // Delete application
  deleteApplication: async (id: string) => {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data;
  },
};

// Authentication service - now uses the auth utility
export const authService = {
  // Login
  login: () => {
    const auth = getAuth();
    if (auth.login) {
      auth.login();
    }
  },

  // Register
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: () => {
    const auth = getAuth();
    if (auth.logout) {
      auth.logout();
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const auth = getAuth();
    return auth.isAuthenticated;
  },

  // Get user info
  getUserInfo: () => {
    const auth = getAuth();
    return auth.userInfo;
  },
};

export default apiClient;
