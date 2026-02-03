# i18n Audit Report - Frontend Vollständige Zweisprachigkeit (DE/EN)

**Erstellt:** 2026-02-03
**Workspace:** `/Users/stenrauch/Documents/B2C App v2/99 Code/frontend`
**Ziel:** Identifikation aller hardcoded Strings für vollständige Zweisprachigkeit

---

## Executive Summary

Dieser Audit identifiziert **~350+ hardcoded Strings** in Frontend-Komponenten, die für vollständige DE/EN-Zweisprachigkeit in zentrale Translation-Files überführt werden müssen.

**Kritische Bereiche:**
- Payment & Confirmation Flow (10 Files)
- Extension/Order Modals (4 Files)
- Dashboard-Komponenten (3 Roles)
- Auth & Protected Routes (5 Files)

---

## 1. Payment Components

### 1.1 `components/payment/payment-summary.tsx`

**Hardcoded Strings:**
- Line 60: `"Booking Summary"`
- Line 64: `"Please review your booking details before payment"`
- Line 73: `"Service"`
- Line 83: `"Vehicle"`
- Line 89: `"License Plate: {licensePlate}"`
- Line 98: `"Pickup Date & Time"`
- Line 107: `"Pickup Address"`
- Line 119: `"Price Breakdown"`
- Line 121: `"Base Price:"`
- Line 126: `"Age Adjustment:"`
- Line 138: `"Total Amount:"`
- Line 144: `"Includes all taxes and fees"`

**Service Type Mapping (Line 44-52):**
```typescript
const serviceNames: Record<string, string> = {
  INSPECTION: "Inspektion",
  OIL_SERVICE: "Ölwechsel",
  BRAKE_SERVICE: "Bremsendienst",
  TUV: "TÜV/HU",
  CLIMATE_SERVICE: "Klimaservice",
  CUSTOM: "Sonderleistung",
};
```
→ **Muss in translations verschoben werden!**

---

### 1.2 `components/payment/payment-form.tsx`

**Hardcoded Strings:**
- Line 67: `return_url` verwendet hardcoded `/de/`
- Line 74: `"Payment failed. Please try again."`
- Line 75: `"Payment failed"`
- Line 81: `"An unexpected error occurred. Please try again."`
- Line 82: `"An unexpected error occurred"`
- Line 110: `"Booking ID:"`
- Line 114: `"Total Amount:"`
- Line 129: `"Processing Payment..."`
- Line 132: `"Pay ${amount.toFixed(2)} EUR"`
- Line 138: `"Secure payment powered by Stripe. Your payment information is encrypted and secure."`

**Problem:** Locale ist hardcoded in `return_url` (Line 67)

---

### 1.3 `components/payment/stripe-checkout.tsx`

**Hardcoded Strings:**
- Line 58: `"Authentication required. Please log in."`
- Line 70: `"Failed to fetch booking"`
- Line 81: `"Failed to fetch booking details"`
- Line 101: `"Authentication required. Please log in."`
- Line 117: `"Failed to initialize payment"`
- Line 124: `"Failed to initialize payment"`
- Line 138: `"Initializing secure payment..."`
- Line 149: `"Payment Initialization Failed"`
- Line 154: `"Try Again"`
- Line 167: `"Complete Your Payment"`
- Line 169: `"Demo payment mode - No real charges will be made"`
- Line 192: `"Stripe is not configured. Please contact support."`
- Line 202: `"Complete Your Payment"`
- Line 204: `"Secure payment processing powered by Stripe"`

---

### 1.4 `components/payment/demo-payment-form.tsx`

**Hardcoded Strings:**
- Line 43: `"Authentication required. Please log in."`
- Line 56: `"Invalid payment type or missing ID"`
- Line 71: `"Payment failed"`
- Line 83: `"Payment failed. Please try again."`
- Line 99: `"Payment Successful!"`
- Line 102-104: Conditional messages (booking/extension)
- Line 119: `"DEMO MODE"`
- Line 124: `"This is a simulated payment for demonstration purposes."`
- Line 127: `"No real payment will be processed. Click "Pay with Demo" to simulate a successful payment."`
- Line 136: `"Payment Method:"`
- Line 137: `"Demo Payment (Simulated)"`
- Line 142: `"Booking ID:"`
- Line 149: `"Extension ID:"`
- Line 165: `"Total Amount:"`
- Line 180: `"Processing Demo Payment..."`
- Line 185: `"Pay with Demo ({amount.toFixed(2)} EUR)"`
- Line 192: `"Demo payment mode - No real charges will be made. This is for testing purposes only."`

---

### 1.5 `app/[locale]/customer/booking/payment/page.tsx`

