# US-004 Component Structure

## File Tree

```
99 Code/frontend/
│
├── components/
│   ├── customer/
│   │   ├── PriceDisplay.tsx          ← Main price display with breakdown
│   │   ├── BookingSummary.tsx        ← Final booking summary
│   │   ├── ServiceCard.tsx           ← Service selection card
│   │   ├── index.ts                  ← Public API exports
│   │   └── README.md                 ← Component documentation
│   │
│   └── ui/
│       ├── badge.tsx                 ← NEW: Badge component
│       ├── tooltip.tsx               ← NEW: Tooltip component
│       ├── card.tsx                  ← Existing
│       ├── button.tsx                ← Existing
│       ├── input.tsx                 ← Existing
│       ├── label.tsx                 ← Existing
│       └── select.tsx                ← Existing
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 ← Existing API client
│   │   └── pricing.ts                ← NEW: Pricing API functions
│   │
│   ├── types/
│   │   └── service.ts                ← NEW: Service type definitions
│   │
│   ├── constants/
│   │   └── services.ts               ← NEW: Service metadata
│   │
│   └── utils/
│       ├── currency.ts               ← NEW: Currency formatting
│       └── utils.ts                  ← Existing (cn helper)
│
├── app/
│   └── (customer)/
│       └── booking/
│           └── service/
│               ├── page.tsx          ← NEW: Service selection page
│               └── demo/
│                   └── page.tsx      ← NEW: Demo/showcase page
│
└── US-004-IMPLEMENTATION.md          ← Implementation summary
    COMPONENT-STRUCTURE.md             ← This file
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Selection Page                    │
│                  /booking/service/page.tsx                   │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ServiceCard │  │ ServiceCard │  │ ServiceCard │  ...    │
│  │             │  │             │  │             │         │
│  │  Inspection │  │ Oil Service │  │   Brakes    │         │
│  │  249,00 €   │  │  149,00 €   │  │  189,00 €   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │ User selects service
                                ▼
                ┌───────────────────────────────┐
                │      Next Step / Summary      │
                │                               │
                │  ┌─────────────────────────┐  │
                │  │   PriceDisplay          │  │
                │  │                         │  │
                │  │   249,00 €              │  │
                │  │   [Festpreis Badge]     │  │
                │  │   [Info ⓘ Tooltip]      │  │
                │  │   [▼ Breakdown]         │  │
                │  └─────────────────────────┘  │
                │                               │
                │  ┌─────────────────────────┐  │
                │  │   BookingSummary        │  │
                │  │                         │  │
                │  │   Vehicle: VW Golf      │  │
                │  │   Service: Inspection   │  │
                │  │   Price: 249,00 €       │  │
                │  │                         │  │
                │  │   [Jetzt buchen]        │  │
                │  └─────────────────────────┘  │
                └───────────────────────────────┘
```

---

## Data Flow

```
┌──────────────┐
│ User selects │
│   vehicle    │
│ (US-001)     │
└──────┬───────┘
       │
       │ brand, model, year, mileage
       ▼
┌────────────────────────────────────┐
│  Service Selection Page            │
│  /booking/service?brand=VW&...     │
│                                    │
│  calculateMultiplePrices()         │
│  ├─ GET /api/.../inspection/price  │
│  ├─ GET /api/.../oil_service/price │
│  └─ GET /api/.../brake_service/... │
└──────┬─────────────────────────────┘
       │
       │ prices for all services
       ▼
┌────────────────────────────────────┐
│  Display ServiceCards with prices  │
│                                    │
│  User clicks "Auswählen"           │
└──────┬─────────────────────────────┘
       │
       │ serviceType selected
       ▼
┌────────────────────────────────────┐
│  Navigate to appointment booking   │
│  (US-003)                          │
│                                    │
│  PriceDisplay shows final price    │
│  BookingSummary shows all details  │
└────────────────────────────────────┘
```

---

## API Endpoints

### 1. Calculate Price for Service
```
GET /api/services/{serviceType}/price

Query Parameters:
  - brand: string
  - model: string
  - year: number
  - mileage: number

Response: {
  serviceType: "inspection",
  vehicle: { brand, model, year, mileage },
  breakdown: {
    basePrice: 21900,      // cents
    ageSurcharge: 3000,    // cents (optional)
    mileageSurcharge: 0,   // cents (optional)
    total: 24900           // cents
  },
  message: "..." // optional
}
```

