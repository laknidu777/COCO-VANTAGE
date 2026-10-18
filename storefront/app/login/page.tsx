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
  CheckCircle2,
} from 'lucide-react';
import { useCustomerAuth, sanitizeReturnUrl } from '@/lib/customer-auth';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const wasRegistered = searchParams.get('registered') === 'true';

  const { login, isAuthenticated, isLoading, authError, clearAuthError } =
    useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // If already logged in, redirect to destination
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(sanitizeReturnUrl(returnUrl));
    }
  }, [isLoading, isAuthenticated, returnUrl, router]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
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
      await login(email, password, returnUrl || undefined);
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
          ACCOUNT LOGIN
        </h1>
        <p className="text-xs text-[#777777] font-mono">
          Enter your credentials to access your account & orders.
        </p>
      </div>

      {/* Success Banner if redirected from registration */}
      {wasRegistered && !authError && (
        <div className="border border-[#111111] bg-white p-4 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="size-4.5 text-[#111111] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#111111]">
              Registration Complete
            </p>
            <p className="text-xs text-[#777777]">
              Your account has been created. Please sign in with your credentials.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {authError && (
        <div className="border border-[#111111] bg-[#111111] text-white p-4 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="size-4.5 text-white shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Authentication Notice
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (clientErrors.password) {
                  setClientErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="••••••••"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-3 px-4 text-xs font-mono uppercase tracking-[0.2em] hover:bg-[#333333] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>

        {/* Register Navigation Link */}
        <div className="pt-4 border-t border-[#E5E5E5] text-center space-y-2">
          <p className="text-xs text-[#777777]">
            Don&apos;t have an account yet?
          </p>
          <Link
            href={returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register'}
            className="inline-block text-xs font-mono uppercase tracking-widest text-[#111111] hover:underline font-semibold"
          >
            Create Customer Account →
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F2] text-[#111111] antialiased">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1 flex items-center justify-center py-16 px-6 lg:px-12">
        <Suspense fallback={<div className="text-center font-mono text-xs uppercase tracking-widest text-[#777777]">Loading customer portal...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
