# E2E Test-Szenarien: Detaillierte Testfälle - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Draft
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [Kunden-Portal: Booking Flow](#kunden-portal-booking-flow)
2. [Kunden-Portal: Order Extension](#kunden-portal-order-extension)
3. [Kunden-Portal: Login & Auth](#kunden-portal-login--auth)
4. [Jockey-Portal: Pickup & Delivery](#jockey-portal-pickup--delivery)
5. [Werkstatt-Portal: Order Management](#werkstatt-portal-order-management)
6. [Cross-Portal: Multi-Stakeholder-Journey](#cross-portal-multi-stakeholder-journey)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Kunden-Portal: Booking Flow

### TC-001: Booking Flow - Happy Path (P0 - Critical)

**User Story:** US-001, US-002, US-003, US-004, US-011
**Testfile:** `e2e/customer/booking-flow.critical.spec.ts`
**Priorität:** P0 (Critical)
**Geschätzter Aufwand:** 8 Story Points

#### Szenario
Ein Endkunde bucht eine Inspektion für seinen VW Golf 7 (Baujahr 2015, 85.000 km) und bezahlt online.

#### Preconditions
- Werkstatt Witten existiert im System
- Verfügbare Slots für nächste Woche
- Stripe Test Mode aktiv

#### Test Steps

**Given** ich bin auf der Startseite (localhost:3000)
**When** ich auf "Jetzt buchen" klicke
**Then** gelange ich zur Fahrzeugauswahl

**Step 1: Fahrzeugauswahl**
```typescript
await page.goto('/');
await page.click('text=Jetzt buchen');

// Fahrzeugdaten eingeben
await page.selectOption('select[name="brand"]', 'VW');
await page.selectOption('select[name="model"]', 'Golf 7');
await page.selectOption('select[name="year"]', '2015');
await page.fill('input[name="mileage"]', '85000');

await page.click('button:has-text("Weiter")');
```

**Expected:**
- Alle Pflichtfelder sind vorhanden (Marke, Modell, Baujahr, Kilometerstand)
- Modell-Dropdown zeigt nur VW-Modelle nach Marken-Auswahl
- Navigation zu Service-Auswahl nach erfolgreicher Validierung

**Step 2: Service-Auswahl**
```typescript
// Service wählen
await page.click('button:has-text("Inspektion/Wartung")');

// Festpreis-Anzeige prüfen
const priceElement = page.locator('[data-testid="fixed-price"]');
await expect(priceElement).toContainText('219,00 EUR');
await expect(priceElement).toContainText('Garantierter Festpreis');

await page.click('button:has-text("Weiter")');
```

**Expected:**
- Service-Auswahl zeigt: Inspektion, Ölservice, Bremse, TÜV, Klima
- Festpreis wird angezeigt: 219 EUR für VW Golf 7
- Hinweis: "Zusätzliche Arbeiten werden digital angeboten"

**Step 3: Termin & Adresse**
```typescript
// Slot auswählen (erster verfügbarer)
await page.click('.slot-button:first-of-type');

// Adresse eingeben
await page.fill('input[name="street"]', 'Teststraße 1');
await page.fill('input[name="zip"]', '58452');
await page.fill('input[name="city"]', 'Witten');
await page.fill('input[name="phone"]', '+49 123 456789');

await page.click('button:has-text("Weiter zur Zahlung")');
```

**Expected:**
- Kalender zeigt verfügbare Slots (grün)
- Ausgebuchte Slots sind ausgegraut
- Adresse wird validiert (PLZ-Prüfung)
- Telefon wird validiert (Format)

**Step 4: Payment**
```typescript
// Stripe Test Card
await page.fill('input[name="cardNumber"]', '4242424242424242');
await page.fill('input[name="cardExpiry"]', '12/28');
await page.fill('input[name="cardCvc"]', '123');

await page.click('button:has-text("Jetzt bezahlen")');

// Warten auf Zahlungsbestätigung
await expect(page.locator('text=Buchung erfolgreich')).toBeVisible({ timeout: 15000 });
```

**Expected:**
- Stripe Payment Frame lädt korrekt
- Test Card wird akzeptiert
- Payment Success-Redirect nach Bestätigung

**Step 5: Bestätigung**
```typescript
// Bestätigungsseite prüfen
await expect(page.locator('h1')).toContainText('Buchung erfolgreich');
await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
await expect(page.locator('text=VW Golf 7')).toBeVisible();
await expect(page.locator('text=Teststraße 1')).toBeVisible();

// E-Mail-Hinweis
await expect(page.locator('text=Sie erhalten eine Bestätigung per E-Mail')).toBeVisible();
```

**Expected:**
- Buchungsbestätigung mit Buchungs-ID
- Fahrzeugdaten angezeigt
- Termin und Adresse angezeigt
- Hinweis auf E-Mail-Bestätigung

#### Postconditions
- Buchung existiert in Datenbank (Status: CONFIRMED)
- Slot ist belegt (capacity reduziert)
- Rechnung wurde erstellt
- E-Mail wurde versendet (Mock prüfen)

#### Test Data
```typescript
const testData = {
  vehicle: testVehicles.vwGolf,
  customer: testCustomers.regular,
  service: 'inspection',
  expectedPrice: 219,
};
```

---

### TC-002: Booking Flow - Validierungsfehler (P1 - High)

**User Story:** US-001
**Testfile:** `e2e/customer/booking-validation.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Kunde versucht zu buchen ohne alle Pflichtfelder auszufüllen.

#### Test Cases

**TC-002a: Baujahr fehlt**
```typescript
await page.selectOption('select[name="brand"]', 'VW');
await page.selectOption('select[name="model"]', 'Golf 7');
// Baujahr NICHT auswählen
await page.fill('input[name="mileage"]', '85000');
await page.click('button:has-text("Weiter")');

// Erwartung: Fehlermeldung
await expect(page.locator('.error-message')).toContainText('Baujahr ist erforderlich');
```

**TC-002b: Kilometerstand fehlt**
```typescript
await page.selectOption('select[name="brand"]', 'VW');
await page.selectOption('select[name="model"]', 'Golf 7');
await page.selectOption('select[name="year"]', '2015');
// Kilometerstand NICHT eingeben
await page.click('button:has-text("Weiter")');

// Erwartung: Fehlermeldung
await expect(page.locator('.error-message')).toContainText('Kilometerstand ist erforderlich');
```

**TC-002c: Unrealistischer Kilometerstand**
```typescript
await page.fill('input[name="mileage"]', '999999');
await page.click('button:has-text("Weiter")');

// Erwartung: Validierungswarnung
await expect(page.locator('.warning-message')).toContainText(
  'Kilometerstand erscheint unrealistisch. Bitte prüfen Sie Ihre Eingabe.'
);
```

**TC-002d: PLZ außerhalb Serviceradius**
```typescript
// Fahrzeug & Service auswählen
// ...
await page.fill('input[name="zip"]', '10115'); // Berlin (außerhalb)
await page.click('button:has-text("Weiter")');

// Erwartung: Fehlermeldung
await expect(page.locator('.error-message')).toContainText(
  'Noch nicht in Ihrer Region verfügbar'
);
```

---

### TC-003: Booking Flow - Slot ausgebucht (P1 - High)

**User Story:** US-003
**Testfile:** `e2e/customer/booking-validation.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Kunde versucht einen Slot zu buchen, der bereits voll ist.

#### Preconditions
- Slot 2026-01-15 10:00 ist voll (capacity: 0)

#### Test Steps
```typescript
// Fahrzeug & Service auswählen
// ...

// Versuch, vollen Slot zu buchen
const fullSlot = page.locator('.slot-button[data-slot-id="slot-full"]');
await expect(fullSlot).toHaveClass(/disabled/);
await expect(fullSlot).toBeDisabled();

// Alternative Slots werden angezeigt
await expect(page.locator('.slot-button:not(.disabled)')).toHaveCount(10); // 10 andere Slots
```

**Expected:**
- Volle Slots sind ausgegraut und nicht klickbar
- Alternative Slots werden prominent angezeigt
- Hinweis: "Dieser Termin ist leider ausgebucht"

---

### TC-004: Booking Flow - Payment Failure (P1 - High)

**User Story:** US-011
**Testfile:** `e2e/customer/payment-failure.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Zahlung schlägt fehl (Stripe Test Card declined).

#### Test Steps
```typescript
// Booking Flow bis Payment
// ...

// Stripe Test Card mit Decline
await page.fill('input[name="cardNumber"]', '4000000000000002'); // Declined Card
await page.fill('input[name="cardExpiry"]', '12/28');
await page.fill('input[name="cardCvc"]', '123');

await page.click('button:has-text("Jetzt bezahlen")');

// Erwartung: Error Message
await expect(page.locator('.error-message')).toContainText(
  'Zahlung fehlgeschlagen. Bitte prüfen Sie Ihre Zahlungsmethode.'
);

// Retry-Button vorhanden
await expect(page.locator('button:has-text("Erneut versuchen")')).toBeVisible();

// Booking wurde NICHT erstellt
const bookingCount = await db.appointments.count();
expect(bookingCount).toBe(0);
```

**Expected:**
- Fehlermeldung wird angezeigt
- Retry-Möglichkeit vorhanden
- Keine Buchung erstellt
- User kann andere Payment-Methode wählen

---

## Kunden-Portal: Order Extension

### TC-010: Order Extension Approval - Happy Path (P0 - Critical)

**User Story:** US-009, US-010
**Testfile:** `e2e/customer/order-extension-approval.spec.ts`
**Priorität:** P0 (Critical)

#### Szenario
Ein Kunde erhält ein Auftragserweiterungs-Angebot von der Werkstatt und gibt es frei.

#### Preconditions
- Bestehende Buchung (ID: booking-123)
- Werkstatt hat Auftragserweiterung erstellt (Status: PENDING)
- Auftragserweiterung enthält: Bremsbeläge vorne (219 EUR)

#### Test Steps

**Step 1: Benachrichtigung empfangen**
```typescript
// Mock: Push-Benachrichtigung
await page.goto('/bookings/booking-123');

// Badge mit Notification
await expect(page.locator('[data-testid="notification-badge"]')).toContainText('1');
```

**Step 2: Auftragserweiterung öffnen**
```typescript
await page.click('[data-testid="order-extension-notification"]');

// Auftragserweiterung anzeigen
await expect(page.locator('h2')).toContainText('Zusätzliche Arbeiten erforderlich');
await expect(page.locator('[data-testid="extension-title"]')).toContainText(
  'Bremsbeläge vorne verschlissen'
);
```

**Step 3: Details prüfen**
```typescript
// Beschreibung
await expect(page.locator('[data-testid="extension-description"]')).toContainText(
  'Die Bremsbeläge vorne sind unter 2mm und müssen getauscht werden.'
);

// Fotos
await expect(page.locator('[data-testid="extension-photo"]')).toHaveCount(2);

// Festpreis
await expect(page.locator('[data-testid="extension-price"]')).toContainText('219,00 EUR');

// Buttons
await expect(page.locator('button:has-text("Freigeben")')).toBeVisible();
await expect(page.locator('button:has-text("Ablehnen")')).toBeVisible();
```

**Step 4: Freigabe**
```typescript
await page.click('button:has-text("Freigeben")');

// Payment-Bestätigung
await expect(page.locator('text=Zahlung wird verarbeitet')).toBeVisible();

// Success
await expect(page.locator('text=Freigabe erfolgreich')).toBeVisible({ timeout: 15000 });
await expect(page.locator('text=Die Werkstatt wird informiert')).toBeVisible();
```

**Step 5: Status-Update**
```typescript
// Auftragserweiterung Status = APPROVED
const extension = await db.orderExtensions.findOne({ id: 'ext-123' });
expect(extension.status).toBe('APPROVED');

// Payment wurde verarbeitet
const payment = await db.payments.findOne({ extensionId: 'ext-123' });
expect(payment.status).toBe('SUCCEEDED');
expect(payment.amount).toBe(219 * 100); // Cent
```

#### Expected Results
- Auftragserweiterung wird korrekt angezeigt
- Fotos sind sichtbar und zoombar
- Freigabe löst Payment aus
- Werkstatt erhält Benachrichtigung
- Status wird korrekt aktualisiert

---

### TC-011: Order Extension Rejection (P1 - High)

**User Story:** US-009
**Testfile:** `e2e/customer/order-extension-rejection.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Kunde lehnt ein Auftragserweiterungs-Angebot ab.

#### Test Steps
```typescript
// Auftragserweiterung öffnen
await page.goto('/bookings/booking-123/extensions/ext-123');

// Ablehnen
await page.click('button:has-text("Ablehnen")');

// Optional: Kommentar
await page.fill('textarea[name="rejectionReason"]', 'Mache ich beim nächsten Service');
await page.click('button:has-text("Bestätigen")');

// Success
await expect(page.locator('text=Ablehnung erfolgreich')).toBeVisible();

// Status prüfen
const extension = await db.orderExtensions.findOne({ id: 'ext-123' });
expect(extension.status).toBe('REJECTED');
expect(extension.rejectionReason).toBe('Mache ich beim nächsten Service');
```

**Expected:**
- Ablehnung ohne Payment
- Werkstatt wird informiert
- Auto wird wie ursprünglich gebucht zurückgegeben

---

## Kunden-Portal: Login & Auth

### TC-020: Login mit Magic Link (P1 - High)

**User Story:** US-012
**Testfile:** `e2e/customer/login.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Kunde loggt sich mit Magic Link ein.

#### Test Steps
```typescript
await page.goto('/login');

// E-Mail eingeben
await page.fill('input[name="email"]', 'test+customer@ronja.example.com');
await page.click('button:has-text("Login-Code senden")');

// Success Message
await expect(page.locator('text=Code wurde per E-Mail versendet')).toBeVisible();

// Mock: E-Mail mit Code erhalten
const magicLink = await getLastMagicLink('test+customer@ronja.example.com');

// Magic Link öffnen
await page.goto(magicLink);

// Eingeloggt
await expect(page.locator('text=Willkommen zurück')).toBeVisible();
await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
```

#### Expected:
- Magic Link wird versendet
- Link ist 15 Minuten gültig
- Nach Klick ist User eingeloggt
- Session-Cookie wird gesetzt

---

### TC-021: Session Timeout (P2 - Medium)

**User Story:** US-012
**Testfile:** `e2e/customer/login.spec.ts`
**Priorität:** P2 (Medium)

#### Szenario
Nach 30 Minuten Inaktivität wird User ausgeloggt.

#### Test Steps
```typescript
// Einloggen
await loginAsCustomer('test+customer@ronja.example.com');

// Session-Cookie manuell auf "abgelaufen" setzen
await page.context().addCookies([
  {
    name: 'session',
    value: 'expired-token',
    domain: 'localhost',
    path: '/',
    expires: Date.now() / 1000 - 3600, // abgelaufen
  },
]);

// Geschützte Seite aufrufen
await page.goto('/bookings');

// Erwartung: Redirect zu Login
await expect(page).toHaveURL(/\/login/);
await expect(page.locator('text=Sitzung abgelaufen')).toBeVisible();
```

---

## Jockey-Portal: Pickup & Delivery

### TC-030: Jockey Pickup Flow (P1 - High)

**User Story:** US-006, US-021
**Testfile:** `e2e/jockey/pickup-flow.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Jockey holt ein Fahrzeug beim Kunden ab.

#### Preconditions
- Jockey ist eingeloggt (Username: jockey@witten.ronja)
- Auftrag für heute zugewiesen (Abholung 10:00-12:00)

#### Test Steps

**Step 1: Dashboard**
```typescript
await loginAsJockey('jockey@witten.ronja', 'password123');

// Dashboard zeigt heutige Aufträge
await expect(page.locator('h1')).toContainText('Heutige Aufträge');
await expect(page.locator('[data-testid="pickup-card"]')).toHaveCount(3);
```

**Step 2: Auftrags-Details öffnen**
```typescript
await page.click('[data-testid="pickup-card"]:first-of-type');

// Details anzeigen
await expect(page.locator('[data-testid="customer-name"]')).toContainText('Max Mustermann');
await expect(page.locator('[data-testid="customer-address"]')).toContainText('Teststraße 1, 58452 Witten');
await expect(page.locator('[data-testid="customer-phone"]')).toContainText('+49 123 456789');
await expect(page.locator('[data-testid="vehicle"]')).toContainText('VW Golf 7');

// Navigation-Button
await expect(page.locator('a:has-text("Navigation starten")')).toHaveAttribute(
  'href',
  /maps\.google\.com/
);
```

**Step 3: Übergabeprotokoll**
```typescript
await page.click('button:has-text("Abholung starten")');

// Checkliste
await page.check('input[name="vehicleClean"]');
await page.check('input[name="noVisibleDamage"]');
await page.fill('textarea[name="additionalNotes"]', 'Kunde fragt nach Wischblättern');

// Kilometerstand erfassen
await page.fill('input[name="mileage"]', '85120');

// Fotos hochladen
await page.setInputFiles('input[type="file"]', [
  'test-data/vehicle-front.jpg',
  'test-data/vehicle-side.jpg',
]);

// Fahrzeugschein fotografieren
await page.setInputFiles('input[name="vehicleDocument"]', 'test-data/fahrzeugschein.jpg');
```

**Step 4: Abschluss**
```typescript
await page.click('button:has-text("Abholung abschließen")');

// Success
await expect(page.locator('text=Abholung erfolgreich')).toBeVisible();

// Status-Update im System
const appointment = await db.appointments.findOne({ id: 'booking-123' });
expect(appointment.status).toBe('PICKED_UP');

// Kunde erhält Benachrichtigung
const notification = await getLastNotification('test+customer@ronja.example.com');
expect(notification.message).toContain('Ihr Auto ist auf dem Weg zur Werkstatt');
```

---

### TC-031: Jockey Delivery Flow (P1 - High)

**User Story:** US-007
**Testfile:** `e2e/jockey/delivery-flow.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Ein Jockey bringt das Fahrzeug zum Kunden zurück.

#### Test Steps
```typescript
// Dashboard
await page.goto('/jockey/dashboard');
await page.click('[data-testid="delivery-card"]:first-of-type');

// Rückgabe starten
await page.click('button:has-text("Rückgabe starten")');

// Checkliste
await page.check('input[name="vehicleWashed"]'); // Auto gewaschen
await page.check('input[name="screenCleanerAdded"]'); // Giveaway
await page.check('input[name="serviceBookStamped"]'); // Serviceheft

// Abschluss
await page.click('button:has-text("Rückgabe abschließen")');

// Status
const appointment = await db.appointments.findOne({ id: 'booking-123' });
expect(appointment.status).toBe('COMPLETED');
```

---

## Werkstatt-Portal: Order Management

### TC-040: Order Extension Create (P0 - Critical)

**User Story:** US-008
**Testfile:** `e2e/workshop/order-extension-create.critical.spec.ts`
**Priorität:** P0 (Critical)

#### Szenario
Werkstatt-Mitarbeiter erstellt eine Auftragserweiterung für Bremsbeläge.

#### Preconditions
- Werkstatt-Mitarbeiter eingeloggt (Username: werkstatt@witten.ronja)
- Auftrag booking-123 ist "IN_PROGRESS"

#### Test Steps

**Step 1: Dashboard**
```typescript
await loginAsWorkshop('werkstatt@witten.ronja', 'password123');

// Offene Aufträge
await expect(page.locator('h1')).toContainText('Auftragsübersicht');
await expect(page.locator('[data-testid="order-card"]')).toHaveCount(5);
```

**Step 2: Auftrag öffnen**
```typescript
await page.click('[data-testid="order-card"]:first-of-type');

// Auftrags-Details
await expect(page.locator('[data-testid="vehicle"]')).toContainText('VW Golf 7');
await expect(page.locator('[data-testid="service"]')).toContainText('Inspektion/Wartung');
await expect(page.locator('[data-testid="customer"]')).toContainText('Max Mustermann');
```

**Step 3: Auftragserweiterung erstellen**
```typescript
await page.click('button:has-text("Auftragserweiterung erstellen")');

// Formular
await page.fill('input[name="title"]', 'Bremsbeläge vorne verschlissen');
await page.fill('textarea[name="description"]',
  'Die Bremsbeläge vorne sind unter 2mm und müssen getauscht werden. Sicherheitsrisiko.'
);

// Fotos hochladen (Drag & Drop)
await page.setInputFiles('input[type="file"]', [
  'test-data/brake-pad-1.jpg',
  'test-data/brake-pad-2.jpg',
]);

// Festpreis
await page.fill('input[name="price"]', '219');

// Absenden
await page.click('button:has-text("An Kunde senden")');

// Success
await expect(page.locator('text=Angebot wurde versendet')).toBeVisible();
```

**Step 4: Status prüfen**
```typescript
// Auftragserweiterung im System
const extension = await db.orderExtensions.findOne({ appointmentId: 'booking-123' });
expect(extension.status).toBe('PENDING');
expect(extension.title).toBe('Bremsbeläge vorne verschlissen');
expect(extension.price).toBe(219 * 100); // Cent

// Kunde erhält Benachrichtigung
const notification = await getLastNotification('test+customer@ronja.example.com');
expect(notification.type).toBe('ORDER_EXTENSION');
```

---

### TC-041: Order Extension Status Tracking (P1 - High)

**User Story:** US-008
**Testfile:** `e2e/workshop/order-extension-workflow.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Werkstatt sieht Status-Updates von Auftragserweiterungen.

#### Test Steps
```typescript
// Dashboard
await page.goto('/workshop/dashboard');
await page.click('[data-testid="order-card"]:first-of-type');

// Auftragserweiterung-Liste
await expect(page.locator('[data-testid="extension-list"]')).toBeVisible();

// Status: PENDING
await expect(page.locator('[data-testid="extension-status"]')).toContainText('Wartet auf Kunde');

// Mock: Kunde gibt frei
await approveOrderExtension('ext-123');

// Reload
await page.reload();

// Status: APPROVED
await expect(page.locator('[data-testid="extension-status"]')).toContainText('Freigegeben');
await expect(page.locator('[data-testid="extension-status"]')).toHaveClass(/bg-green/);

// Call-to-Action
await expect(page.locator('button:has-text("Arbeit durchführen")')).toBeVisible();
```

---

## Cross-Portal: Multi-Stakeholder-Journey

### TC-050: End-to-End Multi-Portal Flow (P0 - Critical)

**User Story:** Alle
**Testfile:** `e2e/cross-portal/complete-journey.critical.spec.ts`
**Priorität:** P0 (Critical)

#### Szenario
Vollständige Customer Journey über alle drei Portale hinweg.

#### Test Steps

**Phase 1: Kunde bucht (Kunden-Portal)**
```typescript
// Booking Flow komplett
await bookService({
  vehicle: testVehicles.vwGolf,
  service: 'inspection',
  slot: '2026-01-15 10:00',
  customer: testCustomers.regular,
});

const bookingId = await getLastBookingId();
expect(bookingId).toBeTruthy();
```

**Phase 2: Jockey holt ab (Jockey-Portal)**
```typescript
// Neuer Browser-Context (separater User)
const jockeyContext = await browser.newContext();
const jockeyPage = await jockeyContext.newPage();

await loginAsJockey(jockeyPage, 'jockey@witten.ronja', 'password123');

// Abholung durchführen
await pickupVehicle(jockeyPage, bookingId);

// Status prüfen
const appointment = await db.appointments.findOne({ id: bookingId });
expect(appointment.status).toBe('PICKED_UP');
```

**Phase 3: Werkstatt erstellt Auftragserweiterung (Werkstatt-Portal)**
```typescript
// Neuer Browser-Context
const workshopContext = await browser.newContext();
const workshopPage = await workshopContext.newPage();

await loginAsWorkshop(workshopPage, 'werkstatt@witten.ronja', 'password123');

// Auftragserweiterung erstellen
await createOrderExtension(workshopPage, bookingId, {
  title: 'Bremsbeläge vorne',
  description: 'Verschlissen',
  price: 219,
  photos: ['brake-1.jpg', 'brake-2.jpg'],
});
```

**Phase 4: Kunde gibt frei (Kunden-Portal)**
```typescript
// Zurück zum Kunden-Context
// (Kunde erhält Push-Benachrichtigung)

await page.goto(`/bookings/${bookingId}/extensions`);
await approveExtension(page);

// Payment erfolgreich
await expect(page.locator('text=Freigabe erfolgreich')).toBeVisible();
```

**Phase 5: Werkstatt führt durch (Werkstatt-Portal)**
```typescript
// Werkstatt sieht Freigabe
await workshopPage.reload();
await expect(workshopPage.locator('[data-testid="extension-status"]')).toContainText('Freigegeben');

// Arbeit abschließen
await workshopPage.click('button:has-text("Arbeit abgeschlossen")');
```

**Phase 6: Jockey bringt zurück (Jockey-Portal)**
```typescript
// Rückgabe
await deliverVehicle(jockeyPage, bookingId);

// Status: COMPLETED
const finalAppointment = await db.appointments.findOne({ id: bookingId });
expect(finalAppointment.status).toBe('COMPLETED');
```

**Phase 7: Kunde gibt Bewertung (Kunden-Portal)**
```typescript
await page.goto(`/bookings/${bookingId}/review`);
await page.click('[data-testid="star-5"]'); // 5 Sterne
await page.fill('textarea[name="comment"]', 'Super Service!');
await page.click('button:has-text("Bewertung abgeben")');

// Success
await expect(page.locator('text=Vielen Dank für Ihre Bewertung')).toBeVisible();
```

---

## Edge Cases & Error Handling

### TC-060: Concurrent Slot Booking (P0 - Critical)

**User Story:** US-003, US-015
**Testfile:** `e2e/edge-cases/concurrent-booking.spec.ts`
**Priorität:** P0 (Critical)

#### Szenario
Zwei Kunden versuchen gleichzeitig denselben Slot zu buchen (Race Condition).

#### Test Steps
```typescript
// Slot mit capacity = 1
const slotId = 'slot-limited';

// Zwei parallele Browser-Contexts
const context1 = await browser.newContext();
const context2 = await browser.newContext();

const page1 = await context1.newPage();
const page2 = await context2.newPage();

// Beide starten Booking Flow parallel
const booking1 = bookService(page1, { slot: slotId });
const booking2 = bookService(page2, { slot: slotId });

// Parallele Ausführung
const results = await Promise.allSettled([booking1, booking2]);

// Einer erfolgreich, einer schlägt fehl
const successes = results.filter(r => r.status === 'fulfilled');
const failures = results.filter(r => r.status === 'rejected');

expect(successes).toHaveLength(1);
expect(failures).toHaveLength(1);

// Error Message bei zweitem User
const failedPage = failures[0].reason.page;
await expect(failedPage.locator('.error-message')).toContainText(
  'Dieser Termin wurde gerade gebucht. Bitte wählen Sie einen anderen.'
);
```

**Expected:**
- Pessimistic Locking verhindert Doppelbuchung
- Zweiter User erhält klare Fehlermeldung
- Alternative Slots werden angeboten

---

### TC-061: Payment Webhook Failure (P1 - High)

**User Story:** US-011
**Testfile:** `e2e/edge-cases/payment-webhook-failure.spec.ts`
**Priorität:** P1 (High)

#### Szenario
Stripe Webhook schlägt fehl oder kommt verspätet an.

#### Test Steps
```typescript
// Mock: Webhook wird blockiert
await mockWebhookFailure();

// Booking mit Payment
await bookService({ ...testData });

// Payment erfolgreich in Stripe, aber Webhook fehlt
// System sollte Fallback-Mechanismus haben

// Polling nach Payment-Status
await page.waitForTimeout(5000); // 5s warten

// Status sollte dennoch aktualisiert sein (via Polling)
const appointment = await db.appointments.findOne({ email: testCustomers.regular.email });
expect(appointment.status).toBe('CONFIRMED');
```

---

### TC-062: Session Hijacking Prevention (P0 - Critical)

**User Story:** Security
**Testfile:** `e2e/edge-cases/security.spec.ts`
**Priorität:** P0 (Critical)

#### Szenario
Ein Angreifer versucht mit gestohlenem Session-Token zuzugreifen.

#### Test Steps
```typescript
// Kunde loggt sich ein
await loginAsCustomer('test+customer@ronja.example.com');
const sessionCookie = await getSessionCookie(page);

// Neuer Browser (Angreifer)
const attackerContext = await browser.newContext();
const attackerPage = await attackerContext.newPage();

// Versucht Session-Cookie zu übernehmen
await attackerContext.addCookies([sessionCookie]);

await attackerPage.goto('/bookings');

// Erwartung: Abgelehnt (IP-Check oder Token-Binding)
await expect(attackerPage).toHaveURL(/\/login/);
await expect(attackerPage.locator('text=Ungültige Sitzung')).toBeVisible();
```

---

## Test Data Summary

### Fahrzeuge
```typescript
const testVehicles = {
  vwGolf: { brand: 'VW', model: 'Golf 7', year: 2015, mileage: 85000 },
  audiA4: { brand: 'Audi', model: 'A4 B9', year: 2018, mileage: 45000 },
  bmw5er: { brand: 'BMW', model: '5er G30', year: 2017, mileage: 60000 },
};
```

### Kunden
```typescript
const testCustomers = {
  regular: { email: 'test+customer@ronja.example.com', phone: '+49 123 456789' },
  witten: { email: 'test+witten@ronja.example.com', phone: '+49 234 567890' },
};
```

### Payment
```typescript
const stripeTestCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
};
```

---

## Nächste Schritte

1. ✅ Test-Szenarien definiert (dieses Dokument)
2. 🔲 Playwright Setup & Page Objects implementieren
3. 🔲 Kritische Tests implementieren (TC-001, TC-010, TC-040, TC-050)
4. 🔲 Regression Tests implementieren (TC-002 bis TC-062)
5. 🔲 CI/CD Pipeline konfigurieren

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - 60+ Test-Szenarien definiert
