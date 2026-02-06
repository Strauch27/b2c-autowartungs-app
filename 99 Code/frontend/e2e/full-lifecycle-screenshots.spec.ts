import { test, expect, Page } from '@playwright/test';
import path from 'path';

/**
 * Full Lifecycle Screenshot Tour
 *
 * Creates a booking via API and drives it through every FSM status,
 * taking screenshots from Customer / Jockey / Workshop portals at each step.
 *
 * Status flow: PENDING_PAYMENT → CONFIRMED → PICKUP_ASSIGNED → PICKED_UP
 *   → AT_WORKSHOP → IN_SERVICE → READY_FOR_RETURN → RETURN_ASSIGNED → RETURNED
 *
 * Run: npx playwright test e2e/full-lifecycle-screenshots.spec.ts --config=e2e/playwright-minimal.config.ts
 */

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-lifecycle');
const API_BASE = 'http://localhost:5001/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function closeDemoBanner(page: Page) {
  const closeBtn = page.locator('.bg-yellow-400 button, [class*="bg-yellow"] button');
  if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

async function dismissDevOverlay(page: Page) {
  // Hide Next.js dev overlay via DOM manipulation (more reliable than Escape key)
  await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    // Also hide any shadow-dom based dev indicators
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
  }).catch(() => {});
}

