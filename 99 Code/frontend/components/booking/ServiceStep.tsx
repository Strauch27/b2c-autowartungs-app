'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ClipboardCheck, Droplets, Disc, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStepProps {
  selectedServices: string[];
  onUpdate: (services: string[]) => void;
  translations: {
    title: string;
    services: {
      oil: { name: string; description: string };
      inspection: { name: string; description: string };
      brakes: { name: string; description: string };
      ac: { name: string; description: string };
    };
    from: string;
  };
  language: 'de' | 'en';
}

const serviceConfig = [
  {
    id: "inspection",
    price: 149,
    icon: ClipboardCheck,
  },
  {
    id: "oil",
    price: 89,
    icon: Droplets,
  },
  {
    id: "brakes",
    price: 199,
    icon: Disc,
  },
  {
    id: "ac",
    price: 119,
    icon: Wind,
  },
];

export function ServiceStep({ selectedServices, onUpdate, translations, language }: ServiceStepProps) {
  const services = serviceConfig.map((config) => ({
    ...config,
    name: translations.services[config.id as keyof typeof translations.services].name,
    description: translations.services[config.id as keyof typeof translations.services].description,
  }));

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <Card className="card-premium animate-fade-in">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {language === "de" ? "Sie können mehrere Services auswählen" : "You can select multiple services"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                onClick={() => {
                  const newServices = isSelected
                    ? selectedServices.filter((id) => id !== service.id)
                    : [...selectedServices, service.id];
                  onUpdate(newServices);
                }}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 hover:shadow-card",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border"
                )}
                data-testid={`service-card-${service.id}`}
                data-selected={isSelected}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">{service.name}</p>
                <p className="mb-3 text-sm text-muted-foreground">{service.description}</p>
                <p className="text-lg font-bold text-cta">{translations.from} {service.price}€</p>
              </button>
            );
          })}
        </div>
        {selectedServices.length > 1 && (
          <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
            <span className="text-sm text-muted-foreground">
              {language === "de" ? "Gesamtpreis:" : "Total:"}{" "}
            </span>
            <span className="font-bold text-cta">
              {totalPrice}€
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