**Hardcoded Strings:**
- Line 25: `"No booking ID provided"`
- Line 53: `"Failed to fetch booking"`
- Line 59: `"Failed to fetch booking"`
- Line 80: `"Loading booking details..."`
- Line 91: `"Error"`
- Line 95: `"Go to Dashboard"`
- Line 120: `"This is a demonstration environment. No real payments will be processed."`
- Line 128: `"Complete Your Booking"`
- Line 130: `"Review your booking details and complete the payment to confirm your service appointment."`
- Line 164: `"What happens next?"`
- Line 167-170: Ordered steps
- Line 175: `"Cancellation Policy"`
- Line 177: `"You can cancel your booking up to 24 hours before the scheduled pickup time for a full refund."`

**Problem:** Line 68 + 94 - hardcoded locale redirect

---

### 1.6 `app/[locale]/customer/booking/confirmation/page.tsx`

**Hardcoded Strings:**
- Line 31: `"No booking ID provided"`
- Line 59: `"Failed to fetch booking"`
- Line 65: `"Failed to fetch booking"`
- Line 87: `"Loading confirmation..."`
- Line 98: `"Error"`
- Line 104: `"Go to Dashboard"`
- Line 121: `"Booking Confirmed!"`
- Line 123: `"Your booking has been successfully confirmed. We've sent a confirmation email to your registered email address."`
- Line 136: `"Booking Details"`
- Line 141: `"Booking Number"`
- Line 149: `"Service"`
- Line 157: `"Vehicle"`
- Line 169: `"Pickup Date & Time"`
- Line 184: `"Pickup Address"`
- Line 196: `"What happens next?"`
- Line 204: `"You'll receive a confirmation email"`
- Line 207: `"Check your inbox for the booking details and receipt"`
- Line 217: `"A jockey will be assigned"`
- Line 220: `"You'll be notified when a jockey is assigned to your booking"`
- Line 230: `"Vehicle pickup at scheduled time"`
- Line 233: `"Make sure your vehicle is ready at the scheduled pickup time"`
- Line 243: `"Service completion and delivery"`
- Line 246: `"Track your booking status in your dashboard"`
- Line 260: `"Go to Dashboard"`
- Line 269: `"Print Confirmation"`
- Line 276: `"Need help?"`
- Line 277: `"Contact our support team"`

**Problem:** Line 46, 101 - hardcoded locale redirect

---

## 2. Extension & Workshop Modals

### 2.1 `components/customer/ExtensionApprovalModal.tsx`

**STATUS:** Bereits implementiert mit `useLanguage()` ✅
**Translation Object:** Lines 58-248

**Kleine Verbesserung nötig:**
- Line 139: `"Autorisierter Betrag:"` - direkt hardcoded
- Line 471-474: `"Genehmige Erweiterung..."` - direkt hardcoded
- Line 511: `"Genehmige Erweiterung..."` - direkt hardcoded

→ Diese sollten aus dem `t` object kommen

---

### 2.2 `components/customer/ExtensionList.tsx`

**STATUS:** Bereits implementiert mit `useLanguage()` ✅
**Translation Object:** Lines 40-78

**Vollständig i18n-ready!**

---

### 2.3 `components/workshop/OrderDetailsModal.tsx`

**STATUS:** Bereits implementiert mit `useLanguage()` ✅
**Translation Object:** Lines 53-98

**Vollständig i18n-ready!**

---

### 2.4 `components/workshop/ExtensionModal.tsx`

**STATUS:** Bereits implementiert mit `useLanguage()` ✅
**Translation Object:** Lines 53-86

**Kleine Verbesserung nötig:**
- Line 173: `"Position"` / `"Item"` - direkt hardcoded (sollte aus `t` object)

---

## 3. Protected Route & Auth

### 3.1 `components/auth/ProtectedRoute.tsx`

**Hardcoded Strings:**
- Line 31: Hardcoded locale `/de/` in redirect
- Line 38: Hardcoded locale `/de/` in dashboard redirect
- Line 49: `"Laden..."` - nur Deutsch!

**Problem:** Keine i18n-Unterstützung, hardcoded locale

---

### 3.2 Dashboard Pages

#### `app/[locale]/customer/dashboard/page.tsx`

**STATUS:** Teilweise implementiert mit `useLanguage()` ⚠️

**Noch hardcoded:**
- Line 198-199: `"Willkommen zurück, ${user?.firstName}"` / `"Welcome back, ${user?.firstName}"`
- Line 202-204: Conditional descriptions
- Line 287-288: Conditional "Keine Buchungen"
- Line 304: Conditional "Leistungen" / "Services"
- Line 310: Conditional "Fahrzeug" / "Vehicle"
- Line 344-349: Call-to-action Text (nur DE!)

**Problem:** Mehrere hardcoded Texte, die nicht über `t.` abgerufen werden

---

## 4. Fehlende Translation Keys

### Kategorie: Payment

