# E2E Demo Script - Complete Flow

## Prerequisites

1. Backend running: `cd backend && npm run dev` (port 5001)
2. Frontend running: `cd frontend && npm run dev` (port 3000)
3. Database running (PostgreSQL on port 5433)
4. Test users exist (run setup-test-data.js if needed)

## Browser Setup

Open 4 browser tabs:
- Tab 1: Customer (Incognito) - http://localhost:3000/de
- Tab 2: Jockey - http://localhost:3000/de/jockey/login
- Tab 3: Workshop - http://localhost:3000/de/workshop/login
- Tab 4: Customer Login - http://localhost:3000/de/customer/login

## Demo Flow (10 minutes)

### Step 1: Customer Books Service (3 min)

**Tab 1: Customer Booking (with Registration)**
1. Click "Jetzt buchen"
2. Vehicle: VW Golf 2020, 45.000 km
3. Services: ✓ Inspektion ✓ Ölwechsel
4. Date: 3 days from today, 10:00
5. Address: Musterstraße 123, 44135 Dortmund
6. **Registration (REQUIRED):**
   - Email: demo@test.com
   - Password: demo123
   - Name: Demo Customer
   - Phone: +49 123 456789
7. Review and confirm booking
8. Payment: 4242 4242 4242 4242
9. Confirmation shown ✅

**Expected:** Booking created, jockey assignment auto-created

### Step 2: Jockey Sees Assignment (1 min)

**Tab 2: Jockey Dashboard**
1. Login: jockey-1 / jockey123
2. Dashboard loads
3. See assignment card: "VW Golf - Demo Customer - Musterstraße 123"
4. Click "Start Pickup"
5. Status updates to "EN_ROUTE"
6. Click "Complete Pickup"
7. Assignment completed ✅

**Expected:** Booking status → IN_TRANSIT_TO_WORKSHOP

### Step 3: Workshop Creates Extension (2 min)

**Tab 3: Workshop Dashboard**
1. Login: werkstatt-witten / werkstatt123
2. Dashboard shows orders
3. Find new booking (Demo Customer)
4. Click to open details
5. Update status: IN_SERVICE
6. Click "Erweiterung erstellen"
7. Description: "Bremsbeläge verschlissen"
8. Items:
   - Bremsbeläge vorne: 189.99 €
   - Bremsbeläge hinten: 169.99 €
   - Arbeitszeit: 89.00 €
9. Total: 448.99 €
10. Click "An Kunden senden"
11. Extension created ✅

**Expected:** Extension status PENDING

### Step 4: Customer Approves Extension (2 min)

**Tab 4: Customer Portal**
1. Login: demo@test.com / [see console for password]
2. Dashboard → Bookings
3. Click on booking
4. Extensions tab shows (1) badge
5. Extension card visible
6. Click extension → Modal opens
7. Review items and total
8. Click "Genehmigen & Bezahlen"
9. Enter card: 4242 4242 4242 4242
10. Payment authorized ✅
11. Extension status: APPROVED (yellow "Autorisiert" badge)

**Expected:** Payment authorized (NOT captured yet)

### Step 5: Workshop Completes Service (1 min)

**Tab 3: Workshop Dashboard**
1. See extension status: APPROVED
2. (Demo: "Arbeiten werden durchgeführt...")
3. Click booking
4. Update status: COMPLETED
5. Service marked complete ✅

**Expected:**
- Extension payment AUTO-CAPTURED
- Extension status → COMPLETED
- Return assignment auto-created
- Extension badge → green "Bezahlt"

### Step 6: Jockey Delivers Vehicle (1 min)

**Tab 2: Jockey Dashboard**
1. See new assignment: RETURN
2. Click "Start Delivery"
3. Status: EN_ROUTE
4. Click "Complete Delivery"
5. Assignment completed ✅

**Expected:** Booking status → DELIVERED

### Step 7: Verify Complete Flow (1 min)

**Check all dashboards:**

**Customer Dashboard (Tab 4):**
- Booking status: DELIVERED ✅
- Extension status: COMPLETED ✅
- Extension payment: Bezahlt (green) ✅
- Total price: Original + Extension

**Workshop Dashboard (Tab 3):**
- Order status: COMPLETED ✅
- Extension: APPROVED & PAID ✅

**Jockey Dashboard (Tab 2):**
- Pickup assignment: COMPLETED ✅
- Delivery assignment: COMPLETED ✅

**SUCCESS!** Complete E2E flow demonstrated ✅

---

## Testing Checklist

### Manual Testing
- [ ] Jockey dashboard loads assignments from API
- [ ] "Start Pickup" button updates status
- [ ] "Complete Pickup" button completes assignment
- [ ] Booking status updates when jockey completes
- [ ] Workshop can mark service as COMPLETED
- [ ] Extension payment captures automatically on completion
- [ ] Customer sees "Bezahlt" status after capture
- [ ] Return assignment auto-created
- [ ] Jockey sees return assignment
- [ ] Can complete return delivery
- [ ] Booking status → DELIVERED

### E2E Test Suites

Run these tests after implementation:

```bash
npx playwright test 03-customer-portal --headed
npx playwright test 04-jockey-portal --headed
npx playwright test 07-extension-approval-flow --headed
npx playwright test 08-extension-integration --headed
```

---

## Key Features Demonstrated

### 1. Real-Time Updates
- Jockey dashboard refreshes every 30 seconds
- Status changes propagate immediately
- Payment capture happens automatically

### 2. Payment Authorization Flow
- Customer authorizes payment upfront
- Payment NOT captured until service complete
- Auto-capture on workshop completion
- Customer sees real-time payment status

### 3. Multi-Role Coordination
- Customer books → Jockey picks up → Workshop services → Jockey delivers
- Automatic assignment creation
- Status synchronization across all roles

### 4. Error Handling
- Toast notifications for all actions
- API error handling
- Graceful degradation

---

## Troubleshooting

### Jockey Dashboard Not Loading Assignments
- Check: Backend running on port 5001
- Check: Jockey is logged in correctly
- Check: Database has jockey assignments
- Check: Browser console for API errors

### Extension Payment Not Capturing
- Check: Extension status is APPROVED
- Check: stripePaymentIntentId exists
- Check: Stripe API key configured
- Check: Backend logs for Stripe errors

### Return Assignment Not Created
- Check: Workshop updated status to COMPLETED
- Check: At least one jockey exists with role JOCKEY
- Check: Backend logs for assignment creation

---

## Demo Talking Points

1. **Seamless Customer Experience**
   - Book online, approve extensions digitally
   - Real-time status updates
   - Transparent pricing with itemized extensions

2. **Efficient Operations**
   - Automatic jockey assignment
   - Digital handover documentation
   - Real-time coordination between roles

3. **Smart Payment Flow**
   - Authorize upfront, capture on completion
   - Prevents customer disputes
   - Automatic payment reconciliation

4. **Production-Ready Features**
   - TypeScript end-to-end
   - Comprehensive error handling
   - Scalable architecture
   - Real-time updates

---

## Next Steps After Demo

1. Add real image upload for handover photos
2. Implement push notifications
3. Add SMS notifications for status changes
4. Build admin dashboard for oversight
5. Add analytics and reporting
6. Implement automated testing suite
7. Deploy to production environment
