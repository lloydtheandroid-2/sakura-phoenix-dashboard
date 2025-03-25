// Create /src/services/authService.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const authService = {
  login: async (username: string, password: string, rememberMe: boolean = false) => {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      username,
      password,
      rememberMe
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
  
  register: async (userData: any) => {
    return axios.post(`${API_URL}/api/v1/auth/register`, userData);
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    // Redirect to Keycloak logout if needed
    // window.location.href = `${API_URL}/api/v1/auth/logout`;
  },
  
  getCurrentUser: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Parse JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

export default authService;