### 2. Get Available Services
```
GET /api/services

Response: [
  "inspection",
  "oil_service",
  "brake_service",
  "tuv",
  "climate_service"
]
```

---

## Type Definitions

### ServiceType (Enum)
```typescript
enum ServiceType {
  INSPECTION = 'inspection',
  OIL_SERVICE = 'oil_service',
  BRAKE_SERVICE = 'brake_service',
  TUV = 'tuv',
  CLIMATE_SERVICE = 'climate_service',
  DETAILING = 'detailing',
}
```

### VehicleData
```typescript
interface VehicleData {
  brand: string;      // "VW"
  model: string;      // "Golf"
  year: number;       // 2015
  mileage: number;    // 60000
}
```

### PriceBreakdown
```typescript
interface PriceBreakdown {
  basePrice: number;        // in cents
  ageSurcharge?: number;    // in cents
  mileageSurcharge?: number; // in cents
  total: number;            // in cents
}
```

### PriceResponse
```typescript
interface PriceResponse {
  serviceType: ServiceType;
  vehicle: VehicleData;
  breakdown: PriceBreakdown;
  message?: string;
}
```

---

## Utility Functions

### Currency Formatting (lib/utils/currency.ts)
```typescript
formatEuro(24900)    // → "249,00 €"
formatCents(249.00)  // → 24900
formatNumber(90000)  // → "90.000"
```

### API Integration (lib/api/pricing.ts)
```typescript
// Single price calculation
const price = await calculatePrice(vehicle, ServiceType.INSPECTION);

// Multiple prices at once
const prices = await calculateMultiplePrices(vehicle, [
  ServiceType.INSPECTION,
  ServiceType.OIL_SERVICE,
  ServiceType.BRAKE_SERVICE,
]);

// Get available services
const services = await getAvailableServices();
```

---

## Responsive Breakpoints

```
Mobile:     < 768px   (1 column)
Tablet:     768-1024px (2 columns)
Desktop:    > 1024px   (3 columns)
```

### Service Grid Layout
- **Mobile:** Single column, stacked cards
- **Tablet:** 2 columns side-by-side
- **Desktop:** 3 columns grid

### Price Display
- **Mobile:** Full width, reduced font sizes
- **Desktop:** Max width constrained, larger fonts

---

## Styling System

### Colors (Tailwind)
- **Primary:** Main brand color (buttons, prices)
- **Success:** Green (Festpreis badge)
- **Muted:** Gray (descriptions, secondary text)
- **Amber:** Warning/surcharge indicators
- **Destructive:** Red (errors)

### Typography
- **Price:** 4xl font, bold, primary color
- **Headings:** 2xl/3xl font, semibold
- **Body:** sm/base font, regular
- **Labels:** sm font, muted

### Spacing
- **Cards:** p-6 (24px padding)
- **Grid gaps:** gap-6 (24px between cards)
- **Sections:** mb-8 (32px margins)

---

## Testing Routes

### Development
```bash
npm run dev
```

### Routes to Test
1. **Demo Page:**
   - http://localhost:3000/booking/service/demo
   - Shows all components with examples

2. **Service Selection:**
   - http://localhost:3000/booking/service?brand=VW&model=Golf&year=2015&mileage=60000
   - Real service selection flow

3. **Individual Components:**
   - Import and use in any page/component
   - Fully standalone, reusable

---

## Dependencies

### New Dependencies Added
```json
{
  "@radix-ui/react-tooltip": "^1.2.4"
}
```

### Existing Dependencies Used
- @radix-ui/react-slot
- @radix-ui/react-dialog
- class-variance-authority
- lucide-react
- tailwind-merge
- clsx

---

## Integration Checklist

- [x] Components created in correct directory
- [x] TypeScript types defined
- [x] API integration prepared
- [x] Currency formatting (German)
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Accessibility (ARIA, keyboard nav)
- [x] Documentation complete
- [x] Demo page created
- [ ] Backend API implementation
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Analytics tracking

---

## Next Steps

1. **Backend Integration:**
   - Implement price calculation API
   - Test with real data
   - Handle edge cases

2. **Complete Booking Flow:**
   - Connect to US-001 (vehicle selection)
   - Connect to US-003 (appointment booking)
   - Add state management (Context/Redux)

3. **Testing:**
   - Unit tests for components
   - Integration tests for flow
   - E2E tests with Cypress/Playwright

4. **Optimization:**
   - Add price caching
   - Implement skeleton loaders
   - Optimize bundle size

---

**Status:** ✅ Ready for backend integration and testing
