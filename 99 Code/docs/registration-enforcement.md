# Registration Enforcement Strategy
## Blocking Guest Checkout & Enforcing User Registration

**Version:** 1.0
**Date:** February 3, 2026
**Priority:** HIGH (Security & User Management)

---

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Implementation Strategy](#implementation-strategy)
4. [Frontend Changes](#frontend-changes)
5. [Backend Changes](#backend-changes)
6. [User Experience Flow](#user-experience-flow)
7. [Testing](#testing)

---

## Overview

### Objective
Enforce user registration before booking creation. Guest checkout is NOT supported - all customers must have an account.

### Business Rationale
1. **Customer Relationship Management:** Track customer history and preferences
2. **Payment Management:** Link bookings to customer accounts for refunds/disputes
3. **Extension Approvals:** Customer must be authenticated to approve extensions
4. **Service History:** Maintain complete service records per customer
5. **Compliance:** GDPR requires user consent and data management

### Current State
According to `bookings.controller.ts` (lines 177-257), the system currently supports guest checkout:
- Checks if `req.user` exists (authenticated)
- If not authenticated but `customer` data provided, creates guest account with temp password
- This needs to be REMOVED

---

## Current State Analysis

### Backend: Guest Checkout Logic (TO BE REMOVED)

**File:** `backend/src/controllers/bookings.controller.ts`

```typescript
// Lines 177-257 - CURRENT GUEST CHECKOUT IMPLEMENTATION
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let customerId: string;
    let isNewUser = false;

    // Check if this is the new DTO format or legacy format
    if (req.body.vehicle && req.body.services) {
      // New DTO format from frontend
      const validatedDto = createBookingDtoSchema.parse(req.body);

      // Determine customer ID
      if (req.user) {
        // Authenticated user
        customerId = req.user.userId;
      } else if (validatedDto.customer) {
        // ⚠️ GUEST CHECKOUT - TO BE REMOVED
        const { email, firstName, lastName, phone } = validatedDto.customer;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          customerId = existingUser.id;
        } else {
          // Create new user account with temp password
          const crypto = await import('crypto');
          const bcrypt = await import('bcrypt');
          const temporaryPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
          const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

          const newUser = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              phone,
              passwordHash: hashedPassword,
              role: 'CUSTOMER'
            }
          });

          customerId = newUser.id;
          isNewUser = true;
        }
      } else {
        // Neither authenticated nor customer data provided
        throw new ApiError(400, 'Customer information is required for guest checkout');
      }
      // ... rest of booking creation
    }
  }
}
```

### Frontend: No Registration Enforcement (TO BE ADDED)

**Current Flow:**
1. Customer fills booking form (vehicle, services, schedule)
2. Customer enters contact info in Step 4
3. Customer pays
4. Backend creates user account during booking (if not exists)

**Problem:** Customer never explicitly registers, no password choice, no terms acceptance.

---

## Implementation Strategy

### Phase 1: Backend Enforcement
1. Reject all unauthenticated booking creation requests
2. Remove guest account creation logic
3. Add authentication middleware to booking endpoints

### Phase 2: Frontend Redirect
1. Detect unauthenticated users early (Step 1 of booking)
2. Redirect to registration/login page
3. Store booking form data in session
4. Resume booking after authentication

### Phase 3: Registration Flow
1. Add registration page with proper UX
2. Collect: email, password, first name, last name, phone (optional)
3. Accept terms & privacy policy
4. Email verification (optional for MVP, recommended for production)

---

## Frontend Changes

### Change 1: Early Authentication Check

**File:** `frontend/app/[locale]/booking/page.tsx` (or booking flow entry point)

**Add authentication check at the start:**

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BookingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated - redirect to registration
      // Store current path to return after registration
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/de/auth/register?redirect=booking');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect
  }

  // Authenticated - show booking form
  return <BookingForm />;
}
```

---

### Change 2: Registration Page

**File:** `frontend/app/[locale]/auth/register/page.tsx` (NEW FILE)

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  email: z.string().email('Bitte gültige E-Mail eingeben'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Sie müssen die AGB akzeptieren'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registrierung fehlgeschlagen');
      }

      const result = await response.json();

      // Store auth token
      localStorage.setItem('authToken', result.data.token);

      // Redirect to booking or original destination
      const redirect = searchParams.get('redirect');
      const redirectPath = redirect === 'booking'
        ? '/de/booking'
        : sessionStorage.getItem('redirectAfterLogin') || '/de/customer/dashboard';

      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Konto erstellen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Um eine Buchung vorzunehmen, benötigen Sie ein Konto.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-Mail-Adresse *
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Vorname *
            </label>
            <input
              {...register('firstName')}
              id="firstName"
              type="text"
              autoComplete="given-name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Nachname *
            </label>
            <input
              {...register('lastName')}
              id="lastName"
              type="text"
              autoComplete="family-name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefonnummer (Optional)
            </label>
            <input
              {...register('phone')}
              id="phone"
              type="tel"
              autoComplete="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Passwort *
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Passwort bestätigen *
            </label>
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start">
            <input
              {...register('acceptTerms')}
              id="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              Ich akzeptiere die{' '}
              <a href="/de/agb" target="_blank" className="text-blue-600 hover:underline">
                AGB
              </a>{' '}
              und{' '}
              <a href="/de/datenschutz" target="_blank" className="text-blue-600 hover:underline">
                Datenschutzerklärung
              </a>
              . *
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Wird erstellt...' : 'Konto erstellen'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Bereits ein Konto?{' '}
              <a href="/de/auth/login" className="text-blue-600 hover:underline">
                Jetzt anmelden
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Change 3: Login Page

**File:** `frontend/app/[locale]/auth/login/page.tsx`

Similar structure to registration page, but simpler:
- Email + password only
- Link to registration page
- Link to password reset
- Redirect to booking after successful login

---

## Backend Changes

### Change 1: Remove Guest Checkout Logic

**File:** `backend/src/controllers/bookings.controller.ts`

**Replace lines 177-257 with:**

```typescript
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ENFORCE AUTHENTICATION
    if (!req.user) {
      throw new ApiError(401, 'Authentication required. Please register or log in to create a booking.');
    }

    const customerId = req.user.userId;

    // Check if this is the new DTO format or legacy format
    if (req.body.vehicle && req.body.services) {
      // New DTO format from frontend
      const validatedDto = createBookingDtoSchema.parse(req.body);

      // Create booking (user is already authenticated)
      const booking = await bookingsService.createBookingFromDto(customerId, validatedDto);

      // Continue with payment and notifications...
      await handleBookingPaymentAndNotifications(booking, customerId, req, res);
    } else {
      // Legacy format - also requires authentication
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await bookingsService.createBooking({
        ...validatedData,
        customerId: req.user.userId
      });

      await handleBookingPaymentAndNotifications(booking, req.user.userId, req, res);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}
```

---

### Change 2: Update DTO Validation Schema

**File:** `backend/src/controllers/bookings.controller.ts`

**Remove `customer` field from DTO (lines 22-28):**

```typescript
// OLD (REMOVE):
const createBookingDtoSchema = z.object({
  customer: z.object({
    email: z.string().email('Valid email is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required')
  }).optional(), // Optional if user is authenticated
  vehicle: z.object({ ... }),
  // ...
});

// NEW (REPLACE WITH):
const createBookingDtoSchema = z.object({
  // Customer data is taken from authenticated user, not from request body
  vehicle: z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1994).max(new Date().getFullYear() + 1),
    mileage: z.number().int().min(0).max(1000000),
    saveVehicle: z.boolean().optional()
  }),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  pickup: z.object({
    date: z.string().min(1, 'Pickup date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  delivery: z.object({
    date: z.string().min(1, 'Delivery date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)')
  }),
  customerNotes: z.string().optional()
});
```

---

### Change 3: Add Authentication Middleware

**File:** `backend/src/routes/bookings.routes.ts`

**Ensure authentication middleware is applied:**

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  listBookings,
  getBooking,
  createBooking,  // Now requires authentication
  updateBooking,
  cancelBooking,
  getBookingStatus,
  getBookingExtensions,
  approveExtension,
  declineExtension
} from '../controllers/bookings.controller';

const router = Router();

// All booking routes require authentication
router.use(authenticate);  // Apply to all routes below

router.get('/', listBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);  // Authentication enforced in controller + middleware
router.patch('/:id', updateBooking);
router.delete('/:id', cancelBooking);
router.get('/:id/status', getBookingStatus);
router.get('/:id/extensions', getBookingExtensions);
router.post('/:id/extensions/:extensionId/approve', approveExtension);
router.post('/:id/extensions/:extensionId/decline', declineExtension);

export default router;
```

---

### Change 4: Registration Endpoint (if not exists)

**File:** `backend/src/controllers/auth.controller.ts`

**Add registration endpoint:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional()
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        role: 'CUSTOMER'
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ApiError(400, error.errors[0].message));
    } else {
      next(error);
    }
  }
}
```

**Add route:**

```typescript
// backend/src/routes/auth.routes.ts
router.post('/register', register);
```

---

## User Experience Flow

### Complete Registration Flow

```
1. User visits booking page
   ↓
