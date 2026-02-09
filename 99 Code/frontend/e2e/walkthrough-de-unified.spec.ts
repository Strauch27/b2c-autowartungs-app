/**
 * DE Unified Walkthrough — Complete Booking Lifecycle + Extension Flow
 *
 * Merges the main booking walkthrough AND the extension flow into ONE
 * sequential test file with screenshots numbered 001, 002, 003... for
 * easy presentation browsing.
 *
 * Phases:
 *   1. Customer Booking (landing -> vehicle -> service -> date -> address -> submit -> register -> confirm)
 *   2. Jockey Pickup (login -> dashboard -> en_route -> at_location -> complete)
 *   3. Workshop Received (login -> dashboard AT_WORKSHOP -> order details)
 *   4. Workshop In Service (dashboard IN_SERVICE -> order details)
 *   5. Extension Flow (workshop creates -> customer reviews -> approves -> pays -> workshop sees approved)
 *   6. Workshop Completed (dashboard READY_FOR_RETURN -> advance to RETURN_ASSIGNED)
 *   7. Jockey Return (dashboard -> en_route -> at_location -> handover complete)
 *   8. Customer Final (dashboard completed -> booking details)
 *
 * Run:
 *   cd "99 Code/frontend" && PLAYWRIGHT_API_URL=http://localhost:5001 \
 *     npx playwright test walkthrough-de-unified --reporter=list --project="chromium-desktop" 2>&1
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'de-unified');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'de';

const VEHICLE = { brandId: 'bmw', brandLabel: 'BMW', model: '3er', year: '2020', mileage: '50000' };
const ADDRESS = { street: 'Musterstraße 123', zip: '58453', city: 'Witten' };

// Viewport presets per role
const VIEWPORT_MOBILE = { width: 390, height: 844 };   // iPhone 14 Pro — Customer & Jockey
const VIEWPORT_DESKTOP = { width: 1280, height: 720 };  // Workshop (desktop app)

const timestamp = Date.now();
const CUSTOMER = {
  email: `max.mustermann+${String(timestamp).slice(-4)}@test.de`,
  password: 'WalkThrough123!',
  firstName: 'Max',
  lastName: 'Mustermann',
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

/** Hide demo banner and Next.js dev overlay for clean screenshots */
async function hideBannerAndOverlays(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.bg-yellow-400, [class*="bg-yellow-"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
    // Fix sticky headers appearing mid-page in fullPage screenshots
    document.querySelectorAll('[data-testid="top-bar"]').forEach(el => {
      (el as HTMLElement).style.position = 'relative';
    });
  }).catch(() => {});
}

/** Take a full-page screenshot with auto-incrementing 3-digit number prefix */
async function shot(page: Page, name: string) {
  screenshotCount++;
  const prefix = String(screenshotCount).padStart(3, '0');
  const filename = `${prefix}-${name}.png`;
  await hideBannerAndOverlays(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
  console.log(`    [screenshot] ${filename}`);
}

/** Get a test token for a given role */
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

/** Generic API request helper */
async function apiRequest(method: string, endpoint: string, token: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

/** Inject an auth token into localStorage and navigate to locale root */
async function injectToken(page: Page, token: string) {
  await page.goto(`/${LOCALE}`);
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
}

/** Login as a customer with email/password and inject the token */
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
  // Brand card grid
  await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
  await page.waitForTimeout(300);
  // Model dropdown (first combobox after brand selection)
  await page.locator('[role="combobox"]').first().click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
  await page.waitForTimeout(200);
  // Year dropdown (second combobox)
  await page.locator('[role="combobox"]').nth(1).click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
  // Mileage input
  await page.locator('#mileage').fill(VEHICLE.mileage);
}

/** Navigate through vehicle + service steps to reach the appointment step */
async function navigateToAppointmentStep(page: Page) {
  await page.goto(`/${LOCALE}/booking`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
  await fillVehicleForm(page);
  const weiter1 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter1);
  await weiter1.click();
  const serviceCard = page.locator('[data-testid="service-card-inspection"]');
  await expect(serviceCard).toBeVisible({ timeout: 10000 });
  await scrollTo(page, serviceCard);
  await serviceCard.click();
  const weiter2 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter2);
  await weiter2.click();
  await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
}

