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
    mileage: string;
    mileagePlaceholder: string;
    saveVehicle: string;
  };
}

const carBrands = [
  { id: "bmw", name: "BMW", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/600px-BMW.svg.png" },
  { id: "mercedes", name: "Mercedes-Benz", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/600px-Mercedes-Logo.svg.png" },
  { id: "audi", name: "Audi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/600px-Audi-Logo_2016.svg.png" },
  { id: "vw", name: "Volkswagen", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/600px-Volkswagen_logo_2019.svg.png" },
  { id: "porsche", name: "Porsche", logo: "https://upload.wikimedia.org/wikipedia/de/thumb/6/60/Porsche_Logo.svg/600px-Porsche_Logo.svg.png" },
];

export function VehicleStep({ formData, onUpdate, translations }: VehicleStepProps) {
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
              onValueChange={(v) => onUpdate({ brand: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.selectBrand}>
                  {formData.brand && (
                    <div className="flex items-center gap-2">
                      <img
                        src={carBrands.find((b) => b.id === formData.brand)?.logo}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                      <span>{carBrands.find((b) => b.id === formData.brand)?.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {carBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={brand.logo}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
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
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.selectModel} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="320i">320i</SelectItem>
                <SelectItem value="520d">520d</SelectItem>
                <SelectItem value="x3">X3</SelectItem>
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
              placeholder="z.B. 2020"
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
