'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

function StatsContent() {
  const { t, language } = useLanguage();

  // TODO: Replace with real data from backend when endpoint is available
  const placeholderStats = {
    tripsThisWeek: 12,
    tripsThisMonth: 47,
    averageRating: 4.8,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-jockey text-jockey-foreground">
        <div className="container mx-auto flex h-14 sm:h-16 items-center gap-3 px-4">
          <Link href={`/${language}/jockey/dashboard`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-jockey-foreground hover:bg-jockey-foreground/10"
              aria-label={t.jockeyStats.backToDashboard}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">{t.jockeyStats.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-1 text-3xl font-bold text-primary">{placeholderStats.tripsThisWeek}</div>
              <p className="text-sm text-muted-foreground">{t.jockeyStats.tripsThisWeek}</p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-jockey/10">
                <Calendar className="h-6 w-6 text-jockey" />
              </div>
              <div className="mb-1 text-3xl font-bold text-jockey">{placeholderStats.tripsThisMonth}</div>
              <p className="text-sm text-muted-foreground">{t.jockeyStats.tripsThisMonth}</p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Star className="h-6 w-6 text-success" />
              </div>
              <div className="mb-1 text-3xl font-bold text-success">{placeholderStats.averageRating}</div>
              <p className="text-sm text-muted-foreground">{t.jockeyStats.averageRating}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function JockeyStatsPage() {
  return (
    <ProtectedRoute requiredRole="jockey">
      <StatsContent />
    </ProtectedRoute>
  );
}
