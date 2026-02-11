'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './auth/auth-api';
import { tokenStorage } from './auth/token-storage';
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  UserRole,
} from './auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        // Create a timeout promise that rejects after 3 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Auth check timeout')), 3000);
        });

        // Race between getCurrentUser and timeout
        const user = await Promise.race([
          authApi.getCurrentUser(),
          timeoutPromise
        ]);

        setState({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        // Check if error is due to timeout or network issue
        if (error instanceof Error && error.message.includes('timeout')) {
          console.warn('Failed to verify auth token (timeout). Continuing without authentication.');
        } else if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('Network'))) {
          console.warn('Failed to verify auth token (network error). Continuing without authentication.');
        } else {
          console.error('Failed to load user:', error);
        }

        // Remove invalid token and continue - page will load without auth
        tokenStorage.removeToken();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (role: UserRole, credentials: LoginCredentials) => {
      try {
        const response = await authApi.login(role, credentials);
        // Store token with role prefix so each portal has its own session
        tokenStorage.setToken(response.token, role);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Extract current locale from URL or default to 'de'
        const currentPath = window.location.pathname;
        const locale = currentPath.split('/')[1] || 'de';

        // Redirect to appropriate dashboard (with locale prefix)
        const dashboardPath = `/${locale}/${role.toLowerCase()}/dashboard`;
        router.push(dashboardPath);
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });

    // Extract current locale from URL or default to 'de'
    const currentPath = window.location.pathname;
    const locale = currentPath.split('/')[1] === 'en' ? 'en' : 'de';

    router.push(`/${locale}`);
  }, [router]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
