# Pricing Service Quick Reference

## Calculation Formula

```
Final Price = Base Price × Age Multiplier
```

## Base Price Determination

### Step 1: Find Base Price
1. Look up brand/model/year in PriceMatrix
2. If found → Select price based on mileage interval
3. If NOT found → Use fallback logic

### Step 2: Mileage Intervals (Inspection Only)

| Mileage Range | Interval | Example Price (VW Golf) |
|---------------|----------|------------------------|
| 0 - 39,999 km | 30k | 189 EUR |
| 40,000 - 69,999 km | 60k | 219 EUR |
| 70,000 - 99,999 km | 90k | 289 EUR |
| 100,000+ km | 120k+ | 349 EUR |

**Note:** Other services (oil, brake, TÜV) don't vary by mileage.

### Step 3: Age Multiplier

| Vehicle Age | Multiplier | Surcharge |
|------------|------------|-----------|
| ≤ 10 years | 1.0 | 0% |
| > 10 years | 1.1 | +10% |
| > 15 years | 1.2 | +20% |

**Age Calculation:** Current Year (2026) - Build Year

## Fallback Logic

```
1. EXACT MATCH
   ↓ Not found?
2. BRAND AVERAGE
   ↓ Brand not found?
3. DEFAULT PRICE
```

### Default Prices (Conservative Estimates)

| Service Type | Default Price |
|-------------|---------------|
| Inspection | 250 EUR |
| Oil Service | 180 EUR |
| Brake (Front) | 400 EUR |
| Brake (Rear) | 350 EUR |
| TÜV/HU | 120 EUR |
| Climate Service | 150 EUR |

## Example Calculations

### Example 1: VW Golf (2015, 60k km)
```
1. Base Price Lookup:
   - Brand: VW
   - Model: Golf
   - Year: 2015 (in range 2012-2019) ✓
   - Mileage: 60,000 km → 60k interval
   - Base Price: 219 EUR

2. Age Multiplier:
   - Age: 2026 - 2015 = 11 years
   - Multiplier: 1.1 (>10 years)

3. Final Price:
   - 219 EUR × 1.1 = 240.9 EUR
   - Rounded: 241 EUR
```

### Example 2: Mercedes S-Class (2018, 90k km)
```
1. Base Price Lookup:
   - Brand: Mercedes
   - Model: S-Class
   - Year: 2018 (in range 2013-2020) ✓
   - Mileage: 90,000 km → 90k interval
   - Base Price: 499 EUR

2. Age Multiplier:
   - Age: 2026 - 2018 = 8 years
   - Multiplier: 1.0 (≤10 years)

3. Final Price:
   - 499 EUR × 1.0 = 499 EUR
```

### Example 3: Old VW Golf (2008, 120k km)
```
1. Base Price Lookup:
   - Brand: VW
   - Model: Golf
   - Year: 2008 (NOT in range 2012-2019)
   - Fallback: Use earlier Golf model or brand average
   - Assume 120k+ price: 349 EUR

2. Age Multiplier:
   - Age: 2026 - 2008 = 18 years
   - Multiplier: 1.2 (>15 years)

3. Final Price:
   - 349 EUR × 1.2 = 418.8 EUR
   - Rounded: 419 EUR
```

### Example 4: Unknown Model (Fallback)
```
1. Base Price Lookup:
   - Brand: VW
   - Model: "Unknown Model"
   - NOT FOUND in PriceMatrix
   - Fallback: Average of all VW models
   - Assume 60k interval average: 219 EUR

2. Age Multiplier:
   - Year: 2018
   - Age: 8 years
   - Multiplier: 1.0

3. Final Price:
   - 219 EUR × 1.0 = 219 EUR
   - Price Source: 'fallback_brand'
```

## Service Types

| Code | Description | Mileage-Dependent? |
|------|-------------|--------------------|
| `inspection` | Inspection/Maintenance | Yes ✓ |
| `oilService` | Oil Service | No |
| `brakeServiceFront` | Brake Service (Front) | No |
| `brakeServiceRear` | Brake Service (Rear) | No |
| `tuv` | TÜV/HU | No |
| `climateService` | Climate Service | No |

## Validation Rules

| Field | Validation |
|-------|------------|
| Brand | Required, non-empty string |
| Model | Required, non-empty string |
| Year | 1994 - 2026 (current year) |
| Mileage | 0 - 500,000 km |
| Service Type | Must be valid ServiceType enum |

## Common Use Cases

### 1. Vehicle Selection Form
```typescript
// User selects: VW, Golf, 2015, 60000 km
const result = await pricingService.calculatePrice({
  brand: 'VW',
  model: 'Golf',
  year: 2015,
  mileage: 60000,
  serviceType: 'inspection'
});

// Display: "Inspection: 241 EUR (60k service)"
```

### 2. Service Type Comparison
```typescript
// Show all services with prices
const services = ['inspection', 'oilService', 'brakeServiceFront'];
for (const service of services) {
  const result = await pricingService.calculatePrice({
    brand: 'VW',
    model: 'Golf',
    year: 2015,
    mileage: 60000,
    serviceType: service
  });
  console.log(`${service}: ${result.finalPrice} EUR`);
}
```

### 3. Booking Creation
```typescript
// Calculate price before creating booking
const priceResult = await pricingService.calculatePrice(vehicleData);

const booking = await prisma.booking.create({
  data: {
    customerId: '...',
    vehicleId: '...',
    serviceType: 'inspection',
    price: priceResult.finalPrice,  // Use calculated price
    mileageAtBooking: 60000,
    // ... other fields
  }
});
```

## API Response Example

```json
{
  "success": true,
  "data": {
    "basePrice": 219,
    "ageMultiplier": 1.1,
    "finalPrice": 241,
    "priceSource": "exact",
    "mileageInterval": "60k"
  }
}
```

## Error Responses

### Invalid Year
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Year must be between 1994 and 2026"
  }
}
```

### Invalid Mileage
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mileage must be between 0 and 500,000 km"
  }
}
```

## Performance Notes

- **Typical Response Time:** < 10ms
- **Database Queries:** 1-2 queries per calculation
- **Caching Opportunity:** PriceMatrix data can be cached
- **Concurrency:** Stateless, fully thread-safe

## Testing

### Run Tests
```bash
npm test src/services/__tests__/pricing.service.test.ts
```

### Coverage Areas
- ✓ Exact price calculations
- ✓ Mileage interval boundaries
- ✓ Age multiplier logic
- ✓ Fallback scenarios
- ✓ Input validation
- ✓ Edge cases

## File Locations

| File | Path |
|------|------|
| Service | `/src/services/pricing.service.ts` |
| Repository | `/src/repositories/price-matrix.repository.ts` |
| Types | `/src/types/pricing.types.ts` |
| Tests | `/src/services/__tests__/pricing.service.test.ts` |
| Controller Example | `/src/controllers/pricing.controller.example.ts` |
| Full Documentation | `/src/services/PRICING_SERVICE_README.md` |

## Key Points to Remember

1. **NO VEHICLE CLASSES** - Pricing is brand/model specific only
2. **Mileage matters** - Inspection prices vary by interval
3. **Age surcharge** - Automatic for older vehicles
4. **Always a price** - Fallback logic ensures price is always calculated
5. **Fixed price guarantee** - Customer sees exact final price before booking

## Support

For detailed documentation, see:
- `/src/services/PRICING_SERVICE_README.md`
- `/99 Code/backend/PRICING_IMPLEMENTATION_SUMMARY.md`
- US-004 in `/01 Requirements/02_MVP_User_Stories.md`
