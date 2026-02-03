# Demo Walkthrough Guide
## B2C Autowartungs-App Complete Flow

**Purpose:** Step-by-step manual testing guide for demonstrating the complete customer journey from booking to delivery.

**Time Estimate:** < 10 minutes

**Date:** February 3, 2026

---

## Prerequisites

### 1. Environment Setup

Ensure the following services are running:

```bash
# Backend (Terminal 1)
cd /Users/stenrauch/Documents/B2C\ App\ v2/99\ Code/backend
npm run dev
# Should start on http://localhost:5001

# Frontend (Terminal 2)
cd /Users/stenrauch/Documents/B2C\ App\ v2/99\ Code/frontend
npm run dev
# Should start on http://localhost:3000
```

### 2. Database Setup

Ensure PostgreSQL is running with test data:

```bash
# Check database connection
psql -U postgres -d b2c_app -p 5433

# Verify test users exist
SELECT * FROM users WHERE role IN ('CUSTOMER', 'JOCKEY', 'WORKSHOP');
```

### 3. Browser Setup

Open 4 browser tabs or windows:

1. **Tab 1: Customer (Incognito/Private)** - http://localhost:3000/de
2. **Tab 2: Jockey Portal** - http://localhost:3000/de/jockey/login
3. **Tab 3: Workshop Portal** - http://localhost:3000/de/workshop/login
4. **Tab 4: Customer Portal** - http://localhost:3000/de/customer/login

**Why incognito for Tab 1?** Ensures a fresh session for the booking flow without cached credentials.

---

## Demo Flow (10 Steps)

### Step 1: Customer Creates Booking (3 minutes)

**Location:** Tab 1 (Customer - Incognito)

**URL:** http://localhost:3000/de

**Actions:**

1. Click **"Jetzt buchen"** (Book Now) button
2. Wait for booking page to load

**Expected:** Redirected to `/de/booking`

---

### Step 2: Enter Vehicle Information

**Current Page:** `/de/booking` (Step 1 of 4)

**Actions:**

1. **Brand:** Select "VW" from dropdown
2. **Model:** Select "Golf" from dropdown
3. **Year:** Enter "2020"
4. **Mileage:** Enter "50000"
5. Check **"Fahrzeug speichern"** (Save vehicle) - Optional
6. Click **"Weiter"** (Next)

**Expected:**
- Price calculation appears
- Progress to Step 2 of 4

**Screenshot:** [Placeholder: vehicle-selection.png]

---

### Step 3: Select Service

**Current Page:** `/de/booking` (Step 2 of 4)

**Actions:**

1. Check **"Inspektion"** (Inspection) - 149.00 EUR
2. Optionally check **"Ölwechsel"** (Oil Change) - +89.00 EUR
3. Observe total price update in sidebar
4. Click **"Weiter"** (Next)

**Expected:**
- Total price: 171.35 EUR (Inspektion with age surcharge)
- Or 260.35 EUR (if both services selected)
- Progress to Step 3 of 4

**Screenshot:** [Placeholder: service-selection.png]

---

### Step 4: Schedule Pickup and Delivery

**Current Page:** `/de/booking` (Step 3 of 4)

**Actions:**

1. **Pickup Date:** Click date picker, select 3 days from today
2. **Pickup Time:** Select "09:00-11:00"
3. **Address:**
   - Street: "Musterstraße 123"
   - Postal Code: "58453"
   - City: "Witten" (auto-fills)
4. **Delivery Date:** Select 5 days from today
5. **Delivery Time:** Select "17:00-19:00"
6. Click **"Weiter"** (Next)

**Expected:**
- Dates must be valid (pickup at least 2 days ahead)
- City auto-fills based on postal code
- Progress to Step 4 of 4

**Screenshot:** [Placeholder: schedule-details.png]

---

### Step 5: Register Customer Account

**Current Page:** `/de/booking/register`

**Actions:**

1. **Email:** demo-customer-[timestamp]@test.com
   - Use unique email for each test (e.g., demo-customer-20260203@test.com)
2. **Password:** "DemoTest123!"
3. **First Name:** "Demo"
4. **Last Name:** "Customer"
5. **Phone:** "+49 170 1234567"
6. Click **"Registrieren"** (Register)

**Expected:**
- Account created successfully
- Redirected to payment/confirmation page
- User is now logged in

