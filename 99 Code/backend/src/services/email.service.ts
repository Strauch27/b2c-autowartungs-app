/**
 * Email Service
 * Handles all transactional emails for the B2C Autowartungs-App
 *
 * Features:
 * - Multiple email providers (Resend, SendGrid, SMTP, Console)
 * - Handlebars template engine for dynamic content
 * - Type-safe email data structures
 * - Comprehensive error handling and logging
 * - Test mode for development
 */

import { Resend } from 'resend';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';
import { Booking, BookingStatus, ServiceType, User, Vehicle } from '@prisma/client';

// Type definitions
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface BookingWithRelations extends Booking {
  customer: User;
  vehicle: Vehicle;
  jockey?: User | null;
}

// Email provider configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console';
const EMAIL_FROM = process.env.EMAIL_FROM || 'B2C Autowartung <noreply@b2c-autowartung.de>';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend client
let resendClient: Resend | null = null;
if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY);
}

// Template cache
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Service Type Labels (German)
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  INSPECTION: 'Inspektion',
  OIL_SERVICE: 'Ölwechsel',
  BRAKE_SERVICE: 'Bremsenwartung',
  TUV: 'TÜV/HU',
  CLIMATE_SERVICE: 'Klimaservice',
  CUSTOM: 'Individueller Service'
};

/**
 * Booking Status Labels (German)
 */
const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Zahlung ausstehend',
  CONFIRMED: 'Bestätigt',
  JOCKEY_ASSIGNED: 'Jockey zugewiesen',
  IN_TRANSIT_TO_WORKSHOP: 'Auf dem Weg zur Werkstatt',
  IN_WORKSHOP: 'In der Werkstatt',
  COMPLETED: 'Abgeschlossen',
  IN_TRANSIT_TO_CUSTOMER: 'Auf dem Rückweg',
  DELIVERED: 'Übergeben',
  CANCELLED: 'Storniert'
};

/**
 * Register Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Equality helper
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Greater than helper
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });

  // Format date helper
  Handlebars.registerHelper('formatDate', function(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Format price helper
  Handlebars.registerHelper('formatPrice', function(price: number | string) {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2).replace('.', ',');
  });
}

// Register helpers on module load
registerHandlebarsHelpers();

/**
 * Load and compile email template
 */
