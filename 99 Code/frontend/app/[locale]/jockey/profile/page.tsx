'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Mail } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import { useUser } from "@/lib/auth-hooks";

function ProfileContent() {
  const { language } = useLanguage();
  const user = useUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-jockey text-jockey-foreground">
        <div className="container mx-auto flex h-14 sm:h-16 items-center gap-3 px-4">
          <Link href={`/${language}/jockey/dashboard`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              aria-label={language === 'de' ? 'Zuruck zum Dashboard' : 'Back to dashboard'}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">
            {language === 'de' ? 'Mein Profil' : 'My Profile'}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          <Card className="card-premium">
            <CardContent className="flex items-center gap-4 p-4 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jockey/10">
                <User className="h-6 w-6 text-jockey" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'de' ? 'Name' : 'Name'}
                </p>
                <p className="font-medium">{user.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="flex items-center gap-4 p-4 sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jockey/10">
                <Mail className="h-6 w-6 text-jockey" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'de' ? 'E-Mail' : 'Email'}
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function JockeyProfilePage() {
  return (
    <ProtectedRoute requiredRole="jockey">
      <ProfileContent />
    </ProtectedRoute>
  );
}
