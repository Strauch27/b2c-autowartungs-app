import { test, expect } from '@playwright/test';

test.describe('Landing Page Tests', () => {
  test('should load landing page in German', async ({ page }) => {
    await page.goto('/de');

    // Check header is visible
    await expect(page.locator('header')).toBeVisible();

    // Check logo/brand name
    await expect(page.locator('text=AutoConcierge')).toBeVisible();

    // Check navigation items
    await expect(page.locator('text=Wie funktioniert es')).toBeVisible();
    await expect(page.locator('text=FAQ')).toBeVisible();
    await expect(page.locator('text=Anmelden')).toBeVisible();

    // Check hero section
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Jetzt buchen')).toBeVisible();
  });

  test('should switch language from German to English', async ({ page }) => {
    await page.goto('/de');

    // Find and click language switcher
    const languageSwitcher = page.locator('button:has-text("🇩🇪")').or(page.locator('button:has(svg)').filter({ hasText: '🇩🇪' }));
    await languageSwitcher.first().click();

    // Click English option
    await page.locator('text=English').click();

    // Verify URL changed to /en
    await expect(page).toHaveURL(/\/en/);

    // Verify English content
    await expect(page.locator('text=How it works')).toBeVisible();
    await expect(page.locator('text=Book now')).toBeVisible();
  });

  test('should display all portal cards', async ({ page }) => {
    await page.goto('/de');

    // Scroll to portals section
    await page.locator('text=Für Kunden').scrollIntoViewIfNeeded();

    // Check all three portals are visible
    await expect(page.locator('text=Für Kunden')).toBeVisible();
    await expect(page.locator('text=Für Jockeys')).toBeVisible();
    await expect(page.locator('text=Für Werkstätten')).toBeVisible();
  });

  test('should display value propositions', async ({ page }) => {
    await page.goto('/de');

    // Scroll to values section
    await page.locator('text=Festpreis-Garantie').scrollIntoViewIfNeeded();

    // Check value propositions
    await expect(page.locator('text=Festpreis-Garantie')).toBeVisible();
    await expect(page.locator('text=Zertifizierte Werkstätten')).toBeVisible();
    await expect(page.locator('text=Hol- & Bringservice')).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/de');

    // Scroll to FAQ
    await page.locator('text=Häufig gestellte Fragen').scrollIntoViewIfNeeded();

    // Check FAQ is visible
    await expect(page.locator('text=Häufig gestellte Fragen')).toBeVisible();

    // Click first FAQ item
    const firstFaq = page.locator('[data-state="closed"]').first();
    if (await firstFaq.isVisible()) {
      await firstFaq.click();
      // Check that content expanded
      await expect(page.locator('[data-state="open"]')).toBeVisible();
    }
  });

  test('should navigate to booking page from CTA button', async ({ page }) => {
    await page.goto('/de');

    // Click main CTA button
    await page.locator('text=Jetzt buchen').first().click();

    // Should navigate to booking page
    await expect(page).toHaveURL(/\/de\/booking/);
  });
});
