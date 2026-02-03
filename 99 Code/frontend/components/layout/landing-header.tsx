'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LanguageSwitcher } from './language-switcher';

export function LandingHeader() {
  const params = useParams();
  const locale = params.locale as string || 'de';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
          <span className="font-bold text-xl text-blue-600">Ronya B2C</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
