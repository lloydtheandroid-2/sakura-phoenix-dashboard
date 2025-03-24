// File: src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Keycloak from 'keycloak-js';

interface AuthContextType {
  keycloak: Keycloak | null;
  initialized: boolean;
  isAuthenticated: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  user: any;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  keycloak: null,
  initialized: false,
  isAuthenticated: false,
  token: undefined,
  login: () => {},
  logout: () => {},
  user: null,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initKeycloak = async () => {
      const keycloakInstance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.sakuraphoenix.us',
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'sakura-phoenix',
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'dashboard-client',
      });

      try {
        // Configure Keycloak to use redirect flow instead of iframe
        const authenticated = await keycloakInstance.init({
          onLoad: 'check-sso',
          checkLoginIframe: false, // Disable iframe checking
          pkceMethod: 'S256',
          enableLogging: true,
          flow: 'standard', // Use standard authorization code flow
        });

        setKeycloak(keycloakInstance);
        setInitialized(true);

        // Set up token refresh
        if (authenticated) {
          setUpTokenRefresh(keycloakInstance);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setInitialized(true);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      initKeycloak();
    }

    return () => {
      // Clean up
    };
  }, []);

  const setUpTokenRefresh = (keycloakInstance: Keycloak) => {
    // Refresh token 30 seconds before it expires
    setInterval(() => {
      keycloakInstance
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed');
          }
        })
        .catch(() => {
          console.error('Failed to refresh token, logging out');
          keycloakInstance.logout();
        });
    }, 60000); // Check every minute
  };

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

  const hasRole = (role: string) => {
    return keycloak?.tokenParsed?.realm_access?.roles?.includes(role) || false;
  };

  const user = keycloak ? {
    id: keycloak.subject,
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
  } : null;

  const value = {
    keycloak,
    initialized,
    isAuthenticated: !!keycloak?.authenticated,
    token: keycloak?.token,
    login,
    logout,
    user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);