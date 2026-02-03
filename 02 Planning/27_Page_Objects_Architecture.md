# Page Objects Architecture - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready to Implement
**Autor:** QA & Test Engineer

---

## Inhaltsverzeichnis

1. [Page Object Pattern Grundlagen](#page-object-pattern-grundlagen)
2. [Architektur & Design-Prinzipien](#architektur--design-prinzipien)
3. [Kunden-Portal Page Objects](#kunden-portal-page-objects)
4. [Jockey-Portal Page Objects](#jockey-portal-page-objects)
5. [Werkstatt-Portal Page Objects](#werkstatt-portal-page-objects)
6. [Shared Components](#shared-components)
7. [Verwendung in Tests](#verwendung-in-tests)
8. [Best Practices](#best-practices)

---

## Page Object Pattern Grundlagen

### Was ist das Page Object Pattern?

Das **Page Object Pattern** ist ein Design Pattern für Test-Automatisierung, das:
- UI-Logik von Test-Logik trennt
- Wiederverwendbarkeit fördert
- Wartbarkeit verbessert
- Code-Duplikation reduziert

### Vorteile

1. **Single Source of Truth**: Selektoren nur an einer Stelle
2. **Bessere Wartbarkeit**: UI-Änderungen nur in Page Objects anpassen
3. **Lesbarere Tests**: Tests beschreiben "Was", nicht "Wie"
4. **Typsicherheit**: TypeScript-Support für alle Interaktionen

### Beispiel: Vorher vs. Nachher

**Vorher (ohne Page Objects):**
```typescript
test('Booking Flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Jetzt buchen")');
  await page.selectOption('select[name="brand"]', 'VW');
  await page.selectOption('select[name="model"]', 'Golf 7');
  // ... 50 Zeilen Code
});
```

**Nachher (mit Page Objects):**
```typescript
test('Booking Flow', async ({ page }) => {
  const bookingPage = new BookingPage(page);

  await bookingPage.goto();
  await bookingPage.selectVehicle(testVehicles.vwGolf);
  await bookingPage.selectService('inspection');
  await bookingPage.selectSlot();
  await bookingPage.fillAddress(testCustomers.regular);
  await bookingPage.payWithStripe('success');

  await expect(bookingPage.confirmationMessage).toBeVisible();
});
```

---

## Architektur & Design-Prinzipien

### Verzeichnisstruktur

```
tests/shared/page-objects/
├── base/
│   ├── BasePage.ts           # Basis-Klasse für alle Pages
│   └── BaseComponent.ts      # Basis für Komponenten
├── customer/
│   ├── BookingPage.ts
│   ├── VehicleSelectionPage.ts
│   ├── ServiceSelectionPage.ts
│   ├── SlotSelectionPage.ts
│   ├── PaymentPage.ts
│   ├── OrderExtensionPage.ts
│   └── LoginPage.ts
├── jockey/
│   ├── DashboardPage.ts
│   ├── PickupPage.ts
│   ├── DeliveryPage.ts
│   └── HandoverProtocolPage.ts
├── workshop/
│   ├── DashboardPage.ts
│   ├── OrderListPage.ts
│   └── OrderExtensionPage.ts
└── components/
    ├── Header.ts
    ├── Footer.ts
    ├── Modal.ts
    └── NotificationBanner.ts
```

### Design-Prinzipien

1. **Ein Page Object pro Seite/View**
2. **Methoden beschreiben User-Aktionen** (nicht technische Details)
3. **Keine Assertions in Page Objects** (nur in Tests)
4. **Typsichere Parameter** (TypeScript Interfaces)
5. **Fluent API** (Method Chaining wo sinnvoll)

---

## Kunden-Portal Page Objects

### Base Page (`tests/shared/page-objects/base/BasePage.ts`)

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * Basis-Klasse für alle Page Objects
 * Enthält gemeinsame Funktionalität
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigiert zur Seite
   */
  abstract goto(): Promise<void>;

  /**
   * Prüft ob Seite geladen ist
   */
  abstract isLoaded(): Promise<boolean>;

  /**
   * Wartet auf Netzwerk-Idle (nützlich nach Aktionen)
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Screenshot erstellen
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
```

### Vehicle Selection Page

**`tests/shared/page-objects/customer/VehicleSelectionPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export interface VehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

/**
 * Page Object für Fahrzeugauswahl (Step 1 im Booking Flow)
 */
export class VehicleSelectionPage extends BasePage {
  // Locators
  readonly brandSelect: Locator;
  readonly modelSelect: Locator;
  readonly yearSelect: Locator;
  readonly mileageInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.brandSelect = page.locator('select[name="brand"]');
    this.modelSelect = page.locator('select[name="model"]');
    this.yearSelect = page.locator('select[name="year"]');
    this.mileageInput = page.locator('input[name="mileage"]');
    this.continueButton = page.locator('button:has-text("Weiter")');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/booking/vehicle');
  }

  async isLoaded(): Promise<boolean> {
    return await this.brandSelect.isVisible();
  }

  /**
   * Fahrzeugdaten auswählen
   */
  async selectVehicle(vehicle: VehicleData) {
    await this.brandSelect.selectOption(vehicle.brand);
    await this.modelSelect.selectOption(vehicle.model);
    await this.yearSelect.selectOption(String(vehicle.year));
    await this.mileageInput.fill(String(vehicle.mileage));
  }

  /**
   * Marke auswählen
   */
  async selectBrand(brand: string) {
    await this.brandSelect.selectOption(brand);
  }

  /**
   * Verfügbare Modelle nach Marken-Auswahl abrufen
   */
  async getAvailableModels(): Promise<string[]> {
    const options = await this.modelSelect.locator('option').allTextContents();
    return options.filter(opt => opt !== 'Bitte wählen');
  }

  /**
   * Kilometerstand eingeben
   */
  async enterMileage(mileage: number) {
    await this.mileageInput.fill(String(mileage));
  }

  /**
   * Weiter zur Service-Auswahl
   */
  async continue() {
    await this.continueButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Formular ausfüllen und weiter
   */
  async fillAndContinue(vehicle: VehicleData) {
    await this.selectVehicle(vehicle);
    await this.continue();
  }

  /**
   * Fehlermeldung abrufen
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}
```

### Service Selection Page

**`tests/shared/page-objects/customer/ServiceSelectionPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export type ServiceType = 'inspection' | 'oil' | 'brake' | 'tuv' | 'climate';

/**
 * Page Object für Service-Auswahl (Step 2)
 */
export class ServiceSelectionPage extends BasePage {
  readonly inspectionButton: Locator;
  readonly oilServiceButton: Locator;
  readonly brakeServiceButton: Locator;
  readonly tuvButton: Locator;
  readonly climateButton: Locator;
  readonly fixedPriceDisplay: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);

    this.inspectionButton = page.locator('button[data-service="inspection"]');
    this.oilServiceButton = page.locator('button[data-service="oil"]');
    this.brakeServiceButton = page.locator('button[data-service="brake"]');
    this.tuvButton = page.locator('button[data-service="tuv"]');
    this.climateButton = page.locator('button[data-service="climate"]');
    this.fixedPriceDisplay = page.locator('[data-testid="fixed-price"]');
    this.continueButton = page.locator('button:has-text("Weiter")');
  }

  async goto() {
    await this.page.goto('/booking/service');
  }

  async isLoaded(): Promise<boolean> {
    return await this.inspectionButton.isVisible();
  }

  /**
   * Service auswählen
   */
  async selectService(service: ServiceType) {
    const serviceButtons = {
      inspection: this.inspectionButton,
      oil: this.oilServiceButton,
      brake: this.brakeServiceButton,
      tuv: this.tuvButton,
      climate: this.climateButton,
    };

    await serviceButtons[service].click();
  }

  /**
   * Festpreis abrufen
   */
  async getFixedPrice(): Promise<number> {
    const priceText = await this.fixedPriceDisplay.textContent();
    const match = priceText?.match(/(\d+),(\d+)/);
    if (!match) throw new Error('Preis nicht gefunden');

    return parseFloat(`${match[1]}.${match[2]}`);
  }

  /**
   * Prüfen ob Festpreis-Garantie angezeigt wird
   */
  async hasFixedPriceGuarantee(): Promise<boolean> {
    return await this.fixedPriceDisplay.locator('text=Garantierter Festpreis').isVisible();
  }

  /**
   * Weiter zur Terminauswahl
   */
  async continue() {
    await this.continueButton.click();
    await this.waitForNetworkIdle();
  }
}
```

### Slot Selection Page

**`tests/shared/page-objects/customer/SlotSelectionPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export interface AddressData {
  street: string;
  zip: string;
  city: string;
  phone: string;
}

/**
 * Page Object für Termin- und Adress-Auswahl (Step 3)
 */
export class SlotSelectionPage extends BasePage {
  readonly slotButtons: Locator;
  readonly streetInput: Locator;
  readonly zipInput: Locator;
  readonly cityInput: Locator;
  readonly phoneInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);

    this.slotButtons = page.locator('.slot-button:not(.disabled)');
    this.streetInput = page.locator('input[name="street"]');
    this.zipInput = page.locator('input[name="zip"]');
    this.cityInput = page.locator('input[name="city"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.continueButton = page.locator('button:has-text("Weiter zur Zahlung")');
  }

  async goto() {
    await this.page.goto('/booking/slot');
  }

  async isLoaded(): Promise<boolean> {
    return await this.slotButtons.first().isVisible();
  }

  /**
   * Ersten verfügbaren Slot auswählen
   */
  async selectFirstAvailableSlot() {
    await this.slotButtons.first().click();
  }

  /**
   * Slot nach Datum/Zeit auswählen
   */
  async selectSlot(date: string, time: string) {
    await this.page.locator(`.slot-button[data-date="${date}"][data-time="${time}"]`).click();
  }

  /**
   * Verfügbare Slots zählen
   */
  async getAvailableSlotCount(): Promise<number> {
    return await this.slotButtons.count();
  }

  /**
   * Adresse eingeben
   */
  async fillAddress(address: AddressData) {
    await this.streetInput.fill(address.street);
    await this.zipInput.fill(address.zip);
    await this.cityInput.fill(address.city);
    await this.phoneInput.fill(address.phone);
  }

  /**
   * Weiter zur Zahlung
   */
  async continue() {
    await this.continueButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Slot + Adresse und weiter
   */
  async selectSlotAndFillAddress(address: AddressData) {
    await this.selectFirstAvailableSlot();
    await this.fillAddress(address);
    await this.continue();
  }
}
```

### Payment Page

**`tests/shared/page-objects/customer/PaymentPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { STRIPE_TEST_CARDS } from '../../helpers/payment.helpers';

/**
 * Page Object für Zahlung (Step 4)
 */
export class PaymentPage extends BasePage {
  readonly paymentSummary: Locator;
  readonly totalAmount: Locator;
  readonly payButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.paymentSummary = page.locator('[data-testid="payment-summary"]');
    this.totalAmount = page.locator('[data-testid="total-amount"]');
    this.payButton = page.locator('button:has-text("Jetzt bezahlen")');
    this.successMessage = page.locator('text=Zahlung erfolgreich');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/booking/payment');
  }

  async isLoaded(): Promise<boolean> {
    return await this.paymentSummary.isVisible();
  }

  /**
   * Mit Stripe Test Card bezahlen
   */
  async payWithCard(cardType: keyof typeof STRIPE_TEST_CARDS = 'success') {
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]');

    await stripeFrame.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARDS[cardType]);
    await stripeFrame.locator('input[name="exp-date"]').fill('12/28');
    await stripeFrame.locator('input[name="cvc"]').fill('123');
    await stripeFrame.locator('input[name="postal"]').fill('12345');

    await this.payButton.click();
  }

  /**
   * Gesamtbetrag abrufen
   */
  async getTotalAmount(): Promise<number> {
    const text = await this.totalAmount.textContent();
    const match = text?.match(/(\d+),(\d+)/);
    if (!match) throw new Error('Betrag nicht gefunden');

    return parseFloat(`${match[1]}.${match[2]}`);
  }

  /**
   * Warten auf Payment-Erfolg
   */
  async waitForSuccess(timeout: number = 15000) {
    await this.successMessage.waitFor({ state: 'visible', timeout });
  }

  /**
   * Fehlermeldung abrufen
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}
```

### Booking Page (Wrapper für kompletten Flow)

**`tests/shared/page-objects/customer/BookingPage.ts`:**

```typescript
import { Page } from '@playwright/test';
import { VehicleSelectionPage, VehicleData } from './VehicleSelectionPage';
import { ServiceSelectionPage, ServiceType } from './ServiceSelectionPage';
import { SlotSelectionPage, AddressData } from './SlotSelectionPage';
import { PaymentPage } from './PaymentPage';

/**
 * High-Level Page Object für kompletten Booking Flow
 * Kombiniert alle Sub-Pages
 */
export class BookingPage {
  readonly page: Page;
  readonly vehicleSelection: VehicleSelectionPage;
  readonly serviceSelection: ServiceSelectionPage;
  readonly slotSelection: SlotSelectionPage;
  readonly payment: PaymentPage;

  constructor(page: Page) {
    this.page = page;
    this.vehicleSelection = new VehicleSelectionPage(page);
    this.serviceSelection = new ServiceSelectionPage(page);
    this.slotSelection = new SlotSelectionPage(page);
    this.payment = new PaymentPage(page);
  }

  /**
   * Kompletten Booking Flow durchführen (Happy Path)
   */
  async completeBooking(
    vehicle: VehicleData,
    service: ServiceType,
    address: AddressData
  ) {
    // Step 1: Fahrzeug
    await this.vehicleSelection.goto();
    await this.vehicleSelection.fillAndContinue(vehicle);

    // Step 2: Service
    await this.serviceSelection.selectService(service);
    await this.serviceSelection.continue();

    // Step 3: Slot & Adresse
    await this.slotSelection.selectSlotAndFillAddress(address);

    // Step 4: Payment
    await this.payment.payWithCard('success');
    await this.payment.waitForSuccess();
  }

  /**
   * Booking Flow bis zu bestimmtem Schritt
   */
  async goToStep(step: 'vehicle' | 'service' | 'slot' | 'payment') {
    await this.page.goto('/booking');
    await this.page.click('button:has-text("Jetzt buchen")');

    if (step === 'vehicle') return;
    // ... weitere Steps bei Bedarf
  }
}
```

### Order Extension Page

**`tests/shared/page-objects/customer/OrderExtensionPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Page Object für Auftragserweiterung (Kunde)
 */
export class OrderExtensionPage extends BasePage {
  readonly title: Locator;
  readonly description: Locator;
  readonly photos: Locator;
  readonly price: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.title = page.locator('[data-testid="extension-title"]');
    this.description = page.locator('[data-testid="extension-description"]');
    this.photos = page.locator('[data-testid="extension-photo"]');
    this.price = page.locator('[data-testid="extension-price"]');
    this.approveButton = page.locator('button:has-text("Freigeben")');
    this.rejectButton = page.locator('button:has-text("Ablehnen")');
    this.successMessage = page.locator('text=Freigabe erfolgreich');
  }

  async goto(bookingId: string, extensionId: string) {
    await this.page.goto(`/bookings/${bookingId}/extensions/${extensionId}`);
  }

  async isLoaded(): Promise<boolean> {
    return await this.title.isVisible();
  }

  /**
   * Auftragserweiterung freigeben
   */
  async approve() {
    await this.approveButton.click();
    await this.successMessage.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Auftragserweiterung ablehnen
   */
  async reject(reason?: string) {
    await this.rejectButton.click();

    if (reason) {
      await this.page.fill('textarea[name="rejectionReason"]', reason);
      await this.page.click('button:has-text("Bestätigen")');
    }
  }

  /**
   * Anzahl Fotos abrufen
   */
  async getPhotoCount(): Promise<number> {
    return await this.photos.count();
  }

  /**
   * Preis abrufen
   */
  async getPrice(): Promise<number> {
    const text = await this.price.textContent();
    const match = text?.match(/(\d+),(\d+)/);
    if (!match) throw new Error('Preis nicht gefunden');

    return parseFloat(`${match[1]}.${match[2]}`);
  }
}
```

---

## Jockey-Portal Page Objects

### Jockey Dashboard Page

**`tests/shared/page-objects/jockey/DashboardPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Page Object für Jockey Dashboard
 */
export class JockeyDashboardPage extends BasePage {
  readonly pickupCards: Locator;
  readonly deliveryCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);

    this.pickupCards = page.locator('[data-testid="pickup-card"]');
    this.deliveryCards = page.locator('[data-testid="delivery-card"]');
    this.emptyState = page.locator('text=Keine Aufträge für heute');
  }

  async goto() {
    await this.page.goto('/jockey/dashboard');
  }

  async isLoaded(): Promise<boolean> {
    return await this.page.locator('h1').textContent().then(t => t?.includes('Heutige Aufträge') || false);
  }

  /**
   * Anzahl Abholungen heute
   */
  async getPickupCount(): Promise<number> {
    return await this.pickupCards.count();
  }

  /**
   * Anzahl Rückgaben heute
   */
  async getDeliveryCount(): Promise<number> {
    return await this.deliveryCards.count();
  }

  /**
   * Erste Abholung öffnen
   */
  async openFirstPickup() {
    await this.pickupCards.first().click();
  }

  /**
   * Abholung nach Kunden-Name öffnen
   */
  async openPickupByCustomer(customerName: string) {
    await this.page.locator(`[data-testid="pickup-card"]:has-text("${customerName}")`).click();
  }
}
```

### Pickup Page

**`tests/shared/page-objects/jockey/PickupPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Page Object für Fahrzeug-Abholung
 */
export class PickupPage extends BasePage {
  readonly customerName: Locator;
  readonly customerAddress: Locator;
  readonly customerPhone: Locator;
  readonly vehicleInfo: Locator;
  readonly navigationButton: Locator;
  readonly startPickupButton: Locator;
  readonly mileageInput: Locator;
  readonly photoUpload: Locator;
  readonly completeButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.customerName = page.locator('[data-testid="customer-name"]');
    this.customerAddress = page.locator('[data-testid="customer-address"]');
    this.customerPhone = page.locator('[data-testid="customer-phone"]');
    this.vehicleInfo = page.locator('[data-testid="vehicle"]');
    this.navigationButton = page.locator('a:has-text("Navigation starten")');
    this.startPickupButton = page.locator('button:has-text("Abholung starten")');
    this.mileageInput = page.locator('input[name="mileage"]');
    this.photoUpload = page.locator('input[type="file"]');
    this.completeButton = page.locator('button:has-text("Abholung abschließen")');
    this.successMessage = page.locator('text=Abholung erfolgreich');
  }

  async goto(bookingId: string) {
    await this.page.goto(`/jockey/pickup/${bookingId}`);
  }

  async isLoaded(): Promise<boolean> {
    return await this.customerName.isVisible();
  }

  /**
   * Abholung starten
   */
  async startPickup() {
    await this.startPickupButton.click();
  }

  /**
   * Übergabeprotokoll ausfüllen
   */
  async fillHandoverProtocol(mileage: number, photos: string[]) {
    // Checkliste
    await this.page.check('input[name="vehicleClean"]');
    await this.page.check('input[name="noVisibleDamage"]');

    // Kilometerstand
    await this.mileageInput.fill(String(mileage));

    // Fotos hochladen
    await this.photoUpload.setInputFiles(photos);
  }

  /**
   * Abholung abschließen
   */
  async complete() {
    await this.completeButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  /**
   * Komplette Abholung durchführen
   */
  async completePickup(mileage: number, photos: string[]) {
    await this.startPickup();
    await this.fillHandoverProtocol(mileage, photos);
    await this.complete();
  }
}
```

---

## Werkstatt-Portal Page Objects

### Workshop Dashboard Page

**`tests/shared/page-objects/workshop/DashboardPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Page Object für Werkstatt Dashboard
 */
export class WorkshopDashboardPage extends BasePage {
  readonly orderCards: Locator;
  readonly filterButtons: Locator;

  constructor(page: Page) {
    super(page);

    this.orderCards = page.locator('[data-testid="order-card"]');
    this.filterButtons = page.locator('[data-testid="filter-button"]');
  }

  async goto() {
    await this.page.goto('/workshop/dashboard');
  }

  async isLoaded(): Promise<boolean> {
    return await this.page.locator('h1:has-text("Auftragsübersicht")').isVisible();
  }

  /**
   * Anzahl offener Aufträge
   */
  async getOrderCount(): Promise<number> {
    return await this.orderCards.count();
  }

  /**
   * Nach Status filtern
   */
  async filterByStatus(status: 'open' | 'in-progress' | 'completed') {
    await this.page.click(`[data-testid="filter-${status}"]`);
  }

  /**
   * Ersten Auftrag öffnen
   */
  async openFirstOrder() {
    await this.orderCards.first().click();
  }

  /**
   * Auftrag nach Fahrzeug öffnen
   */
  async openOrderByVehicle(vehicleModel: string) {
    await this.page.locator(`[data-testid="order-card"]:has-text("${vehicleModel}")`).click();
  }
}
```

### Order Extension Create Page

**`tests/shared/page-objects/workshop/OrderExtensionPage.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export interface ExtensionData {
  title: string;
  description: string;
  price: number;
  photos: string[];
}

/**
 * Page Object für Auftragserweiterung erstellen (Werkstatt)
 */
export class WorkshopOrderExtensionPage extends BasePage {
  readonly createButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly priceInput: Locator;
  readonly photoUpload: Locator;
  readonly sendButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.createButton = page.locator('button:has-text("Auftragserweiterung erstellen")');
    this.titleInput = page.locator('input[name="title"]');
    this.descriptionTextarea = page.locator('textarea[name="description"]');
    this.priceInput = page.locator('input[name="price"]');
    this.photoUpload = page.locator('input[type="file"]');
    this.sendButton = page.locator('button:has-text("An Kunde senden")');
    this.successMessage = page.locator('text=Angebot wurde versendet');
  }

  async goto(bookingId: string) {
    await this.page.goto(`/workshop/orders/${bookingId}`);
  }

  async isLoaded(): Promise<boolean> {
    return await this.createButton.isVisible();
  }

  /**
   * Auftragserweiterung erstellen
   */
  async createExtension(data: ExtensionData) {
    await this.createButton.click();

    await this.titleInput.fill(data.title);
    await this.descriptionTextarea.fill(data.description);
    await this.priceInput.fill(String(data.price));
    await this.photoUpload.setInputFiles(data.photos);

    await this.sendButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }
}
```

---

## Shared Components

### Modal Component

**`tests/shared/page-objects/components/Modal.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * Wiederverwendbares Modal-Komponenten-Object
 */
export class Modal {
  readonly page: Page;
  readonly modal: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[role="dialog"]');
    this.title = this.modal.locator('h2');
    this.closeButton = this.modal.locator('button[aria-label="Close"]');
    this.confirmButton = this.modal.locator('button:has-text("Bestätigen")');
    this.cancelButton = this.modal.locator('button:has-text("Abbrechen")');
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async close() {
    await this.closeButton.click();
  }
}
```

---

## Verwendung in Tests

### Beispiel: Test mit Page Objects

**`tests/e2e/customer/booking-flow.critical.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';
import { BookingPage } from '@tests/shared/page-objects/customer/BookingPage';
import { testVehicles, testCustomers } from '@tests/shared/fixtures/test-data';

test.describe('Booking Flow (Critical)', () => {
  let bookingPage: BookingPage;

  test.beforeEach(async ({ page }) => {
    bookingPage = new BookingPage(page);
  });

  test('TC-001: Happy Path - Komplette Buchung', async ({ page }) => {
    await bookingPage.completeBooking(
      testVehicles.vwGolf,
      'inspection',
      testCustomers.regular.address
    );

    // Assertions
    await expect(page.locator('h1')).toContainText('Buchung erfolgreich');
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();
  });

  test('TC-002: Validierung - Kilometerstand fehlt', async ({ page }) => {
    await bookingPage.vehicleSelection.goto();
    await bookingPage.vehicleSelection.selectBrand('VW');
    // Kilometerstand NICHT eingeben
    await bookingPage.vehicleSelection.continue();

    // Assertion
    const error = await bookingPage.vehicleSelection.getErrorMessage();
    expect(error).toContain('Kilometerstand ist erforderlich');
  });
});
```

---

## Best Practices

### 1. Keine Assertions in Page Objects

```typescript
// ❌ Schlecht
class BookingPage {
  async completeBooking() {
    // ...
    await expect(this.successMessage).toBeVisible(); // NEIN!
  }
}

// ✅ Gut
class BookingPage {
  async completeBooking() {
    // ...
    // Keine Assertions hier
  }
}

// Test-File
test('Booking', async () => {
  await bookingPage.completeBooking();
  await expect(bookingPage.successMessage).toBeVisible(); // JA!
});
```

### 2. Fluent API (Method Chaining)

```typescript
// ✅ Gut
class VehicleSelectionPage {
  async selectVehicle(vehicle: VehicleData): this {
    // ...
    return this; // für Chaining
  }
}

// Usage
await page.vehicleSelection
  .selectVehicle(testVehicles.vwGolf)
  .continue();
```

### 3. Typsichere Parameter

```typescript
// ✅ Gut - TypeScript Interface
interface VehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

async selectVehicle(vehicle: VehicleData) { ... }
```

### 4. Sprechende Methodennamen

```typescript
// ❌ Schlecht
async click1() { ... }
async fillForm() { ... }

// ✅ Gut
async selectFirstAvailableSlot() { ... }
async fillAddressAndContinue() { ... }
```

---

## Nächste Schritte

1. ✅ Page Objects Architektur definiert
2. 🔲 Base Classes implementieren (`BasePage.ts`)
3. 🔲 Kunden-Portal Page Objects implementieren
4. 🔲 Jockey/Werkstatt Page Objects implementieren
5. 🔲 Tests mit Page Objects schreiben

---

**Version History:**
- v1.0 (2026-02-01): Initiale Version - Page Object Pattern komplett
