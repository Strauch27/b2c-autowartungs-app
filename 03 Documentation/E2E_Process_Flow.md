# End-to-End Process Flow Documentation
## B2C Autowartungs-App (AutoConcierge)

**Version:** 1.0
**Date:** February 1, 2026
**Purpose:** Complete journey mapping from initial booking through service completion

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Types](#user-types)
3. [Demo Mode Flow](#demo-mode-flow)
4. [Complete Customer Journey](#complete-customer-journey)
5. [Critical Process: Auftragserweiterung (Extension)](#critical-process-auftragserweiterung-extension)
6. [Payment Touchpoints](#payment-touchpoints)
7. [Notification System](#notification-system)
8. [Status Lifecycle](#status-lifecycle)
9. [Alternative Paths and Edge Cases](#alternative-paths-and-edge-cases)

---

## System Overview

The B2C Autowartungs-App is a full-service vehicle maintenance booking platform with concierge pickup/delivery service. The system coordinates three user types (Customer, Workshop, Jockey) through a complete service lifecycle from booking to completion.

### Core Value Proposition
- Simple registration required before booking (email + password)
- Concierge vehicle pickup and delivery (Hol- und Bringservice)
- Ronja replacement vehicle during service
- Transparent pricing with extension approval workflow
- Digital documentation (photos, signatures)
- Real-time status tracking and notifications

### Technology Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Payment: Stripe (with manual capture for extensions)
- Notifications: Firebase Cloud Messaging (FCM)
- Multi-language: German (DE) and English (EN)

---

## Demo Mode Flow

### Overview

The demo mode allows stakeholders, investors, and testers to experience the complete end-to-end flow without processing real payments or requiring production Stripe credentials. This mode is ideal for demonstrations, development, and automated testing.

### Demo Mode vs Production Mode

| Aspect | Demo Mode | Production Mode |
|--------|-----------|-----------------|
| **Payment Processing** | Uses Stripe test cards | Real payment processing |
| **Payment Intent** | Test mode (no real charges) | Live mode (actual charges) |
| **Auto-Confirmation** | Immediate confirmation after test payment | Confirmation after real payment |
| **Stripe Keys** | Test publishable key (pk_test_...) | Live publishable key (pk_live_...) |
| **Email Notifications** | Sent to test emails | Sent to real customer emails |
| **Assignment Creation** | Automated (for demo flow) | Automated (production) |

### Enabling Demo Mode

Demo mode is automatically enabled when using Stripe test API keys:

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

**Backend (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_51...
```

### Demo Mode Test Cards

When in demo mode, use these Stripe test cards:

| Card Number | Behavior | Use Case |
|-------------|----------|----------|
| 4242 4242 4242 4242 | Always succeeds | Standard success flow |
| 4000 0000 0000 0002 | Always declines | Test decline handling |
| 4000 0025 0000 3155 | Requires 3D Secure | Test authentication |
| 4000 0000 0000 9995 | Insufficient funds | Test payment failure |

**Additional test card details:**
- **Expiry:** Any future date (e.g., 12/30)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Demo Mode Flow Steps

The complete demo flow mirrors the production flow but uses fake payment processing:

#### 1. Customer Creates Booking (Demo)
- Navigate to `/de/booking`
- Fill vehicle details (VW Golf, 2020, 50,000 km)
- Select service (Inspektion)
- Enter pickup/delivery dates and address
- Register with demo credentials:
  - Email: demo@test.com
  - Password: demo123
  - Name: Demo Customer
- **Payment:** Enter test card `4242 4242 4242 4242`
- Booking auto-confirms immediately (no real charge)

**Result:** Booking status = CONFIRMED, pickup assignment created

#### 2. Jockey Pickup (Demo)
- Login: jockey-1 / jockey123
- See assignment for Demo Customer
- Complete pickup with digital handover

**Result:** Booking status = IN_TRANSIT_TO_WORKSHOP

#### 3. Workshop Creates Extension (Demo)
- Login: werkstatt-witten / werkstatt123
- Create extension:
  - Description: "Bremsbeläge verschlissen"
  - Items: Bremsbeläge vorne (189.99 EUR)
  - Total: 189.99 EUR
- Send to customer

**Result:** Extension status = PENDING

#### 4. Customer Approves Extension (Demo)
- Login as customer (demo@test.com)
- View extension in booking details
- Click "Genehmigen & Bezahlen"
- **Payment:** Enter test card `4242 4242 4242 4242`
- Payment is **authorized** (not captured)

**Result:** Extension status = APPROVED, payment status = AUTHORIZED

#### 5. Workshop Completes Service (Demo)
- Mark service as COMPLETED
- **Auto-capture:** System automatically captures authorized payment
- Extension payment changes from AUTHORIZED → CAPTURED

**Result:** Extension status = COMPLETED, payment status = PAID

#### 6. Jockey Return Delivery (Demo)
- Return assignment auto-created
- Jockey completes return delivery

**Result:** Booking status = DELIVERED

### Demo Mode Validation

The E2E smoke test (`00-demo-smoke-test.spec.ts`) validates:

- ✅ Booking auto-confirms with test payment
- ✅ Exactly 1 pickup assignment created (checks for duplicates)
- ✅ Extension approval with fake payment authorization
- ✅ Auto-capture on service completion
- ✅ Exactly 1 return assignment created (checks for duplicates)
- ✅ Complete flow from booking to delivery (<5 minutes)

### Important Notes for Demo Mode

1. **No Real Charges:** Test cards never create real charges. All transactions are simulated.

2. **Guest Checkout Not Supported:** Customers must register before booking (enforced in booking flow). The registration step is **required** and cannot be skipped.

3. **Stripe Webhooks:** In demo mode, Stripe webhooks use test webhook endpoints. Configure test webhook secret:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```

4. **Database:** Demo mode can use the same database as development, but data is marked as test data.

5. **Email Notifications:** Emails are sent to test addresses. Consider using email testing tools like Mailtrap or Ethereal for demo environments.

6. **Time Compression:** In demo mode, you can use immediate dates (e.g., pickup tomorrow) instead of the production minimum of 2 days notice.

### Switching to Production Mode

To switch from demo to production:

1. **Update Stripe Keys:**
   ```bash
   # Frontend
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

   # Backend
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Update Environment:**
   ```bash
   NODE_ENV=production
   ```

3. **Enable Production Payment Processing:**
   - Remove any `SKIP_PAYMENT` flags
   - Ensure live Stripe account is activated
   - Configure real webhook endpoints

4. **Test with Live Test Mode First:**
   - Stripe allows "live test mode" for final validation
   - Use live keys but with test cards
   - Verify webhooks work correctly

5. **Go Live:**
   - Activate Stripe account fully
   - Real payments will be processed
   - Monitor transactions in Stripe Dashboard

### Demo Environment Setup

For a complete demo environment:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend
cd frontend
npm run dev

# 3. Run demo smoke test
npx playwright test e2e/00-demo-smoke-test.spec.ts --headed

# 4. Manual demo walkthrough
# Follow: /99 Code/DEMO_WALKTHROUGH.md
```

---

## User Types

### 1. Customer (CUSTOMER)
**Access:** Registered account required (registration enforced in booking flow)
**Portal:** `/customer/*`
**Authentication:** Email + Password

**Important:** Guest checkout is NOT supported. Customers must register before completing a booking. The registration step is mandatory and occurs during the booking flow (Step 1.5).

**Capabilities:**
- Book services (requires registration)
- Track booking status
- Approve/decline extensions
- Make payments (real or demo mode)
- View service history
- Receive notifications

### 2. Workshop (WORKSHOP)
**Access:** Registered account only
**Portal:** `/workshop/*`
**Authentication:** Username + Password
**Example:** werkstatt-witten / werkstatt123

**Capabilities:**
- View incoming orders
- Update order status
- Create extensions (Auftragserweiterung)
- Upload documentation (photos, videos)
- Manage service completion

### 3. Jockey (JOCKEY)
**Access:** Registered account only
**Portal:** `/jockey/*`
**Authentication:** Username + Password
**Example:** jockey-1 / jockey123

**Capabilities:**
- View assigned pickup/delivery tasks
- Navigate to customer addresses
- Collect digital signatures
- Take vehicle condition photos
- Hand over Ronja (replacement vehicle)
- Update task completion status

---

## Complete Customer Journey

### Phase 1: Initial Booking (with Required Registration)

#### Step 1.1: Service Discovery
**Location:** Landing page `/de` or `/en`
**Duration:** 1-3 minutes

**User Actions:**
1. Customer visits landing page
2. Reviews service offerings (Inspektion, Olwechsel, TUV, etc.)
3. Sees value propositions (Hol- und Bringservice, Ronja replacement)
4. Clicks "Jetzt buchen" (Book Now)

**System Response:**
- Displays multi-language landing page
- Shows trust badges and pricing transparency
- Redirects to booking flow

---

#### Step 1.2: Vehicle Information Entry
**Location:** `/de/booking` (Step 1 of 4)
**Duration:** 2-4 minutes

**User Actions:**
1. Selects vehicle brand (e.g., BMW, VW, Mercedes)
2. Selects vehicle model (e.g., 3er, Golf, C-Class)
3. Selects build year (e.g., 2020)
4. Enters mileage (e.g., 50,000 km)
5. Optionally checks "Fahrzeug speichern" (Save vehicle for future bookings)
6. Clicks "Weiter" (Next)

**Validation:**
- All fields required
- Mileage must be numeric and realistic (< 500,000 km)
- Year must be between 1990 and current year

**System Response:**
- Validates input in real-time
- Calculates age-based pricing multiplier
- Stores vehicle data in session
- Advances to Step 2

---

#### Step 1.3: Service Selection
**Location:** `/de/booking` (Step 2 of 4)
**Duration:** 1-2 minutes

**User Actions:**
1. Reviews available services with descriptions
2. Selects one or multiple services (checkbox selection)
   - Inspektion (Inspection)
   - Olwechsel (Oil change)
   - TUV (Safety inspection)
   - Bremsenservice (Brake service)
   - Klimawartung (AC service)
3. Views dynamic price calculation
4. Clicks "Weiter" (Next)

**Validation:**
- At least one service must be selected
- Price display shows breakdown

**System Response:**
- Calculates total price: Base price × age multiplier
- Shows service details and estimated duration
- Stores service selection in session
- Advances to Step 3

**Pricing Example:**
```
Base price: 149.00 EUR (Inspektion)
Vehicle age: 6 years (2020 model in 2026)
Age multiplier: 1.15
Final price: 171.35 EUR
```

---

#### Step 1.4: Pickup and Delivery Scheduling
**Location:** `/de/booking` (Step 3 of 4)
**Duration:** 3-5 minutes

**User Actions:**
1. **Pickup Date/Time:**
   - Opens date picker calendar
   - Selects date (minimum: 2 days from today)
   - Selects time slot (e.g., 09:00-11:00, 11:00-13:00, etc.)

2. **Delivery Date/Time:**
   - Opens date picker calendar
   - Selects date (minimum: pickup date + 1 day)
   - Selects time slot

3. **Address Information:**
   - Street and number (e.g., Musterstrasse 123)
   - Postal code (e.g., 58453)
   - City (auto-populated from postal code)

4. Clicks "Weiter" (Next)

**Validation:**
- Pickup date must be at least 48 hours in future
- Delivery date must be after pickup date
- Postal code must be in service area (Witten and surrounding)
- All address fields required

**System Response:**
- Calendar auto-closes after date selection
- City field auto-fills based on postal code
- Validates service area coverage
- Calculates estimated service duration
- Stores scheduling data in session
- Advances to Step 4

---

#### Step 1.5: Registration/Login (REQUIRED)
**Location:** `/de/booking/register` (before confirmation)
**Duration:** 2-5 minutes

**User Actions:**
1. **Registration (for new users):**
   - First name
   - Last name
   - Email address
   - Password (customer creates own password)
   - Phone number (optional but recommended)
   - Clicks "Registrieren" (Register)

2. **Login (for existing users):**
   - Email address
   - Password
   - Clicks "Anmelden" (Login)
   - OR uses "Passwort vergessen" (Forgot password) link

**Validation:**
- Email format validation
- Email uniqueness check (no duplicate accounts)
- Password strength requirements (min. 8 characters)
- All required fields must be filled

**System Response:**
1. Creates user account in database (CUSTOMER role)
2. Generates JWT authentication token
3. Stores auth token in session
4. Advances to confirmation step

---

#### Step 1.6: Confirmation and Payment
**Location:** `/de/booking` (Step 4 of 4)
**Duration:** 3-7 minutes

**User Actions (Logged-in User):**
1. **Reviews Booking Summary:**
   - Vehicle details
   - Selected services
   - Pickup date/time and address
   - Delivery date/time
   - Total price breakdown
   - Contact information (pre-filled from account)

2. **Reviews Terms:**
   - Reads AGB (Terms and Conditions)
   - Reads Datenschutz (Privacy Policy)
   - Checks "Ich akzeptiere die AGB" checkbox

3. Clicks "Jetzt verbindlich buchen" (Confirm booking)

**Validation:**
- All contact fields required (except phone if marked optional)
- Email format validation
- AGB checkbox must be checked
- Phone number format validation if provided

**System Response:**
1. Creates booking in database with status: PAYMENT_PENDING
2. **Generates unique booking number** (e.g., BK-2026-001234)
3. Links booking to authenticated user account
4. Creates payment intent with Stripe
5. Redirects to payment page

**Note:** Customer account already exists from registration step, so no account creation is needed at this point.

---

#### Step 1.7: Payment Processing
**Location:** `/de/customer/booking/payment?bookingId=xxx`
**Duration:** 2-5 minutes

**User Actions:**
1. Reviews booking summary one final time
2. **Enters payment details** (Stripe Elements):
   - Credit/debit card number
   - Expiry date
   - CVC
   - Postal code
   - OR selects SEPA Direct Debit
   - OR selects Sofort Banking
3. Handles 3D Secure authentication if required
4. Clicks "Bezahlen" (Pay)

**Payment Methods Supported:**
- Credit/Debit Cards (Visa, Mastercard, Amex)
- SEPA Direct Debit
- Sofort Banking
- Google Pay / Apple Pay (automatic)

**System Response:**
1. Processes payment through Stripe
2. Updates booking status: PAYMENT_PENDING → CONFIRMED
3. Sends confirmation emails:
   - To customer: Booking confirmation + receipt
   - To workshop: New order notification
4. Creates jockey assignment for pickup
5. Sends push notification (if customer has app/enabled)
6. Redirects to confirmation page

**Email Sent (Customer):**
```
Subject: Buchungsbestatigung BK-2026-001234

Vielen Dank fur Ihre Buchung!

Buchungsnummer: BK-2026-001234
Service: Inspektion
Fahrzeug: BMW 3er (2020)
Abholung: 20.02.2026, 09:00-11:00
Adresse: Musterstrasse 123, 58453 Witten
Gezahlt: 171.35 EUR

Sie konnen Ihre Buchung verfolgen: [Link to customer portal]
Einloggen mit: kunde@example.com
```

---

#### Step 1.8: Booking Confirmation
**Location:** `/de/customer/booking/confirmation?bookingId=xxx`
**Duration:** 1 minute (viewing)

**User Sees:**
- Green checkmark icon
- "Buchung bestatigt!" (Booking Confirmed!)
- Booking number prominently displayed
- Service summary
- Payment status (succeeded with green badge)
- What happens next:
  - "Unser Jockey wird Ihr Fahrzeug am [date] abholen"
  - "Sie erhalten eine SMS/Email 24h vor der Abholung"
- Next steps:
  - Link to customer dashboard
  - Link to download booking PDF
  - Link to add to calendar

**System State:**
- Booking status: CONFIRMED
- Payment status: SUCCEEDED
- Jockey assignment: Created (status: PENDING)
- Customer account: Active
- Notifications: Sent

---

### Phase 2: Pre-Service (Vehicle Pickup)

#### Step 2.1: Pickup Reminder
**Timing:** 24 hours before scheduled pickup
**Duration:** N/A (automated)

**System Actions:**
1. Sends reminder notifications:
   - Email to customer
   - SMS to customer (if phone provided)
   - Push notification (if enabled)
2. Sends task reminder to assigned jockey
3. Updates booking status: CONFIRMED → PICKUP_SCHEDULED

**Customer Notification Content:**
```
Subject: Erinnerung: Fahrzeugabholung morgen

Ihre Fahrzeugabholung ist morgen geplant!

Zeit: 20.02.2026, 09:00-11:00
Adresse: Musterstrasse 123, 58453 Witten
Jockey: Max Mustermann (Telefon: +49 123 456789)

Bitte stellen Sie sicher:
- Fahrzeugschlussel sind verfugbar
- Fahrzeug ist zuganglich
- Jemand ist vor Ort fur Ubergabe

Status verfolgen: [Link]
```

---

#### Step 2.2: Jockey Pickup Execution
**Timing:** Scheduled pickup time window
**Duration:** 15-30 minutes

**Jockey Actions (via Jockey Portal):**
1. **Views assignment** on dashboard `/jockey/dashboard`
   - Customer name and address
   - Pickup time window
   - Vehicle details
   - Special instructions

2. **Navigates to location:**
   - Clicks "Navigieren" (Navigate) button
   - Opens Google Maps / Apple Maps with address

3. **Arrives at location:**
   - Calls customer if needed (Click-to-call button)
   - Meets customer at address

4. **Vehicle handover process:**
   - Inspects vehicle condition
   - Takes photos (minimum 4: front, back, left, right)
   - Documents any existing damage
   - Collects vehicle keys
   - Has customer sign digital signature on tablet/phone

5. **Ronja handover:**
   - Provides replacement vehicle (Ronja)
   - Explains Ronja vehicle features
   - Hands over Ronja keys
   - Has customer sign Ronja handover form

6. **Completes pickup:**
   - Uploads photos to system
   - Uploads signatures
   - Updates status: "Abholung abgeschlossen" (Pickup completed)
   - Drives vehicle to workshop

**System Response:**
- Updates booking status: PICKUP_SCHEDULED → IN_TRANSIT_TO_WORKSHOP
- Notifies customer: "Fahrzeug wurde abgeholt"
- Notifies workshop: "Fahrzeug unterwegs"
- Push notification sent to customer

**Photos Taken:**
- Front view (license plate visible)
- Back view
- Left side
- Right side
- Dashboard (mileage visible)
- Any existing damage (close-up)

**Digital Signatures Collected:**
1. Customer signature (vehicle handover)
2. Customer signature (Ronja receipt)

---

#### Step 2.3: Vehicle Arrival at Workshop
**Timing:** After jockey drives vehicle to workshop
**Duration:** 5-10 minutes

**Jockey Actions:**
1. Arrives at workshop with customer vehicle
2. Parks vehicle in designated area
3. Hands over keys to workshop staff
4. Updates status: "Fahrzeug in Werkstatt angekommen"

**System Response:**
- Updates booking status: IN_TRANSIT_TO_WORKSHOP → AT_WORKSHOP
- Notifies customer: "Ihr Fahrzeug ist in der Werkstatt angekommen"
- Notifies workshop: New vehicle available for service
- Workshop can now see order in their dashboard

**Customer Notification:**
```
Subject: Fahrzeug in Werkstatt angekommen

Ihr BMW 3er ist sicher in der Werkstatt angekommen.

Buchung: BK-2026-001234
Ankunftszeit: 20.02.2026, 10:45 Uhr

Die Inspektion beginnt in Kurze.
Sie erhalten Updates uber den Fortschritt.

Status verfolgen: [Link]
```

---

### Phase 3: Service Execution

#### Step 3.1: Workshop Begins Service
**Location:** Workshop portal `/workshop/dashboard`
**Duration:** Variable (depends on service)

**Workshop Actions:**
1. **Views order** in dashboard table
   - Filters orders by status: AT_WORKSHOP
   - Sees customer name, vehicle, service type
   - Opens order details modal

2. **Reviews service requirements:**
   - Service type (Inspektion, Olwechsel, etc.)
   - Vehicle details and mileage
   - Customer notes/special requests
   - Pickup photos from jockey

3. **Starts service:**
   - Clicks "Service starten" (Start service)
   - Assigns technician
   - Begins diagnostic and service work

4. **Updates status:**
   - Changes status: AT_WORKSHOP → IN_SERVICE

**System Response:**
- Updates booking status in database
- Notifies customer: "Service hat begonnen"
- Shows estimated completion time
- Push notification sent

---

#### Step 3.2: Service in Progress
**Timing:** During service execution
**Duration:** 1-4 hours (depends on service type)

**Workshop Activities:**
- Performs requested service (inspection, oil change, etc.)
- Documents work performed
- Takes photos of completed work
- Identifies any additional issues

**Customer View:**
- Can track status in customer portal
- Status badge shows: "In Bearbeitung" (In Service) - yellow badge
- Estimated completion time displayed

---

### Phase 4: CRITICAL - Auftragserweiterung (Extension Process)

This is the MOST IMPORTANT process in the system because it involves additional costs that must be approved and paid by the customer before work proceeds.

#### Step 4.1: Workshop Identifies Additional Work Needed
**Trigger:** During service, workshop discovers additional issues
**Examples:**
- Brake pads worn beyond limit
- Oil leak detected
- Broken parts discovered
- Additional maintenance recommended

**Workshop Decision Point:**
- Can we proceed without this work? → Complete service normally
- Is this work required/recommended? → Create extension

---

#### Step 4.2: Workshop Creates Extension
**Location:** Workshop portal `/workshop/dashboard`
**Duration:** 5-10 minutes

**Workshop Actions:**
1. **Opens extension modal:**
   - Finds booking in dashboard
   - Clicks "Erweiterung erstellen" (Create Extension) button
   - Extension modal appears

2. **Fills extension details:**

   **Description (Required):**
   ```
   Example: "Bremsbelage vorne und hinten sind verschlissen und
   mussen dringend erneuert werden. Bremsscheiben zeigen Rillen
   und sollten ebenfalls getauscht werden fur optimale Sicherheit."
   ```

   **Items List (Minimum 1 item required):**

   | Description | Quantity | Unit Price | Total |
   |------------|----------|------------|-------|
   | Bremsbelage vorne | 1 | 189.99 EUR | 189.99 EUR |
   | Bremsbelage hinten | 1 | 169.99 EUR | 169.99 EUR |
   | Bremsscheiben vorne (Paar) | 1 | 249.99 EUR | 249.99 EUR |
   | Bremsscheiben hinten (Paar) | 1 | 199.99 EUR | 199.99 EUR |
   | Arbeitszeit Bremsen | 2.5 h | 89.00 EUR | 222.50 EUR |
   | **TOTAL** | | | **1,032.46 EUR** |

   **Evidence Upload (Highly Recommended):**
   - Photos of worn brake pads (before)
   - Photos of damaged brake discs
   - Video showing brake condition
   - Maximum 10 photos, 2 videos

3. **Reviews extension:**
   - Checks all prices are correct
   - Verifies description is clear
   - Ensures photos uploaded successfully
   - Reviews total amount

4. **Sends extension:**
   - Clicks "An Kunden senden" (Send to Customer)
   - Confirms action in confirmation dialog
   - Modal closes on success

**Validation:**
- Description minimum 20 characters
- At least 1 item required
- All items must have description and price > 0
- Photos/videos optional but recommended

**System Response:**
1. Creates extension record in database:
   ```javascript
   {
     id: "ext_001234",
     bookingId: "BK-2026-001234",
     status: "PENDING",
     description: "...",
     items: [...],
     totalAmount: 1032.46,
     photos: [...],
     createdAt: "2026-02-20T14:30:00Z",
     approvedAt: null,
     declinedAt: null
   }
   ```
2. Creates notification for customer (type: EXTENSION_CREATED)
3. Sends push notification to customer
4. Sends email to customer
5. Does NOT proceed with work (waits for approval)

**Workshop Status:** Service paused, waiting for customer approval

---

#### Step 4.3: Customer Receives Extension Notification
**Timing:** Immediately after workshop creates extension
**Duration:** N/A (instant)

**Customer Receives:**

1. **Push Notification (if enabled):**
   ```
   Title: Auftragserweiterung erforderlich
   Body: Ihre Werkstatt hat zusatzliche Arbeiten vorgeschlagen (1,032.46 EUR)
   Action: Tap to review
   ```

2. **Email Notification:**
   ```
   Subject: Auftragserweiterung BK-2026-001234

   Guten Tag,

   Wahrend der Inspektion wurden zusatzliche Arbeiten festgestellt,
   die wir empfehlen:

   Beschreibung:
   Bremsbelage vorne und hinten sind verschlissen...

   Positionen:
   - Bremsbelage vorne: 189.99 EUR
   - Bremsbelage hinten: 169.99 EUR
   - Bremsscheiben vorne: 249.99 EUR
   - Bremsscheiben hinten: 199.99 EUR
   - Arbeitszeit: 222.50 EUR

   GESAMT: 1,032.46 EUR

   Bitte prufen und genehmigen Sie die Erweiterung:
   [Link to customer portal]

   WICHTIG: Die Zahlung erfolgt vor Durchfuhrung der Arbeiten.
   ```

3. **In-App Notification:**
   - Bell icon shows red badge with count
   - Notification center shows orange warning icon
   - Notification text: "Auftragserweiterung wartet auf Genehmigung"

---

#### Step 4.4: Customer Reviews Extension
**Location:** Customer portal `/customer/bookings/BK-2026-001234`
**Duration:** 5-15 minutes (customer decision time)

**Customer Actions:**

1. **Accesses notification:**
   - Clicks bell icon in header
   - Sees extension notification (orange badge: "Ausstehend")
   - Clicks notification
   - OR directly navigates from email link

2. **Views booking detail page:**
   - Automatically lands on "Extensions" tab
   - Extension card is visible with pending status

3. **Reviews extension card:**
   ```
   +--------------------------------------------------+
   | [!] AUSSTEHEND                   [Details anzeigen] |
   |--------------------------------------------------|
   | Erstellt am: 20.02.2026, 14:30 Uhr              |
   |                                                  |
   | Bremsbelage vorne und hinten sind verschlissen   |
   | und mussen dringend erneuert werden...           |
   |                                                  |
   | Positionen: 5                                    |
   | Gesamtpreis: 1,032.46 EUR                        |
   |                                                  |
   | [Photo] [Photo] [Photo] [Photo]                 |
   +--------------------------------------------------+
   ```

4. **Opens extension details:**
   - Clicks "Details anzeigen" (View Details) button
   - Extension approval modal opens

---

#### Step 4.5: Extension Approval Modal
**Modal View:**

```
+---------------------------------------------------------------+
|  Auftragserweiterung prufen                              [X]  |
+---------------------------------------------------------------+
|                                                               |
| Beschreibung:                                                 |
| Bremsbelage vorne und hinten sind verschlissen und           |
| mussen dringend erneuert werden. Bremsscheiben zeigen        |
| Rillen und sollten ebenfalls getauscht werden...             |
|                                                               |
| Positionen:                                                   |
| +-----------------------------------------------------------+ |
| | Bremsbelage vorne              1x    189.99 EUR          | |
| | Bremsbelage hinten             1x    169.99 EUR          | |
| | Bremsscheiben vorne (Paar)     1x    249.99 EUR          | |
| | Bremsscheiben hinten (Paar)    1x    199.99 EUR          | |
| | Arbeitszeit Bremsen          2.5x     89.00 EUR/h        | |
| +-----------------------------------------------------------+ |
|                                                               |
| Fotos:                                                        |
| [IMG] [IMG] [IMG] [IMG]   <- Click to enlarge                |
|                                                               |
| +-----------------------------------------------------------+ |
| | GESAMTPREIS:                           1,032.46 EUR      | |
| +-----------------------------------------------------------+ |
|                                                               |
| [i] Die Zahlung wird sofort verarbeitet. Die Arbeiten        |
|     beginnen nach erfolgreicher Zahlung.                     |
|                                                               |
| [Ablehnen]                          [Genehmigen & Bezahlen]  |
+---------------------------------------------------------------+
```

**Customer Decision Point:**

**Option A: Approve Extension**
**Option B: Decline Extension**

---

#### Step 4.6a: Customer APPROVES Extension
**Duration:** 3-8 minutes (including payment)

**Customer Actions:**
1. Reviews all items and photos carefully
2. Clicks "Genehmigen & Bezahlen" (Approve & Pay)
3. Payment modal appears (Stripe Elements)
4. Enters payment details or uses saved card
5. Confirms payment

**CRITICAL PAYMENT FLOW:**

**System Actions (Backend):**
1. **Creates Payment Intent with Stripe:**
   ```javascript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 103246, // 1,032.46 EUR in cents
     currency: 'eur',
     capture_method: 'manual', // IMPORTANT: Don't charge immediately
     payment_method_types: ['card', 'sepa_debit'],
     metadata: {
       bookingId: 'BK-2026-001234',
       extensionId: 'ext_001234',
       type: 'EXTENSION'
     }
   });
   ```

   **Why manual capture?**
   - Holds the funds (authorization only)
   - Doesn't charge customer immediately
   - Workshop can confirm work is doable
   - If issues arise, authorization can be cancelled
   - Funds are captured only after work is completed

2. **Processes payment authorization:**
   - Customer enters card details
   - Stripe authorizes payment (holds funds)
   - 3D Secure authentication if required

3. **Updates extension status:**
   ```javascript
   extension.status = 'APPROVED';
   extension.approvedAt = new Date();
   extension.paymentIntentId = paymentIntent.id;
   ```

4. **Updates booking:**
   ```javascript
   booking.totalPrice += extension.totalAmount;
   booking.status = 'IN_SERVICE'; // Resumes service
   ```

5. **Sends notifications:**
   - To customer: "Erweiterung genehmigt! Zahlung wird verarbeitet."
   - To workshop: "Erweiterung genehmigt. Sie konnen mit den Arbeiten beginnen."
   - Push notifications sent to both

6. **Sends emails:**

   **To Customer:**
   ```
   Subject: Erweiterung genehmigt BK-2026-001234

   Vielen Dank fur die Genehmigung der Auftragserweiterung.

   Autorisierter Betrag: 1,032.46 EUR

   Die Zahlung wird nach Abschluss der Arbeiten eingezogen.
   Die Werkstatt beginnt nun mit den zusatzlichen Arbeiten.

   Details: [Link]
   ```

   **To Workshop:**
   ```
   Subject: Erweiterung genehmigt BK-2026-001234

   Der Kunde hat die Auftragserweiterung genehmigt.

   Betrag: 1,032.46 EUR (autorisiert)

   Sie konnen nun mit den zusatzlichen Arbeiten beginnen:
   - Bremsbelage vorne und hinten
   - Bremsscheiben vorne und hinten
   - Arbeitszeit

   [View order]
   ```

**UI Updates (Customer Portal):**
- Modal closes
- Success toast appears: "Erweiterung genehmigt! Zahlung autorisiert."
- Extension card updates:
  - Status badge: "Ausstehend" → "Genehmigt" (green)
  - "Details anzeigen" button disappears
  - Shows: "Genehmigt am: 20.02.2026, 14:45 Uhr"
  - Payment status: "Autorisiert" (yellow badge)
- Booking total price updates: +1,032.46 EUR
- Pending badge on Extensions tab disappears

**Workshop View:**
- Extension shows status: APPROVED (green badge)
- Can proceed with additional work
- Shows payment authorization confirmed

---

#### Step 4.6b: Customer DECLINES Extension
**Duration:** 1-3 minutes

**Customer Actions:**
1. Reviews extension in modal
2. Decides work is not needed or too expensive
3. Clicks "Ablehnen" (Decline)
4. Decline reason input field appears (optional but recommended)
5. Enters reason (e.g., "Zu teuer", "Selbst machen", "Nicht notwendig")
6. Clicks "Ablehnung bestatigen" (Confirm decline)

**System Response:**

1. **Updates extension status:**
   ```javascript
   extension.status = 'DECLINED';
   extension.declinedAt = new Date();
   extension.declineReason = "Zu teuer - mochte Angebot einholen";
   ```

2. **NO payment is processed** (no authorization, no charge)

3. **Sends notifications:**
   - To workshop: "Kunde hat Erweiterung abgelehnt"
   - Email with decline reason included

4. **Workshop receives:**
   ```
   Subject: Erweiterung abgelehnt BK-2026-001234

   Der Kunde hat die Auftragserweiterung abgelehnt.

   Grund: "Zu teuer - mochte Angebot einholen"

   Bitte fahren Sie mit dem ursprunglichen Auftrag fort.

   [View order]
   ```

**UI Updates:**
- Modal closes
- Toast: "Erweiterung abgelehnt"
- Extension card updates:
  - Status badge: "Ausstehend" → "Abgelehnt" (red)
  - Shows: "Abgelehnt am: 20.02.2026, 14:50 Uhr"
  - Shows decline reason if provided
- Workshop continues with original service only

**Workshop Next Steps:**
- Completes only the originally booked service
- Does NOT perform the declined additional work
- May contact customer if work is safety-critical

---

#### Step 4.7: Extension Work Execution (After Approval)
**Duration:** Variable (depends on work scope)

**Workshop Actions:**
1. Sees approved extension in dashboard
2. Begins additional work:
   - Replaces brake pads
   - Replaces brake discs
   - Performs brake service
3. Documents completed work with photos
4. Updates work progress
5. Completes extension work

**During Work:**
- Customer can track status
- System shows: "Erweiterung wird durchgefuhrt" (Extension in progress)

**After Completion:**
1. **Workshop captures payment:**
   - Backend captures the authorized payment intent
   ```javascript
   await stripe.paymentIntents.capture(paymentIntent.id);
   ```

2. **System updates:**
   - Extension payment status: AUTHORIZED → CAPTURED
   - Customer charged: 1,032.46 EUR

3. **Notifications sent:**
   - Customer: "Zusatzliche Arbeiten abgeschlossen. Zahlung eingezogen."
   - Receipt email sent

**Customer View:**
- Extension card shows: "Abgeschlossen" (Completed) - green badge
- Payment status: "Bezahlt" (Paid) - green badge
- Can view before/after photos

---

### Phase 5: Service Completion

#### Step 5.1: Workshop Completes All Work
**Duration:** 5-10 minutes (documentation)

**Workshop Actions:**
1. Finishes all service work (original + extensions if any)
2. **Documents completion:**
   - Takes "after" photos of completed work
   - Uploads photos to system
   - Adds completion notes
   - Records actual completion time
3. Updates booking status:
   - Clicks "Service abschließen" (Complete service)
   - Status changes: IN_SERVICE → COMPLETED
4. **Prepares vehicle for pickup:**
   - Washes vehicle (if included)
   - Parks in ready-for-pickup area
   - Hands keys to jockey coordinator

**System Response:**
1. Updates booking status in database
2. Creates jockey assignment for delivery
3. Sends notifications:
   - To customer: "Service abgeschlossen! Fahrzeug ist bereit."
   - To jockey: New delivery assignment
   - Push notifications sent
4. Generates service report PDF
5. Requests review from customer

**Customer Notification:**
```
Subject: Service abgeschlossen BK-2026-001234

Gute Nachrichten! Ihr BMW 3er ist fertig.

Ausgefuhrte Arbeiten:
- Inspektion (Original)
- Bremsbelage erneuert (Erweiterung)
- Bremsscheiben erneuert (Erweiterung)

Ihr Fahrzeug wird wie geplant zuruckgebracht:
Datum: 22.02.2026
Zeit: 17:00-19:00 Uhr
Adresse: Musterstrasse 123, 58453 Witten

Jockey: Max Mustermann

[View service report]
```

---

#### Step 5.2: Vehicle Delivery (Return to Customer)
**Duration:** 15-30 minutes

**Jockey Actions:**
1. **Views delivery assignment** on jockey dashboard
   - Customer address
   - Delivery time window
   - Vehicle details and location at workshop

2. **Picks up vehicle from workshop:**
   - Retrieves keys from workshop
   - Inspects vehicle condition
   - Takes delivery photos (4 angles)

3. **Picks up Ronja from customer:**
   - Drives customer vehicle to customer address
   - Arrives in delivery time window

4. **Vehicle return process:**
   - Customer inspects returned vehicle
   - Jockey explains work performed
   - Shows before/after photos on tablet
   - **Customer signs digital signature** (vehicle received)

5. **Ronja return:**
   - Customer returns Ronja keys
   - Jockey inspects Ronja condition
   - Takes photos if any damage to Ronja
   - **Customer signs digital signature** (Ronja returned)

6. **Completes delivery:**
   - Uploads all photos and signatures
   - Updates status: "Zustellung abgeschlossen"
   - Returns to base

**System Response:**
1. Updates booking status: COMPLETED → DELIVERED
2. Sends final notifications:
   - Customer: "Fahrzeug wurde zugestellt!"
   - Workshop: "Auftrag abgeschlossen"
3. Archives booking
4. Triggers review request (after 24 hours)

**Customer View:**
- Booking status: "Abgeschlossen" (Completed) - green badge
- Can view all service photos
- Can download service report PDF
- Can view and download receipt
- Review request appears

---

### Phase 6: Post-Service Follow-up

#### Step 6.1: Review Request
**Timing:** 24 hours after delivery
**Duration:** N/A (automated)

**System Actions:**
1. Sends review request email:
   ```
   Subject: Wie war Ihr Service? BK-2026-001234

   Lieber Kunde,

   Wir hoffen, Sie sind zufrieden mit unserem Service!

   Wurden Sie uns weiterempfehlen?

   [5 stars rating]

   Ihre Meinung hilft uns, besser zu werden.

   [Jetzt bewerten]
   ```

2. Shows review prompt in customer portal
3. Sends push notification (if enabled)

**Customer Actions:**
1. Opens review link
2. Rates service (1-5 stars)
3. Writes optional text review
4. Selects aspects (Qualitat, Pünktlichkeit, Freundlichkeit)
5. Submits review

**System Response:**
- Saves review to database
- Sends thank-you email
- Updates workshop rating
- May display on public reviews page
- Closes booking lifecycle

---

#### Step 6.2: Service History
**Location:** Customer portal `/customer/bookings`

**Customer Can:**
1. View all past bookings
2. Download service reports
3. Download receipts
4. View service photos
5. Book repeat service (quick rebooking)
6. Save vehicle for future bookings

**Data Retention:**
- Booking history: Indefinite
- Service photos: 2 years
- Payment receipts: 10 years (legal requirement)

---

## Payment Touchpoints

### Summary of All Payment Events

| Event | Amount | Type | Timing | Capture Method |
|-------|--------|------|--------|----------------|
| Initial Booking | Base service price (e.g., 171.35 EUR) | Immediate charge | At booking confirmation | Automatic |
| Extension Approval | Extension amount (e.g., 1,032.46 EUR) | Authorization hold | When customer approves | Manual (capture later) |
| Extension Completion | Same as authorization | Charge capture | After work completed | Manual capture |

### Payment Architecture

**Demo Mode vs Production Mode:**

In **demo mode** (using Stripe test keys), all payments use test cards and no real charges occur. The payment flow is identical to production, but uses Stripe's test environment.

In **production mode** (using Stripe live keys), real payments are processed and customers are charged.

**1. Initial Booking Payment:**
```javascript
// Automatic capture (immediate charge)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 17135, // 171.35 EUR in cents
  currency: 'eur',
  capture_method: 'automatic', // Charge immediately
  metadata: {
    bookingId: 'BK-2026-001234',
    type: 'BOOKING'
  }
});

// In demo mode: Uses test key (sk_test_...) with test card (4242 4242 4242 4242)
// In production: Uses live key (sk_live_...) with real card
```

**2. Extension Payment:**
```javascript
// Manual capture (authorization hold)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 103246, // 1,032.46 EUR in cents
  currency: 'eur',
  capture_method: 'manual', // Hold funds, charge later
  metadata: {
    bookingId: 'BK-2026-001234',
    extensionId: 'ext_001234',
    type: 'EXTENSION'
  }
});

// Later, after work is completed:
await stripe.paymentIntents.capture(paymentIntent.id);

// In demo mode: Authorization and capture are simulated
// In production: Real authorization hold and capture
```

**Why Manual Capture for Extensions?**
1. Customer approves before seeing final work quality
2. Workshop might find work is more/less extensive
3. Provides flexibility to adjust amount if needed
4. Funds are held (guaranteed) but not charged yet
5. Better customer protection
6. Can cancel authorization if work cannot be done

**Authorization Hold Duration:**
- Card authorization: 7 days (Stripe default)
- Must capture before authorization expires
- If expires, must request new authorization

### Payment Security

**PCI Compliance:**
- Card data never touches our servers
- Stripe Elements handles all sensitive data
- HTTPS required for all payment pages
- Client secret is single-use token

**Fraud Prevention:**
- 3D Secure authentication for EU cards (PSD2 requirement)
- Stripe Radar for fraud detection
- Address verification (AVS)
- CVC verification

**Customer Protection:**
- Manual capture for extensions (authorize first, charge later)
- Clear pricing before payment
- Detailed receipts
- Refund capability through Stripe

---

## Notification System

### Notification Channels

1. **Push Notifications (Real-time)**
   - Technology: Firebase Cloud Messaging (FCM)
   - Platforms: Web, iOS, Android
   - Delivery: Instant (< 1 second)
   - Requires: User permission + FCM token

2. **Email Notifications**
   - All users receive email by default
   - Transactional emails (cannot opt-out)
   - Marketing emails (can opt-out)

3. **SMS Notifications (Optional)**
   - High-priority events only
   - Requires phone number
   - Additional cost

4. **In-App Notifications**
   - Bell icon with badge count
   - Notification center popover
   - Full notifications page
   - Persistent across sessions

### Notification Types and Priorities

| Type | Priority | Channels | Trigger |
|------|----------|----------|---------|
| BOOKING_CONFIRMED | HIGH | Push + Email | After payment success |
| PICKUP_REMINDER | HIGH | Push + Email + SMS | 24h before pickup |
| PICKUP_COMPLETED | MEDIUM | Push + Email | After jockey completes pickup |
| VEHICLE_AT_WORKSHOP | LOW | Push + Email | Vehicle arrives at workshop |
| SERVICE_STARTED | MEDIUM | Push + Email | Workshop starts service |
| EXTENSION_CREATED | **CRITICAL** | Push + Email | Workshop creates extension |
| EXTENSION_APPROVED | HIGH | Email | Customer approves extension |
| EXTENSION_DECLINED | MEDIUM | Email | Customer declines extension |
| SERVICE_COMPLETED | HIGH | Push + Email | Workshop completes service |
| DELIVERY_SCHEDULED | MEDIUM | Push + Email | Jockey assigned for delivery |
| DELIVERY_COMPLETED | HIGH | Push + Email | Vehicle delivered to customer |
| REVIEW_REQUEST | LOW | Email | 24h after delivery |

### Notification Content Examples

**Extension Created (Critical):**
```json
{
  "type": "EXTENSION_CREATED",
  "priority": "high",
  "title": "Auftragserweiterung erforderlich",
  "body": "Ihre Werkstatt hat zusätzliche Arbeiten vorgeschlagen (1,032.46 EUR)",
  "data": {
    "bookingId": "BK-2026-001234",
    "extensionId": "ext_001234",
    "amount": 1032.46,
    "action": "OPEN_EXTENSION",
    "url": "/customer/bookings/BK-2026-001234?tab=extensions"
  },
  "badge": true,
  "sound": "default",
  "icon": "/icons/notification-warning.png"
}
```

### Notification Preferences (Customer Settings)

**Default Settings:**
- Booking confirmations: Email + Push
- Status updates: Email + Push
- Extensions: Email + Push + SMS (critical)
- Marketing: Email only

**Customizable:**
- Enable/disable push notifications
- Enable/disable email notifications
- Enable/disable SMS (if phone provided)
- Quiet hours (no push 22:00-08:00)

---

## Status Lifecycle

### Booking Status Flow

The booking progresses through these statuses during its lifecycle:

```
PAYMENT_PENDING (initial state after booking created)
    ↓ (payment successful via Stripe)
CONFIRMED (booking paid, pickup assignment auto-created)
    ↓ (24h before scheduled pickup time)
PICKUP_SCHEDULED (reminder sent to customer and jockey)
    ↓ (jockey starts pickup and collects vehicle)
IN_TRANSIT_TO_WORKSHOP (vehicle being transported)
    ↓ (vehicle arrives at workshop location)
AT_WORKSHOP (workshop receives vehicle)
    ↓ (workshop technician starts service work)
IN_SERVICE (service in progress)
    ↓ (if extension needed) ←→ EXTENSION_PENDING (service paused)
    ↓ (workshop marks work as complete)
COMPLETED (service finished, return assignment auto-created)
    ↓ (jockey completes return delivery)
DELIVERED (vehicle returned to customer)
    ↓ (after 30 days for archival)
ARCHIVED (historical record)
```

**Status Transition Details:**

| From Status | To Status | Trigger | Automated? | Side Effects |
|-------------|-----------|---------|------------|--------------|
| PAYMENT_PENDING | CONFIRMED | Payment success webhook | Yes | Creates pickup assignment |
| CONFIRMED | PICKUP_SCHEDULED | 24h before pickup | Yes (cron) | Sends reminders |
| PICKUP_SCHEDULED | IN_TRANSIT_TO_WORKSHOP | Jockey starts pickup | No (manual) | Updates jockey assignment |
| IN_TRANSIT_TO_WORKSHOP | AT_WORKSHOP | Vehicle arrives | No (manual) | Notifies workshop |
| AT_WORKSHOP | IN_SERVICE | Workshop starts work | No (manual) | Updates estimated completion |
| IN_SERVICE | EXTENSION_PENDING | Extension created | Yes | Pauses service, notifies customer |
| EXTENSION_PENDING | IN_SERVICE | Extension approved/declined | No (manual) | Resumes service |
| IN_SERVICE | COMPLETED | Workshop completes | No (manual) | Creates return assignment, captures extension payments |
| COMPLETED | DELIVERED | Jockey completes return | No (manual) | Triggers review request (24h delay) |
| DELIVERED | ARCHIVED | Archive cron job | Yes (cron) | Moves to archive table |

**Critical Status Notes:**

1. **CONFIRMED**: This is when the booking becomes "active". The pickup assignment MUST be created exactly once (check for duplicate assignment bug).

2. **IN_SERVICE → EXTENSION_PENDING**: Service is paused when an extension is created. Workshop cannot mark as COMPLETED until extension is approved or declined.

3. **COMPLETED**: Triggers two critical actions:
   - Auto-captures all approved extension payments
   - Creates exactly one return assignment (check for duplicates)

4. **DELIVERED**: Final customer-facing status. After this, only internal archival happens.

### Extension Status Flow

Extensions follow a simpler lifecycle focused on payment authorization and capture:

```
PENDING (workshop created, customer notified)
    ↓ (customer makes decision)
    ├─→ APPROVED (payment authorized, funds held)
    │       ↓ (workshop completes additional work)
    │   COMPLETED (payment captured, customer charged)
    │
    └─→ DECLINED (no payment, workshop continues with original scope)
```

**Extension Payment Flow:**

1. **PENDING**:
   - Workshop creates extension with itemized costs
   - Customer receives notification with photos/details
   - No payment action yet

2. **APPROVED**:
   - Customer approves and authorizes payment
   - Stripe creates PaymentIntent with `capture_method: 'manual'`
   - Funds are held (authorized) but NOT charged
   - Workshop can now proceed with additional work
   - Payment authorization valid for 7 days

3. **COMPLETED**:
   - Workshop marks extension work as complete
   - System automatically captures the authorized payment
   - Customer is now charged
   - Extension status remains APPROVED (paid)
   - paidAt timestamp is set

4. **DECLINED**:
   - Customer declines extension
   - No payment authorization created
   - Workshop continues with original booking scope only
   - Optional decline reason stored

**Extension Payment Capture Timing:**

The auto-capture happens when:
- Workshop marks booking as COMPLETED (all work done)
- System finds all APPROVED extensions with paymentIntentId
- Calls `stripe.paymentIntents.capture()` for each
- Updates extension paidAt timestamp

**Why Manual Capture?**

1. Customer approves before seeing final work quality
2. Workshop might find work is more/less extensive than estimated
3. Provides flexibility to adjust or cancel before charging
4. Captures are guaranteed (funds held) but not yet charged
5. Better customer protection and trust

### Status Badge Colors (UI)

Visual representation of booking and extension statuses in the UI:

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| PAYMENT_PENDING | Yellow | Clock | Awaiting payment confirmation |
| CONFIRMED | Green | CheckCircle | Booking paid and confirmed |
| PICKUP_SCHEDULED | Blue | Calendar | Pickup reminder sent |
| IN_TRANSIT_TO_WORKSHOP | Blue | Truck | Vehicle being transported |
| AT_WORKSHOP | Purple | Wrench | Vehicle at workshop |
| IN_SERVICE | Orange | Settings | Service work in progress |
| COMPLETED | Green | CheckCircle | Service finished, ready for return |
| DELIVERED | Green | Check | Vehicle returned to customer |
| EXTENSION_PENDING | Yellow | AlertTriangle | Extension awaiting customer approval |
| EXTENSION_APPROVED | Green | CheckCircle | Extension approved, payment authorized |
| EXTENSION_DECLINED | Red | XCircle | Extension declined by customer |
| EXTENSION_PAID | Green | Check | Extension payment captured |

**Payment Status Badges:**

For extensions, we show both extension status AND payment status:

| Payment Status | Badge Text | Color | When Shown |
|----------------|-----------|-------|------------|
| AUTHORIZED | "Autorisiert" | Yellow | After customer approves, before work complete |
| CAPTURED | "Bezahlt" | Green | After workshop completes work and payment captured |
| FAILED | "Fehlgeschlagen" | Red | If payment authorization or capture fails |

**Example UI Display:**

```
Extension #1
-----------
Status: [APPROVED] (Green badge)
Payment: [Autorisiert] (Yellow badge)

After work completion:
Status: [APPROVED] (Green badge)
Payment: [Bezahlt] (Green badge)
```

---

## Alternative Paths and Edge Cases

### 1. Customer Cancellation

**Before Pickup:**
- Customer can cancel up to 24h before pickup
- Full refund minus processing fee (10 EUR)
- System updates: Status → CANCELLED
- Notifications sent to workshop and jockey

**After Pickup:**
- Cannot cancel through portal
- Must contact support
- Partial refund possible depending on work started

### 2. No-Show at Pickup

**Jockey arrives, customer not available:**
1. Jockey calls customer (3 attempts)
2. Waits 15 minutes
3. If no response:
   - Updates status: PICKUP_FAILED
   - Takes photo evidence (no one home)
   - Returns to base
4. System sends notification to customer
5. Automatic rescheduling offered
6. Fee charged for failed pickup (25 EUR)

### 3. Vehicle Damage During Service

**Damage discovered at workshop:**
1. Workshop takes photos immediately
2. Creates incident report
3. Notifies customer via email + phone
4. Logs in system with evidence
5. Insurance claim process begins
6. Service continues or pauses depending on severity

**Damage during delivery:**
1. Jockey documents in delivery photos
2. Compares with pickup photos
3. Reports incident immediately
4. Customer signs damage acknowledgment
5. Insurance claim filed

### 4. Payment Failure

**Initial Payment Fails:**
- Booking not created
- Customer sees error message
- Retry payment offered
- Alternative payment methods suggested

**Extension Payment Authorization Fails:**
- Extension marked as PAYMENT_FAILED
- Customer notified to update payment method
- Workshop notified to pause additional work
- Original service continues

**Extension Capture Fails:**
- Work already completed (problem!)
- System retries capture 3 times
- If still fails, creates invoice
- Customer contacted for alternative payment

### 5. Extension After Extension

**Multiple extensions possible:**
- Workshop can create multiple extensions
- Each extension approved separately
- Each has separate payment authorization
- Customer sees list of all extensions
- Total price accumulates

**Example:**
- Original booking: 171.35 EUR
- Extension 1 (brakes): +1,032.46 EUR
- Extension 2 (oil leak): +349.99 EUR
- Total: 1,553.80 EUR

### 6. Emergency Extension (Safety Critical)

**Workshop finds safety issue:**
1. Creates extension marked as "URGENT"
2. Calls customer immediately (don't wait for portal)
3. Explains safety risk
4. Customer approves verbally + in portal
5. Payment processed
6. Work proceeds immediately

### 7. Customer Requests Modification During Service

**Customer wants to add service:**
- Contacts workshop via phone/email
- Workshop creates extension
- Normal extension approval flow
- OR workshop suggests waiting for next service

**Customer wants to remove service:**
- Not possible if work already started
- Partial refund if not started
- Must contact support

### 8. Workshop Cannot Complete Service

**Parts not available:**
1. Workshop notifies customer
2. Offers options:
   - Wait for parts (delayed delivery)
   - Cancel extension (refund authorization)
   - Complete partial work
3. Customer decides
4. Refund processed if applicable

**Technical issue beyond scope:**
1. Workshop creates detailed report
2. Recommends specialist
3. Completes what's possible
4. Partial refund if applicable
5. Customer schedules with specialist

### 9. Ronja (Replacement Vehicle) Issues

**Ronja not available:**
- Backup vehicle provided
- Same quality guaranteed
- Customer notified

**Ronja damaged by customer:**
- Jockey documents damage at return
- Photos uploaded to system
- Insurance claim filed
- Damage fee charged to customer
- Customer receives damage invoice

### 10. Weather/Force Majeure

**Severe weather prevents pickup:**
1. System sends rescheduling notification
2. Jockey cannot safely drive
3. Automatic rescheduling offered
4. No fee charged to customer
5. Booking updated with new date

---

## Success Metrics (KPIs)

### Customer Experience
- Booking completion rate: Target >85%
- Extension approval rate: Target >60%
- Customer satisfaction (NPS): Target >70
- Review rating: Target >4.5/5
- Repeat booking rate: Target >40%

### Operational Efficiency
- Average service duration: Target <4 hours
- On-time pickup rate: Target >95%
- On-time delivery rate: Target >95%
- Extension creation rate: ~30% of bookings (expected)

### Financial
- Average booking value: 150-250 EUR
- Average extension value: 500-1,500 EUR
- Payment success rate: Target >98%
- Payment authorization capture rate: Target >99%

---

## Technical Implementation Notes

### Key Technologies
- **Frontend:** Next.js 14, TypeScript, React, Tailwind CSS
- **Payment:** Stripe (PaymentIntents API with manual capture)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Authentication:** JWT tokens
- **File Storage:** Cloud storage for photos/documents
- **Multi-language:** i18n with German/English support

### API Endpoints Summary

**Customer:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/:id/extensions` - Get extensions
- `POST /api/bookings/:id/extensions/:extId/approve` - Approve extension
- `POST /api/bookings/:id/extensions/:extId/decline` - Decline extension
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/history` - Get notification history

**Workshop:**
- `GET /api/workshops/orders` - Get all orders
- `PATCH /api/workshops/orders/:id/status` - Update status
- `POST /api/workshops/orders/:id/extensions` - Create extension
- `POST /api/workshops/orders/:id/complete` - Complete service

**Jockey:**
- `GET /api/jockeys/assignments` - Get assignments
- `PATCH /api/jockeys/assignments/:id/complete` - Complete task
- `POST /api/jockeys/assignments/:id/photos` - Upload photos
- `POST /api/jockeys/assignments/:id/signature` - Upload signature

**Payment:**
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/capture` - Capture authorized payment
- `GET /api/payment/status/:intentId` - Get payment status

---

## Appendix: Testing Coverage

### E2E Test Suite

The system has comprehensive E2E test coverage using Playwright:

**Test Categories:**
- Authentication: 25 tests
- Booking flow: 31 tests
- Workshop dashboard: 26 tests
- Extension approval: 15 tests
- Extension integration: 9 tests
- Internationalization: 36 tests
- Components: 29 tests
- Visual regression: 21 tests
- **Complete journey: 9 tests** (NEW)

**Total: 176 test cases**

### Key E2E Tests

#### 1. Complete Booking Journey Test
**File:** `/frontend/e2e/01-complete-booking-journey.spec.ts`

**Purpose:** Validates the entire customer lifecycle from registration to delivery in demo mode.

**Test Steps:**
1. Customer registration (required)
2. Booking creation (vehicle + service + scheduling)
3. Demo payment with Stripe test card
4. Verify booking status CONFIRMED
5. Verify pickup assignment created (exactly 1)
6. Jockey completes pickup
7. Workshop creates extension
8. Customer approves extension with payment
9. Verify payment AUTHORIZED
10. Workshop completes service
11. Verify extension payment AUTO-CAPTURED
12. Verify return assignment created (exactly 1)
13. Jockey completes return
14. Verify final status DELIVERED

**Duration:** < 3 minutes
**Assertions:** 14 critical checkpoints
**Coverage:** Full customer lifecycle

**Run Command:**
```bash
cd frontend
npx playwright test e2e/01-complete-booking-journey.spec.ts --headed
```

#### 2. Demo Smoke Test
**File:** `/frontend/e2e/00-demo-smoke-test.spec.ts`

**Purpose:** Quick validation of demo mode functionality.

**Key Validations:**
- ✅ Booking auto-confirms with test payment
- ✅ Exactly 1 pickup assignment (checks for duplicates)
- ✅ Extension approval with fake payment authorization
- ✅ Auto-capture on service completion
- ✅ Exactly 1 return assignment (checks for duplicates)

**Duration:** < 5 minutes

**Run Command:**
```bash
npx playwright test e2e/00-demo-smoke-test.spec.ts --headed
```

### Test Users

**Customer:**
- Email: `demo-customer-{timestamp}@test.com` (generated per test)
- Password: DemoTest123!
- Name: Demo Customer
- Phone: +49 170 1234567

**Jockey:**
- Username: jockey-1
- Password: jockey123
- Email: jockey@test.com

**Workshop:**
- Username: werkstatt-witten
- Password: werkstatt123
- Email: werkstatt@test.com

### Test Helpers

**File:** `/frontend/e2e/helpers/demo-helpers.ts`

**Available Functions:**
- `fillStripeTestCard()` - Fills Stripe payment form
- `waitForBookingStatus()` - Polls booking status until reached
- `waitForExtensionStatus()` - Polls extension status
- `verifyStatusBadge()` - Verifies status badge visibility
- `countAssignments()` - Counts pickup/return assignments (duplicate detection)
- `demoPayBooking()` - Simulates payment via API
- `demoAuthorizeExtension()` - Authorizes extension payment
- `demoCaptureExtension()` - Captures extension payment
- `getBookingDetails()` - Fetches booking from API

### Running Tests

**Run all tests:**
```bash
cd frontend
npx playwright test
```

**Run specific test:**
```bash
npx playwright test e2e/01-complete-booking-journey.spec.ts
```

**Run with UI visible (headed mode):**
```bash
npx playwright test --headed
```

**Run with debug mode:**
```bash
npx playwright test --debug
```

**Generate HTML report:**
```bash
npx playwright show-report
```

### Test Configuration

**File:** `/frontend/playwright.config.ts`

**Settings:**
- Base URL: http://localhost:3000
- Timeout: 60 seconds per test
- Retries: 2 on CI, 0 locally
- Workers: 1 (sequential execution)
- Browser: Chromium (desktop + mobile)
- Locale: de-DE
- Timezone: Europe/Berlin
- Screenshots: On failure
- Videos: On failure
- Traces: On first retry

### CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    cd frontend
    npx playwright install --with-deps
    npx playwright test
  env:
    PLAYWRIGHT_BASE_URL: http://localhost:3000
    PLAYWRIGHT_API_URL: http://localhost:5001
```

### Test Coverage Goals

- ✅ Complete booking lifecycle
- ✅ Payment flows (initial + extensions)
- ✅ Status transitions
- ✅ Assignment creation (pickup + return)
- ✅ Multi-user interactions (customer, jockey, workshop)
- ✅ Demo mode functionality
- ✅ Error handling
- ✅ Mobile responsiveness
- ✅ Multi-language (DE/EN)

See `/frontend/e2e/README.md` for complete testing documentation.

---

## Document Control

**Version:** 1.0
**Created:** February 1, 2026
**Created by:** Product Owner (Claude)
**Last updated:** February 1, 2026
**Next review:** March 1, 2026

**Change Log:**
- v1.0 (2026-02-01): Initial comprehensive E2E flow documentation

**Distribution:**
- Product Management
- Engineering Team
- QA Team
- Stakeholders
- Customer Support

---

**END OF DOCUMENT**