async function loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
  // Check cache first
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  try {
    const templatePath = path.join(__dirname, '../../emails/templates', `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);

    // Cache the compiled template
    templateCache.set(templateName, compiledTemplate);

    return compiledTemplate;
  } catch (error) {
    logger.error({
      message: 'Failed to load email template',
      templateName,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

/**
 * Send email using configured provider
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  const fromAddress = options.from || EMAIL_FROM;

  try {
    switch (EMAIL_PROVIDER) {
      case 'resend':
        await sendWithResend({ ...options, from: fromAddress });
        break;
      case 'sendgrid':
        await sendWithSendGrid({ ...options, from: fromAddress });
        break;
      case 'smtp':
        await sendWithSMTP({ ...options, from: fromAddress });
        break;
      case 'console':
      default:
        await sendWithConsole({ ...options, from: fromAddress });
        break;
    }

    logger.info({
      message: 'Email sent successfully',
      provider: EMAIL_PROVIDER,
      to: options.to,
      subject: options.subject
    });
  } catch (error) {
    logger.error({
      message: 'Failed to send email',
      provider: EMAIL_PROVIDER,
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(options: EmailOptions): Promise<void> {
  if (!resendClient) {
    throw new Error('Resend client not initialized. Please set RESEND_API_KEY environment variable.');
  }

  await resendClient.emails.send({
    from: options.from!,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  });
}

/**
 * Send email using SendGrid (placeholder for future implementation)
 */
async function sendWithSendGrid(options: EmailOptions): Promise<void> {
  // TODO: Implement SendGrid integration
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: options.from,
  //   subject: options.subject,
  //   text: options.text,
  //   html: options.html
  // });

  logger.warn('SendGrid email would be sent (not implemented):', options);
}

/**
 * Send email using SMTP with Nodemailer
 */
async function sendWithSMTP(options: EmailOptions): Promise<void> {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
}

/**
 * Log email to console (for development)
 */
async function sendWithConsole(options: EmailOptions): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('EMAIL PREVIEW (Console Mode)');
  console.log('='.repeat(80));
  console.log('From:', options.from);
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('-'.repeat(80));
  console.log('Text Content:');
  console.log(options.text || '(No text content)');
  console.log('-'.repeat(80));
  console.log('HTML Content (truncated):');
  console.log(options.html.substring(0, 500) + '...');
  console.log('='.repeat(80) + '\n');
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  booking: BookingWithRelations
): Promise<void> {
  try {
    const template = await loadTemplate('booking-confirmation');

    const customerName = booking.customer.firstName
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Kunde';

    const templateData = {
      customerName,
      email: booking.customer.email,
      bookingNumber: booking.bookingNumber,
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        mileage: booking.vehicle.mileage.toLocaleString('de-DE'),
        licensePlate: booking.vehicle.licensePlate
      },
      serviceTypeLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      statusLabel: BOOKING_STATUS_LABELS[booking.status],
      isPaid: booking.paidAt !== null,
      pickupDate: new Date(booking.pickupDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      pickupTimeSlot: booking.pickupTimeSlot,
      pickupAddress: booking.pickupAddress,
      pickupPostalCode: booking.pickupPostalCode,
      pickupCity: booking.pickupCity,
      totalPrice: parseFloat(booking.totalPrice.toString()).toFixed(2).replace('.', ','),
      customerNotes: booking.customerNotes
    };

    const html = template(templateData);
    const text = generatePlainTextFromBooking(booking, 'Buchungsbestätigung');

    await sendEmail({
      to: booking.customer.email,
      subject: `Buchungsbestätigung - ${booking.bookingNumber}`,
      html,
      text
    });
  } catch (error) {
    logger.error({
      message: 'Failed to send booking confirmation email',
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(
  booking: BookingWithRelations,
  payment: {
    paymentIntentId: string;
    amount: number;
    paymentMethod: string;
    paidAt: Date;
  }
): Promise<void> {
  try {
    const template = await loadTemplate('payment-receipt');

    const customerName = booking.customer.firstName
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Kunde';

    const totalPrice = parseFloat(booking.totalPrice.toString());
    const vatRate = 0.19;
    const basePrice = totalPrice / (1 + vatRate);
    const vatAmount = totalPrice - basePrice;

    const priceBreakdown = booking.priceBreakdown as any || {};
    const ageMultiplier = priceBreakdown.ageMultiplier || 1;
    const ageMultiplierAmount = ageMultiplier > 1
      ? ((basePrice * (ageMultiplier - 1)) / ageMultiplier).toFixed(2)
      : '0.00';

    const templateData = {
      customerName,
      email: booking.customer.email,
      bookingNumber: booking.bookingNumber,
      serviceTypeLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      },
      pickupDate: new Date(booking.pickupDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      pickupTimeSlot: booking.pickupTimeSlot,
      pickupAddress: booking.pickupAddress,
      pickupPostalCode: booking.pickupPostalCode,
      pickupCity: booking.pickupCity,
      basePrice: basePrice.toFixed(2).replace('.', ','),
      ageMultiplierAmount: ageMultiplierAmount.replace('.', ','),
      vatAmount: vatAmount.toFixed(2).replace('.', ','),
      totalPrice: totalPrice.toFixed(2).replace('.', ','),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.paymentIntentId,
      paymentDate: payment.paidAt.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      priceBreakdown
    };

    const html = template(templateData);
    const text = generatePlainTextFromBooking(booking, 'Zahlungsbestätigung');

    await sendEmail({
      to: booking.customer.email,
      subject: `Zahlungsbestätigung - ${booking.bookingNumber}`,
      html,
      text
    });
  } catch (error) {
    logger.error({
      message: 'Failed to send payment receipt email',
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Send extension/reschedule request email
 */
export async function sendExtensionRequest(
  booking: BookingWithRelations,
  extension: {
    newPickupDate: Date;
    newPickupTimeSlot: string;
    reason?: string;
    estimatedDelivery?: Date;
    confirmationUrl?: string;
    declineUrl?: string;
  }
): Promise<void> {
  try {
    const template = await loadTemplate('extension-request');

    const customerName = booking.customer.firstName
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Kunde';

    const templateData = {
      customerName,
      email: booking.customer.email,
      bookingNumber: booking.bookingNumber,
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      },
      serviceTypeLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      currentPickupDate: new Date(booking.pickupDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      currentPickupTimeSlot: booking.pickupTimeSlot,
      newPickupDate: extension.newPickupDate.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      newPickupTimeSlot: extension.newPickupTimeSlot,
      estimatedDelivery: extension.estimatedDelivery?.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      reason: extension.reason,
      confirmationUrl: extension.confirmationUrl,
      declineUrl: extension.declineUrl,
      pickupAddress: booking.pickupAddress,
      pickupPostalCode: booking.pickupPostalCode,
      pickupCity: booking.pickupCity
    };

    const html = template(templateData);
    const text = `Terminverschiebung für Buchung ${booking.bookingNumber}\n\nNeuer Termin: ${templateData.newPickupDate} um ${extension.newPickupTimeSlot}`;

    await sendEmail({
      to: booking.customer.email,
      subject: `Terminverschiebung erforderlich - ${booking.bookingNumber}`,
      html,
      text
    });
  } catch (error) {
    logger.error({
      message: 'Failed to send extension request email',
      bookingId: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Send booking status update email
 */
export async function sendStatusUpdate(
  booking: BookingWithRelations,
  newStatus: BookingStatus,
  additionalNotes?: string
): Promise<void> {
  try {
    const template = await loadTemplate('status-update');

    const customerName = booking.customer.firstName
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Kunde';

    // Get status-specific data
    const statusData = getStatusUpdateData(newStatus);

    // Calculate progress percentage
    const progressPercent = calculateProgressPercent(newStatus);

    // Build timeline
    const timeline = buildTimeline(newStatus);

    const templateData = {
      customerName,
      email: booking.customer.email,
      bookingNumber: booking.bookingNumber,
      currentStatus: newStatus,
      statusLabel: BOOKING_STATUS_LABELS[newStatus],
      statusClass: newStatus.toLowerCase().replace(/_/g, '-'),
      statusIcon: statusData.icon,
      statusTitle: statusData.title,
      statusDescription: statusData.description,
      progressPercent,
      vehicle: {
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      },
      serviceTypeLabel: SERVICE_TYPE_LABELS[booking.serviceType],
      pickupDate: booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
      deliveryDate: booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
      jockey: booking.jockey ? {
        name: `${booking.jockey.firstName || ''} ${booking.jockey.lastName || ''}`.trim() || 'Jockey',
        phone: booking.jockey.phone
      } : null,
      timeline,
      nextSteps: statusData.nextSteps,
      additionalNotes
    };

    const html = template(templateData);
    const text = `Status-Update für Buchung ${booking.bookingNumber}\n\nNeuer Status: ${BOOKING_STATUS_LABELS[newStatus]}`;

    await sendEmail({
      to: booking.customer.email,
      subject: `Status-Update: ${BOOKING_STATUS_LABELS[newStatus]} - ${booking.bookingNumber}`,
      html,
      text
    });
  } catch (error) {
    logger.error({
      message: 'Failed to send status update email',
      bookingId: booking.id,
      newStatus,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Send magic link email (for authentication)
 */
export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<void> {
  const htmlContent = generateMagicLinkEmailHTML(email, magicLink);
  const textContent = generateMagicLinkEmailText(email, magicLink);

  await sendEmail({
    to: email,
    subject: 'Ihr Login-Link - B2C Autowartung',
    html: htmlContent,
    text: textContent
  });
}

/**
 * Helper: Get status-specific update data
 */
function getStatusUpdateData(status: BookingStatus): {
  icon: string;
  title: string;
  description: string;
  nextSteps: string[];
} {
  const statusMap: Record<BookingStatus, any> = {
    PENDING_PAYMENT: {
      icon: '⏳',
      title: 'Zahlung ausstehend',
      description: 'Bitte schließen Sie die Zahlung ab, um Ihre Buchung zu bestätigen.',
      nextSteps: [
        'Zahlung über den bereitgestellten Link abschließen',
        'Bestätigung abwarten'
      ]
    },
    CONFIRMED: {
      icon: '✓',
      title: 'Buchung bestätigt',
      description: 'Ihre Buchung wurde erfolgreich bestätigt. Wir weisen in Kürze einen Jockey zu.',
      nextSteps: [
        'Warten auf Jockey-Zuweisung',
        'Sie erhalten eine Benachrichtigung sobald ein Jockey zugewiesen wurde'
      ]
    },
    JOCKEY_ASSIGNED: {
      icon: '👤',
      title: 'Jockey zugewiesen',
      description: 'Ein Jockey wurde Ihrer Buchung zugewiesen und wird Sie vor dem Termin kontaktieren.',
      nextSteps: [
        'Der Jockey wird Sie kontaktieren, um die Abholung zu bestätigen',
        'Fahrzeugschlüssel und Papiere bereithalten'
      ]
    },
    IN_TRANSIT_TO_WORKSHOP: {
      icon: '🚗',
      title: 'Auf dem Weg zur Werkstatt',
      description: 'Ihr Fahrzeug wird gerade zur Werkstatt gebracht.',
      nextSteps: [
        'Service beginnt in Kürze',
        'Sie erhalten Updates zum Fortschritt'
      ]
    },
    IN_WORKSHOP: {
      icon: '🔧',
      title: 'Service läuft',
      description: 'Ihr Fahrzeug befindet sich derzeit in der Werkstatt und wird gewartet.',
      nextSteps: [
        'Service wird durchgeführt',
        'Bei Bedarf werden Sie über zusätzliche Arbeiten informiert'
      ]
    },
    COMPLETED: {
      icon: '✓',
      title: 'Service abgeschlossen',
      description: 'Der Service an Ihrem Fahrzeug wurde erfolgreich abgeschlossen.',
      nextSteps: [
        'Fahrzeug wird in Kürze zu Ihnen zurückgebracht',
        'Servicebericht wird erstellt'
      ]
    },
    IN_TRANSIT_TO_CUSTOMER: {
      icon: '🚗',
      title: 'Auf dem Rückweg',
      description: 'Ihr Fahrzeug ist auf dem Weg zurück zu Ihnen.',
      nextSteps: [
        'Bitte seien Sie zur vereinbarten Zeit verfügbar',
        'Servicebericht wird bei Übergabe erklärt'
      ]
    },
    DELIVERED: {
      icon: '🎉',
      title: 'Fahrzeug übergeben',
      description: 'Ihr Fahrzeug wurde erfolgreich zurückgegeben. Vielen Dank für Ihr Vertrauen!',
      nextSteps: [
        'Servicebericht prüfen',
        'Bei Fragen kontaktieren Sie uns gerne'
      ]
    },
    CANCELLED: {
      icon: '✗',
      title: 'Buchung storniert',
      description: 'Ihre Buchung wurde storniert.',
      nextSteps: [
        'Bei Fragen zur Stornierung kontaktieren Sie uns',
        'Rückerstattung erfolgt in 5-7 Werktagen'
      ]
    }
  };

  return statusMap[status];
}

/**
 * Helper: Calculate progress percentage based on status
 */
function calculateProgressPercent(status: BookingStatus): number {
  const progressMap: Record<BookingStatus, number> = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 15,
    JOCKEY_ASSIGNED: 30,
    IN_TRANSIT_TO_WORKSHOP: 45,
    IN_WORKSHOP: 60,
    COMPLETED: 75,
    IN_TRANSIT_TO_CUSTOMER: 90,
    DELIVERED: 100,
    CANCELLED: 0
  };

  return progressMap[status];
}

/**
 * Helper: Build timeline object
 */
function buildTimeline(currentStatus: BookingStatus): Record<string, boolean> {
  const statuses = [
    'CONFIRMED',
    'JOCKEY_ASSIGNED',
    'IN_TRANSIT_TO_WORKSHOP',
    'IN_WORKSHOP',
    'COMPLETED',
    'IN_TRANSIT_TO_CUSTOMER',
    'DELIVERED'
  ];

  const currentIndex = statuses.indexOf(currentStatus);

  return {
    confirmed: currentIndex >= 0,
    jockeyAssigned: currentIndex >= 1,
    inTransitToWorkshop: currentIndex >= 2,
    inWorkshop: currentIndex >= 3,
    completed: currentIndex >= 4,
    inTransitToCustomer: currentIndex >= 5,
    delivered: currentIndex >= 6
  };
}

/**
 * Helper: Generate plain text version from booking
 */
function generatePlainTextFromBooking(booking: BookingWithRelations, subject: string): string {
  return `
${subject}

Buchungsnummer: ${booking.bookingNumber}
Fahrzeug: ${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.year})
Service: ${SERVICE_TYPE_LABELS[booking.serviceType]}
Status: ${BOOKING_STATUS_LABELS[booking.status]}

Abholung:
Datum: ${new Date(booking.pickupDate).toLocaleDateString('de-DE')}
Zeitfenster: ${booking.pickupTimeSlot}
Adresse: ${booking.pickupAddress}, ${booking.pickupPostalCode} ${booking.pickupCity}

Gesamtpreis: ${parseFloat(booking.totalPrice.toString()).toFixed(2)} €

Bei Fragen kontaktieren Sie uns unter:
support@b2c-autowartung.de

B2C Autowartung - Ihr zuverlässiger Partner für Fahrzeugwartung
  `.trim();
}

/**
 * Generate HTML content for magic link email
 */
function generateMagicLinkEmailHTML(email: string, magicLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ihr Login-Link</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Willkommen bei B2C Autowartung!</h1>

    <p>Hallo,</p>

    <p>Wir haben eine Anfrage erhalten, sich in Ihr Konto einzuloggen. Klicken Sie auf den Button unten, um auf Ihr Konto zuzugreifen:</p>

    <div style="text-align: center;">
      <a href="${magicLink}" class="button">In Ihr Konto einloggen</a>
    </div>

    <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
    <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
      ${magicLink}
    </p>

    <div class="warning">
      <strong>⚠️ Sicherheitshinweis:</strong>
      <ul>
        <li>Dieser Link läuft in 15 Minuten ab</li>
        <li>Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren</li>
        <li>Teilen Sie diesen Link niemals mit anderen</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <p>Diese E-Mail wurde an ${email} gesendet</p>
    <p>B2C Autowartung - Ihr zuverlässiger Partner für Fahrzeugwartung</p>
    <p>Bei Fragen kontaktieren Sie unser Support-Team.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text content for magic link email
 */
function generateMagicLinkEmailText(email: string, magicLink: string): string {
  return `
Willkommen bei B2C Autowartung!

Hallo,

Wir haben eine Anfrage erhalten, sich in Ihr Konto einzuloggen. Klicken Sie auf den Link unten, um auf Ihr Konto zuzugreifen:

${magicLink}

SICHERHEITSHINWEIS:
- Dieser Link läuft in 15 Minuten ab
- Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren
- Teilen Sie diesen Link niemals mit anderen

Diese E-Mail wurde an ${email} gesendet

B2C Autowartung - Ihr zuverlässiger Partner für Fahrzeugwartung
Bei Fragen kontaktieren Sie unser Support-Team.
  `.trim();
}
