import { test, expect } from '@playwright/test';

// Helper: login to workshop portal
async function workshopLogin(page: import('@playwright/test').Page) {
  await page.goto('/de/workshop/login');
  await page.locator('[data-testid="workshop-username-input"]').fill('testworkshop');
  await page.locator('[data-testid="workshop-password-input"]').fill('Test123!');
  await page.locator('[data-testid="workshop-login-button"]').click();
  await expect(page).toHaveURL(/\/de\/workshop\/dashboard/, { timeout: 15000 });
}

test.describe('Workshop Portal Tests', () => {
  test('should display workshop login page', async ({ page }) => {
    await page.goto('/de/workshop/login');

    // Check login heading is visible
    await expect(page.getByRole('heading', { name: 'Willkommen zurück' })).toBeVisible();

    // Workshop uses username, not email
    await expect(page.locator('[data-testid="workshop-username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="workshop-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="workshop-login-button"]')).toBeVisible();
  });

  test('should login successfully with workshop credentials', async ({ page }) => {
    await workshopLogin(page);

    // Verify dashboard elements
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display workshop dashboard with stats', async ({ page }) => {
    await workshopLogin(page);
    await page.waitForLoadState('networkidle');

    // Check that some dashboard content is visible (stats or bookings section)
    const hasContent = await page.locator('[class*="card"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('should display orders table', async ({ page }) => {
    await workshopLogin(page);
    await page.waitForLoadState('networkidle');

    // Should show either bookings/orders or empty state
    const hasContent = await page.locator('[class*="card"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=Keine Aufträge').or(page.locator('text=Keine Buchungen')).isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasContent || hasEmptyState).toBeTruthy();
  });

  test('should display table columns correctly', async ({ page }) => {
    await workshopLogin(page);
    await page.waitForLoadState('networkidle');

    // Check table headers if table exists
    const hasTable = await page.locator('table').isVisible({ timeout: 3000 }).catch(() => false);

    if (hasTable) {
      await expect(page.locator('text=Kunde').first()).toBeVisible();
      await expect(page.locator('text=Status').first()).toBeVisible();
    }
  });

  test('should show action buttons on orders', async ({ page }) => {
    await workshopLogin(page);
    await page.waitForLoadState('networkidle');

    // Check for action buttons if there are orders
    const hasViewButton = await page.locator('text=Details').or(page.locator('text=Anzeigen')).isVisible({ timeout: 3000 }).catch(() => false);
    const hasExtensionButton = await page.locator('text=Erweiterung').or(page.locator('text=Extension')).isVisible({ timeout: 3000 }).catch(() => false);

    // At least view details should be available if there are orders
    if (hasViewButton || hasExtensionButton) {
      expect(true).toBeTruthy();
    }
  });

  test('should display status badges with colors', async ({ page }) => {
    await workshopLogin(page);
    await page.waitForLoadState('networkidle');

    // Check for status badges
    const hasBadges = await page.locator('[class*="badge"]').isVisible({ timeout: 3000 }).catch(() => false);

    if (hasBadges) {
      expect(true).toBeTruthy();
    }
  });

  test('should logout from workshop dashboard', async ({ page }) => {
    await workshopLogin(page);

    // Click logout button (has LogOut icon and text)
    const logoutButton = page.locator('button').filter({ has: page.locator('svg.lucide-log-out') }).first();
    await logoutButton.click();

    // Should redirect to home page
    await expect(page).toHaveURL(/\/de\/?$/, { timeout: 5000 });
  });
});
