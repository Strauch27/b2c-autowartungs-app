/**
 * QA Booking Flow Audit
 *
 * Comprehensive E2E tests for the complete booking flow:
 * 1. Authenticated flow: Vehicle -> Service -> Appointment -> Payment -> Confirmation
 * 2. Guest flow: /booking (multi-step wizard) -> /booking/register -> /booking/success
 *
 * Tests every selection, button, form field, and navigation in the booking pipeline.
 * Verifies no step produces a 404 and query params pass correctly between steps.
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './helpers/api-helpers';
import { TEST_USERS, TEST_VEHICLES, TEST_ADDRESSES } from './fixtures/test-data';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const locale = 'de';

// Helper: login as customer via the UI and return the page
async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto(`/${locale}/customer/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
  await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/customer\/dashboard/, { timeout: 15000 });
}

// ============================================================
// SECTION 1: Authenticated Booking Flow (customer portal)
// ============================================================

test.describe('Authenticated Booking Flow', () => {
  let api: ApiHelper;

  test.beforeAll(async () => {
    api = new ApiHelper(API_URL);
    await api.login('customer');
  });

  // --- Step 1: Vehicle Selection ---

  test.describe('Step 1 - Vehicle Selection', () => {
    test('Page loads without 404 for authenticated user', async ({ page }) => {
      await loginAsCustomer(page);
      const response = await page.goto(`/${locale}/customer/booking`);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(/customer\/booking/);
    });

    test('Brand dropdown, model dropdown, year dropdown, mileage input are present', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Brand select trigger (id="brand")
      const brandSelect = page.locator('#brand');
      await expect(brandSelect).toBeVisible({ timeout: 10000 });

      // Model select trigger (id="model") - should be disabled until brand is selected
      const modelSelect = page.locator('#model');
      await expect(modelSelect).toBeVisible();

      // Year select trigger (id="year")
      const yearSelect = page.locator('#year');
      await expect(yearSelect).toBeVisible();

      // Mileage input (id="mileage")
      const mileageInput = page.locator('#mileage');
      await expect(mileageInput).toBeVisible();
    });

    test('"Weiter" button is disabled when form is empty', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeVisible({ timeout: 5000 });
      await expect(weiterButton).toBeDisabled();
    });

    test('Brand dropdown opens and shows brand options', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Click brand trigger to open dropdown
      const brandTrigger = page.locator('#brand');
      await brandTrigger.click();

      // Wait for select content to appear
      // Brands are loaded from API (getBrands). Check for at least one brand item.
      const selectContent = page.locator('[role="listbox"]');
      await expect(selectContent).toBeVisible({ timeout: 10000 });

      // Look for known brands (from the API or fallback constants)
      const brandOptions = page.locator('[role="option"]');
      const optionCount = await brandOptions.count();
      expect(optionCount).toBeGreaterThan(0);
    });

    test('Selecting a brand enables model dropdown', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Model should be disabled initially
      const modelTrigger = page.locator('#model');
      await expect(modelTrigger).toBeDisabled();

      // Open brand dropdown and select first option
      const brandTrigger = page.locator('#brand');
      await brandTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      await page.locator('[role="option"]').first().click();

      // Model should become enabled (may need a moment to load models)
      await expect(modelTrigger).not.toBeDisabled({ timeout: 10000 });
    });

    test('Filling all fields enables Weiter button', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Select brand
      await page.locator('#brand').click();
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      await page.locator('[role="option"]').first().click();

      // Wait for models to load, then select model
      await page.waitForTimeout(500);
      await page.locator('#model').click();
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      await page.locator('[role="option"]').first().click();

      // Select year
      await page.locator('#year').click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      // Enter mileage
      await page.locator('#mileage').fill('50000');

      // Weiter button should be enabled
      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeEnabled({ timeout: 5000 });
    });

    test('Clicking Weiter navigates to service page with correct query params', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Fill all fields
      await page.locator('#brand').click();
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      await page.locator('[role="option"]').first().click();

      await page.waitForTimeout(500);
      await page.locator('#model').click();
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      await page.locator('[role="option"]').first().click();

      await page.locator('#year').click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      await page.locator('#mileage').fill('45000');

      // Click Weiter
      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeEnabled({ timeout: 5000 });
      await weiterButton.click();

      // Should navigate to service page with query params
      await page.waitForURL(/customer\/booking\/service\?/, { timeout: 10000 });
      const url = new URL(page.url());
      expect(url.searchParams.get('brand')).toBeTruthy();
      expect(url.searchParams.get('model')).toBeTruthy();
      expect(url.searchParams.get('year')).toBeTruthy();
      expect(url.searchParams.get('mileage')).toBe('45000');
    });
  });

  // --- Step 2: Service Selection ---

  test.describe('Step 2 - Service Selection', () => {
    const serviceParams = 'brand=BMW&model=3er&year=2020&mileage=50000';

    test('Service page loads without 404 with valid query params', async ({ page }) => {
      await loginAsCustomer(page);
      const response = await page.goto(`/${locale}/customer/booking/service?${serviceParams}`);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(/customer\/booking\/service/);
    });

    test('Service page shows vehicle info from query params', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/service?${serviceParams}`);
      await page.waitForLoadState('networkidle');

      // Vehicle info should be displayed: "BMW 3er (2020)"
      const bmwText = page.locator('text=BMW').first();
      await expect(bmwText).toBeVisible({ timeout: 10000 });
    });

    test('Service cards with "Auswahlen" buttons are displayed', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/service?${serviceParams}`);
      await page.waitForLoadState('networkidle');

      // Each ServiceCard has a button with text "Auswahlen" (select) or "Ausgewahlt" (selected)
      // The 5 services: inspection, oil_service, brake_service, tuv, climate_service
      const selectButtons = page.locator('button:has-text("Auswählen")');
      await expect(selectButtons.first()).toBeVisible({ timeout: 15000 });
      const count = await selectButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('Clicking a service card navigates to appointment with serviceType param', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/service?${serviceParams}`);
      await page.waitForLoadState('networkidle');

      // Click first available service card button
      const selectButton = page.locator('button:has-text("Auswählen")').first();
      await expect(selectButton).toBeVisible({ timeout: 15000 });
      await selectButton.click();

      // Should navigate to appointment page with all params including serviceType
      await page.waitForURL(/customer\/booking\/appointment\?/, { timeout: 10000 });
      const url = new URL(page.url());
      expect(url.searchParams.get('brand')).toBe('BMW');
      expect(url.searchParams.get('model')).toBe('3er');
      expect(url.searchParams.get('year')).toBe('2020');
      expect(url.searchParams.get('mileage')).toBe('50000');
      expect(url.searchParams.get('serviceType')).toBeTruthy();
    });

    test('Service page without query params redirects to booking start', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/service`);
      // Should redirect back to /customer/booking because brand/model/year/mileage are missing
      await page.waitForURL(/customer\/booking(?!\/)/, { timeout: 10000 });
    });
  });

  // --- Step 3: Appointment (Pickup) ---

  test.describe('Step 3 - Appointment / Pickup', () => {
    const appointmentParams = 'brand=BMW&model=3er&year=2020&mileage=50000&serviceType=inspection';

    test('Appointment page loads without 404 with valid query params', async ({ page }) => {
      await loginAsCustomer(page);
      const response = await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(/customer\/booking\/appointment/);
    });

    test('Vehicle + service summary is displayed from query params', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      // Summary shows "BMW 3er (2020, 50.000 km) . inspection"
      const summaryText = page.locator('text=BMW').first();
      await expect(summaryText).toBeVisible({ timeout: 10000 });
    });

    test('Pickup time slot buttons are displayed and clickable', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      // Time slots: "08:00", "10:00", "12:00", "14:00", "16:00"
      const timeSlotButton = page.locator('button:has-text("08:00")');
      await expect(timeSlotButton).toBeVisible({ timeout: 10000 });

      // Click a time slot
      await timeSlotButton.click();
      // After clicking, button should change variant (selected state)
      // Check it has the default variant (not outline)
      await expect(timeSlotButton).toBeVisible();
    });

    test('Return time slot buttons are displayed', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      // Return time slots: "10:00", "12:00", "14:00", "16:00", "18:00"
      const returnSlot = page.locator('button:has-text("18:00")');
      await expect(returnSlot).toBeVisible({ timeout: 10000 });
    });

    test('Address fields (street, zip, city) are present and fillable', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      const streetInput = page.locator('#street');
      const zipInput = page.locator('#zip');
      const cityInput = page.locator('#city');

      await expect(streetInput).toBeVisible({ timeout: 10000 });
      await expect(zipInput).toBeVisible();
      await expect(cityInput).toBeVisible();

      // Fill address fields
      await streetInput.fill(TEST_ADDRESSES.witten.street);
      await zipInput.fill(TEST_ADDRESSES.witten.zip);
      await cityInput.fill(TEST_ADDRESSES.witten.city);

      // Verify values were set
      await expect(streetInput).toHaveValue(TEST_ADDRESSES.witten.street);
      await expect(zipInput).toHaveValue(TEST_ADDRESSES.witten.zip);
      await expect(cityInput).toHaveValue(TEST_ADDRESSES.witten.city);
    });

    test('Back button is present and functional', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      const backButton = page.locator('button:has-text("Zurück")');
      await expect(backButton).toBeVisible({ timeout: 5000 });
    });

    test('"Weiter zur Zahlung" button is disabled until form is complete', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment?${appointmentParams}`);
      await page.waitForLoadState('networkidle');

      // The submit button should say "Weiter zur Zahlung" or "Continue to Payment"
      const submitButton = page.locator('button:has-text("Weiter zur Zahlung"), button:has-text("Continue to Payment")');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      await expect(submitButton).toBeDisabled();
    });

    test('Appointment page without required params redirects to booking start', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/appointment`);
      // Missing brand/model/serviceType should redirect
      await page.waitForURL(/customer\/booking(?!\/)/, { timeout: 10000 });
    });
  });

  // --- Step 4: Payment Page ---

  test.describe('Step 4 - Payment', () => {
    test('Payment page loads without 404 with valid bookingId', async ({ page }) => {
      // Create a booking via API to get a real bookingId
      const booking = await api.createBooking({
        vehicle: {
          brand: TEST_VEHICLES.bmw.brand,
          model: TEST_VEHICLES.bmw.model,
          year: parseInt(TEST_VEHICLES.bmw.year),
          mileage: parseInt(TEST_VEHICLES.bmw.mileage),
        },
        services: ['inspection'],
        pickup: {
          date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          timeSlot: '09:00',
          street: TEST_ADDRESSES.witten.street,
          city: TEST_ADDRESSES.witten.city,
          postalCode: TEST_ADDRESSES.witten.zip,
        },
        delivery: {
          date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          timeSlot: '14:00',
        },
        customerNotes: 'QA Audit - Payment Test',
      });

      await loginAsCustomer(page);
      const response = await page.goto(`/${locale}/customer/booking/payment?bookingId=${booking.id}`);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(/customer\/booking\/payment/);
    });

    test('Payment page shows error for missing bookingId', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/payment`);
      await page.waitForLoadState('networkidle');

      // Should show error state: "No booking ID provided"
      const errorContent = page.locator('text=/Error|Fehler|No booking ID|Invalid booking/i').first();
      await expect(errorContent).toBeVisible({ timeout: 10000 });
    });

    test('Payment page shows error for invalid bookingId', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/payment?bookingId=nonexistent-id`);
      await page.waitForLoadState('networkidle');

      // Should show error state
      const errorContent = page.locator('text=/Error|Fehler|failed|Invalid/i').first();
      await expect(errorContent).toBeVisible({ timeout: 10000 });
    });

    test('Payment page has "Go to Dashboard" link in error state', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/payment?bookingId=bad-id`);
      await page.waitForLoadState('networkidle');

      const dashboardLink = page.locator('button:has-text("Go to Dashboard"), a:has-text("Go to Dashboard"), text="Go to Dashboard"').first();
      await expect(dashboardLink).toBeVisible({ timeout: 10000 });
    });
  });

  // --- Step 5: Confirmation Page ---

  test.describe('Step 5 - Confirmation', () => {
    test('Confirmation page loads without 404 with valid bookingId', async ({ page }) => {
      const booking = await api.createBooking({
        vehicle: {
          brand: TEST_VEHICLES.vw.brand,
          model: TEST_VEHICLES.vw.model,
          year: parseInt(TEST_VEHICLES.vw.year),
          mileage: parseInt(TEST_VEHICLES.vw.mileage),
        },
        services: ['oil'],
        pickup: {
          date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
          timeSlot: '10:00',
          street: TEST_ADDRESSES.witten.street,
          city: TEST_ADDRESSES.witten.city,
          postalCode: TEST_ADDRESSES.witten.zip,
        },
        delivery: {
          date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          timeSlot: '15:00',
        },
        customerNotes: 'QA Audit - Confirmation Test',
      });

      await loginAsCustomer(page);
      const response = await page.goto(`/${locale}/customer/booking/confirmation?bookingId=${booking.id}`);
      expect(response?.status()).not.toBe(404);
    });

    test('Confirmation page shows booking number and vehicle info', async ({ page }) => {
      const booking = await api.createBooking({
        vehicle: {
          brand: TEST_VEHICLES.mercedes.brand,
          model: TEST_VEHICLES.mercedes.model,
          year: parseInt(TEST_VEHICLES.mercedes.year),
          mileage: parseInt(TEST_VEHICLES.mercedes.mileage),
        },
        services: ['inspection'],
        pickup: {
          date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
          timeSlot: '09:00',
          street: TEST_ADDRESSES.dortmund.street,
          city: TEST_ADDRESSES.dortmund.city,
          postalCode: TEST_ADDRESSES.dortmund.zip,
        },
        delivery: {
          date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          timeSlot: '14:00',
        },
      });

      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=${booking.id}`);
      await page.waitForLoadState('networkidle');

      // Booking number should be visible
      const bookingNumberEl = page.locator(`text=${booking.bookingNumber}`).first();
      await expect(bookingNumberEl).toBeVisible({ timeout: 10000 });

      // Vehicle info
      const vehicleText = page.locator(`text=${TEST_VEHICLES.mercedes.brand}`).first();
      await expect(vehicleText).toBeVisible({ timeout: 5000 });
    });

    test('"Zum Dashboard" button navigates to customer dashboard', async ({ page }) => {
      const booking = await api.createBooking({
        vehicle: {
          brand: TEST_VEHICLES.audi.brand,
          model: TEST_VEHICLES.audi.model,
          year: parseInt(TEST_VEHICLES.audi.year),
          mileage: parseInt(TEST_VEHICLES.audi.mileage),
        },
        services: ['inspection'],
        pickup: {
          date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
          timeSlot: '09:00',
          street: TEST_ADDRESSES.bochum.street,
          city: TEST_ADDRESSES.bochum.city,
          postalCode: TEST_ADDRESSES.bochum.zip,
        },
        delivery: {
          date: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
          timeSlot: '14:00',
        },
      });

      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=${booking.id}`);
      await page.waitForLoadState('networkidle');

      const dashboardButton = page.locator('button:has-text("Zum Dashboard"), button:has-text("Go to Dashboard")').first();
      await expect(dashboardButton).toBeVisible({ timeout: 10000 });
      await dashboardButton.click();

      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });
    });

    test('Confirmation page shows error for missing bookingId', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/confirmation`);
      await page.waitForLoadState('networkidle');

      // Shows "Keine Buchungs-ID angegeben" or "No booking ID provided"
      const errorContent = page.locator('text=/Fehler|Error|Keine Buchungs-ID|No booking ID/i').first();
      await expect(errorContent).toBeVisible({ timeout: 10000 });
    });

    test('Confirmation page shows error for invalid bookingId', async ({ page }) => {
      await loginAsCustomer(page);
      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=fake-id-999`);
      await page.waitForLoadState('networkidle');

      const errorContent = page.locator('text=/Fehler|Error|nicht gefunden|not found|failed|Ungültige/i').first();
      await expect(errorContent).toBeVisible({ timeout: 10000 });
    });
  });
});

// ============================================================
// SECTION 2: Guest Booking Flow (public /booking page)
// ============================================================

test.describe('Guest Booking Flow', () => {
  test.describe('Multi-step Wizard at /booking', () => {
    test('Guest booking page loads without 404', async ({ page }) => {
      const response = await page.goto(`/${locale}/booking`);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(new RegExp(`/${locale}/booking`));
    });

    test('Step 1 (Vehicle): brand dropdown, model dropdown, year input, mileage input', async ({ page }) => {
      await page.goto(`/${locale}/booking`);
      await page.waitForLoadState('networkidle');

      // VehicleStep uses VEHICLE_BRANDS constant directly (no API call)
      // Brand select trigger
      const brandSelect = page.locator('button[role="combobox"]').first();
      await expect(brandSelect).toBeVisible({ timeout: 10000 });

      // Year input
      const yearInput = page.locator('#year');
      await expect(yearInput).toBeVisible();

      // Mileage input
      const mileageInput = page.locator('#mileage');
      await expect(mileageInput).toBeVisible();
    });

    test('Step 1: "Weiter" button disabled until form is filled', async ({ page }) => {
      await page.goto(`/${locale}/booking`);
      await page.waitForLoadState('networkidle');

      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeVisible({ timeout: 5000 });
      await expect(weiterButton).toBeDisabled();
    });

    test('Step 1: Fill vehicle form and navigate to Step 2', async ({ page }) => {
      await page.goto(`/${locale}/booking`);
      await page.waitForLoadState('networkidle');

      // Open brand dropdown (first combobox)
      const brandTrigger = page.locator('button[role="combobox"]').first();
      await brandTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });

      // Select first brand (e.g., Audi)
      await page.locator('[role="option"]').first().click();

      // Wait for model dropdown to be enabled, then select a model
      await page.waitForTimeout(300);
      const modelTrigger = page.locator('button[role="combobox"]').nth(1);
      await modelTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      // Fill year and mileage
      await page.locator('#year').fill('2020');
      await page.locator('#mileage').fill('50000');

      // Weiter button should be enabled
      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeEnabled({ timeout: 5000 });
      await weiterButton.click();

      // Should now be on Step 2 (service selection) - same page, different step
      // ServiceStep should show service cards
      const serviceContent = page.locator('text=/Inspektion|inspection|Ölservice|Oil/i').first();
      await expect(serviceContent).toBeVisible({ timeout: 10000 });
    });

    test('Step 2 (Service): service cards are displayed and selectable', async ({ page }) => {
      await page.goto(`/${locale}/booking`);
      await page.waitForLoadState('networkidle');

      // Fill Step 1 quickly
      const brandTrigger = page.locator('button[role="combobox"]').first();
      await brandTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      await page.waitForTimeout(300);
      const modelTrigger = page.locator('button[role="combobox"]').nth(1);
      await modelTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      await page.locator('#year').fill('2020');
      await page.locator('#mileage').fill('50000');

      await page.locator('button:has-text("Weiter")').click();
      await page.waitForTimeout(500);

      // On Step 2: service cards should appear
      // Each service has a clickable card. Check that at least one exists.
      const serviceCards = page.locator('[class*="card"], [class*="Card"]');
      const count = await serviceCards.count();
      expect(count).toBeGreaterThan(0);

      // Weiter should be disabled until a service is selected
      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeDisabled();
    });

    test('Step 2: Back button returns to Step 1', async ({ page }) => {
      await page.goto(`/${locale}/booking`);
      await page.waitForLoadState('networkidle');

      // Fill Step 1
      const brandTrigger = page.locator('button[role="combobox"]').first();
      await brandTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      await page.waitForTimeout(300);
      const modelTrigger = page.locator('button[role="combobox"]').nth(1);
      await modelTrigger.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      await page.locator('#year').fill('2020');
      await page.locator('#mileage').fill('50000');

      await page.locator('button:has-text("Weiter")').click();
      await page.waitForTimeout(500);

      // Click "Zurück" / "Back" button
      const backButton = page.locator('button:has-text("Zurück"), button:has-text("Back")');
      await expect(backButton).toBeVisible({ timeout: 5000 });
      await backButton.click();

      // Should be back on Step 1 - brand/model fields should be visible again
      await expect(page.locator('#year')).toBeVisible({ timeout: 5000 });
    });
  });

  // --- Guest booking register page ---

  test.describe('Guest Registration Page (/booking/register)', () => {
    test('Register page loads without 404 with valid query params', async ({ page }) => {
      const params = new URLSearchParams({
        bookingNumber: 'BK-TEST-001',
        bookingId: 'test-id-123',
        email: TEST_USERS.guestCustomer.email,
        firstName: TEST_USERS.guestCustomer.firstName,
        lastName: TEST_USERS.guestCustomer.lastName,
        phone: TEST_USERS.guestCustomer.phone,
      });
      const response = await page.goto(`/${locale}/booking/register?${params.toString()}`);
      expect(response?.status()).not.toBe(404);
    });

    test('Register page shows pre-filled fields from query params', async ({ page }) => {
      const params = new URLSearchParams({
        bookingNumber: 'BK-TEST-002',
        bookingId: 'test-id-456',
        email: TEST_USERS.guestCustomer.email,
        firstName: TEST_USERS.guestCustomer.firstName,
        lastName: TEST_USERS.guestCustomer.lastName,
        phone: TEST_USERS.guestCustomer.phone,
      });
      await page.goto(`/${locale}/booking/register?${params.toString()}`);
      await page.waitForLoadState('networkidle');

      // Booking number should be displayed
      const bookingNumberText = page.locator('text=BK-TEST-002');
      await expect(bookingNumberText).toBeVisible({ timeout: 10000 });

      // Email should be pre-filled and disabled
      const emailInput = page.locator('#email');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveValue(TEST_USERS.guestCustomer.email);
      await expect(emailInput).toBeDisabled();

      // Password fields should be present and editable
      const passwordInput = page.locator('#password');
      const confirmPasswordInput = page.locator('#confirmPassword');
      await expect(passwordInput).toBeVisible();
      await expect(confirmPasswordInput).toBeVisible();
      await expect(passwordInput).not.toBeDisabled();
    });

    test('Register page has "Skip" link to success page', async ({ page }) => {
      const params = new URLSearchParams({
        bookingNumber: 'BK-TEST-003',
        bookingId: 'test-id-789',
        email: 'skip@test.de',
        firstName: 'Skip',
        lastName: 'User',
        phone: '+49123456',
      });
      await page.goto(`/${locale}/booking/register?${params.toString()}`);
      await page.waitForLoadState('networkidle');

      // "Spater registrieren" / "Register later" link
      const skipLink = page.locator('a:has-text("Später registrieren"), a:has-text("Register later")');
      await expect(skipLink).toBeVisible({ timeout: 10000 });

      // It should link to /booking/success with the bookingNumber
      const href = await skipLink.getAttribute('href');
      expect(href).toContain('/booking/success');
      expect(href).toContain('BK-TEST-003');
    });

    test('Register page redirects if missing required params', async ({ page }) => {
      // Missing bookingNumber and bookingId
      await page.goto(`/${locale}/booking/register`);
      // Should redirect to home page
      await page.waitForURL(new RegExp(`/${locale}$`), { timeout: 10000 });
    });
  });

  // --- Guest booking success page ---

  test.describe('Guest Booking Success Page (/booking/success)', () => {
    test('Success page loads without 404 with bookingNumber', async ({ page }) => {
      const response = await page.goto(`/${locale}/booking/success?bookingNumber=BK-SUCCESS-001`);
      expect(response?.status()).not.toBe(404);
    });

    test('Success page displays booking number', async ({ page }) => {
      await page.goto(`/${locale}/booking/success?bookingNumber=BK-SUCCESS-TEST`);
      await page.waitForLoadState('networkidle');

      const bookingNumberText = page.locator('text=BK-SUCCESS-TEST');
      await expect(bookingNumberText).toBeVisible({ timeout: 10000 });
    });

    test('Success page has navigation buttons (Home + Customer Portal)', async ({ page }) => {
      await page.goto(`/${locale}/booking/success?bookingNumber=BK-NAV-TEST`);
      await page.waitForLoadState('networkidle');

      // "Zur Startseite" / "Back to Home" button
      const homeButton = page.locator('button:has-text("Zur Startseite"), button:has-text("Back to Home")');
      await expect(homeButton).toBeVisible({ timeout: 10000 });

      // "Zum Kundenportal" / "Customer Portal" button
      const portalButton = page.locator('button:has-text("Zum Kundenportal"), button:has-text("Customer Portal")');
      await expect(portalButton).toBeVisible();
    });

    test('Success page redirects if missing bookingNumber', async ({ page }) => {
      await page.goto(`/${locale}/booking/success`);
      // Should redirect to home
      await page.waitForURL(new RegExp(`/${locale}$`), { timeout: 10000 });
    });
  });
});

// ============================================================
// SECTION 3: Cross-cutting Concerns
// ============================================================

test.describe('Cross-cutting: No 404 on any booking route', () => {
  const bookingRoutes = [
    { path: `/${locale}/customer/booking`, name: 'Vehicle Step (auth)', needsAuth: true },
    { path: `/${locale}/customer/booking/service?brand=BMW&model=3er&year=2020&mileage=50000`, name: 'Service Step (auth)', needsAuth: true },
    { path: `/${locale}/customer/booking/appointment?brand=BMW&model=3er&year=2020&mileage=50000&serviceType=inspection`, name: 'Appointment Step (auth)', needsAuth: true },
    { path: `/${locale}/customer/booking/payment?bookingId=test`, name: 'Payment Step (auth)', needsAuth: true },
    { path: `/${locale}/customer/booking/confirmation?bookingId=test`, name: 'Confirmation Step (auth)', needsAuth: true },
    { path: `/${locale}/booking`, name: 'Guest Booking Wizard', needsAuth: false },
    { path: `/${locale}/booking/register?bookingNumber=TEST&bookingId=test`, name: 'Guest Register', needsAuth: false },
    { path: `/${locale}/booking/success?bookingNumber=TEST`, name: 'Guest Success', needsAuth: false },
  ];

  for (const route of bookingRoutes) {
    test(`${route.name}: ${route.path} does NOT return 404`, async ({ page }) => {
      if (route.needsAuth) {
        await loginAsCustomer(page);
      }
      const response = await page.goto(route.path);
      // A 404 would mean the route doesn't exist
      expect(response?.status()).not.toBe(404);
    });
  }
});