```json
{
  "payment": {
    "summary": {
      "title": "Booking Summary",
      "reviewDetails": "Please review your booking details before payment",
      "service": "Service",
      "vehicle": "Vehicle",
      "licensePlate": "License Plate",
      "pickupDateTime": "Pickup Date & Time",
      "pickupAddress": "Pickup Address",
      "priceBreakdown": "Price Breakdown",
      "basePrice": "Base Price",
      "ageAdjustment": "Age Adjustment",
      "totalAmount": "Total Amount",
      "includesTaxes": "Includes all taxes and fees"
    },
    "form": {
      "bookingId": "Booking ID",
      "totalAmount": "Total Amount",
      "processing": "Processing Payment...",
      "payButton": "Pay {amount} EUR",
      "securityNotice": "Secure payment powered by Stripe. Your payment information is encrypted and secure.",
      "paymentFailed": "Payment failed. Please try again.",
      "unexpectedError": "An unexpected error occurred. Please try again."
    },
    "checkout": {
      "title": "Complete Your Payment",
      "demoMode": "Demo payment mode - No real charges will be made",
      "securePayment": "Secure payment processing powered by Stripe",
      "initializing": "Initializing secure payment...",
      "initFailed": "Payment Initialization Failed",
      "tryAgain": "Try Again",
      "authRequired": "Authentication required. Please log in.",
      "fetchFailed": "Failed to fetch booking",
      "stripeNotConfigured": "Stripe is not configured. Please contact support."
    },
    "demo": {
      "badge": "DEMO MODE",
      "simulationNotice": "This is a simulated payment for demonstration purposes.",
      "noRealCharge": "No real payment will be processed. Click \"Pay with Demo\" to simulate a successful payment.",
      "paymentMethod": "Payment Method",
      "demoPaymentSimulated": "Demo Payment (Simulated)",
      "processing": "Processing Demo Payment...",
      "payButton": "Pay with Demo ({amount} EUR)",
      "testingOnly": "Demo payment mode - No real charges will be made. This is for testing purposes only.",
      "success": "Payment Successful!",
      "bookingConfirmed": "Your booking has been confirmed.",
      "extensionAuthorized": "Extension has been authorized."
    },
    "serviceTypes": {
      "INSPECTION": "Inspection",
      "OIL_SERVICE": "Oil Change",
      "BRAKE_SERVICE": "Brake Service",
      "TUV": "TÜV/MOT",
      "CLIMATE_SERVICE": "Climate Service",
      "CUSTOM": "Custom Service"
    }
  }
}
```

### Kategorie: Booking Pages

```json
{
  "bookingPayment": {
    "loading": "Loading booking details...",
    "error": "Error",
    "invalidBooking": "Invalid booking",
    "goToDashboard": "Go to Dashboard",
    "demoBanner": "This is a demonstration environment. No real payments will be processed.",
    "title": "Complete Your Booking",
    "subtitle": "Review your booking details and complete the payment to confirm your service appointment.",
    "whatNext": {
      "title": "What happens next?",
      "step1": "Complete the payment to confirm your booking",
      "step2": "Receive a confirmation email with all details",
      "step3": "A jockey will be assigned to your booking",
      "step4": "Your vehicle will be picked up at the scheduled time"
    },
    "cancellationPolicy": {
      "title": "Cancellation Policy",
      "text": "You can cancel your booking up to 24 hours before the scheduled pickup time for a full refund."
    }
  },
  "bookingConfirmation": {
    "loading": "Loading confirmation...",
    "title": "Booking Confirmed!",
    "subtitle": "Your booking has been successfully confirmed. We've sent a confirmation email to your registered email address.",
    "bookingDetails": "Booking Details",
    "bookingNumber": "Booking Number",
    "service": "Service",
    "vehicle": "Vehicle",
    "pickupDateTime": "Pickup Date & Time",
    "pickupAddress": "Pickup Address",
    "whatNext": {
      "title": "What happens next?",
      "step1Title": "You'll receive a confirmation email",
      "step1Desc": "Check your inbox for the booking details and receipt",
      "step2Title": "A jockey will be assigned",
      "step2Desc": "You'll be notified when a jockey is assigned to your booking",
      "step3Title": "Vehicle pickup at scheduled time",
      "step3Desc": "Make sure your vehicle is ready at the scheduled pickup time",
      "step4Title": "Service completion and delivery",
      "step4Desc": "Track your booking status in your dashboard"
    },
    "actions": {
      "goToDashboard": "Go to Dashboard",
      "printConfirmation": "Print Confirmation"
    },
    "support": {
      "needHelp": "Need help?",
      "contactSupport": "Contact our support team"
    }
  }
}
```

### Kategorie: Auth & Protected Routes

```json
{
  "protectedRoute": {
    "loading": "Loading..."
  }
}
```

