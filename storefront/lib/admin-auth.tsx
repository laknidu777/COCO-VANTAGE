'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminApiError } from './admin-api';
import { AdminUser } from './admin-types';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authError: string | null;
  clearAuthError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const SESSION_TOKEN_KEY = 'cv_admin_dev_token';
const SESSION_USER_KEY = 'cv_admin_dev_user';

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Initialize session from dev storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
          const storedUser = sessionStorage.getItem(SESSION_USER_KEY);

          if (storedToken && storedUser) {
            const parsedUser = JSON.parse(storedUser) as AdminUser;
            setToken(storedToken);
            setAdmin(parsedUser);

            // Re-validate token with backend /api/v1/auth/me
            try {
              const verifiedUser = await adminApi.getMe(storedToken);
              setAdmin({
                id: verifiedUser.id,
                email: verifiedUser.email,
                name: parsedUser.name || verifiedUser.email,
                role: verifiedUser.role,
              });
            } catch {
              // Token expired or invalid; clear development session
              sessionStorage.removeItem(SESSION_TOKEN_KEY);
              sessionStorage.removeItem(SESSION_USER_KEY);
              setToken(null);
              setAdmin(null);
            }
          }
        }
      } catch {
        // Ignored storage error
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      try {
        const response = await adminApi.login(email, password);
        setToken(response.accessToken);
        setAdmin(response.admin);

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_TOKEN_KEY, response.accessToken);
          sessionStorage.setItem(
            SESSION_USER_KEY,
            JSON.stringify(response.admin),
          );
        }

        router.push('/admin');
      } catch (err) {
        if (err instanceof AdminApiError) {
          if (err.statusCode === 401) {
            setAuthError('Invalid administrator credentials.');
          } else if (err.statusCode === 0) {
            setAuthError(
              'Cannot reach backend server. Please verify backend is running on port 4000.',
            );
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

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
    router.push('/admin/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isAuthenticated: !!token && !!admin,
        login,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
