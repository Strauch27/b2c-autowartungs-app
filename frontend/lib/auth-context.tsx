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
        const user = await authApi.getCurrentUser();
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        console.error('Failed to load user:', error);
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
        tokenStorage.setToken(response.token);
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Extract current locale from URL or default to 'de'
        const currentPath = window.location.pathname;
        const locale = currentPath.split('/')[1] || 'de';

        // Redirect to appropriate dashboard (with locale prefix)
        const dashboardPath = `/${locale}/${role}/dashboard`;
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
    router.push('/');
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
