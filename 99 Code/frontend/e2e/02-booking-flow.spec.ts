import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test('should complete full booking journey', async ({ page }) => {
    // Start at booking page
    await page.goto('/de/booking');

    // ========================================================================
    // STEP 1: Vehicle Information
    // ========================================================================
    await expect(page.locator('text=Fahrzeugdaten')).toBeVisible();

    // Fill vehicle brand
    await page.locator('button:has-text("Marke auswählen")').click();
    await page.locator('text=BMW').first().click();

    // Fill vehicle model
    await page.locator('button:has-text("Modell auswählen")').click();
    await page.locator('text=3er').first().click();

    // Fill year
    await page.locator('button:has-text("Baujahr auswählen")').click();
    await page.locator('text=2020').first().click();

    // Fill mileage
    await page.locator('input[placeholder*="km"]').fill('50000');

    // Check "Save vehicle" checkbox
    await page.locator('label:has-text("Fahrzeug speichern")').click();

    // Click Next
    await page.locator('button:has-text("Weiter")').click();

    // ========================================================================
    // STEP 2: Service Selection
    // ========================================================================
    await expect(page.locator('text=Service auswählen')).toBeVisible();

    // Select Oil Service
    await page.locator('text=Ölwechsel').click();

    // Select Inspection
    await page.locator('text=Inspektion').click();

    // Verify price is displayed
    await expect(page.locator('text=€').or(page.locator('text=EUR'))).toBeVisible();

    // Click Next
    await page.locator('button:has-text("Weiter")').click();

    // ========================================================================
    // STEP 3: Pickup & Delivery
    // ========================================================================
    await expect(page.locator('text=Abholung')).toBeVisible();

    // Select pickup date (3 days from now)
    const pickupDateButton = page.locator('button:has-text("Datum wählen")').first();
    await pickupDateButton.click();

    // Select a date in the calendar (just click the first available date)
    const futureDates = page.locator('[data-state="closed"]:not([data-disabled])').first();
    if (await futureDates.isVisible()) {
      await futureDates.click();
    } else {
      // Fallback: just close the calendar
      await page.keyboard.press('Escape');
    }

    // Select pickup time
    await page.locator('button:has-text("Zeitfenster wählen")').first().click();
    await page.locator('text=09:00-11:00').first().click();

    // Select delivery date
    const deliveryDateButton = page.locator('button:has-text("Datum wählen")').nth(1);
    await deliveryDateButton.click();

    // Select delivery date
    const deliveryDates = page.locator('[data-state="closed"]:not([data-disabled])').first();
    if (await deliveryDates.isVisible()) {
      await deliveryDates.click();
    } else {
      await page.keyboard.press('Escape');
    }

    // Select delivery time
    await page.locator('button:has-text("Zeitfenster wählen")').nth(1).click();
    await page.locator('text=17:00-19:00').first().click();

    // Fill address
    await page.locator('input[placeholder*="Straße"]').fill('Musterstraße 123');
    await page.locator('input[placeholder*="PLZ"]').fill('58453');
    await page.locator('input[placeholder*="Stadt"]').fill('Witten');

    // Click Next
    await page.locator('button:has-text("Weiter")').click();

    // ========================================================================
    // STEP 4: Confirmation
    // ========================================================================
    await expect(page.locator('text=Zusammenfassung')).toBeVisible();

    // Verify vehicle info is shown
    await expect(page.locator('text=BMW')).toBeVisible();

    // Verify services are shown
    await expect(page.locator('text=Ölwechsel').or(page.locator('text=Inspektion'))).toBeVisible();

    // Verify total price
    await expect(page.locator('text=Gesamt').or(page.locator('text=Total'))).toBeVisible();

    // Accept terms
    await page.locator('label:has-text("AGB")').click();

    // Note: We don't actually submit because it would create real data
    // Just verify the submit button is enabled
    const submitButton = page.locator('button:has-text("Buchung abschließen")').or(
      page.locator('button:has-text("Jetzt verbindlich buchen")')
    );
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

    // Fill step 1
    await page.locator('button:has-text("Marke auswählen")').click();
    await page.locator('text=VW').first().click();
    await page.locator('button:has-text("Modell auswählen")').click();
    await page.locator('text=Golf').first().click();
    await page.locator('button:has-text("Baujahr auswählen")').click();
    await page.locator('text=2019').first().click();
    await page.locator('input[placeholder*="km"]').fill('60000');
    await page.locator('button:has-text("Weiter")').click();

    // Now on step 2
    await expect(page.locator('text=Service auswählen')).toBeVisible();

    // Click back
    await page.locator('button:has-text("Zurück")').click();

    // Should be back on step 1
    await expect(page.locator('text=Fahrzeugdaten')).toBeVisible();

    // Verify data is preserved
    await expect(page.locator('button:has-text("VW")')).toBeVisible();
  });

  test('should display step indicators correctly', async ({ page }) => {
    await page.goto('/de/booking');

    // Check all 4 steps are shown
    await expect(page.locator('text=Fahrzeug')).toBeVisible();
    await expect(page.locator('text=Service')).toBeVisible();
    await expect(page.locator('text=Abholung')).toBeVisible();
    await expect(page.locator('text=Bestätigung').or(page.locator('text=Zusammenfassung'))).toBeVisible();
  });
});
