import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Bitte wählen Sie eine Marke aus"),
  model: z.string().min(1, "Bitte wählen Sie ein Modell aus"),
  year: z
    .number({
      required_error: "Bitte wählen Sie ein Baujahr aus",
      invalid_type_error: "Baujahr muss eine Zahl sein",
    })
    .min(1994, "Baujahr muss mindestens 1994 sein")
    .max(currentYear, `Baujahr darf nicht größer als ${currentYear} sein`),
  mileage: z
    .number({
      required_error: "Bitte geben Sie den Kilometerstand ein",
      invalid_type_error: "Kilometerstand muss eine Zahl sein",
    })
    .min(0, "Kilometerstand muss mindestens 0 sein")
    .max(500000, "Kilometerstand darf nicht größer als 500.000 km sein"),
  licensePlate: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Plausibility check for unrealistic values
export function checkPlausibility(
  year: number,
  mileage: number
): { isPlausible: boolean; warning?: string } {
  const vehicleAge = currentYear - year;
  const averageKmPerYear = vehicleAge > 0 ? mileage / vehicleAge : mileage;

  // Check for extremely high mileage for newer cars
  if (vehicleAge <= 3 && mileage > 150000) {
    return {
      isPlausible: false,
      warning: `Ein ${year}er Fahrzeug mit ${mileage.toLocaleString("de-DE")} km ist ungewöhnlich. Bitte prüfen Sie Ihre Angaben.`,
    };
  }

  // Check for extremely low mileage for older cars
  if (vehicleAge >= 10 && mileage < 50000) {
    return {
      isPlausible: false,
      warning: `Ein ${year}er Fahrzeug mit nur ${mileage.toLocaleString("de-DE")} km ist sehr niedrig. Ist das korrekt?`,
    };
  }

  // Check for unrealistic average km/year
  if (averageKmPerYear > 50000) {
    return {
      isPlausible: false,
      warning: `Durchschnittlich ${Math.round(averageKmPerYear).toLocaleString("de-DE")} km/Jahr ist sehr hoch. Bitte prüfen Sie Ihre Angaben.`,
    };
  }

  return { isPlausible: true };
}
