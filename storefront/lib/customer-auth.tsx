'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from './api-client';

export interface CustomerUser {
  id: string;
  email: string;
  role: 'CUSTOMER';
  createdAt?: string;
}

export interface CustomerAuthResponse {
  accessToken: string;
  tokenType: string;
  customer: CustomerUser;
}

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, password: string, returnUrl?: string) => Promise<void>;
  register: (email: string, password: string, returnUrl?: string) => Promise<void>;
  logout: () => void;
  clearAuthError: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined,
);

const SESSION_TOKEN_KEY = 'cv_customer_session_token';

/**
 * Validates that a returnUrl is a safe internal relative path to prevent open redirects.
 */
export function sanitizeReturnUrl(returnUrl?: string | null): string {
  if (!returnUrl) return '/account';
  const trimmed = returnUrl.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return '/account';
}

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Restore and verify customer session on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);

          if (storedToken) {
            // Verify token against backend customer me endpoint
            try {
              const profile = await apiClient.get<CustomerUser>('/auth/customer/me', {
                token: storedToken,
              });

              if (isMounted) {
                setToken(storedToken);
                setCustomer(profile);
              }
            } catch {
              // Token invalid or expired: clear session
              sessionStorage.removeItem(SESSION_TOKEN_KEY);
              if (isMounted) {
                setToken(null);
                setCustomer(null);
              }
            }
          }
        }
      } catch {
        // Ignored storage error
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, returnUrl?: string) => {
      setAuthError(null);
      try {
        const response = await apiClient.post<CustomerAuthResponse>(
          '/auth/customer/login',
          { email: email.trim(), password },
        );

        setToken(response.accessToken);
        setCustomer(response.customer);

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_TOKEN_KEY, response.accessToken);
        }

        const destination = sanitizeReturnUrl(returnUrl);
        router.push(destination);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 401) {
            setAuthError('Invalid email or password.');
          } else if (err.statusCode === 0) {
            setAuthError('Cannot connect to authentication service. Please check your connection.');
          } else {
            setAuthError(err.message || 'Authentication failed.');
          }
        } else {
          setAuthError('An unexpected network error occurred.');
        }
        throw err;
      }
    },
    [router],
  );

  const register = useCallback(
    async (email: string, password: string, returnUrl?: string) => {
      setAuthError(null);
      try {
        const response = await apiClient.post<CustomerAuthResponse>(
          '/auth/register',
          { email: email.trim(), password },
        );

        setToken(response.accessToken);
        setCustomer(response.customer);

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_TOKEN_KEY, response.accessToken);
        }

        const destination = sanitizeReturnUrl(returnUrl);
        router.push(destination);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 409) {
            setAuthError('An account with this email address already exists.');
          } else if (err.statusCode === 400) {
            setAuthError(err.message || 'Please check your registration details.');
          } else if (err.statusCode === 0) {
            setAuthError('Cannot connect to authentication service. Please check your connection.');
          } else {
            setAuthError(err.message || 'Registration failed.');
          }
        } else {
          setAuthError('An unexpected network error occurred.');
        }
        throw err;
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    }
    router.push('/login');
  }, [router]);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: !!token && !!customer,
        authError,
        clearAuthError,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
