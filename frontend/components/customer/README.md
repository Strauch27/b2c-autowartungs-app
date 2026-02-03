# Customer Components

This directory contains React components specific to the customer booking flow.

## VehicleSelectionForm

The main vehicle selection form component for Step 1 of the booking process.

### Features

- **Brand Selection with Autocomplete**
  - Search/filter functionality
  - Dropdown selection
  - Loading states

- **Model Selection**
  - Dependent on brand selection
  - Automatically loads models when brand changes
  - Disabled until brand is selected

- **Year Selection**
  - Dropdown from 1994 to current year
  - Descending order (newest first)

- **Mileage Input**
  - Number input field
  - Range: 0 - 500,000 km
  - Visual indicator (km suffix)

- **Validation**
  - Real-time validation with Zod
  - Field-level error messages in German
  - Form-level validation state
  - Parent component notification via callback

- **Plausibility Warnings**
  - Non-blocking warnings for unrealistic values
  - Examples:
    - 2023 car with 200,000 km
    - 2010 car with only 20,000 km
    - Average > 50,000 km/year

### Props

```typescript
interface VehicleSelectionFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}
```

- `onSubmit` - Called when form is submitted with valid data
- `onValidationChange` - Optional callback for validation state changes

### Usage

```tsx
import { VehicleSelectionForm } from "@/components/customer/VehicleSelectionForm";
import { VehicleFormData } from "@/lib/validations/vehicle-schema";

function BookingPage() {
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = (data: VehicleFormData) => {
    console.log("Vehicle data:", data);
    // Navigate to next step or save to context
  };

  return (
    <VehicleSelectionForm
      onSubmit={handleSubmit}
      onValidationChange={setIsValid}
    />
  );
}
```

### Data Structure

The form outputs the following data structure:

```typescript
interface VehicleFormData {
  brand: string;      // e.g., "VW"
  model: string;      // e.g., "Golf 7"
  year: number;       // e.g., 2016
  mileage: number;    // e.g., 75000
}
```

### Validation Rules

- **Brand**: Required string
- **Model**: Required string (dependent on brand)
- **Year**: Required number, 1994 - current year
- **Mileage**: Required number, 0 - 500,000

### Error Messages (German)

- Brand: "Bitte wählen Sie eine Marke aus"
- Model: "Bitte wählen Sie ein Modell aus"
- Year: "Bitte wählen Sie ein Baujahr aus"
- Mileage: "Bitte geben Sie den Kilometerstand ein"

### Styling

The component uses shadcn/ui components:
- `Select` for dropdowns
- `Input` for number input
- `Label` for field labels
- `Alert` for warnings
- `Button` (not visible, used for form submission)

### Mobile Responsive

The form is fully responsive and mobile-first:
- Full width on mobile
- Proper touch targets
- Accessible form elements
- Clear visual hierarchy

### Accessibility

- Semantic HTML
- Proper label associations
- ARIA attributes via Radix UI
- Keyboard navigation support
- Screen reader friendly
- Clear error messages

---

## PriceDisplay (US-004)

Main component for displaying the guaranteed fixed price with full transparency.

### Features

- Large, prominent price display (e.g., "249,00 €")
- "Garantierter Festpreis" badge
- "Inkl. Hol- und Bringservice" subtitle
- Info icon with tooltip explaining the approval process
- Expandable price breakdown showing:
  - Base price
  - Age surcharge (if applicable)
  - Mileage surcharge (if applicable)
  - Total price
- Animated price transition when values change
- Loading state during price calculation
- Error handling for unavailable prices

### Props

```typescript
interface PriceDisplayProps {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  serviceType: ServiceType;
}
```

### Usage

```tsx
<PriceDisplay
  brand="VW"
  model="Golf"
  year={2015}
  mileage={60000}
  serviceType={ServiceType.INSPECTION}
/>
```

### API Integration

Automatically fetches price from: `GET /api/services/{serviceType}/price?brand=X&model=Y&year=Z&mileage=W`

---

## BookingSummary (US-004)

Summary component showing complete booking overview before confirmation.

### Features

- Vehicle information (brand, model, year)
- Mileage with German formatting
- Selected service type
- Detailed price breakdown
- Total price prominently displayed
- "Jetzt buchen" CTA button
- Loading state during booking

### Props

```typescript
interface BookingSummaryProps {
  vehicle: VehicleData;
  serviceType: ServiceType;
  serviceName: string;
  priceBreakdown: PriceBreakdown;
  onConfirm: () => void;
  isLoading?: boolean;
}
```

### Usage

```tsx
<BookingSummary
  vehicle={{ brand: 'VW', model: 'Golf', year: 2015, mileage: 60000 }}
  serviceType={ServiceType.INSPECTION}
  serviceName="Inspektion/Wartung"
  priceBreakdown={{
    basePrice: 21900,
    ageSurcharge: 3000,
    total: 24900,
  }}
  onConfirm={handleBooking}
  isLoading={isBooking}
/>
```

---

## ServiceCard (US-004)

Individual service card for the service selection grid.

### Features

- Service icon with contextual styling
- Service name and description
- Dynamic price based on selected vehicle
- "Hauptprodukt" badge for featured services (e.g., Inspection)
- Loading state while fetching prices
- Selected state indication
- "Auswählen" button

### Props

```typescript
interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
  price?: number; // in cents
  featured?: boolean;
  loading?: boolean;
  selected?: boolean;
  onSelect: () => void;
}
```

### Usage

```tsx
<ServiceCard
  name="Inspektion/Wartung"
  description="Umfassende Inspektion..."
  icon="wrench"
  price={24900}
  featured={true}
  onSelect={() => handleSelect(ServiceType.INSPECTION)}
/>
```

---

## Supporting Libraries

### lib/utils/currency.ts

Currency formatting utilities for German locale (EUR).

**Functions:**
- `formatEuro(cents: number): string` - Format cents to EUR (e.g., 24900 → "249,00 €")
- `formatCents(euro: number): number` - Convert EUR to cents (e.g., 249.00 → 24900)
- `formatNumber(value: number): string` - German number format (e.g., 90000 → "90.000")

### lib/api/pricing.ts

API integration for price calculation and service data.

**Functions:**
- `calculatePrice(vehicle, serviceType)` - Calculate price for specific service
- `getAvailableServices()` - Get list of all available services
- `calculateMultiplePrices(vehicle, serviceTypes[])` - Batch calculate prices

**Example:**
```typescript
const price = await calculatePrice(
  { brand: 'VW', model: 'Golf', year: 2015, mileage: 60000 },
  ServiceType.INSPECTION
);
// Returns: PriceResponse with breakdown
```

### lib/types/service.ts

TypeScript type definitions for services and pricing.

**Key Types:**
- `ServiceType` - Enum of all service types
- `VehicleData` - Vehicle information structure
- `PriceBreakdown` - Price components (base, surcharges, total)
- `PriceResponse` - API response structure

### lib/constants/services.ts

Service metadata and configuration.

**Exports:**
- `AVAILABLE_SERVICES` - Array of all available services with metadata
- `getServiceInfo(serviceType)` - Get service details by type

---

## Demo Page

Visit `/booking/service/demo` to see all price display components in action with documentation and examples.

---

## Future Components

Additional customer components to be added:

- `AppointmentBookingForm` (US-003)
- `PaymentForm` (US-011)
- `CustomerDashboard`
