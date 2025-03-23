// File: src/components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useAuthSetup } from '../utils/auth';

// List of paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register'];

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const auth = useAuthSetup(); // This also sets up the global auth context
  const { initialized, isAuthenticated } = auth;
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      const isPublicPath = PUBLIC_PATHS.includes(pathname);
      
      if (!isAuthenticated && !isPublicPath) {
        // Redirect to login if not authenticated and trying to access a protected route
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        // Redirect to dashboard if already authenticated and trying to access login
        router.push('/dashboard');
      }
    }
  }, [initialized, isAuthenticated, pathname, router]);

  if (!initialized) {
    // Show loading spinner while Keycloak initializes
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}