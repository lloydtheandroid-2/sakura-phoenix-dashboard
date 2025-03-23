// File: src/app/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  
  // Redirect logic is handled by AuthInitializer

  const handleLogin = () => {
    login();
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/logo/sakura-phoenix-logo.svg"
          alt="Sakura Phoenix"
          width={48}
          height={48}
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            request access to the platform
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-800">
          <div className="flex flex-col gap-4">
            <Button
              className="w-full"
              onClick={handleLogin}
            >
              Sign in with Keycloak
            </Button>
            
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                Login securely with our SSO provider
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}