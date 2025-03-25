// Create /app/registration-success/page.tsx

'use client';

import React from 'react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function RegistrationSuccess() {
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
          Registration Successful!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Your account request has been submitted and is pending approval.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-800">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You will receive an email when your account is approved. 
              Once approved, you can sign in to access the Sakura Phoenix platform.
            </p>
            <Link href="/login">
              <Button className="w-full">
                Proceed to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}