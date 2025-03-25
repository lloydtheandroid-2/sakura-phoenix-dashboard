'use client';

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox, CheckboxField } from '../../components/ui/checkbox';
import { Field, FieldGroup, Label } from '../../components/ui/fieldset';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';


export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.organization) newErrors.organization = 'Organization is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Connect to backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        role: formData.role
      });
      
      if (response.data.success) {
        // Redirect to a success page or login
        router.push('/registration-success');
      } else {
        setFormError(response.data.error || 'Registration failed');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
          Request Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {formError && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Registration Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{formError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FieldGroup>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="firstName">First name</Label>
                  <div className="mt-1">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.firstName}</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="lastName">Last name</Label>
                  <div className="mt-1">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.lastName}</p>
                  )}
                </Field>
              </div>
            </FieldGroup>

            <Field>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
              )}
            </Field>

            <FieldGroup>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="password">Password</Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.password}</p>
                  )}
                </Field>

                <Field>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.confirmPassword}</p>
                  )}
                </Field>
              </div>
            </FieldGroup>

            <Field>
              <Label htmlFor="organization">Organization</Label>
              <div className="mt-1">
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  className={errors.organization ? 'border-red-500' : ''}
                />
              </div>
              {errors.organization && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.organization}</p>
              )}
            </Field>

            <Field>
              <Label htmlFor="role">Role</Label>
              <div className="mt-1">
                <Input
                  id="role"
                  name="role"
                  type="text"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'border-red-500' : ''}
                />
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.role}</p>
              )}
            </Field>

            <div>
              <CheckboxField>
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(checked) => {
                    setFormData(prev => ({ ...prev, agreeTerms: checked }));
                    if (errors.agreeTerms) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.agreeTerms;
                        return newErrors;
                      });
                    }
                  }}
                />
                <Label htmlFor="agreeTerms">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    terms and conditions
                  </Link>
                </Label>
              </CheckboxField>
              {errors.agreeTerms && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.agreeTerms}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Request Access'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 