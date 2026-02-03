/**
 * Seed Bookings and Extensions for E2E Tests
 *
 * Creates test data for:
 * - Workshop dashboard bookings
 * - Extensions with various statuses
 * - Jockey assignments
 * - Multiple booking statuses for testing
 */

import { PrismaClient, ServiceType, BookingStatus, ExtensionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚗 Seeding bookings and extensions for E2E tests...');

  // Get test users
  const customer = await prisma.user.findUnique({
    where: { email: 'kunde@test.de' },
  });

  const workshop = await prisma.user.findUnique({
    where: { email: 'werkstatt@test.de' },
  });

  const jockey = await prisma.user.findUnique({
    where: { email: 'jockey@test.de' },
  });

  if (!customer || !workshop || !jockey) {
    throw new Error('Test users not found. Please run seed-users.ts first.');
  }

  console.log(`✅ Found test users: customer=${customer.id}, workshop=${workshop.id}, jockey=${jockey.id}`);

  // ============================================================================
  // Create Test Vehicles
  // ============================================================================

  console.log('Creating test vehicles...');

  const vehicle1 = await prisma.vehicle.upsert({
    where: { id: 'test-vehicle-bmw-1' },
    update: {},
    create: {
      id: 'test-vehicle-bmw-1',
      customerId: customer.id,
      brand: 'BMW',
      model: '3er',
      year: 2020,
      mileage: 50000,
      licensePlate: 'WIT-BM-123',
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { id: 'test-vehicle-vw-1' },
    update: {},
    create: {
      id: 'test-vehicle-vw-1',
      customerId: customer.id,
      brand: 'VW',
      model: 'Golf',
      year: 2019,
      mileage: 60000,
      licensePlate: 'WIT-VW-456',
    },
  });

  const vehicle3 = await prisma.vehicle.upsert({
    where: { id: 'test-vehicle-mercedes-1' },
    update: {},
    create: {
      id: 'test-vehicle-mercedes-1',
      customerId: customer.id,
      brand: 'Mercedes-Benz',
      model: 'C-Klasse',
      year: 2021,
      mileage: 30000,
      licensePlate: 'WIT-MB-789',
    },
  });

  console.log(`✅ Created ${3} test vehicles`);

  // ============================================================================
  // Create Test Bookings with Various Statuses
  // ============================================================================

  console.log('Creating test bookings...');

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Booking 1: CONFIRMED - ready for jockey assignment
  const booking1 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-001' },
    update: {},
    create: {
      bookingNumber: 'TEST-001',
      customerId: customer.id,
      vehicleId: vehicle1.id,
      serviceType: ServiceType.INSPECTION,
      services: [
        { type: 'INSPECTION', price: 149.00 },
      ],
      mileageAtBooking: 50000,
      status: BookingStatus.CONFIRMED,
      totalPrice: 149.00,
      pickupDate: tomorrow,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: tomorrow,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Musterstraße 42',
      pickupCity: 'Witten',
      pickupPostalCode: '58452',
      customerNotes: 'Bitte pünktlich um 9 Uhr abholen',
      paidAt: now,
    },
  });

  // Booking 2: JOCKEY_ASSIGNED - jockey assigned, ready for pickup
  const booking2 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-002' },
    update: {},
    create: {
      bookingNumber: 'TEST-002',
      customerId: customer.id,
      vehicleId: vehicle2.id,
      serviceType: ServiceType.OIL_SERVICE,
      services: [
        { type: 'OIL_SERVICE', price: 89.00 },
      ],
      mileageAtBooking: 60000,
      status: BookingStatus.JOCKEY_ASSIGNED,
      totalPrice: 89.00,
      pickupDate: tomorrow,
      pickupTimeSlot: '14:00-16:00',
      deliveryDate: tomorrow,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Testweg 10',
      pickupCity: 'Witten',
      pickupPostalCode: '58452',
      jockeyId: jockey.id,
      paidAt: now,
    },
  });

  // Booking 3: IN_WORKSHOP - currently being serviced
  const booking3 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-003' },
    update: {},
    create: {
      bookingNumber: 'TEST-003',
      customerId: customer.id,
      vehicleId: vehicle3.id,
      serviceType: ServiceType.BRAKE_SERVICE,
      services: [
        { type: 'BRAKE_SERVICE', price: 199.00 },
      ],
      mileageAtBooking: 30000,
      status: BookingStatus.IN_WORKSHOP,
      totalPrice: 199.00,
      pickupDate: yesterday,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: now,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Beispielstraße 5',
      pickupCity: 'Witten',
      pickupPostalCode: '58453',
      jockeyId: jockey.id,
      customerNotes: 'Bremsgeräusche beim Fahren',
      paidAt: yesterday,
    },
  });

  // Booking 4: COMPLETED - service done, waiting for delivery
  const booking4 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-004' },
    update: {},
    create: {
      bookingNumber: 'TEST-004',
      customerId: customer.id,
      vehicleId: vehicle1.id,
      serviceType: ServiceType.CLIMATE_SERVICE,
      services: [
        { type: 'CLIMATE_SERVICE', price: 119.00 },
      ],
      mileageAtBooking: 50500,
      status: BookingStatus.COMPLETED,
      totalPrice: 119.00,
      pickupDate: yesterday,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: now,
      deliveryTimeSlot: '14:00-16:00',
      pickupAddress: 'Musterstraße 42',
      pickupCity: 'Witten',
      pickupPostalCode: '58452',
      jockeyId: jockey.id,
      paidAt: yesterday,
    },
  });

  // Booking 5: IN_TRANSIT_TO_CUSTOMER - being delivered
  const booking5 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-005' },
    update: {},
    create: {
      bookingNumber: 'TEST-005',
      customerId: customer.id,
      vehicleId: vehicle2.id,
      serviceType: ServiceType.TUV,
      services: [
        { type: 'TUV', price: 159.00 },
      ],
      mileageAtBooking: 60500,
      status: BookingStatus.IN_TRANSIT_TO_CUSTOMER,
      totalPrice: 159.00,
      pickupDate: yesterday,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: now,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Testweg 10',
      pickupCity: 'Witten',
      pickupPostalCode: '58452',
      jockeyId: jockey.id,
      paidAt: yesterday,
    },
  });

  // Booking 6: PENDING_PAYMENT - awaiting payment
  const booking6 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-006' },
    update: {},
    create: {
      bookingNumber: 'TEST-006',
      customerId: customer.id,
      vehicleId: vehicle3.id,
      serviceType: ServiceType.INSPECTION,
      services: [
        { type: 'INSPECTION', price: 149.00 },
        { type: 'OIL_SERVICE', price: 89.00 },
      ],
      mileageAtBooking: 30500,
      status: BookingStatus.PENDING_PAYMENT,
      totalPrice: 238.00,
      pickupDate: nextWeek,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: nextWeek,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Beispielstraße 5',
      pickupCity: 'Witten',
      pickupPostalCode: '58453',
      customerNotes: 'Kombi-Service gewünscht',
    },
  });

  // Booking 7: DELIVERED - completed and delivered
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const booking7 = await prisma.booking.upsert({
    where: { bookingNumber: 'TEST-007' },
    update: {},
    create: {
      bookingNumber: 'TEST-007',
      customerId: customer.id,
      vehicleId: vehicle1.id,
      serviceType: ServiceType.INSPECTION,
      services: [
        { type: 'INSPECTION', price: 149.00 },
      ],
      mileageAtBooking: 49500,
      status: BookingStatus.DELIVERED,
      totalPrice: 149.00,
      pickupDate: twoDaysAgo,
      pickupTimeSlot: '09:00-11:00',
      deliveryDate: yesterday,
      deliveryTimeSlot: '17:00-19:00',
      pickupAddress: 'Musterstraße 42',
      pickupCity: 'Witten',
      pickupPostalCode: '58452',
      jockeyId: jockey.id,
      paidAt: twoDaysAgo,
    },
  });

  console.log(`✅ Created ${7} test bookings`);

  // ============================================================================
  // Create Test Extensions
  // ============================================================================

  console.log('Creating test extensions...');

  // Extension 1: PENDING - needs approval from customer
  const extension1 = await prisma.extension.upsert({
    where: { id: 'test-ext-001' },
    update: {},
    create: {
      id: 'test-ext-001',
      bookingId: booking3.id,
      description: 'Die Bremsbeläge sind stark abgenutzt und sollten ersetzt werden. Die Bremsscheiben weisen ebenfalls Verschleißspuren auf.',
      items: [
        { name: 'Bremsbeläge vorne', price: 12000, quantity: 1 },
        { name: 'Bremsbeläge hinten', price: 8000, quantity: 1 },
        { name: 'Arbeitszeit', price: 15000, quantity: 1 },
      ],
      totalAmount: 35000, // 350 EUR in cents
      images: [
        '/uploads/extensions/brake-pads-front.jpg',
        '/uploads/extensions/brake-pads-rear.jpg',
      ],
      videos: [],
      status: ExtensionStatus.PENDING,
    },
  });

  // Extension 2: APPROVED - customer approved, ready for work
  const extension2 = await prisma.extension.upsert({
    where: { id: 'test-ext-002' },
    update: {},
    create: {
      id: 'test-ext-002',
      bookingId: booking4.id,
      description: 'Klimakompressor defekt. Muss ausgetauscht werden für volle Funktionalität.',
      items: [
        { name: 'Klimakompressor', price: 45000, quantity: 1 },
        { name: 'Kältemittel nachfüllen', price: 8000, quantity: 1 },
        { name: 'Arbeitszeit', price: 12000, quantity: 1 },
      ],
      totalAmount: 65000, // 650 EUR in cents
      images: [
        '/uploads/extensions/ac-compressor.jpg',
      ],
      videos: [],
      status: ExtensionStatus.APPROVED,
      approvedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      paidAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  // Extension 3: DECLINED - customer declined
  const extension3 = await prisma.extension.upsert({
    where: { id: 'test-ext-003' },
    update: {},
    create: {
      id: 'test-ext-003',
      bookingId: booking7.id,
      description: 'Luftfilter verschmutzt. Empfehlung: Austausch für bessere Motorleistung.',
      items: [
        { name: 'Luftfilter', price: 3500, quantity: 1 },
        { name: 'Arbeitszeit', price: 2500, quantity: 1 },
      ],
      totalAmount: 6000, // 60 EUR in cents
      images: [
        '/uploads/extensions/air-filter.jpg',
      ],
      videos: [],
      status: ExtensionStatus.DECLINED,
      declinedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      declineReason: 'Zu teuer, mache ich selbst',
    },
  });

  // Extension 4: PENDING - with video
  const extension4 = await prisma.extension.upsert({
    where: { id: 'test-ext-004' },
    update: {},
    create: {
      id: 'test-ext-004',
      bookingId: booking5.id,
      description: 'Auspuffanlage hat ein Loch. Siehe Video für Geräusch beim Beschleunigen.',
      items: [
        { name: 'Auspuffanlage Mittelteil', price: 28000, quantity: 1 },
        { name: 'Montage', price: 15000, quantity: 1 },
      ],
      totalAmount: 43000, // 430 EUR in cents
      images: [
        '/uploads/extensions/exhaust-hole.jpg',
      ],
      videos: [
        '/uploads/extensions/exhaust-sound.mp4',
      ],
      status: ExtensionStatus.PENDING,
    },
  });

  console.log(`✅ Created ${4} test extensions`);

  // ============================================================================
  // Summary
  // ============================================================================

  console.log('\n📊 Test Data Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Vehicles:       3');
  console.log('Bookings:       7');
  console.log('  - PENDING_PAYMENT:           1');
  console.log('  - CONFIRMED:                 1');
  console.log('  - JOCKEY_ASSIGNED:           1');
  console.log('  - IN_WORKSHOP:               1');
  console.log('  - COMPLETED:                 1');
  console.log('  - IN_TRANSIT_TO_CUSTOMER:    1');
  console.log('  - DELIVERED:                 1');
  console.log('Extensions:     4');
  console.log('  - PENDING:                   2');
  console.log('  - APPROVED:                  1');
  console.log('  - DECLINED:                  1');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n✅ Seeding complete! Workshop dashboard should now display bookings.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding bookings:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
