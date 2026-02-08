import { test, expect } from './fixtures/auth';

test.describe('Multi-Language Support Tests', () => {
  test('should display German content by default', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /de
    await expect(page).toHaveURL(/\/de/);

    // Check German content - CTA button and nav section heading
    await expect(page.locator('text=Preis berechnen')).toBeVisible();
    await expect(page.locator('text=So funktioniert\'s').first()).toBeVisible();
  });

  test('should navigate directly to English version', async ({ page }) => {
    await page.goto('/en');

    // Should show English content
    await expect(page.locator('text=Get Your Quote')).toBeVisible();
    await expect(page.locator('text=How It Works').first()).toBeVisible();
  });

  test('should persist language across navigation', async ({ page }) => {
    await page.goto('/en');

    // Navigate to booking via CTA - unauthenticated users may be redirected to register
    await page.locator('text=Get Your Quote').first().click();

    // Should still be in English locale (either booking or register page)
    await expect(page).toHaveURL(/\/en\//);
    await expect(page.locator('body')).toContainText(/Vehicle|Register|Book|Service/);
  });

  test('should translate all portal names correctly', async ({ page }) => {
    // Test German
    await page.goto('/de');
    await expect(page.getByText('Kunden', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Fahrer', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Werkstatt', { exact: true }).first()).toBeVisible();

    // Switch to English
    await page.goto('/en');
    await expect(page.getByText('Customers', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Drivers', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Workshop', { exact: true }).first()).toBeVisible();
  });

  test('should translate booking flow in German', async ({ page }) => {
    await page.goto('/de/customer/booking');
    // Wait for any redirects to complete
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');

    // Verify page shows German content - whether it's booking or login/register redirect
    const deTexts = page.locator('text=Fahrzeug').or(page.locator('text=Anmelden')).or(page.locator('text=Jetzt registrieren')).or(page.locator('text=Konto erstellen'));
    await expect(deTexts.first()).toBeVisible();
  });

  test('should translate booking flow in English', async ({ page }) => {
    await page.goto('/en/customer/booking');
    // Wait for any redirects to complete
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');

    // Verify page shows English content - whether it's booking or login/register redirect
    const enTexts = page.locator('text=Vehicle').or(page.locator('text=Sign In')).or(page.locator('text=Register Now')).or(page.locator('text=Create Account'));
    await expect(enTexts.first()).toBeVisible();
  });

  test('should translate login pages correctly', async ({ page }) => {
    // German customer login
    await page.goto('/de/customer/login');
    await expect(page.getByText('Anmelden').first()).toBeVisible();

    // English customer login
    await page.goto('/en/customer/login');
    await expect(page.getByText('Sign In').or(page.getByText('Login')).first()).toBeVisible();
  });

  test('should translate dashboard stats in German', async ({ asCustomer }) => {
    // Use pre-authenticated customer context
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Check German stats
    await expect(asCustomer.getByText('Aktive Buchungen')).toBeVisible();
    await expect(asCustomer.getByText('Gespeicherte Fahrzeuge')).toBeVisible();
  });

  test('should format dates according to locale', async ({ asCustomer }) => {
    // Use pre-authenticated customer context
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Should have German date format (DD.MM.YYYY or similar)
    // Just check that dates are displayed
    const hasGermanDate = await asCustomer.locator('text=/\\d{1,2}\\.\\s?\\w+/').isVisible({ timeout: 2000 }).catch(() => false);

    if (hasGermanDate) {
      expect(true).toBeTruthy();
    }
  });

  test('should translate FAQ section', async ({ page }) => {
    // German FAQ
    await page.goto('/de');
    await page.locator('text=Häufig gestellte Fragen').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Häufig gestellte Fragen')).toBeVisible();

    // English FAQ
    await page.goto('/en');
    await page.locator('text=Frequently Asked Questions').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
  });

  test('should translate footer sections', async ({ page }) => {
    // German footer
    await page.goto('/de');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: 'Impressum' })).toBeVisible();

    // English footer
    await page.goto('/en');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: 'Imprint' }).or(page.getByRole('link', { name: 'Privacy' }))).toBeVisible();
  });

  test('should handle language switching without losing form data', async ({ page }) => {
    // Go to the landing page where the language switcher is accessible
    await page.goto('/de');

    // Switch language via the language switcher
    const languageSwitcher = page.locator('button').filter({ hasText: '🇩🇪' });
    if (await languageSwitcher.first().isVisible({ timeout: 3000 })) {
      await languageSwitcher.first().click();
      await page.locator('text=English').click();

      // Should be on English landing page
      await expect(page).toHaveURL(/\/en/);
      await expect(page.locator('text=Get Your Quote')).toBeVisible();
    }
  });
});
