'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImprintPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${locale}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Zurück' : 'Back'}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-8">
          {language === 'de' ? 'Impressum' : 'Imprint'}
        </h1>
        <div className="prose prose-gray max-w-none space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">AutoConcierge GmbH</h2>
            <p className="text-muted-foreground">
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {language === 'de' ? 'Kontakt' : 'Contact'}
            </h3>
            <p className="text-muted-foreground">
              E-Mail: info@ronya.de<br />
              Telefon: +49 30 123 456 789
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
