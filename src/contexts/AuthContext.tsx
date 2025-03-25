// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import keycloak from '../services/keycloak';
import axios from 'axios';

type AuthContextType = {
  isAuthenticated: boolean;
  initialized: boolean;
  login: () => void;
  directLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  userInfo: any | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  initialized: false,
  login: () => {},
  directLogin: async () => false,
  logout: () => {},
  userInfo: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by making a request to a protected endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
          withCredentials: true // Important for cookies
        });
        
        if (response.status === 200) {
          setIsAuthenticated(true);
          setUserInfo(response.data);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserInfo(null);
      } finally {
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // OAuth login (redirect to Keycloak)
  const login = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`;
  };

  // Direct username/password login
  const directLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, 
        { username, password },
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUserInfo(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true }
      );
      
      // Redirect to the logout URL provided by the backend
      if (response.data.logoutUrl) {
        window.location.href = response.data.logoutUrl;
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      // Fallback logout
      window.location.href = '/login';
    }
    
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      initialized, 
      login, 
      directLogin,
      logout, 
      userInfo 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);