async function screenshot(page: Page, name: string) {
  await closeDemoBanner(page);
  await dismissDevOverlay(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
}

async function viewportShot(page: Page, name: string) {
  await closeDemoBanner(page);
  await dismissDevOverlay(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
}

async function apiLogin(role: 'customer' | 'jockey' | 'workshop'): Promise<string> {
  const configs: Record<string, any> = {
    customer: { email: 'kunde@test.de', password: 'password123', endpoint: '/auth/customer/login' },
    jockey: { username: 'jockey1', password: 'password123', endpoint: '/auth/jockey/login' },
    workshop: { username: 'werkstatt1', password: 'password123', endpoint: '/auth/workshop/login' },
  };
  const c = configs[role];
  const body = role === 'customer' ? { email: c.email, password: c.password } : { username: c.username, password: c.password };
  const res = await fetch(`${API_BASE}${c.endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data.success || !data.token) throw new Error(`Login failed for ${role}: ${JSON.stringify(data)}`);
  return data.token;
}

async function api(method: string, endpoint: string, token: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function injectToken(page: Page, token: string) {
  await page.goto('/de');
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
}

// ============================================================================
// Shared state
// ============================================================================
let customerToken = '';
let jockeyToken = '';
let workshopToken = '';
let bookingId = '';
let bookingNumber = '';
let pickupAssignmentId = '';
let returnAssignmentId = '';

// ============================================================================
// FULL LIFECYCLE
// ============================================================================
test.describe.serial('Full Lifecycle Screenshots', () => {

  // ==========================================================================
  // SETUP: Create booking via API, get tokens
  // ==========================================================================
  test('00 - Setup: Create booking and get tokens', async ({ page }) => {
    // Get all tokens
    customerToken = await apiLogin('customer');
    jockeyToken = await apiLogin('jockey');
    workshopToken = await apiLogin('workshop');

    // Create a booking via API (as customer)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const bookingRes = await api('POST', '/bookings', customerToken, {
      vehicle: {
        brand: 'bmw',
        model: '320i',
        year: 2020,
        mileage: 45000,
      },
      services: ['inspection'],
      pickup: {
        date: tomorrow.toISOString().split('T')[0],
        timeSlot: '10:00',
        street: 'Musterstraße 123',
        city: 'Witten',
        postalCode: '58453',
      },
      delivery: {
        date: dayAfter.toISOString().split('T')[0],
        timeSlot: '14:00',
      },
    });

    expect(bookingRes.success).toBeTruthy();
    bookingId = bookingRes.data?.id || bookingRes.data?.booking?.id;
    bookingNumber = bookingRes.data?.bookingNumber || bookingRes.data?.booking?.bookingNumber;
    expect(bookingNumber).toBeTruthy();

    // In demo mode, booking auto-transitions to PICKUP_ASSIGNED
    // Find the pickup assignment
    const assignments = await api('GET', '/jockeys/assignments?limit=50', jockeyToken);
    const assignmentList = assignments.data?.assignments || [];
    const pickup = assignmentList.find(
      (a: any) => a.bookingId === bookingId && a.type === 'PICKUP' && a.status !== 'COMPLETED'
    ) || assignmentList.find(
      (a: any) => a.type === 'PICKUP' && a.status !== 'COMPLETED'
    );
    if (pickup) {
      pickupAssignmentId = pickup.id;
      if (!bookingId) bookingId = pickup.bookingId;
    }

    // Take a setup confirmation screenshot
    await page.goto('/de');
    await screenshot(page, '00-setup-complete');
  });

  // ==========================================================================
  // PHASE 1: PICKUP_ASSIGNED — All portals see the new booking
  // ==========================================================================
  test('01 - Status PICKUP_ASSIGNED: Customer Dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '01-PICKUP_ASSIGNED-customer-dashboard');
  });

  test('02 - Status PICKUP_ASSIGNED: Jockey Dashboard', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '02-PICKUP_ASSIGNED-jockey-dashboard');
  });

  test('03 - Status PICKUP_ASSIGNED: Workshop Dashboard', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '03-PICKUP_ASSIGNED-workshop-dashboard');
  });

  // ==========================================================================
  // PHASE 2: Jockey picks up → PICKED_UP
  // ==========================================================================
  test('04 - Jockey: Pickup → EN_ROUTE → PICKED_UP', async ({ page }) => {
    expect(pickupAssignmentId).toBeTruthy();

    // Jockey starts driving
    await api('PATCH', `/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });

    // Screenshot: Jockey en route
    await injectToken(page, jockeyToken);
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '04-EN_ROUTE-jockey-dashboard');

    // Jockey arrives & completes pickup
    await api('PATCH', `/jockeys/assignments/${pickupAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
    await api('POST', `/jockeys/assignments/${pickupAssignmentId}/complete`, jockeyToken, {
      handoverData: { photos: [], notes: 'Fahrzeug in gutem Zustand abgeholt' },
    });

    // Screenshot: Jockey after pickup complete
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '05-PICKED_UP-jockey-dashboard');
  });

  test('06 - Status PICKED_UP: Customer Dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '06-PICKED_UP-customer-dashboard');
  });

  // ==========================================================================
  // PHASE 3: Workshop receives → AT_WORKSHOP → IN_SERVICE
  // ==========================================================================
  test('07 - Workshop: AT_WORKSHOP', async ({ page }) => {
    expect(bookingNumber).toBeTruthy();

    await api('PUT', `/workshops/orders/${bookingNumber}/status`, workshopToken, { status: 'AT_WORKSHOP' });

    await injectToken(page, workshopToken);
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '07-AT_WORKSHOP-workshop-dashboard');
  });

  test('08 - Status AT_WORKSHOP: Customer Dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '08-AT_WORKSHOP-customer-dashboard');
  });

  test('09 - Workshop: IN_SERVICE', async ({ page }) => {
    await api('PUT', `/workshops/orders/${bookingNumber}/status`, workshopToken, { status: 'IN_SERVICE' });

    await injectToken(page, workshopToken);
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '09-IN_SERVICE-workshop-dashboard');
  });

  test('10 - Status IN_SERVICE: Customer Dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '10-IN_SERVICE-customer-dashboard');
  });

  // ==========================================================================
  // PHASE 4: Workshop completes → READY_FOR_RETURN → auto RETURN_ASSIGNED
  // ==========================================================================
  test('11 - Workshop: READY_FOR_RETURN', async ({ page }) => {
    await api('PUT', `/workshops/orders/${bookingNumber}/status`, workshopToken, { status: 'READY_FOR_RETURN' });

    // Workshop view
    await injectToken(page, workshopToken);
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '11-READY_FOR_RETURN-workshop-dashboard');

    // Find return assignment
    const assignments = await api('GET', '/jockeys/assignments?limit=50', jockeyToken);
    const aList = assignments.data?.assignments || [];
    const ret = aList.find((a: any) => a.bookingId === bookingId && a.type === 'RETURN' && a.status !== 'COMPLETED')
      || aList.find((a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED');
    if (ret) returnAssignmentId = ret.id;
  });

  test('12 - Status RETURN_ASSIGNED: Jockey Dashboard', async ({ page }) => {
    await injectToken(page, jockeyToken);
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '12-RETURN_ASSIGNED-jockey-dashboard');
  });

  test('13 - Status RETURN_ASSIGNED: Customer Dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '13-RETURN_ASSIGNED-customer-dashboard');
  });

  // ==========================================================================
  // PHASE 5: Jockey returns vehicle → RETURNED
  // ==========================================================================
  test('14 - Jockey: Return → RETURNED', async ({ page }) => {
    if (!returnAssignmentId) {
      const assignments = await api('GET', '/jockeys/assignments?limit=50', jockeyToken);
      const aList = assignments.data?.assignments || [];
      const ret = aList.find((a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED');
      if (ret) returnAssignmentId = ret.id;
    }

    if (returnAssignmentId) {
      await api('PATCH', `/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await api('PATCH', `/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await api('POST', `/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Fahrzeug erfolgreich zurückgebracht' },
      });
    }

    // Jockey view
    await injectToken(page, jockeyToken);
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '14-RETURNED-jockey-dashboard');
  });

  test('15 - Status RETURNED: Workshop Dashboard', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await viewportShot(page, '15-RETURNED-workshop-dashboard');
  });

  test('16 - Status RETURNED: Customer Dashboard (FINAL)', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '16-RETURNED-customer-dashboard-FINAL');
  });

  // ==========================================================================
  // PHASE 6: Customer booking detail at final state
  // ==========================================================================
  test('17 - Customer: Booking Detail (final state)', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const detailsBtn = page.locator('button:has-text("Details")').first();
    if (await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsBtn.click();
      await page.waitForURL(/\/de\/customer\/bookings\//, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await screenshot(page, '17-RETURNED-customer-booking-detail');
    }
  });
});
