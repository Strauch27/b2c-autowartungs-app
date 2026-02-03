import { test, expect } from '@playwright/test';
import { loginAsWorkshop, loginAsCustomer, loginAsJockey } from './helpers/auth-helpers';

/**
 * Visual Regression E2E Tests
 *
 * Screenshot comparison tests for key pages:
 * - Landing page (desktop/mobile)
 * - Login pages
 * - Dashboards
 * - Booking flow
 * - Component consistency
 *
 * These tests create baseline screenshots on first run,
 * then compare subsequent runs against the baseline.
 *
 * To update baselines: playwright test --update-snapshots
 */

test.describe('Visual Regression Tests', () => {

  // ============================================================================
  // Landing Page Screenshots
  // ============================================================================

  test.describe('Landing Page', () => {

    test('TC-VIS-001: should match landing page screenshot (desktop, DE)', async ({ page }) => {
      await page.goto('/de');
      await page.waitForLoadState('networkidle');

      // Wait for fonts and images
      await page.waitForTimeout(1000);

      // Take full page screenshot
      await expect(page).toHaveScreenshot('landing-page-de-desktop.png', {
        fullPage: true,
        timeout: 10000,
      });
    });

    test('TC-VIS-002: should match landing page screenshot (desktop, EN)', async ({ page }) => {
      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('landing-page-en-desktop.png', {
        fullPage: true,
        timeout: 10000,
      });
    });

    test('TC-VIS-003: should match landing page screenshot (mobile, DE)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('landing-page-de-mobile.png', {
        fullPage: true,
        timeout: 10000,
      });
    });

    test('TC-VIS-004: should match landing page screenshot (mobile, EN)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('landing-page-en-mobile.png', {
        fullPage: true,
        timeout: 10000,
      });
    });
  });

  // ============================================================================
  // Login Pages Screenshots
  // ============================================================================

  test.describe('Login Pages', () => {

    test('TC-VIS-005: should match workshop login screenshot (desktop)', async ({ page }) => {
      await page.goto('/de/workshop/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('workshop-login-de.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-006: should match customer login screenshot (desktop)', async ({ page }) => {
      await page.goto('/de/customer/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('customer-login-de.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-007: should match jockey login screenshot (desktop)', async ({ page }) => {
      await page.goto('/de/jockey/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('jockey-login-de.png', {
        fullPage: true,
      });
    });
  });

  // ============================================================================
  // Booking Flow Screenshots
  // ============================================================================

  test.describe('Booking Flow', () => {

    test('TC-VIS-008: should match booking step 1 - vehicle', async ({ page }) => {
      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('booking-step1-vehicle.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-009: should match booking step 2 - service selection', async ({ page }) => {
      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');

      // Complete vehicle step
      await page.locator('button:has-text("Marke")').click();
      await page.waitForTimeout(200);
      await page.locator('text=BMW').first().click();

      await page.locator('button:has-text("Modell")').click();
      await page.waitForTimeout(200);
      await page.locator('text=3er').first().click();

      await page.locator('button:has-text("Baujahr")').click();
      await page.waitForTimeout(200);
      await page.locator('text=2020').first().click();

      await page.locator('input[placeholder*="km"]').first().fill('50000');
      await page.locator('button:has-text("Weiter")').click();

      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('booking-step2-service.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-010: should match booking flow on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('booking-mobile.png', {
        fullPage: true,
      });
    });
  });

  // ============================================================================
  // Dashboard Screenshots
  // ============================================================================

  test.describe('Dashboards', () => {

    test('TC-VIS-011: should match workshop dashboard screenshot', async ({ page }) => {
      await loginAsWorkshop(page, 'de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('workshop-dashboard.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-012: should match customer dashboard screenshot', async ({ page }) => {
      await loginAsCustomer(page, 'de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('customer-dashboard.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-013: should match jockey dashboard screenshot', async ({ page }) => {
      await loginAsJockey(page, 'de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('jockey-dashboard.png', {
        fullPage: true,
      });
    });
  });

  // ============================================================================
  // Component Screenshots
  // ============================================================================

  test.describe('Components', () => {

    test('TC-VIS-014: should match dialog component screenshot', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]').first();
        await expect(dialog).toHaveScreenshot('extension-dialog.png');
      }
    });

    test('TC-VIS-015: should match table component screenshot', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const table = page.locator('table').first();
      const hasTable = await table.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTable) {
        await expect(table).toHaveScreenshot('workshop-bookings-table.png');
      }
    });

    test('TC-VIS-016: should match select dropdown screenshot', async ({ page }) => {
      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');

      await page.locator('button:has-text("Marke")').click();
      await page.waitForTimeout(300);

      const dropdown = page.locator('[role="listbox"]').first();
      await expect(dropdown).toHaveScreenshot('brand-select-dropdown.png');
    });
  });

  // ============================================================================
  // Responsive Design Screenshots
  // ============================================================================

  test.describe('Responsive Design', () => {

    const viewports = [
      { name: 'mobile-portrait', width: 375, height: 667 },
      { name: 'mobile-landscape', width: 667, height: 375 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`TC-VIS-017-${viewport.name}: should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        await page.goto('/de');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`landing-${viewport.name}.png`, {
          fullPage: false, // Just viewport for responsive tests
        });
      });
    }
  });

  // ============================================================================
  // Error State Screenshots
  // ============================================================================

  test.describe('Error States', () => {

    test('TC-VIS-018: should match login error screenshot', async ({ page }) => {
      await page.goto('/de/workshop/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input#username').fill('wrong');
      await page.locator('input#password').fill('wrong');
      await page.locator('button[type="submit"]').click();

      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('login-error-state.png', {
        fullPage: true,
      });
    });

    test('TC-VIS-019: should match form validation error screenshot', async ({ page }) => {
      await page.goto('/de/booking');

      // Try to submit without filling
      const nextButton = page.locator('button:has-text("Weiter")');

      // Fill partial data to trigger validation
      await page.locator('button:has-text("Marke")').click();
      await page.waitForTimeout(200);
      await page.locator('text=BMW').first().click();

      // Leave rest empty and try to proceed
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('booking-validation-error.png', {
        fullPage: true,
      });
    });
  });

  // ============================================================================
  // Dark Mode (if implemented)
  // ============================================================================

  test.describe('Theme Variations', () => {

    test('TC-VIS-020: should match light theme screenshot', async ({ page }) => {
      await page.goto('/de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('landing-light-theme.png', {
        fullPage: false,
      });
    });

    // If dark mode is implemented
    test.skip('TC-VIS-021: should match dark theme screenshot', async ({ page }) => {
      // Toggle dark mode
      const darkModeToggle = page.locator('[data-testid="theme-toggle"]');
      const hasToggle = await darkModeToggle.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasToggle) {
        await darkModeToggle.click();
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('landing-dark-theme.png', {
          fullPage: false,
        });
      }
    });
  });
});
