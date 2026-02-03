# E2E Testing Guide
## B2C Autowartungs-App Playwright Tests

**Last Updated:** February 3, 2026

---

## Overview

This directory contains comprehensive end-to-end tests for the B2C Autowartungs-App using Playwright. The tests cover the complete customer journey from registration through booking, payment, service execution, and delivery.

### Test Coverage

- **Total Tests:** 176 test cases
- **Test Duration:** < 10 minutes for full suite
- **Browser Coverage:** Chromium (Desktop + Mobile)
- **Language Coverage:** German (DE) and English (EN)

### Key Test Files

| File | Purpose | Duration | Critical |
|------|---------|----------|----------|
| `00-demo-smoke-test.spec.ts` | Quick validation of demo mode | < 5 min | ✅ Yes |
| `01-complete-booking-journey.spec.ts` | Full customer lifecycle | < 3 min | ✅ Yes |
| `02-booking-flow.spec.ts` | Booking creation variations | < 2 min | Yes |
| `03-customer-portal.spec.ts` | Customer dashboard features | < 2 min | No |
| `04-jockey-portal.spec.ts` | Jockey assignment workflows | < 2 min | No |
| `05-workshop-portal.spec.ts` | Workshop order management | < 2 min | No |
| `06-multi-language.spec.ts` | Internationalization (i18n) | < 2 min | No |
| `07-extension-approval-flow.spec.ts` | Extension approval process | < 2 min | Yes |
| `08-extension-integration.spec.ts` | Extension payment flows | < 2 min | Yes |

---

## Quick Start

### Prerequisites

