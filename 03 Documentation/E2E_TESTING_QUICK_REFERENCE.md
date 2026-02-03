# E2E Testing Quick Reference Guide
## B2C Autowartungs-App

**Last Updated:** February 1, 2026
**Playwright Version:** 1.x
**Test Framework:** Playwright Test

---

## Quick Start

### Prerequisites
```bash
# Install dependencies
cd "/Users/stenrauch/Documents/B2C App v2/99 Code/frontend"
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests with UI (visual)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/00-quick-smoke-test.spec.ts

# Run tests matching pattern
npx playwright test customer

# Debug mode (with inspector)
npx playwright test --debug

# Run in specific browser
npx playwright test --project=chromium-desktop
```

### Viewing Results

```bash
# Open HTML report
npx playwright show-report

# View trace for failed test
npx playwright show-trace test-results/[test-name]/trace.zip

# View screenshot
open test-results/[test-name]/test-failed-1.png

# View video
open test-results/[test-name]/video.webm
```

---

## Test Files Overview

```
/Users/stenrauch/Documents/B2C App v2/99 Code/frontend/e2e/

✅ 00-quick-smoke-test.spec.ts       # 5 tests - ALL PASSING
   - Homepage loads
   - Booking page navigation
   - Login pages
   - Multi-language switching

⚠️ 04-jockey-portal.spec.ts          # 6 tests - 1/6 PASSING
   - Jockey login
   - Dashboard display
   - Assignments view
   - Navigation buttons

⚠️ 07-extension-approval-flow.spec.ts # 15 tests - 8/15 PASSING
   - Notification center
   - Extension creation
   - Approval modal
   - Payment integration

⚠️ 09-complete-e2e-journey.spec.ts   # 48 tests - 21/48 PASSING
   - Full customer journey
   - Jockey workflow
   - Workshop operations
   - Extension approval E2E
   - Payment flows
   - Status transitions

📁 fixtures/
   └── test-data.ts                  # Test user credentials and data

📁 helpers/
   └── auth-helpers.ts               # Authentication utilities
```

---

## Test Users

### Production Test Accounts

```typescript
// Customer (email-based login)
Email:    kunde@kunde.de
Password: kunde

// Jockey (username-based login)
Username: jockey
Password: jockey

// Workshop (username-based login)
Username: werkstatt
Password: werkstatt
```

### Stripe Test Cards

```
// Successful payment
Card:   4242 4242 4242 4242
Expiry: 12/25
CVC:    123

// Declined payment
Card:   4000 0000 0000 0002

// 3D Secure required
Card:   4000 0027 6000 3184
```

---

## Common Test Scenarios

### 1. Customer Login Test
```typescript
test('Customer login', async ({ page }) => {
  await page.goto('/de/customer/login');
  await page.fill('input[type="email"]', 'kunde@kunde.de');
  await page.fill('input[type="password"]', 'kunde');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/customer\/dashboard/);
});
```

### 2. Jockey Login Test
```typescript
test('Jockey login', async ({ page }) => {
  await page.goto('/de/jockey/login');
  await page.fill('input[type="text"]', 'jockey');
  await page.fill('input[type="password"]', 'jockey');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/jockey\/dashboard/);
});
```

### 3. Workshop Login Test
```typescript
test('Workshop login', async ({ page }) => {
  await page.goto('/de/workshop/login');
  await page.fill('input[type="text"]', 'werkstatt');
  await page.fill('input[type="password"]', 'werkstatt');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/workshop\/dashboard/);
});
```

### 4. Extension Approval Test
```typescript
test('Approve extension', async ({ page }) => {
  // Login as customer
  await page.goto('/de/customer/login');
  await page.fill('input[type="email"]', 'kunde@kunde.de');
  await page.fill('input[type="password"]', 'kunde');
  await page.click('button[type="submit"]');

  // Navigate to booking with extension
  await page.goto(`/de/customer/bookings/${bookingId}`);

  // Click Extensions tab
  await page.click('text=Erweiterungen');

  // Open approval modal
  await page.click('text=Details anzeigen');

  // Approve
  await page.click('text=Genehmigen & Bezahlen');

  // Enter payment (Stripe Elements)
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
  await stripeFrame.locator('[name="cardNumber"]').fill('4242424242424242');
  await stripeFrame.locator('[name="cardExpiry"]').fill('1225');
  await stripeFrame.locator('[name="cardCvc"]').fill('123');

  // Submit
  await page.click('text=Zahlung autorisieren');

  // Verify
  await expect(page.locator('text=Autorisiert')).toBeVisible();
});
```

