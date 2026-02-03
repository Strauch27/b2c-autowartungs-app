'use client';

import { Sparkles } from "lucide-react";

interface ConciergeBannerProps {
  title: string;
  subtitle: string;
}

export function ConciergeBanner({ title, subtitle }: ConciergeBannerProps) {
  return (
    <div className="border-b border-success/20 bg-gradient-to-r from-success/10 via-success/5 to-transparent">
      <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
          <Sparkles className="h-4 w-4 text-success" />
        </div>
        <p className="text-sm font-medium text-success">
          <span className="font-bold">{title}:</span> {subtitle}
        </p>
      </div>
    </div>
  );
}