1. **Services Running:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   # Should run on http://localhost:5001

   # Terminal 2: Frontend
   cd frontend && npm run dev
   # Should run on http://localhost:3000
   ```

2. **Database Seeded:**
   ```bash
   cd backend
   npm run db:seed
   ```

3. **Install Playwright:**
   ```bash
   cd frontend
   npx playwright install --with-deps
   ```

### Run Tests

**Run all tests:**
```bash
npx playwright test
```

**Run specific test suite:**
```bash
npx playwright test e2e/01-complete-booking-journey.spec.ts
```

**Run with browser visible (headed mode):**
```bash
npx playwright test --headed
```

**Run with debug mode (step through):**
```bash
npx playwright test --debug
```

**Run only critical tests:**
```bash
npx playwright test e2e/00-demo-smoke-test.spec.ts e2e/01-complete-booking-journey.spec.ts --headed
```

### View Test Reports

**Generate and open HTML report:**
```bash
npx playwright show-report
```

**View last test run results:**
```bash
ls -la playwright-report/
open playwright-report/index.html
```

---

## Test Helpers

### Location: `helpers/demo-helpers.ts`

Reusable utilities for demo mode testing:

**Payment Helpers:**
- `fillStripeTestCard()` - Fills Stripe Elements with test card
- `waitForPaymentSuccess()` - Waits for payment confirmation
- `demoPayBooking()` - Simulates payment via API
- `demoAuthorizeExtension()` - Authorizes extension payment
- `demoCaptureExtension()` - Captures extension payment

**Status Helpers:**
- `waitForBookingStatus()` - Polls booking until status reached
- `waitForExtensionStatus()` - Polls extension until status reached
- `verifyStatusBadge()` - Verifies status badge in UI

**Assignment Helpers:**
- `countAssignments()` - Counts pickup/return assignments (duplicate detection)

**API Helpers:**
- `getBookingDetails()` - Fetches booking from API
- `isDemoModeEnabled()` - Checks if demo mode is active

**Utility Helpers:**
- `generateTestEmail()` - Creates unique test email
- `extractBookingIdFromUrl()` - Parses booking ID from URL
- `logCheckpoint()` - Logs test progress with icons

### Location: `helpers/auth-helpers.ts`

Authentication utilities:

- `loginAsCustomer()` - Login as customer user
- `loginAsJockey()` - Login as jockey user
- `loginAsWorkshop()` - Login as workshop user
- `logout()` - Logout from any portal
- `isLoggedIn()` - Check authentication status
- `clearAuth()` - Clear all auth data

---

## Test Credentials

### Customer (Generated per test)
```typescript
email: `demo-customer-${Date.now()}@test.com`
password: 'DemoTest123!'
firstName: 'Demo'
lastName: 'Customer'
phone: '+49 170 1234567'
```

### Jockey (Seeded)
```
username: 'jockey-1'
password: 'jockey123'
email: 'jockey@test.com'
```

### Workshop (Seeded)
```
username: 'werkstatt-witten'
password: 'werkstatt123'
email: 'werkstatt@test.com'
```

### Stripe Test Card
```
Card Number: 4242 4242 4242 4242
Expiry: 12/30
CVC: 123
ZIP: 12345
```

**Alternative Test Cards:**
- `4000 0000 0000 0002` - Always declines
- `4000 0025 0000 3155` - Requires 3D Secure
- `4000 0000 0000 9995` - Insufficient funds

---

## Complete Booking Journey Test

### File: `01-complete-booking-journey.spec.ts`

This is the most comprehensive E2E test, validating the entire customer lifecycle.

**Test Steps:**

1. **Customer Registration**
   - Navigate to booking page
   - Fill vehicle information (VW Golf 2020)
   - Select service (Inspektion)
   - Set pickup/delivery dates
   - Register account (email + password)
   - **Verify:** Registration successful

2. **Payment Processing**
   - Accept terms and conditions
   - Fill Stripe test card (4242...)
   - Submit payment
   - **Verify:** Booking confirmed, booking ID received

3. **Verify Booking Status**
   - Login as customer
   - Check booking status = CONFIRMED
   - **Verify:** Pickup assignment created (exactly 1)

4. **Jockey Pickup**
   - Login as jockey
   - Start pickup assignment
   - Complete pickup with handover
   - **Verify:** Status = IN_TRANSIT_TO_WORKSHOP

5. **Workshop Extension**
   - Login as workshop
   - Create extension (Bremsbeläge: 189.99 EUR)
   - Send to customer
   - **Verify:** Extension status = PENDING

6. **Customer Approves Extension**
   - Login as customer
   - View extension details
   - Approve and authorize payment
   - **Verify:** Payment status = AUTHORIZED

7. **Workshop Completes Service**
   - Login as workshop
   - Mark service as completed
   - **Verify:** Extension payment AUTO-CAPTURED
   - **Verify:** Booking status = COMPLETED

8. **Verify Return Assignment**
   - Login as jockey
   - **Verify:** Return assignment created (exactly 1)

9. **Jockey Return Delivery**
   - Complete return delivery
   - **Verify:** Final status = DELIVERED

**Expected Results:**
- ✅ All 14 assertions pass
- ✅ No duplicate assignments
- ✅ Payment flows work correctly
- ✅ Status transitions are valid
- ✅ Duration < 3 minutes

**Run Command:**
```bash
npx playwright test e2e/01-complete-booking-journey.spec.ts --headed
```

---

## Demo Smoke Test

### File: `00-demo-smoke-test.spec.ts`

Quick validation of critical demo mode functionality.

**Key Validations:**
- Booking auto-confirms with test payment
- Exactly 1 pickup assignment (no duplicates)
- Extension approval with payment authorization
- Auto-capture on service completion
- Exactly 1 return assignment (no duplicates)

**Duration:** < 5 minutes

**Run Command:**
```bash
npx playwright test e2e/00-demo-smoke-test.spec.ts --headed
```

---

## Troubleshooting

### Common Issues

**1. Tests fail with "Target closed" error**

**Solution:**
```bash
# Clear Playwright cache
rm -rf ~/.cache/ms-playwright
npx playwright install --with-deps
```

**2. Payment tests fail**

**Solution:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set to test key (pk_test_...)
- Verify backend has `STRIPE_SECRET_KEY` set to test key (sk_test_...)
- Use test card: 4242 4242 4242 4242

**3. Assignment count fails (duplicate assignments)**

**Solution:**
- Check backend assignment creation logic in bookings.controller.ts
- Verify assignment creation is called only once
- Look for race conditions in auto-assignment code

**4. Tests timeout**

**Solution:**
```bash
# Verify services are running
curl http://localhost:5001/health
curl http://localhost:3000

# Check database connection
cd backend && npm run db:studio
```

---

## Further Reading

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [E2E Process Flow Documentation](../../../03%20Documentation/E2E_Process_Flow.md)
- [Demo Walkthrough Guide](../../DEMO_WALKTHROUGH.md)

---

**Document Version:** 1.0
**Last Updated:** February 3, 2026
**Maintained By:** Agent 5 - E2E Test & Docs Engineer
