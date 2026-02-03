import { test, expect } from '@playwright/test';

test.describe('Customer Portal Tests', () => {
  test('should display customer login page', async ({ page }) => {
    await page.goto('/de/customer/login');

    // Check login form is visible
    await expect(page.locator('text=Kundenportal')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/de/customer/login');

    // Click submit without filling anything
    await page.locator('button[type="submit"]').click();

    // Should stay on login page (validation prevents submission)
    await expect(page).toHaveURL(/\/customer\/login/);
  });

  test('should login successfully with test credentials', async ({ page }) => {
    await page.goto('/de/customer/login');

    // Fill in test credentials
    await page.locator('input[type="email"]').fill('kunde@kunde.de');
    await page.locator('input[type="password"]').fill('kunde');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Should redirect to customer dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Verify dashboard elements
    await expect(page.locator('text=AutoConcierge')).toBeVisible();
    await expect(page.locator('text=Willkommen').or(page.locator('text=Dashboard'))).toBeVisible();
  });

  test('should display customer dashboard with stats', async ({ page }) => {
    // Login first
    await page.goto('/de/customer/login');
    await page.locator('input[type="email"]').fill('kunde@kunde.de');
    await page.locator('input[type="password"]').fill('kunde');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Check stats cards are visible
    await expect(page.locator('text=Aktive Buchungen')).toBeVisible();
    await expect(page.locator('text=Gespeicherte Fahrzeuge')).toBeVisible();
    await expect(page.locator('text=Letzte Buchung')).toBeVisible();

    // Check navigation sidebar
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Neue Buchung')).toBeVisible();
    await expect(page.locator('text=Meine Buchungen')).toBeVisible();
    await expect(page.locator('text=Fahrzeuge')).toBeVisible();
  });

  test('should display recent bookings section', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.locator('input[type="email"]').fill('kunde@kunde.de');
    await page.locator('input[type="password"]').fill('kunde');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Check bookings section
    await expect(page.locator('text=Aktuelle Buchungen').or(page.locator('text=Letzte Buchungen'))).toBeVisible();

    // Should show either bookings or empty state
    const hasBookings = await page.locator('text=Details').isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=Keine Buchungen').isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasBookings || hasEmptyState).toBeTruthy();
  });

  test('should navigate to new booking from dashboard', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.locator('input[type="email"]').fill('kunde@kunde.de');
    await page.locator('input[type="password"]').fill('kunde');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Click new booking button
    await page.locator('text=Jetzt buchen').or(page.locator('text=Neue Buchung')).first().click();

    // Should navigate to booking page
    await expect(page).toHaveURL(/\/booking/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.locator('input[type="email"]').fill('kunde@kunde.de');
    await page.locator('input[type="password"]').fill('kunde');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Click logout
    await page.locator('text=Abmelden').or(page.locator('button:has-text("Logout")')).first().click();

    // Should redirect to home page
    await expect(page).toHaveURL(/^\/(de|en)\/?$/, { timeout: 5000 });
  });
});
