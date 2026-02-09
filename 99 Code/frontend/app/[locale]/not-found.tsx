'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {locale === 'de' ? 'Seite nicht gefunden' : 'Page not found'}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {locale === 'de' ? 'Zur Startseite' : 'Back to Home'}
        </Link>
      </div>
    </div>
  );
}
