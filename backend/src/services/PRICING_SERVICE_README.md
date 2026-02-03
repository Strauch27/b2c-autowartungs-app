# Pricing Service Documentation

## Overview

The Pricing Service implements the price calculation logic for the B2C Autowartungs-App based on **US-004** (Festpreis-Anzeige nach Marke und Modell) from the MVP User Stories.

## Key Features

### 1. Brand/Model-Based Pricing (NOT Vehicle Class!)

The pricing service calculates prices based on:
- **Brand** (e.g., VW, Mercedes, BMW)
- **Model** (e.g., Golf, S-Class, 3er)
- **Year** (to find matching price matrix entry)

**Important:** There are NO vehicle classes (Small/Medium/Large/SUV). All pricing is model-specific.

### 2. Mileage-Based Pricing

Inspection prices vary based on mileage intervals:
- **30k km** (0 - 39,999 km): Small inspection
- **60k km** (40,000 - 69,999 km): Medium inspection
- **90k km** (70,000 - 99,999 km): Large inspection
- **120k+ km** (100,000+ km): Extended inspection

Other services (oil service, brake service, etc.) have fixed prices regardless of mileage.

### 3. Age Multiplier

Vehicles receive surcharges based on age:
- **≤ 10 years**: No surcharge (multiplier: 1.0)
- **> 10 years**: +10% surcharge (multiplier: 1.1)
- **> 15 years**: +20% surcharge (multiplier: 1.2)

**Rationale:** Older vehicles typically require more attention and potentially more wear parts.

### 4. Fallback Logic

If a specific brand/model combination is not found in the PriceMatrix:

1. **Brand Fallback**: Calculate average price for all models of that brand
2. **Default Fallback**: Use conservative default prices if brand is not found

## Usage Examples

### Example 1: VW Golf (60k km)

```typescript
const pricingService = new PricingService(priceMatrixRepository);

const result = await pricingService.calculatePrice({
  brand: 'VW',
  model: 'Golf',
  year: 2015,
  mileage: 60000,
  serviceType: 'inspection',
});

// Result:
// {
//   basePrice: 219,
//   ageMultiplier: 1.1,  // Vehicle is 11 years old
//   finalPrice: 241,     // 219 * 1.1 = 240.9 → rounded to 241
//   priceSource: 'exact',
//   mileageInterval: '60k'
// }
```

### Example 2: Mercedes S-Class (90k km)

```typescript
const result = await pricingService.calculatePrice({
  brand: 'Mercedes',
  model: 'S-Class',
  year: 2018,
  mileage: 90000,
  serviceType: 'inspection',
});

// Result:
// {
//   basePrice: 499,
//   ageMultiplier: 1.0,  // Vehicle is 8 years old, no surcharge
//   finalPrice: 499,
//   priceSource: 'exact',
//   mileageInterval: '90k'
// }
```

### Example 3: Old Vehicle (15+ years)

```typescript
const result = await pricingService.calculatePrice({
  brand: 'VW',
  model: 'Golf',
  year: 2008,  // 18 years old
  mileage: 120000,
  serviceType: 'inspection',
});

// Result:
// {
//   basePrice: 349,
//   ageMultiplier: 1.2,  // +20% surcharge for vehicles > 15 years
//   finalPrice: 419,     // 349 * 1.2 = 418.8 → rounded to 419
//   priceSource: 'exact',
//   mileageInterval: '120k+'
// }
```

### Example 4: Unknown Model (Fallback)

```typescript
const result = await pricingService.calculatePrice({
  brand: 'VW',
  model: 'Unknown Model',
  year: 2018,
  mileage: 60000,
  serviceType: 'inspection',
});

// Result:
// {
//   basePrice: 219,  // Average of all VW models for 60k inspection
//   ageMultiplier: 1.0,
//   finalPrice: 219,
//   priceSource: 'fallback_brand',
//   mileageInterval: '60k'
// }
```

## Service Types

The following service types are supported:

| Service Type | Description | Mileage-Dependent? |
|--------------|-------------|--------------------|
| `inspection` | Inspection/Maintenance | Yes (30k/60k/90k/120k+) |
| `oilService` | Oil Service | No |
| `brakeServiceFront` | Brake Service (Front) | No |
| `brakeServiceRear` | Brake Service (Rear) | No |
| `tuv` | TÜV/HU | No |
| `climateService` | Climate Service | No |

## API Methods

### `calculatePrice(input: PriceCalculationInput): Promise<PriceCalculationResult>`

Main method to calculate price for a service.

**Input:**
```typescript
interface PriceCalculationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  serviceType: ServiceType;
}
```

