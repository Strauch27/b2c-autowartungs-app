# API Integration

This directory contains API client functions for interacting with the backend.

## Available Modules

### vehicles.ts

Functions for vehicle-related API calls:

- `getBrands()` - Fetch available vehicle brands
- `getModelsByBrand(brand: string)` - Fetch models for a specific brand
- `saveVehicle(data: VehicleFormData)` - Save vehicle data
- `searchBrands(query: string)` - Search brands by query (for autocomplete)

## Mock Data

All API functions include fallback to mock data for development. This allows frontend development to proceed without a running backend.

Mock data matches the backend seed data structure:

```typescript
// Brands
const MOCK_BRANDS = [
  { id: "vw", name: "VW" },
  { id: "audi", name: "Audi" },
  { id: "bmw", name: "BMW" },
  { id: "mercedes", name: "Mercedes" },
  { id: "opel", name: "Opel" },
];

// Models per brand
const MOCK_MODELS = {
  VW: [
    { id: "golf-7", name: "Golf 7" },
    { id: "golf-8", name: "Golf 8" },
    { id: "passat-b8", name: "Passat B8" },
    { id: "polo", name: "Polo" },
  ],
  // ... more brands
};
```

## Configuration

Set the backend API URL via environment variable:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If not set, defaults to `http://localhost:4000/api`.

## Error Handling

All API functions include try-catch error handling and will:
1. Attempt to call the backend API
2. Fall back to mock data if API fails
3. Log warnings to console for debugging

## Usage Example

```typescript
import { getBrands, getModelsByBrand } from "@/lib/api/vehicles";

// Fetch brands
const brands = await getBrands();

// Fetch models for a specific brand
const models = await getModelsByBrand("VW");
```
