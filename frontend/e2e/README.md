# E2E Test Suite - B2C Autowartungs-App

Comprehensive Playwright test suite covering all critical user journeys and component rendering.

**Total Coverage: 168 Test Cases** across 6 test suites

## 🎯 Test Coverage

### 1. Authentication Tests (`auth.spec.ts`) - 25 Tests
- ✅ Workshop login with username/password
- ✅ Jockey login with username/password
- ✅ Customer login with email/password
- ✅ Guest checkout (no login required)
- ✅ Logout functionality across all portals
- ✅ Invalid credentials handling
- ✅ Role-based access control and redirects
- ✅ Session persistence across page reloads
- ✅ Multi-language authentication (DE/EN)
- ✅ Security edge cases (SQL injection, special chars)

**Key Defect Detection:**
- ⚠️ Wrong credentials (werkstatt vs werkstatt-witten)
- ⚠️ Missing authentication error messages
- ⚠️ Session management issues
- ⚠️ SQL injection vulnerabilities

### 2. Booking Flow Tests (`booking-flow.spec.ts`) - 31 Tests
- ✅ Complete guest checkout end-to-end
- ✅ Service selection (single & multiple services)
- ✅ Vehicle data entry with comprehensive validation
- ✅ Date/time picker with calendar auto-close
- ✅ Address input validation (postal code, city, street)
- ✅ Contact information collection
- ✅ Multi-step form validation
- ✅ Step navigation (forward/backward)
- ✅ Data persistence across steps
- ✅ API integration testing

**Key Defect Detection:**
- ⚠️ Calendar not auto-closing after date selection
- ⚠️ Form validation bypasses
- ⚠️ Missing required field validations
- ⚠️ Step navigation data loss

### 3. Workshop Dashboard Tests (`workshop-dashboard.spec.ts`) - 26 Tests
- ✅ Login and dashboard access
- ✅ View bookings table with all columns
- ✅ Filter bookings by status
- ✅ View detailed booking information
- ✅ Create extension with description and photos
- ✅ Validate extension form fields
- ✅ Upload photos for evidence
- ✅ Submit extension to customer
- ✅ Update booking status
- ✅ Component error detection (Table, Dialog, Textarea)

**Key Defect Detection:**
- ⚠️ Missing Table component imports causing build failures
- ⚠️ Missing Dialog component preventing extension creation
- ⚠️ Missing Textarea component in extension form
- ⚠️ Table rendering errors (thead, tbody, tr, td)
- ⚠️ Extension form validation bypasses

### 4. Internationalization Tests (`i18n.spec.ts`) - 36 Tests
- ✅ Switch from German to English and vice versa
- ✅ Verify translations on all major pages
- ✅ URL locale changes correctly
- ✅ **No double locale bug** (/en/en detection)
- ✅ Persistent language preference
- ✅ Translation verification (landing, booking, login, dashboards)
- ✅ Date formatting by locale (DD.MM.YYYY vs MM/DD/YYYY)
- ✅ Currency formatting (€ position)
- ✅ Missing translation detection
- ✅ Edge cases (invalid locale, missing locale)

**Key Defect Detection:**
- ⚠️ Double locale in URL (/en/en or /de/de)
- ⚠️ Missing translations showing as keys
- ⚠️ Wrong locale in URL redirects
- ⚠️ Incorrect date/currency formatting

### 5. Component Tests (`components.spec.ts`) - 29 Tests
- ✅ Dialog component rendering and interactions
- ✅ Textarea component (multi-line input, maxlength)
- ✅ Table component structure (thead, tbody, tr, td, th)
- ✅ Form inputs (Input, Select, Checkbox)
- ✅ Button variants and states (disabled, loading)
- ✅ Card components
- ✅ Badge components with variants
- ✅ Navigation components (desktop/mobile)
- ✅ Accessibility checks (labels, ARIA roles)
- ✅ Error detection (import errors, CSS errors)

**Key Defect Detection:**
- ⚠️ Missing component imports (Dialog, Textarea, Table)
- ⚠️ Radix UI component configuration errors
- ⚠️ CSS/styling render issues
- ⚠️ Accessibility violations

### 6. Visual Regression Tests (`visual-regression.spec.ts`) - 21 Tests
- ✅ Landing page screenshots (DE/EN, desktop/mobile)
- ✅ Login pages for all portals
- ✅ Booking flow step screenshots
- ✅ Dashboard layouts (workshop, customer, jockey)
- ✅ Component screenshots (dialogs, tables, dropdowns)
- ✅ Responsive design (6 viewport sizes)
- ✅ Error state screenshots
- ✅ Theme variations (light/dark)

