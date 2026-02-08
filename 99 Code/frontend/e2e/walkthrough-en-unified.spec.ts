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

const VEHICLE = { brandId: 'bmw', brandLabel: 'BMW', model: '3er', year: '2020', mileage: '50000' };
const ADDRESS = { street: '123 Main Street', zip: '58453', city: 'Witten' };

// Viewport presets per role
const VIEWPORT_MOBILE = { width: 390, height: 844 };   // iPhone 14 Pro — Customer & Jockey
const VIEWPORT_DESKTOP = { width: 1280, height: 720 };  // Workshop (desktop app)

const timestamp = Date.now();
const CUSTOMER = {
  email: `john.doe+${String(timestamp).slice(-4)}@test.de`,
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

/** Set viewport for the current role */
async function setMobileViewport(page: Page) {
  await page.setViewportSize(VIEWPORT_MOBILE);
}
async function setDesktopViewport(page: Page) {
  await page.setViewportSize(VIEWPORT_DESKTOP);
}

/** Scroll an element into view before interacting (important for mobile) */
async function scrollTo(page: Page, locator: ReturnType<Page['locator']>) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
}

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

/** Fill vehicle form fields (reusable across tests that restart from page goto) */
async function fillVehicleForm(page: Page) {
  await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
  await page.waitForTimeout(300);
  await page.locator('[role="combobox"]').first().click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
  await page.waitForTimeout(200);
  await page.locator('[role="combobox"]').nth(1).click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
  await page.locator('#mileage').fill(VEHICLE.mileage);
}

