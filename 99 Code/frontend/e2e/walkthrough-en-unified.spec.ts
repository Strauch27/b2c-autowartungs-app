/**
 * EN Unified Walkthrough — Full Booking + Extension Lifecycle
 *
 * Combines the ENTIRE booking lifecycle AND the extension flow into ONE
 * sequential spec with screenshots numbered 001, 002, 003... for easy
 * presentation browsing.
 *
 * Phases:
 *   1. Customer Booking    (landing page -> registration -> dashboard)
 *   2. Jockey Pickup       (advance to PICKUP_ASSIGNED, jockey completes pickup)
 *   3. Workshop Received   (advance to AT_WORKSHOP, workshop sees received order)
 *   4. Workshop In Service (advance to IN_SERVICE, workshop sees in-progress order)
 *   5. Extension Flow      (workshop creates extension, customer approves + pays)
 *   6. Workshop Completed  (advance to READY_FOR_RETURN, then RETURN_ASSIGNED)
 *   7. Jockey Return       (dashboard -> en_route -> at_location -> handover complete)
 *   8. Customer Final      (customer sees completed booking with extension)
 *
 * Run:
 *   cd "99 Code/frontend" && PLAYWRIGHT_API_URL=http://localhost:5001 \
 *     npx playwright test walkthrough-en-unified --reporter=list --project="chromium-desktop" 2>&1
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'en-unified');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'en';

const VEHICLE = { brandLabel: 'BMW', model: '3er', year: '2020', mileage: '50000' };
const ADDRESS = { street: '123 Main Street', zip: '58453', city: 'Witten' };

const timestamp = Date.now();
const CUSTOMER = {
  email: `walkthrough-en-unified-${timestamp}@test.de`,
  password: 'WalkThrough123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '015112345678',
};

// ---------------------------------------------------------------------------
// Shared state across serial tests
// ---------------------------------------------------------------------------
let bookingNumber = '';
let bookingId = '';
let customerToken = '';
let jockeyToken = '';
let workshopToken = '';
let pickupAssignmentId = '';
let returnAssignmentId = '';
let extensionId = '';
let screenshotCount = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hide the demo banner and Next.js dev overlay for clean screenshots. */
async function hideBannerAndOverlays(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.bg-yellow-400, [class*="bg-yellow-"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
  }).catch(() => {});
}

