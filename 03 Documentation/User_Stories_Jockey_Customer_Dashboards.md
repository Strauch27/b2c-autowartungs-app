# User Stories: Jockey Dashboard & Customer Dashboard
**B2C Autowartungs-App (AutoConcierge)**

---

**Document Version:** 1.0
**Date:** February 1, 2026
**Author:** Product Owner
**Status:** Ready for Development

---

## Table of Contents

1. [Overview](#overview)
2. [User Personas](#user-personas)
3. [Epic 1: Customer Dashboard - Extension Approval (HIGH PRIORITY)](#epic-1-customer-dashboard---extension-approval-high-priority)
4. [Epic 2: Jockey Dashboard - Pickup & Delivery Workflows](#epic-2-jockey-dashboard---pickup--delivery-workflows)
5. [Epic 3: Customer Dashboard - Booking Management](#epic-3-customer-dashboard---booking-management)
6. [Epic 4: Real-time Status Updates](#epic-4-real-time-status-updates)
7. [Acceptance Criteria Summary](#acceptance-criteria-summary)
8. [Technical Dependencies](#technical-dependencies)

---

## Overview

This document defines user stories for two critical dashboards that enable the core business workflows of the AutoConcierge platform:

1. **Customer Dashboard** - Enables customers to track bookings and approve service extensions (critical revenue path)
2. **Jockey Dashboard** - Enables concierge drivers to execute vehicle pickup and delivery operations

### Business Context

**Why These Matter:**
- Extension approval is the CRITICAL revenue path - customers must approve and pay for additional work before workshop proceeds
- Jockey workflows enable the key differentiator (concierge pickup/delivery service)
- Both dashboards are blocking 248 E2E tests from passing

**Current Status:**
- Authentication: Implemented and working
- Backend APIs: Partially ready
- UI Implementation: Basic structure exists, features missing
- E2E Tests: Written and waiting for implementation

---

## User Personas

### Persona 1: Max Müller (Customer)

**Demographics:**
- Age: 35-45
- Occupation: Office professional
- Tech savvy: Medium
- Location: Witten, Germany

**Goals:**
- Minimize time spent on car maintenance
- Transparent pricing with no surprises
- Track service progress remotely
- Understand and approve additional costs before they're charged

**Pain Points:**
- Dislikes unexpected charges
- No time to visit workshop during work hours
- Wants photo evidence of work performed
- Concerned about authorization holds on credit card

**Access:**
- Email: test@example.com
- Password: customer123
- Portal: /customer/dashboard

---

### Persona 2: Anna Schmidt (Jockey / Concierge Driver)

**Demographics:**
- Age: 25-35
- Occupation: Concierge driver
- Tech savvy: Medium-High
- Location: Witten area

**Goals:**
- Complete assigned pickups/deliveries efficiently
- Document vehicle condition accurately
- Minimize customer wait time
- Navigate to addresses quickly
- Capture all required signatures and photos

**Pain Points:**
- Customers not available during scheduled time
- Needs mobile-friendly interface (uses phone/tablet)
- Must document everything for liability
- Time pressure (multiple assignments per day)

**Access:**
- Username: jockey-1
- Password: jockey123
- Portal: /jockey/dashboard

---

## EPIC 1: Customer Dashboard - Extension Approval (HIGH PRIORITY)

**Epic Description:**
As a customer, I need to review, approve, and pay for service extensions so that the workshop can proceed with additional work discovered during service.

**Business Value:**
CRITICAL - This is the primary revenue expansion mechanism. Without this workflow, workshop cannot charge for additional work, directly impacting revenue.

**Priority:** P0 (Highest)

**User Journey:**
Workshop discovers issue → Creates extension → Customer receives notification → Customer reviews details with photos → Customer approves and authorizes payment → Workshop proceeds with work → Payment captured after completion

---

### User Story 1.1: Receive Extension Notification

**As a** customer
**I want to** receive real-time notifications when the workshop creates an extension
**So that** I can review and respond promptly without delaying my service

**Acceptance Criteria:**

- [ ] **Given** workshop creates an extension for my booking
      **When** the extension is submitted
      **Then** I see a red badge with count on the bell icon in the header

- [ ] **Given** I have pending extension notifications
      **When** I click the bell icon
      **Then** a notification center popover opens showing extension notifications with orange warning icon

- [ ] **Given** extension notification is displayed
      **When** I view the notification
      **Then** I see "Auftragserweiterung erforderlich" (DE) or "Extension Required" (EN)

- [ ] **Given** extension notification is displayed
      **When** I view the notification details
      **Then** I see total extension amount prominently (e.g., "1,032.46 EUR")

- [ ] **Given** I click on extension notification
      **When** navigation completes
      **Then** I land on booking detail page with Extensions tab automatically selected

- [ ] **Given** extension is approved or declined
      **When** status changes
      **Then** notification badge count decrements and notification shows resolved status

**Technical Notes:**
- API: GET /api/notifications/unread-count
- API: GET /api/notifications/history
- Component: NotificationCenter.tsx (already exists)
- WebSocket or polling for real-time updates
- FCM integration for push notifications

**Definition of Done:**
- [ ] Bell icon shows correct unread count
- [ ] Popover displays extension notifications with correct styling
- [ ] Click navigation works to booking detail page
- [ ] Real-time updates when extension created
- [ ] E2E test passing: "should show extension in notification center when created"
- [ ] Manual testing on mobile and desktop
- [ ] Code reviewed and merged

---

### User Story 1.2: View Extension Details

**As a** customer
**I want to** view complete extension details including itemized costs and photos
**So that** I can make an informed decision about approving the additional work

**Acceptance Criteria:**

- [ ] **Given** I navigate to booking detail page with pending extension
      **When** I view the Extensions tab
      **Then** I see extension card with "AUSSTEHEND" (Pending) badge in yellow/orange

- [ ] **Given** extension card is displayed
      **When** I view the card
      **Then** I see: creation date/time, description preview (first 100 chars), total price, number of items, thumbnail photos

- [ ] **Given** I am on Extensions tab
      **When** I click "Details anzeigen" (View Details) button
      **Then** extension approval modal opens

- [ ] **Given** extension approval modal is open
      **When** modal displays
      **Then** I see complete description (full text, scrollable if long)

- [ ] **Given** extension approval modal is open
      **When** I view items section
      **Then** I see table with columns: Description, Quantity, Unit Price, Total

- [ ] **Given** extension has items
      **When** I view items list
      **Then** I see all items with correct calculations (quantity × unit price = total)

- [ ] **Given** extension has items
      **When** I view the bottom of items section
      **Then** I see bold "GESAMTPREIS: X,XXX.XX EUR" with correct total sum

- [ ] **Given** extension has photos/videos
      **When** I view media section
      **Then** I see grid of thumbnails (max 10 photos, 2 videos)

- [ ] **Given** I click on photo thumbnail
      **When** image loads
      **Then** lightbox/fullscreen view opens for closer inspection

- [ ] **Given** extension has videos
      **When** I click video thumbnail
      **Then** video player opens with play controls

**Technical Notes:**
- API: GET /api/bookings/:id/extensions
- Component: ExtensionApprovalModal.tsx (create new)
- Component: ExtensionCard.tsx (create new)
- Image viewer: Use existing lightbox component or library (react-image-lightbox)
- Video player: HTML5 video element with controls
- Currency formatting: Use Intl.NumberFormat for EUR
- Date formatting: Use language-aware date formatting (de-DE/en-US)

**Definition of Done:**
- [ ] Extension tab shows pending extensions with badge count
- [ ] Extension card displays all summary information
- [ ] Modal opens with full details
- [ ] Itemized table calculates correctly
- [ ] Photos open in lightbox
- [ ] Videos playable
- [ ] Responsive on mobile
- [ ] E2E test passing: "should display extension approval modal"
- [ ] Code reviewed and merged

---

### User Story 1.3: Approve Extension with Payment Authorization

**As a** customer
**I want to** approve the extension and authorize payment in a single action
**So that** the workshop can proceed with work knowing payment is secured

**Acceptance Criteria:**

- [ ] **Given** I am viewing extension details in modal
      **When** I am ready to approve
      **Then** I see green "Genehmigen & Bezahlen" (Approve & Pay) button at bottom

- [ ] **Given** I click "Genehmigen & Bezahlen"
      **When** button is clicked
      **Then** Stripe payment elements modal/form appears

- [ ] **Given** payment form is displayed
      **When** I view the form
      **Then** I see total amount to be authorized (not charged immediately)

- [ ] **Given** payment form is displayed
      **When** I view payment methods
      **Then** I can select: Credit/Debit Card, SEPA Direct Debit, or Sofort

- [ ] **Given** I enter valid payment details
      **When** I confirm payment
      **Then** Stripe processes authorization (manual capture mode)

- [ ] **Given** payment authorization is processing
      **When** Stripe returns success
      **Then** I see success toast "Erweiterung genehmigt! Zahlung autorisiert."

- [ ] **Given** payment authorization succeeds
      **When** UI updates
      **Then** modal closes and extension card shows "GENEHMIGT" (Approved) badge in green

- [ ] **Given** payment authorization succeeds
      **When** extension status updates
      **Then** "Details anzeigen" button is replaced with "Genehmigt am: [date/time]"

- [ ] **Given** payment authorization succeeds
      **When** I view payment status
      **Then** I see "Autorisiert" (Authorized) badge in yellow (not yet charged)

- [ ] **Given** payment authorization succeeds
      **When** I view booking total
      **Then** total price includes extension amount

- [ ] **Given** payment authorization requires 3D Secure
      **When** Stripe triggers 3DS
      **Then** I complete authentication and authorization proceeds

- [ ] **Given** payment authorization fails
      **When** error occurs (card declined, insufficient funds, etc.)
      **Then** I see error message with reason and option to retry

**Technical Notes:**
- API: POST /api/bookings/:id/extensions/:extId/approve
- Stripe: PaymentIntent with capture_method: 'manual'
- Stripe: Support 3D Secure (SCA/PSD2 compliance)
- Component: PaymentForm.tsx (may exist, reuse or adapt)
- Error handling: Map Stripe error codes to user-friendly messages
- Loading states: Show spinner during authorization
- Toast notifications: Success and error states

**Payment Flow:**
1. Customer clicks approve
2. Frontend creates PaymentIntent (manual capture)
3. Customer enters payment details (Stripe Elements)
4. Stripe authorizes payment (holds funds, doesn't charge)
5. Backend updates extension status to APPROVED
6. Backend stores paymentIntentId
7. Workshop completes work
8. Backend captures payment (actual charge)

**Definition of Done:**
- [ ] Payment authorization flow works end-to-end
- [ ] Manual capture configured correctly (not auto-charge)
- [ ] 3D Secure authentication works
- [ ] Error handling for all payment failure scenarios
- [ ] Success confirmation displayed
- [ ] Extension status updates in UI
- [ ] Booking total recalculated
- [ ] E2E test passing: "extension approval with payment"
- [ ] Manual testing with test cards (success, decline, 3DS)
- [ ] Code reviewed and merged

---

### User Story 1.4: Decline Extension with Reason

**As a** customer
**I want to** decline an extension with an optional reason
**So that** the workshop knows I don't want the additional work and can proceed with original service only

**Acceptance Criteria:**

- [ ] **Given** I am viewing extension details in modal
      **When** I decide not to approve
      **Then** I see "Ablehnen" (Decline) button in secondary/outline style

- [ ] **Given** I click "Ablehnen"
      **When** button is clicked
      **Then** decline reason input appears (textarea, optional)

- [ ] **Given** decline reason input is shown
      **When** I view the input
      **Then** I see placeholder "Grund fur Ablehnung (optional)" or similar

- [ ] **Given** I enter decline reason
      **When** I type in textarea
      **Then** character count shows (max 500 characters)

- [ ] **Given** I have entered reason (or left blank)
      **When** I click "Ablehnung bestatigen" (Confirm Decline)
      **Then** extension is declined without any payment processing

- [ ] **Given** extension is declined
      **When** API responds successfully
      **Then** modal closes and I see toast "Erweiterung abgelehnt"

- [ ] **Given** extension is declined
      **When** UI updates
      **Then** extension card shows "ABGELEHNT" (Declined) badge in red

- [ ] **Given** extension is declined
      **When** I view extension details
      **Then** I see "Abgelehnt am: [date/time]" and reason (if provided)

- [ ] **Given** extension is declined
      **When** workshop views order
      **Then** they receive notification with decline reason

- [ ] **Given** extension is declined
      **When** I view booking total
      **Then** total price remains unchanged (extension not added)

**Technical Notes:**
- API: POST /api/bookings/:id/extensions/:extId/decline
- Request body: { declineReason: string | null }
- No payment processing occurs
- Workshop notification: Email + in-app notification
- Component: DeclineReasonForm.tsx (can be part of modal)

**Definition of Done:**
- [ ] Decline button triggers reason input
- [ ] Reason textarea with character limit
- [ ] Decline confirmation works
- [ ] Extension status updates to DECLINED
- [ ] Workshop receives notification
- [ ] No payment authorization attempted
- [ ] E2E test passing: "should show decline reason input when decline button clicked"
- [ ] Manual testing completed
- [ ] Code reviewed and merged

---

### User Story 1.5: Track Extension Payment Status

**As a** customer
**I want to** see clear payment status for approved extensions
**So that** I understand when funds are held vs. when I'm actually charged

**Acceptance Criteria:**

- [ ] **Given** I approved extension and payment authorized
      **When** I view extension card
      **Then** I see payment status badge "Autorisiert" (Authorized) in yellow/orange

- [ ] **Given** extension shows "Autorisiert" status
      **When** I click info icon
      **Then** tooltip explains "Zahlung wird nach Abschluss der Arbeiten eingezogen"

- [ ] **Given** workshop completes extension work
      **When** payment is captured
      **Then** extension card updates to show "Bezahlt" (Paid) badge in green

- [ ] **Given** extension payment is captured
      **When** I view extension details
      **Then** I see "Bezahlt am: [date/time]"

- [ ] **Given** extension payment is captured
      **When** I navigate to booking detail
      **Then** I see receipt download button for extension payment

- [ ] **Given** authorization fails to capture
      **When** capture fails (e.g., card expired)
      **Then** I see "Zahlung fehlgeschlagen" and instructions to update payment method

- [ ] **Given** I view completed booking
      **When** booking has approved extensions
      **Then** total price breakdown shows: Original booking + Extension(s) = Total

**Technical Notes:**
- Payment states: PENDING → AUTHORIZED → CAPTURED/FAILED
- Badge colors: Pending (yellow), Authorized (orange), Paid (green), Failed (red)
- API: GET /api/payment/status/:paymentIntentId
- Receipt generation: PDF with extension details
- Stripe webhook: payment_intent.succeeded (for capture confirmation)

**Definition of Done:**
- [ ] Payment status badges display correctly
- [ ] Status transitions work (authorized → paid)
- [ ] Tooltips explain payment states
- [ ] Receipt available after payment
- [ ] Total breakdown accurate
- [ ] E2E test passing: "should update extension status badge after approval"
- [ ] Code reviewed and merged

---

## EPIC 2: Jockey Dashboard - Pickup & Delivery Workflows

**Epic Description:**
As a jockey (concierge driver), I need to execute vehicle pickup and delivery workflows with proper documentation so that vehicles are safely transferred and all parties have liability protection.

**Business Value:**
Enables the core service differentiator (concierge pickup/delivery). Without this, customers must drop off vehicles themselves, eliminating competitive advantage.

**Priority:** P0 (Highest)

**User Journey:**
View assignment → Navigate to customer → Arrive at location → Document vehicle condition → Collect signature → Hand over Ronja → Complete pickup → (After service) → Deliver vehicle → Show service photos → Collect signature → Retrieve Ronja → Complete delivery

---

### User Story 2.1: View Assigned Pickup/Delivery Tasks

**As a** jockey
**I want to** view all my assigned tasks for the day with key details
**So that** I can prioritize and plan my route efficiently

**Acceptance Criteria:**

- [ ] **Given** I log in to jockey portal
      **When** dashboard loads
      **Then** I see today's date and greeting "Welcome, [Name]"

- [ ] **Given** I am on dashboard
      **When** assignments load
      **Then** I see three stat cards: Total Trips, Completed, Pending

- [ ] **Given** I have assignments
      **When** I view assignment list
      **Then** assignments are sorted by time (earliest first)

- [ ] **Given** each assignment card
      **When** I view the card
      **Then** I see: Status badge, Customer name, Time window, Address, Vehicle details, Pickup/Return indicator

- [ ] **Given** assignment has status "upcoming"
      **When** I view the card
      **Then** status badge shows "Ausstehend" (Pending) in yellow/gray

- [ ] **Given** assignment has status "inProgress"
      **When** I view the card
      **Then** status badge shows "Unterwegs" (On Route) in blue

- [ ] **Given** assignment has status "completed"
      **When** I view the card
      **Then** status badge shows "Abgeschlossen" (Completed) in green

- [ ] **Given** assignment is for pickup
      **When** I view type indicator
      **Then** I see "Abholung" (Pickup) label

- [ ] **Given** assignment is for delivery/return
      **When** I view type indicator
      **Then** I see "Ruckgabe" (Return) label

- [ ] **Given** I have no assignments
      **When** dashboard loads
      **Then** I see empty state "Keine Auftrage fur heute" with car icon

- [ ] **Given** assignments load
      **When** data is fetching
      **Then** I see loading spinner

**Technical Notes:**
- API: GET /api/jockeys/assignments?limit=20
- Component: JockeyDashboard.tsx (exists, enhance)
- Component: AssignmentCard.tsx (create)
- Response format: Array of JockeyAssignment objects
- Real-time updates: Poll every 30s or WebSocket
- Mobile-first design (jockeys use phones/tablets)

**Definition of Done:**
- [ ] Assignment list displays correctly
- [ ] Stat cards show accurate counts
- [ ] Sorting by time works
- [ ] Status badges color-coded
- [ ] Empty state displays
- [ ] Loading state works
- [ ] Mobile responsive
- [ ] E2E test passing: "should display jockey dashboard with assignments"
- [ ] Code reviewed and merged

---

### User Story 2.2: Navigate to Customer Location

**As a** jockey
**I want to** open navigation to customer address with one tap
**So that** I can drive to the location quickly without manually entering the address

**Acceptance Criteria:**

- [ ] **Given** I view assignment card with upcoming/in-progress status
      **When** I look at action buttons
      **Then** I see "Navigieren" (Navigate) button with navigation icon

- [ ] **Given** I click "Navigieren" button
      **When** button is clicked
      **Then** my device opens default maps app (Google Maps on Android, Apple Maps on iOS)

- [ ] **Given** maps app opens
      **When** app loads
      **Then** destination is pre-filled with customer address

- [ ] **Given** maps app opens
      **When** I am ready
      **Then** I can start navigation with one more tap

- [ ] **Given** address includes special instructions (e.g., "Hintereingang")
      **When** assignment card displays
      **Then** I see instructions prominently displayed above navigation button

- [ ] **Given** navigation is active
      **When** I return to jockey app
      **Then** assignment status persists

**Technical Notes:**
- Deep linking: Use `geo:` URI for Android, `maps://` or `http://maps.apple.com/` for iOS
- Address format: Street, Postal Code, City (e.g., "Musterstrasse 123, 58453 Witten")
- Fallback: If maps app not available, open Google Maps web
- User-agent detection: Detect iOS vs Android for correct deep link

**Implementation Example:**
```typescript
const openNavigation = (address: string) => {
  const encodedAddress = encodeURIComponent(address);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    window.open(`maps://maps.apple.com/?q=${encodedAddress}`);
  } else {
    window.open(`geo:0,0?q=${encodedAddress}`);
  }
};
```

**Definition of Done:**
- [ ] Navigate button visible on assignment cards
- [ ] Click opens maps app
- [ ] Address pre-filled correctly
- [ ] Works on iOS and Android
- [ ] Fallback to web maps if needed
- [ ] E2E test passing: "should show navigation button on assignments"
- [ ] Manual testing on mobile devices
- [ ] Code reviewed and merged

---

### User Story 2.3: Contact Customer via Phone

**As a** jockey
**I want to** call the customer with one tap
**So that** I can notify them of arrival or clarify address details quickly

**Acceptance Criteria:**

- [ ] **Given** I view assignment card with upcoming/in-progress status
      **When** customer phone number is available
      **Then** I see "Anrufen" (Call) button with phone icon

- [ ] **Given** I click "Anrufen" button
      **When** button is clicked
      **Then** my device opens phone dialer with customer number pre-filled

- [ ] **Given** customer has no phone number
      **When** assignment displays
      **Then** call button is disabled or not shown

- [ ] **Given** customer phone number is international
      **When** dialer opens
      **Then** number includes country code (e.g., +49 for Germany)

**Technical Notes:**
- Deep linking: `tel:` URI scheme
- Phone format: +49 XXX XXXXXXX (country code + number)
- Privacy: Don't display full number on screen (show masked: +49 XXX ***1234)
- Button state: Disabled if no phone available

**Implementation Example:**
```typescript
const callCustomer = (phoneNumber: string) => {
  window.location.href = `tel:${phoneNumber}`;
};
```

**Definition of Done:**
- [ ] Call button visible when phone available
- [ ] Click opens dialer
- [ ] Number pre-filled correctly
- [ ] Disabled state when no phone
- [ ] E2E test passing: "should show call button on assignments"
- [ ] Manual testing on mobile
- [ ] Code reviewed and merged

---

### User Story 2.4: Complete Pickup Workflow with Documentation

**As a** jockey
**I want to** document vehicle condition, scan Fahrzeugschein, and collect signatures during pickup
**So that** all parties are protected and vehicle handover is properly documented

**Acceptance Criteria:**

- [ ] **Given** I arrive at customer location for pickup
      **When** I click "Abholung starten" (Start Pickup)
      **Then** assignment status changes to "inProgress"

- [ ] **Given** assignment status is inProgress
      **When** I click "Ubergabe dokumentieren" (Document Handover)
      **Then** handover modal opens with step-by-step workflow

- [ ] **Given** handover modal is open (Step 1: Photos)
      **When** I view photo section
      **Then** I see 4 required photo buttons: Front, Back, Left Side, Right Side

- [ ] **Given** I click photo button (e.g., "Front")
      **When** button clicked
      **Then** device camera opens for photo capture

- [ ] **Given** I take photo
      **When** photo captured
      **Then** thumbnail displays on button and checkmark shows completion

- [ ] **Given** I need to retake photo
      **When** I click thumbnail
      **Then** I can delete and retake

- [ ] **Given** all 4 vehicle photos taken
      **When** photos complete
      **Then** "Weiter" (Next) button becomes enabled

- [ ] **Given** I click "Weiter" from photos step
      **When** navigation occurs
      **Then** I see Step 2: Fahrzeugschein (Vehicle Registration)

- [ ] **Given** Step 2 Fahrzeugschein
      **When** I view options
      **Then** I can: Take photo of Fahrzeugschein OR Manually enter VIN and registration details

- [ ] **Given** I take Fahrzeugschein photo
      **When** photo captured
      **Then** OCR attempts to extract VIN and registration data (optional enhancement)

- [ ] **Given** Fahrzeugschein data entered/captured
      **When** I click "Weiter"
      **Then** I see Step 3: Customer Signature

- [ ] **Given** Step 3 Customer Signature
      **When** I view signature pad
      **Then** I see canvas for customer to sign with finger/stylus

- [ ] **Given** customer signs
      **When** signature drawn
      **Then** I see "Loschen" (Clear) and "Bestatigen" (Confirm) buttons

- [ ] **Given** customer confirms signature
      **When** I click "Bestatigen"
      **Then** signature saved and I proceed to Step 4: Ronja Handover

- [ ] **Given** Step 4 Ronja Handover
      **When** I view Ronja section
      **Then** I see Ronja vehicle details (make, model, license plate)

- [ ] **Given** Ronja handover step
      **When** I confirm handover
      **Then** I take photo of Ronja being handed over (optional)

- [ ] **Given** Step 4 Ronja section
      **When** I view signature
      **Then** customer signs again to confirm Ronja receipt

- [ ] **Given** all steps completed
      **When** I click "Abholung abschließen" (Complete Pickup)
      **Then** API uploads all photos and signatures

- [ ] **Given** upload successful
      **When** API responds
      **Then** modal closes, assignment status changes to "completed", success toast shows

- [ ] **Given** upload fails
      **When** network error occurs
      **Then** I see error message and "Wiederholen" (Retry) button

- [ ] **Given** upload successful
      **When** backend processes
      **Then** customer receives notification "Fahrzeug wurde abgeholt"

**Technical Notes:**
- API: POST /api/jockeys/assignments/:id/complete-pickup
- API: POST /api/jockeys/assignments/:id/photos (multipart/form-data)
- API: POST /api/jockeys/assignments/:id/signature (base64 image)
- Component: HandoverModal.tsx (exists, enhance)
- Component: SignaturePad.tsx (create or use library: react-signature-canvas)
- Photo capture: HTML5 `<input type="file" accept="image/*" capture="environment">`
- Photo compression: Compress images before upload (target: <500KB per photo)
- Offline support: Cache photos locally if offline, upload when online
- Progress indicator: Show upload progress for large files

**Photo Requirements:**
- Format: JPEG
- Max size: 500KB (compressed)
- Min resolution: 1280x720
- Required photos: Front, Back, Left, Right (4 minimum)
- Optional photos: Dashboard (mileage), Existing damage (if any)

**Signature Requirements:**
- Format: PNG (transparent background)
- Size: 600x200 pixels
- Color: Black on transparent
- Two signatures: Customer handover, Ronja receipt

**Definition of Done:**
- [ ] Handover modal with multi-step workflow
- [ ] Photo capture for all 4 angles
- [ ] Fahrzeugschein capture/entry
- [ ] Signature pads functional
- [ ] Ronja handover documented
- [ ] Upload with progress indicator
- [ ] Error handling and retry
- [ ] Offline support (photos cached)
- [ ] Customer notification sent
- [ ] E2E test passing: "complete pickup workflow"
- [ ] Manual testing on iOS and Android
- [ ] Code reviewed and merged

---

### User Story 2.5: Complete Delivery Workflow with Service Photos

**As a** jockey
**I want to** return customer vehicle, show service photos, and retrieve Ronja
**So that** customer sees completed work and final handover is documented

**Acceptance Criteria:**

- [ ] **Given** I arrive at customer location for delivery
      **When** I click "Zustellung starten" (Start Delivery)
      **Then** assignment status changes to "inProgress"

- [ ] **Given** delivery is in progress
      **When** I click "Ruckgabe dokumentieren" (Document Return)
      **Then** delivery modal opens

- [ ] **Given** delivery modal opens (Step 1: Service Photos)
      **When** I view photos section
      **Then** I see before/after photos from workshop (fetched from API)

- [ ] **Given** I view before/after photos
      **When** customer views with me
      **Then** photos displayed side-by-side or swipeable carousel

- [ ] **Given** customer reviews photos
      **When** they click "Weiter"
      **Then** I proceed to Step 2: Vehicle Return Photos

- [ ] **Given** Step 2 Vehicle Return
      **When** I view photo buttons
      **Then** I see 4 required buttons: Front, Back, Left, Right (same as pickup)

- [ ] **Given** I take return photos
      **When** photos captured
      **Then** I can compare with pickup photos to show no new damage

- [ ] **Given** return photos complete
      **When** I click "Weiter"
      **Then** I see Step 3: Customer Signature (Vehicle Return)

- [ ] **Given** Step 3 Customer Signature
      **When** signature pad displays
      **Then** customer signs to confirm vehicle receipt in good condition

- [ ] **Given** customer signature captured
      **When** I click "Weiter"
      **Then** I see Step 4: Ronja Return

- [ ] **Given** Step 4 Ronja Return
      **When** I view Ronja section
      **Then** I see form to confirm Ronja return condition

- [ ] **Given** Ronja has damage
      **When** I indicate damage
      **Then** I can take damage photos and enter description

- [ ] **Given** Ronja return documented
      **When** I click "Weiter"
      **Then** I see Step 5: Final Signature (Ronja Return)

- [ ] **Given** Step 5 Final Signature
      **When** signature pad displays
      **Then** customer signs to confirm Ronja returned

- [ ] **Given** all delivery steps complete
      **When** I click "Zustellung abschließen" (Complete Delivery)
      **Then** API uploads all photos and signatures

- [ ] **Given** delivery upload successful
      **When** API responds
      **Then** modal closes, assignment status "completed", booking status "DELIVERED"

- [ ] **Given** delivery complete
      **When** customer dashboard updates
      **Then** customer sees "Zugestellt" (Delivered) status and can download service report

**Technical Notes:**
- API: POST /api/jockeys/assignments/:id/complete-delivery
- API: GET /api/bookings/:id/service-photos (fetch workshop photos)
- Component: DeliveryModal.tsx (create, similar to HandoverModal)
- Photo comparison: Side-by-side view or swipe transition
- Damage reporting: Form with photos and text description
- Final status: Booking transitions to DELIVERED

**Definition of Done:**
- [ ] Delivery modal with multi-step workflow
- [ ] Service photos display (before/after)
- [ ] Return photos capture
- [ ] Customer signature collected
- [ ] Ronja return documented
- [ ] Damage reporting functional
- [ ] Upload successful
- [ ] Booking status updated to DELIVERED
- [ ] E2E test passing: "complete delivery workflow"
- [ ] Manual testing completed
- [ ] Code reviewed and merged

---

### User Story 2.6: Update Task Status in Real-time

**As a** jockey
**I want to** update assignment status as I progress through workflows
**So that** customers and workshop can track progress in real-time

**Acceptance Criteria:**

- [ ] **Given** I start pickup workflow
      **When** I click "Abholung starten"
      **Then** API updates assignment status to IN_TRANSIT_TO_WORKSHOP

- [ ] **Given** status updates
      **When** API call succeeds
      **Then** assignment card badge changes color/text immediately

- [ ] **Given** status updates
      **When** change occurs
      **Then** customer receives push notification (if enabled)

- [ ] **Given** I complete pickup
      **When** handover finalized
      **Then** status updates to AT_WORKSHOP and workshop notified

- [ ] **Given** I start delivery
      **When** workflow begins
      **Then** status updates to IN_TRANSIT_TO_CUSTOMER

- [ ] **Given** I complete delivery
      **When** workflow finalized
      **Then** status updates to DELIVERED

- [ ] **Given** status update fails
      **When** network error occurs
      **Then** I see error toast and retry button

**Technical Notes:**
- API: PATCH /api/jockeys/assignments/:id/status
- WebSocket: Broadcast status changes to customer dashboard
- Optimistic updates: Update UI immediately, rollback on error
- Retry logic: Exponential backoff for failed updates
- Offline queue: Queue updates when offline, sync when online

**Definition of Done:**
- [ ] Status transitions work for all workflow steps
- [ ] Real-time updates to customer dashboard
- [ ] Notifications sent on status change
- [ ] Error handling with retry
- [ ] Offline queue implemented
- [ ] E2E test passing: "update task status"
- [ ] Code reviewed and merged

---

## EPIC 3: Customer Dashboard - Booking Management

**Epic Description:**
As a customer, I need to view my bookings, track status, and access service documentation so that I can monitor my vehicle service progress and maintain records.

**Business Value:**
Provides transparency and self-service capabilities, reducing support inquiries and improving customer satisfaction.

**Priority:** P1 (High)

---

### User Story 3.1: View Booking List

**As a** customer
**I want to** see a list of all my bookings (past and current)
**So that** I can track active services and review past services

**Acceptance Criteria:**

- [ ] **Given** I navigate to customer dashboard
      **When** page loads
      **Then** I see "Recent Bookings" section with up to 5 recent bookings

- [ ] **Given** booking list displays
      **When** I view each booking card
      **Then** I see: Service type, Vehicle (brand/model), Pickup date, Status badge, "Details" button

- [ ] **Given** I click "View all" or "Meine Buchungen"
      **When** navigation occurs
      **Then** I see full bookings page with all bookings (paginated)

- [ ] **Given** I view full bookings page
      **When** page displays
      **Then** bookings are sorted by pickup date (most recent first)

- [ ] **Given** I have many bookings
      **When** I scroll to bottom
      **Then** pagination loads more bookings (infinite scroll or page buttons)

- [ ] **Given** I have active bookings
      **When** I view list
      **Then** active bookings appear at top (not delivered/cancelled)

- [ ] **Given** I click booking card
      **When** card clicked
      **Then** I navigate to booking detail page

- [ ] **Given** I have no bookings
      **When** dashboard loads
      **Then** I see empty state "Keine Buchungen vorhanden" with CTA "Jetzt buchen"

**Technical Notes:**
- API: GET /api/bookings?limit=10&offset=0
- Component: BookingList.tsx
- Component: BookingCard.tsx
- Pagination: Infinite scroll or traditional pagination
- Sorting: Server-side by createdAt DESC
- Filtering: Active vs. All (toggle)

**Definition of Done:**
- [ ] Booking list displays correctly
- [ ] Pagination works
- [ ] Sorting accurate
- [ ] Empty state displays
- [ ] Click navigation to detail page
- [ ] E2E test passing: "should display recent bookings section"
- [ ] Code reviewed and merged

---

### User Story 3.2: View Booking Details

**As a** customer
**I want to** view complete booking details including status timeline
**So that** I can track service progress and see all booking information

**Acceptance Criteria:**

- [ ] **Given** I click booking card
      **When** detail page loads
      **Then** I see booking header with: Booking number, Status badge, Pickup/Delivery dates

- [ ] **Given** I am on booking detail page
      **When** I view tabs
      **Then** I see: "Details", "Extensions", "Photos", "Documents"

- [ ] **Given** I view Details tab
      **When** tab active
      **Then** I see: Vehicle info, Services booked, Pricing breakdown, Pickup/Delivery times & address, Workshop info

- [ ] **Given** I view Details tab
      **When** I scroll down
      **Then** I see status timeline showing: Confirmed → Pickup → At Workshop → In Service → Completed → Delivered

- [ ] **Given** status timeline displays
      **When** I view each step
      **Then** completed steps show green checkmark, current step highlighted, future steps grayed out

- [ ] **Given** booking has extensions
      **When** I view Extensions tab
      **Then** I see badge with count (e.g., "Extensions (2)")

- [ ] **Given** booking has service photos
      **When** I click Photos tab
      **Then** I see gallery of before/after photos from workshop

- [ ] **Given** booking is completed
      **When** I click Documents tab
      **Then** I see downloadable: Service report PDF, Receipt PDF, Photos ZIP

**Technical Notes:**
- API: GET /api/bookings/:id
- API: GET /api/bookings/:id/photos
- API: GET /api/bookings/:id/documents
- Component: BookingDetailPage.tsx
- Component: StatusTimeline.tsx
- Component: DocumentList.tsx
- PDF generation: Server-side (Node.js with puppeteer or similar)
- ZIP creation: Server-side for photo download

**Definition of Done:**
- [ ] Booking detail page displays all information
- [ ] Tabs functional
- [ ] Status timeline accurate
- [ ] Photos gallery works
- [ ] Documents downloadable
- [ ] E2E test passing: "view booking details"
- [ ] Code reviewed and merged

---

### User Story 3.3: Download Service Report and Receipts

**As a** customer
**I want to** download service reports and payment receipts
**So that** I can keep records for my vehicle maintenance history and taxes

**Acceptance Criteria:**

- [ ] **Given** booking is completed
      **When** I view Documents tab
      **Then** I see "Service Report" download button

- [ ] **Given** I click "Service Report" button
      **When** download starts
      **Then** PDF downloads with filename: ServiceReport_[BookingNumber].pdf

- [ ] **Given** service report PDF opens
      **When** I view contents
      **Then** I see: Booking details, Vehicle info, Services performed, Parts replaced, Technician notes, Before/after photos, Workshop stamp

- [ ] **Given** booking payment completed
      **When** I view Documents tab
      **Then** I see "Receipt" download button

- [ ] **Given** I click "Receipt" button
      **When** download starts
      **Then** PDF downloads with filename: Receipt_[BookingNumber].pdf

- [ ] **Given** receipt PDF opens
      **When** I view contents
      **Then** I see: Invoice number, Date, Customer details, Itemized services, Extensions (if any), Tax breakdown, Total amount, Payment method, Payment date

- [ ] **Given** booking has extensions
      **When** I view receipt
      **Then** extensions listed separately with individual amounts

- [ ] **Given** I want all photos
      **When** I click "Download Photos (ZIP)"
      **Then** ZIP file downloads with all service photos organized by type

**Technical Notes:**
- API: GET /api/bookings/:id/service-report (returns PDF)
- API: GET /api/bookings/:id/receipt (returns PDF)
- API: GET /api/bookings/:id/photos/download (returns ZIP)
- PDF template: Professional invoice/report template
- Legal requirements: German invoice must include Steuernummer, VAT breakdown
- Storage: PDFs generated on-demand or cached after first generation
- ZIP: Use archiver library (Node.js) or client-side (JSZip)

**Definition of Done:**
- [ ] Service report downloadable
- [ ] Receipt downloadable
- [ ] Photos ZIP downloadable
- [ ] PDFs professionally formatted
- [ ] German tax compliance
- [ ] E2E test passing: "download service report and receipt"
- [ ] Code reviewed and merged

---

## EPIC 4: Real-time Status Updates

**Epic Description:**
As a customer and jockey, I need to see real-time status updates so that I always have current information without refreshing the page.

**Business Value:**
Improves user experience, reduces customer anxiety, and enables timely responses to status changes.

**Priority:** P2 (Medium)

---

### User Story 4.1: Real-time Booking Status Updates (Customer)

**As a** customer
**I want to** see booking status update automatically
**So that** I always have current information without manually refreshing

**Acceptance Criteria:**

- [ ] **Given** I am viewing booking detail page
      **When** jockey updates status (e.g., pickup started)
      **Then** status badge updates automatically within 5 seconds

- [ ] **Given** status updates
      **When** change occurs
      **Then** I see toast notification "Status updated: [new status]"

- [ ] **Given** I am viewing booking list
      **When** status changes
      **Then** booking card status badge updates automatically

- [ ] **Given** extension is approved by me
      **When** workshop starts extension work
      **Then** extension status updates to "In Progress"

**Technical Notes:**
- WebSocket connection or Server-Sent Events (SSE)
- Fallback: Long polling (poll every 10s)
- Connection management: Reconnect on disconnect
- Battery optimization: Reduce polling frequency when tab inactive

**Definition of Done:**
- [ ] Real-time updates via WebSocket or SSE
- [ ] Fallback polling implemented
- [ ] Toast notifications for updates
- [ ] E2E test passing: "real-time status updates"
- [ ] Code reviewed and merged

---

### User Story 4.2: Real-time Assignment Updates (Jockey)

**As a** jockey
**I want to** receive new assignments automatically
**So that** I can respond quickly without constantly checking the app

**Acceptance Criteria:**

- [ ] **Given** I am on jockey dashboard
      **When** new assignment is created
      **Then** assignment appears in my list within 5 seconds

- [ ] **Given** new assignment arrives
      **When** it displays
      **Then** I see toast notification "New assignment: [customer name]"

- [ ] **Given** assignment is cancelled
      **When** cancellation occurs
      **Then** assignment removed from list with notification

**Technical Notes:**
- WebSocket: Real-time assignment updates
- Push notifications: FCM for mobile notifications
- Sound/vibration: Alert jockey to new assignment

**Definition of Done:**
- [ ] Real-time assignment updates
- [ ] Toast notifications
- [ ] Push notifications (optional)
- [ ] E2E test passing: "jockey receives new assignment"
- [ ] Code reviewed and merged

---

## Acceptance Criteria Summary

### Customer Dashboard - Extension Approval (15 stories total)

**Critical Path:**
1. Receive notification → View details → Approve with payment → Track payment status
2. Receive notification → View details → Decline with reason

**Success Metrics:**
- Extension approval rate: Target >60%
- Time to approve: Target <10 minutes from notification
- Payment authorization success rate: Target >95%
- User satisfaction: Target 4.5/5

---

### Jockey Dashboard - Pickup & Delivery (12 stories total)

**Critical Path:**
1. View assignments → Navigate → Document pickup → Update status → Complete
2. View assignments → Navigate → Show service photos → Document delivery → Complete

**Success Metrics:**
- On-time pickup rate: Target >95%
- Photo quality: All 4 angles captured 100%
- Signature capture rate: 100%
- Customer satisfaction with jockey: Target 4.7/5

---

## Technical Dependencies

### APIs Required

**Customer Portal:**
- GET /api/bookings/:id
- GET /api/bookings/:id/extensions
- POST /api/bookings/:id/extensions/:extId/approve
- POST /api/bookings/:id/extensions/:extId/decline
- GET /api/notifications/unread-count
- GET /api/notifications/history
- POST /api/payment/create-intent
- POST /api/payment/capture
- GET /api/bookings/:id/service-report
- GET /api/bookings/:id/receipt

**Jockey Portal:**
- GET /api/jockeys/assignments
- PATCH /api/jockeys/assignments/:id/status
- POST /api/jockeys/assignments/:id/complete-pickup
- POST /api/jockeys/assignments/:id/complete-delivery
- POST /api/jockeys/assignments/:id/photos
- POST /api/jockeys/assignments/:id/signature

### Components to Create

**Customer:**
- ExtensionApprovalModal.tsx
- ExtensionCard.tsx
- ExtensionList.tsx
- PaymentForm.tsx (if not exists)
- BookingDetailTabs.tsx
- StatusTimeline.tsx
- DocumentList.tsx

**Jockey:**
- HandoverModal.tsx (enhance existing)
- DeliveryModal.tsx (new)
- SignaturePad.tsx
- PhotoCapture.tsx
- AssignmentCard.tsx

**Shared:**
- NotificationCenter.tsx (enhance existing)
- ImageLightbox.tsx
- VideoPlayer.tsx

### Third-party Services

**Payment:**
- Stripe Elements (already integrated)
- Stripe PaymentIntents API with manual capture

**Notifications:**
- Firebase Cloud Messaging (FCM)
- WebSocket or Server-Sent Events

**Storage:**
- Image compression library (browser-image-compression)
- Signature canvas (react-signature-canvas)
- PDF generation (puppeteer or pdfkit on backend)
- ZIP creation (archiver on backend)

---

## Development Approach

### Phase 1: Customer Extension Approval (Week 1-2)
**Priority: P0 - CRITICAL**

**Why First:** This is the revenue-critical path. Without extension approval, business cannot charge for additional work.

**Stories to implement:**
1. User Story 1.1: Receive Extension Notification
2. User Story 1.2: View Extension Details
3. User Story 1.3: Approve Extension with Payment Authorization
4. User Story 1.4: Decline Extension with Reason
5. User Story 1.5: Track Extension Payment Status

**Deliverables:**
- Notification center with extension alerts
- Extension approval modal
- Stripe payment integration (manual capture)
- Status tracking

**Testing Focus:**
- E2E tests: Extension approval flow (07-extension-approval-flow.spec.ts)
- Payment testing with Stripe test cards
- Manual QA on staging

---

### Phase 2: Jockey Pickup/Delivery Workflows (Week 3-4)
**Priority: P0 - CRITICAL**

**Why Second:** Enables core service differentiator. Required for E2E customer journey.

**Stories to implement:**
1. User Story 2.1: View Assigned Tasks
2. User Story 2.2: Navigate to Customer
3. User Story 2.3: Contact Customer
4. User Story 2.4: Complete Pickup Workflow
5. User Story 2.5: Complete Delivery Workflow
6. User Story 2.6: Update Task Status

**Deliverables:**
- Enhanced jockey dashboard
- Handover modal with photo/signature capture
- Delivery modal
- Navigation/call deep links

**Testing Focus:**
- E2E tests: Jockey portal (04-jockey-portal.spec.ts)
- Mobile testing (iOS and Android)
- Photo upload and compression
- Offline functionality

---

### Phase 3: Customer Booking Management (Week 5)
**Priority: P1 - HIGH**

**Why Third:** Completes customer self-service capabilities.

**Stories to implement:**
1. User Story 3.1: View Booking List
2. User Story 3.2: View Booking Details
3. User Story 3.3: Download Service Report and Receipts

**Deliverables:**
- Booking list and detail pages
- Status timeline
- PDF generation (reports and receipts)
- Photo gallery

**Testing Focus:**
- E2E tests: Customer portal (03-customer-portal.spec.ts)
- PDF generation quality
- Document download functionality

---

### Phase 4: Real-time Updates (Week 6)
**Priority: P2 - MEDIUM**

**Why Last:** Nice-to-have enhancement. Core functionality works without it.

**Stories to implement:**
1. User Story 4.1: Real-time Booking Status Updates
2. User Story 4.2: Real-time Assignment Updates

**Deliverables:**
- WebSocket or SSE implementation
- Real-time status updates
- Push notifications

**Testing Focus:**
- Connection stability
- Reconnection logic
- Battery/performance impact

---

## Definition of Ready (Before Development)

Each user story must have:
- [ ] Clear acceptance criteria (Given-When-Then format)
- [ ] API endpoints identified
- [ ] Components identified
- [ ] Technical notes reviewed
- [ ] E2E test exists
- [ ] Dependencies identified
- [ ] Designs reviewed (if applicable)
- [ ] Story estimated and prioritized

---

## Definition of Done (Per User Story)

- [ ] Code implemented according to acceptance criteria
- [ ] All acceptance criteria met
- [ ] E2E test passing
- [ ] Unit tests written (>80% coverage)
- [ ] Manual testing completed on dev environment
- [ ] Code reviewed by at least one other developer
- [ ] No critical bugs or blockers
- [ ] Documentation updated (if applicable)
- [ ] Merged to main branch
- [ ] Deployed to staging environment
- [ ] Product Owner acceptance

---

## Risk Assessment

### High Risks

**Risk 1: Stripe Payment Authorization Complexity**
- **Impact:** High (revenue blocking)
- **Likelihood:** Medium
- **Mitigation:** Early Stripe integration testing, use test cards extensively, implement robust error handling

**Risk 2: Mobile Photo/Signature Capture Browser Compatibility**
- **Impact:** High (blocks jockey workflow)
- **Likelihood:** Medium
- **Mitigation:** Test on actual iOS/Android devices early, implement fallbacks, use battle-tested libraries

**Risk 3: Real-time Update Infrastructure**
- **Impact:** Medium (nice-to-have)
- **Likelihood:** Medium
- **Mitigation:** Implement polling fallback, test under high load, monitor connection stability

### Medium Risks

**Risk 4: PDF Generation Performance**
- **Impact:** Medium (affects customer experience)
- **Likelihood:** Low
- **Mitigation:** Cache generated PDFs, implement async generation with job queue

**Risk 5: Offline Support for Jockey App**
- **Impact:** Medium (jockeys may lose connectivity)
- **Likelihood:** Medium
- **Mitigation:** Implement service worker for offline caching, queue photo uploads, sync when online

---

## Success Criteria

### Business Metrics
- Extension approval rate: >60% (within 24 hours)
- Extension approval time: <15 minutes average
- Jockey pickup on-time rate: >95%
- Customer satisfaction (NPS): >70
- Support tickets reduction: >30% (due to self-service)

### Technical Metrics
- E2E test pass rate: 100% (all 248 tests)
- Page load time: <2 seconds (dashboard)
- API response time: <500ms (p95)
- Mobile performance score: >85 (Lighthouse)
- Error rate: <1%

### User Experience Metrics
- Extension details viewed before approval: >90%
- Photos viewed before extension approval: >80%
- Jockey workflow completion time: <10 minutes per pickup
- Customer booking detail page views: >3 per booking

---

## Open Questions for Stakeholders

1. **Extension Payment Timing:** Should we capture payment immediately after extension is completed, or wait until entire booking is completed?
   - **Recommendation:** Capture after extension work completed (provides flexibility if issues arise)

2. **Jockey Offline Mode:** How long should jockey app cache data offline before forcing sync?
   - **Recommendation:** Cache photos indefinitely until uploaded, queue status updates for 24 hours

3. **Extension Decline Flow:** Should workshop be able to re-submit declined extensions with adjusted pricing?
   - **Recommendation:** Yes, create "revised extension" feature (future story)

4. **Customer Photo Access:** Should customers see raw pickup/delivery photos or only "key" photos selected by jockey?
   - **Recommendation:** Show all photos for transparency, organize by category

5. **Ronja Damage Charges:** How should we handle damage to Ronja (replacement vehicle)?
   - **Recommendation:** Separate damage invoice sent to customer, integrate with existing payment system

---

## Appendix: API Payload Examples

### Extension Approval Request
```json
POST /api/bookings/:bookingId/extensions/:extensionId/approve
{
  "paymentMethodId": "pm_1234567890",
  "approvedAt": "2026-02-01T14:30:00Z"
}

Response:
{
  "success": true,
  "extension": {
    "id": "ext_001234",
    "status": "APPROVED",
    "paymentIntentId": "pi_1234567890",
    "paymentStatus": "AUTHORIZED",
    "totalAmount": 1032.46
  }
}
```

### Jockey Complete Pickup Request
```json
POST /api/jockeys/assignments/:id/complete-pickup
{
  "photos": [
    { "type": "FRONT", "url": "https://..." },
    { "type": "BACK", "url": "https://..." },
    { "type": "LEFT", "url": "https://..." },
    { "type": "RIGHT", "url": "https://..." }
  ],
  "fahrzeugschein": {
    "vin": "WBA12345678901234",
    "registrationNumber": "DO-AB-1234",
    "photoUrl": "https://..."
  },
  "customerSignature": "data:image/png;base64,...",
  "ronjaSignature": "data:image/png;base64,...",
  "completedAt": "2026-02-01T10:45:00Z"
}

Response:
{
  "success": true,
  "assignment": {
    "id": "assign_001",
    "status": "COMPLETED",
    "bookingStatus": "IN_TRANSIT_TO_WORKSHOP"
  }
}
```

---

**END OF DOCUMENT**

---

## Document Control

**Version:** 1.0
**Created:** February 1, 2026
**Author:** Product Owner (Claude)
**Review Date:** February 15, 2026
**Status:** Approved for Development

**Stakeholder Approval:**
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] UX/UI Designer
- [ ] QA Lead

**Change Log:**
- v1.0 (2026-02-01): Initial user stories document created