2. System detects: not authenticated
   ↓
3. Redirect to /auth/register?redirect=booking
   ↓
4. User fills registration form:
   - Email
   - Password
   - First name
   - Last name
   - Phone (optional)
   - Accepts terms
   ↓
5. Submit registration
   ↓
6. Backend creates user account
   ↓
7. Backend returns JWT token
   ↓
8. Frontend stores token in localStorage
   ↓
9. Redirect back to /booking
   ↓
10. User fills booking form (now authenticated)
    ↓
11. Create booking (authenticated request)
    ↓
12. Payment & confirmation
```

### Error Scenarios

#### Scenario 1: Email Already Exists
```
User tries to register with existing email
  ↓
Backend returns 409 Conflict
  ↓
Frontend shows error: "User with this email already exists"
  ↓
Show link: "Already have an account? Log in"
```

#### Scenario 2: Weak Password
```
User enters password shorter than 8 characters
  ↓
Frontend validation catches it immediately
  ↓
Show error: "Password must be at least 8 characters"
  ↓
User corrects password
```

#### Scenario 3: User Closes Tab During Registration
```
User fills form halfway, closes tab
  ↓
sessionStorage.getItem('redirectAfterLogin') is lost
  ↓
After re-registration, user goes to /customer/dashboard
  ↓
