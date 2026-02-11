'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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

export function BottomNav({ portal }: BottomNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const tCustomer = useTranslations('customerDashboard.bottomNav');
  const tJockey = useTranslations('jockeyDashboard.bottomNav');
  const tWorkshop = useTranslations('workshopDashboard.bottomNav');

  const base = `/${locale}`;

  let items: NavItem[];

  switch (portal) {
    case 'customer':
      items = [
        { href: `${base}/customer/dashboard`, icon: <Home className="h-5 w-5" />, label: tCustomer('dashboard') },
        { href: `${base}/customer/bookings`, icon: <ClipboardList className="h-5 w-5" />, label: tCustomer('myBookings') },
        { href: `${base}/booking`, icon: <Plus className="h-6 w-6" />, label: tCustomer('newBooking'), isAccent: true },
        { href: `${base}/customer/vehicles`, icon: <Car className="h-5 w-5" />, label: tCustomer('vehicles') },
        { href: `${base}/customer/profile`, icon: <User className="h-5 w-5" />, label: tCustomer('profile') },
      ];
      break;
    case 'jockey':
      items = [
        { href: `${base}/jockey/dashboard`, icon: <ClipboardList className="h-5 w-5" />, label: tJockey('tasks') },
        { href: `${base}/jockey/stats`, icon: <BarChart3 className="h-5 w-5" />, label: tJockey('stats') },
        { href: `${base}/jockey/availability`, icon: <CalendarDays className="h-5 w-5" />, label: tJockey('availability') },
        { href: `${base}/jockey/profile`, icon: <User className="h-5 w-5" />, label: tJockey('profile') },
      ];
      break;
    case 'workshop':
      items = [
        { href: `${base}/workshop/dashboard`, icon: <ClipboardList className="h-5 w-5" />, label: tWorkshop('orders') },
        { href: `${base}/workshop/calendar`, icon: <CalendarDays className="h-5 w-5" />, label: tWorkshop('calendar') },
        { href: `${base}/workshop/stats`, icon: <BarChart3 className="h-5 w-5" />, label: tWorkshop('stats') },
        { href: `${base}/workshop/team`, icon: <Users className="h-5 w-5" />, label: tWorkshop('team') },
      ];
      break;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden"
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
              className="flex flex-col items-center justify-center gap-0.5 -mt-4 min-h-[44px] min-w-[44px]"
              aria-label={item.label}
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cta text-white shadow-lg">
                {item.icon}
              </span>
              <span className="text-[10px] font-medium text-cta whitespace-nowrap">
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
              'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[44px] min-w-[44px]',
              isActive ? 'text-cta' : 'text-neutral-400'
            )}
            aria-label={item.label}
            data-testid={`bottom-nav-${item.label.toLowerCase()}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
