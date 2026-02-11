/**
 * DEMO LIVE (EN) — Automated Product Demo with Persistent Step Narration
 *
 * English version of the automated product demo. Plays through the complete
 * booking lifecycle (all 8 phases, all 3 roles) in a visible browser with
 * on-screen phase banners AND persistent step-by-step narration at the top.
 *
 * Step narration stays visible until the next step replaces it — the audience
 * always sees what's happening and why it matters.
 *
 * Viewport switches are minimized to role changes only:
 *   Desktop: Landing page
 *   Mobile:  Customer booking (Phase 1) + Jockey pickup (Phase 2)
 *   Desktop: Workshop received + extension (Phases 3 + 4)
 *   Mobile:  Customer extension approval (Phase 5)
 *   Desktop: Workshop completed (Phase 6)
 *   Mobile:  Jockey return (Phase 7) + Customer final (Phase 8)
 *
 * Run:
 *   cd "99 Code/frontend" && npm run test:demo:en
 *   DEMO_PACE=slow npm run test:demo:en   # 6s pauses for real presentations
 *   DEMO_PACE=fast npm run test:demo:en   # 1s pauses for quick testing
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'demo-en');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'en';

// Configurable tempo via ENV
const PACE = (process.env.DEMO_PACE || 'normal') as 'fast' | 'normal' | 'slow';
const PAUSE_MS = { fast: 1000, normal: 3000, slow: 6000 }[PACE];
const ACTION_MS = { fast: 300, normal: 600, slow: 1200 }[PACE];

const VEHICLE = { brandId: 'bmw', brandLabel: 'BMW', model: '3 Series', year: '2020', mileage: '50000' };
const ADDRESS = { street: '123 Main Street', zip: '58453', city: 'Witten' };

// Viewport presets per role
const VIEWPORT_MOBILE = { width: 390, height: 844 };
const VIEWPORT_DESKTOP = { width: 1280, height: 720 };

const timestamp = Date.now();
const CUSTOMER = {
  email: `demo+${String(timestamp).slice(-4)}@ronya.de`,
  password: 'DemoLive123!',
  firstName: 'John',
  lastName: 'Doe',
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
let currentDevice: 'phone' | 'tablet' | null = null;

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
    const phaseBanner = document.getElementById('demo-phase-banner');
    if (phaseBanner) phaseBanner.style.opacity = '0';
    const stepBanner = document.getElementById('demo-step-banner');
    if (stepBanner) stepBanner.style.opacity = '0';
  }).catch(() => {});
}

async function shot(page: Page, name: string) {
  screenshotCount++;
  const prefix = String(screenshotCount).padStart(3, '0');
  const filename = `${prefix}-${name}.png`;
  await hideBannerAndOverlays(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: !currentDevice });
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
  // Set token for all role-specific keys so ProtectedRoute finds it
  await page.evaluate((t) => {
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_token_customer', t);
    localStorage.setItem('auth_token_jockey', t);
    localStorage.setItem('auth_token_workshop', t);
  }, token);
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
  await page.evaluate((t) => {
    localStorage.setItem('auth_token', t);
    localStorage.setItem('auth_token_customer', t);
  }, data.token);
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
// Phase Banner — large overlay for phase transitions (top center)
// Shows at the start of each phase, then fades out before actions begin.
// ---------------------------------------------------------------------------

async function showPhaseBanner(page: Page, phase: string, narration: string, color: string) {
  const topPx = currentDevice === 'phone' ? 14 : 20;
  await page.evaluate(({ phase, narration, color, topPx }) => {
    // Hide step banner while phase banner is showing
    const stepBanner = document.getElementById('demo-step-banner');
    if (stepBanner) stepBanner.style.opacity = '0';

    let banner = document.getElementById('demo-phase-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-phase-banner';
      document.body.appendChild(banner);
    }
    banner.style.cssText = `position:fixed; top:${topPx}px; left:50%; transform:translateX(-50%);
      z-index:99999; padding:16px 32px; border-radius:12px; color:white;
      font-family:system-ui; text-align:center; opacity:0; transition:opacity 0.5s;
      box-shadow:0 8px 32px rgba(0,0,0,0.3); max-width:80%; pointer-events:none;
      background-color:${color};`;
    banner.innerHTML = `<div style="font-size:14px;opacity:0.8;letter-spacing:2px">DEMO</div>
      <div style="font-size:20px;font-weight:700;margin:4px 0">${phase}</div>
      <div style="font-size:14px;opacity:0.9;line-height:1.4">${narration}</div>`;
    banner.style.opacity = '1';
  }, { phase, narration, color, topPx });
}

async function hidePhaseBanner(page: Page) {
  await page.evaluate(() => {
    const banner = document.getElementById('demo-phase-banner');
    if (banner) banner.style.opacity = '0';
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Step Banner — persistent narration at top of screen
// Stays visible until the next showStep() replaces it or screenshots hide it.
// No auto-hide — the audience always has context about what's happening.
// ---------------------------------------------------------------------------

async function showStep(page: Page, text: string, color: string) {
  const topPx = currentDevice === 'phone' ? 14 : 20;
  await page.evaluate(({ text, color, topPx }) => {
    let banner = document.getElementById('demo-step-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-step-banner';
      document.body.appendChild(banner);
    }
    banner.style.cssText = `position:fixed; top:${topPx}px; left:50%; transform:translateX(-50%);
      z-index:99998; padding:10px 24px; border-radius:8px; color:white;
      font-family:system-ui; text-align:center; opacity:0; transition:opacity 0.4s;
      box-shadow:0 4px 16px rgba(0,0,0,0.25); max-width:85%; font-size:14px;
      pointer-events:none; background-color:${color};`;
    banner.textContent = text;
    banner.style.opacity = '1';
  }, { text, color, topPx });
  // Brief pause so the audience can start reading
  await page.waitForTimeout(ACTION_MS);
}

// ---------------------------------------------------------------------------
// Device Frame — cosmetic phone/tablet bezel overlay
// Injected after viewport switch and re-injected on every page navigation.
// ---------------------------------------------------------------------------

async function showDeviceFrame(page: Page, device: 'phone' | 'tablet') {
  await page.evaluate((device) => {
    // Remove existing frame elements
    document.querySelectorAll('.device-frame-el').forEach(el => el.remove());

    if (device === 'phone') {
      const bezel = 4;
      const radius = 24;
      const color = '#1c1c1e';

      // Corner fills — solid squares behind the rounded border for seamless corners
      ['top:0;left:0', 'top:0;right:0', 'bottom:0;left:0', 'bottom:0;right:0'].forEach(pos => {
        const c = document.createElement('div');
        c.className = 'device-frame-el';
        c.style.cssText = `position:fixed;${pos};width:${radius}px;height:${radius}px;background:${color};pointer-events:none;z-index:99996;`;
        document.body.appendChild(c);
      });

      // Main bezel border — subtle frame, no hardware elements
      const frame = document.createElement('div');
      frame.className = 'device-frame-el';
      frame.id = 'device-frame-main';
      frame.style.cssText = `position:fixed;inset:0;border:${bezel}px solid ${color};
        border-radius:${radius}px;pointer-events:none;z-index:99997;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(0,0,0,0.2);`;
      document.body.appendChild(frame);

    } else {
      const bezel = 4;
      const radius = 14;
      const color = '#2c2c2e';

      // Corner fills
      ['top:0;left:0', 'top:0;right:0', 'bottom:0;left:0', 'bottom:0;right:0'].forEach(pos => {
        const c = document.createElement('div');
        c.className = 'device-frame-el';
        c.style.cssText = `position:fixed;${pos};width:${radius}px;height:${radius}px;background:${color};pointer-events:none;z-index:99996;`;
        document.body.appendChild(c);
      });

      // Main bezel border — subtle frame
      const frame = document.createElement('div');
      frame.className = 'device-frame-el';
      frame.id = 'device-frame-main';
      frame.style.cssText = `position:fixed;inset:0;border:${bezel}px solid ${color};
        border-radius:${radius}px;pointer-events:none;z-index:99997;
        box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.15);`;
      document.body.appendChild(frame);
    }
  }, device);
}

// ---------------------------------------------------------------------------
// Viewport switching — only called at role boundaries
// ---------------------------------------------------------------------------

async function switchViewport(page: Page, viewport: { width: number; height: number }, device: 'phone' | 'tablet') {
  currentDevice = device;
  await page.setViewportSize(viewport);
  await page.waitForTimeout(300);
  await showDeviceFrame(page, device);
}

// ============================================================================
// THE SINGLE DEMO TEST
// ============================================================================

test('Demo Live EN — Complete Booking Lifecycle', async ({ page }) => {
  test.setTimeout(600_000); // 10 minutes

  console.log(`\n=== DEMO LIVE EN START (pace: ${PACE}) ===\n`);

  // Re-inject device frame after every page navigation
  page.on('load', () => {
    if (currentDevice) {
      showDeviceFrame(page, currentDevice).catch(() => {});
    }
  });

  // ========================================================================
  // PHASE 1 — Customer: Book a Service
  // Viewport: Desktop for landing page, then Mobile for booking wizard
  // ========================================================================
  await switchViewport(page, VIEWPORT_DESKTOP, 'tablet');                       // SWITCH 1: Desktop
  await page.goto(`/${LOCALE}`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 1 — Customer: Book a Service',
    'A customer books a workshop appointment with pickup & delivery in under 3 minutes.<br>Fixed price guarantee, no phone calls, no waiting.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // --- Landing Page (Desktop) ---
  await showStep(page, 'Landing page: the value proposition — fixed pricing, vetted workshops, and instant confirmation.', COLOR_CUSTOMER);
  await shot(page, 'landing-page-desktop');
  await page.waitForTimeout(PAUSE_MS);

  // Switch to mobile — the customer uses the app on their phone
  await switchViewport(page, VIEWPORT_MOBILE, 'phone');               // SWITCH 2: Mobile
  await page.goto(`/${LOCALE}`);
  await page.waitForLoadState('networkidle');

  await showStep(page, 'Mobile view: the same landing page, optimized for smartphones. Customers book on the go.', COLOR_CUSTOMER);
  await shot(page, 'landing-page-mobile');
  await page.waitForTimeout(ACTION_MS);

  // --- Click CTA ---
  await showStep(page, 'The customer taps "Book Now" to start the 4-step booking wizard.', COLOR_CUSTOMER);
  const ctaBtn = page.locator('[data-testid="hero-booking-cta"]').first();
  if (await ctaBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ctaBtn.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto(`/${LOCALE}/booking`);
    await page.waitForLoadState('networkidle');
  }
  await page.waitForTimeout(ACTION_MS);

  // --- Vehicle Selection ---
  await expect(page.locator('[data-testid="vehicle-step"]')).toBeVisible({ timeout: 10000 });
  await showStep(page, 'Step 1 of 4: Vehicle — the customer selects their car from a visual brand grid.', COLOR_CUSTOMER);
  await shot(page, 'vehicle-brand-grid');
  await page.waitForTimeout(ACTION_MS);

  await showStep(page, 'Selecting BMW > 3 Series > 2020 > 50,000 km — just 4 fields for a precise fixed price.', COLOR_CUSTOMER);
  await fillVehicleForm(page);
  await shot(page, 'vehicle-form-complete');
  await page.waitForTimeout(ACTION_MS);

  // --- Service Selection ---
  const nextBtn1 = page.locator('button:has-text("Next")');
  await scrollTo(page, nextBtn1);
  await nextBtn1.click();
  const serviceCard = page.locator('[data-testid="service-card-inspection"]');
  await expect(serviceCard).toBeVisible({ timeout: 10000 });

  await showStep(page, 'Step 2 of 4: Service — prices are calculated in real-time for this exact vehicle. No estimates, no surprises.', COLOR_CUSTOMER);
  await shot(page, 'service-selection');
  await page.waitForTimeout(ACTION_MS);

  await scrollTo(page, serviceCard);
  await serviceCard.click();
  await page.waitForTimeout(ACTION_MS);

  await showStep(page, '"Inspection" selected — the fixed price is shown. Any extra work requires explicit customer approval later.', COLOR_CUSTOMER);
  await shot(page, 'service-selected');
  await page.waitForTimeout(ACTION_MS);

  // --- Appointment & Address ---
  const nextBtn2 = page.locator('button:has-text("Next")');
  await scrollTo(page, nextBtn2);
  await nextBtn2.click();
  await expect(page.locator('#street')).toBeVisible({ timeout: 10000 });

  await showStep(page, 'Step 3 of 4: Appointment — the customer picks a date, time slot, and pickup address. We come to them.', COLOR_CUSTOMER);
  await pickDate(page);
  await pickTimeSlots(page);
  await fillAddress(page);
  await shot(page, 'appointment-filled');
  await page.waitForTimeout(ACTION_MS);

  // --- Confirmation & Contact Details ---
  const nextBtn3 = page.locator('button:has-text("Next")');
  await scrollTo(page, nextBtn3);
  await nextBtn3.click();
  await expect(page.locator('#firstName')).toBeVisible({ timeout: 10000 });

  await showStep(page, 'Step 4 of 4: Confirmation — contact details, booking summary, and terms. One tap to book.', COLOR_CUSTOMER);
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

  // --- Submit Booking ---
  await showStep(page, 'Submitting the booking — the customer commits to the fixed-price service with concierge pickup.', COLOR_CUSTOMER);
  const submitBtn = page.locator('button:has-text("Book Now")');
  await scrollTo(page, submitBtn);
  await expect(submitBtn).toBeEnabled({ timeout: 5000 });
  await submitBtn.click();

  // --- Registration ---
  await page.waitForURL(/\/en\/booking\/register/, { timeout: 30000 });
  await page.waitForTimeout(1000);
  await showStep(page, 'Account registration — the customer creates a password to track their booking in real-time.', COLOR_CUSTOMER);
  await shot(page, 'register-page');

  const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
  if (await bookingNumberEl.isVisible({ timeout: 10000 }).catch(() => false)) {
    bookingNumber = (await bookingNumberEl.textContent()) || '';
  }

  await page.locator('#password').fill(CUSTOMER.password);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('#confirmPassword').fill(CUSTOMER.password);
  await page.waitForTimeout(ACTION_MS);
  await page.locator('button:has-text("Create Account")').click();

  // --- Success Page ---
  await page.waitForURL(/\/en\/booking\/success/, { timeout: 30000 });
  await page.waitForTimeout(1000);
  await showStep(page, 'Booking confirmed! The customer gets a booking number and sees what happens next.', COLOR_CUSTOMER);
  await shot(page, 'confirmation-page');
  await page.waitForTimeout(ACTION_MS);

  // --- Customer Dashboard ---
  customerToken = await customerLogin(page, CUSTOMER.email, CUSTOMER.password);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Customer dashboard: the active booking with a live status bar — like package tracking for car service.', COLOR_CUSTOMER);
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
  // PHASE 2 — Jockey: Vehicle Pickup
  // Viewport: stays Mobile (Jockey uses phone too — no switch needed)
  // ========================================================================
  jockeyToken = await getTestToken('JOCKEY');
  workshopToken = await getTestToken('WORKSHOP');

  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'PICKUP_ASSIGNED',
    });
  }

  await injectToken(page, jockeyToken);
  await page.goto(`/${LOCALE}/jockey/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 2 — Jockey: Vehicle Pickup',
    'Switching perspective: our driver (the "Jockey") sees the new pickup assignment<br>on his mobile dashboard and drives to the customer\'s location.',
    COLOR_JOCKEY,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // Jockey login page
  await page.goto(`/${LOCALE}/jockey/login`);
  await page.waitForLoadState('networkidle');
  await showStep(page, 'Jockey portal: drivers log in on their phone to see today\'s pickup and return assignments.', COLOR_JOCKEY);
  await shot(page, 'jockey-login-page');
  await page.waitForTimeout(ACTION_MS);

  // Jockey dashboard
  await injectToken(page, jockeyToken);
  await page.goto(`/${LOCALE}/jockey/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Jockey dashboard: today\'s assignments with customer name, vehicle, address, and pickup time.', COLOR_JOCKEY);
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
    await showStep(page, 'Status: EN ROUTE — the Jockey is driving to the customer. The customer sees this update in real-time.', COLOR_JOCKEY);
    await shot(page, 'jockey-pickup-en-route');
    await page.waitForTimeout(ACTION_MS);

    // AT_LOCATION
    await apiRequest('PATCH', `/api/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await showStep(page, 'Status: AT LOCATION — arrived at the customer. Vehicle inspection and handover checklist begin.', COLOR_JOCKEY);
    await shot(page, 'jockey-pickup-at-location');
    await page.waitForTimeout(ACTION_MS);

    // Complete
    await apiRequest('POST', `/api/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
      handoverData: { photos: [], notes: 'Vehicle picked up in good condition', mileage: 50000 },
    });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await showStep(page, 'Pickup complete! Vehicle condition documented with photos and notes. Car is on its way to the workshop.', COLOR_JOCKEY);
    await shot(page, 'jockey-pickup-complete');
  }

  // ========================================================================
  // PHASE 3 — Workshop: Vehicle Received
  // Viewport: switch to Desktop (workshop uses desktop workstation)
  // ========================================================================
  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'AT_WORKSHOP',
    });
  }

  await switchViewport(page, VIEWPORT_DESKTOP, 'tablet');              // SWITCH 3: Desktop
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 3 — Workshop: Vehicle Received',
    'The order appears automatically on the workshop\'s digital Kanban board.<br>No paperwork, no phone calls — complete order management at a glance.',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  // Workshop login page
  await page.goto(`/${LOCALE}/workshop/login`);
  await page.waitForLoadState('networkidle');
  await showStep(page, 'Workshop portal: a desktop application for the service team to manage all incoming orders digitally.', COLOR_WORKSHOP);
  await shot(page, 'workshop-login-page');
  await page.waitForTimeout(ACTION_MS);

  // Workshop dashboard
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Kanban board: orders flow through columns — Received, In Progress, Completed, Ready for Return.', COLOR_WORKSHOP);
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
  await showStep(page, 'Order details: vehicle info, customer contact, requested service, and the full status timeline.', COLOR_WORKSHOP);
  await shot(page, 'workshop-order-details-received');

  // ========================================================================
  // PHASE 4 — Workshop: Create Extension (Additional Work)
  // Viewport: stays Desktop (still in workshop)
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
    'Phase 4 — Workshop: Additional Work Needed',
    'During the inspection, the mechanic discovers worn brake discs.<br>Instead of calling the customer, they send a digital cost estimate — our key differentiator.',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await showStep(page, 'The order has moved to "In Progress" on the Kanban board — the mechanic has started work.', COLOR_WORKSHOP);
  await shot(page, 'workshop-dashboard-in-progress');

  // Navigate to order detail
  const card4 = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
  if (await card4.isVisible({ timeout: 5000 }).catch(() => false)) {
    const detailBtn4 = card4.locator('button:has-text("Details"), a:has-text("Details"), button:has-text("Extension"), button:has-text("Complete")').first();
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
  await showStep(page, 'The mechanic opens the order to document the additional work found during inspection.', COLOR_WORKSHOP);
  await shot(page, 'workshop-order-details-in-progress');
  await page.waitForTimeout(ACTION_MS);

  // Open extension form
  await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const newExtBtn = page.locator('button').filter({ hasText: /New Extension|Extension|Erweiterung|Neue Erweiterung/i });
  if (await newExtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await newExtBtn.click();
    await page.waitForTimeout(800);
  }
  await showStep(page, 'The "New Extension" form: the mechanic describes the issue and adds itemized pricing.', COLOR_WORKSHOP);
  await shot(page, 'workshop-extension-form-empty');
  await page.waitForTimeout(ACTION_MS);

  // Fill extension form
  const form = page.locator('[data-testid="inline-extension-form"]');
  await expect(form).toBeVisible({ timeout: 5000 });

  await showStep(page, 'Adding item 1: Front brake discs — EUR 185.50. Every price is transparent, no hidden costs.', COLOR_WORKSHOP);
  await form.locator('textarea').first().fill('Front brake discs worn - replacement recommended');
  await page.waitForTimeout(ACTION_MS);

  const rows = form.locator('tbody tr');
  const row1 = rows.nth(0);
  await row1.locator('td').nth(0).locator('input').fill('Front brake discs');
  await page.waitForTimeout(ACTION_MS);
  await row1.locator('td').nth(2).locator('input').fill('185.50');
  await page.waitForTimeout(ACTION_MS);
  await shot(page, 'workshop-extension-item1-filled');

  // Add second item
  const addItemBtn = form.locator('button').filter({ hasText: /Position|Add|hinzufügen/i });
  if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addItemBtn.click();
    await page.waitForTimeout(ACTION_MS);
    await showStep(page, 'Adding item 2: Front brake pads — EUR 95.00. Total: EUR 280.50 — sent to customer for approval.', COLOR_WORKSHOP);
    const row2 = rows.nth(1);
    if (await row2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await row2.locator('td').nth(0).locator('input').fill('Front brake pads');
      await page.waitForTimeout(ACTION_MS);
      await row2.locator('td').nth(2).locator('input').fill('95.00');
      await page.waitForTimeout(ACTION_MS);
    }
    await shot(page, 'workshop-extension-two-items');
  }

  // Submit extension
  await showStep(page, 'Sending the cost estimate to the customer. No additional work starts without their explicit digital approval.', COLOR_WORKSHOP);
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
  // Viewport: switch to Mobile (customer on phone)
  // ========================================================================
  await switchViewport(page, VIEWPORT_MOBILE, 'phone');                // SWITCH 4: Mobile
  await injectToken(page, customerToken);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 5 — Customer: Review & Approve Extension',
    'The customer gets a notification about the recommended additional work.<br>They see exactly what needs to be done and the cost — full transparency, full control.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await showStep(page, 'Dashboard alert: "1 extension awaiting your approval" — the customer stays informed in real-time.', COLOR_CUSTOMER);
  await shot(page, 'customer-dashboard-pending-extension');
  await page.waitForTimeout(ACTION_MS);

  // Booking details
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Booking details: the current service status and a prominent notification about the pending extension.', COLOR_CUSTOMER);
  await shot(page, 'customer-booking-details-with-extension');
  await page.waitForTimeout(ACTION_MS);

  // Extensions tab
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const extensionsTab = page.locator('button').filter({ hasText: /Extensions?|Erweiterungen/i });
  if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, extensionsTab);
    await extensionsTab.click();
    await page.waitForTimeout(3000);
  }
  await showStep(page, 'Extensions tab: all additional work items listed with individual prices and a clear total amount.', COLOR_CUSTOMER);
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
  await showStep(page, 'Review dialog: detailed breakdown — front brake discs EUR 185.50, brake pads EUR 95.00. Approve or decline.', COLOR_CUSTOMER);
  await shot(page, 'customer-extension-review-details');
  await page.waitForTimeout(ACTION_MS);

  // Approve and pay
  const approveBtn = page.locator('[role="dialog"] button').filter({
    hasText: /Approve|Pay|Genehmigen|bezahlen/i,
  }).first();
  if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await showStep(page, 'One tap to approve — the customer authorizes the additional work and payment digitally.', COLOR_CUSTOMER);
    await scrollTo(page, approveBtn);
    await approveBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, 'customer-extension-payment-form');
  await page.waitForTimeout(ACTION_MS);

  // Demo payment
  const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
  if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await showStep(page, 'Demo mode: simulated payment. In production this is a real Stripe card payment with 3D Secure.', COLOR_CUSTOMER);
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
  const extensionsTab2 = page.locator('button').filter({ hasText: /Extensions?|Erweiterungen/i });
  if (await extensionsTab2.isVisible({ timeout: 5000 }).catch(() => false)) {
    await scrollTo(page, extensionsTab2);
    await extensionsTab2.click();
    await page.waitForTimeout(1500);
  }
  await showStep(page, 'Extension approved and paid! Status updated to "Approved" — the workshop can now proceed.', COLOR_CUSTOMER);
  await shot(page, 'customer-extension-confirmed');

  // ========================================================================
  // PHASE 6 — Workshop: Service Completed
  // Viewport: switch to Desktop (workshop workstation)
  // ========================================================================
  if (bookingId) {
    await apiRequest('POST', '/api/test/advance-booking', customerToken, {
      bookingId,
      targetStatus: 'READY_FOR_RETURN',
    });
  }

  await switchViewport(page, VIEWPORT_DESKTOP, 'tablet');              // SWITCH 5: Desktop
  await injectToken(page, workshopToken);
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 6 — Workshop: Service Completed',
    'All work is done — original service plus the approved extension.<br>The workshop marks the order complete and the return process starts automatically.',
    COLOR_WORKSHOP,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await showStep(page, 'Kanban board: the order has moved to the "Completed" column — ready for vehicle return.', COLOR_WORKSHOP);
  await shot(page, 'workshop-dashboard-completed');

  // Workshop sees approved extension
  await page.goto(`/${LOCALE}/workshop/orders/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Order details: the extension shows "Approved" with payment confirmed. Full audit trail visible.', COLOR_WORKSHOP);
  await shot(page, 'workshop-extension-approved');
  await page.waitForTimeout(ACTION_MS);

  // Kanban view of completed order
  await page.goto(`/${LOCALE}/workshop/dashboard`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const card6 = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`);
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
  await showStep(page, 'Service complete, extension approved and paid. The Jockey is automatically assigned for vehicle return.', COLOR_WORKSHOP);
  await shot(page, 'workshop-order-details-completed');

  // ========================================================================
  // PHASE 7 — Jockey: Vehicle Return
  // Viewport: switch to Mobile (stays Mobile for Phase 8 too)
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

  await switchViewport(page, VIEWPORT_MOBILE, 'phone');                // SWITCH 6: Mobile (final)
  await injectToken(page, jockeyToken);
  await page.goto(`/${LOCALE}/jockey/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 7 — Jockey: Vehicle Return',
    'The Jockey automatically receives the return assignment.<br>Same standardized process as pickup — scalable and quality-assured.',
    COLOR_JOCKEY,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await showStep(page, 'New assignment: "Return" — the Jockey sees the customer\'s address and the delivery time window.', COLOR_JOCKEY);
  await shot(page, 'jockey-return-assignment');
  await page.waitForTimeout(ACTION_MS);

  if (returnAssignmentId) {
    // EN_ROUTE
    await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await showStep(page, 'Status: EN ROUTE — driving the serviced vehicle back. The customer is notified in real-time.', COLOR_JOCKEY);
    await shot(page, 'jockey-return-en-route');
    await page.waitForTimeout(ACTION_MS);

    // AT_LOCATION
    await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await showStep(page, 'Status: AT LOCATION — arrived at the customer\'s address. Vehicle handover checklist begins.', COLOR_JOCKEY);
    await shot(page, 'jockey-return-at-location');
    await page.waitForTimeout(ACTION_MS);

    // Complete
    await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
      handoverData: { photos: [], notes: 'Vehicle successfully returned to customer', mileage: 50045 },
    });
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await showStep(page, 'Return complete! Vehicle handed back with documented condition. The full service cycle is done.', COLOR_JOCKEY);
    await shot(page, 'jockey-return-complete');
  }

  // ========================================================================
  // PHASE 8 — Customer: Everything Done
  // Viewport: stays Mobile (no switch — already on mobile from Phase 7)
  // ========================================================================
  await injectToken(page, customerToken);
  await page.goto(`/${LOCALE}/customer/dashboard`);
  await page.waitForLoadState('networkidle');

  await showPhaseBanner(page,
    'Phase 8 — Customer: Everything Done',
    'The full circle is complete: Booking, Pickup, Service, Extension, Approval, Return.<br>All digital, all transparent, all on one platform. This is Ronya.',
    COLOR_CUSTOMER,
  );
  await page.waitForTimeout(PAUSE_MS);
  await hidePhaseBanner(page);

  await page.waitForTimeout(2000);
  await showStep(page, 'Dashboard: status "Completed" — every step in the progress bar is green. End-to-end service delivered.', COLOR_CUSTOMER);
  await shot(page, 'customer-dashboard-final');
  await page.waitForTimeout(ACTION_MS);

  // Booking details final
  await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await showStep(page, 'Final booking details: complete timeline, approved extension, and total cost breakdown. Full transparency.', COLOR_CUSTOMER);
  await shot(page, 'customer-booking-details-final');

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log(`\n=== DEMO LIVE EN COMPLETE ===`);
  console.log(`Pace: ${PACE}`);
  console.log(`Screenshots taken: ${screenshotCount}`);
  console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
  console.log(`Booking: ${bookingNumber} (${bookingId})`);
  console.log(`Extension: ${extensionId}`);
  console.log(`Video: check test-results/ for recording`);
});
