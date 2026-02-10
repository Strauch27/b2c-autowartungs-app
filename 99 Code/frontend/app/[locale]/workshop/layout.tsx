'use client';

import { PortalLayout } from '@/components/layout/PortalLayout';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const switchLocale = (newLocale: string) => {
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-white/15 p-0.5">
      <button
        onClick={() => switchLocale('de')}
        className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'de' ? 'bg-white/25 text-white' : 'text-white/60 hover:text-white'}`}
      >DE</button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${locale === 'en' ? 'bg-white/25 text-white' : 'text-white/60 hover:text-white'}`}
      >EN</button>
    </div>
  );
}

export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('workshopDashboard');

  return (
    <PortalLayout portal="workshop" title={t('orders')} rightSlot={<LanguageToggle />}>
      {children}
    </PortalLayout>
  );
}
