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

interface VehicleStepProps {
  formData: {
    brand: string;
    model: string;
    year: string;
    mileage: string;
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
  };
}

export function VehicleStep({ formData, onUpdate, translations }: VehicleStepProps) {
  const models = formData.brand ? (VEHICLE_MODELS[formData.brand] || []) : [];

  return (
    <Card className="card-premium animate-fade-in">
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{translations.brand}</Label>
            <Select
              value={formData.brand}
              onValueChange={(v) => onUpdate({ brand: v, model: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.selectBrand}>
                  {formData.brand && (() => {
                    const selected = VEHICLE_BRANDS.find((b) => b.id === formData.brand);
                    return selected ? (
                      <div className="flex items-center gap-2">
                        {selected.logo && (
                          <img src={selected.logo} alt="" className="h-5 w-5 object-contain" />
                        )}
                        <span>{selected.name}</span>
                      </div>
                    ) : null;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {VEHICLE_BRANDS.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    <div className="flex items-center gap-2">
                      {brand.logo ? (
                        <img src={brand.logo} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <span className="inline-block h-5 w-5" />
                      )}
                      <span>{brand.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{translations.model}</Label>
            <Select
              value={formData.model}
              onValueChange={(v) => onUpdate({ model: v })}
              disabled={!formData.brand}
            >
              <SelectTrigger>
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="year">{translations.year}</Label>
            <Input
              id="year"
              type="number"
              placeholder={translations.yearPlaceholder || "e.g. 2020"}
              value={formData.year}
              onChange={(e) => onUpdate({ year: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mileage">{translations.mileage}</Label>
            <div className="relative">
              <Input
                id="mileage"
                type="number"
                placeholder={translations.mileagePlaceholder}
                value={formData.mileage}
                onChange={(e) => onUpdate({ mileage: e.target.value })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                km
              </span>
            </div>
          </div>
        </div>
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
