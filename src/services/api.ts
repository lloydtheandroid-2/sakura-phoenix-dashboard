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
  withCredentials: true,
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
      window.location.href = '/login';
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
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { 
      username, 
      password 
    });
    return response.data;
  },

  // Register
  register: async (userData: any) => {
    return apiClient.post('/auth/register', userData);
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  isAuthenticated: async () => {
    try {
      await apiClient.get('/user/me');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default apiClient;
