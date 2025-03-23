'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../services/keycloak';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: () => void;
  logout: () => void;
  updateToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (keycloak) {
      const initKeycloak = async () => {
        try {
          const authenticated = await keycloak?.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          });

          setIsAuthenticated(authenticated || false);
          
          if (authenticated && keycloak) {
            setUser({
              id: keycloak?.subject,
              username: keycloak?.tokenParsed?.preferred_username,
              email: keycloak?.tokenParsed?.email,
              name: keycloak?.tokenParsed?.name,
              roles: keycloak?.tokenParsed?.realm_access?.roles || [],
            });
          }
        } catch (error) {
          console.error('Keycloak init error:', error);
        } finally {
          setLoading(false);
        }
      };

      initKeycloak();
    }
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({ redirectUri: window.location.origin });
    }
  };

  const updateToken = async (): Promise<boolean> => {
    if (keycloak) {
      try {
        return await keycloak.updateToken(30);
      } catch (error) {
        console.error('Token refresh error', error);
        logout();
        return false;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
