/**
 * Email Service Test Script
 *
 * This script allows you to test email templates and providers
 * without going through the full application flow.
 *
 * Usage:
 *   tsx src/scripts/test-emails.ts [template-name]
 *
 * Examples:
 *   tsx src/scripts/test-emails.ts all
 *   tsx src/scripts/test-emails.ts booking-confirmation
 *   tsx src/scripts/test-emails.ts payment-receipt
 *   tsx src/scripts/test-emails.ts extension-request
 *   tsx src/scripts/test-emails.ts status-update
 *   tsx src/scripts/test-emails.ts magic-link
 */

import {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendExtensionRequest,
  sendStatusUpdate,
  sendMagicLinkEmail
} from '../services/email.service';
import { BookingStatus, ServiceType, UserRole } from '@prisma/client';

// Mock data for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  passwordHash: null,
  role: UserRole.CUSTOMER,
  firstName: 'Max',
  lastName: 'Mustermann',
  phone: '+49 123 456789',
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockJockey = {
  id: 'test-jockey-id',
  email: 'jockey@example.com',
  username: 'testjockey',
  passwordHash: null,
  role: UserRole.JOCKEY,
  firstName: 'Tom',
  lastName: 'Jockey',
  phone: '+49 987 654321',
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockVehicle = {
  id: 'test-vehicle-id',
  customerId: 'test-user-id',
  brand: 'VW',
  model: 'Golf 7',
  year: 2018,
  mileage: 75000,
  licensePlate: 'B-TT 1234',
  vin: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockBooking = {
  id: 'test-booking-id',
  bookingNumber: 'BKG-2024-001',
  customerId: 'test-user-id',
  customer: mockUser,
  vehicleId: 'test-vehicle-id',
  vehicle: mockVehicle,
  serviceType: ServiceType.INSPECTION,
  mileageAtBooking: 75000,
  status: BookingStatus.CONFIRMED,
  totalPrice: 299.99,
  priceBreakdown: {
    basePrice: 250.00,
    ageMultiplier: 1.2,
    finalPrice: 299.99,
    priceSource: 'hardcoded',
    mileageInterval: '60000-80000',
    vehicle: {
      brand: 'VW',
      model: 'Golf 7',
      year: 2018,
      mileage: 75000
    },
    serviceType: 'INSPECTION'
  },
  pickupDate: new Date('2024-02-15'),
  pickupTimeSlot: '10:00-12:00',
  deliveryDate: null,
  deliveryTimeSlot: null,
  pickupAddress: 'Musterstraße 123',
  pickupCity: 'Berlin',
  pickupPostalCode: '10115',
  jockeyId: null,
  jockey: null,
  paymentIntentId: null,
  paidAt: new Date(),
  customerNotes: 'Bitte vor 12 Uhr abholen',
  internalNotes: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Test booking confirmation email
 */
async function testBookingConfirmation() {
  console.log('\n📧 Testing: Booking Confirmation Email...\n');

  const testBooking = {
    ...mockBooking,
    status: BookingStatus.PENDING_PAYMENT,
    paidAt: null
  };

  await sendBookingConfirmation(testBooking as any);
  console.log('✅ Booking confirmation email sent successfully\n');
}

/**
 * Test payment receipt email
 */
async function testPaymentReceipt() {
  console.log('\n📧 Testing: Payment Receipt Email...\n');

  const testBooking = {
    ...mockBooking,
    status: BookingStatus.CONFIRMED,
    paidAt: new Date()
  };

  const payment = {
    paymentIntentId: 'pi_test_12345',
    amount: 299.99,
    paymentMethod: 'Kreditkarte (Visa **** 4242)',
    paidAt: new Date()
  };

  await sendPaymentReceipt(testBooking as any, payment);
  console.log('✅ Payment receipt email sent successfully\n');
}

/**
 * Test extension request email
 */
async function testExtensionRequest() {
  console.log('\n📧 Testing: Extension Request Email...\n');

  const testBooking = {
    ...mockBooking,
    status: BookingStatus.CONFIRMED
  };

  const extension = {
    newPickupDate: new Date('2024-02-20'),
    newPickupTimeSlot: '14:00-16:00',
    reason: 'Aufgrund eines unerwarteten Werkstatt-Engpasses müssen wir Ihren Termin leider verschieben. Wir entschuldigen uns für die Unannehmlichkeiten.',
    estimatedDelivery: new Date('2024-02-21'),
    confirmationUrl: 'https://app.b2c-autowartung.de/bookings/test-booking-id/confirm-extension',
    declineUrl: 'https://app.b2c-autowartung.de/bookings/test-booking-id/decline-extension'
  };

  await sendExtensionRequest(testBooking as any, extension);
  console.log('✅ Extension request email sent successfully\n');
}

/**
 * Test status update emails for all statuses
 */
async function testStatusUpdate(specificStatus?: BookingStatus) {
  const statuses = specificStatus
    ? [specificStatus]
    : [
        BookingStatus.CONFIRMED,
        BookingStatus.JOCKEY_ASSIGNED,
        BookingStatus.IN_TRANSIT_TO_WORKSHOP,
        BookingStatus.IN_WORKSHOP,
        BookingStatus.COMPLETED,
        BookingStatus.IN_TRANSIT_TO_CUSTOMER,
        BookingStatus.DELIVERED
      ];

  for (const status of statuses) {
    console.log(`\n📧 Testing: Status Update Email (${status})...\n`);

    const testBooking = {
      ...mockBooking,
      status: status,
      jockey: status === BookingStatus.JOCKEY_ASSIGNED ||
              status === BookingStatus.IN_TRANSIT_TO_WORKSHOP ||
              status === BookingStatus.IN_WORKSHOP ||
              status === BookingStatus.COMPLETED ||
              status === BookingStatus.IN_TRANSIT_TO_CUSTOMER ||
              status === BookingStatus.DELIVERED
        ? mockJockey
        : null,
      jockeyId: status === BookingStatus.JOCKEY_ASSIGNED ? mockJockey.id : null,
      deliveryDate: status === BookingStatus.DELIVERED ? new Date('2024-02-16') : null
    };

    const additionalNotes = status === BookingStatus.IN_WORKSHOP
      ? 'Der Service läuft planmäßig. Keine zusätzlichen Arbeiten erforderlich.'
      : undefined;

    await sendStatusUpdate(testBooking as any, status, additionalNotes);
    console.log(`✅ Status update email (${status}) sent successfully\n`);

    // Wait a bit between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Test magic link email
 */
async function testMagicLink() {
  console.log('\n📧 Testing: Magic Link Email...\n');

  const magicLink = 'https://app.b2c-autowartung.de/auth/verify?token=test_token_12345&email=test@example.com';

  await sendMagicLinkEmail('test@example.com', magicLink);
  console.log('✅ Magic link email sent successfully\n');
}

/**
 * Main test runner
 */
async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  console.log('================================================================================');
  console.log('Email Service Test Script');
  console.log('================================================================================');
  console.log(`Provider: ${process.env.EMAIL_PROVIDER || 'console'}`);
  console.log(`From: ${process.env.EMAIL_FROM || 'B2C Autowartung <noreply@b2c-autowartung.de>'}`);
  console.log('================================================================================\n');

  try {
    switch (testType) {
      case 'booking-confirmation':
        await testBookingConfirmation();
        break;

      case 'payment-receipt':
        await testPaymentReceipt();
        break;

      case 'extension-request':
        await testExtensionRequest();
        break;

      case 'status-update':
        await testStatusUpdate();
        break;

      case 'magic-link':
        await testMagicLink();
        break;

      case 'all':
        await testBookingConfirmation();
        await testPaymentReceipt();
        await testExtensionRequest();
        await testStatusUpdate();
        await testMagicLink();
        break;

      default:
        console.error(`Unknown test type: ${testType}`);
        console.log('\nAvailable test types:');
        console.log('  - all (default)');
        console.log('  - booking-confirmation');
        console.log('  - payment-receipt');
        console.log('  - extension-request');
        console.log('  - status-update');
        console.log('  - magic-link');
        process.exit(1);
    }

    console.log('================================================================================');
    console.log('✅ All tests completed successfully!');
    console.log('================================================================================\n');

    if (process.env.EMAIL_PROVIDER === 'console') {
      console.log('💡 Tip: Check the console output above to see the email previews.\n');
    } else if (process.env.EMAIL_PROVIDER === 'smtp') {
      console.log('💡 Tip: Check your Mailtrap inbox to see the emails.\n');
    } else if (process.env.EMAIL_PROVIDER === 'resend') {
      console.log('💡 Tip: Check your Resend dashboard to see sent emails.\n');
    }
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
