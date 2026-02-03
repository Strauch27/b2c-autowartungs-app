# Complete Testing Guide - B2C Autowartungs-App

## Quick Start (5 Minutes)

### 1. Setup
```bash
# Install dependencies (if not done)
npm install

# Install Playwright browsers
npx playwright install chromium
```

### 2. Start Dev Server
```bash
npm run dev
```
Leave this running in Terminal 1.

### 3. Run Tests (in Terminal 2)
```bash
# Interactive UI mode (easiest for beginners)
npm run test:e2e:ui
```

### 4. View Results
Tests run in the Playwright UI. Click on tests to see:
- Real-time execution
- Screenshots
- Videos on failure
- Detailed logs

## Available Test Commands

### Main Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run test:e2e` | Run all tests headless | CI/CD, final verification |
| `npm run test:e2e:ui` | Run with interactive UI | Development, debugging |
| `npm run test:e2e:headed` | Run with visible browser | See what tests do |
| `npm run test:e2e:debug` | Run with debugger | Fix failing tests |
| `npm run test:e2e:report` | View last test report | After test run |

### Specific Test Suites

| Command | Tests | Duration |
|---------|-------|----------|
| `npm run test:e2e:auth` | Authentication (25 tests) | ~2 min |
| `npm run test:e2e:booking` | Booking Flow (31 tests) | ~4 min |
| `npm run test:e2e:workshop` | Workshop Dashboard (26 tests) | ~3 min |
| `npm run test:e2e:i18n` | Internationalization (36 tests) | ~4 min |
| `npm run test:e2e:components` | Components (29 tests) | ~3 min |
| `npm run test:e2e:visual` | Visual Regression (21 tests) | ~5 min |

### Browser-Specific

| Command | Description |
|---------|-------------|
| `npm run test:e2e:chrome` | Run on Chrome desktop only |
| `npm run test:e2e:mobile` | Run on mobile viewport only |

## Understanding Test Results

### ✅ Passing Tests
Green checkmark = Test passed
- Expected behavior matches actual behavior
- No action needed

### ❌ Failing Tests
Red X = Test failed
- Click to see:
  - Error message
  - Screenshot at failure point
  - Video recording
  - Full trace

### ⏭️ Skipped Tests
Gray dash = Test skipped
- Marked as `.skip` in code
- Not critical for this run

## Test Output Locations

```
playwright-report/          # HTML report (open with browser)
test-results/              # Screenshots, videos, traces
  └── auth-login-chromium/
      ├── test-failed-1.png     # Screenshot at failure
      ├── video.webm            # Video recording
      └── trace.zip             # Full trace
e2e/__snapshots__/         # Visual regression baselines
```

## Debugging Failed Tests

### Method 1: Interactive UI (Easiest)

```bash
npm run test:e2e:ui
```

1. Click failing test
2. Click "Show trace"
3. Step through actions
4. Inspect DOM at each step
5. See network requests
6. View console logs

### Method 2: Debug Mode

```bash
npm run test:e2e:debug
```

1. Playwright Inspector opens
2. Click "Step Over" to advance
3. Inspect selectors
4. Modify test in real-time
5. Re-run sections

### Method 3: View Trace File

```bash
npx playwright show-trace test-results/path/to/trace.zip
```

1. Timeline of all actions
2. DOM snapshots
3. Network activity
4. Console logs
5. Screenshots at each step

### Method 4: Run in Headed Mode

```bash
npm run test:e2e:headed
```

Watch the browser execute tests in slow motion.

## Common Test Scenarios

### Scenario 1: "All tests fail immediately"

**Possible Causes:**
- Dev server not running
- Wrong port (should be 3000)
- Backend not accessible

**Solution:**
```bash
# Check dev server is running
curl http://localhost:3000

# If not, start it
npm run dev
```

### Scenario 2: "Login tests fail"

**Possible Causes:**
- Wrong test credentials
- Backend database not seeded
- Auth system changed

**Solution:**
1. Check test credentials in `e2e/fixtures/test-data.ts`
2. Verify users exist in backend:
   - `werkstatt-witten` / `werkstatt123`
   - `jockey-max` / `jockey123`
   - `test.customer@example.com` / `customer123`

### Scenario 3: "Component tests fail"

**Possible Causes:**
- Missing UI component imports
- Radix UI component errors
- Build failures

**Solution:**
1. Check browser console in test report
2. Look for import errors
3. Verify components exist:
   - `components/ui/dialog.tsx`
   - `components/ui/textarea.tsx`
   - `components/ui/table.tsx`

### Scenario 4: "Visual regression tests fail"

**Possible Causes:**
- UI changed (expected)
- Font rendering differences
- OS-specific rendering

**Solution:**
```bash
# Review diff images in report
npm run test:e2e:report

# If changes are intentional, update baselines
npm run test:e2e:update-snapshots
```

### Scenario 5: "i18n tests fail"

**Possible Causes:**
- Translation files missing
- Wrong locale in URL
- Double locale bug (/en/en)

**Solution:**
1. Check `messages/de.json` and `messages/en.json`
2. Verify `i18n.ts` configuration
3. Test navigation manually

### Scenario 6: "Timeout errors"

**Possible Causes:**
- Slow network
- Heavy page load
- Infinite loading states

**Solution:**
1. Increase timeout in `playwright.config.ts`
2. Check network tab in trace
3. Verify no API errors

## Test Data Management

### Current Test Users

```typescript
// Workshop
username: 'werkstatt-witten'
password: 'werkstatt123'

// Jockey
username: 'jockey-max'
password: 'jockey123'

// Customer
email: 'test.customer@example.com'
password: 'customer123'
```

### Updating Test Data

Edit `e2e/fixtures/test-data.ts`:

