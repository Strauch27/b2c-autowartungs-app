import Stripe from 'stripe';
import { logger } from '../config/logger';
import { ApiError } from '../middleware/errorHandler';

// Initialize Stripe (optional for development)
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set - Payment features will be disabled');
}

export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents (e.g., 5000 = 50.00 EUR)
  bookingId: string;
  customerId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
  captureMethod?: 'automatic' | 'manual'; // Manual capture for authorization-only flows
}

export interface RefundPaymentParams {
  paymentIntentId: string;
  amount?: number; // Optional partial refund amount in cents
  reason?: Stripe.RefundCreateParams.Reason;
}

export class PaymentService {
  private stripe: Stripe | null;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create a Payment Intent for a booking
   * This creates the payment but doesn't charge it yet - the charge happens on the frontend
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new ApiError(503, 'Payment service not available - Stripe not configured');
    }

    try {
      const { amount, bookingId, customerId, customerEmail, metadata = {}, captureMethod = 'automatic' } = params;

      // Validate amount (minimum 50 cents)
      if (amount < 50) {
        throw new ApiError(400, 'Payment amount must be at least 0.50 EUR');
      }

      // Create or retrieve Stripe customer
      const customer = await this.getOrCreateStripeCustomer(customerId, customerEmail);

      // Create Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount), // Ensure integer
        currency: 'eur',
        customer: customer.id,
        capture_method: captureMethod,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          bookingId,
          customerId,
          ...metadata,
        },
        description: `Booking ${bookingId}`,
        // Enable receipt emails
        receipt_email: customerEmail,
      });

      logger.info({
        message: 'Payment Intent created',
        paymentIntentId: paymentIntent.id,
        bookingId,
        amount: amount / 100, // Log in EUR
      });

      return paymentIntent;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error creating payment intent',
          error: error.message,
          type: error.type,
        });
        throw new ApiError(
          error.statusCode || 500,
          `Payment error: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get or create a Stripe customer
   */
  private async getOrCreateStripeCustomer(
    customerId: string,
    email: string
  ): Promise<Stripe.Customer> {
    try {
      // Search for existing customer by metadata
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          customerId,
        },
      });

      logger.info({
        message: 'Stripe customer created',
        stripeCustomerId: customer.id,
        customerId,
      });

      return customer;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error managing customer',
          error: error.message,
        });
        throw new ApiError(500, 'Error managing customer payment profile');
      }
      throw error;
    }
  }

  /**
   * Retrieve a Payment Intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error retrieving payment intent',
          error: error.message,
          paymentIntentId,
        });
        throw new ApiError(404, 'Payment not found');
      }
      throw error;
    }
  }

  /**
   * Capture a Payment Intent (for manual capture flow)
   * Note: By default, PaymentIntents are captured automatically
   */
  async capturePayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);

      logger.info({
        message: 'Payment captured',
        paymentIntentId,
        amount: paymentIntent.amount / 100,
      });

      return paymentIntent;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error capturing payment',
          error: error.message,
          paymentIntentId,
        });
        throw new ApiError(400, `Cannot capture payment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Cancel a Payment Intent
   */
  async cancelPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      logger.info({
        message: 'Payment cancelled',
        paymentIntentId,
      });

      return paymentIntent;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error cancelling payment',
          error: error.message,
          paymentIntentId,
        });
        throw new ApiError(400, `Cannot cancel payment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Refund a payment (full or partial)
   */
  async refundPayment(params: RefundPaymentParams): Promise<Stripe.Refund> {
    try {
      const { paymentIntentId, amount, reason = 'requested_by_customer' } = params;

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason,
      };

      // Add amount for partial refund
      if (amount) {
        refundParams.amount = Math.round(amount);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      logger.info({
        message: 'Refund created',
        refundId: refund.id,
        paymentIntentId,
        amount: refund.amount / 100,
        reason,
      });

      return refund;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error creating refund',
          error: error.message,
          paymentIntentId,
        });
        throw new ApiError(400, `Cannot refund payment: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (error) {
      logger.error({
        message: 'Webhook signature verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(400, 'Invalid webhook signature');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    paymentIntentId: string
  ): Promise<{
    status: Stripe.PaymentIntent.Status;
    amount: number;
    currency: string;
    paid: boolean;
  }> {
    const paymentIntent = await this.getPaymentIntent(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert to EUR
      currency: paymentIntent.currency,
      paid: paymentIntent.status === 'succeeded',
    };
  }

  /**
   * List customer payments
   */
  async listCustomerPayments(
    customerId: string,
    limit = 10
  ): Promise<Stripe.PaymentIntent[]> {
    try {
      // First get the Stripe customer
      const customers = await this.stripe.customers.list({
        limit: 1,
      });

      const customer = customers.data.find(
        (c) => c.metadata.customerId === customerId
      );

      if (!customer) {
        return [];
      }

      // Get payment intents for this customer
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customer.id,
        limit,
      });

      return paymentIntents.data;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        logger.error({
          message: 'Stripe error listing payments',
          error: error.message,
        });
        return [];
      }
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
