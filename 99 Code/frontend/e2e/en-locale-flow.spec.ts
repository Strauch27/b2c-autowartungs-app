/**
 * EN Locale Verification E2E Tests
 *
 * Verifies that the app works completely in English:
 * - Landing page, login, dashboard, and language switching.
 */

import { test, expect } from '@playwright/test';
import { test as authTest, expect as authExpect } from './fixtures/auth';
import { TEST_USERS } from './fixtures/test-data';

test.describe('EN Locale - Landing Page', () => {
  test('Landing page loads in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Hero text should be in English
    const heroContent = page.locator('text=/Premium Vehicle Maintenance|Book Now|How It Works/i').first();
    await expect(heroContent).toBeVisible({ timeout: 10000 });
  });

  test('Navigation labels are in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Check for English navigation items
    const content = await page.textContent('body');
    expect(content).toBeTruthy();

    // At least one English nav label should be present
    const hasEnglish = /How It Works|Book Now|FAQ|Home/i.test(content || '');
    expect(hasEnglish).toBe(true);
  });
});

test.describe('EN Locale - Customer Login & Dashboard', () => {
  test('Customer login page loads in English', async ({ page }) => {
    await page.goto('/en/customer/login');
    await page.waitForLoadState('networkidle');

    // Login form should have English labels
    const content = await page.textContent('body');
    expect(content).toBeTruthy();

    // Should have English text like "Login", "Email", "Password"
    const hasEnglish = /Login|Email|Password|Sign in/i.test(content || '');
    expect(hasEnglish).toBe(true);
  });

  test('Customer dashboard displays English text after login', async ({ page }) => {
    // Login in English locale
    await page.goto('/en/customer/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.fill(TEST_USERS.customer.email);
    await passwordInput.fill(TEST_USERS.customer.password);
    await submitButton.click();

    await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

    // Dashboard should show English text
    const content = await page.textContent('body');
    expect(content).toBeTruthy();

    // "Welcome back" instead of "Willkommen zurück"
    const hasWelcome = /Welcome back/i.test(content || '');
    expect(hasWelcome).toBe(true);
  });

  test('Customer dashboard nav labels are in English', async ({ page }) => {
    await page.goto('/en/customer/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_USERS.customer.email);
    await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
    await page.locator('button[type="submit"]').first().click();

    await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

    // Check for English nav labels
    const content = await page.textContent('body');

    // Should contain English dashboard labels
    const hasEnglishLabels = /Dashboard|New Booking|My Bookings|Vehicles|Profile/i.test(content || '');
    expect(hasEnglishLabels).toBe(true);
  });
});

test.describe('EN Locale - Language Switch', () => {
  test('Language switch DE → EN → DE works', async ({ page }) => {
    // Start on German customer login, login
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_USERS.customer.email);
    await page.locator('input[type="password"]').first().fill(TEST_USERS.customer.password);
    await page.locator('button[type="submit"]').first().click();

    await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

    // Verify we're on German dashboard
    await expect(page).toHaveURL(/\/de\/customer\/dashboard/);
    let content = await page.textContent('body');
    expect(content).toMatch(/Willkommen zurück/i);

    // Click Globe → English
    const globeButton = page.locator('button:has(svg.lucide-globe)').first();
    if (await globeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await globeButton.click();

      const englishOption = page.locator('[role="menuitem"]:has-text("English")').first();
      if (await englishOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await englishOption.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // URL should be /en/
        expect(page.url()).toMatch(/\/en\//);

        // Content should be English
        content = await page.textContent('body');
        expect(content).toMatch(/Welcome back/i);

        // Switch back to German
        const globeButton2 = page.locator('button:has(svg.lucide-globe)').first();
        await globeButton2.click();

        const deutschOption = page.locator('[role="menuitem"]:has-text("Deutsch")').first();
        if (await deutschOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deutschOption.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);

          // URL should be /de/ again
          expect(page.url()).toMatch(/\/de\//);

          // Content should be German again
          content = await page.textContent('body');
          expect(content).toMatch(/Willkommen zurück/i);
        }
      }
    }
  });
});

authTest.describe('EN Locale - Jockey Dashboard', () => {
  authTest('Jockey dashboard loads in English', async ({ asJockey }) => {
    await asJockey.goto('/en/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // Should be on jockey dashboard
    await authExpect(asJockey).toHaveURL(/jockey\/dashboard/);

    // Content should have English labels
    const content = await asJockey.textContent('body');
    expect(content).toBeTruthy();

    // English jockey labels: "Today's Trips", "Completed", "Pending", "Pickup"
    const hasEnglish = /Today's Trips|Completed|Pending|Pickup|Start Navigation/i.test(content || '');
    expect(hasEnglish).toBe(true);
  });
});

authTest.describe('EN Locale - Workshop Dashboard', () => {
  authTest('Workshop dashboard loads in English', async ({ asWorkshop }) => {
    await asWorkshop.goto('/en/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Should be on workshop dashboard
    await authExpect(asWorkshop).toHaveURL(/workshop\/dashboard/);

    // Content should have English labels
    const content = await asWorkshop.textContent('body');
    expect(content).toBeTruthy();

    // English workshop labels: "Orders Today", "In Progress", "Current Orders"
    const hasEnglish = /Orders Today|In Progress|Current Orders|Completed/i.test(content || '');
    expect(hasEnglish).toBe(true);
  });
});