**Important:** Guest checkout is NOT supported. Registration is mandatory.

**Screenshot:** [Placeholder: registration.png]

---

### Step 6: Review and Payment

**Current Page:** `/de/booking` (Step 4 of 4) or `/de/customer/booking/payment`

**Actions:**

1. **Review Summary:**
   - Vehicle: VW Golf 2020
   - Service: Inspektion
   - Pickup: [Selected date and time]
   - Total: 171.35 EUR
2. Check **"Ich akzeptiere die AGB"** (Accept Terms)
3. Click **"Jetzt verbindlich buchen"** (Confirm Booking)
4. **Enter Stripe Test Card:**
   - Card Number: 4242 4242 4242 4242
   - Expiry: 12/30
   - CVC: 123
   - ZIP: 12345
5. Click **"Bezahlen"** (Pay)
6. Wait for payment processing (3-5 seconds)

**Expected:**
- Payment succeeds with test card
- Redirected to confirmation page
- Booking status: CONFIRMED
- Booking number displayed (e.g., BK-2026-001234)

**Screenshot:** [Placeholder: payment-confirmation.png]

**Time Checkpoint:** ~3 minutes elapsed

---

### Step 7: Jockey Sees Pickup Assignment (1 minute)

**Location:** Tab 2 (Jockey Portal)

**URL:** http://localhost:3000/de/jockey/login

**Actions:**

1. **Login:**
   - Username: "jockey-1"
   - Password: "jockey123"
2. Click **"Anmelden"** (Login)
3. Dashboard loads automatically

**Expected:**
- See assignment card for "Demo Customer"
- Vehicle: VW Golf 2020
- Address: Musterstraße 123, 58453 Witten
- Status: PENDING
- Exactly **1 assignment** (check for duplicates!)

**Screenshot:** [Placeholder: jockey-dashboard-pickup.png]

**Actions to Complete Pickup:**

4. Click **"Abholung starten"** (Start Pickup)
5. Status updates to "EN_ROUTE"
6. Click **"Übergabe dokumentieren"** (Document Handover)
7. If modal appears, click **"Bestätigen"** (Confirm)
8. Assignment marked as COMPLETED

**Expected After Pickup:**
- Assignment status: COMPLETED
- Booking status changes to: IN_TRANSIT_TO_WORKSHOP

**Time Checkpoint:** ~4 minutes elapsed

---

### Step 8: Workshop Creates Extension (2 minutes)

**Location:** Tab 3 (Workshop Portal)

**URL:** http://localhost:3000/de/workshop/login

**Actions:**

1. **Login:**
   - Username: "werkstatt-witten"
   - Password: "werkstatt123"
2. Click **"Anmelden"** (Login)
3. Dashboard shows active orders
4. Find booking for "Demo Customer"
5. Click to open booking details
6. Update status to **"IN_SERVICE"**
7. Click **"Erweiterung erstellen"** (Create Extension)

**Extension Form:**

8. **Description:**
   ```
   Bremsbeläge vorne und hinten sind verschlissen und müssen
   dringend erneuert werden. Bremsscheiben zeigen Rillen.
   ```
9. **Item 1:**
   - Name: "Bremsbeläge vorne"
   - Price: 189.99
   - Quantity: 1
10. **Item 2 (Optional):**
    - Name: "Bremsbeläge hinten"
    - Price: 169.99
    - Quantity: 1
11. **Total:** 359.98 EUR
12. Click **"An Kunden senden"** (Send to Customer)

**Expected:**
- Extension created successfully
- Extension status: PENDING
- Customer receives notification (bell icon shows badge)

**Screenshot:** [Placeholder: workshop-extension-creation.png]

**Time Checkpoint:** ~6 minutes elapsed

---

### Step 9: Customer Approves Extension (2 minutes)

**Location:** Tab 4 (Customer Portal)

**URL:** http://localhost:3000/de/customer/login

**Actions:**

1. **Login:**
   - Email: demo-customer-[timestamp]@test.com
   - Password: DemoTest123!
2. Click **"Anmelden"** (Login)
3. Dashboard loads with bookings
4. See notification badge (1) on bell icon
5. Click on booking card
6. Click **"Erweiterungen"** (Extensions) tab
7. See extension card with status "Ausstehend" (PENDING)
8. Click **"Details anzeigen"** (View Details)
9. Extension modal opens showing:
   - Description
   - Items with prices
   - Total: 359.98 EUR
