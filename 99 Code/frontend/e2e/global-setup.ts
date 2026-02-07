import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

const API_URL = process.env.PLAYWRIGHT_API_URL || process.env.API_URL || 'http://localhost:5002';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function globalSetup(config: FullConfig) {
  const baseURL = (config as any).use?.baseURL || BASE_URL;
  const authDir = path.join(__dirname, '.auth');

  console.log('\n🔐 Global Setup: API-based auth token generation\n');

  // 1. Reset the database (best effort - warn if fails)
  try {
    const resetRes = await fetch(`${API_URL}/api/test/reset`, { method: 'POST' });
    if (!resetRes.ok) {
      console.warn(`  ⚠️  DB reset failed (${resetRes.status}). Tests may use stale data.`);
    } else {
      console.log('  ✅ Database reset and seeded');
    }
  } catch {
    console.warn('  ⚠️  Could not reach test reset endpoint. Running against existing data.');
  }

  // 2. Get tokens for each role and save authenticated browser state
  const roles = ['CUSTOMER', 'JOCKEY', 'WORKSHOP'] as const;
  const browser = await chromium.launch();

  for (const role of roles) {
    const roleLower = role.toLowerCase();
    try {
      const tokenRes = await fetch(`${API_URL}/api/test/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!tokenRes.ok) {
        console.error(`  ❌ Failed to get token for ${role}: ${tokenRes.status}`);
        continue;
      }

      const { token } = await tokenRes.json();

      // Create browser context, inject token into localStorage, save state
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(baseURL);
      await page.evaluate((t) => localStorage.setItem('auth_token', t), token);

      // Navigate to role dashboard to verify auth works
      await page.goto(`${baseURL}/de/${roleLower}/dashboard`);
      await page.waitForLoadState('networkidle');

      // Save authenticated state
      const authFile = path.join(authDir, `${roleLower}.json`);
      await context.storageState({ path: authFile });
      console.log(`  ✅ Auth state saved for ${role} → ${authFile}`);

      await context.close();
    } catch (e) {
      console.error(`  ❌ Failed to setup auth for ${role}:`, e);
    }
  }

  await browser.close();

  console.log('\n✅ Global Setup Complete: All auth states created\n');
}

export default globalSetup;