User clicks "Book Service" to start over
```

---

## Testing

### Manual Testing Checklist

#### Registration Flow
- [ ] Visit `/booking` without authentication → redirects to `/auth/register`
- [ ] Fill registration form with valid data → account created
- [ ] After registration → redirected back to `/booking`
- [ ] Complete booking → success (authenticated)
- [ ] Try registering with same email → error "Email already exists"
- [ ] Try weak password (< 8 chars) → error shown
- [ ] Leave required field empty → validation error
- [ ] Uncheck terms checkbox → error shown

#### Login Flow
- [ ] Existing user visits `/booking` → redirects to `/auth/login`
- [ ] Enter correct credentials → redirected to `/booking`
- [ ] Enter wrong password → error shown
- [ ] Enter non-existent email → error shown

#### API Security
- [ ] Call `POST /api/bookings` without token → 401 Unauthorized
- [ ] Call `POST /api/bookings` with invalid token → 401 Unauthorized
- [ ] Call `POST /api/bookings` with valid token → 200 OK

---

### Automated Tests

**File:** `frontend/e2e/registration-enforcement.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Registration Enforcement', () => {
  test('unauthenticated user is redirected to registration', async ({ page }) => {
    // Clear any existing auth tokens
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access booking page
    await page.goto('/de/booking');

    // Should redirect to registration
    await expect(page).toHaveURL(/\/auth\/register/);
    expect(await page.textContent('h2')).toContain('Konto erstellen');
  });

  test('user can register and proceed to booking', async ({ page }) => {
    // Clear auth
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Go to registration
    await page.goto('/de/auth/register?redirect=booking');

    // Fill registration form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="password"]', 'TestPassword123');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123');
    await page.check('input[name="acceptTerms"]');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to booking page
    await expect(page).toHaveURL(/\/booking/);
    expect(await page.title()).toContain('Buchung');
  });

  test('API rejects unauthenticated booking creation', async ({ page }) => {
    // Clear auth
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to create booking via API
    const response = await page.request.post('/api/bookings', {
      data: {
        vehicle: { brand: 'VW', model: 'Golf', year: 2020, mileage: 50000 },
        services: ['INSPECTION'],
        pickup: {
          date: '2026-02-05',
          timeSlot: '09:00',
          street: 'Test St',
          city: 'Test',
          postalCode: '12345'
        },
        delivery: {
          date: '2026-02-07',
          timeSlot: '17:00'
        }
      }
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Authentication required');
  });
});
```

---

## Document Control

**Version:** 1.0
**Created:** February 3, 2026
**Author:** Agent 1 (Tech Lead)
**Priority:** HIGH
**Status:** READY FOR IMPLEMENTATION

**Related Documents:**
- `prio1-demo-plan.md` - Master implementation plan
- `03 Documentation/E2E_Process_Flow.md` - Complete journey documentation

**Next Steps:**
1. Review with Product Owner
2. Implement frontend registration page (Agent 5)
3. Implement backend authentication enforcement (Agent 2)
4. Update booking controller (Agent 2)
5. E2E testing (QA Team)

---

**END OF DOCUMENT**
