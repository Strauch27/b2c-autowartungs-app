# E2E Demo-Prototyp Requirements

**Ziel:** Kompletten Customer Journey von Booking bis Extension-Approval demonstrieren können

## ✅ Was bereits funktioniert (Ready for Demo):

### Phase 1: Initial Booking
- ✅ Guest Checkout komplett
- ✅ Service Selection
- ✅ Vehicle Input
- ✅ Payment (Stripe)
- ✅ Booking Confirmation

### Phase 4: Workshop
- ✅ Workshop Login
- ✅ View Orders
- ✅ Create Extension

---

## ❌ CRITICAL MISSING für Demo (Must-Have):

### 1. Customer Extension Approval Flow 🔴 **BLOCKING DEMO**

**Was fehlt:**
```typescript
// Component: ExtensionApprovalModal.tsx
// Location: /components/customer/ExtensionApprovalModal.tsx

Features needed:
- [ ] Modal öffnet sich bei Click auf Extension Card
- [ ] Zeigt Extension Details (Items, Photos, Total Price)
- [ ] "Genehmigen" Button → Payment Flow
- [ ] "Ablehnen" Button → Decline Flow
- [ ] Stripe Payment Elements für Authorization
- [ ] Success/Error Handling
```

**Backend APIs:**
```typescript
// POST /api/customer/extensions/:id/approve
// POST /api/customer/extensions/:id/decline
// POST /api/payment/authorize-extension (Stripe manual capture)
```

**Geschätzter Aufwand:** 1-2 Tage
**Priority:** P0 - DEMO BLOCKER

---

### 2. Jockey Assignment Flow 🔴 **BLOCKING DEMO**

**Minimal für Demo:**
```typescript
// Backend APIs needed:
POST   /api/jockeys/assignments (create assignment when booking confirmed)
GET    /api/jockeys/assignments (jockey sees their assignments)
PATCH  /api/jockeys/assignments/:id/status (update status to COMPLETED)

// Frontend: Jockey Dashboard Enhancement
- [ ] Fetch and display assignments from API
- [ ] Show assignment details (customer, address, vehicle, time)
- [ ] "Start Pickup" button → Status: IN_PROGRESS
- [ ] "Complete Pickup" button → Status: COMPLETED
- [ ] Mock photo upload (placeholder images, no real S3 needed for demo)
```

**Geschätzter Aufwand:** 1 Tag
**Priority:** P0 - DEMO BLOCKER

---

### 3. Extension Payment Capture Flow 🟡 **NICE TO HAVE**

**Nach Approval:**
```typescript
// Workshop marks work as completed
// POST /api/payment/capture-extension
// Captures the authorized payment

// Frontend:
- [ ] Workshop sees "Extension genehmigt" status
- [ ] When work completed → Automatic payment capture
- [ ] Customer sees "Bezahlt" status
```

**Geschätzter Aufwand:** 4 Stunden
**Priority:** P1 - Can mock for demo, but better to have real

---

## 🟢 OPTIONAL für Demo (Can be Mocked):

### 4. Notifications (Can simulate)
```
✓ Extension created → In-App notification bereits da
✗ Email → Kann weggelassen werden für Demo
✗ Push → Kann weggelassen werden für Demo
✗ SMS → Kann weggelassen werden für Demo
```

### 5. Photo Upload (Can mock)
```
✓ File Upload API exists
✗ S3 → Kann mit Placeholder-URLs gemockt werden
```

### 6. PDF Generation (Can show placeholder)
```
✗ Service Report PDF → Kann als "Download" Button mit Alert mocken
✗ Receipt PDF → Kann als "Download" Button mit Alert mocken
```

---

## 📋 DEMO FLOW CHECKLIST:

### Complete E2E Demo Journey:

**Step 1: Customer Books Service** ✅ WORKS
```
✅ Customer visits landing page
✅ Selects service (Inspektion + Ölwechsel)
✅ Enters vehicle data (VW Golf 2020)
✅ Selects date/time
✅ Enters address
✅ Pays with Stripe
✅ Receives confirmation
```

**Step 2: Jockey Pickup** ❌ NEEDS IMPLEMENTATION
```
❌ Jockey logs in
❌ Sees assignment for customer
❌ Clicks "Start Pickup"
❌ Navigates to address (mock)
❌ Uploads photos (mock with placeholders)
❌ Collects signature (mock)
❌ Completes pickup
✅ Status updates to "IN_TRANSIT_TO_WORKSHOP"
```

**Step 3: Workshop Service** ✅ WORKS
```
✅ Workshop logs in
✅ Views order in dashboard
✅ Clicks order to see details
✅ Updates status to "IN_SERVICE"
✅ Discovers additional work needed
✅ Creates extension with description and photos
```

