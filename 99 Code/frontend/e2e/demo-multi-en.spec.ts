/**
 * DEMO MULTI EN — 3 Browser Windows in Parallel (Full E2E)
 *
 * Shows Customer (phone), Jockey (phone), and Workshop (desktop) side-by-side
 * in 3 separate browser windows. The Jockey flow is UI-driven: buttons for
 * Start Route, Arrived, and Complete Handover — including photo upload,
 * signature, and checklist.
 *
 * Layout (1920×1080 target):
 *   +--------+--------+------------------------+
 *   |Customer| Jockey |       Workshop         |
 *   | Phone  | Phone  |       Desktop          |
 *   | 375×720| 375×720|       650×750          |
 *   |  x=0   | x=440  |       x=880            |
 *   +--------+--------+------------------------+
 *
 * Pace is ~50% slower than single-browser demo to let the audience
 * absorb narration overlays across 3 windows.
 *
 * Run:
 *   cd "99 Code/frontend" && npm run test:demo:multi:en
 *   DEMO_PACE=fast npm run test:demo:multi:en   # quick testing
 *   DEMO_PACE=slow npm run test:demo:multi:en   # real presentations
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import {
  launchDemoWindows,
  closeDemoWindows,
  setActiveRole,
  clearAllDimming,
  refreshAllDashboards,
  refreshSelectiveDashboards,
  showPhaseBannerOnActive,
  hidePhaseBannerOnActive,
  showStepOnActive,
  shotMulti,
  shotActive,
  injectDeviceFrames,
  setupFrameReinjection,
  injectRoleLabels,
  setupLabelReinjection,
  setupAutoConfirm,
  setupClickIndicators,
  setupGlobalCSS,
  smoothScrollTo,
  resetScreenshotCount,
  ROLE_COLORS,
  type DemoWindows,
} from './helpers/multi-browser-helpers';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'demo-multi-en');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'en';

// Pace is deliberately slower (+50%) — audience must scan 3 windows
const PACE = (process.env.DEMO_PACE || 'normal') as 'fast' | 'normal' | 'slow';
const PAUSE_MS = { fast: 1500, normal: 5000, slow: 9000 }[PACE];
const ACTION_MS = { fast: 500, normal: 1000, slow: 1800 }[PACE];

const VEHICLE = { brandId: 'audi', brandLabel: 'Audi', model: 'A6', year: '2025', mileage: '12300' };
const ADDRESS = { street: 'Hackelersberg 2', zip: '21244', city: 'Buchholz in der Nordheide' };

const CUSTOMER = {
  email: 'sten.rauch@ronya.de',
  password: 'DemoLive123!',
  firstName: 'Sten',
  lastName: 'Rauch',
  phone: '015112345678',
};

// ---------------------------------------------------------------------------
// API Helpers
// ---------------------------------------------------------------------------

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

async function customerLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success || !data.token) throw new Error(`Customer login failed: ${JSON.stringify(data)}`);
  return data.token;
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

type Page = import('@playwright/test').Page;

async function scrollTo(page: Page, locator: ReturnType<Page['locator']>) {
  await smoothScrollTo(page, locator);
}

async function fillVehicleForm(page: Page) {
  await page.locator(`[data-testid="brand-card-${VEHICLE.brandId}"]`).click();
  await page.waitForTimeout(ACTION_MS);
  await page.locator('[role="combobox"]').first().click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
  await page.waitForTimeout(ACTION_MS);
  await page.locator('[role="combobox"]').nth(1).click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#mileage').fill(VEHICLE.mileage);
}

async function pickDate(page: Page) {
  await page.locator('[role="grid"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('[role="gridcell"] button:not([disabled])').first().click({ timeout: 5000 });
  await page.waitForTimeout(ACTION_MS);
}

async function pickTimeSlots(page: Page) {
  await page.locator('[data-testid="time-slot-10:00"]').click();
}

async function fillAddress(page: Page) {
  const street = page.locator('#street');
  await scrollTo(page, street);
  await street.fill(ADDRESS.street);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#zip').fill(ADDRESS.zip);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#city').fill(ADDRESS.city);
}

// ---------------------------------------------------------------------------
// Jockey UI Helpers — interact via the real UI buttons
// ---------------------------------------------------------------------------

/** Click the action button on the active assignment card */
async function clickJockeyAction(page: Page, assignmentId: string) {
  const actionBtn = page.locator(`[data-testid="jockey-action-${assignmentId}"]`);
  if (await actionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, actionBtn);
    await actionBtn.click();
    await page.waitForTimeout(1500);
  }
}

/** Tap the assignment card to open the detail view */
async function openAssignmentDetail(page: Page, assignmentId: string) {
  const card = page.locator(`[data-testid="jockey-card-${assignmentId}"]`);
  if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Click the card body (not the action button)
    await card.locator('> div').first().click();
    await page.waitForTimeout(1500);
  }
}

