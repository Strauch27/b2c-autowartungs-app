'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-hooks';
import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Button component that handles user logout
 * Clears auth token and redirects to landing page
 */
export function LogoutButton({
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
      logout();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Abmelden
    </Button>
  );
}