**Step 4: Customer Approves Extension** ❌ NEEDS IMPLEMENTATION
```
✅ Customer sees notification (bell icon badge)
✅ Navigates to booking details
✅ Opens Extensions tab
❌ Clicks extension card → Modal opens
❌ Reviews items and total price
❌ Clicks "Genehmigen & Bezahlen"
❌ Enters payment (Stripe Elements)
❌ Payment authorized (manual capture)
✅ Extension status: APPROVED
```

**Step 5: Workshop Completes Work** ⚠️ PARTIAL
```
✅ Workshop sees "Extension genehmigt"
✅ Performs additional work
✅ Updates status to "COMPLETED"
❌ Payment captured automatically (needs implementation)
⚠️ Or: Manual capture via Workshop UI (workaround)
```

**Step 6: Jockey Delivery** ❌ NEEDS IMPLEMENTATION
```
❌ Jockey sees delivery assignment
❌ Drives to customer
❌ Shows before/after photos (mock)
❌ Customer signs (mock)
❌ Returns Ronja (mock)
✅ Status: DELIVERED
```

**Step 7: Customer Reviews** 🟢 OPTIONAL (Can skip for demo)
```
□ Customer sees review request
□ Submits 5-star review
```

---

## 🎯 MINIMUM VIABLE DEMO (3 Tage Arbeit):

### Day 1: Extension Approval (Frontend + Backend)
**Aufgaben:**
1. ✅ ExtensionApprovalModal component
2. ✅ Stripe Payment Elements integration (manual capture)
3. ✅ POST /api/customer/extensions/:id/approve
4. ✅ POST /api/customer/extensions/:id/decline
5. ✅ POST /api/payment/authorize-extension

**Acceptance:**
- Modal öffnet sich bei Click
- Customer kann Extension genehmigen
- Stripe PaymentIntent wird erstellt mit `capture_method: 'manual'`
- Extension status ändert sich zu APPROVED
- Workshop sieht "Genehmigt" Status

### Day 2: Jockey Backend APIs
**Aufgaben:**
1. ✅ src/controllers/jockeys.controller.ts
2. ✅ src/routes/jockeys.routes.ts
3. ✅ POST /api/jockeys/assignments (auto-create on booking)
4. ✅ GET /api/jockeys/assignments
5. ✅ PATCH /api/jockeys/assignments/:id/status

**Acceptance:**
- Jockey Dashboard fetches real assignments
- Jockey kann Status updaten
- Booking status ändert sich entsprechend

### Day 3: Jockey Frontend + Polish
**Aufgaben:**
1. ✅ Jockey Dashboard API integration
2. ✅ Assignment list with real data
3. ✅ "Start Pickup" / "Complete Pickup" buttons
4. ✅ Mock photo upload (use placeholder URLs)
5. ✅ Mock signature (use placeholder data)
6. ✅ Payment capture integration (auto-capture on workshop completion)
7. ✅ End-to-End Test der kompletten Demo

**Acceptance:**
- Kompletter Flow von Booking → Extension Approval → Delivery funktioniert
- Alle Status-Updates sichtbar
- Customer Dashboard zeigt korrekten Status
- Workshop Dashboard zeigt korrekten Status
- Jockey Dashboard zeigt Assignments

---

## 🚀 DEMO SCRIPT (Nach Implementation):

### Persona 1: Customer (Max Müller)
```
1. Öffne Landing Page (http://localhost:3000/de)
2. Klick "Jetzt buchen"
3. Fahrzeug: VW Golf 2020, 45.000 km
4. Service: Inspektion + Ölwechsel
5. Datum: In 3 Tagen, 10:00 Uhr
6. Adresse: Musterstraße 123, 44135 Dortmund
7. Email: demo@customer.com
8. Bezahlen mit Test-Karte: 4242 4242 4242 4242
9. Bestätigung erhalten
```

### Persona 2: Jockey (Anna Schmidt)
```
10. Login: jockey-1 / jockey123
11. Dashboard zeigt Assignment
12. Klick "Start Pickup"
13. (Demo: "Fahre zum Kunden...")
14. Upload Mock-Fotos (4 Platzhalter)
15. Collect Mock-Signature
16. Klick "Complete Pickup"
17. Status → IN_TRANSIT_TO_WORKSHOP
```

### Persona 3: Workshop (Werkstatt Witten)
```
18. Login: werkstatt-witten / werkstatt123
19. Dashboard zeigt neue Order
20. Klick auf Order → Details Modal
21. Update Status: IN_SERVICE
22. Klick "Erweiterung erstellen"
23. Beschreibung: "Bremsbeläge verschlissen"
24. Items: Bremsbeläge vorne (189.99 €), Arbeitszeit (89.00 €)
25. Upload Mock-Foto (Platzhalter)
26. Sende an Kunde
```

