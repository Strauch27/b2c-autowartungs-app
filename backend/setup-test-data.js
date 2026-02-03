#!/usr/bin/env node

/**
 * Setup Test Data for E2E Testing
 * Creates all necessary test users and sample data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupTestData() {
  console.log('🔧 Setting up test data for E2E testing...\n');

  try {
    // 1. Create Workshop User
    console.log('👷 Creating workshop user...');
    const workshopPassword = await bcrypt.hash('werkstatt123', 10);
    const workshop = await prisma.user.upsert({
      where: { email: 'werkstatt@ronja.de' },
      update: {},
      create: {
        email: 'werkstatt@ronja.de',
        username: 'werkstatt-witten',
        firstName: 'Werkstatt',
        lastName: 'Witten',
        phone: '+49 234 567890',
        passwordHash: workshopPassword,
        role: 'WORKSHOP',
        isActive: true,
      }
    });
    console.log('✅ Workshop user created:', workshop.email);

    // 2. Create Jockey User
    console.log('\n🚗 Creating jockey user...');
    const jockeyPassword = await bcrypt.hash('jockey123', 10);
    const jockey = await prisma.user.upsert({
      where: { email: 'jockey@ronja.de' },
      update: {},
      create: {
        email: 'jockey@ronja.de',
        username: 'jockey-1',
        firstName: 'Hans',
        lastName: 'Müller',
        phone: '+49 234 567891',
        passwordHash: jockeyPassword,
        role: 'JOCKEY',
        isActive: true,
      }
    });
    console.log('✅ Jockey user created:', jockey.email);

    // 3. Create Customer User
    console.log('\n👤 Creating customer user...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+49 123 456789',
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        isActive: true,
      }
    });
    console.log('✅ Customer user created:', customer.email);

    // 4. Create Sample Vehicle
    console.log('\n🚙 Creating sample vehicle...');
    const vehicle = await prisma.vehicle.upsert({
      where: { id: 'test-vehicle-1' },
      update: {},
      create: {
        id: 'test-vehicle-1',
        customerId: customer.id,
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2020,
        mileage: 45000,
        licensePlate: 'DO-TE-123',
      }
    });
    console.log('✅ Sample vehicle created:', vehicle.licensePlate);

    // 5. Create Sample Booking
    console.log('\n📋 Creating sample booking...');
    const pickupDate = new Date('2026-02-20');

    // Generate booking number
    const bookingCount = await prisma.booking.count();
    const bookingNumber = `BK${new Date().getFullYear().toString().slice(-2)}${String(bookingCount + 1).padStart(6, '0')}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceType: 'INSPECTION',
        services: [
          { type: 'INSPECTION', price: 250 },
          { type: 'OIL_SERVICE', price: 180 }
        ],
        mileageAtBooking: 45000,
        totalPrice: 43000, // 430 EUR in cents
        priceBreakdown: {
          services: [
            { type: 'INSPECTION', price: 250 },
            { type: 'OIL_SERVICE', price: 180 }
          ],
          totalPrice: 430
        },
        status: 'IN_WORKSHOP', // Set to IN_WORKSHOP so extension tests work
        pickupDate,
        pickupTimeSlot: '10:00',
        pickupAddress: 'Teststraße 123',
        pickupCity: 'Dortmund',
        pickupPostalCode: '44135',
        deliveryDate: pickupDate,
        deliveryTimeSlot: '18:00',
      }
    });
    console.log('✅ Sample booking created:', booking.bookingNumber);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test data setup complete!\n');
    console.log('📋 Test Users Created:');
    console.log('');
    console.log('🔧 Workshop:');
    console.log('   Email:    werkstatt@ronja.de');
    console.log('   Username: werkstatt-witten');
    console.log('   Password: werkstatt123');
    console.log('   Login:    http://localhost:3000/de/workshop/login');
    console.log('');
    console.log('🚗 Jockey:');
    console.log('   Email:    jockey@ronja.de');
    console.log('   Username: jockey-1');
    console.log('   Password: jockey123');
    console.log('   Login:    http://localhost:3000/de/jockey/login');
    console.log('');
    console.log('👤 Customer:');
    console.log('   Email:    test@example.com');
    console.log('   Password: customer123');
    console.log('   Login:    http://localhost:3000/de/login');
    console.log('');
    console.log('📦 Sample Data:');
    console.log('   Booking:  ' + booking.bookingNumber + ' (IN_WORKSHOP)');
    console.log('   Vehicle:  VW Golf 2020 (' + vehicle.licensePlate + ')');
    console.log('');
    console.log('🧪 Ready for E2E testing!');
    console.log('   Run: npm run test:e2e');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
