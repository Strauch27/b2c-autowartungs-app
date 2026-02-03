/**
 * Notification Integration Examples
 * Zeigt wie Notifications in verschiedenen Geschäftsprozessen integriert werden
 */

import { PrismaClient, BookingStatus } from '@prisma/client';
import {
  sendBookingConfirmation,
  sendJockeyAssigned,
  sendPickupReminder,
  sendInTransitToWorkshop,
  sendInWorkshop,
  sendServiceComplete,
  sendInTransitToCustomer,
  sendVehicleDelivered,
  sendPaymentConfirmation,
  sendServiceExtension,
} from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * BEISPIEL 1: Booking erstellt und bezahlt
 * Sendet Bestätigungsbenachrichtigung nach erfolgreicher Zahlung
 */
export async function handleBookingConfirmed(bookingId: string): Promise<void> {
  // Booking laden
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      vehicle: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update Booking Status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CONFIRMED,
      paidAt: new Date(),
    },
  });

  // Push-Benachrichtigung senden
  await sendBookingConfirmation(
    booking.customerId,
    booking.id,
    booking.bookingNumber,
    booking.pickupDate
  );

  console.log(`Booking confirmation sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 2: Fahrer zugewiesen
 * Benachrichtigt Kunden, dass ein Fahrer zugewiesen wurde
 */
export async function handleJockeyAssignment(
  bookingId: string,
  jockeyId: string
): Promise<void> {
  // Booking und Jockey laden
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  const jockey = await prisma.user.findUnique({
    where: { id: jockeyId },
    include: {
      jockeyProfile: true,
    },
  });

  if (!booking || !jockey) {
    throw new Error('Booking or Jockey not found');
  }

  // Jockey zuweisen
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      jockeyId,
      status: BookingStatus.JOCKEY_ASSIGNED,
    },
  });

  // Benachrichtigung senden
  const jockeyName = `${jockey.firstName || ''} ${jockey.lastName || ''}`.trim();
  await sendJockeyAssigned(
    booking.customerId,
    booking.id,
    booking.bookingNumber,
    jockeyName
  );

  console.log(`Jockey assignment notification sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 3: Abholungserinnerung
 * Automated Job der 2 Stunden vor Abholung läuft
 */
export async function sendPickupReminders(): Promise<void> {
  // Finde alle Bookings die in 2 Stunden abgeholt werden
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const oneHourFromNow = new Date(Date.now() + 1 * 60 * 60 * 1000);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      pickupDate: {
        gte: oneHourFromNow,
        lte: twoHoursFromNow,
      },
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.JOCKEY_ASSIGNED],
      },
    },
  });

  for (const booking of upcomingBookings) {
    await sendPickupReminder(
      booking.customerId,
      booking.id,
      booking.bookingNumber,
      booking.pickupTimeSlot
    );
  }

  console.log(`Sent ${upcomingBookings.length} pickup reminders`);
}

/**
 * BEISPIEL 4: Status-Updates während des Prozesses
 * Workflow von Abholung bis Zustellung
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update Status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
  });

  // Sende entsprechende Benachrichtigung basierend auf neuem Status
  switch (newStatus) {
    case BookingStatus.IN_TRANSIT_TO_WORKSHOP:
      await sendInTransitToWorkshop(
        booking.customerId,
        booking.id,
        booking.bookingNumber
      );
      break;

    case BookingStatus.IN_WORKSHOP:
      await sendInWorkshop(booking.customerId, booking.id, booking.bookingNumber);
      break;

    case BookingStatus.COMPLETED:
      await sendServiceComplete(booking.customerId, booking.id, booking.bookingNumber);
      break;

    case BookingStatus.IN_TRANSIT_TO_CUSTOMER:
      // Geschätzte Ankunftszeit berechnen (Beispiel: 30 Minuten)
      const estimatedArrival = new Date(Date.now() + 30 * 60 * 1000);
      await sendInTransitToCustomer(
        booking.customerId,
        booking.id,
        booking.bookingNumber,
        estimatedArrival
      );
      break;

    case BookingStatus.DELIVERED:
      await sendVehicleDelivered(booking.customerId, booking.id, booking.bookingNumber);
      break;
  }

  console.log(`Status updated and notification sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 5: Zahlungsbestätigung
 * Nach erfolgreicher Stripe-Zahlung
 */
export async function handlePaymentSuccess(
  bookingId: string,
  paymentIntentId: string,
  amount: number
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update Booking mit Payment-Info
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentIntentId,
      paidAt: new Date(),
      status: BookingStatus.CONFIRMED,
    },
  });

  // Zahlungsbestätigung senden
  await sendPaymentConfirmation(
    booking.customerId,
    booking.id,
    booking.bookingNumber,
    amount
  );

  console.log(`Payment confirmation sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 6: Service-Erweiterung
 * Werkstatt findet zusätzliche Probleme
 */
export async function requestServiceExtension(
  bookingId: string,
  additionalServices: string,
  additionalCost: number
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Benachrichtigung über zusätzliche Arbeiten senden
  await sendServiceExtension(
    booking.customerId,
    booking.id,
    booking.bookingNumber,
    additionalServices,
    additionalCost
  );

  // Optional: Status setzen dass Kundenfreigabe erforderlich ist
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      internalNotes: `Service extension requested: ${additionalServices} (+${additionalCost}€)`,
    },
  });

  console.log(`Service extension notification sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 7: Cron Job für tägliche Erinnerungen
 * Läuft täglich um 8:00 Uhr
 */
export async function dailyNotificationJob(): Promise<void> {
  console.log('Running daily notification job...');

  // 1. Pickup-Erinnerungen für heute
  await sendPickupReminders();

  // 2. Erinnerung für überfällige Buchungen (optional)
  const overdueBookings = await prisma.booking.findMany({
    where: {
      pickupDate: {
        lt: new Date(),
      },
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.JOCKEY_ASSIGNED],
      },
    },
  });

  console.log(`Found ${overdueBookings.length} overdue bookings`);

  // 3. Weitere geplante Benachrichtigungen...

  console.log('Daily notification job completed');
}

/**
 * BEISPIEL 8: Webhook-Integration (z.B. von Odoo)
 * Externe Systeme können Benachrichtigungen triggern
 */
export async function handleOdooWebhook(payload: {
  bookingNumber: string;
  event: string;
  data?: any;
}): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: payload.bookingNumber },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Handle verschiedene Events
  switch (payload.event) {
    case 'service_started':
      await sendInWorkshop(booking.customerId, booking.id, booking.bookingNumber);
      break;

    case 'service_completed':
      await sendServiceComplete(booking.customerId, booking.id, booking.bookingNumber);
      break;

    case 'additional_work_needed':
      await sendServiceExtension(
        booking.customerId,
        booking.id,
        booking.bookingNumber,
        payload.data.description,
        payload.data.cost
      );
      break;
  }

  console.log(`Webhook notification sent for ${booking.bookingNumber}`);
}

/**
 * BEISPIEL 9: Bulk-Benachrichtigungen
 * An mehrere Kunden gleichzeitig (z.B. Systemwartung)
 */
export async function sendBulkNotification(
  userIds: string[],
  title: string,
  body: string
): Promise<void> {
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      // Verwende die generische sendNotification Funktion
      const { sendNotification } = await import('../services/notification.service');
      return sendNotification({
        userId,
        type: 'GENERAL',
        title,
        body,
      });
    })
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  console.log(`Bulk notification sent: ${successful} successful, ${failed} failed`);
}
