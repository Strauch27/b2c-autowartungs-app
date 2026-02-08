/**
 * EN Booking Walkthrough — Full Lifecycle Screenshots
 *
 * Navigates the ENTIRE booking lifecycle in English across all 3 roles,
 * taking a full-page screenshot at every meaningful step.
 *
 * Run:
 *   cd "99 Code/frontend" && PLAYWRIGHT_API_URL=http://localhost:5001 \
 *     npx playwright test walkthrough-en --reporter=list --project="chromium-desktop" 2>&1
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'en');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'en';

const VEHICLE = { brandLabel: 'BMW', model: '3er', year: '2020', mileage: '50000' };
const ADDRESS = { street: '123 Main Street', zip: '58453', city: 'Witten' };

const timestamp = Date.now();
const CUSTOMER = {
  email: `walkthrough-en-${timestamp}@test.de`,
  password: 'WalkThrough123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '015112345678',
};

// Shared state
let bookingNumber = '';
let bookingId = '';
let customerToken = '';
let jockeyToken = '';
let workshopToken = '';
let pickupAssignmentId = '';
let returnAssignmentId = '';
let screenshotCount = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function hideBannerAndOverlays(page: Page) {
  await page.evaluate(() => {
    // Hide demo banner
    document.querySelectorAll('.bg-yellow-400, [class*="bg-yellow-"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    // Hide Next.js dev overlay
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
  }).catch(() => {});
}

async function shot(page: Page, name: string) {
  await hideBannerAndOverlays(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
  screenshotCount++;
  console.log(`    [screenshot] ${name}.png`);
}

async function getTestToken(role: 'CUSTOMER' | 'JOCKEY' | 'WORKSHOP'): Promise<string> {
  const res = await fetch(`${API_BASE}/api/test/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Token request failed for ${role}: ${JSON.stringify(data)}`);
  return data.token;
}

async function apiRequest(method: string, endpoint: string, token: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function injectToken(page: Page, token: string) {
  await page.goto(`/${LOCALE}`);
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
}

async function customerLogin(page: Page, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success || !data.token) throw new Error(`Customer login failed: ${JSON.stringify(data)}`);
  await page.goto(`/${LOCALE}`);
  await page.evaluate((t) => localStorage.setItem('auth_token', t), data.token);
  return data.token;
}

// ============================================================================
// WALKTHROUGH
// ============================================================================

test.describe.serial('EN Booking Walkthrough', () => {
  test.setTimeout(120_000);

  // ==========================================================================
  // PHASE 1: CUSTOMER BOOKING FLOW (guest)
  // ==========================================================================

  test('01 - Customer: Landing Page', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    await shot(page, '01-customer-01-landing-page');
  });

  test('02 - Customer: Click Calculate Price', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    const ctaBtn = page.locator('a:has-text("Calculate Fixed Price Now"), button:has-text("Calculate Fixed Price Now"), a:has-text("Get Your Quote"), button:has-text("Get Your Quote")').first();
    if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ctaBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    } else {
      await page.goto(`/${LOCALE}/booking`);
      await page.waitForLoadState('networkidle');
    }
    await shot(page, '01-customer-02-click-price-button');
  });

  test('03 - Customer: Vehicle brand select (dropdown open)', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    // Open brand dropdown
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.waitForTimeout(400);
    await shot(page, '01-customer-03-vehicle-brand-select');
  });

  test('04 - Customer: Vehicle brand selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-04-vehicle-brand-selected');
  });

  test('05 - Customer: Vehicle model select (dropdown open)', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(300);
    // Open model dropdown
    await page.locator('[role="combobox"]').nth(1).click();
    await page.waitForTimeout(400);
    await shot(page, '01-customer-05-vehicle-model-select');
  });

  test('06 - Customer: Vehicle model selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-06-vehicle-model-selected');
  });

  test('07 - Customer: Year input', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await shot(page, '01-customer-07-vehicle-year-input');
  });

  test('08 - Customer: Mileage input', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await shot(page, '01-customer-08-vehicle-mileage-input');
  });

  test('09 - Customer: Vehicle form complete', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    // Click somewhere else to trigger validation
    await page.locator('#year').click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-09-vehicle-form-complete');
  });

  test('10 - Customer: Service selection page', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    // Fill vehicle step
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    // Wait for service cards
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await shot(page, '01-customer-10-service-selection');
  });

  test('11 - Customer: Service selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-11-service-selected');
  });

  test('12 - Customer: Appointment page (empty)', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
    await shot(page, '01-customer-12-appointment-page');
  });

  test('13 - Customer: Date selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
    // Open calendar and pick a date — try "Pickup Date" button or "Tomorrow" quick-select
    const dateBtn = page.locator('button:has-text("Pickup Date")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    } else {
      const tomorrow = page.locator('button:has-text("Tomorrow")');
      if (await tomorrow.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tomorrow.click();
      }
    }
    await page.waitForTimeout(300);
    await shot(page, '01-customer-13-date-selected');
  });

  test('14 - Customer: Time slot selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
    // Pick date
    const dateBtn = page.locator('button:has-text("Pickup Date")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    } else {
      const tomorrow = page.locator('button:has-text("Tomorrow")');
      if (await tomorrow.isVisible({ timeout: 2000 }).catch(() => false)) await tomorrow.click();
    }
    // Pick times
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    // Return time
    const returnWeek = page.locator('button:has-text("+1 Week")');
    if (await returnWeek.isVisible({ timeout: 2000 }).catch(() => false)) await returnWeek.click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-14-time-slot-selected');
  });

  test('15 - Customer: Address filled', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
    // Date
    const dateBtn = page.locator('button:has-text("Pickup Date")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    } else {
      const tomorrow = page.locator('button:has-text("Tomorrow")');
      if (await tomorrow.isVisible({ timeout: 2000 }).catch(() => false)) await tomorrow.click();
    }
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    const returnWeek = page.locator('button:has-text("+1 Week")');
    if (await returnWeek.isVisible({ timeout: 2000 }).catch(() => false)) await returnWeek.click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    // Fill address
    await page.locator('#street').fill(ADDRESS.street);
    await page.locator('#zip').fill(ADDRESS.zip);
    await page.locator('#city').fill(ADDRESS.city);
    await page.waitForTimeout(300);
    await shot(page, '01-customer-15-address-filled');
  });

  test('16 - Customer: Booking submit (confirmation step)', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    // Step 1
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();
    // Step 2
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();
    // Step 3
    await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
    const dateBtn = page.locator('button:has-text("Pickup Date")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    } else {
      const tomorrow = page.locator('button:has-text("Tomorrow")');
      if (await tomorrow.isVisible({ timeout: 2000 }).catch(() => false)) await tomorrow.click();
    }
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    const returnWeek = page.locator('button:has-text("+1 Week")');
    if (await returnWeek.isVisible({ timeout: 2000 }).catch(() => false)) await returnWeek.click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.locator('#street').fill(ADDRESS.street);
    await page.locator('#zip').fill(ADDRESS.zip);
    await page.locator('#city').fill(ADDRESS.city);
    await page.locator('button:has-text("Next")').click();
    // Step 4 - Confirmation
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await shot(page, '01-customer-16-booking-submit-empty');

    // Fill contact
    await page.locator('#firstName').fill(CUSTOMER.firstName);
    await page.locator('#lastName').fill(CUSTOMER.lastName);
    await page.locator('#email').fill(CUSTOMER.email);
    await page.locator('#phone').fill(CUSTOMER.phone);
    await page.locator('#terms').click();
    await page.waitForTimeout(300);
    await shot(page, '01-customer-17-booking-submit-filled');

    // Submit
    const submitBtn = page.locator('button:has-text("Book Now")');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // Wait for registration page
    await page.waitForURL(/\/en\/booking\/register/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, '01-customer-18-register-page');

    // Extract booking number
    const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
    if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
      bookingNumber = (await bookingNumberEl.textContent()) || '';
    }

    // Fill registration
    await page.locator('#password').fill(CUSTOMER.password);
    await page.locator('#confirmPassword').fill(CUSTOMER.password);
    await shot(page, '01-customer-19-register-filled');

    await page.locator('button:has-text("Create Account")').click();

    // Wait for success
    await page.waitForURL(/\/en\/booking\/success/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, '01-customer-20-confirmation-page');
  });

  // ==========================================================================
  // PHASE 1b: Customer dashboard after booking
  // ==========================================================================

  test('17 - Customer: Dashboard after booking', async ({ page }) => {
    // Login as the new customer
    customerToken = await customerLogin(page, CUSTOMER.email, CUSTOMER.password);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, '01-customer-21-dashboard-after-booking');

    // Find the booking ID via API for later use
    const bookingsRes = await apiRequest('GET', '/api/bookings', customerToken);
    if (bookingsRes.success && bookingsRes.data?.length) {
      const ourBooking = bookingsRes.data.find((b: any) => b.bookingNumber === bookingNumber) || bookingsRes.data[0];
      bookingId = ourBooking.id || ourBooking._id;
      if (!bookingNumber) bookingNumber = ourBooking.bookingNumber;
    }
    console.log(`    Booking: ${bookingNumber} (${bookingId})`);
  });

  // ==========================================================================
  // PHASE 2: JOCKEY PICKUP
  // ==========================================================================

  test('18 - Setup: Get role tokens and advance booking', async () => {
    jockeyToken = await getTestToken('JOCKEY');
    workshopToken = await getTestToken('WORKSHOP');

    // Advance booking to PICKUP_ASSIGNED via test endpoint (bypasses need for payment intent)
    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'PICKUP_ASSIGNED',
      });
      console.log(`    Advance to PICKUP_ASSIGNED: ${JSON.stringify(advanceRes)}`);
    }
  });

  test('19 - Jockey: Login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/jockey/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, '02-jockey-01-login-page');
  });

  test('20 - Jockey: Dashboard (pickup assigned)', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, '02-jockey-02-dashboard');

    // Find the pickup assignment
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const pickup = assignments.find(
      (a: any) => a.type === 'PICKUP' && a.status !== 'COMPLETED'
    );
    if (pickup) {
      pickupAssignmentId = pickup.id || pickup._id;
      if (!bookingId) bookingId = pickup.bookingId;
    }
    console.log(`    Pickup assignment: ${pickupAssignmentId}`);
  });

  test('21 - Jockey: Assignment details / pickup flow', async ({ page }) => {
    await injectToken(page, jockeyToken);

    if (pickupAssignmentId) {
      // EN_ROUTE
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, '02-jockey-03-en-route');

      // AT_LOCATION
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, '02-jockey-04-at-location');

      // Complete pickup
      await apiRequest('POST', `/api/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Vehicle picked up in good condition' },
      });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, '02-jockey-05-pickup-complete');
    } else {
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await shot(page, '02-jockey-03-assignment-details');
    }
  });

  // ==========================================================================
  // PHASE 3: WORKSHOP
  // ==========================================================================

  test('22 - Workshop: Login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/workshop/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, '03-workshop-01-login-page');
  });

  test('23 - Workshop: Dashboard AT_WORKSHOP (Received)', async ({ page }) => {
    // Advance booking to AT_WORKSHOP via test endpoint
    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'AT_WORKSHOP',
      });
      console.log(`    Advance to AT_WORKSHOP: ${JSON.stringify(advanceRes)}`);
    }

    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify badge shows "Received" (pending)
    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, '03-workshop-02-dashboard-received');

    // Open order details modal to show timeline
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, '03-workshop-03-order-details-received');
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  test('24 - Workshop: IN_SERVICE (In Progress)', async ({ page }) => {
    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'IN_SERVICE',
      });
      console.log(`    Advance to IN_SERVICE: ${JSON.stringify(advanceRes)}`);
    }

    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify badge shows "In Progress" (inProgress)
    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, '03-workshop-04-dashboard-in-progress');

    // Open order details modal to show timeline + action buttons
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, '03-workshop-05-order-details-in-progress');
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  test('25 - Workshop: READY_FOR_RETURN (Completed)', async ({ page }) => {
    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'READY_FOR_RETURN',
      });
      console.log(`    Advance to READY_FOR_RETURN: ${JSON.stringify(advanceRes)}`);
    }

    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify badge shows "Completed" (completed)
    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, '03-workshop-06-dashboard-completed');

    // Open order details modal to show completed timeline
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, '03-workshop-07-order-details-completed');
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Find return assignment
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const ret = assignments.find(
      (a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED'
    );
    if (ret) returnAssignmentId = ret.id || ret._id;
    console.log(`    Return assignment: ${returnAssignmentId}`);
  });

  // ==========================================================================
  // PHASE 4: JOCKEY RETURN
  // ==========================================================================

  test('27 - Jockey: Return assignment', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, '04-jockey-01-return-assignment');
  });

  test('28 - Jockey: Return complete', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Vehicle successfully returned' },
      });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, '04-jockey-02-return-complete');
  });

  // ==========================================================================
  // PHASE 5: CUSTOMER FINAL STATE
  // ==========================================================================

  test('29 - Customer: Dashboard completed', async ({ page }) => {
    if (customerToken) {
      await page.goto(`/${LOCALE}`);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), customerToken);
    }
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, '05-customer-01-dashboard-completed');
  });

  test('30 - Customer: Booking details final', async ({ page }) => {
    if (customerToken) {
      await page.goto(`/${LOCALE}`);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), customerToken);
    }
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to click into booking details
    const detailsBtn = page.locator('button:has-text("Details")').first();
    if (await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsBtn.click();
      await page.waitForURL(/\/en\/customer\/bookings\//, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }
    await shot(page, '05-customer-02-booking-details-final');
  });

  test('31 - Summary', async () => {
    console.log(`\n=== EN WALKTHROUGH COMPLETE ===`);
    console.log(`Screenshots taken: ${screenshotCount}`);
    console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
    console.log(`Booking: ${bookingNumber} (${bookingId})`);
  });
});