10. Click **"Genehmigen & Bezahlen"** (Approve & Pay)
11. **Enter Stripe Test Card:**
    - Card Number: 4242 4242 4242 4242
    - Expiry: 12/30
    - CVC: 123
    - ZIP: 12345
12. Click **"Bezahlen"** (Pay)
13. Wait for payment authorization (3-5 seconds)

**Expected:**
- Payment authorized successfully
- Extension status: APPROVED
- Payment badge: Yellow **"Autorisiert"** (Authorized)
- Modal closes
- Success toast appears

**Important:** Payment is **AUTHORIZED** not **CAPTURED** yet!

**Screenshot:** [Placeholder: extension-approval.png]

**Time Checkpoint:** ~8 minutes elapsed

---

### Step 10: Workshop Completes Service & Auto-Capture (1 minute)

**Location:** Tab 3 (Workshop Portal - already logged in)

**URL:** http://localhost:3000/de/workshop/dashboard

**Actions:**

1. Refresh dashboard if needed
2. See extension status changed to **"APPROVED"**
3. Find the booking
4. Click **"Service abschließen"** (Complete Service)
5. Confirm completion

**Expected:**
- Service status: COMPLETED
- Extension payment **AUTO-CAPTURED** (happens automatically)
- Extension status changes to: COMPLETED
- Payment badge changes: Yellow "Autorisiert" → Green **"Bezahlt"** (Paid)
- Return assignment **auto-created** for jockey

**Screenshot:** [Placeholder: workshop-completed.png]

**Time Checkpoint:** ~9 minutes elapsed

---

### Step 11: Verify Return Assignment Created (30 seconds)

**Location:** Tab 2 (Jockey Portal - already logged in)

**URL:** http://localhost:3000/de/jockey/dashboard

**Actions:**

1. Refresh dashboard or wait for auto-refresh (30s)
2. See new assignment type: **"RETURN"** (Rückgabe)
3. Exactly **1 return assignment** should appear (check for duplicates!)
4. Click **"Rückgabe starten"** (Start Return)
5. Status: EN_ROUTE
6. Click **"Rückgabe abschließen"** (Complete Return)
7. Confirm completion

**Expected:**
- Return assignment completed
- Booking status changes to: **DELIVERED**

**Screenshot:** [Placeholder: jockey-return-delivery.png]

**Time Checkpoint:** ~10 minutes elapsed

---

### Step 12: Verify Complete Flow (30 seconds)

**Location:** Tab 4 (Customer Portal - already logged in)

**URL:** http://localhost:3000/de/customer/bookings

**Actions:**

1. Refresh booking details
2. Verify final statuses:
   - Booking Status: **DELIVERED** (Green)
   - Extension Status: **COMPLETED** (Green)
   - Payment Status: **Bezahlt** (Green, Paid)
   - Total Price: Original (171.35 EUR) + Extension (359.98 EUR) = 531.33 EUR

**Expected:**
- Complete journey from booking to delivery
- All statuses are final and correct
- Payment fully captured

**Screenshot:** [Placeholder: final-delivered-status.png]

---

## Success Criteria Checklist

After completing the demo, verify all criteria are met:

- [ ] Customer booking created successfully
- [ ] Booking auto-confirmed after payment
- [ ] **Exactly 1 pickup assignment created (no duplicates)**
- [ ] Jockey completed pickup
- [ ] Booking status changed to IN_TRANSIT_TO_WORKSHOP
- [ ] Workshop created extension with items
- [ ] Customer approved extension with payment
- [ ] Extension payment status: AUTHORIZED (yellow)
- [ ] Workshop completed service
- [ ] Extension payment AUTO-CAPTURED
- [ ] Extension payment status: PAID (green)
- [ ] **Exactly 1 return assignment created (no duplicates)**
- [ ] Jockey completed return delivery
- [ ] Final booking status: DELIVERED
- [ ] Total flow time: < 10 minutes

---

## Common Issues & Troubleshooting

### Issue 1: Payment Fails
**Symptom:** Stripe payment doesn't process
**Solutions:**
- Verify test card number: 4242 4242 4242 4242
- Check `.env` has NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set
- Ensure backend has STRIPE_SECRET_KEY configured
- Check browser console for errors

