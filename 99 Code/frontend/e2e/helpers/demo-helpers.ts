/**
 * Demo Helper Functions
 *
 * Utilities for testing demo mode flows including payment simulation,
 * status polling, and API interactions.
 */

import { Page, expect } from '@playwright/test';

// API Configuration
const API_BASE_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:5001';

/**
 * Demo Payment using Stripe Test Card
 */
export async function demoPayBooking(page: Page, bookingId: string): Promise<boolean> {
  try {
    // Call demo payment endpoint
    const response = await page.request.post(`${API_BASE_URL}/api/demo/payment/confirm`, {
      data: {
        bookingId,
        paymentIntentId: `pi_test_${Date.now()}`
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.ok();
  } catch (error) {
    console.error('Demo payment failed:', error);
    return false;
  }
}

/**
 * Authorize Extension Payment (Demo Mode)
 */
export async function demoAuthorizeExtension(
  page: Page,
  extensionId: string,
  bookingId: string
): Promise<{ success: boolean; paymentIntentId?: string }> {
  try {
    const response = await page.request.post(`${API_BASE_URL}/api/demo/extension/authorize`, {
      data: {
        extensionId,
        bookingId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok()) {
      const data = await response.json();
      return {
        success: true,
        paymentIntentId: data.data?.paymentIntent?.id
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Demo extension authorization failed:', error);
    return { success: false };
  }
}

/**
 * Capture Extension Payment (Demo Mode)
 */
export async function demoCaptureExtension(
  page: Page,
  extensionId: string,
  paymentIntentId: string
): Promise<boolean> {
  try {
    const response = await page.request.post(`${API_BASE_URL}/api/demo/extension/capture`, {
      data: {
        extensionId,
        paymentIntentId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.ok();
  } catch (error) {
    console.error('Demo extension capture failed:', error);
    return false;
  }
}

/**
 * Decline Extension (Demo Mode)
 */
export async function demoDeclineExtension(
  page: Page,
  extensionId: string,
  reason?: string
): Promise<boolean> {
  try {
    const response = await page.request.post(`${API_BASE_URL}/api/demo/extension/decline`, {
      data: {
        extensionId,
        reason: reason || 'Test decline'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.ok();
  } catch (error) {
    console.error('Demo extension decline failed:', error);
    return false;
  }
}

/**
 * Wait for booking to reach specific status
 */
export async function waitForBookingStatus(
  page: Page,
  bookingId: string,
  expectedStatus: string,
  timeout: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 seconds

  while (Date.now() - startTime < timeout) {
    try {
      // Poll booking status from API
      const response = await page.request.get(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        const currentStatus = data.data?.booking?.status;

        if (currentStatus === expectedStatus) {
          console.log(`✓ Booking reached status: ${expectedStatus}`);
          return true;
        }

        console.log(`  Current status: ${currentStatus}, waiting for: ${expectedStatus}...`);
      }
    } catch (error) {
      console.error('Error polling booking status:', error);
    }

    // Wait before next poll
    await page.waitForTimeout(pollInterval);
  }

  console.error(`⨯ Timeout waiting for booking status: ${expectedStatus}`);
  return false;
}

/**
 * Wait for extension to reach specific status
 */
export async function waitForExtensionStatus(
  page: Page,
  extensionId: string,
  expectedStatus: string,
  timeout: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < timeout) {
    try {
      const response = await page.request.get(`${API_BASE_URL}/api/extensions/${extensionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok()) {
        const data = await response.json();
        const currentStatus = data.data?.extension?.status;

        if (currentStatus === expectedStatus) {
          console.log(`✓ Extension reached status: ${expectedStatus}`);
          return true;
        }

        console.log(`  Current extension status: ${currentStatus}, waiting for: ${expectedStatus}...`);
      }
    } catch (error) {
      console.error('Error polling extension status:', error);
    }

    await page.waitForTimeout(pollInterval);
  }

  console.error(`⨯ Timeout waiting for extension status: ${expectedStatus}`);
  return false;
}

/**
 * Fill Stripe payment form with test card
 */
export async function fillStripeTestCard(page: Page, options?: {
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  zip?: string;
}) {
  const defaults = {
    cardNumber: '4242424242424242',
    expiry: '1230',
    cvc: '123',
    zip: '12345'
  };

  const card = { ...defaults, ...options };

  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();
  const cardNumberInput = stripeFrame.locator('input[name="cardnumber"]');

  await cardNumberInput.waitFor({ state: 'visible', timeout: 10000 });

  // Fill card details
  await cardNumberInput.fill(card.cardNumber);
  await stripeFrame.locator('input[name="exp-date"]').fill(card.expiry);
  await stripeFrame.locator('input[name="cvc"]').fill(card.cvc);
  await stripeFrame.locator('input[name="postal"]').fill(card.zip);

  console.log('✓ Stripe test card filled');
}

/**
 * Wait for payment confirmation
 */
export async function waitForPaymentSuccess(page: Page, timeout: number = 15000): Promise<boolean> {
  try {
    // Wait for success indicator (confirmation page, success message, etc.)
    await page.waitForURL(/confirmation|success/, { timeout });
    return true;
  } catch (error) {
    // Try to detect success message instead
    const successMsg = page.locator('text=erfolgreich').or(page.locator('text=success')).first();
    const isVisible = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      console.log('✓ Payment success detected');
      return true;
    }

    console.error('⨯ Payment confirmation timeout');
    return false;
  }
}

/**
 * Verify status badge is visible with expected text
 */
export async function verifyStatusBadge(
  page: Page,
  expectedStatus: string,
  timeout: number = 10000
): Promise<void> {
  const statusBadge = page.locator('[class*="badge"]').filter({
    hasText: new RegExp(expectedStatus, 'i')
  }).first();

  await expect(statusBadge).toBeVisible({ timeout });
  console.log(`✓ Status badge verified: ${expectedStatus}`);
}

/**
 * Count assignments of specific type
 */
export async function countAssignments(
  page: Page,
  assignmentType: 'PICKUP' | 'RETURN'
): Promise<number> {
  const assignments = page.locator(`[data-assignment-type="${assignmentType}"]`)
    .or(page.locator(`text=${assignmentType}`).locator('..'));

  await page.waitForTimeout(1000); // Allow DOM to stabilize
  const count = await assignments.count();

  console.log(`  Found ${count} ${assignmentType} assignment${count !== 1 ? 's' : ''}`);
  return count;
}

/**
 * Check if demo mode is enabled
 */
export async function isDemoModeEnabled(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get(`${API_BASE_URL}/api/health`);
    if (response.ok()) {
      const data = await response.json();
      return data.demoMode === true;
    }
  } catch (error) {
    console.warn('Could not determine demo mode status');
  }
  return false;
}

/**
 * Get booking details from API
 */
export async function getBookingDetails(page: Page, bookingId: string): Promise<any> {
  try {
    const response = await page.request.get(`${API_BASE_URL}/api/bookings/${bookingId}`);
    if (response.ok()) {
      const data = await response.json();
      return data.data?.booking;
    }
  } catch (error) {
    console.error('Failed to get booking details:', error);
  }
  return null;
}

/**
 * Log test checkpoint
 */
export function logCheckpoint(step: string, message: string, success: boolean = true) {
  const icon = success ? '✓' : '⨯';
  console.log(`${icon} [${step}] ${message}`);
}

/**
 * Wait for element to be visible with retry
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  maxRetries: number = 3,
  timeout: number = 5000
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const element = page.locator(selector).first();
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      console.log(`  Retry ${i + 1}/${maxRetries} waiting for: ${selector}`);
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

/**
 * Extract booking ID from URL
 */
export function extractBookingIdFromUrl(url: string): string | null {
  const match = url.match(/bookingId=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Extract extension ID from URL
 */
export function extractExtensionIdFromUrl(url: string): string | null {
  const match = url.match(/extensionId=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}@test.com`;
}

/**
 * Format price for display (EUR)
 */
export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse price from display string (EUR)
 */
export function parsePrice(priceString: string): number {
  const cleaned = priceString.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}
