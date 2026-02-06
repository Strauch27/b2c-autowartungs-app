import { VehicleFormData } from "../validations/vehicle-schema";
import { VEHICLE_BRANDS, VEHICLE_MODELS } from "../constants/vehicles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface SaveVehicleResponse {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

/**
 * Fetch available vehicle brands
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/services/brands`);

    if (!response.ok) {
      console.warn("API call failed, using fallback data");
      return VEHICLE_BRANDS;
    }

    const json = await response.json();
    // Handle both direct array and {success, data} response formats
    const brands = Array.isArray(json) ? json : (json.data || []);

    // If backend returns empty array, use fallback data
    if (brands.length === 0) {
      console.warn("No brands from API, using fallback data");
      return VEHICLE_BRANDS;
    }

    // Transform string[] → Brand[] if backend returns plain strings
    return brands.map((b: any) =>
      typeof b === 'string' ? { id: b.toLowerCase(), name: b } : b
    );
  } catch (error) {
    console.warn("API call failed, using fallback data:", error);
    return VEHICLE_BRANDS;
  }
}

function getFallbackModels(brand: string): Model[] {
  // Try direct lookup (brand id)
  if (VEHICLE_MODELS[brand]) return VEHICLE_MODELS[brand];

  // Try lowercase (e.g. "BMW" → "bmw")
  const lower = brand.toLowerCase();
  if (VEHICLE_MODELS[lower]) return VEHICLE_MODELS[lower];

  // Try matching by brand name (e.g. "Mercedes-Benz" → find id "mercedes")
  const match = VEHICLE_BRANDS.find(
    (b) => b.name.toLowerCase() === lower
  );
  if (match && VEHICLE_MODELS[match.id]) return VEHICLE_MODELS[match.id];

  return [];
}

/**
 * Fetch vehicle models for a specific brand
 */
export async function getModelsByBrand(brand: string): Promise<Model[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/services/brands/${encodeURIComponent(brand)}/models`
    );

    if (!response.ok) {
      console.warn("API call failed, using fallback data");
      return getFallbackModels(brand);
    }

    const json = await response.json();
    // Handle both direct array and {success, data} response formats
    const models = Array.isArray(json) ? json : (json.data || []);

    // If backend returns empty array, use fallback data
    if (models.length === 0) {
      console.warn("No models from API, using fallback data");
      return getFallbackModels(brand);
    }

    // Transform string[] → Model[] if backend returns plain strings
    return models.map((m: any) =>
      typeof m === 'string' ? { id: m.toLowerCase().replace(/\s+/g, '-'), name: m } : m
    );
  } catch (error) {
    console.warn("API call failed, using fallback data:", error);
    return getFallbackModels(brand);
  }
}

/**
 * Save vehicle data
 */
export async function saveVehicle(
  data: VehicleFormData
): Promise<SaveVehicleResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save vehicle");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving vehicle:", error);
    throw error;
  }
}

/**
 * Search brands by query (for autocomplete)
 */
export async function searchBrands(query: string): Promise<Brand[]> {
  const brands = await getBrands();
  const lowerQuery = query.toLowerCase();

  return brands.filter((brand) =>
    brand.name.toLowerCase().includes(lowerQuery)
  );
}