---

## Debugging Failed Tests

### Check Screenshot
```bash
# Find latest failed test
ls -lt test-results/ | head -n 5

# View screenshot
open test-results/[test-name]/test-failed-1.png
```

### Watch Video Recording
```bash
# View failure video
open test-results/[test-name]/video.webm
```

### Use Trace Viewer
```bash
# Launch trace viewer (most detailed)
npx playwright show-trace test-results/[test-name]/trace.zip

# Trace shows:
# - DOM snapshots at each step
# - Network requests
# - Console logs
# - Screenshots
# - Timeline of actions
```

### Check Console Logs
```typescript
// Add console listener to test
page.on('console', msg => console.log('Browser:', msg.text()));

// Add debug output
console.log('Current URL:', page.url());
console.log('Element exists:', await element.isVisible());
```

### Slow Down Test Execution
```typescript
// Add to playwright.config.ts
use: {
  slowMo: 1000, // Wait 1 second between actions
}

// Or per test
test.use({ slowMo: 1000 });
```

---

## Known Issues & Workarounds

### Issue 1: Jockey Dashboard Not Rendering
**Status:** CRITICAL BUG (BUG-001)
**Workaround:** None - must be fixed
**Test Affected:** All jockey tests
**Fix ETA:** 1-2 days

### Issue 2: Workshop Dashboard Not Rendering
**Status:** CRITICAL BUG (BUG-002)
**Workaround:** None - must be fixed
**Test Affected:** All workshop tests
**Fix ETA:** 1-2 days

### Issue 3: Notification Bell Hidden
**Status:** HIGH BUG (BUG-003)
**Workaround:** Navigate directly to /customer/notifications
**Test Affected:** Notification tests
**Fix ETA:** This week

### Issue 4: No Test Bookings
**Status:** MEDIUM BUG (BUG-005)
**Workaround:** Manually create booking via UI
**Test Affected:** Extension approval tests
**Fix ETA:** Next week

---

## CI/CD Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps chromium

      - name: Start backend
        run: |
          cd backend
          npm ci
          npm run dev &
          sleep 10

      - name: Start frontend
        run: |
          cd frontend
          npm run dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd frontend
          npx playwright test --project=chromium-desktop

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 7
```

---

## Performance Optimization

### Parallel vs Sequential Tests

```typescript
// Run tests in parallel (faster but may cause conflicts)
// playwright.config.ts
fullyParallel: true,
workers: 4,

// Run tests sequentially (slower but safer for database)
fullyParallel: false,
workers: 1,
```

### Test Isolation

```typescript
// Each test gets fresh browser context
test.use({
  // Clear cookies and storage before each test
  storageState: undefined,
});

// Share authentication across tests
test.use({
  storageState: 'e2e/.auth/customer.json',
});
```

### Reduce Test Timeouts

```typescript
// Default timeout
test.setTimeout(60000); // 60 seconds

// Faster for simple tests
test.setTimeout(30000); // 30 seconds

// Per assertion
await expect(element).toBeVisible({ timeout: 5000 });
```

---

## Best Practices

### 1. Use data-testid for Stable Selectors
```tsx
// In component
<button data-testid="approve-extension-btn">Approve</button>

// In test
await page.click('[data-testid="approve-extension-btn"]');
```

### 2. Wait for Network Requests
```typescript
// Wait for specific API call
await page.waitForResponse(
  response => response.url().includes('/api/bookings') && response.ok()
);
```

### 3. Use Page Objects
```typescript
// page-objects/CustomerDashboard.ts
export class CustomerDashboard {
  constructor(private page: Page) {}

  async navigateToBooking(bookingId: string) {
    await this.page.goto(`/de/customer/bookings/${bookingId}`);
  }

