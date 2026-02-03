import { test as base } from '@playwright/test';
import path from 'path';

/**
 * Auth Fixtures for E2E Tests
 *
 * Provides pre-authenticated browser contexts for each user role:
 * - asCustomer: Authenticated as customer
 * - asJockey: Authenticated as jockey driver
 * - asWorkshop: Authenticated as workshop staff
 *
 * Usage:
 * ```typescript
 * import { test } from './fixtures/auth';
 *
 * test('Customer views bookings', async ({ asCustomer }) => {
 *   await asCustomer.goto('/de/customer/dashboard');
 *   // Already authenticated!
 * });
 * ```
 */

type AuthFixtures = {
  asCustomer: any;
  asJockey: any;
  asWorkshop: any;
};

export const test = base.extend<AuthFixtures>({
  asCustomer: async ({ browser }, use) => {
    const authFile = path.join(__dirname, '..', '.auth', 'customer.json');
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  },

  asJockey: async ({ browser }, use) => {
    const authFile = path.join(__dirname, '..', '.auth', 'jockey.json');
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  },

  asWorkshop: async ({ browser }, use) => {
    const authFile = path.join(__dirname, '..', '.auth', 'workshop.json');
    const context = await browser.newContext({ storageState: authFile });
    const page = await context.newPage();
    await use(page);
    await page.close();
    await context.close();
  },
});

export { expect } from '@playwright/test';