### Issue 2: Assignment Not Showing
**Symptom:** Jockey doesn't see pickup/return assignment
**Solutions:**
- Refresh jockey dashboard (auto-refresh every 30s)
- Check database: `SELECT * FROM assignments WHERE booking_id = '...'`
- Verify jockey user exists and has role JOCKEY
- Check backend logs for assignment creation errors

### Issue 3: Duplicate Assignments Created
**Symptom:** Jockey sees 2+ assignments for same booking
**Solutions:**
- Check backend logic in assignment creation
- Verify assignment creation is called only once
- Look for race conditions in auto-assignment code
- Check database for duplicate records

### Issue 4: Extension Payment Not Capturing
**Symptom:** Payment stays "Authorized" after completion
**Solutions:**
- Check workshop marked status as COMPLETED
- Verify extension has stripePaymentIntentId
- Check backend logs for Stripe capture errors
- Ensure STRIPE_SECRET_KEY is correct

### Issue 5: Registration Required Error
**Symptom:** Cannot proceed without registration
**Expected Behavior:** This is correct! Guest checkout is NOT supported.
**Solution:** Complete the registration step (Step 5) - it is mandatory.

---

## Demo Talking Points

Use these talking points when presenting the demo:

### 1. Seamless Customer Experience
- "Notice how the customer can book, pay, and track everything online"
- "Real-time status updates keep customers informed"
- "Extension approval with itemized pricing builds trust"

### 2. Efficient Operations
- "Jockey assignments are created automatically - no manual dispatch"
- "Workshop can request additional work digitally with photos"
- "All handovers are documented with digital signatures"

### 3. Smart Payment Flow
- "We authorize the extension payment upfront..."
- "...but only capture it after the work is completed"
- "This prevents disputes and protects both customer and workshop"

### 4. Production-Ready Architecture
- "Built with TypeScript end-to-end for type safety"
- "Comprehensive error handling and validation"
- "Real-time updates with automatic refresh"
- "Scales to handle multiple concurrent bookings"

---

## Next Steps After Demo

1. **Automated Testing:**
   ```bash
   npx playwright test e2e/00-demo-smoke-test.spec.ts --headed
   ```

2. **Review Documentation:**
   - E2E Process Flow: `/03 Documentation/E2E_Process_Flow.md`
   - Demo Script: `/99 Code/DEMO_SCRIPT.md`

3. **Extend Functionality:**
   - Add real image upload for vehicle photos
   - Implement push notifications
   - Add SMS notifications
   - Build admin dashboard

4. **Deploy to Staging:**
   - Set up staging environment
   - Configure production-like settings
   - Test with live Stripe test mode

5. **Go Live:**
   - Switch to Stripe live keys
   - Enable production payment processing
   - Monitor first real transactions

---

## Appendix: Test Credentials

### Customer
- **Email:** demo-customer-[unique]@test.com
- **Password:** DemoTest123!
- **Name:** Demo Customer
- **Phone:** +49 170 1234567

### Jockey
- **Username:** jockey-1
- **Password:** jockey123
- **Email:** jockey@test.com

### Workshop
- **Username:** werkstatt-witten
- **Password:** werkstatt123
- **Email:** werkstatt@test.com

### Stripe Test Card
- **Card Number:** 4242 4242 4242 4242
- **Expiry:** 12/30 (any future date)
- **CVC:** 123
- **ZIP:** 12345

---

## Screenshot Placeholders

The following screenshots should be captured during a demo walkthrough:

1. `vehicle-selection.png` - Vehicle information form
2. `service-selection.png` - Service selection with pricing
3. `schedule-details.png` - Pickup/delivery date picker
4. `registration.png` - Customer registration form
5. `payment-confirmation.png` - Payment success page
6. `jockey-dashboard-pickup.png` - Jockey pickup assignment
7. `workshop-extension-creation.png` - Extension creation form
8. `extension-approval.png` - Customer extension approval modal
9. `workshop-completed.png` - Workshop service completion
10. `jockey-return-delivery.png` - Jockey return assignment
11. `final-delivered-status.png` - Final delivered booking status

---

**Document Version:** 1.0
**Last Updated:** February 3, 2026
**Author:** Agent 5 - E2E Smoke Test & Documentation Engineer
**Next Review:** March 1, 2026

**END OF WALKTHROUGH GUIDE**
