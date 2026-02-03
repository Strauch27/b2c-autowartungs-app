'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRequireAuth } from '@/lib/auth-hooks';
import type { UserRole } from '@/lib/auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * Component that protects routes by checking authentication and role
 * Redirects to login if not authenticated or wrong role
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const t = useTranslations('protectedRoute');
  const { isLoading, user, isAuthorized } = useRequireAuth(requiredRole);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not authenticated - redirect to appropriate login
      const loginPath = requiredRole ? `/${locale}/${requiredRole}/login` : `/${locale}`;
      router.push(redirectTo || loginPath);
      return;
    }

    if (requiredRole && !isAuthorized) {
      // Wrong role - redirect to their dashboard or home
      const dashboardPath = `/${locale}/${user.role}/dashboard`;
      router.push(dashboardPath);
    }
  }, [isLoading, user, isAuthorized, requiredRole, redirectTo, router, locale]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authorized
  if (!user || (requiredRole && !isAuthorized)) {
    return null;
  }

  return <>{children}</>;
}
