import { VehicleFormData } from "../validations/vehicle-schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Mock data for development - matches backend seed data
const MOCK_BRANDS = [
  { id: "vw", name: "VW" },
  { id: "audi", name: "Audi" },
  { id: "bmw", name: "BMW" },
  { id: "mercedes", name: "Mercedes" },
  { id: "opel", name: "Opel" },
];

const MOCK_MODELS: Record<string, { id: string; name: string }[]> = {
  VW: [
    { id: "golf-7", name: "Golf 7" },
    { id: "golf-8", name: "Golf 8" },
    { id: "passat-b8", name: "Passat B8" },
    { id: "polo", name: "Polo" },
  ],
  Audi: [
    { id: "a3-8v", name: "A3 8V" },
    { id: "a4-b9", name: "A4 B9" },
  ],
  BMW: [
    { id: "3er-f30", name: "3er F30" },
    { id: "3er-g20", name: "3er G20" },
  ],
  Mercedes: [
    { id: "c-klasse-w205", name: "C-Klasse W205" },
  ],
  Opel: [
    { id: "astra-k", name: "Astra K" },
  ],
};

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
      console.warn("API call failed, using mock data");
      return MOCK_BRANDS;
    }

    const json = await response.json();
    // Handle both direct array and {success, data} response formats
    const brands = Array.isArray(json) ? json : (json.data || []);

    // If backend returns empty array, use mock data for development
    if (brands.length === 0) {
      console.warn("No brands from API, using mock data");
      return MOCK_BRANDS;
    }

    return brands;
  } catch (error) {
    console.warn("API call failed, using mock data:", error);
    return MOCK_BRANDS;
  }
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
      console.warn("API call failed, using mock data");
      return MOCK_MODELS[brand] || [];
    }

    const json = await response.json();
    // Handle both direct array and {success, data} response formats
    const models = Array.isArray(json) ? json : (json.data || []);

    // If backend returns empty array, use mock data for development
    if (models.length === 0) {
      console.warn("No models from API, using mock data");
      return MOCK_MODELS[brand] || [];
    }

    return models;
  } catch (error) {
    console.warn("API call failed, using mock data:", error);
    return MOCK_MODELS[brand] || [];
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
