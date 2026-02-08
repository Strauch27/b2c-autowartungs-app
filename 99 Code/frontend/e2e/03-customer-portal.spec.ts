import { test, expect } from '@playwright/test';

const CUSTOMER = {
  email: 'customer@test.com',
  password: 'Test123!',
};

test.describe('Customer Portal Tests', () => {
  test('should display customer login page', async ({ page }) => {
    await page.goto('/de/customer/login');

    // Check login form is visible - title is "Willkommen zurück"
    await expect(page.locator('text=Willkommen zurück')).toBeVisible();
    await expect(page.locator('[data-testid="customer-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-login-button"]')).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/de/customer/login');

    // Click submit without filling anything — HTML5 required should prevent submission
    await page.locator('[data-testid="customer-login-button"]').click();

    // Should stay on login page (validation prevents submission)
    await expect(page).toHaveURL(/\/customer\/login/);
  });

  test('should login successfully with test credentials', async ({ page }) => {
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');

    // Fill in test credentials
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);

    // Submit form
    await page.locator('[data-testid="customer-login-button"]').click();

    // Should redirect to customer dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 30000 });

    // Verify dashboard elements
    await expect(page.locator('text=AutoConcierge').first()).toBeVisible();
    await expect(page.locator('text=Willkommen zurück').first()).toBeVisible();
  });

  test('should display customer dashboard with stats', async ({ page }) => {
    // Login first
    await page.goto('/de/customer/login');
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);
    await page.locator('[data-testid="customer-login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 15000 });

    // Check stats cards are visible
    await expect(page.locator('text=Aktive Buchungen')).toBeVisible();
    await expect(page.locator('text=Gespeicherte Fahrzeuge')).toBeVisible();

    // Check navigation sidebar (only visible on desktop)
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
    await expect(page.locator('text=Neue Buchung').first()).toBeVisible();
    await expect(page.locator('text=Meine Buchungen').first()).toBeVisible();
  });

  test('should display recent bookings section', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);
    await page.locator('[data-testid="customer-login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 30000 });

    // Should show either bookings or empty state
    // Check that the page loads and shows booking-related content
    await expect(page.locator('text=Willkommen zurück').first()).toBeVisible({ timeout: 10000 });

    // "Meine Buchungen" heading should be visible, or empty state "Keine Buchungen vorhanden"
    const hasBookingsHeading = await page.locator('text=Meine Buchungen').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=Keine Buchungen vorhanden').isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasBookingsHeading || hasEmptyState).toBeTruthy();
  });

  test('should navigate to new booking from dashboard', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);
    await page.locator('[data-testid="customer-login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 15000 });

    // Click new booking link in sidebar
    await page.locator('text=Neue Buchung').first().click();

    // Should navigate to booking page
    await expect(page).toHaveURL(/\/customer\/booking|\/booking/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // Login
    await page.goto('/de/customer/login');
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);
    await page.locator('[data-testid="customer-login-button"]').click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 15000 });

    // Click logout (in sidebar on desktop, or icon button on mobile)
    const logoutLink = page.locator('text=Abmelden').first();
    if (await logoutLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutLink.click();
    } else {
      // Mobile: click the LogOut icon button in the mobile header
      await page.locator('button').filter({ has: page.locator('svg.lucide-log-out') }).first().click();
    }

    // Should redirect to home page
    await expect(page).toHaveURL(/\/(de|en)\/?$/, { timeout: 10000 });
  });
});
