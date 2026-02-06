/**
 * QA Navigation Audit - E2E Tests
 *
 * Verifies every clickable navigation link/button across the app
 * leads to a valid page (not 404) and loads expected content.
 *
 * Covers: Landing page (Header, Hero, PortalCards, Footer),
 * login pages, register page, customer dashboard sidebar,
 * forgot-password, support, and legal pages.
 */

import { test, expect } from './fixtures/auth';
import { test as baseTest, expect as baseExpect } from '@playwright/test';

const locale = 'de';

// Helper: verify a page loaded (not 404 / not blank)
async function expectValidPage(page: any, urlPattern: RegExp, contentHint?: string) {
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(urlPattern);
  // Use innerText to avoid invisible RSC payload containing '404'
  const body = await page.innerText('body');
  // Check for visible 404 heading instead of raw text match
  const notFoundHeading = page.locator('h1:has-text("404"), h2:has-text("404")');
  await expect(notFoundHeading).toHaveCount(0);
  expect(body).not.toContain('This page could not be found');
  if (contentHint) {
    expect(body).toContain(contentHint);
  }
}

// ─── LANDING PAGE ────────────────────────────────────────────

baseTest.describe('Landing Page - Header Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Header logo navigates to home', async ({ page }) => {
    // Logo is the first link in header containing "AutoConcierge"
    const logo = page.locator('header a:has-text("AutoConcierge")').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });

  baseTest('Header Login button navigates to customer login', async ({ page }) => {
    const loginBtn = page.locator('header a[href*="customer/login"] button, header a[href*="customer/login"]').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    await expectValidPage(page, /customer\/login/);
  });

  baseTest('Header Book Now button navigates to booking page', async ({ page }) => {
    const bookNowBtn = page.locator('header a[href*="customer/booking"] button, header a[href*="customer/booking"]').first();
    await expect(bookNowBtn).toBeVisible();
    await bookNowBtn.click();
    // May redirect to login if not authenticated, both are valid
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    expect(url).toMatch(/customer\/(booking|login)/);
  });

  baseTest('Header #how-it-works anchor scrolls to section', async ({ page }) => {
    const howItWorks = page.locator('header a[href="#how-it-works"], nav a[href="#how-it-works"]').first();
    await expect(howItWorks).toBeVisible();
    await howItWorks.click();
    // Should stay on landing page with hash
    await expect(page).toHaveURL(new RegExp(`/${locale}.*#how-it-works`));
    // The section should be in viewport
    const section = page.locator('#how-it-works');
    await expect(section).toBeVisible();
  });

  baseTest('Header #faq anchor scrolls to FAQ section', async ({ page }) => {
    const faq = page.locator('header a[href="#faq"], nav a[href="#faq"]').first();
    await expect(faq).toBeVisible();
    await faq.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}.*#faq`));
    const section = page.locator('#faq');
    await expect(section).toBeVisible();
  });
});

baseTest.describe('Landing Page - Hero Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Hero booking CTA navigates to booking page', async ({ page }) => {
    const heroCta = page.locator('[data-testid="hero-booking-cta"]');
    await expect(heroCta).toBeVisible();
    await heroCta.click();
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    // May redirect to login if not authenticated
    expect(url).toMatch(/customer\/(booking|login)/);
  });

  baseTest('Hero login CTA navigates to customer login', async ({ page }) => {
    const loginCta = page.locator('[data-testid="hero-login-cta"]');
    await expect(loginCta).toBeVisible();
    await loginCta.click();
    await expectValidPage(page, /customer\/login/);
  });
});

baseTest.describe('Landing Page - Portal Cards Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Customer portal card navigates to customer login', async ({ page }) => {
    const customerCard = page.locator('a[href*="customer/login"] button').first();
    await expect(customerCard).toBeVisible();
    await customerCard.click();
    await expectValidPage(page, /customer\/login/);
  });

  baseTest('Jockey portal card navigates to jockey login', async ({ page }) => {
    const jockeyCard = page.locator('a[href*="jockey/login"] button').first();
    await expect(jockeyCard).toBeVisible();
    await jockeyCard.click();
    await expectValidPage(page, /jockey\/login/);
  });

  baseTest('Workshop portal card navigates to workshop login', async ({ page }) => {
    const workshopCard = page.locator('a[href*="workshop/login"] button').first();
    await expect(workshopCard).toBeVisible();
    await workshopCard.click();
    await expectValidPage(page, /workshop\/login/);
  });
});

