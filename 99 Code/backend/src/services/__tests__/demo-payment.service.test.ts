/**
 * Demo Payment Service Unit Tests
 */

import { DemoPaymentService } from '../demo-payment.service';

describe('DemoPaymentService', () => {
  let service: DemoPaymentService;

  beforeEach(() => {
    service = new DemoPaymentService();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct fields', async () => {
      const result = await service.createPaymentIntent({
        amount: 14900,
        bookingId: 'booking-1',
        customerId: 'customer-1',
        customerEmail: 'test@test.de',
      });

      expect(result.id).toMatch(/^demo_pi_/);
      expect(result.client_secret).toContain('_secret_');
      expect(result.amount).toBe(14900);
      expect(result.status).toBe('requires_payment_method');
    });

    it('should store the intent and allow retrieval', async () => {
      const result = await service.createPaymentIntent({
        amount: 5000,
        bookingId: 'booking-2',
        customerId: 'customer-2',
        customerEmail: 'test2@test.de',
      });

      const intent = await service.getPaymentIntent(result.id);
      expect(intent.amount).toBe(5000);
      expect(intent.currency).toBe('eur');
      expect(intent.metadata.bookingId).toBe('booking-2');
      expect(intent.metadata.customerId).toBe('customer-2');
    });

    it('should default to automatic capture', async () => {
      const result = await service.createPaymentIntent({
        amount: 1000,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });

      const intent = await service.getPaymentIntent(result.id);
      expect(intent.captureMethod).toBe('automatic');
    });

    it('should support manual capture method', async () => {
      const result = await service.createPaymentIntent({
        amount: 2000,
        bookingId: 'b2',
        customerId: 'c2',
        customerEmail: 'e@e.de',
        captureMethod: 'manual',
      });

      const intent = await service.getPaymentIntent(result.id);
      expect(intent.captureMethod).toBe('manual');
    });

    it('should include custom metadata', async () => {
      const result = await service.createPaymentIntent({
        amount: 3000,
        bookingId: 'b3',
        customerId: 'c3',
        customerEmail: 'e@e.de',
        metadata: { bookingNumber: 'BK2601001' },
      });

      const intent = await service.getPaymentIntent(result.id);
      expect(intent.metadata.bookingNumber).toBe('BK2601001');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm auto-capture payment as succeeded', async () => {
      const pi = await service.createPaymentIntent({
        amount: 10000,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });

      const result = await service.confirmPayment(pi.id);
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(10000);
    });

    it('should confirm manual-capture payment as requires_action', async () => {
      const pi = await service.createPaymentIntent({
        amount: 5000,
        bookingId: 'b2',
        customerId: 'c2',
        customerEmail: 'e@e.de',
        captureMethod: 'manual',
      });

      const result = await service.confirmPayment(pi.id);
      expect(result.status).toBe('requires_action');
    });

    it('should throw for non-existent payment intent', async () => {
      await expect(service.confirmPayment('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('capturePayment', () => {
    it('should capture a manual-capture payment', async () => {
      const pi = await service.createPaymentIntent({
        amount: 7500,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
        captureMethod: 'manual',
      });
      await service.confirmPayment(pi.id);

      const result = await service.capturePayment(pi.id);
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(7500);
    });

    it('should throw for auto-capture payment intent', async () => {
      const pi = await service.createPaymentIntent({
        amount: 1000,
        bookingId: 'b2',
        customerId: 'c2',
        customerEmail: 'e@e.de',
        captureMethod: 'automatic',
      });

      await expect(service.capturePayment(pi.id)).rejects.toThrow('not set for manual capture');
    });

    it('should throw for non-existent payment intent', async () => {
      await expect(service.capturePayment('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a payment intent', async () => {
      const pi = await service.createPaymentIntent({
        amount: 5000,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });

      const result = await service.cancelPayment(pi.id);
      expect(result.status).toBe('canceled');
    });

    it('should throw for non-existent payment intent', async () => {
      await expect(service.cancelPayment('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return correct status info', async () => {
      const pi = await service.createPaymentIntent({
        amount: 9900,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });
      await service.confirmPayment(pi.id);

      const status = await service.getPaymentStatus(pi.id);
      expect(status.status).toBe('succeeded');
      expect(status.amount).toBe(99); // converted to EUR
      expect(status.currency).toBe('eur');
      expect(status.paid).toBe(true);
    });

    it('should show unpaid for unconfirmed intent', async () => {
      const pi = await service.createPaymentIntent({
        amount: 5000,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });

      const status = await service.getPaymentStatus(pi.id);
      expect(status.paid).toBe(false);
    });

    it('should throw for non-existent payment intent', async () => {
      await expect(service.getPaymentStatus('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('authorizeExtensionPayment', () => {
    it('should create manual-capture payment for extension', async () => {
      const result = await service.authorizeExtensionPayment({
        amount: 3500,
        extensionId: 'ext-1',
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });

      expect(result.id).toMatch(/^demo_pi_/);
      const intent = await service.getPaymentIntent(result.id);
      expect(intent.captureMethod).toBe('manual');
      expect(intent.metadata.extensionId).toBe('ext-1');
      expect(intent.metadata.type).toBe('extension');
    });
  });

  describe('clearAll', () => {
    it('should clear all payment intents', async () => {
      await service.createPaymentIntent({
        amount: 1000,
        bookingId: 'b1',
        customerId: 'c1',
        customerEmail: 'e@e.de',
      });
      const pi = await service.createPaymentIntent({
        amount: 2000,
        bookingId: 'b2',
        customerId: 'c2',
        customerEmail: 'e2@e.de',
      });

      service.clearAll();

      await expect(service.getPaymentIntent(pi.id)).rejects.toThrow('not found');
    });
  });
});
