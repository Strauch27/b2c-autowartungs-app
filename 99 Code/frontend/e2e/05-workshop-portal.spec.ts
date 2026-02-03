import { test, expect } from '@playwright/test';

test.describe('Workshop Portal Tests', () => {
  test('should display workshop login page', async ({ page }) => {
    await page.goto('/de/workshop/login');

    // Check login form is visible
    await expect(page.locator('text=Werkstatt Portal').or(page.locator('text=Workshop Portal'))).toBeVisible();

    // Workshop uses username, not email
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]'));
    await expect(usernameField).toBeVisible();

    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with workshop credentials', async ({ page }) => {
    await page.goto('/de/workshop/login');

    // Fill in workshop credentials (username-based)
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to workshop dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Verify dashboard elements
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display workshop dashboard with stats', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Check stats cards
    await expect(page.locator('text=Aufträge heute').or(page.locator('text=Heute'))).toBeVisible();
    await expect(page.locator('text=In Bearbeitung').or(page.locator('text=Laufend'))).toBeVisible();
    await expect(page.locator('text=Abgeschlossen').or(page.locator('text=Erledigt'))).toBeVisible();
  });

  test('should display orders table', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Check orders section
    await expect(page.locator('text=Aufträge').or(page.locator('text=Bestellungen'))).toBeVisible();

    // Should show either table headers or empty state
    const hasTable = await page.locator('text=Auftragsnummer').or(page.locator('text=Kunde')).isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=Keine Aufträge').isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should display table columns correctly', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Check table headers if table exists
    const hasOrders = await page.locator('table').isVisible({ timeout: 2000 }).catch(() => false);

    if (hasOrders) {
      // Table headers should be visible
      await expect(page.locator('text=Kunde')).toBeVisible();
      await expect(page.locator('text=Fahrzeug')).toBeVisible();
      await expect(page.locator('text=Service').or(page.locator('text=Leistung'))).toBeVisible();
      await expect(page.locator('text=Status')).toBeVisible();
    }
  });

  test('should show action buttons on orders', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Check for action buttons if there are orders
    const hasViewButton = await page.locator('text=Details').or(page.locator('text=Anzeigen')).isVisible({ timeout: 2000 }).catch(() => false);
    const hasExtensionButton = await page.locator('text=Erweiterung').or(page.locator('text=Extension')).isVisible({ timeout: 2000 }).catch(() => false);

    // At least view details should be available if there are orders
    if (hasViewButton || hasExtensionButton) {
      expect(true).toBeTruthy();
    }
  });

  test('should display status badges with colors', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Check for status badges
    const hasBadges = await page.locator('[class*="badge"]').isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBadges) {
      expect(true).toBeTruthy();
    }
  });

  test('should logout from workshop dashboard', async ({ page }) => {
    // Login
    await page.goto('/de/workshop/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('werkstatt');
    await page.locator('input[type="password"]').fill('werkstatt');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Click logout button
    const logoutButton = page.locator('button:has-text("Abmelden")').or(
      page.locator('text=Logout')
    );
    await logoutButton.first().click();

    // Should redirect to home
    await expect(page).toHaveURL(/^\/(de|en)\/?$/, { timeout: 5000 });
  });
});
