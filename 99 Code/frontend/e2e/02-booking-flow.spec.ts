import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test('should complete full booking journey', async ({ page }) => {
    // Start at booking page
    await page.goto('/de/booking');

    // ========================================================================
    // STEP 1: Vehicle Information
    // ========================================================================
    // Verify step 1 is visible (vehicle form with year input)
    await expect(page.locator('#year')).toBeVisible();

    // Select Brand (Radix Select)
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator('[role="option"]:has-text("BMW")').click();

    // Select Model (Radix Select)
    const modelTrigger = page.locator('[role="combobox"]').nth(1);
    await modelTrigger.click();
    await page.locator('[role="option"]:has-text("3er")').click();

    // Fill year
    await page.locator('#year').fill('2020');

    // Fill mileage
    await page.locator('#mileage').fill('50000');

    // Click Next
    await page.locator('button:has-text("Weiter")').click();

    // ========================================================================
    // STEP 2: Service Selection
    // ========================================================================
    const inspectionCard = page.locator('[data-testid="service-card-inspection"]');
    await expect(inspectionCard).toBeVisible();

    // Select Inspection
    await inspectionCard.click();
    await expect(inspectionCard).toHaveAttribute('data-selected', 'true');

    // Verify price is displayed (e.g., "149€")
    await expect(page.locator('text=149€').first()).toBeVisible();

    // Click Next
    await page.locator('button:has-text("Weiter")').click();

    // ========================================================================
    // STEP 3: Pickup & Delivery
    // ========================================================================
    await expect(page.locator('#street')).toBeVisible();

    // Pickup date — use quick-select if visible, else calendar
    const morgenButton = page.locator('button:has-text("Morgen")');
    if (await morgenButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await morgenButton.click();
    } else {
      // Open calendar and pick first available date
      const pickupDateBtn = page.locator('button').filter({ hasText: /Abholdatum|Abholung/ }).first();
      await pickupDateBtn.click();
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
      await page.locator('td button:not([disabled])').first().click();
    }

    // Select pickup time
    const timeGrids = page.locator('.grid.grid-cols-5');
    await timeGrids.nth(0).locator('button:has-text("10:00")').click();

    // Return date — use quick select or let auto-set handle it
    const returnWeekButton = page.locator('button:has-text("+1 Woche")');
    if (await returnWeekButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await returnWeekButton.click();
    }

    // Select return time
    await timeGrids.nth(1).locator('button:has-text("14:00")').click();

    // Fill address
    await page.locator('#street').fill('Musterstraße 123');
    await page.locator('#zip').fill('58453');
    await page.locator('#city').fill('Witten');

    // Click Next
    const nextBtn = page.locator('button:has-text("Weiter")');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // ========================================================================
    // STEP 4: Confirmation
    // ========================================================================
    // Verify vehicle info is shown
    await expect(page.locator('text=BMW').first()).toBeVisible();
    await expect(page.locator('text=3er').first()).toBeVisible();

    // Verify total price section
    await expect(page.locator('text=149€').first()).toBeVisible();

    // Fill contact information
    await page.locator('#firstName').fill('Max');
    await page.locator('#lastName').fill('Mustermann');
    await page.locator('#email').fill('booking-flow-test@test.de');
    await page.locator('#phone').fill('015112345678');

    // Accept terms
    await page.locator('#terms').click();

    // Verify the submit button is enabled
    const submitButton = page.locator('button:has-text("Jetzt kostenpflichtig buchen")');
    await expect(submitButton).toBeEnabled();
  });

  test('should show validation errors when fields are empty', async ({ page }) => {
    await page.goto('/de/booking');

    // Try to proceed without filling anything
    const nextButton = page.locator('button:has-text("Weiter")');

    // Should be disabled initially
    await expect(nextButton).toBeDisabled();
  });

  test('should navigate back through steps', async ({ page }) => {
    await page.goto('/de/booking');

    // Fill step 1 using Radix Selects
    const brandTrigger = page.locator('[role="combobox"]').first();
    await brandTrigger.click();
    await page.locator('[role="option"]:has-text("Volkswagen")').click();

    const modelTrigger = page.locator('[role="combobox"]').nth(1);
    await modelTrigger.click();
    await page.locator('[role="option"]:has-text("Golf")').click();

    await page.locator('#year').fill('2019');
    await page.locator('#mileage').fill('60000');
    await page.locator('button:has-text("Weiter")').click();

    // Now on step 2 (service selection)
    await expect(page.locator('[data-testid="service-card-inspection"]')).toBeVisible();

    // Click back
    await page.locator('button:has-text("Zurück")').click();

    // Should be back on step 1 (vehicle form visible)
    await expect(page.locator('#year')).toBeVisible();
  });

  test('should display step indicators correctly', async ({ page }) => {
    await page.goto('/de/booking');

    // Check all 4 steps are shown in the step indicator
    await expect(page.getByText('Fahrzeug', { exact: true })).toBeVisible();
    await expect(page.getByText('Service', { exact: true })).toBeVisible();
    await expect(page.getByText('Abholung', { exact: true })).toBeVisible();
    await expect(page.getByText('Bestätigung', { exact: true })).toBeVisible();
  });
});
