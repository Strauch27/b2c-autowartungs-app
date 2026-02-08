# Test Automation & E2E Walkthrough Update Plan

**Date:** 2026-02-08
**Based on:** Redesign plans (03-05), all E2E spec files, walkthrough specs (DE+EN), Playwright config, auth state files

---

## Table of Contents

1. [Walkthrough Spec Update Plan (DE)](#1-walkthrough-spec-update-plan-de)
2. [Walkthrough Spec Update Plan (EN)](#2-walkthrough-spec-update-plan-en)
3. [Portal Smoke Tests Update](#3-portal-smoke-tests-update)
4. [Auth Flow Tests Update](#4-auth-flow-tests-update)
5. [Numbered E2E Tests (00-13)](#5-numbered-e2e-tests-00-13)
6. [data-testid Strategy](#6-data-testid-strategy)
7. [Test Helpers and Utilities](#7-test-helpers-and-utilities)
8. [Test Execution Plan](#8-test-execution-plan)

---

## 1. Walkthrough Spec Update Plan (DE)

**File:** `e2e/walkthrough-de-unified.spec.ts` (988 lines, 44 tests, Phases P1-P8)

### Phase 1: Customer Booking Flow (P1-01 through P1-17)

#### P1-01 - Customer: Landing Page (screenshot 001)
- **Current:** Navigates to `/${LOCALE}`, takes screenshot
- **Current selectors:** None (just `page.goto` + screenshot)
- **New selectors needed:** None
- **Screenshot change:** `001-landing-page.png` will show completely new design (dark hero, new sections). Same screenshot name, no code change needed.
- **Tests to add:** None
- **Tests to modify:** None

#### P1-02 - Customer: Click Preis berechnen (screenshot 002)
- **Current:** `a:has-text("Preis berechnen"), button:has-text("Preis berechnen")`
- **New selectors needed:** `a:has-text("Jetzt Termin buchen"), button:has-text("Jetzt Termin buchen")` or `[data-testid="hero-cta-primary"]`
- **Screenshot name change:** Rename `002-click-price-button.png` to `002-click-booking-cta.png`
- **Code change:**
  ```typescript
  // OLD
  const ctaBtn = page.locator('a:has-text("Preis berechnen"), button:has-text("Preis berechnen")').first();
  // NEW
  const ctaBtn = page.locator('[data-testid="hero-cta-primary"]').or(
    page.locator('a:has-text("Jetzt Termin buchen"), button:has-text("Jetzt Termin buchen")')
  ).first();
  ```
- **Fallback logic:** Existing fallback `page.goto('/${LOCALE}/booking')` is preserved.

#### P1-03 to P1-06 - Vehicle brand/model selection (screenshots 003-006)
- **Current selectors:**
  - Brand: `page.locator('[role="combobox"]').first().click()` + `[role="option"]:has-text("BMW")`
  - Model: `page.locator('[role="combobox"]').nth(1).click()` + `[role="option"]:has-text("3er")`
- **BREAKING if brand card grid replaces dropdown:** `[role="combobox"]` for brand selection breaks
- **New selectors needed:**
  - Brand: `[data-testid="brand-card-bmw"]` (click to select)
  - Model: `[role="combobox"]` stays (still a dropdown)
- **Code change for P1-03 (brand dropdown open -> brand grid view):**
  ```typescript
  // OLD
  await page.locator('[role="combobox"]').first().click();
  // NEW
  // Brand is now a card grid, no dropdown to "open"
  // Just take screenshot showing the brand card grid
  await expect(page.locator('[data-testid="brand-card-grid"]')).toBeVisible({ timeout: 10000 });
  ```
- **Code change for P1-04 (brand selected):**
  ```typescript
  // OLD
  await page.locator('[role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("BMW")').click();
  // NEW
  await page.locator('[data-testid="brand-card-bmw"]').click();
  ```
- **Code change for P1-05/P1-06 (model dropdown):**
  ```typescript
  // OLD (after brand selection)
  await page.locator('[role="combobox"]').nth(1).click();
  // NEW (model is now the FIRST combobox since brand is card grid)
  await page.locator('[role="combobox"]').first().click();
  ```
- **Screenshot name changes:**
  - `003-vehicle-brand-dropdown.png` -> `003-vehicle-brand-grid.png`
  - `004-vehicle-brand-selected.png` (same name, different visual)
  - `005-vehicle-model-dropdown.png` (same name)
  - `006-vehicle-model-selected.png` (same name)
- **fillVehicleForm helper update required:** (see Section 7)

#### P1-07 to P1-08 - Year and Mileage (screenshots 007-008)
- **Current selectors:** `#year` (number input), `#mileage` (number input)
- **New selectors needed:** Year changes from `input#year` to `select` dropdown
  - `[data-testid="year-select"]` or `[role="combobox"]` for year
  - `#mileage` stays the same
- **Code change for P1-07:**
  ```typescript
  // OLD
  await page.locator('#year').fill(VEHICLE.year);
  // NEW (year is now a dropdown select)
  await page.locator('[data-testid="year-select"]').click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
  ```
- **Screenshot names:** Same

#### P1-09 - Vehicle form complete (screenshot 009)
- **Current selectors:** `fillVehicleForm(page)` helper
- **New selectors needed:** Updated helper (see Section 7)
- **Screenshot name:** Same

#### P1-10 to P1-11 - Service selection (screenshots 010-011)
- **Current selectors:** `[data-testid="service-card-inspection"]`
- **New selectors needed:** Same `[data-testid="service-card-inspection"]` -- **PRESERVED**
- **Note:** 6 services now visible instead of 4; existing tests still work because they target specific `data-testid`
- **Screenshot names:** Same
- **New screenshots to add (optional):** Additional service cards visible

#### P1-12 to P1-15 - Appointment step (screenshots 012-015)
- **Current selectors:**
  - `button:has-text("Abholdatum")` -- calendar trigger
  - `button:has-text("Morgen")` -- quick select
  - `.grid.grid-cols-5` -- time slot grid
  - `button:has-text("+1 Woche")` -- return date quick select
  - `#street`, `#zip`, `#city` -- address fields
- **POTENTIALLY BREAKING:** If calendar becomes inline (not popover), `button:has-text("Abholdatum")` trigger may not exist
- **New selectors needed:**
  - Calendar: `[data-testid="pickup-calendar"]` (inline calendar container)
  - Time slots: `[data-testid="pickup-time-10:00"]` or keep existing `button:has-text("10:00")`
  - Address: `#street`, `#zip`, `#city` -- **UNCHANGED**
- **Code change for pickDate helper:**
  ```typescript
  // OLD
  const dateBtn = page.locator('button:has-text("Abholdatum")');
  if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dateBtn.click();
    ...
  }
  // NEW
  const inlineCalendar = page.locator('[data-testid="pickup-calendar"]');
  if (await inlineCalendar.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Calendar is inline -- just click a day directly
    await inlineCalendar.locator('td button:not([disabled])').first().click();
  } else {
    // Fallback: old popover calendar
    const dateBtn = page.locator('button:has-text("Abholdatum")');
    if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dateBtn.click();
      ...
    }
  }
  ```
- **Code change for pickTimeSlots helper:**
  ```typescript
  // OLD
  const timeGrids = page.locator('.grid.grid-cols-5');
  // NEW (grid may have different column count if 10 slots)
  const pickupTimeSlots = page.locator('[data-testid="pickup-time-slots"]').or(
    page.locator('.grid.grid-cols-5')
  );
  await pickupTimeSlots.first().locator('button:has-text("10:00")').click();
  ```
- **Screenshot names:** Same

#### P1-16 - Booking submit + register + confirm (screenshots 013-017)
- **Current selectors:** `#firstName`, `#lastName`, `#email`, `#phone`, `#terms`, `button:has-text("Jetzt kostenpflichtig buchen")`, `#password`, `#confirmPassword`, `button:has-text("Konto erstellen")`
- **New selectors needed:** All form field IDs remain the same. Submit button text unchanged.
- **SAFE -- no changes needed**
- **Screenshot names:** Same

#### P1-17 - Customer: Dashboard after booking (screenshot 017)
- **Current selectors:** `page.goto('/${LOCALE}/customer/dashboard')`, API call to retrieve bookingId
- **Dashboard redesign impact:** Layout changes but URL and API logic unchanged
- **SAFE -- no changes needed** (screenshot will reflect new dashboard design)

### Phase 2: Jockey Pickup (P2-01 through P2-04)

#### P2-01 - Setup: Get role tokens and advance to PICKUP_ASSIGNED
- **Pure API test -- NO IMPACT**

#### P2-02 - Jockey: Login page (screenshot 018)
- **Current selectors:** `page.goto('/${LOCALE}/jockey/login')`, screenshot only
- **NO CHANGE** -- login page is not affected by portal redesign

#### P2-03 - Jockey: Dashboard (screenshot 019)
- **Current selectors:** `page.goto('/${LOCALE}/jockey/dashboard')`, `networkidle`, screenshot, API call for assignments
- **Dashboard redesign impact:** New card design, bottom nav, dark header -- but test only navigates and screenshots
- **NO SELECTOR BREAKAGE** -- screenshot will reflect new design

#### P2-04 - Jockey: Pickup flow (screenshots 020-022)
- **Current selectors:** API calls (`PATCH /api/jockeys/assignments/:id/status`), then `page.goto` + screenshot
- **NO SELECTOR BREAKAGE** -- tests advance status via API, not UI buttons

### Phase 3: Workshop Received (P3-01, P3-02)

#### P3-01 - Workshop: Login page (screenshot 023)
- **Current selectors:** `page.goto('/${LOCALE}/workshop/login')`, screenshot
- **NO CHANGE**

#### P3-02 - Workshop: Dashboard AT_WORKSHOP (screenshots 024-025)
- **Current selectors:**
  - `[data-testid="booking-status"]` -- status badge
  - `page.locator('tr', { hasText: bookingNumber })` -- table row
  - `button:has-text("Details")` -- opens order details modal
  - `[role="dialog"]` -- dialog verification
- **BREAKING:** `tr` selector targets table rows. With Kanban redesign, orders are in card components.
- **New selectors needed:**
  ```typescript
  // OLD
  const orderRow = page.locator('tr', { hasText: bookingNumber }).first();
  const detailsBtn = orderRow.locator('button:has-text("Details")');
  // NEW
  const orderCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`).or(
    page.locator('[data-testid^="kanban-card"]', { hasText: bookingNumber })
  ).first();
  const detailsBtn = orderCard.locator('button:has-text("Details")').or(
    orderCard.locator('[data-testid^="kanban-action"]')
  );
  ```
- **`[data-testid="booking-status"]`** should be preserved on Kanban card badges -- **SAFE**
- **`[role="dialog"]`** may change if order detail becomes full-page view instead of modal. Add fallback:
  ```typescript
  // NEW
  const detailView = page.locator('[role="dialog"]').or(
    page.locator('[data-testid="order-detail-view"]')
  );
  ```

### Phase 4: Workshop IN_SERVICE (P4-01)

#### P4-01 - Workshop: Dashboard IN_SERVICE (screenshots 026-028)
- **Same BREAKING changes as P3-02** -- `tr` row selector needs migration to Kanban card selector
- **Same fix as P3-02 above**

### Phase 5: Extension Flow (P5-01 through P5-11)

#### P5-01 - Workshop: Open extension modal (screenshots 029-030)
- **Current selectors:**
  - `page.locator('tr', { hasText: bookingNumber })` -- table row
  - `orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') })` -- extension button
  - `[role="dialog"]` -- modal
- **BREAKING:** Same `tr` to Kanban card migration
- **New selectors:**
  ```typescript
  // OLD
  const orderRow = page.locator('tr', { hasText: bookingNumber });
  const extensionBtn = orderRow.locator('button').filter({ has: page.locator('svg.lucide-plus') });
  // NEW
  const orderCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`).or(
    page.locator('[data-testid^="kanban-card"]', { hasText: bookingNumber })
  ).first();
  const extensionBtn = orderCard.locator('button:has-text("Erweiterung")').or(
    orderCard.locator('button').filter({ has: page.locator('svg.lucide-plus') })
  );
  ```
- **`[role="dialog"]`** preserved if `ExtensionModal` wrapper is kept (recommended)

#### P5-02 - Workshop: Fill extension form (screenshots 031-033)
- **Current selectors:**
  - `dialog.locator('textarea')` -- description
  - `dialog.locator('input[type="number"]')` -- price
  - `dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') })` -- add item
  - `dialog.locator('button').filter({ has: page.locator('svg.lucide-send') })` -- submit
- **If ExtensionModal wrapper is preserved:** All selectors within `[role="dialog"]` continue to work. **SAFE**
- **If extension form becomes inline:** `[role="dialog"]` breaks, need `[data-testid="inline-extension-form"]`
- **Recommendation:** Keep ExtensionModal as thin wrapper from Kanban card buttons to minimize test breakage

#### P5-03 - Verify extension created (API fallback)
- **Pure API test -- NO IMPACT**

#### P5-04 - Customer: Dashboard with pending extension (screenshot 034)
- **Current selectors:** `page.goto('/${LOCALE}/customer/dashboard')`, screenshot only
- **Dashboard redesign:** Extension alert is now a standalone `ExtensionAlertBanner` at top (not per-booking inline alert)
- **NO SELECTOR BREAKAGE** -- test only navigates and screenshots

#### P5-05 - Customer: Booking details page (screenshot 035)
- **Current selectors:** `page.goto('/${LOCALE}/customer/bookings/${bookingId}')`, screenshot
- **NO SELECTOR BREAKAGE** -- test only navigates and screenshots

#### P5-06 - Customer: Extensions tab (screenshot 036)
- **Current selectors:**
  - `button[role="tab"]` filter `hasText: /Erweiterungen|Extensions/i` -- tab button
- **POTENTIALLY BREAKING:** `role="tab"` may not be on new pill-style buttons
- **New selectors:**
  ```typescript
  // OLD
  const extensionsTab = page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i });
  // NEW
  const extensionsTab = page.locator('[data-testid="subtab-extensions"]').or(
    page.locator('button[role="tab"]').filter({ hasText: /Erweiterungen|Extensions/i })
  ).or(
    page.locator('button:has-text("Erweiterungen")')
  );
  ```

#### P5-07 - Customer: Review extension details (screenshot 037)
- **Current selectors:**
  - `[role="tabpanel"] button` filter `svg.lucide-triangle-alert` -- approve/review button
- **BREAKING if tabpanel removed:** `[role="tabpanel"]` may not exist with custom pills
- **New selectors:**
  ```typescript
  // OLD
  const extensionActionBtn = page.locator('[role="tabpanel"] button').filter({
    has: page.locator('svg.lucide-triangle-alert'),
  }).first();
  // NEW
  const extensionActionBtn = page.locator('[data-testid="extension-approve-btn"]').or(
    page.locator('button:has-text("Genehmigen")').or(
      page.locator('button').filter({ has: page.locator('svg.lucide-triangle-alert') })
    )
  ).first();
  ```

#### P5-08 - Customer: Approve extension and pay (screenshots 038-039)
- **Current selectors:**
  - `[role="dialog"] button` filter `hasText: /Genehmigen|Approve|bezahlen|Pay/i`
  - `button` filter `hasText: /Pay with Demo|Demo/i`
- **BREAKING:** "Pay with Demo" button is REMOVED in redesign (demo payment handled inline)
- **New selectors:**
  ```typescript
  // OLD
  const demoPayBtn = page.locator('button').filter({ hasText: /Pay with Demo|Demo/i }).first();
  // NEW (approve button directly triggers payment in demo mode)
  const approveBtn = page.locator('[data-testid="extension-confirm-pay"]').or(
    page.locator('[role="dialog"] button').filter({ hasText: /Genehmigen|Approve/i })
  ).first();
  // Click approve -- in demo mode this triggers payment automatically
  await approveBtn.click();
  // Wait for success state (no separate demo pay button)
  await page.waitForTimeout(4000);
  ```
- **API fallback** preserved unchanged

#### P5-09 - Ensure extension approved (API fallback)
- **Pure API test -- NO IMPACT**

#### P5-10 - Customer: Extension confirmed state (screenshot 040)
- **Current selectors:** Same tab navigation as P5-06
- **Apply same fix as P5-06**

#### P5-11 - Workshop: See approved extension (screenshot 042)
- **Current selectors:** Same `tr` row selector as P3-02
- **Apply same Kanban card fix as P3-02**

### Phase 6: Workshop Completed (P6-01, P6-02)

#### P6-01 - Workshop: Dashboard READY_FOR_RETURN (screenshots 043-046)
- **Same BREAKING `tr` selector as P3-02** -- apply Kanban card fix
- **`[data-testid="booking-status"]`** preserved

#### P6-02 - Setup: Advance to RETURN_ASSIGNED
- **Pure API test -- NO IMPACT**

### Phase 7: Jockey Return (P7-01 through P7-04)

- **All tests use API status changes + `page.goto` + screenshot**
- **NO SELECTOR BREAKAGE** -- screenshots will reflect new jockey card design

### Phase 8: Customer Final (P8-01, P8-02)

#### P8-01 - Customer: Dashboard completed (screenshot 051)
- **Current selectors:** `page.goto`, token injection, screenshot
- **NO SELECTOR BREAKAGE** -- screenshot reflects new dashboard

#### P8-02 - Customer: Booking details final (screenshot 052)
- **Current selectors:** `page.goto`, screenshot
- **NO SELECTOR BREAKAGE** -- screenshot reflects new pill-tab detail page

### Summary of DE Walkthrough Changes

| Phase | Tests Affected | Severity | Key Change |
|-------|---------------|----------|------------|
| P1 (Landing) | P1-02 | **Medium** | CTA text "Preis berechnen" -> "Jetzt Termin buchen" |
| P1 (Vehicle) | P1-03 to P1-08 | **High** | Brand dropdown -> brand card grid; year input -> dropdown |
| P1 (Service) | P1-10, P1-11 | **None** | `data-testid` preserved |
| P1 (Appointment) | P1-12 to P1-15 | **Medium** | Calendar may go inline; time grid columns may change |
| P1 (Submit) | P1-16 | **None** | Form field IDs unchanged |
| P2 (Jockey) | None | **None** | API-driven, screenshots only |
| P3 (Workshop) | P3-02 | **High** | Table `tr` -> Kanban card |
| P4 (Workshop) | P4-01 | **High** | Table `tr` -> Kanban card |
| P5 (Extension) | P5-01, P5-02, P5-06-P5-08, P5-10, P5-11 | **High** | Kanban cards, pill tabs, demo pay removed |
| P6 (Workshop) | P6-01 | **High** | Table `tr` -> Kanban card |
| P7 (Jockey) | None | **None** | API-driven |
| P8 (Customer) | None | **None** | Screenshots only |

---

## 2. Walkthrough Spec Update Plan (EN)

**File:** `e2e/walkthrough-en-unified.spec.ts` (1146 lines, ~44 tests, Phases P1-P8)

The EN spec follows the same structure as DE. All selector changes from Section 1 apply. Key EN-specific differences:

### Phase 1 Differences

#### Phase 1-02: CTA button text
- **Current:** `a:has-text("Calculate Fixed Price Now"), button:has-text("Calculate Fixed Price Now"), a:has-text("Get Your Quote"), button:has-text("Get Your Quote")`
- **New:** `[data-testid="hero-cta-primary"]` or `a:has-text("Book appointment now"), button:has-text("Book appointment now")`

#### Phase 1-10: Next button text
- **Current:** `button:has-text("Next")`
- **New:** Same -- "Next" button text preserved in EN

#### Phase 1-13: Date button text
- **Current:** `button:has-text("Pickup Date")`
- **New:** `[data-testid="pickup-calendar"]` (inline) or `button:has-text("Pickup Date")` fallback

#### Phase 1-14: Quick select text
- **Current:** `button:has-text("Tomorrow")`, `button:has-text("+1 Week")`
- **New:** If quick selects removed with inline calendar, use `[data-testid="pickup-calendar"]`

#### Phase 1-16: Submit button text
- **Current:** `button:has-text("Book Now")`
- **New:** Same (or use `[data-testid="booking-submit"]`)

#### Phase 1-16: Register button text
- **Current:** `button:has-text("Create Account")`
- **New:** Same

### Phase 3-8 Differences

All workshop `tr` -> Kanban card changes are identical. EN-specific text differences:

| DE Selector | EN Selector | New Selector (both) |
|-------------|-------------|---------------------|
| `button:has-text("Details")` | `button:has-text("Details")` | `[data-testid^="kanban-action"]` |
| `button[role="tab"]` filter `Erweiterungen` | `button[role="tab"]` filter `Extensions` | `[data-testid="subtab-extensions"]` |
| `button:has-text("Genehmigen")` | `button:has-text("Approve")` | `[data-testid="extension-approve-btn"]` |
| `button:has-text("Pay with Demo")` | `button:has-text("Pay with Demo")` | **REMOVED** -- use `[data-testid="extension-confirm-pay"]` |

### EN Screenshot Name Changes

Same naming convention. No name changes required.

---

## 3. Portal Smoke Tests Update

**File:** `e2e/portal-smoke-tests.spec.ts` (184 lines)

### Current Test Structure

```
Customer Portal Smoke Tests (4 tests)
  - Dashboard loads and shows bookings list
  - Dashboard shows status badges
  - Language switch changes locale in URL
  - Navigation works

Jockey Portal Smoke Tests (3 tests)
  - Dashboard loads and shows assignments
  - Assignment cards render properly
  - Status badges are visible

Workshop Portal Smoke Tests (4 tests)
  - Dashboard loads and shows orders
  - Order table or list renders
  - Order details modal can be opened
  - Auto-refresh is active
```

### Selectors That Break

| Test | Current Selector | Issue | Fix |
|------|-----------------|-------|-----|
| Customer: Navigation works | `nav:visible, header:visible` | Sidebar nav removed; bottom nav added | Change to `[data-testid="customer-bottom-nav"], nav:visible, header:visible` |
| Workshop: Order table or list renders | `table, [class*="order"], [class*="card"]` | Table removed, Kanban cards instead | Change to `[data-testid="kanban-board"], table, [class*="card"]` |
| Workshop: Order details modal | `tr[class*="cursor"], [class*="order"][class*="cursor"]` | No table rows | Change to `[data-testid^="kanban-card"]` |
| Workshop: Order details modal | `[role="dialog"], [class*="modal"]` | May become full-page view | Add `[data-testid="order-detail-view"]` fallback |

### New Assertions Needed

| Portal | Assertion | Selector |
|--------|-----------|----------|
| Customer | Bottom navigation visible | `[data-testid="customer-bottom-nav"]` with 4 items |
| Customer | Extension alert banner visible (if pending) | `[data-testid="extension-alert-banner"]` |
| Customer | Active booking hero card visible (if active booking) | `[data-testid="active-booking-hero"]` |
| Jockey | Bottom navigation visible (mobile) | `[data-testid="jockey-bottom-nav"]` |
| Jockey | Dark header bar visible | `[data-testid="jockey-top-bar"]` |
| Workshop | Kanban board visible | `[data-testid="kanban-board"]` with 3 columns |
| Workshop | Top bar visible | `[data-testid="workshop-top-bar"]` |

---

## 4. Auth Flow Tests Update

**File:** `e2e/auth-flows.spec.ts` (229 lines)

### Login/Register Form Changes

The redesign does NOT change the login pages. Login pages are independent of portal layouts:
- `jockey/login/page.tsx` -- NO CHANGE
- `workshop/login/page.tsx` -- NO CHANGE
- `customer/login/page.tsx` -- NO CHANGE

### Selector Updates

| Test | Current Selector | Status | Notes |
|------|-----------------|--------|-------|
| Customer login | `[data-testid="email-input"], input[type="email"]` | **SAFE** | Login form unchanged |
| Customer login | `[data-testid="password-input"], input[type="password"]` | **SAFE** | Login form unchanged |
| Customer login | `[data-testid="login-button"], button[type="submit"]` | **SAFE** | Login form unchanged |
| Jockey login | `[data-testid="username-input"], input[name="username"]` | **SAFE** | Login form unchanged |
| Workshop login | `[data-testid="username-input"], input[name="username"]` | **SAFE** | Login form unchanged |
| Logout - customer | `button:has-text("Abmelden"), button:has-text("Logout")` | **CHECK** | Logout moves from sidebar to bottom nav profile or header avatar menu |
| Logout - customer | `svg.lucide-log-out` | **CHECK** | LogOut icon may move to profile page or header menu |
| Access control | Redirect to login page | **SAFE** | ProtectedRoute logic moves to layout but behavior unchanged |

### Logout Button Migration

The customer sidebar (which contained "Abmelden") is removed. Logout will be accessible from:
- Header avatar dropdown menu, OR
- Profile page within the portal

**Required change for logout tests:**
```typescript
// OLD
const logoutButton = page.locator('text=Abmelden').first();
if (!await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  await page.locator('button').filter({ has: page.locator('svg.lucide-log-out') }).first().click();
}
// NEW
const logoutButton = page.locator('[data-testid="logout-button"]').or(
  page.locator('button:has-text("Abmelden")').or(
    page.locator('button').filter({ has: page.locator('svg.lucide-log-out') })
  )
).first();
```

---

## 5. Numbered E2E Tests (00-13)

### 00-quick-smoke-test.spec.ts (88 lines, 5 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should load homepage | `page.locator('main')` | **None** | `main` still exists |
| should navigate to booking page | Direct navigation | **None** | URL unchanged |
| should navigate to customer login | `input[type="email"]` | **None** | Login unchanged |
| should switch between DE/EN URLs | Direct navigation | **None** | Locale routing unchanged |
| should have all main sections | `#how-it-works`, `#faq` | **Medium** | `#faq` section removed from landing. Update: check for `#how-it-works` and `#services` instead |

**Fix for section check:**
```typescript
// OLD
const faq = page.locator('#faq');
if (await faq.isVisible({ timeout: 2000 }).catch(() => false)) { ... }
// NEW
const services = page.locator('#services');
if (await services.isVisible({ timeout: 2000 }).catch(() => false)) { ... }
```

### 00-demo-smoke-test.spec.ts (401 lines, 7 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| 1.1 Create booking | `getByRole('combobox')`, `#year`, `#mileage`, `button:has-text("Abholdatum")`, `#street`, `#firstName`, `#terms`, `button:has-text("Jetzt kostenpflichtig buchen")` | **High** | Brand combobox -> card grid; year input -> select |
| 1.2 Verify booking on customer page | `text=Abholung geplant`, `text=Bestätigt` | **None** | Status text unchanged |
| 1.3 Verify pickup via API | Pure API | **None** | -- |
| 2.x Jockey/Workshop API | Pure API | **None** | -- |
| 3.x Final verification | Status text assertions | **None** | -- |

**Required changes:**
```typescript
// OLD
const brandTrigger = page.getByRole('combobox').first();
await brandTrigger.click();
await page.getByText('Volkswagen').click();
// NEW
await page.locator('[data-testid="brand-card-volkswagen"]').or(
  page.locator('[data-testid="brand-card-other"]')
).first().click();
// If VW is in "Andere" category, may need adjustment
```

### 01-landing-page.spec.ts (92 lines, 7 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should load landing page in German | `text=Wie funktioniert es`, `text=FAQ`, `text=Anmelden`, `text=Jetzt buchen` | **HIGH** | Nav links change. "FAQ" removed from nav. "Wie funktioniert es" becomes "So funktioniert's". |
| should switch language | `button:has-text("...")` flag | **Medium** | Language switcher may be restyled |
| should display all portal cards | `text=Für Kunden`, `text=Für Jockeys`, `text=Für Werkstätten` | **HIGH** | PortalCards section REMOVED from landing |
| should display value propositions | `text=Festpreis-Garantie`, `text=Zertifizierte Werkstätten`, `text=Hol- & Bringservice` | **HIGH** | ValueProps section REMOVED from landing |
| should display FAQ section | `text=Häufig gestellte Fragen`, `[data-state="closed"]` | **HIGH** | FAQ section REMOVED from landing |
| should navigate to booking from CTA | `text=Jetzt buchen` | **Medium** | CTA text changes to "Jetzt Termin buchen" |

**This file needs a FULL REWRITE.** New tests:
```typescript
test('should load landing page with new sections', async ({ page }) => {
  await page.goto('/de');
  await expect(page.locator('header')).toBeVisible();
  await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="how-it-works-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="services-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="trust-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="cta-banner"]')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('should navigate to booking from hero CTA', async ({ page }) => {
  await page.goto('/de');
  await page.locator('[data-testid="hero-cta-primary"]').click();
  await expect(page).toHaveURL(/\/de\/booking/);
});
```

### 01-complete-booking-journey.spec.ts (496 lines, 9 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| Step 1: Vehicle | `[role="combobox"]`, `[role="option"]`, `#year`, `#mileage` | **High** | Brand combobox -> card grid |
| Step 2: Service | `[data-testid="service-card-inspection"]` | **None** | Preserved |
| Step 3: Pickup | `button:has-text("Morgen")`, `.grid.grid-cols-5`, `button:has-text("+1 Woche")`, `#street` | **Medium** | Calendar/time slot changes |
| Step 4: Confirm | `#firstName`, `#terms`, `button:has-text("Jetzt kostenpflichtig buchen")` | **None** | Preserved |
| Steps 5-9: API | Pure API + dashboard login | **None** | Login selectors unchanged |

### 02-booking-flow.spec.ts (158 lines, 4 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should complete full booking journey | `[role="combobox"]`, `#year`, `#mileage`, `[data-testid="service-card-inspection"]`, `.grid.grid-cols-5` | **High** | Brand combobox -> card grid; year -> select |
| should show validation errors | `button:has-text("Weiter")` disabled check | **None** | Still valid |
| should navigate back | `button:has-text("Zurück")` | **None** | Still valid |
| should display step indicators | `text=Fahrzeug`, `text=Service`, `text=Abholung`, `text=Bestätigung` | **Medium** | Step labels change: "Abholung" -> "Termin", "Bestätigung" -> "Übersicht" |

**Fix for step indicators:**
```typescript
// OLD
await expect(page.getByText('Abholung', { exact: true })).toBeVisible();
await expect(page.getByText('Bestätigung', { exact: true })).toBeVisible();
// NEW
await expect(page.getByText('Termin', { exact: true })).toBeVisible();
await expect(page.getByText('Übersicht', { exact: true })).toBeVisible();
```

### 03-customer-portal.spec.ts (129 lines, 7 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should display customer login | `[data-testid="customer-*-input"]` | **None** | Login unchanged |
| should login successfully | Dashboard redirect + `text=Willkommen zurück` | **None** | Greeting preserved |
| should display dashboard with stats | `text=Aktive Buchungen`, `text=Gespeicherte Fahrzeuge` | **HIGH** | Stat cards replaced with different stats (Services, Nächster Termin, Bewertung) |
| should display dashboard with nav | `text=Dashboard`, `text=Neue Buchung`, `text=Meine Buchungen` | **HIGH** | Sidebar navigation REMOVED, replaced by bottom nav |
| should display recent bookings | `text=Meine Buchungen` or `text=Keine Buchungen vorhanden` | **Medium** | Section renamed to "Vergangene Buchungen" |
| should navigate to new booking | `text=Neue Buchung` sidebar link | **HIGH** | Sidebar removed; booking via bottom nav `[data-testid="bnav-booking"]` |
| should logout | `text=Abmelden` or `svg.lucide-log-out` | **Medium** | Logout location changes |

**Major changes needed:**
```typescript
// OLD
await expect(page.locator('text=Aktive Buchungen')).toBeVisible();
await expect(page.locator('text=Gespeicherte Fahrzeuge')).toBeVisible();
// NEW
await expect(page.locator('[data-testid="quick-stats-row"]')).toBeVisible();
// Or check for new stat labels
await expect(page.locator('[data-testid="stat-services"]')).toBeVisible();

// OLD (sidebar nav)
await expect(page.locator('text=Dashboard').first()).toBeVisible();
await expect(page.locator('text=Neue Buchung').first()).toBeVisible();
// NEW (bottom nav)
await expect(page.locator('[data-testid="customer-bottom-nav"]')).toBeVisible();
await expect(page.locator('[data-testid="bnav-home"]')).toBeVisible();
await expect(page.locator('[data-testid="bnav-booking"]')).toBeVisible();
```

### 04-jockey-portal.spec.ts (131 lines, 6 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should display jockey login | `[data-testid="jockey-*"]` | **None** | Login unchanged |
| should login successfully | Dashboard redirect | **None** | URL unchanged |
| should display dashboard with assignments | `text=Heutige Aufträge`, `[data-testid="booking-status"]` | **Medium** | Section heading may change to "Aktueller Auftrag" |
| should display assignment card | `[data-testid="booking-status"]` | **None** | Preserved on new cards |
| should show nav/call buttons | `text=Navigieren`, `text=Anrufen` | **Medium** | Button text changes to "Navigation" / "Anrufen" in new cards |
| should logout | `svg.lucide-log-out` | **Medium** | Logout moves to profile or header |

### 05-workshop-portal.spec.ts (101 lines, 8 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should display workshop login | `[data-testid="workshop-*"]` | **None** | Login unchanged |
| should login successfully | Dashboard redirect | **None** | -- |
| should display dashboard with stats | `[class*="card"]` | **None** | Cards still exist in Kanban |
| should display orders table | `text=Keine Aufträge` | **Medium** | Empty state text may change |
| should display table columns | `table`, `text=Kunde`, `text=Status` | **HIGH** | Table REMOVED. Replace with Kanban assertions |
| should show action buttons | `text=Details`, `text=Erweiterung` | **Medium** | Button location changes to Kanban cards |
| should display status badges | `[class*="badge"]` | **None** | Badges preserved on Kanban cards |
| should logout | `svg.lucide-log-out` | **Medium** | Logout moves to header/profile |

**Fix for table columns test:**
```typescript
// OLD
const hasTable = await page.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
if (hasTable) {
  await expect(page.locator('text=Kunde').first()).toBeVisible();
  await expect(page.locator('text=Status').first()).toBeVisible();
}
// NEW
const hasKanban = await page.locator('[data-testid="kanban-board"]').isVisible({ timeout: 3000 }).catch(() => false);
if (hasKanban) {
  await expect(page.locator('[data-testid="kanban-column-new"]')).toBeVisible();
  await expect(page.locator('[data-testid="kanban-column-inProgress"]')).toBeVisible();
  await expect(page.locator('[data-testid="kanban-column-completed"]')).toBeVisible();
}
```

### 06-multi-language.spec.ts (143 lines, 11 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| should display German content | `text=Preis berechnen`, `text=So funktioniert's` | **HIGH** | "Preis berechnen" -> "Jetzt Termin buchen" |
| should navigate directly to EN | `text=Get Your Quote`, `text=How It Works` | **HIGH** | "Get Your Quote" -> "Book appointment now" |
| should persist language | `text=Get Your Quote` click | **HIGH** | Same CTA text change |
| should translate portal names | `text=Kunden`, `text=Fahrer`, `text=Werkstatt` | **HIGH** | PortalCards removed from landing |
| should translate booking flow (DE) | `text=Fahrzeug` | **None** | Still exists in booking flow |
| should translate booking flow (EN) | `text=Vehicle` | **None** | Still exists |
| should translate login pages | `text=Anmelden`, `text=Sign In` | **None** | Login unchanged |
| should translate dashboard stats (DE) | `text=Aktive Buchungen`, `text=Gespeicherte Fahrzeuge` | **HIGH** | Stats changed |
| should translate FAQ section | `text=Häufig gestellte Fragen` | **HIGH** | FAQ removed from landing |
| should translate footer sections | `link=Impressum`, `link=Privacy` | **None** | Footer links preserved |
| should handle language switching | `button:has-text("...")` flag, `text=Get Your Quote` | **HIGH** | Flag button and CTA text changes |

### 07-extension-approval-flow.spec.ts (172 lines, 9 tests)

| Test | Selectors | Impact | Fix |
|------|-----------|--------|-----|
| notification bell | `getByLabel('Benachrichtigungen')` | **Medium** | Bell moves to new CustomerHeader |
| notification popover | `[data-radix-popper-content-wrapper]` | **None** | Radix popover preserved |
| full notifications page | Direct navigation | **None** | URL unchanged |
| workshop dashboard | Direct navigation | **None** | -- |
| customer dashboard bookings | `text=Buchungen`, `[class*="card"]` | **Medium** | Section heading changes |
| extension modal (component tests) | Dashboard navigation only | **None** | Tests are stubs that just verify dashboard loads |

### 08-extension-integration.spec.ts (127 lines)

Same pattern as 07 -- mostly stub tests that verify pages load. **Low impact.**

### 09-complete-e2e-journey.spec.ts (801 lines)

| Area | Impact | Key Changes |
|------|--------|-------------|
| Booking creation | **High** | Brand combobox -> card grid |
| Customer dashboard verification | **Medium** | Sidebar nav references |
| Workshop interactions | **High** | Table `tr` -> Kanban cards |
| Extension flow | **High** | Tab selectors, payment button |

### 10-complete-e2e-with-auth.spec.ts (385 lines)

Similar to 09 -- booking flow + portal verification. **High impact** on vehicle step and workshop table selectors.

### 11-jockey-handover-flow.spec.ts (267 lines)

| Test | Impact | Notes |
|------|--------|-------|
| Handover via API | **None** | API-driven status changes |
| Dashboard screenshots | **None** | Screenshot-only, no UI selectors |
| HandoverModal interaction | **Medium** | If modal preserved as wrapper, existing `[role="dialog"]` selectors work |

### 12-extension-flow.spec.ts (241 lines)

| Test | Impact | Notes |
|------|--------|-------|
| Workshop creates extension | **High** | Table `tr` -> Kanban card selectors |
| Customer approves extension | **High** | Tab selectors, payment button changes |
| Demo payment | **High** | "Pay with Demo" button removed |

### 13-return-journey.spec.ts (262 lines)

| Test | Impact | Notes |
|------|--------|-------|
| Return assignment via API | **None** | API-driven |
| Dashboard screenshots | **None** | Screenshot-only |

---

## 6. data-testid Strategy

This is the most critical section. Adding `data-testid` attributes to all new (and some existing) components ensures test resilience against future design changes.

### 6.1 Landing Page Components

| data-testid | Component File | Element |
|-------------|---------------|---------|
| `landing-navbar` | `components/landing/Header.tsx` (rewritten) | `<nav>` root element |
| `hero-section` | `components/landing/Hero.tsx` (rewritten) | `<section>` root |
| `hero-cta-primary` | `components/landing/Hero.tsx` | Primary CTA button ("Jetzt Termin buchen") |
| `hero-cta-secondary` | `components/landing/Hero.tsx` | Secondary CTA ("So funktioniert's") |
| `how-it-works-section` | `components/landing/HowItWorks.tsx` (rewritten) | `<section id="how-it-works">` root |
| `services-section` | `components/landing/services-showcase.tsx` (new) | `<section id="services">` root |
| `landing-service-card-{serviceId}` | `components/landing/landing-service-card.tsx` (new) | Each service card |
| `trust-section` | `components/landing/trust-social-proof.tsx` (new) | `<section id="trust">` root |
| `cta-banner` | `components/landing/cta-banner.tsx` (new) | CTA banner strip |
| `cta-banner-button` | `components/landing/cta-banner.tsx` | CTA banner button |
| `landing-footer` | `components/landing/Footer.tsx` | `<footer>` root |

### 6.2 Booking Flow Components

| data-testid | Component File | Element |
|-------------|---------------|---------|
| `booking-step-indicator` | `components/booking/StepIndicator.tsx` | Step indicator container |
| `booking-step-{n}` | `components/booking/StepIndicator.tsx` | Each step circle (1-4) |
| `brand-card-grid` | `components/booking/BrandCardGrid.tsx` (new) | Brand selection grid container |
| `brand-card-{brandId}` | `components/booking/BrandCard.tsx` (new) | Each brand card (e.g., `brand-card-bmw`, `brand-card-volkswagen`) |
| `year-select` | `components/booking/VehicleStep.tsx` | Year dropdown select |
| `mileage-input` | `components/booking/VehicleStep.tsx` | Mileage input (alias for `#mileage`) |
| `license-plate-input` | `components/booking/VehicleStep.tsx` | New license plate field |
| `service-card-{serviceId}` | `components/booking/ServiceStep.tsx` | **ALREADY EXISTS** -- preserve |
| `service-running-total` | `components/booking/ServiceStep.tsx` | Running total bar |
| `pickup-calendar` | `components/booking/PickupStep.tsx` | Inline calendar container |
| `pickup-time-slots` | `components/booking/PickupStep.tsx` | Time slot button container |
| `pickup-time-{HH:MM}` | `components/booking/PickupStep.tsx` | Each time slot pill |
| `return-time-slots` | `components/booking/PickupStep.tsx` | Return time slot container |
| `booking-summary` | `components/booking/ConfirmationStep.tsx` | Summary card container |
| `booking-submit` | `components/booking/ConfirmationStep.tsx` | Submit button |

### 6.3 Customer Portal Components

| data-testid | Component File | Element |
|-------------|---------------|---------|
| `customer-header` | `components/customer/CustomerHeader.tsx` (new) | Sticky top header |
| `customer-bottom-nav` | `components/customer/CustomerBottomNav.tsx` (new) | Fixed bottom nav |
| `bnav-home` | `components/customer/CustomerBottomNav.tsx` | Home nav item |
| `bnav-booking` | `components/customer/CustomerBottomNav.tsx` | Booking nav item |
| `bnav-chat` | `components/customer/CustomerBottomNav.tsx` | Chat nav item |
| `bnav-profile` | `components/customer/CustomerBottomNav.tsx` | Profile nav item |
| `welcome-section` | `customer/dashboard/page.tsx` | Welcome greeting area |
| `greeting-text` | `customer/dashboard/page.tsx` | Dynamic greeting text |
| `extension-alert-banner` | `components/customer/ExtensionAlertBanner.tsx` (new) | Amber extension alert |
| `extension-alert-cta` | `components/customer/ExtensionAlertBanner.tsx` | "Jetzt prüfen" button |
| `active-booking-hero` | `components/customer/ActiveBookingHeroCard.tsx` (new) | Active booking card |
| `booking-progress-timeline` | `components/customer/BookingProgressTimeline.tsx` (new) | 5-step timeline |
| `progress-step-{index}` | `components/customer/BookingProgressTimeline.tsx` | Each timeline step |
| `quick-stats-row` | `components/customer/QuickStatsRow.tsx` (new) | 3-column stats row |
| `stat-services` | `components/customer/QuickStatsRow.tsx` | Services stat card |
| `stat-next-appointment` | `components/customer/QuickStatsRow.tsx` | Next appointment stat |
| `stat-rating` | `components/customer/QuickStatsRow.tsx` | Rating stat |
| `past-bookings-section` | `customer/dashboard/page.tsx` | Past bookings list |
| `past-booking-card-{index}` | `components/customer/PastBookingCard.tsx` (new) | Past booking row |
| `booking-detail-header` | `customer/bookings/[id]/page.tsx` | Detail page header |
| `booking-back-button` | `customer/bookings/[id]/page.tsx` | Back button |
| `booking-number-copy` | `customer/bookings/[id]/page.tsx` | Copy booking number |
| `subtab-details` | `customer/bookings/[id]/page.tsx` | Details pill tab |
| `subtab-extensions` | `customer/bookings/[id]/page.tsx` | Extensions pill tab |
| `subtab-activities` | `customer/bookings/[id]/page.tsx` | Activities pill tab |
| `extension-count-badge` | `customer/bookings/[id]/page.tsx` | Extension count on tab |
| `detail-vehicle-card` | `customer/bookings/[id]/page.tsx` | Vehicle info card |
| `detail-service-card` | `customer/bookings/[id]/page.tsx` | Service info card |
| `detail-pickup-card` | `customer/bookings/[id]/page.tsx` | Pickup info card |
| `detail-delivery-card` | `customer/bookings/[id]/page.tsx` | Delivery info card |
| `detail-price-summary` | `customer/bookings/[id]/page.tsx` | Price summary card |
| `extension-pending-card` | `components/customer/ExtensionList.tsx` | Pending extension card |
| `extension-approved-card` | `components/customer/ExtensionList.tsx` | Approved extension card |
| `extension-approve-btn` | `components/customer/ExtensionList.tsx` | Approve & Pay button (on card) |
| `extension-confirm-pay` | `components/customer/ExtensionApprovalModal.tsx` | Confirm payment in modal |
| `activities-timeline` | `components/customer/BookingActivityTimeline.tsx` (new) | Activity timeline |
| `timeline-entry-{index}` | `components/customer/BookingActivityTimeline.tsx` | Timeline entry |
| `logout-button` | Layout or header component | Logout action |

### 6.4 Jockey Portal Components

| data-testid | Component File | Element |
|-------------|---------------|---------|
| `jockey-top-bar` | `components/jockey/JockeyTopBar.tsx` (new) | Dark navy header |
| `jockey-bottom-nav` | `components/jockey/JockeyBottomNav.tsx` (new) | Bottom nav container |
| `jockey-status-toggle` | `components/jockey/JockeyStatusToggle.tsx` (new) | Availability toggle |
| `jockey-summary-bar` | `components/jockey/JockeySummaryBar.tsx` (new) | Today's summary pill |
| `jockey-card-{assignmentId}` | `components/jockey/JockeyAssignmentCard.tsx` (new) | Assignment card |
| `jockey-action-{assignmentId}` | `components/jockey/JockeyAssignmentCard.tsx` | Primary action button |
| `jockey-detail-view` | `components/jockey/JockeyAssignmentDetail.tsx` (new) | Full detail view |
| `handover-checklist` | `components/jockey/HandoverChecklist.tsx` (new) | Checklist container |
| `photo-doc-grid` | `components/jockey/PhotoDocGrid.tsx` (new) | Photo grid |
| `signature-pad` | `components/jockey/SignaturePad.tsx` (new) | Signature canvas |
| `jockey-username-input` | `jockey/login/page.tsx` | **ALREADY EXISTS** -- preserve |
| `jockey-password-input` | `jockey/login/page.tsx` | **ALREADY EXISTS** -- preserve |
| `jockey-login-button` | `jockey/login/page.tsx` | **ALREADY EXISTS** -- preserve |

### 6.5 Workshop Portal Components

| data-testid | Component File | Element |
|-------------|---------------|---------|
| `workshop-top-bar` | `components/workshop/WorkshopTopBar.tsx` (new) | Desktop top bar |
| `workshop-bottom-nav` | `components/workshop/WorkshopBottomNav.tsx` (new) | Mobile bottom nav |
| `workshop-search-input` | `components/workshop/WorkshopTopBar.tsx` | Search input |
| `kanban-board` | `components/workshop/KanbanBoard.tsx` (new) | Kanban container |
| `kanban-column-new` | `components/workshop/KanbanColumn.tsx` (new) | "Neu" column |
| `kanban-column-inProgress` | `components/workshop/KanbanColumn.tsx` | "In Bearbeitung" column |
| `kanban-column-completed` | `components/workshop/KanbanColumn.tsx` | "Abgeschlossen" column |
| `kanban-card-{bookingNumber}` | `components/workshop/KanbanOrderCard.tsx` (new) | Order card in Kanban |
| `kanban-action-{bookingNumber}` | `components/workshop/KanbanOrderCard.tsx` | Primary action on card |
| `order-detail-view` | `components/workshop/OrderDetailView.tsx` (new) | Full-page detail |
| `status-timeline` | `components/workshop/StatusTimeline.tsx` (new) | Horizontal timeline |
| `inline-extension-form` | `components/workshop/InlineExtensionForm.tsx` (new) | Extension form |
| `workshop-stats-bar` | `components/workshop/WorkshopStatsBar.tsx` (new) | Stats bar |
| `workshop-username-input` | `workshop/login/page.tsx` | **ALREADY EXISTS** -- preserve |
| `workshop-password-input` | `workshop/login/page.tsx` | **ALREADY EXISTS** -- preserve |
| `workshop-login-button` | `workshop/login/page.tsx` | **ALREADY EXISTS** -- preserve |
| `booking-status` | Various badge components | **ALREADY EXISTS** -- preserve on new components |

---

## 7. Test Helpers and Utilities

### 7.1 Updated fillVehicleForm Helper (DE spec)

```typescript
/** Fill vehicle form fields -- updated for brand card grid + year dropdown */
async function fillVehicleForm(page: Page) {
  // Brand: click card (was combobox dropdown)
  await page.locator(`[data-testid="brand-card-${VEHICLE.brandLabel.toLowerCase()}"]`).or(
    page.locator(`[data-testid="brand-card-bmw"]`)
  ).click();
  await page.waitForTimeout(200);

  // Model: still a combobox (now the FIRST combobox on the page)
  await page.locator('[role="combobox"]').first().click();
  await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();

  // Year: now a dropdown select (was number input)
  const yearSelect = page.locator('[data-testid="year-select"]');
  if (await yearSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await yearSelect.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.year}")`).click();
  } else {
    // Fallback: old number input
    await page.locator('#year').fill(VEHICLE.year);
  }

  // Mileage: unchanged
  await page.locator('#mileage').fill(VEHICLE.mileage);
}
```

### 7.2 Updated pickDate Helper

```typescript
/** Pick a date in the appointment step -- supports inline and popover calendar */
async function pickDate(page: Page) {
  // Try inline calendar first (new design)
  const inlineCalendar = page.locator('[data-testid="pickup-calendar"]');
  if (await inlineCalendar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await inlineCalendar.locator('td button:not([disabled])').first().click();
    return;
  }

  // Fallback: popover calendar (old design)
  const dateBtn = page.locator('button:has-text("Abholdatum")');
  if (await dateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dateBtn.click();
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await page.locator('td button:not([disabled])').first().click();
  } else {
    const morgen = page.locator('button:has-text("Morgen")');
    if (await morgen.isVisible({ timeout: 2000 }).catch(() => false)) await morgen.click();
  }
}
```

### 7.3 Updated pickTimeSlots Helper

```typescript
/** Pick time slots -- supports new pill layout and old grid */
async function pickTimeSlots(page: Page) {
  // Pickup time
  const pickupSlots = page.locator('[data-testid="pickup-time-slots"]').or(
    page.locator('.grid.grid-cols-5')
  ).first();
  await pickupSlots.locator('button:has-text("10:00")').click();

  // Return date quick select
  const returnWeek = page.locator('button:has-text("+1 Woche")');
  if (await returnWeek.isVisible({ timeout: 2000 }).catch(() => false)) await returnWeek.click();

  // Return time
  const returnSlots = page.locator('[data-testid="return-time-slots"]').or(
    page.locator('.grid.grid-cols-5').nth(1)
  );
  await returnSlots.locator('button:has-text("14:00")').click();
}
```

### 7.4 New Helper: navigateToTab

```typescript
/** Navigate to a sub-tab in booking detail (pill-style or shadcn tabs) */
async function navigateToTab(page: Page, tabName: string) {
  // Try data-testid first (new pill tabs)
  const testIdTab = page.locator(`[data-testid="subtab-${tabName.toLowerCase()}"]`);
  if (await testIdTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await testIdTab.click();
    await page.waitForTimeout(1000);
    return;
  }

  // Fallback: role="tab" with text (old shadcn tabs)
  const roleTab = page.locator('button[role="tab"]').filter({ hasText: new RegExp(tabName, 'i') });
  if (await roleTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await roleTab.click();
    await page.waitForTimeout(1000);
    return;
  }

  // Last resort: any button with the text
  const textBtn = page.locator(`button:has-text("${tabName}")`);
  if (await textBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await textBtn.click();
    await page.waitForTimeout(1000);
  }
}
```

### 7.5 New Helper: clickBottomNav

```typescript
/** Click a bottom navigation item by test ID */
async function clickBottomNav(page: Page, item: 'home' | 'booking' | 'chat' | 'profile') {
  await page.locator(`[data-testid="bnav-${item}"]`).click();
  await page.waitForLoadState('networkidle');
}
```

### 7.6 New Helper: findWorkshopOrder (Kanban)

```typescript
/** Find a workshop order card in the Kanban board by booking number */
async function findWorkshopOrder(page: Page, bookingNumber: string) {
  // Try Kanban card first (new design)
  const kanbanCard = page.locator(`[data-testid="kanban-card-${bookingNumber}"]`).or(
    page.locator('[data-testid^="kanban-card"]', { hasText: bookingNumber })
  ).first();

  if (await kanbanCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    return kanbanCard;
  }

  // Fallback: table row (old design)
  const tableRow = page.locator('tr', { hasText: bookingNumber }).first();
  if (await tableRow.isVisible({ timeout: 3000 }).catch(() => false)) {
    return tableRow;
  }

  return null;
}
```

### 7.7 Screenshot Naming Conventions

Screenshot names follow the existing pattern: `{NNN}-{descriptive-name}.png`

No naming convention changes needed. The sequential numbering system is preserved.

New screenshots to consider adding:
- `{N}-brand-card-grid.png` (replaces brand dropdown)
- `{N}-services-showcase.png` (new landing section)
- `{N}-kanban-board.png` (replaces table view)
- `{N}-booking-activity-timeline.png` (new customer tab)

---

## 8. Test Execution Plan

### 8.1 Order of Test Updates (Aligned with Redesign Phases)

The redesign has 5 implementation phases (A-E). Test updates should follow:

```
Phase A: Foundation (CSS, standalone components)
  -> No test changes needed (new components not yet used)

Phase B: Composed Components
  -> No test changes needed (components not yet wired to pages)

Phase C: Page-Level Components (Hero, HowItWorks, VehicleStep, etc.)
  -> Update helpers: fillVehicleForm, pickDate, pickTimeSlots
  -> Update landing page tests (01-landing-page.spec.ts)
  -> Update booking flow tests (02-booking-flow.spec.ts)

Phase D: Assembly (page.tsx updates, i18n changes)
  -> Update walkthrough specs (DE + EN) with all selector changes
  -> Update numbered tests (00-13)
  -> Update portal smoke tests
  -> Update auth flow tests (logout selector)
  -> Update multi-language tests (06)

Phase E: E2E Test Updates (final sweep)
  -> Run full test suite and fix remaining failures
  -> Reset visual baselines (all screenshots will change)
  -> Add new test cases for new UI elements
```

### 8.2 Keeping Tests Passing During Phased Rollout

**Strategy: Dual-selector fallback pattern**

During the transition period when both old and new components may exist, use the `.or()` pattern:

```typescript
// Works with BOTH old and new design:
const brandSelector = page.locator('[data-testid="brand-card-bmw"]').or(
  page.locator('[role="combobox"]').first()
);
```

This ensures tests pass whether a component has been redesigned or not yet.

**Key rules during transition:**
1. **Add `data-testid` attributes FIRST** before changing any component UI
2. **Update test helpers SECOND** with dual-selector fallbacks
3. **Rewrite page-level tests THIRD** once all components in that area are updated
4. **Remove old fallback selectors LAST** once the old UI is fully gone

### 8.3 Smoke Test Strategy Between Phases

After each redesign phase, run this minimal test set to verify nothing is broken:

```bash
# Quick validation (< 2 minutes)
npx playwright test 00-quick-smoke-test.spec.ts --project=chromium-desktop

# Portal accessibility (< 3 minutes)
npx playwright test portal-smoke-tests.spec.ts --project=chromium-desktop

# Auth flows (< 2 minutes)
npx playwright test auth-flows.spec.ts --project=chromium-desktop
```

After the landing page redesign (Phase C/D for landing):
```bash
npx playwright test 01-landing-page.spec.ts --project=chromium-desktop
```

After the booking flow redesign:
```bash
npx playwright test 02-booking-flow.spec.ts --project=chromium-desktop
```

After the customer portal redesign:
```bash
npx playwright test 03-customer-portal.spec.ts --project=chromium-desktop
```

After the workshop portal redesign:
```bash
npx playwright test 05-workshop-portal.spec.ts --project=chromium-desktop
```

After ALL phases complete, run the full walkthrough:
```bash
# German walkthrough
npx playwright test walkthrough-de-unified --project=chromium-desktop

# English walkthrough
npx playwright test walkthrough-en-unified --project=chromium-desktop

# Full suite
npx playwright test --project=chromium-desktop
```

### 8.4 Test Files by Priority

| Priority | File | Reason |
|----------|------|--------|
| P0 (must update immediately) | `walkthrough-de-unified.spec.ts` | Core demo walkthrough |
| P0 | `walkthrough-en-unified.spec.ts` | Core demo walkthrough |
| P1 (update with component) | `01-landing-page.spec.ts` | Full rewrite needed (landing sections changed) |
| P1 | `02-booking-flow.spec.ts` | Vehicle step selectors break |
| P1 | `03-customer-portal.spec.ts` | Dashboard layout completely changes |
| P1 | `05-workshop-portal.spec.ts` | Table -> Kanban |
| P1 | `06-multi-language.spec.ts` | Landing text assertions break |
| P2 (update after core) | `00-demo-smoke-test.spec.ts` | Vehicle step selectors |
| P2 | `01-complete-booking-journey.spec.ts` | Vehicle step selectors |
| P2 | `04-jockey-portal.spec.ts` | Minor heading/button text changes |
| P2 | `07-extension-approval-flow.spec.ts` | Notification bell location |
| P2 | `12-extension-flow.spec.ts` | Workshop table + payment button |
| P3 (low priority) | `00-quick-smoke-test.spec.ts` | Minor section ID changes |
| P3 | `08-extension-integration.spec.ts` | Stub tests, low breakage |
| P3 | `09-complete-e2e-journey.spec.ts` | Subset of walkthrough changes |
| P3 | `10-complete-e2e-with-auth.spec.ts` | Subset of walkthrough changes |
| P3 | `11-jockey-handover-flow.spec.ts` | API-driven, low breakage |
| P3 | `13-return-journey.spec.ts` | API-driven, low breakage |
| P3 | `portal-smoke-tests.spec.ts` | Minor selector updates |
| P3 | `auth-flows.spec.ts` | Logout button location |
| N/A | QA audit specs (`qa-*.spec.ts`) | Update as a batch after all portals redesigned |
| N/A | Named specs (`master-journey`, `customer-journey`, `en-locale-flow`, etc.) | Update after core numbered tests pass |

---

*End of Test Automation & E2E Walkthrough Update Plan*
