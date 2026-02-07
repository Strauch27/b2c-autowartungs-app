import { test, expect, Page } from '@playwright/test';
import path from 'path';

/**
 * Comprehensive Screenshot-Tour: Captures EVERY screen for all roles.
 * Run with: npx playwright test e2e/take-screenshots.spec.ts --config=e2e/playwright-minimal.config.ts
 */

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const API_BASE = 'http://localhost:5001/api';

// Credentials
const CREDENTIALS = {
  customer: { email: 'kunde@test.de', password: 'password123', endpoint: '/auth/customer/login' },
  jockey: { username: 'jockey1', password: 'password123', endpoint: '/auth/jockey/login' },
  workshop: { username: 'werkstatt1', password: 'password123', endpoint: '/auth/workshop/login' },
};

// Test customer for the full booking flow
const NEW_CUSTOMER = {
  firstName: 'Screenshot',
  lastName: 'Test',
  email: `screenshot-${Date.now()}@test.de`,
  phone: '015112345678',
  password: 'Test1234!',
};

// ---------------------------------------------------------------------------
// Helper: close demo banner if present
// ---------------------------------------------------------------------------
async function closeDemoBanner(page: Page) {
  const closeBtn = page.locator('.bg-yellow-400 button, [class*="bg-yellow"] button');
  if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

// ---------------------------------------------------------------------------
// Helper: dismiss Next.js dev overlay if present
// ---------------------------------------------------------------------------
async function dismissDevOverlay(page: Page) {
  await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
  }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Helper: take full-page screenshot
// ---------------------------------------------------------------------------
async function screenshot(page: Page, name: string) {
  await closeDemoBanner(page);
  await dismissDevOverlay(page);
  await page.waitForTimeout(500); // let animations settle
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

// ---------------------------------------------------------------------------
// Helper: API login → inject token into browser localStorage
// ---------------------------------------------------------------------------
async function loginViaAPI(page: Page, role: 'customer' | 'jockey' | 'workshop', customCreds?: { email?: string; password?: string }) {
  const config = CREDENTIALS[role];
  const body = role === 'customer'
    ? { email: customCreds?.email || (config as any).email, password: customCreds?.password || config.password }
    : { username: (config as any).username, password: config.password };

  const res = await fetch(`${API_BASE}${config.endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error(`Login failed for ${role}: ${JSON.stringify(data)}`);
  }

  // Navigate to a page first so we can set localStorage
  await page.goto('/de');
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
  }, data.token);

  return data.token;
}

// ============================================================================
// 1. LANDING PAGE (scrolled sections)
// ============================================================================
test.describe.serial('Screenshots: Landing Page', () => {
  test('01 - Landing Page (full page)', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-landing-page-full');
  });

  test('01b - Landing Page - Hero Section', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await closeDemoBanner(page);
    // Capture just the hero/header area (viewport-sized)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01b-landing-hero-section.png'),
      fullPage: false,
    });
  });

  test('01c - Landing Page - Portal Cards + Value Props', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await closeDemoBanner(page);
    // Scroll to portal cards section
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01c-landing-portal-cards.png'),
      fullPage: false,
    });
  });

  test('01d - Landing Page - How It Works + FAQ', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await closeDemoBanner(page);
    // Scroll far down to FAQ area
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01d-landing-faq-footer.png'),
      fullPage: false,
    });
  });
});

// ============================================================================
// 2. GUEST BOOKING FLOW — All 4 Steps (empty + filled)
// ============================================================================
test.describe.serial('Screenshots: Guest Booking Flow', () => {
  test('02a - Booking Step 1: Vehicle (empty)', async ({ page }) => {
    await page.goto('/de/booking');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '02a-booking-step1-vehicle-empty');
  });

  test('02b - Booking Step 1: Vehicle (filled)', async ({ page }) => {
    await page.goto('/de/booking');
    await page.waitForLoadState('networkidle');
    // Fill vehicle
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await screenshot(page, '02b-booking-step1-vehicle-filled');
  });

  test('03a - Booking Step 2: Services (empty)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill step 1
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
    await screenshot(page, '03a-booking-step2-services-empty');
  });

  test('03b - Booking Step 2: Services (selected)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill step 1
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
    // Select inspection
    await page.locator('[data-testid="service-card-inspection"]').click();
    await screenshot(page, '03b-booking-step2-services-selected');
  });

  test('03c - Booking Step 2: Multiple services selected', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill step 1
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
    // Select multiple services
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('[data-testid="service-card-oil"]').click();
    await screenshot(page, '03c-booking-step2-services-multiple');
  });

  test('04a - Booking Step 3: Pickup & Address (empty)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill steps 1+2
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#street')).toBeVisible();
    await screenshot(page, '04a-booking-step3-pickup-empty');
  });

  test('04b - Booking Step 3: Calendar open', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill steps 1+2
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#street')).toBeVisible();
    // Open calendar popover
    await page.locator('button:has-text("Abholdatum")').click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await screenshot(page, '04b-booking-step3-calendar-open');
  });

  test('04c - Booking Step 3: Pickup & Address (filled)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill steps 1+2
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#street')).toBeVisible();

    // Pick date
    await page.locator('button:has-text("Abholdatum")').click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await page.locator('td button:not([disabled])').first().click();
    // Pick times
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    // Fill address
    await page.locator('#street').fill('Musterstraße 123');
    await page.locator('#zip').fill('58453');
    await page.locator('#city').fill('Witten');
    await screenshot(page, '04c-booking-step3-pickup-filled');
  });

  test('05a - Booking Step 4: Confirmation (empty)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill steps 1+2+3
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#street')).toBeVisible();
    await page.locator('button:has-text("Abholdatum")').click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await page.locator('td button:not([disabled])').first().click();
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.locator('#street').fill('Musterstraße 123');
    await page.locator('#zip').fill('58453');
    await page.locator('#city').fill('Witten');
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#firstName')).toBeVisible();
    await screenshot(page, '05a-booking-step4-confirmation-empty');
  });

  test('05b - Booking Step 4: Confirmation (filled)', async ({ page }) => {
    await page.goto('/de/booking');
    // Fill steps 1+2+3
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#street')).toBeVisible();
    await page.locator('button:has-text("Abholdatum")').click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await page.locator('td button:not([disabled])').first().click();
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.locator('#street').fill('Musterstraße 123');
    await page.locator('#zip').fill('58453');
    await page.locator('#city').fill('Witten');
    await page.locator('button:has-text("Weiter")').click();
    await expect(page.locator('#firstName')).toBeVisible();
    // Fill contact info
    await page.locator('#firstName').fill('Max');
    await page.locator('#lastName').fill('Mustermann');
    await page.locator('#email').fill('screenshot-demo@example.com');
    await page.locator('#phone').fill('015112345678');
    await page.locator('#terms').click();
    await screenshot(page, '05b-booking-step4-confirmation-filled');
  });
});

// ============================================================================
// 3. FULL BOOKING SUBMISSION → Registration → Success
// ============================================================================
test.describe.serial('Screenshots: Booking Submission Flow', () => {
  test('06 - Submit booking → Registration page', async ({ page }) => {
    await page.goto('/de/booking');

    // ---- Step 1: Vehicle ----
    await page.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("BMW")').click();
    await page.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("320i")').click();
    await page.locator('#year').fill('2020');
    await page.locator('#mileage').fill('45000');
    await page.locator('button:has-text("Weiter")').click();

    // ---- Step 2: Service ----
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await page.locator('button:has-text("Weiter")').click();

    // ---- Step 3: Pickup ----
    await expect(page.locator('#street')).toBeVisible();
    await page.locator('button:has-text("Abholdatum")').click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await page.locator('td button:not([disabled])').first().click();
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();
    await page.locator('#street').fill('Musterstraße 123');
    await page.locator('#zip').fill('58453');
    await page.locator('#city').fill('Witten');
    await page.locator('button:has-text("Weiter")').click();

    // ---- Step 4: Confirmation ----
    await expect(page.locator('#firstName')).toBeVisible();
    await page.locator('#firstName').fill(NEW_CUSTOMER.firstName);
    await page.locator('#lastName').fill(NEW_CUSTOMER.lastName);
    await page.locator('#email').fill(NEW_CUSTOMER.email);
    await page.locator('#phone').fill(NEW_CUSTOMER.phone);
    await page.locator('#terms').click();

    // Submit
    const submitBtn = page.locator('button:has-text("Jetzt kostenpflichtig buchen")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for redirect to registration page
    await page.waitForURL(/\/de\/booking\/register/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await screenshot(page, '06a-booking-register-page');

    // Fill password fields
    await page.locator('#password').fill(NEW_CUSTOMER.password);
    await page.locator('#confirmPassword').fill(NEW_CUSTOMER.password);
    await screenshot(page, '06b-booking-register-filled');

    // Submit registration
    await page.locator('button:has-text("Konto erstellen")').click();

    // Wait for success page
    await page.waitForURL(/\/de\/booking\/success/, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await screenshot(page, '07-booking-success-page');
  });
});

// ============================================================================
// 4. CUSTOMER LOGIN & PORTAL
// ============================================================================
test.describe.serial('Screenshots: Customer Portal', () => {
  test('10a - Customer Login (empty)', async ({ page }) => {
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '10a-customer-login-empty');
  });

  test('10b - Customer Login (filled)', async ({ page }) => {
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="customer-email-input"]').fill('kunde@test.de');
    await page.locator('[data-testid="customer-password-input"]').fill('password123');
    await screenshot(page, '10b-customer-login-filled');
  });

  test('11 - Customer Register Page (standalone)', async ({ page }) => {
    await page.goto('/de/customer/register');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '11a-customer-register-empty');

    // Fill registration form
    await page.locator('#email').fill('neukunde@example.de');
    await page.locator('#firstName').fill('Anna');
    await page.locator('#lastName').fill('Muster');
    await page.locator('#phone').fill('+49 170 1234567');
    await page.locator('#password').fill('MeinPasswort123!');
    await page.locator('#confirmPassword').fill('MeinPasswort123!');
    await screenshot(page, '11b-customer-register-filled');
  });

  test('12 - Customer Dashboard', async ({ page }) => {
    await loginViaAPI(page, 'customer');
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '12-customer-dashboard');
  });

  test('13 - Customer Booking Detail', async ({ page }) => {
    await loginViaAPI(page, 'customer');
    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first booking details
    const detailsBtn = page.locator('button:has-text("Details")').last();
    if (await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsBtn.click();
      await page.waitForURL(/\/de\/customer\/bookings\//, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);
      await screenshot(page, '13-customer-booking-detail');
    } else {
      await screenshot(page, '13-customer-no-bookings');
    }
  });

  test('14 - Customer Notifications', async ({ page }) => {
    await loginViaAPI(page, 'customer');
    await page.goto('/de/customer/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await screenshot(page, '14-customer-notifications');
  });

  test('15 - Customer Booking Flow (portal version)', async ({ page }) => {
    await loginViaAPI(page, 'customer');
    await page.goto('/de/customer/booking');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await screenshot(page, '15-customer-portal-booking');
  });

  test('15b - Customer Booking Service Step (portal)', async ({ page }) => {
    await loginViaAPI(page, 'customer');
    await page.goto('/de/customer/booking/service');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await screenshot(page, '15b-customer-portal-booking-service');
  });
});

// ============================================================================
// 5. JOCKEY LOGIN & PORTAL
// ============================================================================
test.describe.serial('Screenshots: Jockey Portal', () => {
  test('20a - Jockey Login (empty)', async ({ page }) => {
    await page.goto('/de/jockey/login');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '20a-jockey-login-empty');
  });

  test('20b - Jockey Login (filled)', async ({ page }) => {
    await page.goto('/de/jockey/login');
    await page.waitForLoadState('networkidle');
    // Jockey login uses username/password fields
    const usernameInput = page.locator('[data-testid="jockey-email-input"], [data-testid="jockey-username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="jockey-password-input"], input[type="password"]').first();
    await usernameInput.fill('jockey1');
    await passwordInput.fill('password123');
    await screenshot(page, '20b-jockey-login-filled');
  });

  test('21 - Jockey Dashboard', async ({ page }) => {
    await loginViaAPI(page, 'jockey');
    await page.goto('/de/jockey/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '21-jockey-dashboard');
  });
});

// ============================================================================
// 6. WORKSHOP LOGIN & PORTAL
// ============================================================================
test.describe.serial('Screenshots: Workshop Portal', () => {
  test('30a - Workshop Login (empty)', async ({ page }) => {
    await page.goto('/de/workshop/login');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '30a-workshop-login-empty');
  });

  test('30b - Workshop Login (filled)', async ({ page }) => {
    await page.goto('/de/workshop/login');
    await page.waitForLoadState('networkidle');
    const usernameInput = page.locator('[data-testid="workshop-email-input"], [data-testid="workshop-username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="workshop-password-input"], input[type="password"]').first();
    await usernameInput.fill('werkstatt1');
    await passwordInput.fill('password123');
    await screenshot(page, '30b-workshop-login-filled');
  });

  test('31 - Workshop Dashboard', async ({ page }) => {
    await loginViaAPI(page, 'workshop');
    await page.goto('/de/workshop/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '31-workshop-dashboard');
  });
});

// ============================================================================
// 7. ADMIN ANALYTICS
// ============================================================================
test.describe.serial('Screenshots: Admin Analytics', () => {
  test('40 - Admin Analytics Dashboard', async ({ page }) => {
    await page.goto('/de/admin/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '40-admin-analytics');
  });
});
