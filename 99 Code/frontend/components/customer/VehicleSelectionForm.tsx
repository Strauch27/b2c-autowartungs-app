"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  vehicleSchema,
  VehicleFormData,
  checkPlausibility,
} from "@/lib/validations/vehicle-schema";
import { getBrands, getModelsByBrand, Brand, Model } from "@/lib/api/vehicles";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

interface VehicleSelectionFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function VehicleSelectionForm({
  onSubmit,
  onValidationChange,
}: VehicleSelectionFormProps) {
  const { t } = useLanguage();

  // Form state
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [mileage, setMileage] = useState<string>("");

  // Data state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [brandSearch, setBrandSearch] = useState<string>("");

  // UI state
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [plausibilityWarning, setPlausibilityWarning] = useState<string>("");

  // Generate year options (1994 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1994 + 1 },
    (_, i) => currentYear - i
  );

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (brand) {
      loadModels(brand);
      setModel(""); // Reset model when brand changes
    } else {
      setModels([]);
      setModel("");
    }
  }, [brand]);

  // Validate form and check plausibility
  useEffect(() => {
    validateForm();
  }, [brand, model, year, mileage]);

  const loadBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Failed to load brands:", error);
      setErrors((prev) => ({
        ...prev,
        brands: t.vehicleForm.errorLoadingBrands,
      }));
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const loadModels = async (selectedBrand: string) => {
    setIsLoadingModels(true);
    try {
      const data = await getModelsByBrand(selectedBrand);
      setModels(data);
    } catch (error) {
      console.error("Failed to load models:", error);
      setErrors((prev) => ({
        ...prev,
        models: t.vehicleForm.errorLoadingModels,
      }));
    } finally {
      setIsLoadingModels(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Only validate if user has started filling the form
    if (!brand && !model && !year && !mileage) {
      onValidationChange?.(false);
      return;
    }

    // Validate using Zod schema
    try {
      const formData = {
        brand,
        model,
        year: year ? parseInt(year) : 0,
        mileage: mileage ? parseInt(mileage) : 0,
      };

      vehicleSchema.parse(formData);

      // Check plausibility
      if (year && mileage) {
        const { isPlausible, warning } = checkPlausibility(
          parseInt(year),
          parseInt(mileage)
        );
        if (!isPlausible && warning) {
          setPlausibilityWarning(warning);
        } else {
          setPlausibilityWarning("");
        }
      }
    } catch (error: any) {
      isValid = false;
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
    }

    setErrors(newErrors);
    onValidationChange?.(isValid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = vehicleSchema.parse({
        brand,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
      });

      onSubmit(formData);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  // Filter brands based on search
  const filteredBrands = brandSearch
    ? brands.filter((b) =>
        b.name.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : brands;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Selection with Autocomplete */}
      <div className="space-y-2">
        <Label htmlFor="brand">
          {t.vehicleForm.brand} <span className="text-red-500">{t.vehicleForm.required}</span>
        </Label>
        <div className="space-y-2">
          <Input
            id="brand-search"
            type="text"
            placeholder={t.vehicleForm.brandSearch}
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            disabled={isLoadingBrands}
          />
          <Select
            value={brand}
            onValueChange={setBrand}
            disabled={isLoadingBrands}
          >
            <SelectTrigger id="brand" className={errors.brand ? "border-red-500" : ""}>
              <SelectValue placeholder={t.vehicleForm.brandPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {filteredBrands.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  {isLoadingBrands ? t.vehicleForm.loading : t.vehicleForm.noBrandsFound}
                </div>
              ) : (
                filteredBrands.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        {errors.brand && (
          <p className="text-sm text-red-500">{errors.brand}</p>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model">
          {t.vehicleForm.model} <span className="text-red-500">{t.vehicleForm.required}</span>
        </Label>
        <Select
          value={model}
          onValueChange={setModel}
          disabled={!brand || isLoadingModels}
        >
          <SelectTrigger id="model" className={errors.model ? "border-red-500" : ""}>
            <SelectValue
              placeholder={
                !brand
                  ? t.vehicleForm.modelSelectBrandFirst
                  : isLoadingModels
                  ? t.vehicleForm.loading
                  : t.vehicleForm.modelPlaceholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {models.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {isLoadingModels ? t.vehicleForm.loading : t.vehicleForm.noModelsAvailable}
              </div>
            ) : (
              models.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.model && (
          <p className="text-sm text-red-500">{errors.model}</p>
        )}
      </div>

      {/* Year Selection */}
      <div className="space-y-2">
        <Label htmlFor="year">
          {t.vehicleForm.year} <span className="text-red-500">{t.vehicleForm.required}</span>
        </Label>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger id="year" className={errors.year ? "border-red-500" : ""}>
            <SelectValue placeholder={t.vehicleForm.yearPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
      </div>

      {/* Mileage Input */}
      <div className="space-y-2">
        <Label htmlFor="mileage">
          {t.vehicleForm.mileage} <span className="text-red-500">{t.vehicleForm.required}</span>
        </Label>
        <div className="relative">
          <Input
            id="mileage"
            type="number"
            placeholder={t.vehicleForm.mileagePlaceholder}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            min="0"
            max="500000"
            step="1000"
            className={errors.mileage ? "border-red-500" : ""}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {t.vehicleForm.mileageUnit}
          </span>
        </div>
        {errors.mileage && (
          <p className="text-sm text-red-500">{errors.mileage}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t.vehicleForm.mileageRange}
        </p>
      </div>

      {/* Plausibility Warning */}
      {plausibilityWarning && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.vehicleForm.plausibilityWarning}</AlertTitle>
          <AlertDescription>{plausibilityWarning}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button (hidden - controlled by parent) */}
      <button type="submit" className="hidden" aria-hidden="true" />
    </form>
  );
}
