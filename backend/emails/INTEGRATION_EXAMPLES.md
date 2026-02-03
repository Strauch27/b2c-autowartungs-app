# Email Service Integration Examples

Praktische Beispiele für die Integration des Email Services in verschiedene Teile der Anwendung.

---

## 1. Booking Flow Integration

### Booking Creation (mit Email)

```typescript
// src/services/bookings.service.ts
import { sendBookingConfirmation } from './email.service';

async createBooking(input: CreateBookingInput): Promise<BookingWithRelations> {
  // 1. Validate and create booking
  const booking = await this.bookingsRepository.create(bookingParams);

  // 2. Send confirmation email (non-blocking)
  try {
    await sendBookingConfirmation(booking);
  } catch (error) {
    // Log error but don't fail the booking
    logger.error({
      message: 'Failed to send booking confirmation email',
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return booking;
}
```

### Mit Background Queue (Optional, für Production empfohlen)

```typescript
// src/services/bookings.service.ts
import { emailQueue } from '../queues/email.queue';

async createBooking(input: CreateBookingInput): Promise<BookingWithRelations> {
  const booking = await this.bookingsRepository.create(bookingParams);

  // Queue email for background processing
  await emailQueue.add('booking-confirmation', {
    bookingId: booking.id
  });

  return booking;
}

// src/queues/email.queue.ts (Optional BullMQ Setup)
import { Queue, Worker } from 'bullmq';
import { sendBookingConfirmation } from '../services/email.service';
import { bookingsRepository } from '../repositories/bookings.repository';

export const emailQueue = new Queue('emails', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

const emailWorker = new Worker('emails', async (job) => {
  switch (job.name) {
    case 'booking-confirmation':
      const booking = await bookingsRepository.findById(job.data.bookingId);
      if (booking) {
        await sendBookingConfirmation(booking);
      }
      break;
    // ... other email types
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});
```

---

## 2. Payment Flow Integration

### Stripe Webhook Handler

```typescript
// src/controllers/webhooks.controller.ts
import { sendPaymentReceipt } from '../services/email.service';
import { BookingsRepository } from '../repositories/bookings.repository';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update booking status
    const booking = await bookingsRepository.updateByPaymentIntent(
      paymentIntent.id,
      {
        status: BookingStatus.CONFIRMED,
        paidAt: new Date()
      }
    );

    // Send payment receipt email
    if (booking) {
      try {
        await sendPaymentReceipt(booking, {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          paymentMethod: getPaymentMethodLabel(paymentIntent.payment_method),
          paidAt: new Date()
        });
      } catch (error) {
        logger.error('Failed to send payment receipt', error);
      }
    }
  }

  res.json({ received: true });
}

function getPaymentMethodLabel(paymentMethod: any): string {
  // Extract payment method details from Stripe
  if (paymentMethod?.card) {
    return `Kreditkarte (${paymentMethod.card.brand} **** ${paymentMethod.card.last4})`;
  }
  return 'Kreditkarte';
}
```

---

## 3. Status Update Integration

### Automatic Status Updates

```typescript
// src/services/bookings.service.ts
import { sendStatusUpdate } from './email.service';

async updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  additionalNotes?: string
): Promise<BookingWithRelations> {
  // Update booking
  const booking = await this.bookingsRepository.update(bookingId, {
    status: newStatus
  });

  // Send email for important status changes
  const notifiableStatuses = [
    BookingStatus.CONFIRMED,
    BookingStatus.JOCKEY_ASSIGNED,
    BookingStatus.IN_TRANSIT_TO_WORKSHOP,
    BookingStatus.IN_WORKSHOP,
    BookingStatus.COMPLETED,
    BookingStatus.IN_TRANSIT_TO_CUSTOMER,
    BookingStatus.DELIVERED
  ];

  if (notifiableStatuses.includes(newStatus)) {
    try {
      await sendStatusUpdate(booking, newStatus, additionalNotes);
    } catch (error) {
      logger.error('Failed to send status update email', error);
    }
  }

  return booking;
}
```

### Jockey Assignment Flow

