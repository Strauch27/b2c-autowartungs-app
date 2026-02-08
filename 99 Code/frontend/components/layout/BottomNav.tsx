'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Home,
  ClipboardList,
  Plus,
  Car,
  User,
  BarChart3,
  CalendarDays,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  isAccent?: boolean;
}

interface BottomNavProps {
  portal: 'customer' | 'jockey' | 'workshop';
}

function getNavItems(portal: BottomNavProps['portal'], locale: string): NavItem[] {
  const base = `/${locale}`;

  switch (portal) {
    case 'customer':
      return [
        { href: `${base}/customer/dashboard`, icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
        { href: `${base}/customer/bookings`, icon: <ClipboardList className="h-5 w-5" />, label: 'Buchungen' },
        { href: `${base}/booking`, icon: <Plus className="h-6 w-6" />, label: 'Neu', isAccent: true },
        { href: `${base}/customer/vehicles`, icon: <Car className="h-5 w-5" />, label: 'Fahrzeuge' },
        { href: `${base}/customer/profile`, icon: <User className="h-5 w-5" />, label: 'Profil' },
      ];
    case 'jockey':
      return [
        { href: `${base}/jockey/dashboard`, icon: <ClipboardList className="h-5 w-5" />, label: 'Aufgaben' },
        { href: `${base}/jockey/stats`, icon: <BarChart3 className="h-5 w-5" />, label: 'Statistiken' },
        { href: `${base}/jockey/availability`, icon: <CalendarDays className="h-5 w-5" />, label: 'Verfügbarkeit' },
        { href: `${base}/jockey/profile`, icon: <User className="h-5 w-5" />, label: 'Profil' },
      ];
    case 'workshop':
      return [
        { href: `${base}/workshop/dashboard`, icon: <ClipboardList className="h-5 w-5" />, label: 'Aufträge' },
        { href: `${base}/workshop/calendar`, icon: <CalendarDays className="h-5 w-5" />, label: 'Kalender' },
        { href: `${base}/workshop/stats`, icon: <BarChart3 className="h-5 w-5" />, label: 'Statistiken' },
        { href: `${base}/workshop/team`, icon: <Users className="h-5 w-5" />, label: 'Team' },
      ];
  }
}

export function BottomNav({ portal }: BottomNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const items = getNavItems(portal, locale);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-end justify-around border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden"
      data-testid="bottom-nav"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);

        if (item.isAccent) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 -mt-4"
              aria-label={item.label}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cta text-white shadow-lg">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium text-cta">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 px-3',
              isActive ? 'text-cta' : 'text-neutral-400'
            )}
            aria-label={item.label}
            data-testid={`bottom-nav-${item.label.toLowerCase()}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
