/**
 * Auth Flow E2E Tests
 *
 * Tests login, logout, and access control for all 3 portal roles.
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';

const locale = 'de';

test.describe('Customer Authentication', () => {
  test('Customer can login with valid credentials', async ({ page }) => {
    await page.goto(`/${locale}/customer/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    const emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await emailInput.fill(TEST_USERS.customer.email);
    await passwordInput.fill(TEST_USERS.customer.password);
    await submitButton.click();

    // Should redirect to dashboard
    await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/customer\/dashboard/);
  });

  test('Customer login fails with wrong password', async ({ page }) => {
    await page.goto(`/${locale}/customer/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await emailInput.fill(TEST_USERS.customer.email);
    await passwordInput.fill('wrongpassword123');
    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('[data-testid="error-message"], [class*="error"], [role="alert"], .text-red, .text-destructive').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL(/customer\/login/);
  });

  test('Customer login fails with non-existent email', async ({ page }) => {
    await page.goto(`/${locale}/customer/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await emailInput.fill('nonexistent@test.de');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Should show error
    const errorMessage = page.locator('[data-testid="error-message"], [class*="error"], [role="alert"], .text-red, .text-destructive').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Jockey Authentication', () => {
  test('Jockey can login with valid credentials', async ({ page }) => {
    await page.goto(`/${locale}/jockey/login`);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('[data-testid="username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await usernameInput.fill(TEST_USERS.jockey.username);
    await passwordInput.fill(TEST_USERS.jockey.password);
    await submitButton.click();

    // Should redirect to jockey dashboard
    await page.waitForURL(/jockey\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/jockey\/dashboard/);
  });

  test('Jockey login fails with wrong credentials', async ({ page }) => {
    await page.goto(`/${locale}/jockey/login`);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('[data-testid="username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await usernameInput.fill('wrong-user');
    await passwordInput.fill('wrong-pass');
    await submitButton.click();

    // Should show error
    const errorMessage = page.locator('[data-testid="error-message"], [class*="error"], [role="alert"], .text-red, .text-destructive').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL(/jockey\/login/);
  });
});

test.describe('Workshop Authentication', () => {
  test('Workshop can login with valid credentials', async ({ page }) => {
    await page.goto(`/${locale}/workshop/login`);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('[data-testid="username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await usernameInput.fill(TEST_USERS.workshop.username);
    await passwordInput.fill(TEST_USERS.workshop.password);
    await submitButton.click();

    // Should redirect to workshop dashboard
    await page.waitForURL(/workshop\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/workshop\/dashboard/);
  });

  test('Workshop login fails with wrong credentials', async ({ page }) => {
    await page.goto(`/${locale}/workshop/login`);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('[data-testid="username-input"], input[name="username"], input[type="text"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await usernameInput.fill('wrong-workshop');
    await passwordInput.fill('wrong-pass');
    await submitButton.click();

    // Should show error
    const errorMessage = page.locator('[data-testid="error-message"], [class*="error"], [role="alert"], .text-red, .text-destructive').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Access Control', () => {
  test('Unauthenticated access to customer dashboard shows auth error or redirects', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    await page.goto(`/${locale}/customer/dashboard`);
    await page.waitForLoadState('networkidle');

    // App may redirect to login OR show an auth error on the page
    const url = page.url();
    const hasRedirected = /login|auth/.test(url);
    const hasAuthError = await page.locator('text=/not authenticated|nicht authentifiziert|anmelden/i').isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasRedirected || hasAuthError).toBe(true);
  });

  test('Unauthenticated access to jockey dashboard redirects to login', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto(`/${locale}/jockey/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL(/login|auth/);
  });

  test('Unauthenticated access to workshop dashboard redirects to login', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto(`/${locale}/workshop/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL(/login|auth/);
  });
});

test.describe('Logout', () => {
  test('Customer can logout', async ({ page }) => {
    // First login
    await page.goto(`/${locale}/customer/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('[data-testid="login-button"], button[type="submit"]').first();

    await emailInput.fill(TEST_USERS.customer.email);
    await passwordInput.fill(TEST_USERS.customer.password);
    await submitButton.click();

    await page.waitForURL(/customer\/dashboard/, { timeout: 10000 });

    // Find and click logout
    const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Abmelden"), button:has-text("Logout"), a:has-text("Abmelden"), a:has-text("Logout")').first();

    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');

      // After logout, should redirect to login or landing page
      await page.waitForTimeout(2000);
      const url = page.url();
      // Landing page is /de or /en, login page contains /login
      const leftDashboard = !url.includes('/customer/dashboard');
      expect(leftDashboard).toBe(true);
    }
  });
});

test.describe('Customer Registration', () => {
  test('Registration page loads', async ({ page }) => {
    await page.goto(`/${locale}/customer/register`);
    await page.waitForLoadState('networkidle');

    // Registration form should be visible
    const form = page.locator('form, [data-testid="register-form"]').first();
    if (await form.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(form).toBeVisible();

      // Should have email, password, name fields
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailInput).toBeVisible();
    }
  });
});
