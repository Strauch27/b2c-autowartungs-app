'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth-hooks';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const { user } = useAuth();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${locale}/customer/dashboard`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {language === 'de' ? 'Mein Profil' : 'My Profile'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{language === 'de' ? 'Name' : 'Name'}</Label>
              <Input value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{language === 'de' ? 'E-Mail' : 'Email'}</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'de'
                ? 'Profilbearbeitung wird in Kürze verfügbar sein.'
                : 'Profile editing will be available soon.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileContent />
    </ProtectedRoute>
  );
}