  async clickExtensionsTab() {
    await this.page.click('text=Erweiterungen');
  }
}

// In test
const dashboard = new CustomerDashboard(page);
await dashboard.navigateToBooking('123');
await dashboard.clickExtensionsTab();
```

### 4. Clean Up Test Data
```typescript
test.afterEach(async ({ page }) => {
  // Delete test booking
  await page.request.delete(`/api/bookings/${testBookingId}`);
});
```

### 5. Use Fixtures for Reusable Logic
```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{ authenticatedCustomer: Page }>({
  authenticatedCustomer: async ({ page }, use) => {
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', 'kunde@kunde.de');
    await page.fill('input[type="password"]', 'kunde');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/customer\/dashboard/);

    await use(page);
  },
});

// In test
import { test } from './fixtures/auth';

test('should view bookings', async ({ authenticatedCustomer: page }) => {
  // Already logged in!
  await page.goto('/de/customer/bookings');
});
```

---

## Test Coverage Checklist

### ✅ Fully Tested (100%)
- [ ] Landing page loads
- [ ] Multi-language switching (DE/EN)
- [ ] Customer authentication
- [ ] Jockey authentication
- [ ] Workshop authentication
- [ ] Customer booking flow
- [ ] Basic navigation

### ⚠️ Partially Tested (50-80%)
- [ ] Extension creation UI
- [ ] Extension approval modal
- [ ] Payment integration
- [ ] Status transitions
- [ ] Responsive design

### ❌ Not Tested (<50%)
- [ ] Jockey dashboard functionality
- [ ] Workshop dashboard functionality
- [ ] Notification system
- [ ] Extension approval E2E
- [ ] Auto-capture on completion
- [ ] Complete booking → delivery flow

---

## Troubleshooting

### Test Hangs/Freezes
```bash
# Kill Playwright processes
pkill -f playwright

# Kill Node processes on test ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9

# Re-run tests
npx playwright test
```

### "Element not found" Errors
```typescript
// Increase timeout
await page.waitForSelector('[data-testid="button"]', { timeout: 10000 });

// Wait for element to be visible
await expect(page.locator('[data-testid="button"]')).toBeVisible();

// Check if element exists before clicking
const button = page.locator('[data-testid="button"]');
if (await button.isVisible()) {
  await button.click();
}
```

### Authentication Failures
```typescript
// Verify credentials are correct
console.log('Logging in with:', email, password);

// Check redirect after login
console.log('Current URL:', page.url());

// Verify session cookie
const cookies = await page.context().cookies();
console.log('Cookies:', cookies);
```

### Flaky Tests
```typescript
// Add retries
test.describe.configure({ retries: 2 });

// Add wait before action
await page.waitForTimeout(1000);

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-testid="content"]');
```

---

## Useful Commands Cheat Sheet

```bash
# Run tests
npx playwright test                           # All tests
npx playwright test --headed                  # See browser
npx playwright test --debug                   # Debug mode
npx playwright test --ui                      # UI mode
npx playwright test smoke                     # Pattern match
npx playwright test e2e/specific.spec.ts      # Single file

# View results
npx playwright show-report                    # HTML report
npx playwright show-trace trace.zip           # Trace viewer

# Update snapshots
npx playwright test --update-snapshots        # Visual regression

# Generate tests
npx playwright codegen http://localhost:3000  # Record actions

# List tests
npx playwright test --list                    # Show all tests
npx playwright test --grep customer           # Filter by name

# Configuration
npx playwright test --config=custom.config.ts # Custom config
```

---

## Contact & Support

**QA Team Lead:** [Name]
**Email:** qa@company.com
**Slack:** #qa-testing

**Documentation:**
- Full Test Report: `/03 Documentation/E2E_TEST_EXECUTION_REPORT.md`
- Bug Report: `/03 Documentation/BUG_REPORT_E2E_TESTING.md`
- Recommendations: `/03 Documentation/E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md`

**External Resources:**
- Playwright Docs: https://playwright.dev
- Stripe Testing: https://stripe.com/docs/testing
- Next.js Testing: https://nextjs.org/docs/testing

---

**Last Updated:** February 1, 2026
**Maintained By:** QA Team
