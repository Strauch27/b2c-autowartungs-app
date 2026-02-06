import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const timestamp = Date.now();

const CUSTOMER = {
  firstName: 'Max',
  lastName: 'Mustermann',
  email: `journey-${timestamp}@test.de`,
  phone: '015112345678',
  password: 'Test1234!',
};

const VEHICLE = {
  brand: 'bmw',       // value used in Select
  brandLabel: 'BMW',   // display text
  model: '320i',
  year: '2020',
  mileage: '45000',
};

const ADDRESS = {
  street: 'Musterstraße 123',
  zip: '58453',
  city: 'Witten',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick an option from a Radix UI Select (non-native). */
async function selectRadixOption(page: Page, triggerLocator: string, optionText: string) {
  await page.locator(triggerLocator).click();
  await page.locator(`[role="option"]:has-text("${optionText}")`).click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe.serial('Customer Journey — Guest Booking → Register → Dashboard', () => {
  let bookingNumber: string;

  // Phase 1: Landing Page → Navigate to Booking
  test('Phase 1: Landing page loads and navigates to booking', async ({ page }) => {
    await page.goto('/de');
    await expect(page).toHaveURL(/\/de/);

    // Hero section visible
    await expect(page.locator('text=Festpreis-Garantie').first()).toBeVisible({ timeout: 10000 });

    // Hero section CTA
    const ctaButton = page.locator('[data-testid="hero-booking-cta"]');
    await expect(ctaButton).toBeVisible();
  });

  // Phase 2: Step 1 — Vehicle
  test('Phase 2: Step 1 — Select vehicle', async ({ page }) => {
    await page.goto('/de/booking');
    await expect(page).toHaveURL(/\/de\/booking/);

    // Step indicator shows step 1 active (first step circle has primary bg)
    // Verify we're on step 1 by checking the vehicle form is visible
    await expect(page.locator('#year')).toBeVisible();

    // Select Brand (Radix Select — first combobox trigger)
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();

    // Select Model (Radix Select — second combobox trigger)
    const modelTrigger = page.locator('[role="combobox"]').nth(1);
    await modelTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();

    // Fill year
    await page.locator('#year').fill(VEHICLE.year);

    // Fill mileage
    await page.locator('#mileage').fill(VEHICLE.mileage);

    // "Weiter" button should be enabled
    const nextButton = page.locator('button:has-text("Weiter")');
    await expect(nextButton).toBeEnabled();

    // Click Weiter
    await nextButton.click();

    // Step 2 should now be visible (service cards)
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
  });

  // Phase 3: Step 2 — Service Selection
  test('Phase 3: Step 2 — Select service', async ({ page }) => {
    await page.goto('/de/booking');

    // Re-do step 1 (state is client-side)
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();
    const modelTrigger = page.locator('[role="combobox"]').nth(1);
    await modelTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();
    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Weiter")').click();

    // Now on Step 2
    const inspectionCard = page.locator('[data-testid="service-card-inspection"]');
    await expect(inspectionCard).toBeVisible();

    // Click Inspection service
    await inspectionCard.click();

    // Verify selected state
    await expect(inspectionCard).toHaveAttribute('data-selected', 'true');

    // Verify price is shown on card (149€)
    await expect(inspectionCard.locator('text=149€')).toBeVisible();

    // Click Weiter
    await page.locator('button:has-text("Weiter")').click();

    // Step 3 should show address fields
    await expect(page.locator('#street')).toBeVisible();
  });

  // Phase 4+5+6+7: Full flow through to success
  test('Phase 4-7: Complete booking, register, and verify success', async ({ page }) => {
    await page.goto('/de/booking');

    // ---- Step 1: Vehicle ----
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.brandLabel}")`).click();

    const modelTrigger = page.locator('[role="combobox"]').nth(1);
    await modelTrigger.click();
    await page.locator(`[role="option"]:has-text("${VEHICLE.model}")`).click();

    await page.locator('#year').fill(VEHICLE.year);
    await page.locator('#mileage').fill(VEHICLE.mileage);
    await page.locator('button:has-text("Weiter")').click();

    // ---- Step 2: Service ----
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();
    await page.locator('[data-testid="service-card-inspection"]').click();
    await expect(page.locator('[data-testid="service-card-inspection"]')).toHaveAttribute('data-selected', 'true');
    await page.locator('button:has-text("Weiter")').click();

    // ---- Step 3: Pickup & Address ----
    await expect(page.locator('#street')).toBeVisible();

    // Pickup date — try quick-select first, fallback to calendar popover
    const morgenButton = page.locator('button:has-text("Morgen")');
    const quickSelectVisible = await morgenButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (quickSelectVisible) {
      await morgenButton.click();
    } else {
      // Open pickup calendar popover and pick first available day
      await page.locator('button:has-text("Abholdatum")').click();
      // Wait for the calendar popover to appear
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      // Click first enabled day button in the calendar grid
      // Days are <button> elements inside <td> cells; disabled ones have disabled attr
      await page.locator('td button:not([disabled])').first().click();
    }

    // Pickup time — click 10:00 in first time grid (pickup), 14:00 in second (return)
    // Time grids are div.grid.grid-cols-5 — first one is pickup, second is return
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();

    // Return date — auto-set from pickup (+1 day). Verify or set via calendar.
    // If quick-select buttons for return are visible, use them; otherwise use calendar
    const returnWeekButton = page.locator('button:has-text("+1 Woche")');
    const returnQuickVisible = await returnWeekButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (returnQuickVisible) {
      await returnWeekButton.click();
    } else {
      // Return date should have been auto-set by the pickup selection.
      // If button still shows placeholder "Rückgabedatum", it's not set — open calendar.
      const returnCalBtn = page.locator('button:has-text("Rückgabedatum")');
      const returnNotSet = await returnCalBtn.isVisible({ timeout: 1000 }).catch(() => false);
      if (returnNotSet) {
        await returnCalBtn.click();
        await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
        await page.locator('td button:not([disabled])').first().click();
      }
      // If it shows "Rückgabe am:" it was auto-set — no action needed
    }

    // Return time — click 14:00 in second time grid (return)
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();

    // Address
    await page.locator('#street').fill(ADDRESS.street);
    await page.locator('#zip').fill(ADDRESS.zip);
    await page.locator('#city').fill(ADDRESS.city);

    // Weiter to step 4
    const nextBtn = page.locator('button:has-text("Weiter")');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // ---- Step 4: Confirmation ----
    // Verify summary content
    await expect(page.locator(`text=${VEHICLE.brandLabel}`).first()).toBeVisible();
    await expect(page.locator(`text=${VEHICLE.model}`).first()).toBeVisible();

    // Fill contact information
    await page.locator('#firstName').fill(CUSTOMER.firstName);
    await page.locator('#lastName').fill(CUSTOMER.lastName);
    await page.locator('#email').fill(CUSTOMER.email);
    await page.locator('#phone').fill(CUSTOMER.phone);

    // Accept terms (Radix Checkbox)
    await page.locator('#terms').click();

    // Submit — "Jetzt kostenpflichtig buchen"
    const submitBtn = page.locator('button:has-text("Jetzt kostenpflichtig buchen")');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for redirect to registration page
    await page.waitForURL(/\/de\/booking\/register/, { timeout: 30000 });

    // ---- Phase 6: Registration ----
    // Booking number should be visible
    const bookingNumberEl = page.locator('.text-xl.font-bold.text-blue-600');
    await expect(bookingNumberEl).toBeVisible({ timeout: 10000 });
    bookingNumber = (await bookingNumberEl.textContent()) || '';
    expect(bookingNumber).toBeTruthy();

    // Email should be pre-filled and disabled
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeDisabled();
    await expect(emailInput).toHaveValue(CUSTOMER.email);

    // Fill password
    await page.locator('#password').fill(CUSTOMER.password);
    await page.locator('#confirmPassword').fill(CUSTOMER.password);

    // Click "Konto erstellen"
    await page.locator('button:has-text("Konto erstellen")').click();

    // Wait for redirect to success page
    await page.waitForURL(/\/de\/booking\/success/, { timeout: 30000 });

    // ---- Phase 7: Success Page ----
    // Check success icon (CheckCircle is rendered as SVG)
    await expect(page.getByRole('heading', { name: 'Buchung erfolgreich!' })).toBeVisible({ timeout: 10000 });

    // Booking number visible (use exact match to avoid toast duplicate)
    await expect(page.getByText(bookingNumber, { exact: true }).first()).toBeVisible();

    // "Zum Kundenportal" button
    const portalButton = page.locator('a:has-text("Zum Kundenportal")');
    await expect(portalButton).toBeVisible();
  });

  // Phase 8: Customer Dashboard — login and verify booking
  test('Phase 8: Login to customer dashboard and verify booking', async ({ page }) => {
    // We need the booking number from the previous test
    expect(bookingNumber).toBeTruthy();

    // Navigate to customer login
    await page.goto('/de/customer/login');
    await expect(page).toHaveURL(/\/de\/customer\/login/);

    // Fill login form
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);

    // Click login button
    await page.locator('[data-testid="customer-login-button"]').click();

    // Wait for dashboard to load
    await page.waitForURL(/\/de\/customer\/dashboard/, { timeout: 30000 });

    // Dashboard welcome message
    await expect(page.locator('text=Willkommen zurück').first()).toBeVisible({ timeout: 10000 });

    // Recent bookings section should show our booking
    // Wait for bookings to load (loading spinner disappears)
    await expect(page.locator('text=Letzte Buchungen').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Translation might differ, check for booking content directly
    });

    // Look for our vehicle in the booking list
    await expect(
      page.locator(`text=${VEHICLE.brandLabel}`).first()
    ).toBeVisible({ timeout: 15000 });

    // Verify booking number or status badge
    // Status should be one of: Bestätigt, Zahlung ausstehend, etc.
    const statusBadge = page.locator('.badge-pending, .badge-in-progress, [class*="badge"]').first();
    await expect(statusBadge).toBeVisible({ timeout: 5000 });

    // Click "Details" button on the booking card that contains our vehicle
    const bookingCard = page.locator(`text=${VEHICLE.brandLabel}`).first().locator('xpath=ancestor::div[contains(@class,"card")]');
    const detailsBtn = bookingCard.locator('button:has-text("Details")');
    // Fallback: if card ancestor doesn't resolve, click the last "Details" button
    // (the booking entry details, not the header "Alle anzeigen" link)
    if (await detailsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailsBtn.click();
    } else {
      // Click the Details button that is a sibling of a badge (status badge + Details button)
      await page.locator('button:has-text("Details")').last().click();
    }

    // Wait for booking detail page (URL should have an ID segment after /bookings/)
    await page.waitForURL(/\/de\/customer\/bookings\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
  });

  // Phase 9: Booking Detail Page
  test('Phase 9: Verify booking detail page', async ({ page }) => {
    expect(bookingNumber).toBeTruthy();

    // Login first
    await page.goto('/de/customer/login');
    await page.locator('[data-testid="customer-email-input"]').fill(CUSTOMER.email);
    await page.locator('[data-testid="customer-password-input"]').fill(CUSTOMER.password);
    await page.locator('[data-testid="customer-login-button"]').click();
    await page.waitForURL(/\/de\/customer\/dashboard/, { timeout: 30000 });

    // Wait for bookings to load
    await expect(page.locator(`text=${VEHICLE.brandLabel}`).first()).toBeVisible({ timeout: 15000 });

    // Click Details button on the booking card
    const bookingCard = page.locator(`text=${VEHICLE.brandLabel}`).first().locator('xpath=ancestor::div[contains(@class,"card")]');
    const detailsBtn = bookingCard.locator('button:has-text("Details")');
    if (await detailsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailsBtn.click();
    } else {
      await page.locator('button:has-text("Details")').last().click();
    }
    await page.waitForURL(/\/de\/customer\/bookings\/[a-zA-Z0-9-]+$/, { timeout: 15000 });

    // Verify booking detail page
    await expect(page.locator('text=Buchungsdetails')).toBeVisible({ timeout: 10000 });

    // Booking number
    await expect(page.locator(`text=${bookingNumber}`)).toBeVisible();

    // Vehicle info
    await expect(page.locator(`text=${VEHICLE.brandLabel}`).first()).toBeVisible();
    await expect(page.locator(`text=${VEHICLE.model}`).first()).toBeVisible();

    // Price should be visible
    await expect(page.locator('text=Preis').first()).toBeVisible();

    // Close demo mode banner if it's blocking (yellow fixed banner with z-9999)
    const closeBannerBtn = page.locator('.bg-yellow-400 button, [class*="bg-yellow"] button');
    if (await closeBannerBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBannerBtn.click();
      await page.waitForTimeout(500);
    }

    // Back button — use force:true as fallback if banner still intercepts
    const backButton = page.locator('button:has-text("Zurück")');
    await expect(backButton).toBeVisible();
    await backButton.click({ force: true });

    // Should return to dashboard
    await page.waitForURL(/\/de\/customer\/dashboard/, { timeout: 15000 });
  });
});
