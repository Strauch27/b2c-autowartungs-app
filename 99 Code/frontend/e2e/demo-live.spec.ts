/**
 * DEMO LIVE — Automated Product Demo with Phase Banners
 *
 * A single large test that plays through the complete booking lifecycle
 * (all 8 phases, all 3 roles) in a visible browser with on-screen
 * phase banners, configurable tempo, and viewport switching.
 *
 * The browser opens, clicks through slowly — looks like magic.
 *
 * Run:
 *   cd "99 Code/frontend" && npm run test:demo
 *   DEMO_PACE=slow npm run test:demo   # 6s pauses for real presentations
 *   DEMO_PACE=fast npm run test:demo   # 1s pauses for testing
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'demo');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'de';

// Configurable tempo via ENV
const PACE = (process.env.DEMO_PACE || 'normal') as 'fast' | 'normal' | 'slow';
const PAUSE_MS = { fast: 1000, normal: 3000, slow: 6000 }[PACE];
const ACTION_MS = { fast: 300, normal: 600, slow: 1200 }[PACE];

const VEHICLE = { brandId: 'bmw', brandLabel: 'BMW', model: '3er', year: '2020', mileage: '50000' };
const ADDRESS = { street: 'Musterstraße 123', zip: '58453', city: 'Witten' };

// Viewport presets per role
const VIEWPORT_MOBILE = { width: 390, height: 844 };
const VIEWPORT_DESKTOP = { width: 1280, height: 720 };

const timestamp = Date.now();
const CUSTOMER = {
  email: `demo+${String(timestamp).slice(-4)}@ronya.de`,
  password: 'DemoLive123!',
  firstName: 'Max',
  lastName: 'Mustermann',
  phone: '015112345678',
};

// Banner colors per role
const COLOR_CUSTOMER = '#3b82f6';
const COLOR_JOCKEY = '#a855f7';
const COLOR_WORKSHOP = '#10b981';

// Shared state
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

async function scrollTo(page: Page, locator: ReturnType<Page['locator']>) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
}

async function hideBannerAndOverlays(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.bg-yellow-400, [class*="bg-yellow-"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
    document.querySelectorAll('[data-testid="top-bar"]').forEach(el => {
      (el as HTMLElement).style.position = 'relative';
    });
    // Hide the demo phase banner for clean screenshots
    const banner = document.getElementById('demo-phase-banner');
    if (banner) banner.style.opacity = '0';
  }).catch(() => {});
}

async function shot(page: Page, name: string) {
  screenshotCount++;
  const prefix = String(screenshotCount).padStart(3, '0');
  const filename = `${prefix}-${name}.png`;
  await hideBannerAndOverlays(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
  console.log(`    [screenshot] ${filename}`);
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
  await page.waitForTimeout(ACTION_MS);
  const weiter2 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter2);
  await weiter2.click();
  await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });
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
// Phase Banner — floating overlay for demo narration
// ---------------------------------------------------------------------------

async function showPhaseBanner(page: Page, phase: string, narration: string, color: string) {
  await page.evaluate(({ phase, narration, color }) => {
    let banner = document.getElementById('demo-phase-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-phase-banner';
      banner.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%);
        z-index:99999; padding:16px 32px; border-radius:12px; color:white;
        font-family:system-ui; text-align:center; opacity:0; transition:opacity 0.5s;
        box-shadow:0 8px 32px rgba(0,0,0,0.3); max-width:80%;`;
      document.body.appendChild(banner);
    }
    banner.style.backgroundColor = color;
    banner.innerHTML = `<div style="font-size:14px;opacity:0.8">DEMO</div>
      <div style="font-size:20px;font-weight:700;margin:4px 0">${phase}</div>
      <div style="font-size:14px;opacity:0.9">${narration}</div>`;
    banner.style.opacity = '1';
  }, { phase, narration, color });
}

async function hidePhaseBanner(page: Page) {
  await page.evaluate(() => {
    const banner = document.getElementById('demo-phase-banner');
    if (banner) banner.style.opacity = '0';
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Viewport switching with brief pause for visual effect
// ---------------------------------------------------------------------------

async function switchViewport(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(300);
}

// ============================================================================
// THE SINGLE DEMO TEST
// ============================================================================

test('Demo Live — Complete Booking Lifecycle', async ({ page }) => {
  test.setTimeout(600_000); // 10 minutes

  console.log(`\n=== DEMO LIVE START (pace: ${PACE}) ===\n`);

  // ========================================================================
  // PHASE 1 — Kunde: Buchung erstellen
  // ========================================================================
  await switchViewport(page, VIEWPORT_DESKTOP);
  await page.goto(`/${LOCALE}`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 1 — Kunde: Buchung erstellen',
    'Der Kunde bucht in unter 3 Minuten — Festpreis-Garantie, keine Anrufe.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // Landing Page
  await shot(page, 'landing-page');
  await page.waitForTimeout(ACTION_MS);

  // Click CTA
  const ctaBtn = page.locator('a:has-text("Jetzt Termin buchen"), button:has-text("Jetzt Termin buchen"), [data-testid="hero-booking-cta"]').first();
  if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ctaBtn.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
  }

  // Switch to mobile for customer booking
  await switchViewport(page, VIEWPORT_MOBILE);
  await page.waitForTimeout(ACTION_MS);

  // Vehicle step
  await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
  await shot(page, 'vehicle-brand-grid');
  await page.waitForTimeout(ACTION_MS);

  await fillVehicleForm(page);
  await shot(page, 'vehicle-form-complete');
  await page.waitForTimeout(ACTION_MS);

  // Service step
  const weiter1 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter1);
  await weiter1.click();
  const serviceCard = page.locator('[data-testid="service-card-inspection"]');
  await expect(serviceCard).toBeVisible({ timeout: 10000 });
  await shot(page, 'service-selection');
  await page.waitForTimeout(ACTION_MS);

  await scrollTo(page, serviceCard);
  await serviceCard.click();
  await page.waitForTimeout(ACTION_MS);
  await shot(page, 'service-selected');

  // Appointment step
  const weiter2 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter2);
  await weiter2.click();
  await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });

  await pickDate(page);
  await pickTimeSlots(page);
  await fillAddress(page);
  await shot(page, 'appointment-filled');
  await page.waitForTimeout(ACTION_MS);

  // Confirmation step
  const weiter3 = page.locator('button:has-text("Weiter")');
  await scrollTo(page, weiter3);
  await weiter3.click();
  await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });

  const firstNameInput = page.locator('#firstName');
  await scrollTo(page, firstNameInput);
  await firstNameInput.fill(CUSTOMER.firstName);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#lastName').fill(CUSTOMER.lastName);
  await page.waitForTimeout(ACTION_MS);
  const emailInput = page.locator('#email');
  await scrollTo(page, emailInput);
  await emailInput.fill(CUSTOMER.email);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#phone').fill(CUSTOMER.phone);
  await page.waitForTimeout(ACTION_MS);
  const termsCheckbox = page.locator('#terms');
  await scrollTo(page, termsCheckbox);
  await termsCheckbox.click();
  await shot(page, 'booking-confirm-filled');
  await page.waitForTimeout(ACTION_MS);

  // Submit
  const submitBtn = page.locator('button:has-text("Jetzt kostenpflichtig buchen")');
  await scrollTo(page, submitBtn);
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  await submitBtn.click();

  // Registration
  await page.waitForURL(/\/de\/booking\/register/, { timeout: 30000 });
  await page.waitForTimeout(1000);
  await shot(page, 'register-page');

  const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
  if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
    bookingNumber = (await bookingNumberEl.textContent()) || '';
  }

  await page.locator('#password').fill(CUSTOMER.password);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#confirmPassword').fill(CUSTOMER.password);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('button:has-text("Konto erstellen")').click();

  // Success page
  await page.waitForURL(/\/de\/booking\/success/, { timeout: 30000 });
  await page.waitForTimeout(1000);
  await shot(page, 'confirmation-page');
  await page.waitForTimeout(ACTION_MS);

  // Dashboard
  customerToken = await customerLogin(page, CUSTOMER.email, CUSTOMER.password);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, 'dashboard-after-booking');

  // Get booking ID
  const bookingsRes = await apiRequest('GET', '/api/bookings', customerToken);
  if (bookingsRes.success && bookingsRes.data?.length) {
    const ourBooking = bookingsRes.data.find((b: any) => b.bookingNumber === bookingNumber) || bookingsRes.data[0];
    bookingId = ourBooking.id || ourBooking._id;
    if (!bookingNumber) bookingNumber = ourBooking.bookingNumber;
  }
  console.log(`    Booking: ${bookingNumber} (${bookingId})`);

  // ========================================================================
  // PHASE 2 — Jockey: Fahrzeug abholen
  // ========================================================================
  jockeyToken = await getTestToken('JOCKEY');
  workshopToken = await getTestToken('WORKSHOP');

  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'PICKUP_ASSIGNED',
    });
  }

  await switchViewport(page, VIEWPORT_MOBILE);
  await injectToken(page, jockeyToken);
  await page.goto(`/${LOCALE}/jockey/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 2 — Jockey: Fahrzeug abholen',
    'Der Jockey sieht den Abholauftrag und fährt zum Kunden.',
    COLOR_JOCKEY,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // Jockey login page screenshot
  await page.goto(`/${LOCALE}/jockey/login`);
  await page.waitForLoadState('networkidle');
  await shot(page, 'jockey-login-page');
  await page.waitForTimeout(ACTION_MS);

  // Jockey dashboard
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

  if (pickupAssignmentId) {
    // EN_ROUTE
    await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-pickup-en-route');
    await page.waitForTimeout(ACTION_MS);

    // AT_LOCATION
    await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-pickup-at-location');
    await page.waitForTimeout(ACTION_MS);

    // Complete
    await apiRequest('POST', `/api/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
      handoverData: { photos: [], notes: 'Fahrzeug in gutem Zustand abgeholt' },
    });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-pickup-complete');
  }

  // ========================================================================
  // PHASE 3 — Werkstatt: Fahrzeug eingegangen
  // ========================================================================
  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'AT_WORKSHOP',
    });
  }

  await switchViewport(page, VIEWPORT_DESKTOP);
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 3 — Werkstatt: Fahrzeug eingegangen',
    'Der Auftrag erscheint automatisch auf dem digitalen Kanban-Board.',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // Workshop login page screenshot
  await page.goto(`/${LOCALE}/workshop/login`);
  await page.waitForLoadState('networkidle');
  await shot(page, 'workshop-login-page');
  await page.waitForTimeout(ACTION_MS);

  // Workshop dashboard
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, 'workshop-dashboard-received');

  // Navigate to order details
  const card3 = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
  if (await card3.isVisible({ timeout: 5000 }).catch(() => false)) {
    const detailBtn3 = card3.locator('button:has-text("Details"), a:has-text("Details")').first();
    if (await detailBtn3.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailBtn3.click();
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
  } else {
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, 'workshop-order-details-received');

  // ========================================================================
  // PHASE 4 — Werkstatt: Erweiterung erstellen
  // ========================================================================
  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'IN_SERVICE',
    });
  }

  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 4 — Werkstatt: Erweiterung erstellen',
    'Zusatzarbeiten nur mit digitaler Freigabe. Kein Anruf, kein "Wir haben mal gemacht".',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await shot(page, 'workshop-dashboard-in-progress');

  // Navigate to order detail
  const card4 = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
  if (await card4.isVisible({ timeout: 5000 }).catch(() => false)) {
    const detailBtn4 = card4.locator('button:has-text("Details"), a:has-text("Details"), button:has-text("Erweiterung"), button:has-text("Abschliessen"), button:has-text("Abschließen")').first();
    if (await detailBtn4.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailBtn4.click();
    } else {
      await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
    }
  } else {
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, 'workshop-order-details-in-progress');
  await page.waitForTimeout(ACTION_MS);

  // Open extension form
  await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const newExtBtn = page.locator('button').filter({ hasText: /Neue Erweiterung|New Extension|Erweiterung/i });
  if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await newExtBtn.click();
    await page.waitForTimeout(800);
  }
  await shot(page, 'workshop-extension-form-empty');
  await page.waitForTimeout(ACTION_MS);

  // Fill extension form
  const form = page.locator('[data-testid="inline-extension-form"]');
  await expect(form).toBeVisible({ timeout: 5000 });

  await form.locator('textarea').first().fill('Bremsscheiben vorne abgenutzt');
  await page.waitForTimeout(ACTION_MS);

  const rows = form.locator('tbody tr');
  const row1 = rows.nth(0);
  await row1.locator('td').nth(0).locator('input').fill('Bremsscheiben vorne');
  await page.waitForTimeout(ACTION_MS);
  await row1.locator('td').nth(2).locator('input').fill('185.50');
  await page.waitForTimeout(ACTION_MS);
  await shot(page, 'workshop-extension-item1-filled');

  // Add second item
  const addItemBtn = form.locator('button').filter({ hasText: /Position|hinzufügen|Add/i });
  if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addItemBtn.click();
    await page.waitForTimeout(ACTION_MS);
    const row2 = rows.nth(1);
    if (await row2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await row2.locator('td').nth(0).locator('input').fill('Bremsbeläge vorne');
      await page.waitForTimeout(ACTION_MS);
      await row2.locator('td').nth(2).locator('input').fill('95.00');
      await page.waitForTimeout(ACTION_MS);
    }
    await shot(page, 'workshop-extension-two-items');
  }

  // Submit extension
  const sendBtn = form.locator('button').filter({ hasText: /senden|send|submit/i });
  if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sendBtn.click();
  }
  await page.waitForTimeout(1500);
  await shot(page, 'workshop-extension-submitted');

  // Verify/create extension via API
  const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
  const extensions = extRes.data || [];
  if (extensions.length > 0) {
    extensionId = extensions[0].id;
    console.log(`    Extension found: ${extensionId} status=${extensions[0].status}`);
  } else {
    console.log('    No extension from UI, creating via API fallback...');
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

  // ========================================================================
  // PHASE 5 — Kunde: Erweiterung genehmigen & bezahlen
  // ========================================================================
  await switchViewport(page, VIEWPORT_MOBILE);
  await injectToken(page, customerToken);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 5 — Kunde: Erweiterung prüfen & genehmigen',
    'Der Kunde behält die volle Kontrolle. Er entscheidet transparent über Zusatzkosten.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await shot(page, 'customer-dashboard-pending-extension');
  await page.waitForTimeout(ACTION_MS);

  // Booking details
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, 'customer-booking-details-with-extension');
  await page.waitForTimeout(ACTION_MS);

  // Extensions tab
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const extensionsTab = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
  if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, extensionsTab);
    await extensionsTab.click();
    await page.waitForTimeout(3000);
  }
  await shot(page, 'customer-extensions-tab-pending');
  await page.waitForTimeout(ACTION_MS);

  // Review extension details
  const extensionActionBtn = page.locator('button').filter({
    has: page.locator('svg.lucide-triangle-alert'),
  }).first();
  if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, extensionActionBtn);
    await extensionActionBtn.click();
    await page.waitForTimeout(1000);
  }
  await shot(page, 'customer-extension-review-details');
  await page.waitForTimeout(ACTION_MS);

  // Approve and pay
  const approveBtn = page.locator('[role="dialog"] button').filter({
    hasText: /Genehmigen|Approve|bezahlen|Pay/i,
  }).first();
  if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, approveBtn);
    await approveBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'customer-extension-payment-form');
  await page.waitForTimeout(ACTION_MS);

  // Demo payment
  const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
  if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, demoPayBtn);
    await demoPayBtn.click();
    await page.waitForTimeout(4000);
    await shot(page, 'customer-extension-payment-success');
  } else {
    console.log('    Demo pay button not found, using API fallback');
    await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
    await shot(page, 'customer-extension-state-after-api');
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
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const extensionsTab2 = page.locator('button').filter({ hasText: /Erweiterungen|Extensions/i });
  if (await extensionsTab2.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, extensionsTab2);
    await extensionsTab2.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'customer-extension-confirmed');

  // ========================================================================
  // PHASE 6 — Werkstatt: Als abgeschlossen markieren
  // ========================================================================
  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'READY_FOR_RETURN',
    });
  }

  await switchViewport(page, VIEWPORT_DESKTOP);
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 6 — Werkstatt: Service abgeschlossen',
    'Die Werkstatt meldet digital fertig — der Rückgabe-Prozess startet automatisch.',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await shot(page, 'workshop-dashboard-completed');

  // Workshop sees approved extension
  await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, 'workshop-extension-approved');
  await page.waitForTimeout(ACTION_MS);

  // Navigate to order detail from kanban
  const card6 = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  if (await card6.isVisible({ timeout: 5000 }).catch(() => false)) {
    const detailBtn6 = card6.locator('button:has-text("Details"), a:has-text("Details")');
    if (await detailBtn6.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailBtn6.click();
    }
  } else {
    await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, 'workshop-order-details-completed');

  // ========================================================================
  // PHASE 7 — Jockey: Rückgabe
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

  await switchViewport(page, VIEWPORT_MOBILE);
  await injectToken(page, jockeyToken);
  await page.goto(`/${LOCALE}/jockey/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 7 — Jockey: Fahrzeug zurückbringen',
    'Gleicher Prozess wie bei der Abholung — standardisiert und dokumentiert.',
    COLOR_JOCKEY,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await shot(page, 'jockey-return-assignment');
  await page.waitForTimeout(ACTION_MS);

  if (returnAssignmentId) {
    // EN_ROUTE
    await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-en-route');
    await page.waitForTimeout(ACTION_MS);

    // AT_LOCATION
    await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-at-location');
    await page.waitForTimeout(ACTION_MS);

    // Complete
    await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
      handoverData: { photos: [], notes: 'Fahrzeug erfolgreich an Kunden zurückgegeben' },
    });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'jockey-return-complete');
  }

  // ========================================================================
  // PHASE 8 — Kunde: Abschluss
  // ========================================================================
  await switchViewport(page, VIEWPORT_MOBILE);
  await injectToken(page, customerToken);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 8 — Kunde: Alles erledigt',
    'Komplette Transparenz — Buchung, Abholung, Service, Erweiterung, Rückgabe. Das ist Ronya.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await shot(page, 'customer-dashboard-final');
  await page.waitForTimeout(ACTION_MS);

  // Booking details final
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, 'customer-booking-details-final');

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log(`\n=== DEMO LIVE COMPLETE ===`);
  console.log(`Pace: ${PACE}`);
  console.log(`Screenshots taken: ${screenshotCount}`);
  console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
  console.log(`Booking: ${bookingNumber} (${bookingId})`);
  console.log(`Extension: ${extensionId}`);
  console.log(`Video: check test-results/ for recording`);
});
