'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Wrench,
  Users,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

function TeamContent() {
  const t = useTranslations('workshopTeam');
  const language = useLocale();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={`/${language}/workshop/dashboard`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToDashboard')}
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-workshop" />
            <h1 className="font-semibold">{t('title')}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="card-premium border-l-4 border-l-primary">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{t('comingSoon')}</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              {t('comingSoonText')}
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Feature in development</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function WorkshopTeamPage() {
  return (
    <ProtectedRoute requiredRole="workshop">
      <TeamContent />
    </ProtectedRoute>
  );
}
