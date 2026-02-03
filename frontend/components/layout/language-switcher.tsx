'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale as string || 'de';

  const switchLocale = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <div className="flex gap-1">
        <Button
          variant={currentLocale === 'de' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale('de')}
          className="h-8 px-3 text-sm"
        >
          DE
        </Button>
        <Button
          variant={currentLocale === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchLocale('en')}
          className="h-8 px-3 text-sm"
        >
          EN
        </Button>
      </div>
    </div>
  );
}
