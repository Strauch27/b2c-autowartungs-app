import { useAuthContext } from './auth-context';
import type { User, UserRole } from './auth/types';

/**
 * Hook to access auth state and methods
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Hook to get current user (throws if not authenticated)
 */
export function useUser(): User {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || !user) {
    throw new Error('User is not authenticated');
  }

  return user;
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(requiredRole: UserRole): boolean {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated || !user) {
    return false;
  }

  return user.role === requiredRole;
}

/**
 * Hook to require authentication (redirects if not authenticated)
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return { isLoading: true, user: null, isAuthorized: false };
  }

  if (!isAuthenticated || !user) {
    return { isLoading: false, user: null, isAuthorized: false };
  }

  const isAuthorized = requiredRole ? user.role === requiredRole : true;

  return { isLoading: false, user, isAuthorized };
}
