/**
 * Demo Payment Service
 *
 * This service simulates a payment provider for demo/development purposes.
 * It provides the same interface as the real Stripe payment service but
 * stores everything in memory without making any external API calls.
 *
 * Use this when DEMO_MODE=true to avoid requiring Stripe API keys.
 */

import { logger } from '../config/logger';

interface DemoPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  metadata: Record<string, string>;
  captureMethod: 'automatic' | 'manual';
  created: Date;
  customerId?: string;
  customerEmail?: string;
}

export class DemoPaymentService {
  private paymentIntents: Map<string, DemoPaymentIntent> = new Map();

  /**
   * Create a demo payment intent for a booking
   */
  async createPaymentIntent(params: {
    amount: number;
    bookingId: string;
    customerId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
    captureMethod?: 'automatic' | 'manual';
  }): Promise<{
    id: string;
    client_secret: string;
    amount: number;
    status: string;
  }> {
    const { amount, bookingId, customerId, customerEmail, metadata = {}, captureMethod = 'automatic' } = params;

    // Generate demo payment intent ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const paymentIntentId = `demo_pi_${timestamp}_${random}`;
    const clientSecret = `${paymentIntentId}_secret_${random}`;

    // Create payment intent object
    const paymentIntent: DemoPaymentIntent = {
      id: paymentIntentId,
      amount,
      currency: 'eur',
      status: 'requires_payment_method',
      clientSecret,
      metadata: {
        bookingId,
        customerId,
        ...metadata,
      },
      captureMethod,
      created: new Date(),
      customerId,
      customerEmail,
    };

    // Store in memory
    this.paymentIntents.set(paymentIntentId, paymentIntent);

    logger.info({
      message: '[DEMO] Payment Intent created',
      paymentIntentId,
      bookingId,
      amount: amount / 100,
    });

    return {
      id: paymentIntentId,
      client_secret: clientSecret,
      amount,
      status: paymentIntent.status,
    };
  }

  /**
   * Confirm a payment (simulates customer completing payment)
   */
  async confirmPayment(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
  }> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    // Update status to succeeded (auto-capture) or requires_capture (manual)
    if (paymentIntent.captureMethod === 'automatic') {
      paymentIntent.status = 'succeeded';
    } else {
      // For manual capture, payment is authorized but not yet captured
      paymentIntent.status = 'requires_action'; // In real Stripe, this would be different
    }

    this.paymentIntents.set(paymentIntentId, paymentIntent);

    logger.info({
      message: '[DEMO] Payment confirmed',
      paymentIntentId,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    });

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    };
  }

  /**
   * Authorize an extension payment (manual capture)
   */
  async authorizeExtensionPayment(params: {
    amount: number;
    extensionId: string;
    bookingId: string;
    customerId: string;
    customerEmail: string;
  }): Promise<{
    id: string;
    client_secret: string;
    amount: number;
    status: string;
  }> {
    const { amount, extensionId, bookingId, customerId, customerEmail } = params;

    // Create payment intent with manual capture
    const result = await this.createPaymentIntent({
      amount,
      bookingId,
      customerId,
      customerEmail,
      metadata: {
        extensionId,
        bookingId,
        type: 'extension',
      },
      captureMethod: 'manual',
    });

    logger.info({
      message: '[DEMO] Extension payment authorized',
      extensionId,
      paymentIntentId: result.id,
      amount: amount / 100,
    });

    return result;
  }

  /**
   * Capture a previously authorized payment
   */
  async capturePayment(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
  }> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    if (paymentIntent.captureMethod !== 'manual') {
      throw new Error(`Payment intent ${paymentIntentId} is not set for manual capture`);
    }

    // Update status to succeeded
    paymentIntent.status = 'succeeded';
    this.paymentIntents.set(paymentIntentId, paymentIntent);

    logger.info({
      message: '[DEMO] Payment captured',
      paymentIntentId,
      amount: paymentIntent.amount / 100,
    });

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    };
  }

  /**
   * Cancel a payment intent
   */
  async cancelPayment(paymentIntentId: string): Promise<{
    id: string;
    status: string;
  }> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    paymentIntent.status = 'canceled';
    this.paymentIntents.set(paymentIntentId, paymentIntent);

    logger.info({
      message: '[DEMO] Payment canceled',
      paymentIntentId,
    });

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    paid: boolean;
  }> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paid: paymentIntent.status === 'succeeded',
    };
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<DemoPaymentIntent> {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    return paymentIntent;
  }

  /**
   * Clear all stored payment intents (useful for testing)
   */
  clearAll(): void {
    this.paymentIntents.clear();
    logger.info('[DEMO] All payment intents cleared');
  }
}

// Export singleton instance
export const demoPaymentService = new DemoPaymentService();
