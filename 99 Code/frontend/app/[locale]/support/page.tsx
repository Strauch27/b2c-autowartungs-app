'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportPage() {
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

        <h1 className="text-3xl font-bold mb-2">
          {language === 'de' ? 'Hilfe & Support' : 'Help & Support'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {language === 'de'
            ? 'Wir sind für Sie da. Kontaktieren Sie uns über einen der folgenden Wege.'
            : 'We are here to help. Contact us through one of the following channels.'}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">E-Mail</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'de' ? 'Schreiben Sie uns eine E-Mail' : 'Send us an email'}
              </p>
              <a href="mailto:b2c@centhree.com" className="text-primary hover:underline text-sm font-medium">
                b2c@centhree.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">
                {language === 'de' ? 'Telefon' : 'Phone'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'de' ? 'Mo-Fr 9-18 Uhr' : 'Mon-Fri 9am-6pm'}
              </p>
              <a href="tel:+4930123456789" className="text-primary hover:underline text-sm font-medium">
                +49 30 123 456 789
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">FAQ</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently asked questions'}
              </p>
              <Link href={`/${locale}#faq`} className="text-primary hover:underline text-sm font-medium">
                {language === 'de' ? 'FAQ ansehen' : 'View FAQ'}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
