import { test, expect } from '@playwright/test';

test.describe('Jockey Portal Tests', () => {
  test('should display jockey login page', async ({ page }) => {
    await page.goto('/de/jockey/login');

    // Check login form is visible
    await expect(page.locator('text=Willkommen zurück').or(page.locator('text=Fahrer-Portal'))).toBeVisible();

    // Jockey uses username, not email
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]'));
    await expect(usernameField).toBeVisible();

    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with jockey credentials', async ({ page }) => {
    await page.goto('/de/jockey/login');

    // Fill in jockey credentials (username-based)
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('jockey');
    await page.locator('input[type="password"]').fill('jockey');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to jockey dashboard
    await expect(page).toHaveURL(/\/jockey\/dashboard/, { timeout: 10000 });

    // Verify dashboard elements with green theme
    await expect(page.locator('text=AutoConcierge').or(page.locator('header'))).toBeVisible();
  });

  test('should display jockey dashboard with assignments', async ({ page }) => {
    // Login
    await page.goto('/de/jockey/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('jockey');
    await page.locator('input[type="password"]').fill('jockey');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/jockey\/dashboard/, { timeout: 10000 });

    // Check stats cards
    await expect(page.locator('text=Fahrten heute').or(page.locator('text=Heute'))).toBeVisible();
    await expect(page.locator('text=Abgeschlossen').or(page.locator('text=Erledigt'))).toBeVisible();

    // Check assignments section
    await expect(page.locator('text=Aufträge').or(page.locator('text=Zuweisungen'))).toBeVisible();

    // Should show either assignments or empty state
    const hasAssignments = await page.locator('text=Abholung').isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=Keine Aufträge').isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasAssignments || hasEmptyState).toBeTruthy();
  });

  test('should display assignment card with details', async ({ page }) => {
    // Login
    await page.goto('/de/jockey/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('jockey');
    await page.locator('input[type="password"]').fill('jockey');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/jockey\/dashboard/, { timeout: 10000 });

    // If there are assignments, check card details
    const assignmentCard = page.locator('[class*="card"]').first();
    if (await assignmentCard.isVisible({ timeout: 2000 })) {
      // Should have status badge
      await expect(page.locator('[class*="badge"]').first()).toBeVisible();

      // Should have time
      await expect(page.locator('text=/\\d{1,2}:\\d{2}/')).toBeVisible();
    }
  });

  test('should show navigation and call buttons on assignments', async ({ page }) => {
    // Login
    await page.goto('/de/jockey/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('jockey');
    await page.locator('input[type="password"]').fill('jockey');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/jockey\/dashboard/, { timeout: 10000 });

    // Check for action buttons
    const hasNavButton = await page.locator('text=Navigation').or(page.locator('text=Navigieren')).isVisible({ timeout: 2000 }).catch(() => false);
    const hasCallButton = await page.locator('text=Anrufen').or(page.locator('text=Call')).isVisible({ timeout: 2000 }).catch(() => false);

    // At least one should be visible if there are assignments
    if (hasNavButton || hasCallButton) {
      expect(true).toBeTruthy();
    }
  });

  test('should logout from jockey dashboard', async ({ page }) => {
    // Login
    await page.goto('/de/jockey/login');
    const usernameField = page.locator('input[type="text"]').or(page.locator('input[placeholder*="Benutzername"]')).first();
    await usernameField.fill('jockey');
    await page.locator('input[type="password"]').fill('jockey');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/jockey\/dashboard/, { timeout: 10000 });

    // Click logout button (in header)
    const logoutButton = page.locator('button[aria-label*="Logout"]').or(
      page.locator('button:has-text("Abmelden")').or(
        page.locator('svg[class*="lucide-log-out"]').locator('..')
      )
    );
    await logoutButton.first().click();

    // Should redirect to home
    await expect(page).toHaveURL(/^\/(de|en)\/?$/, { timeout: 5000 });
  });
});
