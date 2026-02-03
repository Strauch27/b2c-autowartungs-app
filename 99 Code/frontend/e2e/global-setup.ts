import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

/**
 * Playwright Global Setup
 *
 * This file runs once before all tests to:
 * 1. Create authenticated browser contexts for each user role
 * 2. Save auth states to files for reuse in tests
 * 3. Ensure backend/frontend are running
 *
 * Auth states are saved to: e2e/.auth/
 * - customer.json
 * - jockey.json
 * - workshop.json
 */

const TEST_CREDENTIALS = {
  customer: {
    email: 'kunde@test.de',
    username: null,
    password: 'password123',
    role: 'CUSTOMER'
  },
  jockey: {
    email: 'jockey@test.de',
    username: 'jockey1',
    password: 'password123',
    role: 'JOCKEY'
  },
  workshop: {
    email: 'werkstatt@test.de',
    username: 'werkstatt1',
    password: 'password123',
    role: 'WORKSHOP'
  }
};

async function globalSetup(config: FullConfig) {
  const baseURL = config.use?.baseURL || 'http://localhost:3000';
  const authDir = path.join(__dirname, '.auth');

  console.log('\n🔐 Global Setup: Creating authenticated sessions...\n');
  console.log('  ℹ️  Test users should be seeded via: npx tsx backend/prisma/seed-test-users.ts\n');
  console.log('  🔐 Authenticating users and creating session files...\n');

  const browser = await chromium.launch();

  // Step 2: Authenticate each role and save state
  const loginURLs = {
    customer: `${baseURL}/de/customer/login`,
    jockey: `${baseURL}/de/jockey/login`,
    workshop: `${baseURL}/de/workshop/login`
  };

  for (const [role, credentials] of Object.entries(TEST_CREDENTIALS)) {
    console.log(`    → Logging in as ${role}...`);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to role-specific login page
      const loginURL = loginURLs[role as keyof typeof loginURLs];
      await page.goto(loginURL, { waitUntil: 'networkidle' });

      // Wait for page to be ready
      await page.waitForTimeout(1000);

      // Fill login form based on role using data-testid
      if (role === 'customer') {
        // Customer uses email
        await page.getByTestId('customer-email-input').fill(credentials.email, { timeout: 10000 });
        await page.getByTestId('customer-password-input').fill(credentials.password);
        await page.getByTestId('customer-login-button').click();
      } else if (role === 'jockey') {
        // Jockey uses username
        await page.getByTestId('jockey-username-input').fill(credentials.username!, { timeout: 10000 });
        await page.getByTestId('jockey-password-input').fill(credentials.password);
        await page.getByTestId('jockey-login-button').click();
      } else {
        // Workshop uses username
        await page.getByTestId('workshop-username-input').fill(credentials.username!, { timeout: 10000 });
        await page.getByTestId('workshop-password-input').fill(credentials.password);
        await page.getByTestId('workshop-login-button').click();
      }

      // Wait for redirect after successful login
      try {
        await page.waitForURL(new RegExp(`/${role}/dashboard`), { timeout: 15000 });
        console.log(`      ✅ ${role} authenticated successfully`);
      } catch (e) {
        // If redirect doesn't happen, check current URL
        const currentURL = page.url();
        console.log(`      ⚠️  Current URL: ${currentURL}`);
        if (!currentURL.includes('dashboard')) {
          throw new Error(`Login failed - ended up at ${currentURL}`);
        }
      }

      // Save authenticated state
      const authFile = path.join(authDir, `${role}.json`);
      await context.storageState({ path: authFile });

      console.log(`      💾 Session saved → ${authFile}`);
    } catch (error) {
      console.error(`      ❌ Failed to authenticate ${role}:`, error);
      // Take screenshot for debugging
      await page.screenshot({ path: path.join(authDir, `${role}-login-error.png`) });
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  await browser.close();

  console.log('\n✅ Global Setup Complete: All auth states created\n');
}

export default globalSetup;
