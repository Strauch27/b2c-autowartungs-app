# Vehicle Selection Form Implementation (US-001)

This document describes the complete implementation of the vehicle selection form for the B2C automotive service booking application.

## Overview

The vehicle selection form is Step 1 of the booking flow, allowing customers to input their vehicle details to receive accurate service pricing.

## Files Created

### 1. UI Components (`components/ui/`)

- **button.tsx** - Reusable button component with variants (default, outline, ghost, etc.)
- **input.tsx** - Styled input field component
- **label.tsx** - Form label component
- **select.tsx** - Dropdown select component with Radix UI
- **card.tsx** - Card container for content sections
- **alert.tsx** - Alert component for warnings and messages

### 2. Form Component (`components/customer/`)

- **VehicleSelectionForm.tsx** - Main vehicle selection form with:
  - Brand selection with search/autocomplete
  - Model selection (dependent on brand)
  - Year dropdown (1994 - 2026)
  - Mileage input with validation
  - Real-time validation
  - Plausibility warnings
  - Loading states

### 3. Validation (`lib/validations/`)

- **vehicle-schema.ts** - Zod validation schema with:
  - Brand validation (required string)
  - Model validation (required string)
  - Year validation (1994 - current year)
  - Mileage validation (0 - 500,000 km)
  - Plausibility checking for unrealistic values

### 4. API Integration (`lib/api/`)

- **vehicles.ts** - API functions:
  - `getBrands()` - Fetch available brands
  - `getModelsByBrand(brand)` - Fetch models for selected brand
  - `saveVehicle(data)` - Save vehicle data
  - `searchBrands(query)` - Autocomplete search
  - Mock data for development

### 5. Pages (`app/(customer)/`)

- **booking/page.tsx** - Booking flow page with:
  - Step indicator (1 of 3)
  - VehicleSelectionForm integration
  - Continue button (disabled until valid)
  - Information boxes
  - Mobile-responsive layout

### 6. Context (`lib/contexts/`)

- **BookingContext.tsx** - React context for managing booking state across steps

## Features Implemented

### Required Fields (All Mandatory)
- **Brand** - Dropdown with autocomplete/search functionality
- **Model** - Dropdown that updates based on brand selection
- **Year** - Dropdown from 1994 to current year
- **Mileage** - Number input with 0-500,000 km validation

### Form Validation
- Real-time validation with Zod
- German error messages
- Field-level error display
- Form-level validation state

### Plausibility Checks
- Warns about unrealistic mileage for new cars (e.g., 2023 car with 200k km)
- Warns about very low mileage for old cars
- Checks average km/year for plausibility

### UX Features
- Brand autocomplete/search
- Model dropdown updates when brand changes
- Loading states during API calls
- Disabled states for dependent fields
- Clear validation feedback
- Mobile-responsive design
- Step indicator showing progress
- Information box explaining why data is needed

### Styling
- shadcn/ui components for consistent design
- Tailwind CSS for styling
- Mobile-first responsive design
- German labels and placeholders
- Accessible form elements

## Usage

### Running the Development Server

```bash
cd "99 Code/frontend"
npm install
npm run dev
```

The booking page will be available at: `http://localhost:3000/booking`

### Mock Data

The implementation includes mock data for development that matches the backend seed data:

**Brands:**
- VW
- Audi
- BMW
- Mercedes
- Opel

**Models (VW):**
- Golf 7
- Golf 8
- Passat B8
- Polo

**Models (BMW):**
- 3er F30
- 3er G20

**Models (Audi):**
- A3 8V
- A4 B9

**Models (Mercedes):**
- C-Klasse W205

**Models (Opel):**
- Astra K

### API Integration

The form is designed to work with the following backend endpoints:

- `GET /api/vehicles/brands` - Returns list of available brands
- `GET /api/vehicles/models?brand=X` - Returns models for specified brand
- `POST /api/vehicles` - Saves vehicle data

The implementation includes fallback to mock data if the API is not available.

### Validation Rules

**Brand:**
- Required field
- Must be selected from dropdown

**Model:**
- Required field
- Must be selected from dropdown
- Only available after brand is selected

**Year:**
- Required field
- Minimum: 1994
- Maximum: Current year (2026)

**Mileage:**
- Required field
- Minimum: 0 km
- Maximum: 500,000 km
- Validates as integer

### Plausibility Warnings

The form shows warnings (not errors) for:
- Cars ≤ 3 years old with > 150,000 km
- Cars ≥ 10 years old with < 50,000 km
- Average km/year > 50,000

These are warnings only - users can still proceed.

## Next Steps

To complete the booking flow, implement:

1. **Step 2: Service Selection** (US-002)
   - Display available services based on vehicle
   - Show pricing based on brand/model
   - Service recommendations based on mileage

2. **Step 3: Appointment Booking** (US-003)
   - Pickup/return time slot selection
   - Address input
   - Phone number collection

3. **Payment Integration** (US-011)
   - Stripe payment processing
   - Final price confirmation

## Testing

### Manual Testing Checklist

- [ ] Brand dropdown loads correctly
- [ ] Brand search/autocomplete works
- [ ] Model dropdown updates when brand changes
- [ ] Model dropdown is disabled until brand selected
- [ ] Year dropdown shows 1994 to current year
- [ ] Mileage input accepts numbers only
- [ ] Form validation prevents submission with missing fields
- [ ] Error messages display in German
- [ ] Plausibility warnings show for unrealistic values
- [ ] Continue button is disabled until form is valid
- [ ] Form is mobile-responsive
- [ ] All fields are clearly labeled
- [ ] Loading states display during API calls

### Test Cases

**Test 1: Normal Flow**
1. Select "VW" as brand
2. Select "Golf 7" as model
3. Select "2016" as year
4. Enter "75000" as mileage
5. Click "Weiter"
6. Expected: Form submits successfully

**Test 2: Plausibility Warning**
1. Select "VW" as brand
2. Select "Golf 8" as model
3. Select "2023" as year
4. Enter "200000" as mileage
5. Expected: Warning appears about unrealistic mileage

**Test 3: Validation Errors**
1. Leave all fields empty
2. Click "Weiter"
3. Expected: Error messages appear in German

## Technical Notes

- Built with Next.js 16 (App Router)
- TypeScript for type safety
- Zod for runtime validation
- Radix UI primitives for accessibility
- Tailwind CSS v4 for styling
- React 19 for latest features

## File Paths

All files are located in `/Users/stenrauch/Documents/B2C App v2/99 Code/frontend/`:

```
components/
  ui/
    button.tsx
    input.tsx
    label.tsx
    select.tsx
    card.tsx
    alert.tsx
  customer/
    VehicleSelectionForm.tsx

lib/
  validations/
    vehicle-schema.ts
  api/
    vehicles.ts
  contexts/
    BookingContext.tsx

app/
  (customer)/
    booking/
      page.tsx
  globals.css
```