```typescript
// src/services/jockey.service.ts
import { sendStatusUpdate } from './email.service';

async assignJockeyToBooking(
  bookingId: string,
  jockeyId: string
): Promise<BookingWithRelations> {
  // Assign jockey
  const booking = await bookingsRepository.update(bookingId, {
    jockeyId,
    status: BookingStatus.JOCKEY_ASSIGNED
  });

  // Send notification to customer
  try {
    await sendStatusUpdate(
      booking,
      BookingStatus.JOCKEY_ASSIGNED,
      `Ihr Jockey ${booking.jockey?.firstName} wird Sie vor dem Termin kontaktieren.`
    );
  } catch (error) {
    logger.error('Failed to send jockey assignment email', error);
  }

  // Optional: Send notification to jockey
  // await sendJockeyAssignmentNotification(booking);

  return booking;
}
```

---

## 4. Extension/Reschedule Flow

### Workshop initiiert Terminverschiebung

```typescript
// src/services/workshop.service.ts
import { sendExtensionRequest } from '../services/email.service';

async requestBookingExtension(
  bookingId: string,
  newPickupDate: Date,
  newPickupTimeSlot: string,
  reason: string
): Promise<void> {
  const booking = await bookingsRepository.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Generate confirmation/decline URLs
  const confirmToken = generateSecureToken();
  const declineToken = generateSecureToken();

  // Store tokens in database
  await extensionRequestRepository.create({
    bookingId,
    newPickupDate,
    newPickupTimeSlot,
    reason,
    confirmToken,
    declineToken,
    status: 'PENDING'
  });

  // Send extension request email
  await sendExtensionRequest(booking, {
    newPickupDate,
    newPickupTimeSlot,
    reason,
    estimatedDelivery: calculateEstimatedDelivery(newPickupDate),
    confirmationUrl: `${process.env.FRONTEND_URL}/bookings/${bookingId}/confirm-extension?token=${confirmToken}`,
    declineUrl: `${process.env.FRONTEND_URL}/bookings/${bookingId}/decline-extension?token=${declineToken}`
  });
}

// Handler für Bestätigung
async confirmExtension(bookingId: string, token: string): Promise<void> {
  const extensionRequest = await extensionRequestRepository.findByToken(token);

  if (!extensionRequest || extensionRequest.status !== 'PENDING') {
    throw new ApiError(400, 'Invalid or expired extension request');
  }

  // Update booking
  await bookingsRepository.update(bookingId, {
    pickupDate: extensionRequest.newPickupDate,
    pickupTimeSlot: extensionRequest.newPickupTimeSlot
  });

  // Update extension request
  await extensionRequestRepository.update(extensionRequest.id, {
    status: 'CONFIRMED'
  });

  // Send confirmation email
  const booking = await bookingsRepository.findById(bookingId);
  await sendStatusUpdate(
    booking!,
    booking!.status,
    'Ihr neuer Termin wurde bestätigt.'
  );
}
```

---

## 5. Authentication Flow

### Magic Link Login

```typescript
// src/controllers/auth.controller.ts
import { sendMagicLinkEmail } from '../services/email.service';

export async function requestMagicLink(req: Request, res: Response) {
  const { email } = req.body;

  // Validate email exists
  const user = await usersRepository.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists for security
    return res.json({ message: 'If an account exists, a login link has been sent.' });
  }

  // Generate magic link token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.MAGIC_LINK_SECRET!,
    { expiresIn: '15m' }
  );

  // Generate magic link
  const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

  // Send email
  try {
    await sendMagicLinkEmail(email, magicLink);
  } catch (error) {
    logger.error('Failed to send magic link email', error);
    return res.status(500).json({ error: 'Failed to send login link' });
  }

  res.json({ message: 'Login link sent to your email address.' });
}

export async function verifyMagicLink(req: Request, res: Response) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token as string, process.env.MAGIC_LINK_SECRET!);

    // Create session
    const session = await sessionsRepository.create({
      userId: decoded.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Return session token
    res.json({
      token: session.token,
      user: await usersRepository.findById(decoded.userId)
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired login link' });
  }
}
```

