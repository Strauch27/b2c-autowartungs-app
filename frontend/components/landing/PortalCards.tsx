'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const PortalCards = () => {
  const { t } = useLanguage();
  const params = useParams();
  const locale = params.locale as string || 'de';

  const portals = [
    {
      title: t.portals.customer.title,
      description: t.portals.customer.description,
      button: t.portals.customer.button,
      icon: Car,
      href: `/${locale}/customer/login`,
      variant: "customer" as const,
      buttonVariant: "default" as const,
      accentClass: "border-l-primary bg-primary/5",
      iconClass: "text-primary",
    },
    {
      title: t.portals.jockey.title,
      description: t.portals.jockey.description,
      button: t.portals.jockey.button,
      icon: User,
      href: `/${locale}/jockey/login`,
      variant: "jockey" as const,
      buttonVariant: "jockey" as const,
      accentClass: "border-l-jockey bg-jockey/5",
      iconClass: "text-jockey",
    },
    {
      title: t.portals.workshop.title,
      description: t.portals.workshop.description,
      button: t.portals.workshop.button,
      icon: Wrench,
      href: `/${locale}/workshop/login`,
      variant: "workshop" as const,
      buttonVariant: "workshop" as const,
      accentClass: "border-l-workshop bg-workshop/5",
      iconClass: "text-workshop",
    },
  ];

  return (
    <section className="section-spacing">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t.portals.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t.portals.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((portal, index) => (
            <Card
              key={portal.title}
              className={`card-premium border-l-4 ${portal.accentClass} animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-subtle ${portal.iconClass}`}>
                  <portal.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl">{portal.title}</CardTitle>
                <CardDescription className="text-base">
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={portal.href}>
                  <Button variant={portal.buttonVariant} className="w-full group">
                    {portal.button}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalCards;
