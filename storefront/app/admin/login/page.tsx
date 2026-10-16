'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading, authError, clearAuthError } =
    useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Administrator email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must contain at least 8 characters';
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
      await login(email.trim(), password);
    } catch {
      // Handled in context authError
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to prefill seeded dev administrator credentials
  const fillDevCredentials = () => {
    setEmail('admin@cocovantage.com');
    setPassword('AdminPassword123!');
    setClientErrors({});
    clearAuthError();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#111111] flex flex-col justify-between p-4 sm:p-8 antialiased selection:bg-[#111111] selection:text-white">
      {/* Top Bar with brand mark */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <Link
          href="/"
          className="group block space-y-0.5 focus:outline-none"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#777777]">
            COCO-VANTAGE
          </div>
          <div className="text-sm font-serif uppercase tracking-[0.15em] font-light text-[#111111]">
            Monochrome Formulation
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-[0.15em] text-[#777777] hover:text-[#111111] transition-colors"
        >
          ← Return to Store
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-white border border-[#E5E5E5] p-6 sm:p-10 shadow-sm relative">
          {/* Architectural corner mark */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#111111]" />

          <div className="mb-8">
            <span className="inline-block px-2 py-0.5 bg-[#F5F5F2] border border-[#E5E5E5] text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777] mb-3">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl font-serif uppercase tracking-[0.1em] text-[#111111] font-light">
              Administrator Sign-In
            </h1>
            <p className="text-xs text-[#777777] mt-1 font-sans">
              Enter authorized administrator credentials to manage products, catalog inventory, and orders.
            </p>
          </div>

          {/* Development Security Disclaimer */}
          <div className="mb-6 p-3 bg-[#F5F5F2] border-l-2 border-[#111111] text-[11px] font-mono text-[#555555] leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#111111] font-semibold mb-0.5">
              <ShieldAlert className="size-3.5 text-amber-600" />
              <span>DEVELOPMENT AUTH NOTICE</span>
            </div>
            This interface authenticates against <code className="text-[#111111]">POST /api/v1/auth/login</code>. In development, JWTs are handled in-memory. Production requires HttpOnly cookie sessions.
          </div>

          {/* Error Banner */}
          {authError && (
            <div
              role="alert"
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold font-mono uppercase text-[10px] tracking-wider">
                  Authentication Failed
                </div>
                <div className="mt-0.5">{authError}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-[0.15em] text-[#111111] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <Mail className="size-4" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (clientErrors.email) {
                      setClientErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="admin@cocovantage.com"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-[#FBFBFA] border ${
                    clientErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#E5E5E5] focus:border-[#111111]'
                  } text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111] transition-all`}
                  disabled={isSubmitting}
                />
              </div>
              {clientErrors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-mono">
                  {clientErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-mono uppercase tracking-[0.15em] text-[#111111]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <Lock className="size-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientErrors.password) {
                      setClientErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-xs font-mono bg-[#FBFBFA] border ${
                    clientErrors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#E5E5E5] focus:border-[#111111]'
                  } text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-1 focus:ring-[#111111] transition-all`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#777777] hover:text-[#111111] focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {clientErrors.password && (
                <p className="mt-1 text-[11px] text-red-600 font-mono">
                  {clientErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#111111] hover:bg-black text-white text-xs font-mono uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Console</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Dev credentials prefill button */}
          <div className="mt-6 pt-5 border-t border-[#E5E5E5] text-center">
            <button
              type="button"
              onClick={fillDevCredentials}
              className="text-[11px] font-mono text-[#777777] hover:text-[#111111] underline underline-offset-4 focus:outline-none cursor-pointer"
            >
              Fill Seeded Admin Credentials (admin@cocovantage.com)
            </button>
          </div>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777]">
        COCO-VANTAGE © 2026 · RESTRICTED ADMINISTRATIVE SYSTEM
      </footer>
    </div>
  );
}