/** Simulate a drawn signature on the signature pad canvas */
async function drawSignature(page: Page) {
  const canvas = page.locator('[data-testid="signature-pad"] canvas');
  if (await canvas.isVisible({ timeout: 5000 }).catch(() => false)) {
    const box = await canvas.boundingBox();
    if (box) {
      // Draw a simple zigzag signature
      const startX = box.x + box.width * 0.1;
      const centerY = box.y + box.height * 0.5;
      await page.mouse.move(startX, centerY);
      await page.mouse.down();
      for (let i = 0; i < 6; i++) {
        const x = startX + (box.width * 0.13) * (i + 1);
        const y = centerY + (i % 2 === 0 ? -box.height * 0.25 : box.height * 0.25);
        await page.mouse.move(x, y, { steps: 5 });
      }
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  }
}

/** Check all items in the handover checklist */
async function fillHandoverChecklist(page: Page) {
  const checkboxIds = ['vehicleReceived', 'conditionDocumented', 'keysReceived', 'customerSignature', 'mileageRecorded'];
  for (const id of checkboxIds) {
    const cb = page.locator(`[data-testid="checklist-${id}"]`);
    if (await cb.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cb.click();
      await page.waitForTimeout(300);
    }
  }
}

/** Fill the mandatory mileage input in the handover detail view */
async function fillMileage(page: Page, km: string = '12345') {
  const mileageInput = page.locator('[data-testid="mileage-input"]');
  if (await mileageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await scrollTo(page, mileageInput);
    await mileageInput.fill(km);
    await page.waitForTimeout(300);
  }
}

/** Click the complete handover button in the detail view */
async function clickCompleteHandover(page: Page) {
  const btn = page.locator('[data-testid="complete-handover-btn"]');
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, btn);
    await btn.click();
    await page.waitForTimeout(2000);
  }
}

// ============================================================================
// THE MULTI-BROWSER DEMO TEST
// ============================================================================

