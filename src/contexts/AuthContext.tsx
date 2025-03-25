// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type AuthContextType = {
  isAuthenticated: boolean;
  initialized: boolean;
  login: () => void;
  directLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  userInfo: any | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  initialized: false,
  login: () => {},
  directLogin: async () => false,
  logout: () => {},
  refreshToken: async () => false,
  userInfo: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  // Store token expiration timestamp
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  // Reference to the refresh timer
  const refreshTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Function to refresh the token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        // Set the new expiration time - calculate it by adding expiresIn to current time
        const newExpiry = Date.now() + (response.data.expiresIn * 1000);
        setTokenExpiry(newExpiry);
        
        // Schedule the next refresh
        scheduleRefresh(response.data.expiresIn);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, the user needs to log in again
      setIsAuthenticated(false);
      return false;
    }
  };
  
  // Schedule token refresh - called after login and after each successful refresh
  const scheduleRefresh = (expiresIn: number) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    // Schedule refresh for 1 minute before token expires
    const refreshTime = (expiresIn - 60) * 1000;
    refreshTimerRef.current = setTimeout(() => {
      refreshToken();
    }, refreshTime > 0 ? refreshTime : 0);
  };
  
  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by making a request to a protected endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
          withCredentials: true
        });
        
        if (response.status === 200) {
          setIsAuthenticated(true);
          setUserInfo(response.data);
          
          // Since we're authenticated, let's refresh the token to get a fresh one
          // This will also set up the refresh timer
          await refreshToken();
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUserInfo(null);
      } finally {
        setInitialized(true);
      }
    };

    checkAuth();
    
    // Clean up refresh timer when the component unmounts
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
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
        
        // Set token expiry and schedule refresh
        if (response.data.expiresIn) {
          const expiry = Date.now() + (response.data.expiresIn * 1000);
          setTokenExpiry(expiry);
          scheduleRefresh(response.data.expiresIn);
        }
        
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
      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      
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
    setTokenExpiry(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      initialized, 
      login, 
      directLogin,
      logout,
      refreshToken,
      userInfo 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);