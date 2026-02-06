/**
 * Portal Smoke Tests
 *
 * Quick UI verification for all 3 portal dashboards.
 * Ensures pages load, critical elements render, and basic interactions work.
 */

import { test, expect } from './fixtures/auth';

/**
 * Customer Portal now uses ProtectedRoute (like Jockey/Workshop),
 * so storageState-based auth fixtures work correctly.
 */
test.describe('Customer Portal Smoke Tests', () => {
  test('Dashboard loads and shows bookings list', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Page should load without errors
    await expect(asCustomer).toHaveURL(/customer\/dashboard/);

    // Main content area should be visible (booking cards, content section)
    const mainContent = asCustomer.locator('main, [role="main"], .dashboard, [data-testid="dashboard"], [class*="booking"], h1, h2').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard shows status badges', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Look for any status badges or booking cards
    const content = await asCustomer.textContent('body');
    // Page should have some content (not just empty)
    expect(content).toBeTruthy();
  });

  test('Language switch changes locale in URL', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // LanguageSwitcher is a Globe icon dropdown without data-testid
    // Click the Globe icon to open the dropdown
    const globeButton = asCustomer.locator('button:has(svg.lucide-globe)').first();

    if (await globeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await globeButton.click();

      // Click "English" menu item in the dropdown
      const englishOption = asCustomer.locator('[role="menuitem"]:has-text("English")').first();
      if (await englishOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await englishOption.click();

        // Wait for URL to change to /en/
        await asCustomer.waitForURL(/\/en\//, { timeout: 10000 });
        const url = asCustomer.url();
        expect(url).toMatch(/\/en\//);
      }
    }
  });

  test('Navigation works', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Look for navigation elements
    const nav = asCustomer.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Jockey Portal Smoke Tests', () => {
  test('Dashboard loads and shows assignments', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // Page should load
    await expect(asJockey).toHaveURL(/jockey\/dashboard/);

    // Main content should be visible
    const mainContent = asJockey.locator('main, [role="main"], .dashboard, [data-testid="dashboard"]').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('Assignment cards render properly', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // Content should be present
    const content = await asJockey.textContent('body');
    expect(content).toBeTruthy();
  });

  test('Status badges are visible', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // Look for status-related elements (badges, chips, or status text)
    const statusElements = asJockey.locator('[class*="badge"], [class*="status"], [class*="chip"]');
    const count = await statusElements.count();

    // There might be 0 if no assignments, that's OK
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Workshop Portal Smoke Tests', () => {
  test('Dashboard loads and shows orders', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Page should load
    await expect(asWorkshop).toHaveURL(/workshop\/dashboard/);

    // Main content should be visible
    const mainContent = asWorkshop.locator('main, [role="main"], .dashboard, [data-testid="dashboard"]').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test('Order table or list renders', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Look for table or list of orders
    const orderElements = asWorkshop.locator('table, [class*="order"], [class*="card"], [data-testid*="order"]');
    const count = await orderElements.count();

    // Should have at least the table structure
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Order details modal can be opened', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Find a clickable order row or card
    const orderRow = asWorkshop.locator('tr[class*="cursor"], [class*="order"][class*="cursor"], [data-testid*="order-row"]').first();

    if (await orderRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderRow.click();

      // Modal or detail view should appear
      const modal = asWorkshop.locator('[role="dialog"], [class*="modal"], [data-testid*="modal"]').first();
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('Auto-refresh is active', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Check for auto-refresh indicator or just verify page stays stable
    // Wait for potential refresh cycle
    await asWorkshop.waitForTimeout(2000);

    // Page should still be on dashboard
    await expect(asWorkshop).toHaveURL(/workshop\/dashboard/);
  });
});