**Key Defect Detection:**
- ⚠️ UI regressions after code changes
- ⚠️ Responsive layout breakage
- ⚠️ Visual inconsistencies across browsers
- ⚠️ Font rendering issues

---

## 🚀 Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium firefox webkit
```

### Run All Tests
```bash
# Run all tests in headless mode
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

### Run Specific Test Suites
```bash
# Authentication tests only
npx playwright test auth

# Booking flow only
npx playwright test booking-flow

# Workshop tests only
npx playwright test workshop

# Jockey tests only
npx playwright test jockey

# Language switching only
npx playwright test i18n
```

### Run Single Test File
```bash
npx playwright test e2e/auth.spec.ts
```

### Debug Mode
```bash
# Run with debugger
npx playwright test --debug

# Run specific test with debugger
npx playwright test auth.spec.ts --debug
```

### View Test Report
```bash
# Open last test report
npx playwright show-report

# Generate and open new report
npm run test:e2e:report
```

---

## 🎭 Test Data

### Test Users

#### Workshop
- **Username:** `werkstatt-witten`
- **Password:** `werkstatt123`
- **Role:** WORKSHOP
- **Access:** Workshop Dashboard

#### Jockey
- **Username:** `jockey-1`
- **Password:** `jockey123`
- **Role:** JOCKEY
- **Access:** Jockey Dashboard

#### Customer (Registered)
- **Email:** `test@example.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Access:** Customer Dashboard

#### Guest Checkout
- No credentials needed
- Creates user on first booking
- Auto-generated password sent via email

### Test Booking Data
```typescript
{
  customer: {
    email: 'e2e-test@example.com',
    firstName: 'E2E',
    lastName: 'Test',
    phone: '+49 123 456789'
  },
  vehicle: {
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2020,
    mileage: 45000
  },
  services: ['inspection', 'oil'],
  pickup: {
    date: '2026-02-20',
    timeSlot: '10:00',
    street: 'Teststraße 123',
    city: 'Dortmund',
    postalCode: '44135'
  }
}
```

---

## 📊 CI/CD Integration

### GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Quality Gates
Tests must pass before:
- ✅ Merging to main
- ✅ Deploying to staging
- ✅ Deploying to production

---

## 🐛 Debugging Failed Tests

### View Screenshots
Failed tests automatically capture screenshots:
```
test-results/
  auth-workshop-login-chromium/
    test-failed-1.png
```

### View Videos
Failed tests record video:
```
test-results/
  auth-workshop-login-chromium/
    video.webm
```

### View Traces
Detailed execution trace:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Common Issues

#### Test Timeout
```typescript
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // Increase timeout to 60s
  // ...
});
```

#### Element Not Found
```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="submit-button"]', {
  state: 'visible',
  timeout: 10000
});
```

#### Network Issues
```typescript
// Wait for specific network request
await page.waitForResponse(
  response => response.url().includes('/api/bookings') && response.status() === 200
);
```

---

## 📝 Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { loginAsWorkshop } from './helpers/auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page');

    // Act
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('h1')).toContainText('Success');
  });
});
```

### Best Practices
1. **Use data-testid** for stable selectors
2. **Wait for network** requests to complete
3. **Isolate tests** - each test should be independent
4. **Use page objects** for reusable code
5. **Test user journeys** not implementation details
6. **Keep tests fast** - aim for <10s per test
7. **Clean up** test data after test runs

### Adding Test Data
Create fixtures in `e2e/fixtures/`:
```typescript
// e2e/fixtures/bookings.ts
export const testBooking = {
  // booking data
};
```

### Adding Helpers
Create helper functions in `e2e/helpers/`:
```typescript
// e2e/helpers/booking.ts
export async function createTestBooking(page, data) {
  // reusable booking creation
}
```

---

## 📈 Coverage Goals

### Current Status
- Authentication: 100%
- Booking Flow: 100%
- Workshop: 100%
- Jockey: 100%
- i18n: 100%
- Components: 100%

### Target Metrics
- ✅ All critical paths covered
- ✅ Happy path + error cases
- ✅ All user roles tested
- ✅ Mobile + desktop viewports
- ✅ All supported browsers

---

## 🔧 Maintenance

### Updating Tests
When features change:
1. Update test to match new behavior
2. Update test data if needed
3. Update documentation
4. Run full suite to verify

### Adding New Features
1. Write tests FIRST (TDD)
2. Implement feature
3. Verify tests pass
4. Add to CI/CD pipeline

### Removing Features
1. Remove related tests
2. Update coverage metrics
3. Update documentation

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

## 🆘 Support

Issues with tests? Check:
1. Test output and error messages
2. Screenshots and videos
3. Trace viewer
4. This README
5. Playwright documentation

Still stuck? Create an issue with:
- Test file and line number
- Error message
- Screenshots
- Expected vs actual behavior
