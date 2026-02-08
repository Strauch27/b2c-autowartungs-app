'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ClipboardCheck, Droplets, Disc, RefreshCw, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStepProps {
  selectedServices: string[];
  onUpdate: (services: string[]) => void;
  translations: {
    title: string;
    services: Record<string, { name: string; description: string }>;
    from: string;
  };
  language: 'de' | 'en';
}

const serviceConfig = [
  {
    id: "inspection",
    price: 149,
    icon: ClipboardCheck,
    colorClass: 'bg-blue-50 text-blue-500',
    priceColor: 'text-blue-500',
  },
  {
    id: "oil",
    price: 89,
    icon: Droplets,
    colorClass: 'bg-amber-50 text-amber-500',
    priceColor: 'text-amber-500',
  },
  {
    id: "brakes",
    price: 199,
    icon: Disc,
    colorClass: 'bg-red-50 text-red-500',
    priceColor: 'text-red-500',
  },
  {
    id: "tires",
    price: 59,
    icon: RefreshCw,
    colorClass: 'bg-green-50 text-green-500',
    priceColor: 'text-green-500',
  },
  {
    id: "tuv",
    price: 119,
    icon: Shield,
    colorClass: 'bg-purple-50 text-purple-500',
    priceColor: 'text-purple-500',
  },
  {
    id: "maintenance",
    price: 249,
    icon: Settings,
    colorClass: 'bg-indigo-50 text-indigo-500',
    priceColor: 'text-indigo-500',
  },
];

export { serviceConfig };

export function ServiceStep({ selectedServices, onUpdate, translations, language }: ServiceStepProps) {
  const totalPrice = serviceConfig
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <Card className="card-premium animate-fade-in" data-testid="service-step">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "de" ? "Sie können mehrere Services auswählen" : "You can select multiple services"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {serviceConfig.map((config) => {
            const Icon = config.icon;
            const isSelected = selectedServices.includes(config.id);
            const serviceTranslation = translations.services[config.id as keyof typeof translations.services];
            const name = serviceTranslation?.name || config.id;
            const description = serviceTranslation?.description || '';

            return (
              <button
                key={config.id}
                onClick={() => {
                  const newServices = isSelected
                    ? selectedServices.filter((id) => id !== config.id)
                    : [...selectedServices, config.id];
                  onUpdate(newServices);
                }}
                className={cn(
                  "service-select relative flex flex-col items-start rounded-xl p-5 text-left transition-all",
                  isSelected ? "service-select-selected" : ""
                )}
                data-testid={`service-card-${config.id}`}
                data-selected={isSelected}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${config.colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-bold mb-1">{name}</h4>
                <p className="text-muted-foreground text-xs mb-3">{description}</p>
                <span className={`font-bold ${config.priceColor}`}>
                  {translations.from} {config.price} EUR
                </span>
              </button>
            );
          })}
        </div>

        {/* Running total - show when >=1 service selected */}
        {selectedServices.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center justify-between" data-testid="service-total">
            <span className="font-semibold text-blue-900">
              {language === "de" ? "Zwischensumme" : "Subtotal"}
            </span>
            <span className="font-bold text-xl text-blue-600">
              {totalPrice} EUR
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