### Persona 1: Customer Returns
```
27. Login: demo@customer.com / [auto-generated password]
28. Dashboard → Bell Icon zeigt (1) Badge
29. Klick auf Notification
30. Opens Booking Details → Extensions Tab
31. Klick Extension Card → Modal öffnet sich
32. Review Items: Total 278.99 €
33. Klick "Genehmigen & Bezahlen"
34. Enter Test Card: 4242 4242 4242 4242
35. Payment authorized
36. Extension Status: APPROVED ✅
```

### Persona 3: Workshop Continues
```
37. Workshop sieht "Extension genehmigt"
38. Performs work (Demo: "Arbeitet...")
39. Update Status: COMPLETED
40. Payment wird automatisch captured
41. Customer sieht "Bezahlt" Status
```

### Persona 2: Jockey Delivery
```
42. Jockey Dashboard zeigt Delivery Assignment
43. Klick "Start Delivery"
44. (Demo: "Fahre zum Kunden...")
45. Show Before/After Photos
46. Collect Mock-Signature
47. Klick "Complete Delivery"
48. Status → DELIVERED ✅
```

### Finale:
```
49. Customer Dashboard zeigt:
    - Booking Status: DELIVERED ✅
    - Extension Status: APPROVED & PAID ✅
    - Total Price: Original + Extension
50. Workshop Dashboard zeigt:
    - Order Status: COMPLETED ✅
    - Extension: APPROVED & PAID ✅
51. Jockey Dashboard zeigt:
    - Assignment: COMPLETED ✅
```

---

## 📦 DELIVERABLES für Demo:

### Code Files to Create/Modify:

**Frontend:**
```
NEW:
- components/customer/ExtensionApprovalModal.tsx
- components/jockey/AssignmentCard.tsx (enhance)

MODIFY:
- app/[locale]/jockey/dashboard/page.tsx (API integration)
- components/customer/ExtensionList.tsx (add modal trigger)
```

**Backend:**
```
NEW:
- src/controllers/jockeys.controller.ts
- src/routes/jockeys.routes.ts
- src/services/payment.service.ts (manual capture)

MODIFY:
- src/controllers/bookings.controller.ts (auto-create jockey assignment)
- src/controllers/workshops.controller.ts (payment capture on completion)
```

### Database:
```
MODIFY:
- Ensure JockeyAssignment model exists in Prisma schema
- Add payment_intent_id to Extension model
```

---

## ⏱️ ZEITPLAN:

| Tag | Aufgabe | Stunden | Priority |
|-----|---------|---------|----------|
| 1 | ExtensionApprovalModal (Frontend) | 4h | P0 |
| 1 | Extension Approval APIs (Backend) | 4h | P0 |
| 2 | Jockey Controller/Routes (Backend) | 6h | P0 |
| 2 | Auto-create Assignments | 2h | P0 |
| 3 | Jockey Dashboard Integration | 4h | P0 |
| 3 | Payment Capture Flow | 2h | P0 |
| 3 | End-to-End Testing & Polish | 2h | P0 |

**Total: 24 Stunden (3 Tage)**

---

## 🎬 DEMO PREPARATION:

### Before Demo:
1. ✅ Reset database with test data
2. ✅ Clear browser cache/localStorage
3. ✅ Start backend: `npm run dev` (port 5001)
4. ✅ Start frontend: `npm run dev` (port 3000)
5. ✅ Test Stripe test mode enabled
6. ✅ Open 4 browser tabs:
   - Tab 1: Customer (Incognito)
   - Tab 2: Jockey Login
   - Tab 3: Workshop Login
   - Tab 4: Customer Login (for extension approval)

### During Demo:
- Follow Demo Script above
- Pause at each transition to explain
- Show status updates in real-time
- Highlight Extension approval with payment
- Show Jockey workflow (unique differentiator)

### After Demo:
- Answer questions
- Show E2E test suite (248 tests)
- Show documentation (3 comprehensive docs)
- Discuss next features (Email, PDF, etc.)

---

## 🎯 SUCCESS CRITERIA:

Demo is successful if:
- [x] Customer can book service end-to-end
- [x] Jockey can see and complete assignments
- [x] Workshop can create extensions
- [x] **Customer can approve extension with payment** ← CRITICAL
- [x] Payment is authorized (manual capture)
- [x] Workshop can complete service
- [x] Payment is captured automatically
- [x] All status updates visible across dashboards
- [x] No critical errors during flow
- [x] Flow takes < 10 minutes to demonstrate

---

**NEXT STEP:** Implement Day 1 (Extension Approval) to unblock demo.
