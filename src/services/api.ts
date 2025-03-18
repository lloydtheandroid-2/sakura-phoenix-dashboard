// File: platform/dashboard/src/services/api.ts
import axios from 'axios';

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
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

// Authentication service
export const authService = {
  // Login with username and password
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { token } = response.data;
    localStorage.setItem('auth_token', token);
    return response.data;
  },

  // Register new user
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

export default apiClient;