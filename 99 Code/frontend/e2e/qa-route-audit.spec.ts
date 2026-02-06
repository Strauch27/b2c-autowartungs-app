/**
 * QA Route Audit - 404 Error Detection
 *
 * Systematically visits every frontend route (both /de and /en locale)
 * and verifies:
 * - No 404 / "not found" page
 * - Page has visible content (not blank)
 * - No crash / error boundary
 *
 * Routes are grouped by access level:
 * - Public: accessible without auth
 * - Customer: requires customer auth
 * - Jockey: requires jockey auth
 * - Workshop: requires workshop auth
 * - Admin: requires admin-level access
 */

import { test, expect } from './fixtures/auth';
import { test as baseTest } from '@playwright/test';
import { ApiHelper } from './helpers/api-helpers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOCALES = ['de', 'en'] as const;

/**
 * Assert that a loaded page is NOT a 404 and has real content.
 */
async function assertNotFound(page: any) {
  // Use innerText instead of textContent to avoid invisible RSC payload fragments
  const bodyText = await page.innerText('body');

  // Must have some content
  expect(bodyText?.trim().length).toBeGreaterThan(0);

  // Must not contain typical Next.js 404 indicators (visible text only)
  const lower = (bodyText || '').toLowerCase();
  expect(lower).not.toContain('this page could not be found');
  expect(lower).not.toContain('seite nicht gefunden');
  expect(lower).not.toContain('page not found');

  // Check for a visible 404 heading (not hidden RSC payload)
  const notFoundHeading = page.locator('h1:has-text("404"), h2:has-text("404")');
  await expect(notFoundHeading).toHaveCount(0);
}

/**
 * Assert page loaded without a React error boundary crash.
 */
async function assertNoCrash(page: any) {
  const bodyText = ((await page.innerText('body')) || '').toLowerCase();
  expect(bodyText).not.toContain('application error');
  expect(bodyText).not.toContain('unhandled runtime error');
  expect(bodyText).not.toContain('an error occurred');
}

// ---------------------------------------------------------------------------
// 1. Public Routes (no auth required)
// ---------------------------------------------------------------------------