```typescript
export const TEST_USERS = {
  workshop: {
    username: 'your-username',  // Change here
    password: 'your-password',
  }
};
```

Then tests will use new credentials.

### Adding New Test Data

```typescript
// In e2e/fixtures/test-data.ts

export const TEST_WORKSHOPS = {
  witten: {
    name: 'Werkstatt Witten',
    address: '...',
  },
  dortmund: {
    name: 'Werkstatt Dortmund',
    address: '...',
  }
};
```

Import and use in tests:
```typescript
import { TEST_WORKSHOPS } from './fixtures/test-data';

test('should create booking for workshop', async ({ page }) => {
  const workshop = TEST_WORKSHOPS.witten;
  // Use workshop data
});
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Start application
        run: npm run start &

      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000 -t 60000

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
          retention-days: 7
```

### Quality Gates

**Before Merging PR:**
- All E2E tests must pass
- No skipped critical tests
- Visual regression approved

**Before Deploy to Staging:**
- Full test suite passes
- Visual regression reviewed
- Performance metrics acceptable

**Before Deploy to Production:**
- All tests green on staging
- Manual QA sign-off
- Rollback plan ready

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {

  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/de/feature');
  });

  test('TC-XXX-001: should do something', async ({ page }) => {
    // Arrange - setup test conditions
    const button = page.locator('button[data-testid="submit"]');

    // Act - perform action
    await button.click();

    // Assert - verify result
    await expect(page.locator('h1')).toContainText('Success');
  });
});
```

### Using Helpers

```typescript
import { loginAsWorkshop } from './helpers/auth-helpers';
import { TEST_USERS } from './fixtures/test-data';

test('should access dashboard after login', async ({ page }) => {
  // Use helper instead of manual login
  await loginAsWorkshop(page, 'de');

  // Now on dashboard
  await expect(page).toHaveURL(/\/workshop\/dashboard/);
});
```

### Best Practices

1. **Use data-testid**
```typescript
// ✅ Good - stable
await page.locator('[data-testid="submit-button"]').click();

// ❌ Bad - fragile
await page.locator('button.bg-blue-500.px-4').click();
```

2. **Wait for state, not time**
```typescript
// ✅ Good
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();

// ❌ Bad
await page.waitForTimeout(3000);
```

3. **Isolate tests**
```typescript
// ✅ Good - each test is independent
test('test 1', async ({ page }) => {
  await page.goto('/de');
  // Fresh start
});

test('test 2', async ({ page }) => {
  await page.goto('/de');
  // Fresh start
});

// ❌ Bad - tests depend on each other
let sharedState;
test('test 1', async ({ page }) => {
  sharedState = await createData();
});
test('test 2', async ({ page }) => {
  // Uses sharedState - breaks if test 1 fails
});
```

4. **Clear error messages**
```typescript
// ✅ Good
await expect(page.locator('h1')).toContainText('Dashboard', {
  timeout: 5000,
  message: 'Dashboard heading not found after login'
});

// ❌ Bad
await expect(page.locator('h1')).toContainText('Dashboard');
```

## Performance Optimization

### Parallel Execution

Tests run in parallel by default:
```typescript
// playwright.config.ts
export default {
  workers: process.env.CI ? 1 : 4,  // 4 parallel tests locally
};
```

### Reuse Authentication State

For multiple tests needing same login:
```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/de/workshop/login');
  await page.fill('input#username', 'werkstatt-witten');
  await page.fill('input#password', 'werkstatt123');
  await page.click('button[type="submit"]');

  // Save auth state
  await page.context().storageState({
    path: 'auth/workshop.json'
  });
});

// In test file
test.use({ storageState: 'auth/workshop.json' });
```

### Skip Slow Tests Locally

```typescript
test.skip(({ }, testInfo) => {
  return testInfo.project.name === 'chromium-mobile';
}, 'Mobile tests are slow, skip locally');
```

## Troubleshooting Checklist

- [ ] Dev server is running on port 3000
- [ ] Test users exist in backend database
- [ ] Node version is 18 or higher
- [ ] Playwright browsers are installed (`npx playwright install`)
- [ ] No other process using port 3000
- [ ] `.env` file configured correctly
- [ ] Backend API is accessible
- [ ] Test data is in `fixtures/test-data.ts`

## Getting Help

1. **Check test report**
   ```bash
   npm run test:e2e:report
   ```

2. **View trace**
   ```bash
   npx playwright show-trace test-results/.../trace.zip
   ```

3. **Run in debug mode**
   ```bash
   npm run test:e2e:debug
   ```

4. **Check documentation**
   - `e2e/README.md` - Full test documentation
   - `TEST_SUITE_SUMMARY.md` - Test overview
   - https://playwright.dev - Playwright docs

5. **Common issues documented**
   - Wrong credentials
   - Missing components
   - Translation issues
   - Timeout errors

## Maintenance Schedule

### Daily
- Monitor CI test results
- Fix failing tests immediately

### Weekly
- Review test coverage
- Update visual baselines if needed
- Check for flaky tests

### Monthly
- Update Playwright version
- Review and remove obsolete tests
- Update documentation

### After Each Feature
- Add tests for new functionality
- Update existing tests if behavior changed
- Update visual baselines if UI changed

## Success Metrics

**Current Test Suite:**
- 168 test cases
- 100% critical path coverage
- ~12 min full suite runtime
- 0% flaky test rate (target)

**Quality Metrics:**
- 100% of PRs must pass tests
- No critical bugs in production
- <1% flaky test rate
- <15 min CI feedback time

---

**Questions?** Check `e2e/README.md` or `TEST_SUITE_SUMMARY.md`

**Need Help?**
- Review test reports first
- Use debug mode
- Check Playwright docs
- Review this guide

---

**Last Updated:** 2026-02-01
**Version:** 1.0.0
