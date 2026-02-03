/**
 * Authentication Helper Functions
 *
 * Reusable authentication utilities for E2E tests.
 */

import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

/**
 * Login as workshop user
 */
export async function loginAsWorkshop(
  page: Page,
  locale: 'de' | 'en' = 'de',
  credentials = TEST_USERS.workshop
) {
  await page.goto(`/${locale}/workshop/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form using data-testid for stability
  await page.getByTestId('workshop-username-input').fill(credentials.username);
  await page.getByTestId('workshop-password-input').fill(credentials.password);

  // Submit form
  await page.getByTestId('workshop-login-button').click();

  // Wait for redirect to dashboard
  await page.waitForURL(`**/${locale}/workshop/dashboard`, { timeout: 10000 });
  await expect(page).toHaveURL(new RegExp(`/${locale}/workshop/dashboard`));
}

/**
 * Login as jockey user
 */
export async function loginAsJockey(
  page: Page,
  locale: 'de' | 'en' = 'de',
  credentials = TEST_USERS.jockey
) {
  await page.goto(`/${locale}/jockey/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form using data-testid for stability
  await page.getByTestId('jockey-username-input').fill(credentials.username);
  await page.getByTestId('jockey-password-input').fill(credentials.password);

  // Submit form
  await page.getByTestId('jockey-login-button').click();

  // Wait for redirect to dashboard
  await page.waitForURL(`**/${locale}/jockey/dashboard`, { timeout: 10000 });
  await expect(page).toHaveURL(new RegExp(`/${locale}/jockey/dashboard`));
}

/**
 * Login as customer user
 */
export async function loginAsCustomer(
  page: Page,
  locale: 'de' | 'en' = 'de',
  credentials = TEST_USERS.customer
) {
  await page.goto(`/${locale}/customer/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form using data-testid for stability
  await page.getByTestId('customer-email-input').fill(credentials.email);
  await page.getByTestId('customer-password-input').fill(credentials.password);

  // Submit form
  await page.getByTestId('customer-login-button').click();

  // Wait for redirect to dashboard
  await page.waitForURL(`**/${locale}/customer/dashboard`, { timeout: 10000 });
  await expect(page).toHaveURL(new RegExp(`/${locale}/customer/dashboard`));
}

/**
 * Logout from any portal
 */
export async function logout(page: Page) {
  // Look for logout button (could be in dropdown, nav, etc.)
  const logoutButton = page.locator('button:has-text("Abmelden"), button:has-text("Logout")');

  // If logout is in a dropdown menu, open it first
  const profileButton = page.locator('button:has-text("Profil"), [data-testid="profile-menu"]');
  if (await profileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await profileButton.click();
  }

  // Click logout
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
  }

  // Wait for redirect to home or login
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for common authenticated UI elements
  const logoutButton = page.locator('button:has-text("Abmelden"), button:has-text("Logout")');
  const profileMenu = page.locator('[data-testid="profile-menu"], button:has-text("Profil")');

  const hasLogout = await logoutButton.isVisible({ timeout: 2000 }).catch(() => false);
  const hasProfile = await profileMenu.isVisible({ timeout: 2000 }).catch(() => false);

  return hasLogout || hasProfile;
}

/**
 * Verify login error message is displayed
 */
export async function expectLoginError(page: Page, locale: 'de' | 'en' = 'de') {
  const errorMessage = locale === 'de'
    ? /fehlgeschlagen|ungültig|falsch/i
    : /failed|invalid|incorrect/i;

  await expect(page.locator(`text=${errorMessage}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Clear all authentication data
 */
export async function clearAuth(page: Page) {
  // Clear cookies
  await page.context().clearCookies();

  // Only clear localStorage if on a valid page (not about:blank)
  try {
    if (page.url() && !page.url().startsWith('about:')) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  } catch (e) {
    // Ignore SecurityError on about:blank
  }
}