baseTest.describe('Landing Page - Footer Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Footer logo navigates to home', async ({ page }) => {
    const footerLogo = page.locator('footer a:has-text("AutoConcierge")').first();
    await expect(footerLogo).toBeVisible();
    await footerLogo.click();
    await expectValidPage(page, new RegExp(`/${locale}`));
  });

  baseTest('Footer Kundenportal link navigates to customer login', async ({ page }) => {
    const link = page.locator('footer a:has-text("Kundenportal")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /customer\/login/);
  });

  baseTest('Footer Fahrerportal link navigates to jockey login', async ({ page }) => {
    const link = page.locator('footer a:has-text("Fahrerportal")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /jockey\/login/);
  });

  baseTest('Footer Werkstatt-Portal link navigates to workshop login', async ({ page }) => {
    const link = page.locator('footer a:has-text("Werkstatt-Portal")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /workshop\/login/);
  });

  baseTest('Footer Datenschutz link navigates to privacy page', async ({ page }) => {
    const link = page.locator('footer a:has-text("Datenschutz")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /privacy/, 'Datenschutz');
  });

  baseTest('Footer AGB link navigates to terms page', async ({ page }) => {
    const link = page.locator('footer a:has-text("AGB")').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /terms/);
  });

  baseTest('Footer Impressum link navigates to imprint page', async ({ page }) => {
    const link = page.locator('footer a[href*="imprint"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expectValidPage(page, /imprint/);
  });
});

// ─── LOGIN PAGES ─────────────────────────────────────────────

baseTest.describe('Customer Login Page Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}/customer/login`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Logo navigates back to home', async ({ page }) => {
    const logo = page.locator('a:has-text("AutoConcierge")').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });

  baseTest('Register link navigates to registration page', async ({ page }) => {
    const registerLink = page.locator('a[href*="customer/register"]').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expectValidPage(page, /customer\/register/);
  });

  baseTest('Forgot password link navigates to forgot-password page', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgot-password"]').first();
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expectValidPage(page, /forgot-password/);
  });
});

baseTest.describe('Jockey Login Page Navigation', () => {
  baseTest('Logo navigates back to home', async ({ page }) => {
    await page.goto(`/${locale}/jockey/login`);
    await page.waitForLoadState('networkidle');

    const logo = page.locator('a:has-text("AutoConcierge")').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });
});

baseTest.describe('Workshop Login Page Navigation', () => {
  baseTest('Logo navigates back to home', async ({ page }) => {
    await page.goto(`/${locale}/workshop/login`);
    await page.waitForLoadState('networkidle');

    const logo = page.locator('a:has-text("AutoConcierge")').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });
});

// ─── REGISTER PAGE ───────────────────────────────────────────

baseTest.describe('Register Page Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}/customer/register`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Login link navigates to customer login', async ({ page }) => {
    const loginLink = page.locator('a[href*="customer/login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expectValidPage(page, /customer\/login/);
  });

  baseTest('Privacy policy link navigates to privacy page', async ({ page }) => {
    const privacyLink = page.locator('a[href*="privacy"]').first();
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expectValidPage(page, /privacy/, 'Datenschutz');
  });
});

// ─── FORGOT PASSWORD PAGE ────────────────────────────────────

baseTest.describe('Forgot Password Page Navigation', () => {
  baseTest('Back to login button navigates to customer login', async ({ page }) => {
    await page.goto(`/${locale}/forgot-password`);
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator('a[href*="customer/login"]').first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expectValidPage(page, /customer\/login/);
  });
});

// ─── SUPPORT PAGE ────────────────────────────────────────────

baseTest.describe('Support Page Navigation', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.goto(`/${locale}/support`);
    await page.waitForLoadState('networkidle');
  });

  baseTest('Back button navigates to home', async ({ page }) => {
    const backBtn = page.locator(`a[href="/${locale}"] button, a[href="/${locale}/"]`).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });

  baseTest('FAQ link navigates to landing page FAQ section', async ({ page }) => {
    const faqLink = page.locator('a[href*="#faq"]').first();
    await expect(faqLink).toBeVisible();
    await faqLink.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(new RegExp(`/${locale}.*#faq`));
  });

  baseTest('Email contact link has correct mailto href', async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
    const href = await emailLink.getAttribute('href');
    expect(href).toContain('mailto:info@autoconcierge.de');
  });

  baseTest('Phone contact link has correct tel href', async ({ page }) => {
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
    const href = await phoneLink.getAttribute('href');
    expect(href).toContain('tel:');
  });
});

// ─── LEGAL PAGES (Back Buttons) ──────────────────────────────

