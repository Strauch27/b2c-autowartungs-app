'use client';

import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const Hero = () => {
  const { t } = useLanguage();
  const params = useParams();
  const locale = params.locale as string || 'de';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/10 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-fade-in">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl animate-fade-in-up">
            {t.hero.title}{" "}
            <span className="relative">
              {t.hero.titleHighlight}
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-cta rounded-full" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl lg:text-2xl animate-fade-in-up animate-delay-100">
            {t.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animate-delay-200">
            <Link href={`/${locale}/booking`}>
              <Button variant="hero" size="xl" data-testid="hero-booking-cta">
                {t.hero.cta}
              </Button>
            </Link>
            <Link href={`/${locale}/customer/login`}>
              <Button variant="outline-light" size="lg" data-testid="hero-login-cta">
                {t.hero.login}
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row animate-fade-in-up animate-delay-300">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= 4 ? "fill-cta text-cta" : "fill-cta/50 text-cta/50"}`}
                />
              ))}
              <span className="ml-2 font-semibold">4.5</span>
            </div>
            <div className="text-sm text-primary-foreground/70">
              {t.hero.rating} <span className="font-semibold text-primary-foreground">1.247</span> {t.hero.reviews}
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
