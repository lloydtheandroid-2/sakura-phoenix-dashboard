'use client'

// File: platform/dashboard/src/services/api.ts
import axios from 'axios';
import keycloak from './keycloak';

// Create an axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // If keycloak is authenticated, ensure token is fresh and add it to requests
    if (keycloak?.authenticated) {
      try {
        // Try to update the token if it's close to expiration (30 seconds)
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          console.log('Token was successfully refreshed');
        }
        
        // Add the current token to the request header
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error('Failed to refresh the token, or the session has expired', error);
        // Redirect to login
        keycloak.login();
      }
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
      console.log('Received 401 response, redirecting to login');
      // Redirect to Keycloak login
      if (keycloak) {
        keycloak.login();
      }
    }
    return Promise.reject(error);
  }
);

// Get current authentication information
export const getAuth = () => {
  return {
    token: keycloak?.token,
    isAuthenticated: !!keycloak?.authenticated,
    login: () => keycloak?.login(),
    logout: () => keycloak?.logout({ redirectUri: window.location.origin }),
    userInfo: keycloak?.tokenParsed ? {
      id: keycloak.subject,
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      name: keycloak.tokenParsed.name,
      roles: keycloak.tokenParsed.realm_access?.roles || [],
    } : null,
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

// Authentication service - now uses Keycloak under the hood
export const authService = {
  // Login - now redirects to Keycloak
  login: () => {
    if (keycloak) {
      keycloak.login();
    }
  },

  // Register - in Keycloak this would typically be handled by the Keycloak registration page
  // This function could be used to pre-register users in your backend before they use Keycloak
  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout - now uses Keycloak logout
  logout: () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  },

  // Check if user is authenticated - now uses Keycloak status
  isAuthenticated: () => {
    return !!keycloak?.authenticated;
  },

  // Get user info from Keycloak token
  getUserInfo: () => {
    if (!keycloak?.tokenParsed) {
      return null;
    }

    return {
      id: keycloak.subject,
      username: keycloak.tokenParsed.preferred_username,
      email: keycloak.tokenParsed.email,
      name: keycloak.tokenParsed.name,
      roles: keycloak.tokenParsed.realm_access?.roles || [],
    };
  },
};

export default apiClient;