/** Navigate through vehicle + service steps to reach the appointment step */
async function navigateToAppointmentStep(page: Page) {
  await page.goto(`/${LOCALE}/booking`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
  await fillVehicleForm(page);
  const next1 = page.locator('button:has-text("Next")');
  await scrollTo(page, next1);
  await next1.click();
  const serviceCard = page.locator('[data-testid="service-card-inspection"]');
  await expect(serviceCard).toBeVisible({ timeout: 10000 });
  await scrollTo(page, serviceCard);
  await serviceCard.click();
  const next2 = page.locator('button:has-text("Next")');
  await scrollTo(page, next2);
  await next2.click();
  await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
}

/** Pick a date in the appointment step (inline calendar) */
async function pickDate(page: Page) {
  // Wait for calendar grid to be ready, then click first available (non-disabled) day
  await page.locator('[role="grid"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('[role="gridcell"] button:not([disabled])').first().click({ timeout: 5000 });
  await page.waitForTimeout(500);
}

/** Pick time slots in the appointment step */
async function pickTimeSlots(page: Page) {
  await page.locator('[data-testid="time-slot-10:00"]').click();
}

/** Fill address fields (scrolls into view for mobile) */
async function fillAddress(page: Page) {
  const street = page.locator('#street');
  await scrollTo(page, street);
  await street.fill(ADDRESS.street);
  await page.locator('#zip').fill(ADDRESS.zip);
  await page.locator('#city').fill(ADDRESS.city);
}

// ============================================================================
// UNIFIED WALKTHROUGH
// ============================================================================

test.describe.serial('EN Unified Walkthrough — Booking + Extension Lifecycle', () => {
  test.setTimeout(300_000); // 5 minutes for the full sequence

  // Auto-set viewport based on test phase/role
  test.beforeEach(async ({ page }, testInfo) => {
    const title = testInfo.title;
    // Workshop tests get desktop viewport
    if (/Workshop|workshop|Phase 3|Phase 4|Phase 5 — 2[5-7]|Phase 5 — 37|Phase 6 — 38[^b]/.test(title)) {
      await setDesktopViewport(page);
    // Landing page stays desktop
    } else if (/Phase 1 — 01/.test(title)) {
      await setDesktopViewport(page);
    // Customer + Jockey tests get mobile viewport
    } else {
      await setMobileViewport(page);
    }
  });

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
    const ctaBtn = page.locator('[data-testid="hero-booking-cta"]').first();
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

  test('Phase 1 — 03: Vehicle brand card grid', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-brand-dropdown');
  });

  test('Phase 1 — 04: Vehicle brand selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-brand-selected');
  });

  test('Phase 1 — 05: Vehicle model dropdown open', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-model-dropdown');
  });

  test('Phase 1 — 06: Vehicle model selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-model-selected');
  });

  test('Phase 1 — 07: Year selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
    await shot(page, 'vehicle-year-input');
  });

  test('Phase 1 — 08: Mileage input', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await shot(page, 'vehicle-mileage-input');
  });

  test('Phase 1 — 09: Vehicle form complete', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.waitForTimeout(200);
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('#mileage').click(); // blur to trigger validation
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-form-complete');
  });

  test('Phase 1 — 10: Service selection page', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await fillVehicleForm(page);
    const nextBtn = page.locator('button:has-text("Next")');
    await scrollTo(page, nextBtn);
    await nextBtn.click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'service-selection');
  });

  test('Phase 1 — 11: Service selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await fillVehicleForm(page);
    const nextBtn = page.locator('button:has-text("Next")');
    await scrollTo(page, nextBtn);
    await nextBtn.click();
    const serviceCard = page.locator('[data-testid="service-card-inspection"]');
    await expect(serviceCard).toBeVisible({ timeout: 10000 });
    await scrollTo(page, serviceCard);
    await serviceCard.click();
    await page.waitForTimeout(300);
    await shot(page, 'service-selected');
  });

  test('Phase 1 — 12: Appointment page (empty)', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await shot(page, 'appointment-page-empty');
  });

  test('Phase 1 — 13: Date selected', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await page.waitForTimeout(300);
    await shot(page, 'date-selected');
  });

  test('Phase 1 — 14: Time slot selected', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await page.waitForTimeout(300);
    await shot(page, 'time-slot-selected');
  });

  test('Phase 1 — 15: Address filled', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await fillAddress(page);
    await page.waitForTimeout(300);
    await shot(page, 'address-filled');
  });

  test('Phase 1 — 16: Booking submission, registration, and confirmation', async ({ page }) => {
    // Steps 1-3: Vehicle -> Service -> Appointment + Address
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await fillAddress(page);
    const nextBtn = page.locator('button:has-text("Next")');
    await scrollTo(page, nextBtn);
    await nextBtn.click();

    // Step 4: Contact / Confirmation form (empty)
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await shot(page, 'confirmation-form-empty');

    // Fill contact details (scroll to each section for mobile)
    const firstNameInput = page.locator('#firstName');
    await scrollTo(page, firstNameInput);
    await firstNameInput.fill(CUSTOMER.firstName);
    await page.locator('#lastName').fill(CUSTOMER.lastName);
    const emailInput = page.locator('#email');
    await scrollTo(page, emailInput);
    await emailInput.fill(CUSTOMER.email);
    await page.locator('#phone').fill(CUSTOMER.phone);
    const termsCheckbox = page.locator('#terms');
    await scrollTo(page, termsCheckbox);
    await termsCheckbox.click();
    await page.waitForTimeout(300);
    await shot(page, 'confirmation-form-filled');

    // Submit booking
    const submitBtn = page.locator('button:has-text("Book Now")');
    await scrollTo(page, submitBtn);
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

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'workshop-dashboard-received');

    // Navigate to order detail page
    const kanbanCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await kanbanCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kanbanCard.click();
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-received');
    } else {
      // Fallback: navigate directly to order detail page
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-received');
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

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'workshop-dashboard-in-progress');

    // Navigate to order detail page
    const kanbanCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await kanbanCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kanbanCard.click();
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-in-progress');
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-in-progress');
    }
  });

  // ==========================================================================
  // PHASE 5: EXTENSION FLOW
  //   Workshop creates extension -> Customer reviews, approves, pays
  // ==========================================================================

  test('Phase 5 — 25: Workshop opens extension form', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'workshop-order-detail-before-extension');

    // Click "New Extension" text link to show inline form
    const newExtBtn = page.locator('button').filter({ hasText: /New Extension|Extension|Erweiterung/i });
    if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newExtBtn.click();
      await page.waitForTimeout(800);
    }
    await shot(page, 'workshop-extension-form-empty');
  });

  test('Phase 5 — 26: Workshop fills extension form and submits', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open inline extension form
    const newExtBtn = page.locator('button').filter({ hasText: /New Extension|Extension|Erweiterung/i });
    if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newExtBtn.click();
      await page.waitForTimeout(800);
    }

    const form = page.locator('[data-testid="inline-extension-form"]');
    await expect(form).toBeVisible({ timeout: 5000 });

    // Fill description
    await form.locator('textarea').first().fill('Front brake discs worn - replacement needed');

    // Fill item 1: name and unit price (use table row selectors to avoid cross-matching)
    const rows = form.locator('tbody tr');
    const row1 = rows.nth(0);
    await row1.locator('td').nth(0).locator('input').fill('Front brake discs');
    await row1.locator('td').nth(2).locator('input').fill('185.50');
    await page.waitForTimeout(300);
    await shot(page, 'workshop-extension-item-1-filled');

    // Add a second item via "Add Position" link
    const addItemBtn = form.locator('button').filter({ hasText: /Position|Add|hinzufügen/i });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await page.waitForTimeout(300);

      // Fill item 2 using the second table row
      const row2 = rows.nth(1);
      if (await row2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await row2.locator('td').nth(0).locator('input').fill('Front brake pads');
        await row2.locator('td').nth(2).locator('input').fill('95.00');
      }
      await page.waitForTimeout(300);
      await shot(page, 'workshop-extension-two-items');
    }

    // Submit the extension via Send button
    const sendBtn = form.locator('button').filter({ hasText: /senden|send|submit/i });
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
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

    // Click extensions tab (scroll for mobile)
    const extensionsTab = page.locator('button').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
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
    const extensionsTab = page.locator('button').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open extension review modal (scroll for mobile)
    const extensionActionBtn = page.locator('button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionActionBtn);
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
    const extensionsTab = page.locator('button').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal (scroll for mobile)
    const extensionActionBtn = page.locator('button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionActionBtn);
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click Approve / Pay button (scroll within dialog for mobile)
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Approve|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, approveBtn);
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
    const extensionsTab = page.locator('button').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal (scroll for mobile)
    const extensionActionBtn = page.locator('button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionActionBtn);
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click approve (scroll within dialog for mobile)
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Approve|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, approveBtn);
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }

    // Click demo payment button (scroll for mobile)
    const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
    if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shot(page, 'customer-demo-payment-ready');
      await scrollTo(page, demoPayBtn);
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

    const extensionsTab = page.locator('button').filter({ hasText: /Extensions?/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'customer-extension-confirmed');
  });

  test('Phase 5 — 37: Workshop sees approved extension', async ({ page }) => {
    await injectToken(page, workshopToken);
    // Navigate directly to order detail page to see extension status
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
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

    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'workshop-dashboard-completed');

    // Navigate to order detail page
    const kanbanCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await kanbanCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kanbanCard.click();
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-completed');
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await shot(page, 'workshop-order-details-completed');
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
