'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to send reset email
    setSubmitted(true);
    toast.success(
      language === 'de'
        ? 'E-Mail wurde gesendet'
        : 'Email has been sent'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href={`/${locale}/customer/login`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Zurück zum Login' : 'Back to Login'}
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>
              {language === 'de' ? 'Passwort zurücksetzen' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.'
                : 'Enter your email address and we will send you a reset link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'de'
                    ? `Falls ein Konto mit ${email} existiert, haben wir eine E-Mail mit Anweisungen zum Zurücksetzen gesendet.`
                    : `If an account exists for ${email}, we've sent an email with reset instructions.`}
                </p>
                <Link href={`/${locale}/customer/login`}>
                  <Button variant="outline" className="w-full">
                    {language === 'de' ? 'Zurück zum Login' : 'Back to Login'}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'de' ? 'E-Mail-Adresse' : 'Email Address'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'de' ? 'ihre@email.de' : 'your@email.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {language === 'de' ? 'Link senden' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