/** Pick a date in the appointment step */
async function pickDate(page: Page) {
  // Wait for calendar grid to be ready, then click first available (non-disabled) day
  await page.locator('[role="grid"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('[role="gridcell"] button:not([disabled])').first().click({ timeout: 5000 });
  await page.waitForTimeout(500);
}

/** Pick time slots in the appointment step */
async function pickTimeSlots(page: Page) {
  await page.locator('[data-testid="time-slot-10:00"]').click();
  // Return date is auto-set, return time is auto-set to 18:00
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

test.describe.serial('DE Unified Walkthrough', () => {
  test.setTimeout(300_000); // 5 minutes total

  // Auto-set viewport based on test phase/role
  test.beforeEach(async ({ page }, testInfo) => {
    const title = testInfo.title;
    // Workshop tests get desktop viewport
    if (/Workshop|P3-|P4-|P5-01|P5-02|P5-03|P5-11|P6-01/.test(title)) {
      await setDesktopViewport(page);
    // Landing page stays desktop
    } else if (/P1-01/.test(title)) {
      await setDesktopViewport(page);
    // Customer + Jockey tests get mobile viewport
    } else if (/Customer|Jockey|P[1278]-|P5-0[4-9]|P5-10/.test(title)) {
      await setMobileViewport(page);
    }
  });

  // ==========================================================================
  // PHASE 1: CUSTOMER BOOKING FLOW
  // ==========================================================================

  test('P1-01 - Customer: Landing Page', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'landing-page');
  });

  test('P1-02 - Customer: Click Preis berechnen', async ({ page }) => {
    await page.goto(`/${LOCALE}`);
    await page.waitForLoadState('networkidle');
    const ctaBtn = page.locator('a:has-text("Jetzt Termin buchen"), button:has-text("Jetzt Termin buchen"), [data-testid="hero-booking-cta"]').first();
    if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ctaBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    } else {
      await page.goto(`/${LOCALE}/booking`);
      await page.waitForLoadState('networkidle');
    }
    await shot(page, 'click-price-button');
  });

  test('P1-03 - Customer: Vehicle brand card grid', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-brand-grid');
  });

  test('P1-04 - Customer: Vehicle brand selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-brand-selected');
  });

  test('P1-05 - Customer: Vehicle model select (dropdown open)', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
    await page.waitForTimeout(300);
    await page.locator('[role="combobox"]').first().click();
    await page.waitForTimeout(400);
    await shot(page, 'vehicle-model-dropdown');
  });

  test('P1-06 - Customer: Vehicle model selected', async ({ page }) => {
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

  test('P1-07 - Customer: Year selected', async ({ page }) => {
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
    await shot(page, 'vehicle-year-selected');
  });

  test('P1-08 - Customer: Mileage input', async ({ page }) => {
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

  test('P1-09 - Customer: Vehicle form complete', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await fillVehicleForm(page);
    // Scroll to bottom of form for mobile screenshot
    const mileageInput = page.locator('#mileage');
    await scrollTo(page, mileageInput);
    await mileageInput.click(); // trigger validation
    await page.waitForTimeout(300);
    await shot(page, 'vehicle-form-complete');
  });

  test('P1-10 - Customer: Service selection page', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await fillVehicleForm(page);
    const weiterBtn = page.locator('button:has-text("Weiter")');
    await scrollTo(page, weiterBtn);
    await weiterBtn.click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible({ timeout: 10000 });
    await shot(page, 'service-selection');
  });

  test('P1-11 - Customer: Service selected', async ({ page }) => {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await fillVehicleForm(page);
    const weiterBtn = page.locator('button:has-text("Weiter")');
    await scrollTo(page, weiterBtn);
    await weiterBtn.click();
    const serviceCard = page.locator('[data-testid="service-card-inspection"]');
    await expect(serviceCard).toBeVisible({ timeout: 10000 });
    await scrollTo(page, serviceCard);
    await serviceCard.click();
    await page.waitForTimeout(300);
    await shot(page, 'service-selected');
  });

  test('P1-12 - Customer: Appointment page (empty)', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await shot(page, 'appointment-page-empty');
  });

  test('P1-13 - Customer: Date selected', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await page.waitForTimeout(300);
    await shot(page, 'date-selected');
  });

  test('P1-14 - Customer: Time slot selected', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await page.waitForTimeout(300);
    await shot(page, 'time-slot-selected');
  });

  test('P1-15 - Customer: Address filled', async ({ page }) => {
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await fillAddress(page);
    await page.waitForTimeout(300);
    await shot(page, 'address-filled');
  });

  test('P1-16 - Customer: Booking submit + register + confirm', async ({ page }) => {
    // Navigate through all steps to the confirmation step
    await navigateToAppointmentStep(page);
    await pickDate(page);
    await pickTimeSlots(page);
    await fillAddress(page);
    const weiterBtn = page.locator('button:has-text("Weiter")');
    await scrollTo(page, weiterBtn);
    await weiterBtn.click();

    // Step 4 - Contact / confirmation form
    await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });
    await shot(page, 'booking-confirm-empty');

    // Fill contact info (scroll to each field on mobile)
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
    await shot(page, 'booking-confirm-filled');

    // Submit booking
    const submitBtn = page.locator('button:has-text("Jetzt kostenpflichtig buchen")');
    await scrollTo(page, submitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // Wait for registration page
    await page.waitForURL(/\/de\/booking\/register/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, 'register-page');

    // Extract booking number
    const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
    if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
      bookingNumber = (await bookingNumberEl.textContent()) || '';
    }

    // Fill registration form
    await page.locator('#password').fill(CUSTOMER.password);
    await page.locator('#confirmPassword').fill(CUSTOMER.password);
    await shot(page, 'register-filled');

    await page.locator('button:has-text("Konto erstellen")').click();

    // Wait for success page
    await page.waitForURL(/\/de\/booking\/success/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await shot(page, 'confirmation-page');
  });

  test('P1-17 - Customer: Dashboard after booking', async ({ page }) => {
    // Login as the newly created customer
    customerToken = await customerLogin(page, CUSTOMER.email, CUSTOMER.password);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'dashboard-after-booking');

    // Retrieve booking ID via API for later phases
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

  test('P2-01 - Setup: Get role tokens and advance to PICKUP_ASSIGNED', async () => {
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

  test('P2-02 - Jockey: Login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/jockey/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'jockey-login-page');
  });

  test('P2-03 - Jockey: Dashboard (pickup assigned)', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'jockey-dashboard-pickup');

    // Find the pickup assignment for our booking
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

  test('P2-04 - Jockey: Pickup flow (en_route -> at_location -> complete)', async ({ page }) => {
    await injectToken(page, jockeyToken);

    if (pickupAssignmentId) {
      // EN_ROUTE
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-pickup-en-route');

      // AT_LOCATION
      await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-pickup-at-location');

      // Complete pickup
      await apiRequest('POST', `/api/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Fahrzeug in gutem Zustand abgeholt' },
      });
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await shot(page, 'jockey-pickup-complete');
    } else {
      await page.goto(`/${LOCALE}/jockey/dashboard`);
      await page.waitForLoadState('networkidle');
      await shot(page, 'jockey-pickup-details');
    }
  });

  // ==========================================================================
  // PHASE 3: WORKSHOP RECEIVED (AT_WORKSHOP)
  // ==========================================================================

  test('P3-01 - Workshop: Login page', async ({ page }) => {
    await page.goto(`/${LOCALE}/workshop/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, 'workshop-login-page');
  });

  test('P3-02 - Workshop: Dashboard AT_WORKSHOP (Eingegangen)', async ({ page }) => {
    // Advance booking to AT_WORKSHOP
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

    // Kanban board should be visible
    const kanban = page.locator('[data-testid="kanban-board"]');
    if (await kanban.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log('    Kanban board visible');
    }
    await shot(page, 'workshop-dashboard-received');

    // Navigate to order detail page
    const card = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailBtn = card.locator('button:has-text("Details"), a:has-text("Details")').first();
      if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn.click();
      } else {
        await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      }
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, 'workshop-order-details-received');
  });

  // ==========================================================================
  // PHASE 4: WORKSHOP IN SERVICE (IN_SERVICE)
  // ==========================================================================

  test('P4-01 - Workshop: Dashboard IN_SERVICE (In Bearbeitung)', async ({ page }) => {
    // Advance booking to IN_SERVICE
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

    await shot(page, 'workshop-dashboard-in-progress');

    // Navigate to order detail page
    const card = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailBtn = card.locator('button:has-text("Details"), a:has-text("Details"), button:has-text("Erweiterung"), button:has-text("Abschliessen"), button:has-text("Abschließen")').first();
      if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn.click();
      } else {
        await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      }
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, 'workshop-order-details-in-progress');
  });

  // ==========================================================================
  // PHASE 5: EXTENSION FLOW
  //
  // Workshop creates an extension on OUR booking (not the seed booking),
  // customer reviews, approves, and pays (demo payment), workshop confirms.
  // ==========================================================================

  test('P5-01 - Workshop: Open extension form on our booking', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'workshop-order-detail-before-extension');

    // Click "New Extension" text link to show inline form
    const newExtBtn = page.locator('button').filter({ hasText: /Neue Erweiterung|New Extension|Erweiterung/i });
    if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newExtBtn.click();
      await page.waitForTimeout(800);
    }
    await shot(page, 'workshop-extension-form-empty');
  });

  test('P5-02 - Workshop: Fill extension form with two items', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open inline extension form
    const newExtBtn = page.locator('button').filter({ hasText: /Neue Erweiterung|New Extension|Erweiterung/i });
    if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newExtBtn.click();
      await page.waitForTimeout(800);
    }

    const form = page.locator('[data-testid="inline-extension-form"]');
    await expect(form).toBeVisible({ timeout: 5000 });

    // Fill description
    await form.locator('textarea').first().fill('Bremsscheiben vorne abgenutzt');

    // Fill item 1: name and unit price (use table row selectors to avoid cross-matching)
    const rows = form.locator('tbody tr');
    const row1 = rows.nth(0);
    await row1.locator('td').nth(0).locator('input').fill('Bremsscheiben vorne');
    await row1.locator('td').nth(2).locator('input').fill('185.50');
    await page.waitForTimeout(300);
    await shot(page, 'workshop-extension-item1-filled');

    // Add a second item via "Add Position" link
    const addItemBtn = form.locator('button').filter({ hasText: /Position|hinzufügen|Add/i });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await page.waitForTimeout(300);

      // Fill item 2 using the second table row
      const row2 = rows.nth(1);
      if (await row2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await row2.locator('td').nth(0).locator('input').fill('Bremsbeläge vorne');
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

  test('P5-03 - Verify extension created (API fallback if UI failed)', async () => {
    // Check if extension was created via the UI
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const extensions = extRes.data || [];

    if (extensions.length > 0) {
      extensionId = extensions[0].id;
      console.log(`    Extension found via UI: ${extensionId} status=${extensions[0].status} total=${extensions[0].totalAmount}`);
    } else {
      // UI creation may have failed (e.g., cents vs euros format), create via API
      console.log('    No extension found from UI, creating via API fallback...');
      const createRes = await apiRequest('POST', `/api/workshops/orders/${bookingId}/extensions`, workshopToken, {
        description: 'Bremsscheiben vorne abgenutzt',
        items: [
          { name: 'Bremsscheiben vorne', price: 18550, quantity: 1 },
          { name: 'Bremsbeläge vorne', price: 9500, quantity: 1 },
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

  test('P5-04 - Customer: Dashboard shows booking with pending extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-dashboard-pending-extension');
  });

  test('P5-05 - Customer: Booking details page', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-booking-details-with-extension');
  });

  test('P5-06 - Customer: Extensions tab with pending extension', async ({ page }) => {
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

    // Click extensions tab (scroll into view for mobile)
    const extensionsTab = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }
    await shot(page, 'customer-extensions-tab-pending');
  });

  test('P5-07 - Customer: Review extension details', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Click the extension action button (scroll into view for mobile)
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

  test('P5-08 - Customer: Approve extension and pay (demo payment)', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to extensions tab
    const extensionsTab = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal via the prominent amber button
    const extensionActionBtn = page.locator('button').filter({
      has: page.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionActionBtn);
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click approve button in the modal (scroll within dialog for mobile)
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Genehmigen|Approve|bezahlen|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, approveBtn);
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'customer-extension-payment-form');

    // Click demo payment button
    const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
    if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, demoPayBtn);
      await demoPayBtn.click();
      await page.waitForTimeout(4000);
      await shot(page, 'customer-extension-payment-success');
    } else {
      console.log('    Demo pay button not found, using API fallback');
      const authRes = await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      console.log(`    API authorize: success=${authRes.success}`);
      await shot(page, 'customer-extension-state-after-api');
    }
  });

  test('P5-09 - Ensure extension is approved (API fallback)', async () => {
    // Double-check extension status; authorize via API if still pending
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const exts = extRes.data || [];
    const ext = exts.find((e: any) => e.id === extensionId);

    if (ext && ext.status === 'PENDING') {
      console.log('    Extension still PENDING, authorizing via API fallback...');
      const authRes = await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      console.log(`    API authorize: success=${authRes.success}`);
    } else {
      console.log(`    Extension status: ${ext?.status || 'unknown'}`);
    }
  });

  test('P5-10 - Customer: Extension confirmed state', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(page, extensionsTab);
      await extensionsTab.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'customer-extension-confirmed');
  });

  test('P5-11 - Workshop: See approved extension in order details', async ({ page }) => {
    await injectToken(page, workshopToken);
    // Navigate directly to order detail page
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'workshop-extension-approved');
  });

  // ==========================================================================
  // PHASE 6: WORKSHOP COMPLETED (READY_FOR_RETURN)
  // ==========================================================================

  test('P6-01 - Workshop: Dashboard READY_FOR_RETURN (Abgeschlossen)', async ({ page }) => {
    // Advance booking to READY_FOR_RETURN
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

    // Verify kanban board is visible
    const kanban = page.locator('[data-testid="kanban-board"]');
    if (await kanban.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log('    Kanban board visible');
    }
    await shot(page, 'workshop-dashboard-completed');

    // Navigate to order detail page (full page, not modal)
    const card = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailBtn = card.locator('button:has-text("Details"), a:has-text("Details")');
      if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn.click();
      }
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await shot(page, 'workshop-order-details-completed');
  });

  test('P6-02 - Setup: Advance to RETURN_ASSIGNED (creates return assignment)', async () => {
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
    const ret = assignments.find(
      (a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED'
    );
    if (ret) returnAssignmentId = ret.id || ret._id;
    console.log(`    Return assignment: ${returnAssignmentId}`);
    expect(returnAssignmentId).toBeTruthy();
  });

  // ==========================================================================
  // PHASE 7: JOCKEY RETURN
  // ==========================================================================

  test('P7-01 - Jockey: Dashboard with return assignment', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'jockey-return-assignment');
  });

  test('P7-02 - Jockey: Return en route', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-en-route');
  });

  test('P7-03 - Jockey: Return at location', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    }
    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-at-location');
  });

  test('P7-04 - Jockey: Return complete (handover)', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Fahrzeug erfolgreich an Kunden zurückgegeben' },
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

  test('P8-01 - Customer: Dashboard completed', async ({ page }) => {
    if (customerToken) {
      await page.goto(`/${LOCALE}`);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), customerToken);
    }
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'customer-dashboard-final');
  });

  test('P8-02 - Customer: Booking details final (Rechnung)', async ({ page }) => {
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
    console.log(`\n=== DE UNIFIED WALKTHROUGH COMPLETE ===`);
    console.log(`Screenshots taken: ${screenshotCount}`);
    console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
    console.log(`Booking: ${bookingNumber} (${bookingId})`);
    console.log(`Extension: ${extensionId}`);
  });
});