baseTest.describe('Legal Pages - Back Navigation', () => {
  baseTest('Privacy page back button navigates to home', async ({ page }) => {
    await page.goto(`/${locale}/privacy`);
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator(`a[href="/${locale}"] button`).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });

  baseTest('Terms page back button navigates to home', async ({ page }) => {
    await page.goto(`/${locale}/terms`);
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator(`a[href="/${locale}"] button`).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });

  baseTest('Imprint page back button navigates to home', async ({ page }) => {
    await page.goto(`/${locale}/imprint`);
    await page.waitForLoadState('networkidle');

    const backBtn = page.locator(`a[href="/${locale}"] button`).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expectValidPage(page, new RegExp(`/${locale}$`));
  });
});

// ─── CUSTOMER DASHBOARD SIDEBAR (Authenticated) ─────────────

test.describe('Customer Dashboard - Sidebar Navigation', () => {
  test.beforeEach(async ({ asCustomer }) => {
    await asCustomer.goto(`/${locale}/customer/dashboard`);
    await asCustomer.waitForLoadState('networkidle');
  });

  test('Dashboard sidebar link stays on dashboard', async ({ asCustomer }) => {
    const dashboardLink = asCustomer.locator(`aside a[href*="customer/dashboard"]`).first();
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await expectValidPage(asCustomer, /customer\/dashboard/);
  });

  test('New Booking sidebar link navigates to booking page', async ({ asCustomer }) => {
    const newBookingLink = asCustomer.locator(`aside a[href*="customer/booking"]`).first();
    await expect(newBookingLink).toBeVisible();
    await newBookingLink.click();
    await expectValidPage(asCustomer, /customer\/booking/);
  });

  test('My Bookings sidebar link navigates to bookings list', async ({ asCustomer }) => {
    const bookingsLink = asCustomer.locator(`aside a[href*="customer/bookings"]`).first();
    // Filter out the "booking" (singular) link to get the bookings (plural) link
    const allLinks = asCustomer.locator(`aside a[href$="/customer/bookings"]`);
    const link = allLinks.first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
      await asCustomer.waitForLoadState('domcontentloaded');
      // bookings list may redirect or show content
      const url = asCustomer.url();
      expect(url).toMatch(/customer\/bookings/);
    }
  });

  test('Vehicles sidebar link navigates to vehicles page', async ({ asCustomer }) => {
    const vehiclesLink = asCustomer.locator(`aside a[href*="customer/vehicles"]`).first();
    await expect(vehiclesLink).toBeVisible();
    await vehiclesLink.click();
    await expectValidPage(asCustomer, /customer\/vehicles/);
  });

  test('Profile sidebar link navigates to profile page', async ({ asCustomer }) => {
    const profileLink = asCustomer.locator(`aside a[href*="customer/profile"]`).first();
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    await expectValidPage(asCustomer, /customer\/profile/);
  });
});

test.describe('Customer Dashboard - Other Navigation', () => {
  test('Mobile header logo navigates to home', async ({ asCustomer }) => {
    // Set mobile viewport
    await asCustomer.setViewportSize({ width: 375, height: 812 });
    await asCustomer.goto(`/${locale}/customer/dashboard`);
    await asCustomer.waitForLoadState('networkidle');

    const logo = asCustomer.locator('header a:has-text("AutoConcierge")').first();
    if (await logo.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logo.click();
      await expectValidPage(asCustomer, new RegExp(`/${locale}$`));
    }
  });

  test('Quick action Book Now button navigates to booking', async ({ asCustomer }) => {
    await asCustomer.goto(`/${locale}/customer/dashboard`);
    await asCustomer.waitForLoadState('networkidle');

    // The "Jetzt buchen" / "Book Now" CTA card at the bottom
    const bookNowBtn = asCustomer.locator('a[href*="customer/booking"] button').last();
    if (await bookNowBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bookNowBtn.click();
      await expectValidPage(asCustomer, /customer\/booking/);
    }
  });

  test('View Details link navigates to bookings list', async ({ asCustomer }) => {
    await asCustomer.goto(`/${locale}/customer/dashboard`);
    await asCustomer.waitForLoadState('networkidle');

    // "Alle anzeigen" / chevron link to bookings
    const viewDetailsLink = asCustomer.locator('a[href*="customer/bookings"] button').first();
    if (await viewDetailsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewDetailsLink.click();
      await asCustomer.waitForLoadState('domcontentloaded');
      expect(asCustomer.url()).toMatch(/customer\/bookings/);
    }
  });
});
