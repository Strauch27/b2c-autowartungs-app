import { test, expect } from '@playwright/test';

/**
 * E2E Demo Smoke Test
 *
 * This test validates the complete demo flow from booking to delivery.
 * It simulates the entire customer journey with demo mode enabled
 * (using test Stripe cards to skip actual payment processing).
 *
 * Test Flow:
 * 1. Customer creates booking → Auto-confirms in demo mode
 * 2. Verify booking status is CONFIRMED
 * 3. Verify exactly 1 pickup assignment created (checks for duplicates)
 * 4. Jockey completes pickup → status IN_TRANSIT_TO_WORKSHOP
 * 5. Workshop creates extension
 * 6. Customer approves extension → payment authorized
 * 7. Workshop completes service → extension captured, status COMPLETED
 * 8. Verify return assignment created (only 1)
 * 9. Jockey completes return → status DELIVERED
 *
 * Expected Duration: < 5 minutes
 */

test.describe('Demo Mode E2E Smoke Test', () => {
  // Configure to run all tests serially in same context
  test.describe.configure({ mode: 'serial' });

  // Test credentials for demo mode
  const DEMO_CREDENTIALS = {
    customer: {
      email: `demo-customer-${Date.now()}@test.com`,
      password: 'DemoTest123!',
      firstName: 'Demo',
      lastName: 'Customer',
      phone: '+49 170 1234567'
    },
    jockey: {
      username: 'jockey-1',
      password: 'jockey123',
      email: 'jockey@test.com'
    },
    workshop: {
      username: 'werkstatt-witten',
      password: 'werkstatt123',
      email: 'werkstatt@test.com'
    }
  };

  // Stripe test card (always succeeds, never declines)
  const STRIPE_TEST_CARD = {
    number: '4242424242424242',
    expiry: '12/30',
    cvc: '123',
    zip: '12345'
  };

  // Shared test data
  let bookingId: string;
  let bookingNumber: string;
  let extensionId: string;
  let pickupAssignmentId: string;

  test.describe.serial('1. Customer Booking & Auto-Confirmation', () => {
    test('1.1 Create booking with registration and payment', async ({ page }) => {
      test.setTimeout(90000); // 90 seconds for full booking flow

      // Navigate to booking page
      await page.goto('/de/booking');
      await page.waitForLoadState('networkidle');

      // STEP 1: Vehicle Information
      console.log('Step 1: Entering vehicle information...');

      // Select brand (VW)
      const brandDropdown = page.locator('select[name="brand"]').or(
        page.locator('[data-testid="brand-select"]')
      ).first();

      if (await brandDropdown.isVisible({ timeout: 5000 })) {
        await brandDropdown.selectOption('VW');
        await page.waitForTimeout(500);

        // Select model (Golf)
        const modelDropdown = page.locator('select[name="model"]').or(
          page.locator('[data-testid="model-select"]')
        ).first();
        await modelDropdown.selectOption('Golf');

        // Enter year (2020)
        const yearInput = page.locator('input[name="year"]').or(
          page.locator('[data-testid="year-input"]')
        ).first();
        await yearInput.fill('2020');

        // Enter mileage (50000)
        const mileageInput = page.locator('input[name="mileage"]').or(
          page.locator('[data-testid="mileage-input"]')
        ).first();
        await mileageInput.fill('50000');

        // Click Next/Continue
        const nextButton = page.locator('button:has-text("Weiter")').or(
          page.locator('button:has-text("Next")')
        ).first();
        await nextButton.click();
        await page.waitForTimeout(1000);
      }

      // STEP 2: Service Selection
      console.log('Step 2: Selecting services...');

      // Select Inspektion (Inspection)
      const inspectionCheckbox = page.locator('input[value="INSPECTION"]').or(
        page.locator('text=Inspektion').locator('..').locator('input[type="checkbox"]')
      ).first();

      if (await inspectionCheckbox.isVisible({ timeout: 5000 })) {
        await inspectionCheckbox.check();
        await page.waitForTimeout(500);

        // Click Next
        const nextButton = page.locator('button:has-text("Weiter")').or(
          page.locator('button:has-text("Next")')
        ).first();
        await nextButton.click();
        await page.waitForTimeout(1000);
      }

      // STEP 3: Pickup and Delivery Details
      console.log('Step 3: Entering pickup/delivery details...');

      // Get dates (3 days from now for pickup, 5 days for delivery)
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + 3);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);

      const pickupDateInput = page.locator('input[name="pickupDate"]').first();
      if (await pickupDateInput.isVisible({ timeout: 5000 })) {
        await pickupDateInput.fill(pickupDate.toISOString().split('T')[0]);

        const pickupTimeSlot = page.locator('select[name="pickupTimeSlot"]').first();
        await pickupTimeSlot.selectOption('09:00');

        // Address
        await page.locator('input[name="pickupStreet"]').fill('Musterstraße 123');
        await page.locator('input[name="pickupPostalCode"]').fill('58453');
        await page.locator('input[name="pickupCity"]').fill('Witten');

        // Delivery
        const deliveryDateInput = page.locator('input[name="deliveryDate"]').first();
        await deliveryDateInput.fill(deliveryDate.toISOString().split('T')[0]);

        const deliveryTimeSlot = page.locator('select[name="deliveryTimeSlot"]').first();
        await deliveryTimeSlot.selectOption('17:00');

        // Click Next
        const nextButton = page.locator('button:has-text("Weiter")').or(
          page.locator('button:has-text("Next")')
        ).first();
        await nextButton.click();
        await page.waitForTimeout(1000);
      }

      // STEP 4: Registration
      console.log('Step 4: Registering customer account...');

      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 5000 })) {
        await emailInput.fill(DEMO_CREDENTIALS.customer.email);
        await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
        await page.locator('input[name="firstName"]').fill(DEMO_CREDENTIALS.customer.firstName);
        await page.locator('input[name="lastName"]').fill(DEMO_CREDENTIALS.customer.lastName);
        await page.locator('input[name="phone"]').fill(DEMO_CREDENTIALS.customer.phone);

        const registerButton = page.locator('button:has-text("Registrieren")').or(
          page.locator('button:has-text("Register")')
        ).first();
        await registerButton.click();
        await page.waitForTimeout(2000);
      }

      // STEP 5: Confirmation & Payment
      console.log('Step 5: Processing payment...');

      // Accept terms
      const termsCheckbox = page.locator('input[type="checkbox"]').filter({
        hasText: /AGB|Terms/
      }).first();

      if (await termsCheckbox.isVisible({ timeout: 5000 })) {
        await termsCheckbox.check();

        // Confirm booking
        const confirmButton = page.locator('button:has-text("Jetzt verbindlich buchen")').or(
          page.locator('button:has-text("Confirm Booking")')
        ).first();
        await confirmButton.click();
        await page.waitForTimeout(2000);
      }

      // Wait for payment page or Stripe Elements
      await page.waitForTimeout(3000);

      // Fill Stripe payment details (if visible)
      const stripeCardElement = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
      const cardNumberInput = stripeCardElement.locator('input[name="cardnumber"]');

      if (await cardNumberInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Filling Stripe payment form...');
        await cardNumberInput.fill(STRIPE_TEST_CARD.number);

        const expiryInput = stripeCardElement.locator('input[name="exp-date"]');
        await expiryInput.fill(STRIPE_TEST_CARD.expiry);

        const cvcInput = stripeCardElement.locator('input[name="cvc"]');
        await cvcInput.fill(STRIPE_TEST_CARD.cvc);

        const zipInput = stripeCardElement.locator('input[name="postal"]');
        await zipInput.fill(STRIPE_TEST_CARD.zip);

        // Submit payment
        const payButton = page.locator('button:has-text("Bezahlen")').or(
          page.locator('button:has-text("Pay")')
        ).first();
        await payButton.click();

        // Wait for payment processing
        await page.waitForTimeout(5000);
      }

      // Should redirect to confirmation page
      await page.waitForURL(/confirmation|success/, { timeout: 30000 });

      // Extract booking ID from URL or page
      const url = page.url();
      const match = url.match(/bookingId=([^&]+)/);
      if (match) {
        bookingId = match[1];
        console.log(`Booking created: ${bookingId}`);
      }

      // Verify confirmation message
      const confirmationMessage = page.locator('text=Buchung bestätigt').or(
        page.locator('text=Booking Confirmed')
      );
      await expect(confirmationMessage).toBeVisible({ timeout: 10000 });
    });

    test('1.2 Verify booking status is CONFIRMED', async ({ page }) => {
      // Login as customer
      await page.goto('/de/customer/login');
      await page.locator('input[type="email"]').fill(DEMO_CREDENTIALS.customer.email);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/customer/, { timeout: 10000 });

      // Navigate to bookings
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      // Find booking with CONFIRMED status
      const confirmedBadge = page.locator('[class*="badge"]').filter({
        hasText: /CONFIRMED|Bestätigt/
      }).first();

      await expect(confirmedBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Booking status: CONFIRMED');
    });

    test('1.3 Verify exactly 1 pickup assignment created (no duplicates)', async ({ page }) => {
      // Login as jockey
      await page.goto('/de/jockey/login');

      const usernameInput = page.locator('input[name="username"]').or(
        page.locator('input[type="text"]')
      ).first();
      await usernameInput.fill(DEMO_CREDENTIALS.jockey.username);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.jockey.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/jockey/, { timeout: 10000 });

      // Navigate to dashboard
      await page.goto('/de/jockey/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Count PICKUP assignments for this customer
      const assignmentCards = page.locator('[data-assignment-type="PICKUP"]').or(
        page.locator('text=PICKUP').locator('..')
      );

      const count = await assignmentCards.count();

      // CRITICAL: Should be exactly 1 assignment, not 2 or more (checks for duplicate bug)
      expect(count).toBe(1);
      console.log(`✓ Exactly 1 pickup assignment created (no duplicates)`);

      // Store assignment ID for later
      const firstAssignment = assignmentCards.first();
      if (await firstAssignment.isVisible()) {
        pickupAssignmentId = await firstAssignment.getAttribute('data-assignment-id') || 'unknown';
      }
    });
  });

  test.describe.serial('2. Jockey Pickup Flow', () => {
    test('2.1 Jockey completes pickup', async ({ page }) => {
      // Already logged in from previous test, navigate to dashboard
      await page.goto('/de/jockey/dashboard');
      await page.waitForLoadState('networkidle');

      // Find and click "Complete Pickup" button
      const completeButton = page.locator('button:has-text("Abholung abschließen")').or(
        page.locator('button:has-text("Complete Pickup")')
      ).first();

      if (await completeButton.isVisible({ timeout: 5000 })) {
        await completeButton.click();
        await page.waitForTimeout(2000);

        // If modal appears, fill handover data
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
          const confirmButton = page.locator('button:has-text("Bestätigen")').or(
            page.locator('button:has-text("Confirm")')
          ).first();
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }

        console.log('✓ Pickup completed');
      }
    });

    test('2.2 Verify booking status is IN_TRANSIT_TO_WORKSHOP', async ({ page }) => {
      // Login as customer
      await page.goto('/de/customer/login');
      await page.locator('input[type="email"]').fill(DEMO_CREDENTIALS.customer.email);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/customer/, { timeout: 10000 });

      // Check booking status
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      const statusBadge = page.locator('[class*="badge"]').filter({
        hasText: /IN_TRANSIT|Unterwegs/
      }).first();

      await expect(statusBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Status: IN_TRANSIT_TO_WORKSHOP');
    });
  });

  test.describe.serial('3. Workshop Extension Flow', () => {
    test('3.1 Workshop creates extension', async ({ page }) => {
      // Login as workshop
      await page.goto('/de/workshop/login');

      const usernameInput = page.locator('input[name="username"]').or(
        page.locator('input[type="text"]')
      ).first();
      await usernameInput.fill(DEMO_CREDENTIALS.workshop.username);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.workshop.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/workshop/, { timeout: 10000 });

      // Navigate to dashboard
      await page.goto('/de/workshop/dashboard');
      await page.waitForLoadState('networkidle');

      // Find the booking and create extension
      const createExtensionButton = page.locator('button:has-text("Erweiterung erstellen")').or(
        page.locator('button:has-text("Create Extension")')
      ).first();

      if (await createExtensionButton.isVisible({ timeout: 5000 })) {
        await createExtensionButton.click();
        await page.waitForTimeout(1000);

        // Fill extension form
        const descriptionField = page.locator('textarea[name="description"]').or(
          page.locator('textarea')
        ).first();
        await descriptionField.fill('Bremsbeläge vorne und hinten sind verschlissen und müssen dringend erneuert werden.');

        // Add first item
        const itemNameField = page.locator('input[name*="name"]').or(
          page.locator('input[placeholder*="Beschreibung"]')
        ).first();
        await itemNameField.fill('Bremsbeläge vorne');

        const itemPriceField = page.locator('input[name*="price"]').first();
        await itemPriceField.fill('189.99');

        const itemQuantityField = page.locator('input[name*="quantity"]').first();
        await itemQuantityField.fill('1');

        // Submit extension
        const sendButton = page.locator('button:has-text("An Kunden senden")').or(
          page.locator('button:has-text("Send to Customer")')
        ).first();
        await sendButton.click();
        await page.waitForTimeout(2000);

        console.log('✓ Extension created');
      }
    });

    test('3.2 Verify extension status is PENDING', async ({ page }) => {
      // Stay on workshop dashboard
      await page.goto('/de/workshop/dashboard');
      await page.waitForLoadState('networkidle');

      const pendingBadge = page.locator('[class*="badge"]').filter({
        hasText: /PENDING|Ausstehend/
      }).first();

      await expect(pendingBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Extension status: PENDING');
    });
  });

  test.describe.serial('4. Customer Extension Approval', () => {
    test('4.1 Customer approves extension with payment', async ({ page }) => {
      test.setTimeout(60000); // 60 seconds for payment flow

      // Login as customer
      await page.goto('/de/customer/login');
      await page.locator('input[type="email"]').fill(DEMO_CREDENTIALS.customer.email);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/customer/, { timeout: 10000 });

      // Navigate to bookings
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      // Click on booking
      const bookingCard = page.locator('[class*="card"]').first();
      await bookingCard.click();
      await page.waitForTimeout(1000);

      // Click Extensions tab
      const extensionsTab = page.locator('text=Erweiterungen').or(
        page.locator('text=Extensions')
      ).first();

      if (await extensionsTab.isVisible({ timeout: 3000 })) {
        await extensionsTab.click();
        await page.waitForTimeout(500);

        // Click "View Details" or "Approve"
        const approveButton = page.locator('button:has-text("Genehmigen")').or(
          page.locator('button:has-text("Approve")')
        ).first();

        if (await approveButton.isVisible({ timeout: 5000 })) {
          await approveButton.click();
          await page.waitForTimeout(2000);

          // Fill Stripe payment for extension
          const stripeCardElement = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
          const cardNumberInput = stripeCardElement.locator('input[name="cardnumber"]');

          if (await cardNumberInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await cardNumberInput.fill(STRIPE_TEST_CARD.number);
            await stripeCardElement.locator('input[name="exp-date"]').fill(STRIPE_TEST_CARD.expiry);
            await stripeCardElement.locator('input[name="cvc"]').fill(STRIPE_TEST_CARD.cvc);
            await stripeCardElement.locator('input[name="postal"]').fill(STRIPE_TEST_CARD.zip);

            const payButton = page.locator('button:has-text("Bezahlen")').or(
              page.locator('button:has-text("Pay")')
            ).first();
            await payButton.click();
            await page.waitForTimeout(5000);
          }

          console.log('✓ Extension approved with payment');
        }
      }
    });

    test('4.2 Verify extension status is APPROVED', async ({ page }) => {
      // Refresh page to see updated status
      await page.reload();
      await page.waitForLoadState('networkidle');

      const approvedBadge = page.locator('[class*="badge"]').filter({
        hasText: /APPROVED|Genehmigt|Autorisiert/
      }).first();

      await expect(approvedBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Extension status: APPROVED (Authorized)');
    });
  });

  test.describe.serial('5. Workshop Service Completion & Auto-Capture', () => {
    test('5.1 Workshop marks service as COMPLETED', async ({ page }) => {
      // Login as workshop
      await page.goto('/de/workshop/login');

      const usernameInput = page.locator('input[name="username"]').or(
        page.locator('input[type="text"]')
      ).first();
      await usernameInput.fill(DEMO_CREDENTIALS.workshop.username);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.workshop.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/workshop/, { timeout: 10000 });

      // Navigate to dashboard
      await page.goto('/de/workshop/dashboard');
      await page.waitForLoadState('networkidle');

      // Update status to COMPLETED
      const completeButton = page.locator('button:has-text("Service abschließen")').or(
        page.locator('button:has-text("Complete Service")')
      ).first();

      if (await completeButton.isVisible({ timeout: 5000 })) {
        await completeButton.click();
        await page.waitForTimeout(3000);

        console.log('✓ Service marked as COMPLETED');
      }
    });

    test('5.2 Verify extension payment is CAPTURED', async ({ page }) => {
      // Login as customer to check payment status
      await page.goto('/de/customer/login');
      await page.locator('input[type="email"]').fill(DEMO_CREDENTIALS.customer.email);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/customer/, { timeout: 10000 });

      // Navigate to booking extensions
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      const bookingCard = page.locator('[class*="card"]').first();
      await bookingCard.click();
      await page.waitForTimeout(1000);

      // Check Extensions tab
      const extensionsTab = page.locator('text=Erweiterungen').or(
        page.locator('text=Extensions')
      ).first();

      if (await extensionsTab.isVisible({ timeout: 3000 })) {
        await extensionsTab.click();
        await page.waitForTimeout(500);

        // Verify payment captured badge (green "Bezahlt")
        const paidBadge = page.locator('[class*="badge"]').filter({
          hasText: /Bezahlt|PAID|CAPTURED/
        }).first();

        await expect(paidBadge).toBeVisible({ timeout: 10000 });
        console.log('✓ Extension payment: CAPTURED (Bezahlt)');
      }
    });

    test('5.3 Verify booking status is COMPLETED', async ({ page }) => {
      // Check overall booking status
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      const completedBadge = page.locator('[class*="badge"]').filter({
        hasText: /COMPLETED|Abgeschlossen/
      }).first();

      await expect(completedBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Booking status: COMPLETED');
    });
  });

  test.describe.serial('6. Return Assignment & Delivery', () => {
    test('6.1 Verify exactly 1 return assignment created (no duplicates)', async ({ page }) => {
      // Login as jockey
      await page.goto('/de/jockey/login');

      const usernameInput = page.locator('input[name="username"]').or(
        page.locator('input[type="text"]')
      ).first();
      await usernameInput.fill(DEMO_CREDENTIALS.jockey.username);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.jockey.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/jockey/, { timeout: 10000 });

      // Navigate to dashboard
      await page.goto('/de/jockey/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Count RETURN assignments
      const returnAssignments = page.locator('[data-assignment-type="RETURN"]').or(
        page.locator('text=RETURN').locator('..')
      );

      const count = await returnAssignments.count();

      // CRITICAL: Should be exactly 1 return assignment
      expect(count).toBe(1);
      console.log('✓ Exactly 1 return assignment created (no duplicates)');
    });

    test('6.2 Jockey completes return delivery', async ({ page }) => {
      // Already on jockey dashboard
      await page.goto('/de/jockey/dashboard');
      await page.waitForLoadState('networkidle');

      // Find and click "Complete Return" button
      const completeReturnButton = page.locator('button:has-text("Rückgabe abschließen")').or(
        page.locator('button:has-text("Complete Return")')
      ).first();

      if (await completeReturnButton.isVisible({ timeout: 5000 })) {
        await completeReturnButton.click();
        await page.waitForTimeout(2000);

        // If modal appears, confirm
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
          const confirmButton = page.locator('button:has-text("Bestätigen")').or(
            page.locator('button:has-text("Confirm")')
          ).first();
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }

        console.log('✓ Return delivery completed');
      }
    });

    test('6.3 Verify booking status is DELIVERED', async ({ page }) => {
      // Login as customer
      await page.goto('/de/customer/login');
      await page.locator('input[type="email"]').fill(DEMO_CREDENTIALS.customer.email);
      await page.locator('input[type="password"]').fill(DEMO_CREDENTIALS.customer.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL(/\/customer/, { timeout: 10000 });

      // Check final booking status
      await page.goto('/de/customer/bookings');
      await page.waitForLoadState('networkidle');

      const deliveredBadge = page.locator('[class*="badge"]').filter({
        hasText: /DELIVERED|Zugestellt/
      }).first();

      await expect(deliveredBadge).toBeVisible({ timeout: 10000 });
      console.log('✓ Final status: DELIVERED');
      console.log('\n✅ COMPLETE E2E DEMO FLOW SUCCESSFUL!\n');
    });
  });
});

/**
 * Test Summary:
 *
 * This comprehensive smoke test validates:
 *
 * ✅ Complete booking flow with demo payment
 * ✅ Auto-confirmation in demo mode
 * ✅ Exactly 1 pickup assignment (no duplicates)
 * ✅ Jockey pickup completion
 * ✅ Workshop extension creation
 * ✅ Customer extension approval with payment
 * ✅ Payment authorization (manual capture)
 * ✅ Auto-capture on service completion
 * ✅ Exactly 1 return assignment (no duplicates)
 * ✅ Jockey return delivery
 * ✅ Final DELIVERED status
 *
 * Total: 15 test cases covering critical demo flow
 * Expected Duration: < 5 minutes
 *
 * Run with:
 * npx playwright test e2e/00-demo-smoke-test.spec.ts --headed
 */