/** Take a full-page screenshot with auto-incrementing 3-digit prefix. */
async function shot(page: Page, name: string) {
  screenshotCount++;
  const prefix = String(screenshotCount).padStart(3, '0');
  await hideBannerAndOverlays(page);
  await page.waitForTimeout(600);
  const filename = `${prefix}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
  console.log(`    [screenshot] ${filename}`);
}

/** Get a test token for a given role via the test endpoint. */
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

/** Generic authenticated API request. */
async function apiRequest(method: string, endpoint: string, token: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

/** Navigate to locale root and inject an auth token into localStorage. */
async function injectToken(page: Page, token: string) {
  await page.goto(`/${LOCALE}`);
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
}

/** Log in as the registered customer and store the token. */
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
// UNIFIED WALKTHROUGH
// ============================================================================

test.describe.serial('EN Unified Walkthrough — Booking + Extension Lifecycle', () => {
  test.setTimeout(300_000); // 5 minutes for the full sequence

  // ==========================================================================
  // PHASE 1: CUSTOMER BOOKING FLOW
  // ==========================================================================

  test('Phase 1 — 01: Customer landing page', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'landing-page');
  });

  test('Phase 1 — 02: Click Calculate Price CTA', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    const ctaBtn = page.locator(
      'a:has-text("Calculate Fixed Price Now"), button:has-text("Calculate Fixed Price Now"), ' +
      'a:has-text("Get Your Quote"), button:has-text("Get Your Quote")'
    ).first();
    if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ctaBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    } else {
      await page.goto(`/${LOCALE}/booking`);
      await page.waitForLoadState('networkidle');
    }
    await shot(page, 'booking-wizard-start');
  });

  test('Phase 1 — 03: Vehicle brand dropdown open', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-brand-dropdown');
  });

  test('Phase 1 — 04: Vehicle brand selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-brand-selected');
  });

  test('Phase 1 — 05: Vehicle model dropdown open', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-model-dropdown');
  });

  test('Phase 1 — 06: Vehicle model selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-model-selected');
  });

  test('Phase 1 — 07: Year input', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await shot(page, 'vehicle-year-input');
  });

  test('Phase 1 — 08: Mileage input', async ({ page }) => {
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
    await shot(page, 'vehicle-mileage-input');
  });

  test('Phase 1 — 09: Vehicle form complete', async ({ page }) => {
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
    await page.locator('#year').click(); // blur to trigger validation
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-form-complete');
  });

  test('Phase 1 — 10: Service selection page', async ({ page }) => {
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
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'service-selection');
  });

  test('Phase 1 — 11: Service selected', async ({ page }) => {
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
    await shot(page, 'service-selected');
  });

  test('Phase 1 — 12: Appointment page (empty)', async ({ page }) => {
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
    await shot(page, 'appointment-page-empty');
  });

  test('Phase 1 — 13: Date selected', async ({ page }) => {
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
    // Pick a date
    const dateBtn = page.locator('button:has-text("Pickup Date")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    } else {
      const tomorrow = page.locator('button:has-text("Tomorrow")');
      if (await tomorrow.isVisible({ timeout: 2000 }).catch(() => false)) await tomorrow.click();
    }
    await page.waitForTimeout(300);
    await shot(page, 'date-selected');
  });

  test('Phase 1 — 14: Time slot selected', async ({ page }) => {
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
    // Pick pickup time
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    // Pick return date
    const returnWeek = page.locator('button:has-text("+1 Week")');
    if (await returnWeek.isVisible({ timeout: 2000 }).catch(() => false)) await returnWeek.click();
    // Pick return time
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.waitForTimeout(300);
    await shot(page, 'time-slot-selected');
  });

  test('Phase 1 — 15: Address filled', async ({ page }) => {
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
    await shot(page, 'address-filled');
  });

  test('Phase 1 — 16: Booking submission, registration, and confirmation', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#year')).toBeVisible({ timeout: 10000 });

    // Step 1: Vehicle
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Next")').click();

    // Step 2: Service
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Next")').click();

    // Step 3: Appointment + Address
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

    // Step 4: Contact / Confirmation form (empty)
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await shot(page, 'confirmation-form-empty');

    // Fill contact details
    await page.locator('#firstName').fill(CUSTOMER.firstName);
    await page.locator('#lastName').fill(CUSTOMER.lastName);
    await page.locator('#email').fill(CUSTOMER.email);
    await page.locator('#phone').fill(CUSTOMER.phone);
    await page.locator('#terms').click();
    await page.waitForTimeout(300);
    await shot(page, 'confirmation-form-filled');

    // Submit booking
    const submitBtn = page.locator('button:has-text("Book Now")');
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // Registration page
    await page.waitForURL(/\/en\/booking\/register/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, 'register-page');

    // Extract booking number from the page
    const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
    if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
      bookingNumber = (await bookingNumberEl.textContent()) || '';
    }

    // Fill registration form
    await page.locator('#password').fill(CUSTOMER.password);
    await page.locator('#confirmPassword').fill(CUSTOMER.password);
    await shot(page, 'register-form-filled');

    // Create account
    await page.locator('button:has-text("Create Account")').click();

    // Success page
    await page.waitForURL(/\/en\/booking\/success/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, 'booking-confirmation-success');
  });

  // --------------------------------------------------------------------------
  // Phase 1b: Customer dashboard after booking
  // --------------------------------------------------------------------------

  test('Phase 1 — 17: Customer dashboard after booking', async ({ page }) => {
    customerToken = await customerLogin(page, CUSTOMER.email, CUSTOMER.password);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'dashboard-after-booking');

    // Retrieve bookingId via API for later phases
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

  test('Phase 2 — 18: Setup tokens and advance to PICKUP_ASSIGNED', async () => {
    jockeyToken = await getTestToken('JOCKEY');
    workshopToken = await getTestToken('WORKSHOP');

    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'PICKUP_ASSIGNED',
      });
      console.log(`    Advance to PICKUP_ASSIGNED: ${JSON.stringify(advanceRes)}`);
    }
  });

  test('Phase 2 — 19: Jockey login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/jockey/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'jockey-login-page');
  });

  test('Phase 2 — 20: Jockey dashboard (pickup assigned)', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'jockey-dashboard-pickup');

    // Find pickup assignment
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const pickup = assignments.find((a: any) => a.type === 'PICKUP' && a.status !== 'COMPLETED');
    if (pickup) {
      pickupAssignmentId = pickup.id || pickup._id;
      if (!bookingId) bookingId = pickup.bookingId;
    }
    console.log(`    Pickup assignment: ${pickupAssignmentId}`);
  });

  test('Phase 2 — 21: Jockey pickup flow (en route -> at location -> complete)', async ({ page }) => {
    await injectToken(page, jockeyToken);

    if (pickupAssignmentId) {
      // EN_ROUTE
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-en-route');

      // AT_LOCATION
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-at-location');

      // Complete pickup
      await apiRequest('POST', `/api/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Vehicle picked up in good condition' },
      });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-pickup-complete');
    } else {
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await shot(page, 'jockey-no-assignment');
    }
  });

  // ==========================================================================
  // PHASE 3: WORKSHOP RECEIVED (AT_WORKSHOP)
  // ==========================================================================

  test('Phase 3 — 22: Workshop login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/workshop/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'workshop-login-page');
  });

  test('Phase 3 — 23: Workshop dashboard — received (AT_WORKSHOP)', async ({ page }) => {
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

    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, 'workshop-dashboard-received');

    // Open order details modal
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, 'workshop-order-details-received');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  // ==========================================================================
  // PHASE 4: WORKSHOP IN SERVICE (IN_SERVICE)
  // ==========================================================================

  test('Phase 4 — 24: Workshop dashboard — in service (IN_SERVICE)', async ({ page }) => {
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

    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, 'workshop-dashboard-in-progress');

    // Open order details modal
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, 'workshop-order-details-in-progress');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  // ==========================================================================
  // PHASE 5: EXTENSION FLOW
  //   Workshop creates extension -> Customer reviews, approves, pays
  // ==========================================================================

  test('Phase 5 — 25: Workshop opens extension modal', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    await shot(page, 'workshop-order-list-for-extension');

    // Find the "+" button on our booking row to open the extension modal
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const extensionBtn = orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    await expect(extensionBtn).toBeVisible({ timeout: 10000 });
    await extensionBtn.click();
    await page.waitForTimeout(800);

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await shot(page, 'workshop-extension-modal-empty');
  });

  test('Phase 5 — 26: Workshop fills extension form', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open extension modal
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const extensionBtn = orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    await expect(extensionBtn).toBeVisible({ timeout: 10000 });
    await extensionBtn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    const dialog = page.locator('[role="dialog"]');

    // Fill extension item 1: brake discs
    const descTextarea = dialog.locator('textarea').first();
    await expect(descTextarea).toBeVisible({ timeout: 5000 });
    await descTextarea.fill('Front brake discs worn - replacement needed');

    const priceInput = dialog.locator('input[type="number"]').first();
    await priceInput.fill('185.50');
    await page.waitForTimeout(300);
    await shot(page, 'workshop-extension-item-1-filled');

    // Add a second item via the "+" button inside the modal
    const addItemBtn = dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await page.waitForTimeout(300);

      const secondTextarea = dialog.locator('textarea').nth(1);
      if (await secondTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await secondTextarea.fill('Front brake pads replacement');
        const secondPrice = dialog.locator('input[type="number"]').nth(1);
        if (await secondPrice.isVisible({ timeout: 2000 }).catch(() => false)) {
          await secondPrice.fill('95.00');
        }
      }
      await page.waitForTimeout(300);
      await shot(page, 'workshop-extension-two-items');
    }
  });

  test('Phase 5 — 27: Workshop submits extension', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open extension modal and fill it
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const extensionBtn = orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    await expect(extensionBtn).toBeVisible({ timeout: 10000 });
    await extensionBtn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    const dialog = page.locator('[role="dialog"]');

    // Fill item 1
    await dialog.locator('textarea').first().fill('Front brake discs worn - replacement needed');
    await dialog.locator('input[type="number"]').first().fill('185.50');

    // Add item 2
    const addItemBtn = dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await page.waitForTimeout(300);
      const secondTextarea = dialog.locator('textarea').nth(1);
      if (await secondTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await secondTextarea.fill('Front brake pads replacement');
        const secondPrice = dialog.locator('input[type="number"]').nth(1);
        if (await secondPrice.isVisible({ timeout: 2000 }).catch(() => false)) {
          await secondPrice.fill('95.00');
        }
      }
    }

    // Submit — look for the send button (lucide-send icon)
    const sendBtn = dialog.locator('button').filter({ has: page.locator('svg.lucide-send') });
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
    } else {
      // Fallback: find submit/send button by text
      const buttons = dialog.locator('button');
      const count = await buttons.count();
      for (let i = count - 1; i >= 0; i--) {
        const btn = buttons.nth(i);
        const text = await btn.textContent() || '';
        if (text.match(/send|submit/i)) {
          await btn.click();
          break;
        }
      }
    }
    await page.waitForTimeout(1500);
    await shot(page, 'workshop-extension-submitted');
  });

  test('Phase 5 — 28: Verify extension created (API fallback)', async () => {
    // Check if extension was created via UI
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const extensions = extRes.data || [];

    if (extensions.length > 0) {
      extensionId = extensions[0].id;
      console.log(`    Extension found: ${extensionId} status=${extensions[0].status} total=${extensions[0].totalAmount}`);
    } else {
      // UI creation may have failed, create via API as fallback
      console.log('    No extension found, creating via API...');
      const createRes = await apiRequest('POST', `/api/workshops/orders/${bookingId}/extensions`, workshopToken, {
        description: 'Front brake discs worn - replacement needed',
        items: [
          { name: 'Front brake discs replacement', price: 18550, quantity: 1 },
          { name: 'Front brake pads replacement', price: 9500, quantity: 1 },
        ],
        images: [],
      });
      if (createRes.success && createRes.data) {
        extensionId = createRes.data.id;
        console.log(`    Extension created via API: ${extensionId}`);
      }
    }
    expect(extensionId).toBeTruthy();
  });

  test('Phase 5 — 29: Customer dashboard with pending extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-dashboard-pending-extension');
  });

  test('Phase 5 — 30: Customer booking details', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-booking-details-with-extension');
  });

  test('Phase 5 — 31: Customer opens extensions tab', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Debug: log actual extension API response
    const extDebug = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    console.log(`    Extension API response: ${JSON.stringify(extDebug).substring(0, 500)}`);
    if (extDebug.data?.[0]) {
      console.log(`    items type: ${typeof extDebug.data[0].items}, isArray: ${Array.isArray(extDebug.data[0].items)}`);
    }

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }
    await shot(page, 'customer-extensions-tab');
  });

  test('Phase 5 — 32: Customer reviews extension details', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open extension review modal via the prominent amber button (AlertTriangle icon)
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }
    await shot(page, 'customer-extension-review-details');
  });

  test('Phase 5 — 33: Customer approves extension and sees payment', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal via the prominent amber button
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click Approve / Pay button
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Approve|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'customer-extension-payment-form');
  });

  test('Phase 5 — 34: Customer completes demo payment for extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal via the prominent amber button
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click approve
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Approve|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }

    // Click demo payment button
    const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
    if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shot(page, 'customer-demo-payment-ready');
      await demoPayBtn.click();
      await page.waitForTimeout(4000);
      await shot(page, 'customer-extension-payment-success');
    } else {
      console.log('    Demo pay button not found, using API fallback');
      const authRes = await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      console.log(`    API authorize: success=${authRes.success}`);
      await shot(page, 'customer-extension-payment-state');
    }
  });

  test('Phase 5 — 35: Ensure extension is approved (API fallback)', async () => {
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const exts = extRes.data || [];
    const ext = exts.find((e: any) => e.id === extensionId);

    if (ext && ext.status === 'PENDING') {
      console.log('    Extension still PENDING, authorizing via API...');
      const authRes = await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      console.log(`    API authorize: success=${authRes.success}`);
    } else {
      console.log(`    Extension status: ${ext?.status || 'unknown'}`);
    }
  });

  test('Phase 5 — 36: Customer sees extension confirmed', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'customer-extension-confirmed');
  });

  test('Phase 5 — 37: Workshop sees approved extension', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open order details to see extension status
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const detailsBtn = orderRow.locator('button:has-text("Details")');
    if (await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsBtn.click();
      await page.waitForTimeout(1000);
    }
    await shot(page, 'workshop-extension-approved');
  });

  // ==========================================================================
  // PHASE 6: WORKSHOP COMPLETED (READY_FOR_RETURN)
  // ==========================================================================

  test('Phase 6 — 38: Workshop dashboard — completed (READY_FOR_RETURN)', async ({ page }) => {
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

    const badge = page.locator('[data-testid="booking-status"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
    console.log(`    Dashboard badge text: ${await badge.textContent()}`);
    await shot(page, 'workshop-dashboard-completed');

    // Open order details
    const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailsBtn = orderRow.locator('button:has-text("Details")');
      await detailsBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await shot(page, 'workshop-order-details-completed');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  });

  test('Phase 6 — 38b: Advance to RETURN_ASSIGNED (creates return assignment)', async () => {
    // Advance to RETURN_ASSIGNED so the test controller creates the jockey return assignment
    if (bookingId) {
      const advanceRes = await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'RETURN_ASSIGNED',
      });
      console.log(`    Advance to RETURN_ASSIGNED: ${JSON.stringify(advanceRes)}`);
    }

    // Find the return assignment
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const ret = assignments.find((a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED');
    if (ret) returnAssignmentId = ret.id || ret._id;
    console.log(`    Return assignment: ${returnAssignmentId}`);
    expect(returnAssignmentId).toBeTruthy();
  });

  // ==========================================================================
  // PHASE 7: JOCKEY RETURN
  // ==========================================================================

  test('Phase 7 — 39: Jockey dashboard with return assignment', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'jockey-return-assignment');
  });

  test('Phase 7 — 40: Jockey return en route', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-en-route');
  });

  test('Phase 7 — 41: Jockey return at location', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-at-location');
  });

  test('Phase 7 — 42: Jockey return complete (handover)', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Vehicle successfully returned to customer' },
      });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-complete');
  });

  // ==========================================================================
  // PHASE 8: CUSTOMER FINAL STATE
  // ==========================================================================

  test('Phase 8 — 43: Customer dashboard final', async ({ page }) => {
    if (customerToken) {
      await page.goto(`/${LOCALE}`);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), customerToken);
    }
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-dashboard-final');
  });

  test('Phase 8 — 44: Customer booking details final (invoice)', async ({ page }) => {
    if (customerToken) {
      await page.goto(`/${LOCALE}`);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), customerToken);
    }
    // Show Details tab (invoice view) with final status
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-booking-details-final');
  });

  // ==========================================================================
  // SUMMARY
  // ==========================================================================

  test('Summary', async () => {
    console.log(`\n=== EN UNIFIED WALKTHROUGH COMPLETE ===`);
    console.log(`Screenshots taken: ${screenshotCount}`);
    console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
    console.log(`Booking: ${bookingNumber} (${bookingId})`);
    console.log(`Extension: ${extensionId}`);
  });
});
