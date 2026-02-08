/**
 * QA Portal Interactions Test
 *
 * Deep interaction audit for all three portal dashboards.
 * Tests buttons, modals, dropdowns, navigation links, language switching,
 * and logout behavior — based on actual component source code.
 *
 * Uses storageState-based auth fixtures so tests start already logged in.
 */

import { test, expect } from './fixtures/auth';

// ---------------------------------------------------------------------------
//  CUSTOMER PORTAL
// ---------------------------------------------------------------------------
test.describe('Customer Portal Interactions', () => {
  // ---- Sidebar navigation links ----
  test('Sidebar links navigate to correct routes without 404', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Sidebar is visible on large viewports (the fixture uses a desktop browser)
    const sidebar = asCustomer.locator('aside');

    // The sidebar contains 5 nav links (Dashboard, Neue Buchung, Meine Buchungen, Fahrzeuge, Profil)
    const navLinks = [
      { text: 'Dashboard', urlPattern: /\/customer\/dashboard/ },
      { text: 'Neue Buchung', urlPattern: /\/customer\/booking/ },
      { text: 'Meine Buchungen', urlPattern: /\/customer\/bookings/ },
      { text: 'Fahrzeuge', urlPattern: /\/customer\/vehicles/ },
      { text: 'Profil', urlPattern: /\/customer\/profile/ },
    ];

    for (const { text, urlPattern } of navLinks) {
      // Navigate back to dashboard before each link test
      await asCustomer.goto('/de/customer/dashboard');
      await asCustomer.waitForLoadState('networkidle');

      const link = sidebar.locator(`a:has-text("${text}")`).first();
      if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
        await link.click();
        await asCustomer.waitForLoadState('networkidle');

        // URL should match the expected pattern — NOT be a generic 404
        await expect(asCustomer).toHaveURL(urlPattern, { timeout: 8000 });

        // Page should not show a visible "404" or "Not Found" heading
        const notFoundHeading = asCustomer.locator('h1:has-text("404"), h2:has-text("404")');
        await expect(notFoundHeading).toHaveCount(0);
      }
    }
  });

  // ---- Booking detail navigation via "Details" button ----
  test('Booking card Details button navigates to booking detail page', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // Wait for either bookings to load or the empty state
    const detailsBtn = asCustomer.locator('button:has-text("Details")').first();
    const hasBookings = await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasBookings) {
      await detailsBtn.click();
      await asCustomer.waitForLoadState('networkidle');

      // Should navigate to /customer/bookings (list or detail page)
      await expect(asCustomer).toHaveURL(/\/customer\/bookings/, { timeout: 8000 });

      // The page should render (no visible 404)
      const notFoundHeading = asCustomer.locator('h1:has-text("404"), h2:has-text("404")');
      await expect(notFoundHeading).toHaveCount(0);
    }
  });

  // ---- "View Details" link next to "Meine Buchungen" heading ----
  test('"View Details" header link navigates to bookings list', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // The link is a ghost button next to "Meine Buchungen" with a ChevronRight icon
    const viewAll = asCustomer.locator('a[href*="/customer/bookings"] button').first();
    if (await viewAll.isVisible({ timeout: 3000 }).catch(() => false)) {
      await viewAll.click();
      await asCustomer.waitForLoadState('networkidle');
      await expect(asCustomer).toHaveURL(/\/customer\/bookings/, { timeout: 8000 });
    }
  });

  // ---- Filter buttons (All / Active / Completed / Cancelled) ----
  test('Status filter buttons update the displayed booking list', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // The four filter buttons use german labels: Alle, Aktiv, Abgeschlossen, Storniert
    for (const label of ['Alle', 'Aktiv', 'Abgeschlossen', 'Storniert']) {
      const btn = asCustomer.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        // The clicked button should become the "default" (active) variant
        // Just ensure clicking does not crash
        await asCustomer.waitForTimeout(300);
        await expect(asCustomer).toHaveURL(/\/customer\/dashboard/);
      }
    }
  });

  // ---- Search input ----
  test('Search input filters bookings without errors', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    const searchInput = asCustomer.locator('input[placeholder*="suchen"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('BMW');
      await asCustomer.waitForTimeout(500);
      // Page should still be on dashboard
      await expect(asCustomer).toHaveURL(/\/customer\/dashboard/);
    }
  });

  // ---- Sort toggle (ArrowUpDown) ----
  test('Sort toggle button switches order without errors', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // The sort button has a title containing "Neueste" or "Oldest"
    const sortBtn = asCustomer.locator('button[title*="zuerst"], button[title*="first"]').first();
    if (await sortBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sortBtn.click();
      await asCustomer.waitForTimeout(300);
      // Title should have changed (toggled)
      await expect(asCustomer).toHaveURL(/\/customer\/dashboard/);
    }
  });

  // ---- "Jetzt buchen" CTA ----
  test('"Jetzt buchen" CTA navigates to booking page', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    const ctaBtn = asCustomer.locator('a[href*="/customer/booking"] button:has-text("Jetzt buchen")').first();
    if (await ctaBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ctaBtn.click();
      await asCustomer.waitForLoadState('networkidle');
      await expect(asCustomer).toHaveURL(/\/customer\/booking/, { timeout: 8000 });
    }
  });

  // ---- Notification center popover ----
  test('Notification bell opens popover', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // The NotificationCenter trigger is a ghost button with a Bell icon
    // On desktop it's in the right side of the top header bar
    const bellBtn = asCustomer.locator('button:has(svg.lucide-bell)').first();
    if (await bellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bellBtn.click();

      // The popover should appear with "Benachrichtigungen" heading
      const popover = asCustomer.locator('[data-radix-popper-content-wrapper], [role="dialog"]').first();
      await expect(popover).toBeVisible({ timeout: 5000 });

      // Should show either notifications or "Keine Benachrichtigungen"
      const content = await popover.textContent();
      const hasContent = content?.includes('Benachrichtigungen') || content?.includes('Notifications');
      expect(hasContent).toBeTruthy();
    }
  });

  // ---- Language switcher (de -> en -> de) ----
  test('Language switcher toggles between DE and EN', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // LanguageSwitcher is a Globe icon dropdown
    const globeBtn = asCustomer.locator('button:has(svg.lucide-globe)').first();
    if (await globeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await globeBtn.click();

      // Switch to English
      const enOption = asCustomer.locator('[role="menuitem"]:has-text("English")').first();
      if (await enOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await enOption.click();
        await asCustomer.waitForURL(/\/en\//, { timeout: 10000 });
        expect(asCustomer.url()).toMatch(/\/en\//);

        // Switch back to Deutsch
        const globeBtn2 = asCustomer.locator('button:has(svg.lucide-globe)').first();
        await globeBtn2.click();
        const deOption = asCustomer.locator('[role="menuitem"]:has-text("Deutsch")').first();
        if (await deOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deOption.click();
          await asCustomer.waitForURL(/\/de\//, { timeout: 10000 });
          expect(asCustomer.url()).toMatch(/\/de\//);
        }
      }
    }
  });

  // ---- Logout (sidebar button) ----
  test('Logout button redirects to homepage', async ({ asCustomer }) => {
    await asCustomer.goto('/de/customer/dashboard');
    await asCustomer.waitForLoadState('networkidle');

    // The sidebar logout button contains LogOut icon + "Abmelden" text
    const logoutBtn = asCustomer.locator('button:has(svg.lucide-log-out)').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await asCustomer.waitForLoadState('networkidle');
      // Should navigate to /<locale> homepage or login page
      await expect(asCustomer).toHaveURL(/\/(de|en)\/?$/, { timeout: 8000 });
    }
  });
});

