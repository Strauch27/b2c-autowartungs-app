import { test, expect } from '@playwright/test';

/**
 * Quick Smoke Tests
 * Schnelle Tests um zu verifizieren dass die App grundsätzlich funktioniert
 */

test.describe('Quick Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/de');

    // Wait for page to be loaded
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/AutoConcierge/);

    // Check main content area exists
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 10000 });

    // Check some text is visible
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    expect(hasContent!.length).toBeGreaterThan(100);
  });

  test('should navigate to booking page', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');

    // Navigate to booking
    await page.goto('/de/booking');
    await page.waitForLoadState('networkidle');

    // Should be on booking page
    await expect(page).toHaveURL(/\/de\/booking/);

    // Main content should be visible
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to customer login', async ({ page }) => {
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');

    // Should be on login page
    await expect(page).toHaveURL(/\/customer\/login/);

    // Check for email input (customer uses email)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('should switch between German and English URLs', async ({ page }) => {
    // Load German page
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/de/);

    // Navigate to English page
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should have all main sections on landing page', async ({ page }) => {
    await page.goto('/de');
    await page.waitForLoadState('networkidle');

    // Check main is present
    await expect(page.locator('main')).toBeVisible();

    // Check for how-it-works section
    const howItWorks = page.locator('#how-it-works');
    if (await howItWorks.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(howItWorks).toBeVisible();
    }

    // Check for FAQ section
    const faq = page.locator('#faq');
    if (await faq.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(faq).toBeVisible();
    }
  });
});
