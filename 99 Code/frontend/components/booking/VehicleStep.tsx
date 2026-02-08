'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VEHICLE_BRANDS, VEHICLE_MODELS } from "@/lib/constants/vehicles";
import { BrandCardGrid } from "./BrandCardGrid";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

interface VehicleStepProps {
  formData: {
    brand: string;
    model: string;
    year: string;
    mileage: string;
    licensePlate?: string;
    saveVehicle: boolean;
  };
  onUpdate: (data: Partial<VehicleStepProps['formData']>) => void;
  translations: {
    title: string;
    brand: string;
    selectBrand: string;
    model: string;
    selectModel: string;
    year: string;
    yearPlaceholder?: string;
    mileage: string;
    mileagePlaceholder: string;
    saveVehicle: string;
    licensePlate?: string;
    licensePlatePlaceholder?: string;
    subtitle?: string;
  };
}

const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => (2026 - i).toString());

// Top 5 + andere mapping: brand grid IDs -> VEHICLE_BRANDS IDs
const GRID_TO_BRAND: Record<string, string> = {
  bmw: 'bmw',
  mercedes: 'mercedes',
  audi: 'audi',
  vw: 'vw',
  porsche: 'porsche',
};

function formatMileage(value: string, locale: string = 'de'): string {
  const num = value.replace(/\D/g, '');
  if (!num) return '';
  return parseInt(num, 10).toLocaleString(locale === 'en' ? 'en-US' : 'de-DE');
}

function parseMileage(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export function VehicleStep({ formData, onUpdate, translations }: VehicleStepProps) {
  const { language } = useLanguage();
  const resolvedBrand = formData.brand === 'andere' ? '' : formData.brand;
  const models = resolvedBrand ? (VEHICLE_MODELS[resolvedBrand] || []) : [];

  const handleBrandGridSelect = (gridId: string) => {
    if (gridId === 'andere') {
      onUpdate({ brand: 'andere', model: '' });
    } else {
      onUpdate({ brand: gridId, model: '' });
    }
  };

  return (
    <Card className="card-premium animate-fade-in" data-testid="vehicle-step">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        {translations.subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{translations.subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand card grid */}
        <div className="space-y-3">
          <Label>{translations.brand || translations.selectBrand}</Label>
          <BrandCardGrid
            selectedBrand={formData.brand}
            onSelect={handleBrandGridSelect}
          />
        </div>

        {/* If "Andere" selected, show full brand dropdown */}
        {formData.brand === 'andere' && (
          <div className="space-y-2">
            <Label>{translations.selectBrand}</Label>
            <Select
              value=""
              onValueChange={(v) => onUpdate({ brand: v, model: '' })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={translations.selectBrand} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {VEHICLE_BRANDS.filter(
                  (b) => !Object.keys(GRID_TO_BRAND).includes(b.id)
                ).map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Model + Year row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{translations.model}</Label>
            <Select
              value={formData.model}
              onValueChange={(v) => onUpdate({ model: v })}
              disabled={!resolvedBrand || models.length === 0}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={translations.selectModel} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{translations.year}</Label>
            <Select
              value={formData.year}
              onValueChange={(v) => onUpdate({ year: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={translations.yearPlaceholder || '2024'} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mileage + License Plate row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mileage">{translations.mileage}</Label>
            <div className="relative">
              <Input
                id="mileage"
                type="text"
                placeholder={translations.mileagePlaceholder}
                value={formatMileage(formData.mileage, language)}
                onChange={(e) => onUpdate({ mileage: parseMileage(e.target.value) })}
                className="rounded-xl pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                km
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="licensePlate">
              {translations.licensePlate || 'License Plate'}
            </Label>
            <Input
              id="licensePlate"
              type="text"
              placeholder={translations.licensePlatePlaceholder || 'e.g. B-AC 1234'}
              value={formData.licensePlate || ''}
              onChange={(e) => onUpdate({ licensePlate: e.target.value.toUpperCase() })}
              className="rounded-xl uppercase"
              style={{ letterSpacing: '1px' }}
            />
          </div>
        </div>

        {/* Save vehicle checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="saveVehicle"
            checked={formData.saveVehicle}
            onCheckedChange={(c) => onUpdate({ saveVehicle: !!c })}
          />
          <Label htmlFor="saveVehicle" className="text-sm font-normal text-muted-foreground">
            {translations.saveVehicle}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