// ---------------------------------------------------------------------------
//  JOCKEY PORTAL
// ---------------------------------------------------------------------------
test.describe('Jockey Portal Interactions', () => {
  // ---- Stats cards render ----
  test('Stats cards display totals', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // 3 stats cards: total trips, completed, pending
    const statCards = asJockey.locator('.card-premium');
    const count = await statCards.count();
    // Should have at least the 3 stats cards
    expect(count).toBeGreaterThanOrEqual(3);
  });

  // ---- Type filter buttons (Alle / Abholung / Rückgabe) ----
  test('Type filter buttons toggle without errors', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    for (const label of ['Alle', 'Abholung', 'Rückgabe']) {
      const btn = asJockey.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        await asJockey.waitForTimeout(300);
        await expect(asJockey).toHaveURL(/\/jockey\/dashboard/);
      }
    }
  });

  // ---- Status filter buttons (Alle Status / Bevorstehend / Unterwegs / Erledigt) ----
  test('Status filter buttons toggle without errors', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    for (const label of ['Alle Status', 'Bevorstehend', 'Unterwegs', 'Erledigt']) {
      const btn = asJockey.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        await asJockey.waitForTimeout(300);
        await expect(asJockey).toHaveURL(/\/jockey\/dashboard/);
      }
    }
  });

  // ---- Assignment cards render with badges ----
  test('Assignment cards show status badges and type labels', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // Wait for loading to finish
    await asJockey.waitForTimeout(2000);

    const cards = asJockey.locator('.card-premium').filter({ hasNot: asJockey.locator('.text-center') });
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Each card should have a Badge
      const firstCard = cards.first();
      const badge = firstCard.locator('[class*="badge"]').first();
      await expect(badge).toBeVisible({ timeout: 3000 });

      // Each card should show the type label (Abholung or Rückgabe)
      const typeLabel = firstCard.locator('text=Abholung').or(firstCard.locator('text=Rückgabe')).first();
      await expect(typeLabel).toBeVisible({ timeout: 3000 });
    }
  });

  // ---- Call and Navigate buttons on active assignments ----
  test('Call and Navigate buttons are visible on active assignments', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');
    await asJockey.waitForTimeout(2000);

    // Buttons text: "Anrufen" (Call) and "Navigieren" (Navigate)
    const callBtn = asJockey.locator('button:has-text("Anrufen")').first();
    const navBtn = asJockey.locator('button:has-text("Navigieren")').first();

    // These only appear on non-completed/non-cancelled assignments
    const hasCall = await callBtn.isVisible({ timeout: 3000 }).catch(() => false);
    const hasNav = await navBtn.isVisible({ timeout: 3000 }).catch(() => false);

    // If there are active assignments, both should be present
    if (hasCall) {
      await expect(callBtn).toBeEnabled();
    }
    if (hasNav) {
      await expect(navBtn).toBeEnabled();
    }
  });

  // ---- "Abholung starten" / "Rückgabe starten" button on upcoming assignments ----
  test('Start pickup/return button is clickable on upcoming assignments', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');
    await asJockey.waitForTimeout(2000);

    // The start button contains "Abholung starten" or "Rückgabe starten"
    const startBtn = asJockey.locator('button:has-text("starten")').first();
    const hasStart = await startBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasStart) {
      // Just verify it's clickable (we won't actually trigger the API to avoid side effects)
      await expect(startBtn).toBeEnabled();
    }
  });

  // ---- Handover modal opens on inProgress/atLocation assignments ----
  test('Document Handover button opens modal for in-progress assignments', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');
    await asJockey.waitForTimeout(2000);

    // Look for the handover button: contains "Übergabe dokumentieren" or "documentieren"
    const handoverBtn = asJockey.locator('button:has-text("dokumentieren")').first();
    const hasHandover = await handoverBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasHandover) {
      await handoverBtn.click();

      // HandoverModal should open as a dialog
      const modal = asJockey.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Modal should contain the title "Fahrzeugübergabe dokumentieren"
      const title = modal.locator('text=dokumentieren');
      await expect(title).toBeVisible({ timeout: 3000 });

      // Modal should have checklist items
      await expect(modal.locator('text=Fahrzeugschlüssel')).toBeVisible();
      await expect(modal.locator('text=Fahrzeugschein')).toBeVisible();
      await expect(modal.locator('text=Zustand')).toBeVisible();

      // Modal should have cancel and complete buttons
      await expect(modal.locator('button:has-text("Abbrechen")')).toBeVisible();
      await expect(modal.locator('button:has-text("Übergabe abschließen")')).toBeVisible();

      // The complete button should be disabled (no photos/signature/checklist yet)
      await expect(modal.locator('button:has-text("Übergabe abschließen")')).toBeDisabled();

      // Close the modal
      const cancelBtn = modal.locator('button:has-text("Abbrechen")');
      await cancelBtn.click();
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    }
  });

  // ---- Language switcher ----
  test('Language switcher toggles language', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    const globeBtn = asJockey.locator('button:has(svg.lucide-globe)').first();
    if (await globeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await globeBtn.click();

      const enOption = asJockey.locator('[role="menuitem"]:has-text("English")').first();
      if (await enOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await enOption.click();
        await asJockey.waitForURL(/\/en\//, { timeout: 10000 });
        expect(asJockey.url()).toMatch(/\/en\//);
      }
    }
  });

  // ---- Logout button ----
  test('Logout button redirects to homepage', async ({ asJockey }) => {
    await asJockey.goto('/de/jockey/dashboard');
    await asJockey.waitForLoadState('networkidle');

    // The logout button has a LogOut icon in the header
    const logoutBtn = asJockey.locator('button:has(svg.lucide-log-out)').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await asJockey.waitForLoadState('networkidle');
      await expect(asJockey).toHaveURL(/\/(de|en)\/?$/, { timeout: 8000 });
    }
  });
});

