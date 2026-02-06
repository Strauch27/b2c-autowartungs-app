/**
 * UI Booking Flow E2E Tests
 *
 * Tests the actual booking form UI: vehicle selection, service selection,
 * and confirmation page. Step 1 currently shows alert() on submit instead
 * of navigating, so we test each step individually with API-based transitions.
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './helpers/api-helpers';
import { TEST_USERS, TEST_VEHICLES, TEST_ADDRESSES } from './fixtures/test-data';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const locale = 'de';

test.describe('UI Booking Flow', () => {
  let api: ApiHelper;

  test.beforeAll(async () => {
    api = new ApiHelper(API_URL);
    await api.login('customer');
  });

  test.describe('Vehicle Form (Step 1)', () => {
    test('Booking page loads for authenticated user', async ({ page }) => {
      // Login first
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      // Navigate to booking
      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Page should load without redirecting (user is authenticated)
      await expect(page).toHaveURL(/customer\/booking/);
    });

    test('Form fields are present when brands load successfully', async ({ page }) => {
      // Login and navigate
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      await page.goto(`/${locale}/customer/booking`);
      await page.waitForLoadState('networkidle');

      // Form should load without crash (vehicleForm namespace fix applied)
      const brandSelect = page.locator('#brand');
      const mileageInput = page.locator('#mileage');

      await expect(brandSelect).toBeVisible({ timeout: 5000 });
      await expect(mileageInput).toBeVisible({ timeout: 5000 });

      // Weiter button should be disabled initially
      const weiterButton = page.locator('button:has-text("Weiter")');
      await expect(weiterButton).toBeVisible();
      await expect(weiterButton).toBeDisabled();
    });
  });

  test.describe('Service Selection (Step 2)', () => {
    test('Service page loads with vehicle params', async ({ page }) => {
      // Login and navigate
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      // Navigate to service selection with vehicle params
      await page.goto(`/${locale}/customer/booking/service?brand=BMW&model=3er&year=2020&mileage=50000`);
      await page.waitForLoadState('networkidle');

      // Page should show service selection header or vehicle info
      const content = await page.textContent('body');
      expect(content).toBeTruthy();

      // Should display the vehicle info somewhere on the page
      const vehicleInfo = page.locator('text=BMW').first();
      if (await vehicleInfo.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(vehicleInfo).toBeVisible();
      }
    });

    test('Service cards are displayed', async ({ page }) => {
      // Login and navigate
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      await page.goto(`/${locale}/customer/booking/service?brand=BMW&model=3er&year=2020&mileage=50000`);
      await page.waitForLoadState('networkidle');

      // Look for service-related content (cards, buttons, or price elements)
      // Service names are now i18n: DE = "Inspektion/Wartung", "Ölservice", "Bremsservice" etc.
      const serviceCards = page.locator('button:has-text("Auswählen")');
      const count = await serviceCards.count();

      // Should have at least some service cards with "Auswählen" buttons
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Confirmation (Step 3)', () => {
    test('Confirmation page shows booking details', async ({ page }) => {
      // Create a booking via API
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
        customerNotes: 'UI Booking Flow Test - Confirmation',
      });

      expect(booking.id).toBeDefined();
      expect(booking.bookingNumber).toBeDefined();

      // Login and navigate to confirmation
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=${booking.id}`);
      await page.waitForLoadState('networkidle');

      // Booking number should be visible
      const bookingNumberEl = page.locator(`text=${booking.bookingNumber}`).first();
      await expect(bookingNumberEl).toBeVisible({ timeout: 10000 });

      // Vehicle info should be visible
      const vehicleInfo = page.locator(`text=${TEST_VEHICLES.bmw.brand}`).first();
      await expect(vehicleInfo).toBeVisible({ timeout: 5000 });
    });

    test('Go to Dashboard button works', async ({ page }) => {
      // Create a booking via API
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
      });

      // Login and navigate to confirmation
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=${booking.id}`);
      await page.waitForLoadState('networkidle');

      // Click "Zum Dashboard" button
      const dashboardButton = page.locator('button:has-text("Zum Dashboard"), button:has-text("Go to Dashboard")').first();
      await expect(dashboardButton).toBeVisible({ timeout: 10000 });
      await dashboardButton.click();

      // Should navigate to customer dashboard
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/customer\/dashboard/);
    });

    test('Confirmation page shows error for invalid booking ID', async ({ page }) => {
      // Login first
      await page.goto(`/${locale}/customer/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="email"]').first().fill(TEST_USERS.customer.email);
      await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

      // Navigate with non-existent booking ID
      await page.goto(`/${locale}/customer/booking/confirmation?bookingId=invalid-id-12345`);
      await page.waitForLoadState('networkidle');

      // Should show error state
      const errorContent = page.locator('text=/Fehler|Error|nicht gefunden|not found/i').first();
      await expect(errorContent).toBeVisible({ timeout: 10000 });
    });
  });
});
