'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
          {language === 'de' ? 'Allgemeine Geschäftsbedingungen' : 'Terms & Conditions'}
        </h1>
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-muted-foreground">
            {language === 'de'
              ? 'Die AGB werden in Kürze vervollständigt. Bei Fragen wenden Sie sich bitte an info@ronya.de.'
              : 'The terms and conditions will be completed shortly. For questions, please contact info@ronya.de.'}
          </p>
        </div>
      </div>
    </div>
  );
}