### Kategorie: Dashboard Erweiterungen

```json
{
  "customerDashboard": {
    "welcome": "Welcome back, {name}",
    "overview": "Here's an overview of your bookings.",
    "noBookings": "No bookings available",
    "services": "{count} services",
    "vehicle": "Vehicle",
    "details": "Details",
    "quickAction": {
      "title": "Book New Service",
      "description": "Book your next maintenance appointment with fixed price guarantee now.",
      "button": "Book Now"
    }
  }
}
```

---

## 5. Locale-aware Redirects

**Alle Redirects müssen locale-aware gemacht werden:**

### Files mit Redirect-Problemen:

1. **`components/auth/ProtectedRoute.tsx`**
   - Line 31: `const loginPath = requiredRole ? `/de/${requiredRole}/login` : '/de';`
   - Line 38: `const dashboardPath = `/de/${user.role}/dashboard`;`

2. **`app/[locale]/customer/booking/payment/page.tsx`**
   - Line 40: `router.push(\`/\${locale}/customer/login\`);`  ← **Korrekt!**
   - Line 68: `router.push(\`/\${locale}/customer/booking/confirmation?bookingId=\${bookingId}\`);`  ← **Korrekt!**
   - Line 94: `router.push(\`/\${locale}/customer/dashboard\`);`  ← **Korrekt!**

3. **`app/[locale]/customer/booking/confirmation/page.tsx`**
   - Line 46: `router.push(\`/\${locale}/customer/login\`);`  ← **Korrekt!**
   - Line 101: `router.push(\`/\${locale}/customer/dashboard\`);`  ← **Korrekt!**
   - Line 256: `router.push(\`/\${locale}/customer/dashboard\`);`  ← **Korrekt!**

4. **`app/[locale]/customer/dashboard/page.tsx`**
   - Line 95: `router.push(\`/\${locale}\`);`  ← **Korrekt!**
   - Line 121-154: Alle Links verwenden `\${locale}` ← **Korrekt!**

5. **`components/payment/payment-form.tsx`**
   - Line 67: `return_url: \`\${window.location.origin}/de/customer/booking/confirmation?bookingId=\${bookingId}\``
   - **PROBLEM:** Hardcoded `/de/` → Muss dynamic locale verwenden!

---

## 6. Zusammenfassung - Zu implementierende Änderungen

### Phase 1: Translation Keys erweitern

**Neue Namespaces:**
- `payment.*` - ~40 Keys
- `bookingPayment.*` - ~15 Keys
- `bookingConfirmation.*` - ~20 Keys
- `protectedRoute.*` - ~2 Keys
- `serviceTypes.*` - ~6 Keys

**Gesamt:** ~83 neue Translation Keys

---

### Phase 2: Komponenten patchen

**Kritische Dateien:**
1. ✅ `payment-summary.tsx` - Alle Strings ersetzen
2. ✅ `payment-form.tsx` - Alle Strings + locale fix
3. ✅ `stripe-checkout.tsx` - Alle Strings ersetzen
4. ✅ `demo-payment-form.tsx` - Alle Strings ersetzen
5. ✅ `app/[locale]/customer/booking/payment/page.tsx` - Alle Strings ersetzen
6. ✅ `app/[locale]/customer/booking/confirmation/page.tsx` - Alle Strings ersetzen
7. ✅ `components/auth/ProtectedRoute.tsx` - Locale-aware + loading text
8. ⚠️ `app/[locale]/customer/dashboard/page.tsx` - Restliche hardcoded Texte
9. ⚠️ `ExtensionApprovalModal.tsx` - Kleine Verbesserungen
10. ⚠️ `ExtensionModal.tsx` - Kleine Verbesserungen

---

### Phase 3: Locale-aware Redirects

**Fix in:**
- `components/auth/ProtectedRoute.tsx` → useParams() für locale
- `components/payment/payment-form.tsx` → useParams() für return_url

---

## 7. Akzeptanzkriterien

- ✅ Alle sichtbaren Texte kommen aus `messages/de.json` und `messages/en.json`
- ✅ Keine hardcoded Strings in UI-Komponenten
- ✅ Alle Redirects enthalten `/${locale}/...`
- ✅ Service-Type-Mappings in translations
- ✅ Kein missing-translation Fehler in Konsole
- ✅ Sprache konsistent über Language-Switcher wechselbar

---

## 8. Geschätzte Komplexität

**Zeit-Schätzung:**
- Translation Files erweitern: **30 Minuten**
- Payment Components patchen (6 Files): **60 Minuten**
- Dashboard + Auth patchen (4 Files): **30 Minuten**
- Locale-aware Redirects: **20 Minuten**
- Testing & Validation: **20 Minuten**

**Gesamt:** ~2.5-3 Stunden

---

**Ende des i18n Audit Reports**