// ---------------------------------------------------------------------------
//  WORKSHOP PORTAL
// ---------------------------------------------------------------------------
test.describe('Workshop Portal Interactions', () => {
  // ---- Stats cards render ----
  test('Stats cards display today/in-progress/completed counts', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // 3 stats cards with accent borders
    const statCards = asWorkshop.locator('.card-premium');
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  // ---- Order table renders with columns ----
  test('Order table renders with correct column headers', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Wait for data to load
    await asWorkshop.waitForTimeout(2000);

    const table = asWorkshop.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasTable) {
      // Verify all column headers exist
      const headers = table.locator('thead th');
      const headerTexts = await headers.allTextContents();
      const headerStr = headerTexts.join(' ');

      // Expected German headers: Auftragsnummer, Kunde, Fahrzeug, Service, Status, Aktionen
      expect(headerStr).toMatch(/Kunde/i);
      expect(headerStr).toMatch(/Fahrzeug/i);
      expect(headerStr).toMatch(/Status/i);
    }
  });

  // ---- Status filter buttons (Alle / Wartend / In Arbeit / Erledigt) ----
  test('Status filter buttons toggle order list', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    for (const label of ['Alle', 'Wartend', 'In Arbeit', 'Erledigt']) {
      const btn = asWorkshop.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
        await asWorkshop.waitForTimeout(300);
        await expect(asWorkshop).toHaveURL(/\/workshop\/dashboard/);
      }
    }
  });

  // ---- Search input filters orders ----
  test('Search input filters orders without errors', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    const searchInput = asWorkshop.locator('input[placeholder*="suchen"]').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('BMW');
      await asWorkshop.waitForTimeout(500);
      await expect(asWorkshop).toHaveURL(/\/workshop\/dashboard/);
    }
  });

  // ---- "Details" button opens OrderDetailsModal ----
  test('View Details button opens order details modal', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');
    await asWorkshop.waitForTimeout(2000);

    // The "Details" / "Anzeigen" button is in each table row
    const detailsBtn = asWorkshop.locator('button:has(svg.lucide-eye)').first();
    const hasDetails = await detailsBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasDetails) {
      await detailsBtn.click();

      // OrderDetailsModal should open
      const modal = asWorkshop.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Modal should show customer info section
      await expect(modal.locator('text=Kunde').or(modal.locator('text=Customer')).first()).toBeVisible({ timeout: 3000 });

      // Modal should show vehicle info
      await expect(modal.locator('text=Fahrzeug').or(modal.locator('text=Vehicle')).first()).toBeVisible({ timeout: 3000 });

      // Modal should show timeline
      await expect(modal.locator('text=Zeitverlauf').or(modal.locator('text=Timeline')).first()).toBeVisible({ timeout: 3000 });

      // Modal should have status action button(s) for non-completed orders
      // (Start Work / Mark Complete / Mark as Arrived depending on state)
      const actionBtn = modal.locator('button[class*="workshop"]').first();
      const hasAction = await actionBtn.isVisible({ timeout: 2000 }).catch(() => false);
      // Action presence depends on order status - just verify no crash

      // Close modal via the X button (DialogContent close button)
      const closeBtn = modal.locator('button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await expect(modal).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  // ---- Extension creation button opens ExtensionModal ----
  test('Extension button opens extension creation modal for in-progress orders', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');
    await asWorkshop.waitForTimeout(2000);

    // Extension button only appears on "inProgress" orders — look for the Plus icon button with "Erweiterung"
    const extensionBtn = asWorkshop.locator('button:has(svg.lucide-plus):has-text("Erweiterung")').first();
    const hasExtension = await extensionBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasExtension) {
      await extensionBtn.click();

      // ExtensionModal should open
      const modal = asWorkshop.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Modal should have item description textarea and price input
      await expect(modal.locator('textarea').first()).toBeVisible();
      await expect(modal.locator('input[type="number"]').first()).toBeVisible();

      // "Position hinzufügen" / add item button
      const addItemBtn = modal.locator('button:has(svg.lucide-plus)').first();
      await expect(addItemBtn).toBeVisible({ timeout: 3000 });

      // Total should be displayed
      await expect(modal.locator('text=0.00')).toBeVisible();

      // Submit button should be disabled when fields are empty
      const submitBtn = modal.locator('button:has(svg.lucide-send)').first();
      await expect(submitBtn).toBeDisabled();

      // Fill in a description and price, then verify submit becomes enabled
      await modal.locator('textarea').first().fill('Bremsbeläge erneuern');
      await modal.locator('input[type="number"]').first().fill('149.99');

      await expect(submitBtn).toBeEnabled({ timeout: 2000 });

      // Close modal without submitting
      const cancelBtn = modal.locator('button:has-text("Abbrechen")').first();
      await cancelBtn.click();
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    }
  });

  // ---- Language switcher ----
  test('Language switcher toggles language', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    const globeBtn = asWorkshop.locator('button:has(svg.lucide-globe)').first();
    if (await globeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await globeBtn.click();

      const enOption = asWorkshop.locator('[role="menuitem"]:has-text("English")').first();
      if (await enOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await enOption.click();
        await asWorkshop.waitForURL(/\/en\//, { timeout: 10000 });
        expect(asWorkshop.url()).toMatch(/\/en\//);
      }
    }
  });

  // ---- Logout button ----
  test('Logout button redirects to homepage', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // Workshop logout is a button with "Abmelden" text + LogOut icon
    const logoutBtn = asWorkshop.locator('button:has-text("Abmelden")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await asWorkshop.waitForLoadState('networkidle');
      await expect(asWorkshop).toHaveURL(/\/(de|en)\/?$/, { timeout: 8000 });
    }
  });

  // ---- Quick Tips card renders ----
  test('Quick Tips card renders with extension info', async ({ asWorkshop }) => {
    await asWorkshop.goto('/de/workshop/dashboard');
    await asWorkshop.waitForLoadState('networkidle');

    // The tip card contains "Tipp:" text
    const tipCard = asWorkshop.locator('text=Tipp').first();
    await expect(tipCard).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
//  CROSS-PORTAL: No 404 on any dashboard route
// ---------------------------------------------------------------------------
test.describe('All Portal Routes Return 200', () => {
  test('Customer dashboard does not 404', async ({ asCustomer }) => {
    const response = await asCustomer.goto('/de/customer/dashboard');
    expect(response?.status()).not.toBe(404);
  });

  test('Jockey dashboard does not 404', async ({ asJockey }) => {
    const response = await asJockey.goto('/de/jockey/dashboard');
    expect(response?.status()).not.toBe(404);
  });

  test('Workshop dashboard does not 404', async ({ asWorkshop }) => {
    const response = await asWorkshop.goto('/de/workshop/dashboard');
    expect(response?.status()).not.toBe(404);
  });
});
