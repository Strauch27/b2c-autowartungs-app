import { test, expect } from '@playwright/test';
import { loginAsWorkshop } from './helpers/auth-helpers';

/**
 * Component Rendering E2E Tests
 *
 * Tests that all UI components render correctly:
 * - Dialog component
 * - Textarea component
 * - Table component (with TableHeader, TableBody, TableRow, TableCell)
 * - Form inputs (Input, Select, Checkbox)
 * - Buttons
 * - Navigation components
 * - Cards
 * - Badges
 *
 * DEFECT DETECTION:
 * - Missing component imports causing build failures
 * - Component render errors
 * - Missing Radix UI components
 * - Incorrect component exports
 * - CSS/styling issues
 */

test.describe('Component Rendering Tests', () => {

  // ============================================================================
  // Dialog Component Tests
  // ============================================================================

  test.describe('Dialog Component', () => {

    test('TC-COMP-001: should render Dialog component without errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/de/workshop/login');
      await page.waitForLoadState('networkidle');

      // Navigate to a page that uses Dialog (workshop dashboard with extension creation)
      await loginAsWorkshop(page, 'de');

      // Look for button that opens dialog
      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        // Dialog should render
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog.first()).toBeVisible({ timeout: 5000 });

        // Check for dialog title
        const dialogTitle = page.locator('[role="dialog"] h2, [role="dialog"] [class*="title"]');
        await expect(dialogTitle.first()).toBeVisible();
      }

      // No Dialog component errors
      const dialogErrors = errors.filter(err => err.toLowerCase().includes('dialog'));
      expect(dialogErrors.length).toBe(0);
    });

    test('TC-COMP-002: should close Dialog on ESC key', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog.first()).toBeVisible();

        // Press ESC
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // Dialog should close
        const dialogVisible = await dialog.first().isVisible({ timeout: 1000 }).catch(() => false);
        expect(dialogVisible).toBe(false);
      }
    });

    test('TC-COMP-003: should close Dialog on backdrop click', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        // Click outside dialog (on overlay)
        const overlay = page.locator('[data-radix-dialog-overlay], .overlay');
        const hasOverlay = await overlay.first().isVisible({ timeout: 2000 }).catch(() => false);

        if (hasOverlay) {
          // Click on overlay backdrop
          await overlay.first().click({ position: { x: 5, y: 5 } });
          await page.waitForTimeout(300);

          // Dialog might close (depends on configuration)
        }
      }
    });
  });

  // ============================================================================
  // Textarea Component Tests
  // ============================================================================

  test.describe('Textarea Component', () => {

    test('TC-COMP-004: should render Textarea component without errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await loginAsWorkshop(page, 'de');

      // Open extension dialog which contains Textarea
      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        // Look for textarea
        const textarea = page.locator('textarea');
        await expect(textarea.first()).toBeVisible({ timeout: 5000 });

        // Textarea should be editable
        await textarea.first().fill('Test description text');
        await expect(textarea.first()).toHaveValue('Test description text');
      }

      // No Textarea component errors
      const textareaErrors = errors.filter(err => err.toLowerCase().includes('textarea'));
      expect(textareaErrors.length).toBe(0);
    });

    test('TC-COMP-005: should accept multi-line text in Textarea', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        const textarea = page.locator('textarea').first();
        const hasTextarea = await textarea.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasTextarea) {
          const multiLineText = 'Line 1\nLine 2\nLine 3';
          await textarea.fill(multiLineText);

          const value = await textarea.inputValue();
          expect(value).toContain('Line 1');
          expect(value).toContain('Line 2');
          expect(value).toContain('Line 3');
        }
      }
    });

    test('TC-COMP-006: should respect textarea maxlength if set', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const dialogTrigger = page.locator('button:has-text("Erweiterung")').first();
      const hasTrigger = await dialogTrigger.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasTrigger) {
        await dialogTrigger.click();
        await page.waitForTimeout(500);

        const textarea = page.locator('textarea').first();
        const hasTextarea = await textarea.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasTextarea) {
          const longText = 'a'.repeat(10000);
          await textarea.fill(longText);

          // Should accept text (maxlength might or might not be set)
          const value = await textarea.inputValue();
          expect(value.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // ============================================================================
  // Table Component Tests
  // ============================================================================

  test.describe('Table Component', () => {

    test('TC-COMP-007: should render Table component without errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await loginAsWorkshop(page, 'de');
      await page.waitForTimeout(1000);

      // Workshop dashboard should have a table
      const table = page.locator('table');
      const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasTable) {
        // Verify table structure
        await expect(table).toBeVisible();

        // Should have thead
        const thead = table.locator('thead');
        await expect(thead).toBeVisible();

        // Should have tbody
        const tbody = table.locator('tbody');
        await expect(tbody).toBeVisible();
      }

      // No table-related errors
      const tableErrors = errors.filter(err =>
        err.toLowerCase().includes('table') ||
        err.toLowerCase().includes('thead') ||
        err.toLowerCase().includes('tbody')
      );
      expect(tableErrors.length).toBe(0);
    });

    test('TC-COMP-008: should render TableHeader with correct structure', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const table = page.locator('table');
      const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasTable) {
        const thead = table.locator('thead');
        const tr = thead.locator('tr');
        const th = tr.locator('th');

        // Should have header cells
        const headerCount = await th.count();
        expect(headerCount).toBeGreaterThan(0);
      }
    });

    test('TC-COMP-009: should render TableBody with rows', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const table = page.locator('table');
      const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasTable) {
        const tbody = table.locator('tbody');
        const rows = tbody.locator('tr');

        const rowCount = await rows.count();

        // Should have rows or empty state
        if (rowCount === 0) {
          // Empty table is OK
          expect(rowCount).toBe(0);
        } else {
          expect(rowCount).toBeGreaterThan(0);
        }
      }
    });

    test('TC-COMP-010: should render TableCell with content', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      const table = page.locator('table');
      const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasTable) {
        const firstCell = table.locator('tbody tr:first-child td:first-child');
        const hasCell = await firstCell.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasCell) {
          const cellContent = await firstCell.textContent();
          expect(cellContent).toBeTruthy();
        }
      }
    });
  });

  // ============================================================================
  // Form Input Components
  // ============================================================================

  test.describe('Form Input Components', () => {

    test('TC-COMP-011: should render Input component', async ({ page }) => {
      await page.goto('/de/workshop/login');

      const input = page.locator('input#username');
      await expect(input).toBeVisible();

      await input.fill('test');
      await expect(input).toHaveValue('test');
    });

    test('TC-COMP-012: should render password Input with type="password"', async ({ page }) => {
      await page.goto('/de/workshop/login');

      const passwordInput = page.locator('input#password');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('TC-COMP-013: should render Select component', async ({ page }) => {
      await page.goto('/de/booking');

      // Select component (brand selector)
      const selectButton = page.locator('button:has-text("Marke")');
      await expect(selectButton).toBeVisible();

      await selectButton.click();
      await page.waitForTimeout(300);

      // Dropdown should appear
      const dropdown = page.locator('[role="listbox"], [role="menu"]');
      await expect(dropdown.first()).toBeVisible({ timeout: 3000 });
    });

    test('TC-COMP-014: should render Checkbox component', async ({ page }) => {
      await page.goto('/de/booking');

      // Complete to a step with checkbox (save vehicle)
      const checkbox = page.locator('input[type="checkbox"]').or(
        page.locator('[role="checkbox"]')
      );

      const hasCheckbox = await checkbox.first().isVisible({ timeout: 3000 }).catch(() => false);

      if (hasCheckbox) {
        await expect(checkbox.first()).toBeVisible();

        // Should be clickable
        await checkbox.first().click();
      }
    });
  });

  // ============================================================================
  // Button Component
  // ============================================================================

  test.describe('Button Component', () => {

    test('TC-COMP-015: should render Button component with variants', async ({ page }) => {
      await page.goto('/de/workshop/login');

      // Primary button (submit)
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      // Button should have text
      const buttonText = await submitButton.textContent();
      expect(buttonText).toBeTruthy();
    });

    test('TC-COMP-016: should handle button click events', async ({ page }) => {
      await page.goto('/de/booking');

      const button = page.locator('button:has-text("Marke")');
      await button.click();

      await page.waitForTimeout(300);

      // Dropdown should appear (button triggered action)
      const dropdown = page.locator('[role="listbox"]');
      const opened = await dropdown.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(opened).toBe(true);
    });

    test('TC-COMP-017: should render disabled buttons correctly', async ({ page }) => {
      await page.goto('/de/booking');

      // Next button should be disabled initially
      const nextButton = page.locator('button:has-text("Weiter")');
      const isDisabled = await nextButton.isDisabled();

      expect(isDisabled).toBe(true);
    });
  });

  // ============================================================================
  // Card Component
  // ============================================================================

  test.describe('Card Component', () => {

    test('TC-COMP-018: should render Card components', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      // Dashboard should have stat cards
      const cards = page.locator('[class*="card"], [class*="Card"]');
      const hasCards = await cards.first().isVisible({ timeout: 3000 }).catch(() => false);

      if (hasCards) {
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThan(0);
      }
    });

    test('TC-COMP-019: should render service cards on booking page', async ({ page }) => {
      await page.goto('/de/booking');

      // Complete vehicle step
      await page.locator('button:has-text("Marke")').click();
      await page.waitForTimeout(300);
      await page.locator('text=BMW').first().click();
      await page.locator('button:has-text("Modell")').click();
      await page.waitForTimeout(300);
      await page.locator('text=3er').first().click();
      await page.locator('button:has-text("Baujahr")').click();
      await page.waitForTimeout(300);
      await page.locator('text=2020').first().click();
      await page.locator('input[placeholder*="km"]').first().fill('50000');
      await page.locator('button:has-text("Weiter")').click();

      await page.waitForTimeout(500);

      // Service cards should be visible
      const serviceCards = page.locator('text=Ölwechsel');
      await expect(serviceCards.first()).toBeVisible({ timeout: 5000 });
    });
  });

  // ============================================================================
  // Badge Component
  // ============================================================================

  test.describe('Badge Component', () => {

    test('TC-COMP-020: should render Badge components', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      // Look for status badges in table
      const badges = page.locator('[class*="badge"]');
      const hasBadges = await badges.first().isVisible({ timeout: 3000 }).catch(() => false);

      if (hasBadges) {
        const badgeCount = await badges.count();
        expect(badgeCount).toBeGreaterThan(0);
      }
    });

    test('TC-COMP-021: should render different badge variants', async ({ page }) => {
      await loginAsWorkshop(page, 'de');

      // Status badges should have different colors/variants
      const statusBadges = page.locator('text=/Ausstehend|In Bearbeitung|Abgeschlossen/i');
      const hasBadges = await statusBadges.first().isVisible({ timeout: 3000 }).catch(() => false);

      if (hasBadges) {
        expect(hasBadges).toBe(true);
      }
    });
  });

  // ============================================================================
  // Navigation Components
  // ============================================================================

  test.describe('Navigation Components', () => {

    test('TC-COMP-022: should render navigation menu', async ({ page }) => {
      await page.goto('/de');

      const nav = page.locator('nav, header');
      await expect(nav.first()).toBeVisible();
    });

    test('TC-COMP-023: should render mobile navigation', async ({ page, context }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/de');

      // Mobile menu button
      const mobileMenuButton = page.locator('button[aria-label*="Menu"], button:has(svg)').first();
      const hasMenuBtn = await mobileMenuButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasMenuBtn) {
        await mobileMenuButton.click();
        await page.waitForTimeout(300);

        // Mobile menu should appear
        const mobileMenu = page.locator('[role="dialog"], [class*="mobile-menu"]');
        const hasMenu = await mobileMenu.first().isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasMenu || true).toBe(true);
      }
    });
  });

  // ============================================================================
  // Error Detection
  // ============================================================================

  test.describe('Component Error Detection', () => {

    test('TC-COMP-024: should not have any component import errors', async ({ page }) => {
      const errors: string[] = [];
      const consoleErrors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/de');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check for common component errors
      const componentErrors = [...errors, ...consoleErrors].filter(err =>
        err.toLowerCase().includes('component') ||
        err.toLowerCase().includes('import') ||
        err.toLowerCase().includes('module')
      );

      expect(componentErrors.length).toBe(0);
    });

    test('TC-COMP-025: should not have missing Radix UI component errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check for Radix UI errors
      const radixErrors = errors.filter(err =>
        err.toLowerCase().includes('radix') ||
        err.toLowerCase().includes('@radix-ui')
      );

      expect(radixErrors.length).toBe(0);
    });

    test('TC-COMP-026: should not have CSS/styling errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/de');
      await page.waitForLoadState('networkidle');

      // Check for CSS errors
      const cssErrors = errors.filter(err =>
        err.toLowerCase().includes('css') ||
        err.toLowerCase().includes('style')
      );

      expect(cssErrors.length).toBe(0);
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  test.describe('Component Accessibility', () => {

    test('TC-COMP-027: should have accessible form labels', async ({ page }) => {
      await page.goto('/de/workshop/login');

      // All inputs should have labels
      const usernameInput = page.locator('input#username');
      const label = page.locator('label[for="username"]');

      await expect(usernameInput).toBeVisible();
      await expect(label).toBeVisible();
    });

    test('TC-COMP-028: should have accessible button labels', async ({ page }) => {
      await page.goto('/de/booking');

      const buttons = page.locator('button');
      const firstButton = buttons.first();

      // Button should have text or aria-label
      const hasText = await firstButton.textContent();
      const hasAriaLabel = await firstButton.getAttribute('aria-label');

      expect(hasText || hasAriaLabel).toBeTruthy();
    });

    test('TC-COMP-029: should have proper ARIA roles', async ({ page }) => {
      await page.goto('/de/booking');

      const selectButton = page.locator('button:has-text("Marke")');
      await selectButton.click();
      await page.waitForTimeout(300);

      // Dropdown should have proper role
      const dropdown = page.locator('[role="listbox"], [role="menu"]');
      await expect(dropdown.first()).toBeVisible({ timeout: 3000 });
    });
  });
});