baseTest.describe('Public Routes - No Auth', () => {
  for (const locale of LOCALES) {
    baseTest.describe(`Locale: ${locale}`, () => {

      baseTest(`Landing page /${locale}`, async ({ page }) => {
        await page.goto(`/${locale}`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Privacy page /${locale}/privacy`, async ({ page }) => {
        await page.goto(`/${locale}/privacy`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Terms page /${locale}/terms`, async ({ page }) => {
        await page.goto(`/${locale}/terms`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Imprint page /${locale}/imprint`, async ({ page }) => {
        await page.goto(`/${locale}/imprint`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Support page /${locale}/support`, async ({ page }) => {
        await page.goto(`/${locale}/support`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Forgot password /${locale}/forgot-password`, async ({ page }) => {
        await page.goto(`/${locale}/forgot-password`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Customer login /${locale}/customer/login`, async ({ page }) => {
        await page.goto(`/${locale}/customer/login`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Customer register /${locale}/customer/register`, async ({ page }) => {
        await page.goto(`/${locale}/customer/register`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Jockey login /${locale}/jockey/login`, async ({ page }) => {
        await page.goto(`/${locale}/jockey/login`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Workshop login /${locale}/workshop/login`, async ({ page }) => {
        await page.goto(`/${locale}/workshop/login`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Guest Booking Routes (no auth, public booking flow)
// ---------------------------------------------------------------------------

baseTest.describe('Guest Booking Routes - No Auth', () => {
  for (const locale of LOCALES) {
    baseTest.describe(`Locale: ${locale}`, () => {

      baseTest(`Guest booking start /${locale}/booking`, async ({ page }) => {
        await page.goto(`/${locale}/booking`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Guest booking register /${locale}/booking/register`, async ({ page }) => {
        await page.goto(`/${locale}/booking/register`);
        await page.waitForLoadState('domcontentloaded');
        await assertNotFound(page);
        await assertNoCrash(page);
      });

      baseTest(`Guest booking success /${locale}/booking/success`, async ({ page }) => {
        await page.goto(`/${locale}/booking/success`);
        await page.waitForLoadState('domcontentloaded');
        // Success page may redirect if no booking context, but should not 404
        await assertNoCrash(page);
        const bodyText = ((await page.textContent('body')) || '').toLowerCase();
        expect(bodyText).not.toContain('this page could not be found');
        expect(bodyText).not.toContain('page not found');
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Customer Protected Routes (requires customer auth)
// ---------------------------------------------------------------------------

test.describe('Customer Protected Routes', () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {

      test(`Customer dashboard /${locale}/customer/dashboard`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/dashboard`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer notifications /${locale}/customer/notifications`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/notifications`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer profile /${locale}/customer/profile`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/profile`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer vehicles /${locale}/customer/vehicles`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/vehicles`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer booking start /${locale}/customer/booking`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer booking service /${locale}/customer/booking/service`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking/service`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer booking service demo /${locale}/customer/booking/service/demo`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking/service/demo`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer booking appointment /${locale}/customer/booking/appointment`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking/appointment`);
        await asCustomer.waitForLoadState('domcontentloaded');
        await assertNotFound(asCustomer);
        await assertNoCrash(asCustomer);
      });

      test(`Customer booking payment /${locale}/customer/booking/payment`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking/payment`);
        await asCustomer.waitForLoadState('domcontentloaded');
        // Payment page may redirect without booking context, but should not 404
        await assertNoCrash(asCustomer);
        const bodyText = ((await asCustomer.textContent('body')) || '').toLowerCase();
        expect(bodyText).not.toContain('this page could not be found');
        expect(bodyText).not.toContain('page not found');
      });

      test(`Customer booking confirmation /${locale}/customer/booking/confirmation`, async ({ asCustomer }) => {
        await asCustomer.goto(`/${locale}/customer/booking/confirmation`);
        await asCustomer.waitForLoadState('domcontentloaded');
        // Confirmation page may redirect without booking context, but should not 404
        await assertNoCrash(asCustomer);
        const bodyText = ((await asCustomer.textContent('body')) || '').toLowerCase();
        expect(bodyText).not.toContain('this page could not be found');
        expect(bodyText).not.toContain('page not found');
      });

      test(`Customer booking detail (dynamic) /${locale}/customer/bookings/[id]`, async ({ asCustomer }) => {
        // First, try to get an existing booking via API
        const api = new ApiHelper();
        let bookingId: string | null = null;

        try {
          await api.login('customer');
          const bookings = await api.getBookings();
          if (bookings && bookings.length > 0) {
            bookingId = bookings[0].id || bookings[0].bookingId;
          }
        } catch {
          // API may not be available; fall back to a placeholder ID
        }

        if (bookingId) {
          await asCustomer.goto(`/${locale}/customer/bookings/${bookingId}`);
          await asCustomer.waitForLoadState('domcontentloaded');
          await assertNotFound(asCustomer);
          await assertNoCrash(asCustomer);
        } else {
          // Use a fake UUID -- the page should show "not found" for invalid booking,
          // but should not be a framework-level 404
          await asCustomer.goto(`/${locale}/customer/bookings/00000000-0000-0000-0000-000000000001`);
          await asCustomer.waitForLoadState('domcontentloaded');
          await assertNoCrash(asCustomer);
          // The route itself should exist (not a Next.js 404)
          const bodyText = ((await asCustomer.textContent('body')) || '').toLowerCase();
          expect(bodyText).not.toContain('this page could not be found');
        }
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Jockey Protected Routes
// ---------------------------------------------------------------------------

test.describe('Jockey Protected Routes', () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {

      test(`Jockey dashboard /${locale}/jockey/dashboard`, async ({ asJockey }) => {
        await asJockey.goto(`/${locale}/jockey/dashboard`);
        await asJockey.waitForLoadState('domcontentloaded');
        await assertNotFound(asJockey);
        await assertNoCrash(asJockey);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Workshop Protected Routes
// ---------------------------------------------------------------------------

test.describe('Workshop Protected Routes', () => {
  for (const locale of LOCALES) {
    test.describe(`Locale: ${locale}`, () => {

      test(`Workshop dashboard /${locale}/workshop/dashboard`, async ({ asWorkshop }) => {
        await asWorkshop.goto(`/${locale}/workshop/dashboard`);
        await asWorkshop.waitForLoadState('domcontentloaded');
        await assertNotFound(asWorkshop);
        await assertNoCrash(asWorkshop);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 6. Admin Routes
// ---------------------------------------------------------------------------

baseTest.describe('Admin Routes', () => {
  for (const locale of LOCALES) {
    baseTest.describe(`Locale: ${locale}`, () => {

      baseTest(`Admin analytics /${locale}/admin/analytics`, async ({ page }) => {
        // Admin page may require auth or may be publicly accessible
        // Either way, the route should exist and not 404
        await page.goto(`/${locale}/admin/analytics`);
        await page.waitForLoadState('domcontentloaded');
        await assertNoCrash(page);
        const bodyText = ((await page.textContent('body')) || '').toLowerCase();
        expect(bodyText).not.toContain('this page could not be found');
        expect(bodyText).not.toContain('page not found');
      });
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Root Redirect
// ---------------------------------------------------------------------------

baseTest.describe('Root Redirect', () => {
  baseTest('Root / redirects to a locale', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Should redirect to /de or /en (or the landing page)
    const url = page.url();
    const isLocaleRedirect = /\/(de|en)(\/|$)/.test(url);
    expect(isLocaleRedirect).toBe(true);

    await assertNoCrash(page);
  });
});
