'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth, sanitizeReturnUrl } from '@/lib/customer-auth';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const { register, isAuthenticated, isLoading, authError, clearAuthError } =
    useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // If already logged in, redirect to destination
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(sanitizeReturnUrl(returnUrl));
    }
  }, [isLoading, isAuthenticated, returnUrl, router]);

  const validate = () => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(email, password, returnUrl || undefined);
    } catch {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#777777]">
          Customer Portal
        </p>
        <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-tight text-[#111111]">
          CREATE ACCOUNT
        </h1>
        <p className="text-xs text-[#777777] font-mono">
          Register for expedited checkout & order history tracking.
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="border border-[#111111] bg-[#111111] text-white p-4 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="size-4.5 text-white shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Registration Notice
            </p>
            <p className="text-xs text-[#CCCCCC]">{authError}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6 shadow-sm"
      >
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-xs font-mono uppercase tracking-widest text-[#111111]"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#777777]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (clientErrors.email) {
                  setClientErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="customer@example.com"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2.5 bg-[#F5F5F2] border text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition-colors ${
                clientErrors.email ? 'border-red-500' : 'border-[#E5E5E5]'
              }`}
            />
          </div>
          {clientErrors.email && (
            <p className="text-[11px] text-red-600 font-mono">
              {clientErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-mono uppercase tracking-widest text-[#111111]"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#777777]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (clientErrors.password) {
                  setClientErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Minimum 8 characters"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-10 py-2.5 bg-[#F5F5F2] border text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition-colors ${
                clientErrors.password ? 'border-red-500' : 'border-[#E5E5E5]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#111111]"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {clientErrors.password && (
            <p className="text-[11px] text-red-600 font-mono">
              {clientErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-mono uppercase tracking-widest text-[#111111]"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#777777]" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (clientErrors.confirmPassword) {
                  setClientErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              placeholder="Re-enter password"
              disabled={isSubmitting}
              className={`w-full pl-10 pr-3 py-2.5 bg-[#F5F5F2] border text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition-colors ${
                clientErrors.confirmPassword
                  ? 'border-red-500'
                  : 'border-[#E5E5E5]'
              }`}
            />
          </div>
          {clientErrors.confirmPassword && (
            <p className="text-[11px] text-red-600 font-mono">
              {clientErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#777777] bg-[#F5F5F2] p-2.5 border border-[#E5E5E5]">
          <ShieldCheck className="size-4 text-[#111111] shrink-0" />
          <span>Passkeys & encrypted botanical data isolation CV-2026</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-3 px-4 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[#333333] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>

        {/* Login Navigation Link */}
        <div className="pt-4 border-t border-[#E5E5E5] text-center space-y-2">
          <p className="text-xs text-[#777777]">
            Already have an account?
          </p>
          <Link
            href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'}
            className="inline-block text-xs font-mono uppercase tracking-widest text-[#111111] hover:underline font-semibold"
          >
            Sign In to Existing Account →
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-16 px-6 lg:px-12">
        <Suspense fallback={<div className="text-center font-mono text-xs uppercase tracking-widest text-[#777777]">Loading customer portal...</div>}>
          <RegisterFormContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
