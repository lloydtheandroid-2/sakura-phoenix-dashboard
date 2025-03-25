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

// Refresh function outside the interceptor for cleaner code
const refreshAuthToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data.success;
  } catch (error) {
    return false;
  }
};

// Token refresh state management
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

// Process the queue of failed requests
const processQueue = (success: boolean) => {
  failedQueue.forEach(promise => {
    if (success) {
      promise.resolve(null);
    } else {
      promise.reject(null);
    }
  });
  
  failedQueue = [];
};

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

// Add response interceptor to handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Mark this request as retried to avoid infinite loops
    originalRequest._retry = true;
    
    // If we're not already refreshing the token
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAuthToken()
        .then(success => {
          processQueue(success);
          return success;
        })
        .catch(() => {
          processQueue(false);
          return false;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }
    
    // If we are already refreshing, add this request to the queue
    if (refreshPromise) {
      try {
        // Wait for the current refresh to complete
        const refreshResult = await refreshPromise;
        
        if (refreshResult) {
          // If refresh was successful, retry the original request
          return apiClient(originalRequest);
        } else {
          // If refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If there was an error refreshing, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
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

  // Add method to manually refresh the token if needed
  refreshToken: async () => {
    return refreshAuthToken();
  }
};

export default apiClient;
