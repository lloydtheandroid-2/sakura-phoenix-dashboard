// File: src/utils/auth.ts
'use client';

import { useAuth } from '../contexts/AuthContext';

// This is a utility function to get auth context outside of React components
export function getAuth() {
  // This is a hack to access auth context outside of React components
  // In a real app, you'd want to use a more robust solution
  // @ts-expect-error - This will be defined by AuthContext during runtime
  return window.__AUTH_CONTEXT || {
    token: null,
    login: null,
    logout: null,
  };
}

// Hook that saves auth context to window for the utility function
export function useAuthSetup() {
  const auth = useAuth();
  
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Save auth context to window for the utility function
    window.__AUTH_CONTEXT = {
      token: auth.token,
      login: auth.login,
      logout: auth.logout,
    };
  }
  
  return auth;
}