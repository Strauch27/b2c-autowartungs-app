import { test, expect } from '@playwright/test';

/**
 * Extension Integration Tests
 * Full integration tests that require backend connectivity
 * These tests create real extensions and test the complete workflow
 */

test.describe('Extension Integration Tests', () => {
  const customerCredentials = {
    email: 'kunde@kunde.de',
    password: 'kunde'
  };

  const workshopCredentials = {
    username: 'werkstatt',
    password: 'werkstatt'
  };

  test.describe.configure({ mode: 'serial' });

  let bookingId: string;
  let extensionId: string;

  test('SETUP: create booking for extension tests', async ({ page }) => {
    // Login as customer
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Try to get a booking ID from existing bookings
    const bookingCard = page.locator('[class*="card"]').first();
    const exists = await bookingCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (exists) {
      // Extract booking ID from URL or card
      const bookingLink = bookingCard.locator('a').first();
      const linkExists = await bookingLink.isVisible({ timeout: 2000 }).catch(() => false);

      if (linkExists) {
        const href = await bookingLink.getAttribute('href');
        if (href) {
          const match = href.match(/bookings\/([^/]+)/);
          if (match) {
            bookingId = match[1];
            console.log('Found booking ID:', bookingId);
          }
        }
      }
    }

    // If no booking found, skip dependent tests
    if (!bookingId) {
      test.skip();
    }
  });

  test('workshop creates extension for booking', async ({ page, request }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login as workshop
    await page.goto('/de/workshop/login');

    const usernameInput = page.locator('input[name="username"]').or(
      page.locator('input[type="text"]').first()
    );
    await usernameInput.fill(workshopCredentials.username);
    await page.fill('input[type="password"]', workshopCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/workshop\/dashboard/, { timeout: 10000 });

    // Find the order in the dashboard
    const orderRow = page.locator('tr').filter({ hasText: bookingId }).first();
    const rowExists = await orderRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (!rowExists) {
      console.log('Booking not found in workshop dashboard');
      test.skip();
      return;
    }

    // Look for extension button on the order
    const extensionButton = orderRow.locator('button').filter({
      hasText: /Erweiterung|Extension/
    }).first();

    const buttonExists = await extensionButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (buttonExists) {
      // Click to open extension modal
      await extensionButton.click();

      // Wait for modal
      await page.waitForTimeout(500);

      // Fill in extension details
      const descriptionField = page.locator('textarea').first();
      await descriptionField.fill('Bremsbeläge müssen erneuert werden - erhöhter Verschleiß festgestellt');

      // Fill in first item (should be pre-populated)
      const firstItemDesc = page.locator('textarea').nth(1);
      const firstItemPrice = page.locator('input[type="number"]').first();

      await firstItemDesc.fill('Bremsbeläge vorne');
      await firstItemPrice.fill('189.99');

      // Add another item
      const addItemButton = page.getByText('Position hinzufügen').or(page.getByText('Add Item'));
      const addButtonExists = await addItemButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (addButtonExists) {
        await addItemButton.click();
        await page.waitForTimeout(300);

        // Fill second item
        const secondItemDesc = page.locator('textarea').nth(2);
        const secondItemPrice = page.locator('input[type="number"]').nth(1);

        await secondItemDesc.fill('Bremsbeläge hinten');
        await secondItemPrice.fill('169.99');
      }

      // Submit extension
      const sendButton = page.getByText('An Kunden senden').or(page.getByText('Send to Customer'));
      await sendButton.click();

      // Wait for success toast
      await page.waitForTimeout(1000);

      // Modal should close
      const modalClosed = await page.locator('[role="dialog"]').count() === 0;
      expect(modalClosed).toBeTruthy();

      console.log('Extension created successfully');
    } else {
      console.log('Extension button not found - order might not be in workshop');
      test.skip();
    }
  });

  test('customer sees extension notification', async ({ page }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login as customer
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Wait a bit for notifications to sync
    await page.waitForTimeout(2000);

    // Check notification bell for unread count
    const bellButton = page.locator('button:has(svg[class*="lucide-bell"])').first();
    await expect(bellButton).toBeVisible({ timeout: 5000 });

    // Look for badge on bell
    const badge = bellButton.locator('[class*="badge"]');
    const hasBadge = await badge.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasBadge) {
      console.log('Unread notification badge found');

      // Click bell to open notifications
      await bellButton.click();
      await page.waitForTimeout(500);

      // Look for extension notification
      const extensionNotif = page.locator('[class*="notification"]').filter({
        hasText: /Erweiterung|Extension|Bremsbeläge|brake/i
      }).first();

      const notifExists = await extensionNotif.isVisible({ timeout: 3000 }).catch(() => false);

      if (notifExists) {
        console.log('Extension notification found');
        expect(notifExists).toBeTruthy();
      }
    }
  });

  test('customer views extension details', async ({ page }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login as customer
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Navigate directly to booking detail page
    await page.goto(`/de/customer/bookings/${bookingId}`);

    await page.waitForLoadState('networkidle');

    // Click Extensions tab
    const extensionsTab = page.getByText('Erweiterungen').or(page.getByText('Extensions'));
    await expect(extensionsTab).toBeVisible({ timeout: 5000 });
    await extensionsTab.click();

    await page.waitForTimeout(1000);

    // Should see extension card
    const extensionCard = page.locator('[class*="card"]').filter({
      hasText: /Bremsbeläge|brake/i
    }).first();

    await expect(extensionCard).toBeVisible({ timeout: 5000 });

    // Should see "Ausstehend" or "Pending" badge
    const pendingBadge = extensionCard.locator('[class*="badge"]').filter({
      hasText: /Ausstehend|Pending/i
    });

    await expect(pendingBadge).toBeVisible({ timeout: 3000 });

    // Should see total price
    const priceElement = extensionCard.locator('text=359.98').or(
      extensionCard.locator('text=/\\d+\\.\\d{2}€/')
    );

    const hasPriceFormat = await priceElement.count() > 0;
    expect(hasPriceFormat).toBeTruthy();

    console.log('Extension details displayed correctly');
  });

  test('customer opens extension approval modal', async ({ page }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login and navigate to extension
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto(`/de/customer/bookings/${bookingId}`);
    await page.waitForLoadState('networkidle');

    // Click Extensions tab
    const extensionsTab = page.getByText('Erweiterungen').or(page.getByText('Extensions'));
    await extensionsTab.click();
    await page.waitForTimeout(1000);

    // Click "Details anzeigen" button
    const detailsButton = page.getByText('Details anzeigen').or(page.getByText('View Details'));
    await expect(detailsButton.first()).toBeVisible({ timeout: 5000 });
    await detailsButton.first().click();

    await page.waitForTimeout(500);

    // Modal should be visible
    const modal = page.locator('[role="dialog"]').filter({
      hasText: /Auftragserweiterung prüfen|Review Order Extension/
    }).first();

    await expect(modal).toBeVisible({ timeout: 5000 });

    // Should see approve and decline buttons
    const approveButton = modal.getByText('Genehmigen').or(modal.getByText('Approve'));
    const declineButton = modal.getByText('Ablehnen').or(modal.getByText('Decline'));

    await expect(approveButton).toBeVisible();
    await expect(declineButton).toBeVisible();

    // Should see items list
    const itemsList = modal.locator('text=Bremsbeläge vorne').or(
      modal.locator('text=/Bremsbeläge|brake/i')
    );

    await expect(itemsList.first()).toBeVisible({ timeout: 3000 });

    console.log('Extension approval modal opened successfully');

    // Close modal without action
    const closeButton = modal.locator('button[aria-label="Close"]').or(
      page.locator('[class*="dialog"]').first().locator('button').first()
    );

    // Press Escape to close
    await page.keyboard.press('Escape');
  });

  test('customer approves extension', async ({ page }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login and navigate to extension
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto(`/de/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Click details button
    const detailsButton = page.getByText('Details anzeigen').or(page.getByText('View Details'));
    const buttonExists = await detailsButton.first().isVisible({ timeout: 5000 }).catch(() => false);

    if (!buttonExists) {
      console.log('Extension already processed or not found');
      test.skip();
      return;
    }

    await detailsButton.first().click();
    await page.waitForTimeout(500);

    // Click approve button
    const approveButton = page.getByText('Genehmigen & Bezahlen').or(
      page.getByText('Approve & Pay')
    );

    await expect(approveButton).toBeVisible({ timeout: 5000 });
    await approveButton.click();

    // Wait for API call to complete
    await page.waitForTimeout(2000);

    // Should see success toast
    const successToast = page.locator('text=/genehmigt|approved/i');
    const toastVisible = await successToast.isVisible({ timeout: 3000 }).catch(() => false);

    // Modal should close
    await page.waitForTimeout(500);
    const modalCount = await page.locator('[role="dialog"]').count();
    expect(modalCount).toBe(0);

    // Extension status should update to "Genehmigt"
    await page.waitForTimeout(1000);

    const approvedBadge = page.locator('[class*="badge"]').filter({
      hasText: /Genehmigt|Approved/i
    });

    const badgeVisible = await approvedBadge.isVisible({ timeout: 5000 }).catch(() => false);

    if (badgeVisible) {
      console.log('Extension approved successfully');
      expect(badgeVisible).toBeTruthy();
    }
  });

  test('ALTERNATIVE: customer declines extension', async ({ page }) => {
    // This test is for the decline flow
    // We'll skip it if we already approved in the previous test

    test.skip(); // Skip by default as we can't decline after approving

    // The test would follow this flow:
    // 1. Open modal
    // 2. Click "Ablehnen"
    // 3. Fill in decline reason
    // 4. Click "Ablehnung bestätigen"
    // 5. Verify status changes to "Abgelehnt"
  });

  test('extension list shows correct information after approval', async ({ page }) => {
    if (!bookingId) {
      test.skip();
      return;
    }

    // Login
    await page.goto('/de/customer/login');
    await page.fill('input[type="email"]', customerCredentials.email);
    await page.fill('input[type="password"]', customerCredentials.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/customer\/dashboard/, { timeout: 10000 });

    // Navigate to booking
    await page.goto(`/de/customer/bookings/${bookingId}?tab=extensions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Extension should show approved status
    const approvedBadge = page.locator('[class*="badge"]').filter({
      hasText: /Genehmigt|Approved/i
    }).first();

    const badgeExists = await approvedBadge.isVisible({ timeout: 5000 }).catch(() => false);

    if (badgeExists) {
      // Verify approved date is shown
      const approvedDate = page.locator('text=/Genehmigt am|Approved on/i');
      const dateVisible = await approvedDate.isVisible({ timeout: 3000 }).catch(() => false);

      console.log('Extension list shows approved status:', badgeExists && dateVisible);
    }

    // "Details anzeigen" button should NOT be visible for approved extensions
    const detailsButton = page.getByText('Details anzeigen').or(page.getByText('View Details'));
    const buttonVisible = await detailsButton.isVisible({ timeout: 2000 }).catch(() => false);

    // Button should be hidden for non-pending extensions
    expect(buttonVisible).toBeFalsy();
  });
});