**Output:**
```typescript
interface PriceCalculationResult {
  basePrice: number;           // Base price from PriceMatrix
  ageMultiplier: number;        // Age surcharge multiplier
  finalPrice: number;           // Final calculated price
  priceSource: 'exact' | 'fallback_brand' | 'fallback_default';
  mileageInterval: string;      // '30k', '60k', '90k', or '120k+'
}
```

### `getPriceByMileage(priceEntry: PriceMatrix, mileage: number, serviceType: ServiceType): number`

Get the appropriate price from a PriceMatrix entry based on mileage.

### `getAgeMultiplier(year: number): number`

Calculate age multiplier based on vehicle year.

Returns:
- `1.0` for vehicles ≤ 10 years
- `1.1` for vehicles > 10 years
- `1.2` for vehicles > 15 years

### `getFallbackPrice(brand: string, serviceType: ServiceType): Promise<number>`

Get fallback price when exact model is not found.

### `validateInput(input: PriceCalculationInput): void`

Validate input parameters. Throws error if validation fails.

Validation rules:
- Brand: Required, non-empty string
- Model: Required, non-empty string
- Year: Between 1994 and current year
- Mileage: Between 0 and 500,000 km

### `getAvailableBrands(): Promise<string[]>`

Get list of all available brands in the price matrix.

### `getAvailableModels(brand: string): Promise<string[]>`

Get list of available models for a specific brand.

## Testing

Comprehensive unit tests are provided in `pricing.service.test.ts`:

Run tests:
```bash
npm test pricing.service.test.ts
```

Test coverage includes:
- ✅ Exact price calculation for known models
- ✅ Mileage interval selection
- ✅ Age multiplier calculation
- ✅ Fallback logic (brand and default)
- ✅ Input validation
- ✅ Edge cases (boundary values)
- ✅ Different service types

## Integration with PriceMatrix

The PriceMatrix table stores brand/model-specific prices:

```sql
CREATE TABLE "PriceMatrix" (
  id UUID PRIMARY KEY,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  yearFrom INT NOT NULL,
  yearTo INT NOT NULL,
  inspection30k DECIMAL(10,2),
  inspection60k DECIMAL(10,2),
  inspection90k DECIMAL(10,2),
  inspection120k DECIMAL(10,2),
  oilService DECIMAL(10,2),
  brakeServiceFront DECIMAL(10,2),
  brakeServiceRear DECIMAL(10,2),
  tuv DECIMAL(10,2),
  climateService DECIMAL(10,2)
);
```

**Example data:**
```sql
INSERT INTO "PriceMatrix"
  (brand, model, yearFrom, yearTo, inspection30k, inspection60k, inspection90k, inspection120k)
VALUES
  ('VW', 'Golf', 2012, 2019, 189, 219, 289, 349),
  ('Mercedes', 'S-Class', 2013, 2020, 349, 399, 499, 599),
  ('BMW', '3er', 2015, 2022, 269, 309, 379, 449);
```

## Business Rules Summary

1. **No Vehicle Classes**: Pricing is based on brand/model, NOT on vehicle class categories
2. **Mileage Matters**: Inspection prices increase with higher mileage intervals
3. **Age Surcharge**: Older vehicles get automatic surcharge
4. **Guaranteed Fixed Price**: Customer sees final price before booking
5. **Fallback Strategy**: System always provides a price, even for unknown models

## Error Handling

The service validates all inputs and throws descriptive errors:

```typescript
try {
  const result = await pricingService.calculatePrice(input);
} catch (error) {
  // Possible errors:
  // - "Brand is required"
  // - "Model is required"
  // - "Year must be between 1994 and 2026"
  // - "Mileage must be between 0 and 500,000 km"
}
```

## Future Enhancements (Post-MVP)

1. **Dynamic Pricing**: Adjust prices based on demand/availability
2. **Seasonal Pricing**: Different prices for winter/summer services
3. **Loyalty Discounts**: Returning customer discounts
4. **Package Deals**: Combined service discounts
5. **Premium Models**: Special pricing for high-performance variants (AMG, M-Sport)

## Related Files

- `src/services/pricing.service.ts` - Main service implementation
- `src/repositories/price-matrix.repository.ts` - Database access layer
- `src/services/__tests__/pricing.service.test.ts` - Unit tests
- `02 Planning/04_Database_Schema.md` - PriceMatrix schema documentation
- `01 Requirements/02_MVP_User_Stories.md` - US-004 specification

## Contact

For questions or issues, please refer to the Technical Architecture documentation or contact the development team.
