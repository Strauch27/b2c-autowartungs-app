/**
 * DE Extension Walkthrough — Full Extension Lifecycle Screenshots
 *
 * Captures the entire extension flow in German:
 * 1. Uses the seed booking (AC-SEED-0001) and advances to IN_SERVICE
 * 2. Workshop creates extension request via UI
 * 3. Customer reviews and approves extension with demo payment
 * 4. Workshop sees approved extension, completes service
 * 5. Jockey returns car, customer sees final state
 *
 * Run:
 *   cd "99 Code/frontend" && PLAYWRIGHT_API_URL=http://localhost:5001 \
 *     npx playwright test walkthrough-de-extensions --reporter=list --project="chromium-desktop" 2>&1
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const SCREENSHOT_DIR = path.join(__dirname, 'walkthrough-screenshots', 'de');
const API_BASE = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';
const LOCALE = 'de';

// Shared state across serial tests
let bookingNumber = 'AC-SEED-0001';
let bookingId = '';
let customerToken = '';
let jockeyToken = '';
let workshopToken = '';
let extensionId = '';
let returnAssignmentId = '';
let screenshotCount = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

// ============================================================================
// EXTENSION WALKTHROUGH
// ============================================================================

test.describe.serial('DE Extension Walkthrough', () => {
  test.setTimeout(180_000);

  // ==========================================================================
  // PHASE 1: Setup - advance seed booking to IN_SERVICE
  // ==========================================================================

  test('01 - Setup: Get tokens and advance seed booking to IN_SERVICE', async () => {
    // Get role tokens
    customerToken = await getTestToken('CUSTOMER');
    jockeyToken = await getTestToken('JOCKEY');
    workshopToken = await getTestToken('WORKSHOP');

    // Get the seed booking ID
    const ordersRes = await apiRequest('GET', '/api/workshops/orders?limit=50', workshopToken);
    const orders = ordersRes.data || [];
    const seedOrder = orders.find((o: any) => o.bookingNumber === bookingNumber);
    if (seedOrder) {
      bookingId = seedOrder.id;
      console.log(`    Seed booking found: ${bookingNumber} (${bookingId}) status=${seedOrder.status}`);

      // Advance to IN_SERVICE if needed
      if (seedOrder.status === 'AT_WORKSHOP') {
        await apiRequest('PUT', `/api/workshops/orders/${bookingNumber}/status`, workshopToken, { status: 'IN_SERVICE' });
        console.log('    Advanced to IN_SERVICE');
      } else if (seedOrder.status !== 'IN_SERVICE') {
        console.log(`    WARNING: Seed booking at unexpected status: ${seedOrder.status}`);
      }
    } else {
      throw new Error('Seed booking AC-SEED-0001 not found');
    }
  });

  // ==========================================================================
  // PHASE 2: WORKSHOP creates extension
  // ==========================================================================

  test('02 - Workshop: Dashboard with IN_SERVICE order', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify our order shows as "In Arbeit" (inProgress)
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    await shot(page, 'ext-01-workshop-order-list');
  });

  test('03 - Workshop: Open order details', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find the row for AC-SEED-0001 and click Details
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const detailsBtn = orderRow.locator('button:has-text("Details")');
    await expect(detailsBtn).toBeVisible({ timeout: 10000 });
    await detailsBtn.click();
    await page.waitForTimeout(800);
    await shot(page, 'ext-02-workshop-order-details');
  });

  test('04 - Workshop: Click create extension button', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find the extension button for our order (only shows for inProgress/IN_SERVICE)
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    // The "+" button with Erweiterung text appears in the actions column
    const extensionBtn = orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    await expect(extensionBtn).toBeVisible({ timeout: 10000 });
    await extensionBtn.click();
    await page.waitForTimeout(800);

    // Verify the extension modal opened
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await shot(page, 'ext-03-workshop-extension-modal-empty');
  });

  test('05 - Workshop: Fill extension form and submit', async ({ page }) => {
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

    // Fill extension item 1
    const dialog = page.locator('[role="dialog"]');
    const descTextarea = dialog.locator('textarea').first();
    await expect(descTextarea).toBeVisible({ timeout: 5000 });
    await descTextarea.fill('Bremsscheiben vorne abgenutzt - Austausch notwendig');

    const priceInput = dialog.locator('input[type="number"]').first();
    await priceInput.fill('185.50');
    await page.waitForTimeout(300);

    await shot(page, 'ext-04-workshop-extension-form-filled');

    // Add a second item via the "add" button
    const addItemBtn = dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    if (await addItemBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemBtn.click();
      await page.waitForTimeout(300);

      const textareas = dialog.locator('textarea');
      const secondTextarea = textareas.nth(1);
      if (await secondTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await secondTextarea.fill('Bremsbelaege vorne erneuern');
        const priceInputs = dialog.locator('input[type="number"]');
        const secondPrice = priceInputs.nth(1);
        if (await secondPrice.isVisible({ timeout: 2000 }).catch(() => false)) {
          await secondPrice.fill('95.00');
        }
      }
      await page.waitForTimeout(300);
      await shot(page, 'ext-05-workshop-extension-two-items');
    }

    // Submit - look for the send button (with Send/Senden icon)
    const sendBtn = dialog.locator('button').filter({ has: page.locator('svg.lucide-send') });
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
    } else {
      // Fallback: click the last primary-looking button
      const buttons = dialog.locator('button');
      const count = await buttons.count();
      for (let i = count - 1; i >= 0; i--) {
        const btn = buttons.nth(i);
        const text = await btn.textContent() || '';
        if (text.match(/senden|send|submit/i)) {
          await btn.click();
          break;
        }
      }
    }
    await page.waitForTimeout(1500);
    await shot(page, 'ext-06-workshop-extension-submitted');
  });

  test('06 - Verify extension created and create via API if needed', async () => {
    // Check if extension was created via the UI (use bookings API, not workshop)
    const extRes = await apiRequest('GET', `/api/bookings/${bookingId}/extensions`, customerToken);
    const extensions = extRes.data || [];

    if (extensions.length > 0) {
      extensionId = extensions[0].id;
      console.log(`    Extension found: ${extensionId} status=${extensions[0].status} total=${extensions[0].totalAmount}`);
    } else {
      // UI creation may have failed due to price format (cents vs euros), create via API
      console.log('    No extension found, creating via API...');
      const createRes = await apiRequest('POST', `/api/workshops/orders/${bookingId}/extensions`, workshopToken, {
        description: 'Bremsscheiben vorne abgenutzt - Austausch notwendig',
        items: [
          { name: 'Bremsscheiben vorne', price: 18550, quantity: 1 },
          { name: 'Bremsbelaege vorne', price: 9500, quantity: 1 },
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

  // ==========================================================================
  // PHASE 3: CUSTOMER reviews and approves extension
  // ==========================================================================

  test('07 - Customer: Dashboard shows booking in service', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'ext-07-customer-dashboard');
  });

  test('08 - Customer: Booking details page', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'ext-08-customer-booking-details');
  });

  test('09 - Customer: Extensions tab with pending extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      // Wait for extension cards to load (look for extension content)
      await page.waitForTimeout(3000);
    }
    await shot(page, 'ext-09-customer-extensions-tab');
  });

  test('10 - Customer: View extension details (review modal)', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Click the extension action button (inside the extension card, not the tab)
    // The button contains AlertCircle icon and has text like "Details anzeigen" / "View Details"
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-alert-circle'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }
    await shot(page, 'ext-10-customer-extension-review');
  });

  test('11 - Customer: Click approve and see payment form', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal via extension card button
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-alert-circle'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click approve button (text varies: "Genehmigen & bezahlen", "Approve & Pay")
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Genehmigen|Approve|bezahlen|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'ext-11-customer-extension-payment');
  });

  test('12 - Customer: Complete demo payment for extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(3000);
    }

    // Open review modal via extension card button
    const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
      has: page.locator('svg.lucide-alert-circle'),
    }).first();
    if (await extensionActionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionActionBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click approve
    const approveBtn = page.locator('[role="dialog"] button').filter({
      hasText: /Genehmigen|Approve|bezahlen|Pay/i,
    }).first();
    if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(1500);
    }

    // Click the demo payment button ("Pay with Demo")
    const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
    if (await demoPayBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shot(page, 'ext-12-customer-demo-payment-form');
      await demoPayBtn.click();
      // Wait for processing + success
      await page.waitForTimeout(4000);
      await shot(page, 'ext-13-customer-extension-payment-success');
    } else {
      console.log('    Demo pay button not found, using API fallback');
      // Authorize via API
      const authRes = await apiRequest('POST', '/api/demo/extension/authorize', customerToken, { extensionId });
      console.log(`    API authorize: success=${authRes.success}`);
      await shot(page, 'ext-12-customer-extension-state');
    }
  });

  test('13 - Ensure extension is approved (API fallback)', async () => {
    // Check extension status
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

  test('14 - Customer: Extension confirmed state', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'ext-14-customer-extension-confirmed');
  });

  // ==========================================================================
  // PHASE 4: WORKSHOP sees approved extension, completes service
  // ==========================================================================

  test('15 - Workshop: See approved extension in order details', async ({ page }) => {
    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click details on the order to see extension status
    const orderRow = page.locator('tr', { hasText: bookingNumber });
    const detailsBtn = orderRow.locator('button:has-text("Details")');
    if (await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsBtn.click();
      await page.waitForTimeout(1000);
    }
    await shot(page, 'ext-15-workshop-extension-approved');
  });

  test('16 - Workshop: Complete service (READY_FOR_RETURN)', async ({ page }) => {
    // Advance to READY_FOR_RETURN via API
    await apiRequest('PUT', `/api/workshops/orders/${bookingNumber}/status`, workshopToken, { status: 'READY_FOR_RETURN' });

    await injectToken(page, workshopToken);
    await page.goto(`/${LOCALE}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'ext-16-workshop-service-complete');
  });

  // ==========================================================================
  // PHASE 5: JOCKEY return + CUSTOMER final state
  // ==========================================================================

  test('17 - Jockey: Return assignment', async ({ page }) => {
    // Find return assignment
    const assignmentsRes = await apiRequest('GET', '/api/jockeys/assignments?limit=50', jockeyToken);
    const assignments = assignmentsRes.data?.assignments || [];
    const ret = assignments.find((a: any) => a.type === 'RETURN' && a.status !== 'COMPLETED');
    if (ret) {
      returnAssignmentId = ret.id || ret._id;
      console.log(`    Return assignment: ${returnAssignmentId}`);
    }

    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'ext-17-jockey-return-assignment');
  });

  test('18 - Jockey: Complete return', async ({ page }) => {
    if (returnAssignmentId) {
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'EN_ROUTE' });
      await apiRequest('PATCH', `/api/jockeys/assignments/${returnAssignmentId}/status`, jockeyToken, { status: 'AT_LOCATION' });
      await apiRequest('POST', `/api/jockeys/assignments/${returnAssignmentId}/complete`, jockeyToken, {
        handoverData: { photos: [], notes: 'Fahrzeug nach Erweiterung erfolgreich zurueckgebracht' },
      });
    }

    await injectToken(page, jockeyToken);
    await page.goto(`/${LOCALE}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await shot(page, 'ext-18-jockey-return-complete');
  });

  test('19 - Customer: Final dashboard', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await shot(page, 'ext-19-customer-dashboard-final');
  });

  test('20 - Customer: Final booking details with extension', async ({ page }) => {
    await injectToken(page, customerToken);
    await page.goto(`/${LOCALE}/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click extensions tab
    const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
    if (await extensionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await extensionsTab.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 'ext-20-customer-final-extensions');
  });

  test('21 - Summary', async () => {
    console.log(`\n=== DE EXTENSION WALKTHROUGH COMPLETE ===`);
    console.log(`Screenshots taken: ${screenshotCount}`);
    console.log(`Screenshot directory: ${SCREENSHOT_DIR}`);
    console.log(`Booking: ${bookingNumber} (${bookingId})`);
    console.log(`Extension: ${extensionId}`);
  });
});