---

## 6. Error Handling Patterns

### Graceful Degradation

```typescript
// Wrapper function für sichere Email-Versendung
async function sendEmailSafely<T extends (...args: any[]) => Promise<void>>(
  emailFunction: T,
  ...args: Parameters<T>
): Promise<void> {
  try {
    await emailFunction(...args);
  } catch (error) {
    logger.error({
      message: 'Email sending failed',
      function: emailFunction.name,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw - allow main operation to continue
  }
}

// Verwendung
await sendEmailSafely(sendBookingConfirmation, booking);
```

### Retry Mechanism

```typescript
async function sendEmailWithRetry<T extends (...args: any[]) => Promise<void>>(
  emailFunction: T,
  args: Parameters<T>,
  maxRetries = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await emailFunction(...args);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      logger.warn({
        message: 'Email sending failed, retrying',
        attempt,
        maxRetries,
        error: lastError.message
      });

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  // All retries failed
  logger.error({
    message: 'Email sending failed after all retries',
    error: lastError?.message
  });
}
```

---

## 7. Testing Integration

### Unit Tests

```typescript
// src/services/__tests__/bookings.service.test.ts
import { BookingsService } from '../bookings.service';
import * as emailService from '../email.service';

jest.mock('../email.service');

describe('BookingsService', () => {
  describe('createBooking', () => {
    it('should send confirmation email after booking creation', async () => {
      const sendBookingConfirmationSpy = jest.spyOn(
        emailService,
        'sendBookingConfirmation'
      );

      const booking = await bookingsService.createBooking(mockInput);

      expect(sendBookingConfirmationSpy).toHaveBeenCalledWith(booking);
    });

    it('should create booking even if email fails', async () => {
      jest.spyOn(emailService, 'sendBookingConfirmation')
        .mockRejectedValue(new Error('Email failed'));

      const booking = await bookingsService.createBooking(mockInput);

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();
    });
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/booking-flow.test.ts
describe('Booking Flow Integration', () => {
  it('should create booking and send confirmation email', async () => {
    // Setup email provider mock
    process.env.EMAIL_PROVIDER = 'console';

    // Create booking
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingData);

    expect(response.status).toBe(201);

    // Verify email was triggered (check logs or mock)
    expect(emailLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('Buchungsbestätigung')
      })
    );
  });
});
```

---

## 8. Monitoring & Analytics

### Email Tracking Wrapper

```typescript
// src/services/email-tracking.service.ts
interface EmailMetrics {
  emailType: string;
  recipient: string;
  status: 'sent' | 'failed';
  timestamp: Date;
  provider: string;
  errorMessage?: string;
}

async function sendTrackedEmail<T extends (...args: any[]) => Promise<void>>(
  emailType: string,
  emailFunction: T,
  ...args: Parameters<T>
): Promise<void> {
  const startTime = Date.now();

  try {
    await emailFunction(...args);

    // Track success
    await metricsService.record({
      emailType,
      status: 'sent',
      duration: Date.now() - startTime,
      provider: process.env.EMAIL_PROVIDER
    });
  } catch (error) {
    // Track failure
    await metricsService.record({
      emailType,
      status: 'failed',
      duration: Date.now() - startTime,
      provider: process.env.EMAIL_PROVIDER,
      errorMessage: error.message
    });

    throw error;
  }
}

// Verwendung
await sendTrackedEmail('booking-confirmation', sendBookingConfirmation, booking);
```

---

## Best Practices Summary

1. **Non-Blocking**: Emails sollten Hauptfunktionalität nie blockieren
2. **Error Handling**: Immer try-catch verwenden, Fehler loggen
3. **Async Processing**: Für Production Queue verwenden (BullMQ)
4. **Testing**: Email-Funktionen mocken in Unit Tests
5. **Monitoring**: Email-Erfolgsraten und -Fehler tracken
6. **Retry Logic**: Bei kritischen Emails Retry implementieren
7. **Graceful Degradation**: App funktioniert auch wenn Email-Service ausfällt

---

**Version**: 1.0.0
**Last Updated**: 2024-02-01