test('Demo Multi EN — 3 Windows Parallel (Full E2E)', async () => {
  test.setTimeout(900_000); // 15 minutes

  console.log(`\n=== DEMO MULTI EN START (pace: ${PACE}, 3 windows) ===\n`);
  resetScreenshotCount();

  // ── DB Reset: clean slate before every demo run ──
  console.log('    Resetting database...');
  const resetRes = await fetch(`${API_BASE}/api/test/reset`, { method: 'POST' });
  if (resetRes.ok) {
    console.log('    ✅ Database reset — fresh test data seeded');
  } else {
    console.warn(`    ⚠️  DB reset failed (${resetRes.status}), running against existing data`);
  }

  // Shared state
  let bookingNumber = '';
  let bookingId = '';
  let customerToken = '';
  let jockeyToken = '';
  let workshopToken = '';
  let pickupAssignmentId = '';
  let returnAssignmentId = '';
  let extensionId = '';

  let windows: DemoWindows | null = null;

  try {
    windows = await launchDemoWindows(PACE === 'fast' ? 100 : 250);
    const cPage = windows.customer.page;
    const jPage = windows.jockey.page;
    const wPage = windows.workshop.page;

    // Setup auto-confirm for browser confirm() dialogs (Jockey actions)
    setupAutoConfirm(windows);
    // Setup smooth scrolling, click indicators, label re-injection after navigations
    setupGlobalCSS(windows);
    await setupClickIndicators(windows);
    setupFrameReinjection(windows);
    setupLabelReinjection(windows);

    // Fetch Jockey + Workshop tokens upfront so they start logged-in
    jockeyToken = await getTestToken('JOCKEY');
    workshopToken = await getTestToken('WORKSHOP');
    const tokens = { customer: '', jockey: jockeyToken, workshop: workshopToken };

    // Initial: Customer on landing page, Jockey + Workshop on their dashboards
    await cPage.goto(`/${LOCALE}`);
    // Jockey: set token then navigate to dashboard
    await jPage.goto(`/${LOCALE}`);
    await jPage.evaluate((t) => localStorage.setItem('auth_token_jockey', t), jockeyToken);
    await jPage.goto(`/${LOCALE}/jockey/dashboard`);
    // Workshop: set token then navigate to dashboard
    await wPage.goto(`/${LOCALE}`);
    await wPage.evaluate((t) => localStorage.setItem('auth_token_workshop', t), workshopToken);
    await wPage.goto(`/${LOCALE}/workshop/dashboard`);
    await Promise.all([
      cPage.waitForLoadState('networkidle'),
      jPage.waitForLoadState('networkidle'),
      wPage.waitForLoadState('networkidle'),
    ]);

    // Inject device frames and role labels
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    // ========================================================================
    // PHASE 1 — Customer: Book a Service
    // ========================================================================
    await setActiveRole(windows, 'customer');

    await showPhaseBannerOnActive(windows, 'customer',
      'Phase 1 — Customer Books a Service',
      'A customer books a workshop appointment with pickup & delivery.<br>Jockey and Workshop portals are waiting for work.',
      ROLE_COLORS.customer,
    );
    await cPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'customer');

    // --- Landing Page: Hero ---
    await showStepOnActive(windows, 'customer', 'Landing page: fixed pricing, vetted workshops, instant confirmation.', ROLE_COLORS.customer, ACTION_MS);
    await shotMulti(windows, 'landing-hero', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // --- Landing Page: Scroll through sections ---
    const howItWorks = cPage.locator('[data-testid="how-it-works-section"]').first();
    if (await howItWorks.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showStepOnActive(windows, 'customer', 'How it works: 3 simple steps — Book, We Pick Up, We Deliver Back.', ROLE_COLORS.customer, ACTION_MS);
      await smoothScrollTo(cPage, howItWorks);
      await cPage.waitForTimeout(PAUSE_MS);
      await shotActive(windows, 'customer', 'landing-how-it-works', SCREENSHOT_DIR);
    }

    const servicesSection = cPage.locator('[data-testid="services-section"]').first();
    if (await servicesSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showStepOnActive(windows, 'customer', 'Services: transparent fixed pricing for every vehicle and service type.', ROLE_COLORS.customer, ACTION_MS);
      await smoothScrollTo(cPage, servicesSection);
      await cPage.waitForTimeout(PAUSE_MS);
      await shotActive(windows, 'customer', 'landing-services', SCREENSHOT_DIR);
    }

    const trustSection = cPage.locator('[data-testid="trust-section"]').first();
    if (await trustSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showStepOnActive(windows, 'customer', 'Trust: 4.9 rating, 500+ customers, certified partner workshops.', ROLE_COLORS.customer, ACTION_MS);
      await smoothScrollTo(cPage, trustSection);
      await cPage.waitForTimeout(PAUSE_MS);
      await shotActive(windows, 'customer', 'landing-trust', SCREENSHOT_DIR);
    }

    // Scroll back to hero CTA
    const heroSection = cPage.locator('[data-testid="hero-section"]').first();
    if (await heroSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await smoothScrollTo(cPage, heroSection);
      await cPage.waitForTimeout(ACTION_MS);
    } else {
      await cPage.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await cPage.waitForTimeout(1000);
    }

    // --- Click CTA ---
    await showStepOnActive(windows, 'customer', 'The customer taps "Book Now" to start the 4-step booking wizard.', ROLE_COLORS.customer, ACTION_MS);
    const ctaBtn = cPage.locator('[data-testid="hero-booking-cta"]').first();
    if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ctaBtn.click();
      await cPage.waitForLoadState('networkidle');
    } else {
      await cPage.goto(`/${LOCALE}/booking`);
      await cPage.waitForLoadState('networkidle');
    }
    await cPage.waitForTimeout(ACTION_MS);

    // --- Vehicle Selection ---
    await expect(cPage.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
    await showStepOnActive(windows, 'customer', 'Step 1: Vehicle — select from a visual brand grid.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'vehicle-brand-grid', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    await showStepOnActive(windows, 'customer', 'Audi > A6 > 2025 > 12,300 km — precise fixed price.', ROLE_COLORS.customer, ACTION_MS);
    await fillVehicleForm(cPage);
    await shotActive(windows, 'customer', 'vehicle-form-complete', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // --- Service Selection ---
    const nextBtn1 = cPage.locator('button:has-text("Next")');
    await scrollTo(cPage, nextBtn1);
    await nextBtn1.click();
    const serviceCard = cPage.locator('[data-testid="service-card-inspection"]');
    await expect(serviceCard).toBeVisible({ timeout: 10000 });

    await showStepOnActive(windows, 'customer', 'Step 2: Service — real-time pricing. No estimates, no surprises.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'service-selection', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    await scrollTo(cPage, serviceCard);
    await serviceCard.click();
    await cPage.waitForTimeout(ACTION_MS);

    await showStepOnActive(windows, 'customer', '"Inspection" selected — fixed price. Extra work requires explicit approval later.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'service-selected', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // --- Appointment & Address ---
    const nextBtn2 = cPage.locator('button:has-text("Next")');
    await scrollTo(cPage, nextBtn2);
    await nextBtn2.click();
    await expect(cPage.locator('#street')).toBeVisible({ timeout: 10000 });

    await showStepOnActive(windows, 'customer', 'Step 3: Appointment — date, time slot, and pickup address.', ROLE_COLORS.customer, ACTION_MS);
    await pickDate(cPage);
    await pickTimeSlots(cPage);
    await fillAddress(cPage);
    await shotActive(windows, 'customer', 'appointment-filled', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // --- Confirmation & Contact Details ---
    const nextBtn3 = cPage.locator('button:has-text("Next")');
    await scrollTo(cPage, nextBtn3);
    await nextBtn3.click();
    await expect(cPage.locator('#firstName')).toBeVisible({ timeout: 10000 });

    await showStepOnActive(windows, 'customer', 'Step 4: Confirmation — contact details, summary, one tap to book.', ROLE_COLORS.customer, ACTION_MS);
    await cPage.locator('#firstName').fill(CUSTOMER.firstName);
    await cPage.waitForTimeout(ACTION_MS);
    await cPage.locator('#lastName').fill(CUSTOMER.lastName);
    await cPage.waitForTimeout(ACTION_MS);
    const emailInput = cPage.locator('#email');
    await scrollTo(cPage, emailInput);
    await emailInput.fill(CUSTOMER.email);
    await cPage.waitForTimeout(ACTION_MS);
    await cPage.locator('#phone').fill(CUSTOMER.phone);
    await cPage.waitForTimeout(ACTION_MS);
    const termsCheckbox = cPage.locator('#terms');
    await scrollTo(cPage, termsCheckbox);
    await termsCheckbox.click();
    await shotActive(windows, 'customer', 'booking-confirm-filled', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    // --- Submit Booking ---
    await showStepOnActive(windows, 'customer', 'Submitting — fixed-price service with concierge pickup.', ROLE_COLORS.customer, ACTION_MS);
    const submitBtn = cPage.locator('button:has-text("Book Now")');
    await scrollTo(cPage, submitBtn);
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // --- Registration ---
    await cPage.waitForURL(/\/en\/booking\/register/, { timeout: 30000 });
    await cPage.waitForTimeout(1000);
    await showStepOnActive(windows, 'customer', 'Account registration — password to track bookings in real-time.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'register-page', SCREENSHOT_DIR);

    const bookingNumberEl = cPage.locator('.text-xl.font-bold.text-blue-600');
    if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
      bookingNumber = (await bookingNumberEl.textContent()) || '';
    }

    await cPage.locator('#password').fill(CUSTOMER.password);
    await cPage.waitForTimeout(ACTION_MS);
    await cPage.locator('#confirmPassword').fill(CUSTOMER.password);
    await cPage.waitForTimeout(ACTION_MS);
    await cPage.locator('button:has-text("Create Account")').click();

    // --- Success Page ---
    await cPage.waitForURL(/\/en\/booking\/success/, { timeout: 30000 });
    await cPage.waitForTimeout(1000);
    await showStepOnActive(windows, 'customer', 'Booking confirmed! Booking number and next steps visible.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'confirmation-page', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // --- Customer Dashboard ---
    customerToken = await customerLogin(CUSTOMER.email, CUSTOMER.password);
    await cPage.goto(`/${LOCALE}`);
    await cPage.evaluate((t) => localStorage.setItem('auth_token_customer', t), customerToken);
    await cPage.goto(`/${LOCALE}/customer/dashboard`);
    await cPage.waitForLoadState('networkidle');
    await cPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'customer', 'Customer dashboard: live status bar — like package tracking for car service.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'dashboard-after-booking', SCREENSHOT_DIR);

    // Get booking ID
    const bookingsRes = await apiRequest('GET', '/api/bookings', customerToken);
    if (bookingsRes.success && bookingsRes.data?.length) {
      const ourBooking = bookingsRes.data.find((b: any) => b.bookingNumber === bookingNumber) || bookingsRes.data[0];
      bookingId = ourBooking.id || ourBooking._id;
      if (!bookingNumber) bookingNumber = ourBooking.bookingNumber;
    }
    console.log(`    Booking: ${bookingNumber} (${bookingId})`);

    // Update tokens object with customer token for dashboard refreshes
    tokens.customer = customerToken;

    // ========================================================================
    // PHASE 2 — Jockey: Vehicle Pickup (UI-Driven)
    // ========================================================================
    if (bookingId) {
      await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'PICKUP_ASSIGNED',
      });
    }

    // Refresh ALL dashboards — booking just got assigned
    await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await setActiveRole(windows, 'jockey');

    await showPhaseBannerOnActive(windows, 'jockey',
      'Phase 2 — Jockey: Vehicle Pickup',
      'The Jockey sees the pickup assignment on his phone.<br>Watch: he uses real UI buttons to update his status.',
      ROLE_COLORS.jockey,
    );
    await jPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'jockey');

    await showStepOnActive(windows, 'jockey', 'Jockey dashboard: new pickup assignment with customer, vehicle, and time.', ROLE_COLORS.jockey, ACTION_MS);
    await jPage.waitForTimeout(1500);
    await shotMulti(windows, 'pickup-assigned-overview', SCREENSHOT_DIR);
    await jPage.waitForTimeout(PAUSE_MS);

    // Find pickup assignment from API to get ID
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const pickup = assignments.find((a: any) => a.type === 'PICKUP' && a.status !== 'COMPLETED');
    if (pickup) {
      pickupAssignmentId = pickup.id || pickup._id;
      if (!bookingId) bookingId = pickup.bookingId;
    }
    console.log(`    Pickup assignment: ${pickupAssignmentId}`);

    if (pickupAssignmentId) {
      // --- Start Route (UI button) ---
      await showStepOnActive(windows, 'jockey', 'Tapping "Start Route" — the Jockey begins driving to the customer.', ROLE_COLORS.jockey, ACTION_MS);
      await clickJockeyAction(jPage, pickupAssignmentId);
      await refreshSelectiveDashboards(windows, LOCALE, ['customer', 'jockey'], bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1000);
      await showStepOnActive(windows, 'jockey', 'Status: EN ROUTE — customer sees the live update on their dashboard.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'pickup-en-route', SCREENSHOT_DIR, ['customer', 'jockey']);
      await jPage.waitForTimeout(PAUSE_MS);

      // --- Arrived (UI button) ---
      await showStepOnActive(windows, 'jockey', 'Tapping "Arrived" — the Jockey is at the customer\'s location.', ROLE_COLORS.jockey, ACTION_MS);
      await clickJockeyAction(jPage, pickupAssignmentId);
      await refreshSelectiveDashboards(windows, LOCALE, ['customer', 'jockey'], bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1000);
      await showStepOnActive(windows, 'jockey', 'Status: AT LOCATION — vehicle inspection and handover begin.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'pickup-at-location', SCREENSHOT_DIR, ['customer', 'jockey']);
      await jPage.waitForTimeout(PAUSE_MS);

      // --- Open Assignment Detail (tap the card) ---
      await showStepOnActive(windows, 'jockey', 'Opening assignment details — the full handover workflow.', ROLE_COLORS.jockey, ACTION_MS);
      await openAssignmentDetail(jPage, pickupAssignmentId);
      await jPage.waitForTimeout(1500);

      // Check if we're in the detail view
      const detailView = jPage.locator('[data-testid="assignment-detail"]');
      if (await detailView.isVisible({ timeout: 5000 }).catch(() => false)) {
        await showStepOnActive(windows, 'jockey', 'Assignment detail: customer info, vehicle, map, and handover checklist.', ROLE_COLORS.jockey, ACTION_MS);
        await shotActive(windows, 'jockey', 'pickup-detail-view', SCREENSHOT_DIR);
        await jPage.waitForTimeout(PAUSE_MS);

        // --- Handover Checklist ---
        await showStepOnActive(windows, 'jockey', 'Handover checklist: vehicle received, condition documented, keys received.', ROLE_COLORS.jockey, ACTION_MS);
        await fillHandoverChecklist(jPage);
        await jPage.waitForTimeout(ACTION_MS);
        await shotActive(windows, 'jockey', 'pickup-checklist-filled', SCREENSHOT_DIR);
        await jPage.waitForTimeout(PAUSE_MS);

        // --- Photo Documentation ---
        const photoGrid = jPage.locator('[data-testid="photo-doc-grid"]');
        if (await photoGrid.isVisible({ timeout: 3000 }).catch(() => false)) {
          await showStepOnActive(windows, 'jockey', 'Photo documentation: 4 slots for vehicle condition photos.', ROLE_COLORS.jockey, ACTION_MS);
          await scrollTo(jPage, photoGrid);
          await shotActive(windows, 'jockey', 'pickup-photo-grid', SCREENSHOT_DIR);
          await jPage.waitForTimeout(PAUSE_MS);
        }

        // --- Signature Pad ---
        const sigPad = jPage.locator('[data-testid="signature-pad"]');
        if (await sigPad.isVisible({ timeout: 3000 }).catch(() => false)) {
          await showStepOnActive(windows, 'jockey', 'Customer signature: digital proof of vehicle handover.', ROLE_COLORS.jockey, ACTION_MS);
          await scrollTo(jPage, sigPad);
          await drawSignature(jPage);
          await shotActive(windows, 'jockey', 'pickup-signature-drawn', SCREENSHOT_DIR);
          await jPage.waitForTimeout(PAUSE_MS);
        }

        // --- Mileage ---
        await showStepOnActive(windows, 'jockey', 'Recording mileage — mandatory for every handover, pickup and return.', ROLE_COLORS.jockey, ACTION_MS);
        await fillMileage(jPage, '12300');
        await shotActive(windows, 'jockey', 'pickup-mileage-filled', SCREENSHOT_DIR);
        await jPage.waitForTimeout(ACTION_MS);

        // --- Complete Handover ---
        await showStepOnActive(windows, 'jockey', 'Completing the pickup — all documentation saved, vehicle on its way to workshop.', ROLE_COLORS.jockey, ACTION_MS);
        await clickCompleteHandover(jPage);
      } else {
        // Fallback: use the action button on the card (Complete Handover)
        await showStepOnActive(windows, 'jockey', 'Completing pickup via action button.', ROLE_COLORS.jockey, ACTION_MS);
        await clickJockeyAction(jPage, pickupAssignmentId);
      }

      // Refresh all after pickup completion
      await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1500);
      await showStepOnActive(windows, 'jockey', 'Pickup complete! Vehicle documented and on its way to the workshop.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'pickup-complete', SCREENSHOT_DIR);
      await jPage.waitForTimeout(PAUSE_MS);
    }

    // ========================================================================
    // PHASE 3 — Workshop: Vehicle Received
    // ========================================================================
    if (bookingId) {
      await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'AT_WORKSHOP',
      });
    }

    await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await setActiveRole(windows, 'workshop');

    await showPhaseBannerOnActive(windows, 'workshop',
      'Phase 3 — Workshop: Vehicle Received',
      'The order appears on the workshop\'s digital Kanban board.<br>No paperwork, no phone calls — digital order management.',
      ROLE_COLORS.workshop,
    );
    await wPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'workshop');

    await showStepOnActive(windows, 'workshop', 'Kanban board: orders flow through Received, In Progress, Completed, Return.', ROLE_COLORS.workshop, ACTION_MS);
    await shotMulti(windows, 'workshop-received', SCREENSHOT_DIR);
    await wPage.waitForTimeout(PAUSE_MS);

    // Navigate to order details
    const card3 = wPage.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await card3.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailBtn3 = card3.locator('button:has-text("Details"), a:has-text("Details")').first();
      if (await detailBtn3.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn3.click();
      } else {
        await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      }
    } else {
      await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
    await wPage.waitForLoadState('networkidle');
    await wPage.waitForTimeout(1500);
    await showStepOnActive(windows, 'workshop', 'Order details: vehicle, customer, service, and full status timeline.', ROLE_COLORS.workshop, ACTION_MS);
    await shotActive(windows, 'workshop', 'order-details-received', SCREENSHOT_DIR);
    await wPage.waitForTimeout(PAUSE_MS);

    // ========================================================================
    // PHASE 4 — Workshop: Create Extension (Additional Work)
    // ========================================================================
    if (bookingId) {
      await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'IN_SERVICE',
      });
    }

    await wPage.goto(`/${LOCALE}`);
    await wPage.evaluate((t) => localStorage.setItem('auth_token_workshop', t), workshopToken);
    await wPage.goto(`/${LOCALE}/workshop/dashboard`);
    await wPage.waitForLoadState('networkidle');

    await showPhaseBannerOnActive(windows, 'workshop',
      'Phase 4 — Workshop: Additional Work Needed',
      'During inspection, worn brake discs discovered.<br>A digital cost estimate is sent — our key differentiator.',
      ROLE_COLORS.workshop,
    );
    await wPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'workshop');

    await wPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'workshop', 'Order moved to "In Progress" — the mechanic has started work.', ROLE_COLORS.workshop, ACTION_MS);
    await shotActive(windows, 'workshop', 'dashboard-in-progress', SCREENSHOT_DIR);

    // Navigate to order detail
    const card4 = wPage.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
    if (await card4.isVisible({ timeout: 5000 }).catch(() => false)) {
      const detailBtn4 = card4.locator('button:has-text("Details"), a:has-text("Details"), button:has-text("Extension"), button:has-text("Complete")').first();
      if (await detailBtn4.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn4.click();
      } else {
        await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
      }
    } else {
      await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
    await wPage.waitForLoadState('networkidle');
    await wPage.waitForTimeout(1500);
    await showStepOnActive(windows, 'workshop', 'The mechanic opens the order to document additional work found.', ROLE_COLORS.workshop, ACTION_MS);
    await shotActive(windows, 'workshop', 'order-details-in-progress', SCREENSHOT_DIR);
    await wPage.waitForTimeout(ACTION_MS);

    // Open extension form
    await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await wPage.waitForLoadState('networkidle');
    await wPage.waitForTimeout(2000);

    const newExtBtn = wPage.locator('button').filter({ hasText: /New Extension|Extension|Erweiterung|Neue Erweiterung/i });
    if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newExtBtn.click();
      await wPage.waitForTimeout(800);
    }
    await showStepOnActive(windows, 'workshop', '"New Extension" form: describe the issue and add itemized pricing.', ROLE_COLORS.workshop, ACTION_MS);
    await shotActive(windows, 'workshop', 'extension-form-empty', SCREENSHOT_DIR);
    await wPage.waitForTimeout(ACTION_MS);

    // Fill extension form
    const form = wPage.locator('[data-testid="inline-extension-form"]');
    await expect(form).toBeVisible({ timeout: 5000 });

    await showStepOnActive(windows, 'workshop', 'Item 1: Front brake discs — EUR 185.50. Transparent pricing.', ROLE_COLORS.workshop, ACTION_MS);
    await form.locator('textarea').first().fill('Front brake discs worn - replacement recommended');
    await wPage.waitForTimeout(ACTION_MS);

    const rows = form.locator('tbody tr');
    const row1 = rows.nth(0);
    await row1.locator('td').nth(0).locator('input').fill('Front brake discs');
    await wPage.waitForTimeout(ACTION_MS);
    await row1.locator('td').nth(2).locator('input').fill('185.50');
    await wPage.waitForTimeout(ACTION_MS);
    await shotActive(windows, 'workshop', 'extension-item1-filled', SCREENSHOT_DIR);

    // Add second item
    const addItemBtn = form.locator('button').filter({ hasText: /Position|Add|hinzufügen/i });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await wPage.waitForTimeout(ACTION_MS);
      await showStepOnActive(windows, 'workshop', 'Item 2: Front brake pads — EUR 95.00. Total: EUR 280.50.', ROLE_COLORS.workshop, ACTION_MS);
      const row2 = rows.nth(1);
      if (await row2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await row2.locator('td').nth(0).locator('input').fill('Front brake pads');
        await wPage.waitForTimeout(ACTION_MS);
        await row2.locator('td').nth(2).locator('input').fill('95.00');
        await wPage.waitForTimeout(ACTION_MS);
      }
      await shotActive(windows, 'workshop', 'extension-two-items', SCREENSHOT_DIR);
    }

    // Submit extension
    await showStepOnActive(windows, 'workshop', 'Sending cost estimate to customer. No work without digital approval.', ROLE_COLORS.workshop, ACTION_MS);
    const sendBtn = form.locator('button').filter({ hasText: /senden|send|submit/i });
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
    }
    await wPage.waitForTimeout(2000);
    await shotActive(windows, 'workshop', 'extension-submitted', SCREENSHOT_DIR);

    // Verify/create extension via API
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const extensions = extRes.data || [];
    if (extensions.length > 0) {
      extensionId = extensions[0].id;
      console.log(`    Extension found: ${extensionId} status=${extensions[0].status}`);
    } else {
      console.log('    No extension from UI, creating via API fallback...');
      const createRes = await apiRequest('POST', `/api/workshops/orders/${bookingId}/extensions`, workshopToken, {
        description: 'Front brake discs worn - replacement recommended',
        items: [
          { name: 'Front brake discs', price: 18550, quantity: 1 },
          { name: 'Front brake pads', price: 9500, quantity: 1 },
        ],
        images: [],
      });
      if (createRes.success && createRes.data) {
        extensionId = createRes.data.id;
        console.log(`    Extension created via API: ${extensionId}`);
      }
    }

    // ========================================================================
    // PHASE 5 — Customer: Review & Approve Extension
    // ========================================================================
    await refreshSelectiveDashboards(windows, LOCALE, ['customer'], bookingId, tokens);
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await setActiveRole(windows, 'customer');

    await showPhaseBannerOnActive(windows, 'customer',
      'Phase 5 — Customer: Extension Approval',
      'The customer gets a notification about recommended additional work.<br>Full cost transparency, full control over the decision.',
      ROLE_COLORS.customer,
    );
    await cPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'customer');

    await cPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'customer', '"1 extension awaiting approval" — real-time notification.', ROLE_COLORS.customer, ACTION_MS);
    await shotMulti(windows, 'extension-pending-overview', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // Booking details
    await cPage.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await cPage.waitForLoadState('networkidle');
    await cPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'customer', 'Booking details: service status and pending extension notification.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'booking-details-with-extension', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    // Extensions tab
    await cPage.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await cPage.waitForLoadState('networkidle');
    await cPage.waitForTimeout(2000);

    const extensionsTab = cPage.locator('button').filter({ hasText: /Extensions?|Erweiterungen/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(cPage, extensionsTab);
      await extensionsTab.click();
      await cPage.waitForTimeout(3000);
    }
    await showStepOnActive(windows, 'customer', 'Extensions tab: items listed with individual prices and total.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'extensions-tab-pending', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    // Review extension details
    const extensionActionBtn = cPage.locator('button').filter({
      has: cPage.locator('svg.lucide-triangle-alert'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(cPage, extensionActionBtn);
      await extensionActionBtn.click();
      await cPage.waitForTimeout(1000);
    }
    await showStepOnActive(windows, 'customer', 'Review: brake discs EUR 185.50, pads EUR 95.00. Approve or decline.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'extension-review-details', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // Approve and pay
    const approveBtn = cPage.locator('[role="dialog"] button').filter({
      hasText: /Approve|Pay|Genehmigen|bezahlen/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await showStepOnActive(windows, 'customer', 'One tap to approve — digital authorization for work and payment.', ROLE_COLORS.customer, ACTION_MS);
      await scrollTo(cPage, approveBtn);
      await approveBtn.click();
      await cPage.waitForTimeout(1500);
    }
    await shotActive(windows, 'customer', 'extension-payment-form', SCREENSHOT_DIR);
    await cPage.waitForTimeout(ACTION_MS);

    // Demo payment
    const demoPayBtn = cPage.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
    if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await showStepOnActive(windows, 'customer', 'Demo mode: simulated payment. Production uses real Stripe with 3D Secure.', ROLE_COLORS.customer, ACTION_MS);
      await scrollTo(cPage, demoPayBtn);
      await demoPayBtn.click();
      await cPage.waitForTimeout(4000);
      await shotActive(windows, 'customer', 'extension-payment-success', SCREENSHOT_DIR);
    } else {
      console.log('    Demo pay button not found, using API fallback');
      await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      await shotActive(windows, 'customer', 'extension-state-after-api', SCREENSHOT_DIR);
    }

    // Ensure extension is approved
    const extCheck = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const extList = extCheck.data || [];
    const ext = extList.find((e: any) => e.id === extensionId);
    if (ext && ext.status === 'PENDING') {
      console.log('    Extension still PENDING, authorizing via API fallback...');
      await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
    }

    // Extension confirmed
    await cPage.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await cPage.waitForLoadState('networkidle');
    await cPage.waitForTimeout(2000);
    const extensionsTab2 = cPage.locator('button').filter({ hasText: /Extensions?|Erweiterungen/i });
    if (await extensionsTab2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scrollTo(cPage, extensionsTab2);
      await extensionsTab2.click();
      await cPage.waitForTimeout(1500);
    }
    await showStepOnActive(windows, 'customer', 'Extension approved and paid! Status "Approved" — workshop can proceed.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'extension-confirmed', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // ========================================================================
    // PHASE 6 — Workshop: Service Completed
    // ========================================================================
    if (bookingId) {
      await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'READY_FOR_RETURN',
      });
    }

    await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await setActiveRole(windows, 'workshop');

    await showPhaseBannerOnActive(windows, 'workshop',
      'Phase 6 — Workshop: Service Completed',
      'All work done — original service plus approved extension.<br>The return process starts automatically.',
      ROLE_COLORS.workshop,
    );
    await wPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'workshop');

    await wPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'workshop', 'Kanban: order in "Completed" column — ready for vehicle return.', ROLE_COLORS.workshop, ACTION_MS);
    await shotMulti(windows, 'service-completed', SCREENSHOT_DIR);
    await wPage.waitForTimeout(PAUSE_MS);

    // Workshop order details
    await wPage.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    await wPage.waitForLoadState('networkidle');
    await wPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'workshop', 'Extension "Approved" with payment confirmed. Full audit trail.', ROLE_COLORS.workshop, ACTION_MS);
    await shotActive(windows, 'workshop', 'extension-approved', SCREENSHOT_DIR);
    await wPage.waitForTimeout(PAUSE_MS);

    // ========================================================================
    // PHASE 7 — Jockey: Vehicle Return (UI-Driven with Handover)
    // ========================================================================
    if (bookingId) {
      await apiRequest('POST', '/api/test/advance-booking', customerToken, {
        bookingId,
        targetStatus: 'RETURN_ASSIGNED',
      });
    }

    // Find return assignment
    const retAssignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const retAssignments = retAssignmentsRes.data?.assignments || [];
    const ret = retAssignments.find((a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED');
    if (ret) returnAssignmentId = ret.id || ret._id;
    console.log(`    Return assignment: ${returnAssignmentId}`);

    await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await setActiveRole(windows, 'jockey');

    await showPhaseBannerOnActive(windows, 'jockey',
      'Phase 7 — Jockey: Vehicle Return',
      'The Jockey receives the return assignment automatically.<br>Same handover process: checklist, photos, signature.',
      ROLE_COLORS.jockey,
    );
    await jPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'jockey');

    await jPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'jockey', 'New assignment: "Return" — customer address and delivery time window.', ROLE_COLORS.jockey, ACTION_MS);
    await shotMulti(windows, 'return-assigned', SCREENSHOT_DIR);
    await jPage.waitForTimeout(PAUSE_MS);

    if (returnAssignmentId) {
      // --- Start Route (UI button) ---
      await showStepOnActive(windows, 'jockey', 'Tapping "Start Route" — driving the serviced vehicle back to the customer.', ROLE_COLORS.jockey, ACTION_MS);
      await clickJockeyAction(jPage, returnAssignmentId);
      await refreshSelectiveDashboards(windows, LOCALE, ['customer', 'jockey'], bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1000);
      await showStepOnActive(windows, 'jockey', 'Status: EN ROUTE — customer is notified live about the return.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'return-en-route', SCREENSHOT_DIR, ['customer', 'jockey']);
      await jPage.waitForTimeout(PAUSE_MS);

      // --- Arrived (UI button) ---
      await showStepOnActive(windows, 'jockey', 'Tapping "Arrived" — at the customer\'s location for vehicle handover.', ROLE_COLORS.jockey, ACTION_MS);
      await clickJockeyAction(jPage, returnAssignmentId);
      await refreshSelectiveDashboards(windows, LOCALE, ['customer', 'jockey'], bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1000);
      await showStepOnActive(windows, 'jockey', 'Status: AT LOCATION — return handover checklist begins.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'return-at-location', SCREENSHOT_DIR, ['customer', 'jockey']);
      await jPage.waitForTimeout(PAUSE_MS);

      // --- Open Assignment Detail for Return Handover ---
      await showStepOnActive(windows, 'jockey', 'Opening return assignment — full handover with photos and signature.', ROLE_COLORS.jockey, ACTION_MS);
      await openAssignmentDetail(jPage, returnAssignmentId);
      await jPage.waitForTimeout(1500);

      const returnDetailView = jPage.locator('[data-testid="assignment-detail"]');
      if (await returnDetailView.isVisible({ timeout: 5000 }).catch(() => false)) {
        await showStepOnActive(windows, 'jockey', 'Return handover: same quality-assured process as pickup.', ROLE_COLORS.jockey, ACTION_MS);
        await shotActive(windows, 'jockey', 'return-detail-view', SCREENSHOT_DIR);
        await jPage.waitForTimeout(PAUSE_MS);

        // --- Handover Checklist ---
        await showStepOnActive(windows, 'jockey', 'Checklist: vehicle condition, keys, documents — all verified.', ROLE_COLORS.jockey, ACTION_MS);
        await fillHandoverChecklist(jPage);
        await jPage.waitForTimeout(ACTION_MS);
        await shotActive(windows, 'jockey', 'return-checklist-filled', SCREENSHOT_DIR);
        await jPage.waitForTimeout(PAUSE_MS);

        // --- Photo Documentation ---
        const returnPhotoGrid = jPage.locator('[data-testid="photo-doc-grid"]');
        if (await returnPhotoGrid.isVisible({ timeout: 3000 }).catch(() => false)) {
          await showStepOnActive(windows, 'jockey', 'Photo documentation: condition at return — 4 photo slots.', ROLE_COLORS.jockey, ACTION_MS);
          await scrollTo(jPage, returnPhotoGrid);
          await shotActive(windows, 'jockey', 'return-photo-grid', SCREENSHOT_DIR);
          await jPage.waitForTimeout(PAUSE_MS);
        }

        // --- Signature Pad ---
        const returnSigPad = jPage.locator('[data-testid="signature-pad"]');
        if (await returnSigPad.isVisible({ timeout: 3000 }).catch(() => false)) {
          await showStepOnActive(windows, 'jockey', 'Customer signature: digital confirmation of vehicle return.', ROLE_COLORS.jockey, ACTION_MS);
          await scrollTo(jPage, returnSigPad);
          await drawSignature(jPage);
          await shotActive(windows, 'jockey', 'return-signature-drawn', SCREENSHOT_DIR);
          await jPage.waitForTimeout(PAUSE_MS);
        }

        // --- Mileage ---
        await showStepOnActive(windows, 'jockey', 'Recording return mileage — difference to pickup documents distance driven.', ROLE_COLORS.jockey, ACTION_MS);
        await fillMileage(jPage, '12345');
        await jPage.waitForTimeout(ACTION_MS);

        // --- Complete Return Handover ---
        await showStepOnActive(windows, 'jockey', 'Completing return — vehicle handed back with full documentation.', ROLE_COLORS.jockey, ACTION_MS);
        await clickCompleteHandover(jPage);
      } else {
        // Fallback: complete via action button
        await showStepOnActive(windows, 'jockey', 'Completing return via action button.', ROLE_COLORS.jockey, ACTION_MS);
        await clickJockeyAction(jPage, returnAssignmentId);
      }

      // Refresh all after return completion
      await refreshAllDashboards(windows, LOCALE, bookingId, tokens);
      await injectDeviceFrames(windows);
      await injectRoleLabels(windows);
      await setActiveRole(windows, 'jockey');
      await jPage.waitForTimeout(1500);
      await showStepOnActive(windows, 'jockey', 'Return complete! Full service cycle done — vehicle back with the customer.', ROLE_COLORS.jockey, ACTION_MS);
      await shotMulti(windows, 'return-complete', SCREENSHOT_DIR);
      await jPage.waitForTimeout(PAUSE_MS);
    }

    // ========================================================================
    // PHASE 8 — Final: All Portals
    // ========================================================================
    await clearAllDimming(windows);

    // Navigate customer to dashboard
    await cPage.goto(`/${LOCALE}`);
    await cPage.evaluate((t) => localStorage.setItem('auth_token_customer', t), customerToken);
    await cPage.goto(`/${LOCALE}/customer/dashboard`);
    await cPage.waitForLoadState('networkidle');

    await injectDeviceFrames(windows);
    await injectRoleLabels(windows);

    await showPhaseBannerOnActive(windows, 'customer',
      'Phase 8 — Complete: All Portals',
      'The full circle: Booking, Pickup, Service, Extension, Approval, Return.<br>All digital, all transparent, all on one platform. This is Ronya.',
      ROLE_COLORS.customer,
    );
    await cPage.waitForTimeout(PAUSE_MS);
    await hidePhaseBannerOnActive(windows, 'customer');

    await cPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'customer', 'All 3 portals: "Completed" — every step green. End-to-end delivered.', ROLE_COLORS.customer, ACTION_MS);
    await shotMulti(windows, 'final-overview', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // Booking details final
    await cPage.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await cPage.waitForLoadState('networkidle');
    await cPage.waitForTimeout(2000);
    await showStepOnActive(windows, 'customer', 'Final: complete timeline, extension approved, total cost breakdown. Full transparency.', ROLE_COLORS.customer, ACTION_MS);
    await shotActive(windows, 'customer', 'booking-details-final', SCREENSHOT_DIR);
    await cPage.waitForTimeout(PAUSE_MS);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log(`\n=== DEMO MULTI EN COMPLETE ===`);
    console.log(`Pace: ${PACE}`);
    console.log(`Windows: 3 (Customer + Jockey + Workshop)`);
    console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
    console.log(`Booking: ${bookingNumber} (${bookingId})`);
    console.log(`Extension: ${extensionId}`);

  } finally {
    if (windows) {
      await closeDemoWindows(windows);
    }
  }
});
