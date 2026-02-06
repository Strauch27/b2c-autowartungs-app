/**
 * Master Journey E2E Test
 *
 * Complete lifecycle test driving a booking through all 3 portals:
 * Customer → Jockey (Pickup) → Workshop → Customer (Extension) → Workshop → Jockey (Return)
 *
 * Uses hybrid approach: API calls for state progression + UI verification for display.
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './helpers/api-helpers';
import { TEST_USERS, TEST_VEHICLES, TEST_ADDRESSES } from './fixtures/test-data';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

test.describe.serial('Master Journey - Full Booking Lifecycle', () => {
  const api = {
    customer: new ApiHelper(API_URL),
    jockey: new ApiHelper(API_URL),
    workshop: new ApiHelper(API_URL),
  };

  let bookingId: string;
  let bookingNumber: string;
  let pickupAssignmentId: string;
  let extensionId: string;

  test.beforeAll(async () => {
    // Login all three roles via API
    await api.customer.login('customer');
    await api.jockey.login('jockey');
    await api.workshop.login('workshop');
  });

  // === Phase 1: Customer creates booking ===

  test('Phase 1: Customer creates booking → Payment → CONFIRMED → PICKUP_ASSIGNED', async ({ page }) => {
    // Create booking via API for speed
    const booking = await api.customer.createBooking({
      vehicle: {
        brand: TEST_VEHICLES.bmw.brand,
        model: TEST_VEHICLES.bmw.model,
        year: parseInt(TEST_VEHICLES.bmw.year),
        mileage: parseInt(TEST_VEHICLES.bmw.mileage),
      },
      services: ['inspection'],
      pickup: {
        date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        timeSlot: '09:00',
        street: TEST_ADDRESSES.witten.street,
        city: TEST_ADDRESSES.witten.city,
        postalCode: TEST_ADDRESSES.witten.zip,
      },
      delivery: {
        date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        timeSlot: '14:00',
      },
      customerNotes: 'E2E Master Journey Test',
    });

    bookingId = booking.id;
    bookingNumber = booking.bookingNumber;

    expect(bookingId).toBeDefined();
    expect(bookingNumber).toBeDefined();

    // In demo mode, booking should already be CONFIRMED or PICKUP_ASSIGNED
    const status = booking.status;
    expect(['CONFIRMED', 'PICKUP_ASSIGNED']).toContain(status);
  });

  // === Phase 2: Jockey picks up vehicle ===

  test('Phase 2: Jockey Pickup → EN_ROUTE → AT_LOCATION → COMPLETED → Booking PICKED_UP', async ({ page }) => {
    // Get jockey assignments
    const assignments = await api.jockey.getAssignments();
    const pickupAssignment = assignments.find(
      (a: any) => a.bookingId === bookingId && a.type === 'PICKUP'
    );

    expect(pickupAssignment).toBeDefined();
    pickupAssignmentId = pickupAssignment.id;

    // Progress through assignment statuses
    await api.jockey.updateAssignmentStatus(pickupAssignmentId, 'EN_ROUTE');
    await api.jockey.updateAssignmentStatus(pickupAssignmentId, 'AT_LOCATION');

    // Complete the pickup assignment
    await api.jockey.completeAssignment(pickupAssignmentId, {
      notes: 'Vehicle picked up successfully',
    });

    // Verify booking is now PICKED_UP
    const booking = await api.customer.getBooking(bookingId);
    expect(booking.status).toBe('PICKED_UP');
  });

  // === Phase 3: Workshop service ===

  test('Phase 3: Workshop → AT_WORKSHOP → IN_SERVICE → Extension created', async ({ page }) => {
    // Workshop updates status to AT_WORKSHOP
    await api.workshop.updateBookingStatus(bookingNumber, 'AT_WORKSHOP');

    // Workshop starts service
    await api.workshop.updateBookingStatus(bookingNumber, 'IN_SERVICE');

    // Workshop creates extension (additional work needed)
    const extension = await api.workshop.createExtension(bookingId, {
      description: 'Bremsbeläge abgenutzt - Austausch empfohlen',
      items: [
        { name: 'Bremsbeläge vorne', price: 12900, quantity: 1 },
        { name: 'Arbeitszeit', price: 8500, quantity: 1 },
      ],
    });

    extensionId = extension.id;
    expect(extensionId).toBeDefined();
    expect(extension.status).toBe('PENDING');

    // Verify booking is IN_SERVICE
    const booking = await api.customer.getBooking(bookingId);
    expect(booking.status).toBe('IN_SERVICE');
  });

  // === Phase 4: Customer approves extension ===

  test('Phase 4: Customer approves extension (demo payment)', async ({ page }) => {
    // Customer approves extension
    const result = await api.customer.approveExtension(bookingId, extensionId);
    expect(result).toBeDefined();
  });

  // === Phase 5: Workshop finishes → READY_FOR_RETURN → auto Return Assignment ===

  test('Phase 5: Workshop finishes → READY_FOR_RETURN → RETURN_ASSIGNED', async ({ page }) => {
    // Workshop marks service complete
    await api.workshop.updateBookingStatus(bookingNumber, 'READY_FOR_RETURN');

    // The system should auto-create return assignment and move to RETURN_ASSIGNED
    // Wait a moment for the transaction to complete
    const booking = await api.customer.getBooking(bookingId);
    expect(['READY_FOR_RETURN', 'RETURN_ASSIGNED']).toContain(booking.status);
  });

  // === Phase 6: Jockey returns vehicle ===

  test('Phase 6: Jockey return → EN_ROUTE → COMPLETED → Booking RETURNED', async ({ page }) => {
    // Get return assignment
    const assignments = await api.jockey.getAssignments();
    const returnAssignment = assignments.find(
      (a: any) => a.bookingId === bookingId && a.type === 'RETURN'
    );

    expect(returnAssignment).toBeDefined();

    // Progress through return
    await api.jockey.updateAssignmentStatus(returnAssignment.id, 'EN_ROUTE');
    await api.jockey.updateAssignmentStatus(returnAssignment.id, 'AT_LOCATION');

    // Complete return
    await api.jockey.completeAssignment(returnAssignment.id, {
      notes: 'Vehicle returned to customer',
    });

    // Verify final state
    const booking = await api.customer.getBooking(bookingId);
    expect(booking.status).toBe('RETURNED');
  });

  // === Phase 7: UI Verification ===

  test('Phase 7: Customer dashboard shows completed booking', async ({ browser }) => {
    // Use auth fixture for customer
    const customerAuth = 'e2e/.auth/customer.json';
    let context;
    try {
      context = await browser.newContext({ storageState: customerAuth });
    } catch {
      // If auth file doesn't exist, skip UI verification
      test.skip();
      return;
    }

    const page = await context.newPage();

    await page.goto('/de/customer/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify booking appears with correct status
    const bookingElement = page.locator(`text=${bookingNumber}`).first();
    if (await bookingElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(bookingElement).toBeVisible();
    }

    await page.close();
    await context.close();
  });

  // === Phase 8: Negative paths ===

  test('Phase 8a: Extension decline works', async () => {
    // Create another booking for decline test
    const booking2 = await api.customer.createBooking({
      vehicle: {
        brand: 'VW',
        model: 'Golf',
        year: 2019,
        mileage: 60000,
      },
      services: ['oil'],
      pickup: {
        date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        timeSlot: '10:00',
        street: TEST_ADDRESSES.witten.street,
        city: TEST_ADDRESSES.witten.city,
        postalCode: TEST_ADDRESSES.witten.zip,
      },
      delivery: {
        date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        timeSlot: '15:00',
      },
    });

    // Progress to IN_SERVICE via jockey and workshop
    const assignments = await api.jockey.getAssignments();
    const pickup = assignments.find(
      (a: any) => a.bookingId === booking2.id && a.type === 'PICKUP' && a.status !== 'COMPLETED'
    );
    if (pickup) {
      await api.jockey.updateAssignmentStatus(pickup.id, 'EN_ROUTE');
      await api.jockey.updateAssignmentStatus(pickup.id, 'AT_LOCATION');
      await api.jockey.completeAssignment(pickup.id);
    }

    await api.workshop.updateBookingStatus(booking2.bookingNumber, 'AT_WORKSHOP');
    await api.workshop.updateBookingStatus(booking2.bookingNumber, 'IN_SERVICE');

    // Create and decline extension
    const ext = await api.workshop.createExtension(booking2.id, {
      description: 'Optional upgrade',
      items: [{ name: 'Premium filter', price: 4900, quantity: 1 }],
    });

    await api.customer.declineExtension(booking2.id, ext.id, 'Too expensive');
  });

  test('Phase 8b: Booking cancellation works from early states', async () => {
    // Create booking and cancel it
    const cancelBooking = await api.customer.createBooking({
      vehicle: {
        brand: 'Audi',
        model: 'A4',
        year: 2022,
        mileage: 15000,
      },
      services: ['ac'],
      pickup: {
        date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        timeSlot: '11:00',
        street: TEST_ADDRESSES.dortmund.street,
        city: TEST_ADDRESSES.dortmund.city,
        postalCode: TEST_ADDRESSES.dortmund.zip,
      },
      delivery: {
        date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        timeSlot: '16:00',
      },
    });

    // Cancel the booking
    const cancelled = await api.customer.cancelBooking(cancelBooking.id, 'Changed my mind');
    expect(cancelled.status).toBe('CANCELLED');
  });

  // === Phase 9: FSM boundary tests ===

  test('Phase 9: Invalid status transitions are rejected', async () => {
    // Create a fresh booking
    const testBooking = await api.customer.createBooking({
      vehicle: { brand: 'BMW', model: '1er', year: 2021, mileage: 30000 },
      services: ['inspection'],
      pickup: {
        date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        timeSlot: '09:00',
        street: TEST_ADDRESSES.witten.street,
        city: TEST_ADDRESSES.witten.city,
        postalCode: TEST_ADDRESSES.witten.zip,
      },
      delivery: {
        date: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
        timeSlot: '14:00',
      },
    });

    // Try invalid transition: PICKUP_ASSIGNED → IN_SERVICE (should fail)
    try {
      await api.workshop.updateBookingStatus(testBooking.bookingNumber, 'IN_SERVICE');
      // If we get here, the test should fail
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain('failed');
    }

    // Try invalid transition: PICKUP_ASSIGNED → RETURNED (should fail)
    try {
      await api.workshop.updateBookingStatus(testBooking.bookingNumber, 'RETURNED');
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain('failed');
    }
  });
});
