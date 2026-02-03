/**
 * Seed Complete E2E Test Data
 *
 * Creates a full test dataset including:
 * - Test users (customer, jockey, workshop)
 * - Bookings in various states
 * - Jockey assignments
 * - Extensions
 * - Vehicles
 *
 * Run with: npx tsx prisma/seed-e2e-data.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test Users
const TEST_USERS = [
  {
    email: 'customer@test.com',
    username: null,
    password: 'Test123!',
    role: 'CUSTOMER',
    firstName: 'Test',
    lastName: 'Customer',
    phone: '+49 123 456789'
  },
  {
    email: 'jockey@test.com',
    username: 'testjockey',
    password: 'Test123!',
    role: 'JOCKEY',
    firstName: 'Test',
    lastName: 'Jockey',
    phone: '+49 123 456790'
  },
  {
    email: 'workshop@test.com',
    username: 'testworkshop',
    password: 'Test123!',
    role: 'WORKSHOP',
    firstName: 'Test',
    lastName: 'Workshop',
    phone: '+49 123 456791'
  }
];

// Test Vehicles for Customer
const TEST_VEHICLES = [
  {
    make: 'BMW',
    model: '3er',
    year: 2020,
    licensePlate: 'DO-AB-123',
    vin: 'WBA3A5C50CF256789',
    vehicleClass: 'MIDSIZE'
  },
  {
    make: 'VW',
    model: 'Golf',
    year: 2019,
    licensePlate: 'DO-AB-456',
    vin: 'WVWZZZ1KZBW123456',
    vehicleClass: 'COMPACT'
  }
];

// Note: Ronja fleet vehicles are not yet in the schema
// Will be added in future iteration

async function seedUsers() {
  console.log('👥 Seeding test users...\n');

  const users: any = {};

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (user) {
        console.log(`  ℹ️  User already exists: ${userData.email} (${userData.role})`);
        users[userData.role.toLowerCase()] = user;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          passwordHash: hashedPassword,
          role: userData.role as any,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          isActive: true
        }
      });

      users[userData.role.toLowerCase()] = user;
      console.log(`  ✅ Created user: ${user.email} (${user.role}) - ID: ${user.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to create user ${userData.email}:`, error);
    }
  }

  return users;
}

async function seedVehicles(customerId: string) {
  console.log('\n🚗 Seeding customer vehicles...\n');

  const vehicles = [];

  for (const vehicleData of TEST_VEHICLES) {
    try {
      // Check if vehicle already exists (using findFirst since licensePlate is not unique)
      let vehicle = await prisma.vehicle.findFirst({
        where: {
          customerId,
          licensePlate: vehicleData.licensePlate
        }
      });

      if (vehicle) {
        console.log(`  ℹ️  Vehicle already exists: ${vehicleData.licensePlate}`);
        vehicles.push(vehicle);
        continue;
      }

      // Create vehicle
      vehicle = await prisma.vehicle.create({
        data: {
          customerId,
          brand: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          mileage: 50000, // Default mileage
          licensePlate: vehicleData.licensePlate,
          vin: vehicleData.vin
        }
      });

      vehicles.push(vehicle);
      console.log(`  ✅ Created vehicle: ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`);
    } catch (error) {
      console.error(`  ❌ Failed to create vehicle ${vehicleData.licensePlate}:`, error);
    }
  }

  return vehicles;
}

// Note: Ronja vehicle management not yet implemented in schema

async function seedBookings(customerId: string, vehicleId: string) {
  console.log('\n📅 Seeding test bookings...\n');

  const bookings = [];

  // Helper to create date offset
  const futureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(10, 0, 0, 0);
    return date;
  };

  const pastDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(10, 0, 0, 0);
    return date;
  };

  // Generate unique booking numbers
  const generateBookingNumber = () => {
    return `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const bookingData = [
    {
      bookingNumber: generateBookingNumber(),
      serviceType: 'OIL_SERVICE',
      status: 'PENDING_PAYMENT',
      pickupDate: futureDate(3),
      pickupTimeSlot: '09:00-11:00',
      pickupAddress: 'Teststraße 123',
      pickupPostalCode: '58453',
      pickupCity: 'Witten',
      mileageAtBooking: 50000,
      totalPrice: 270.00
    },
    {
      bookingNumber: generateBookingNumber(),
      serviceType: 'INSPECTION',
      status: 'CONFIRMED',
      pickupDate: futureDate(2),
      pickupTimeSlot: '10:00-12:00',
      pickupAddress: 'Musterweg 45',
      pickupPostalCode: '44135',
      pickupCity: 'Dortmund',
      mileageAtBooking: 50500,
      totalPrice: 199.00,
      paidAt: new Date()
    },
    {
      bookingNumber: generateBookingNumber(),
      serviceType: 'BRAKE_SERVICE',
      status: 'IN_WORKSHOP',
      pickupDate: futureDate(1),
      pickupTimeSlot: '14:00-16:00',
      pickupAddress: 'Beispielstraße 67',
      pickupPostalCode: '44789',
      pickupCity: 'Bochum',
      mileageAtBooking: 51000,
      totalPrice: 249.00,
      paidAt: pastDate(1)
    },
    {
      bookingNumber: generateBookingNumber(),
      serviceType: 'CLIMATE_SERVICE',
      status: 'COMPLETED',
      pickupDate: pastDate(5),
      pickupTimeSlot: '08:00-10:00',
      pickupAddress: 'Alte Straße 12',
      pickupPostalCode: '58455',
      pickupCity: 'Witten',
      mileageAtBooking: 49500,
      totalPrice: 169.00,
      paidAt: pastDate(6)
    }
  ];

  for (const data of bookingData) {
    try {
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          customerId,
          vehicleId,
          ...data
        }
      });

      bookings.push(booking);
      console.log(`  ✅ Created booking: ${booking.serviceType} (${booking.status}) - ${booking.bookingNumber}`);
    } catch (error) {
      console.error(`  ❌ Failed to create booking:`, error);
    }
  }

  return bookings;
}

async function seedJockeyAssignments(
  booking: any,
  jockeyId: string,
  customerName: string,
  vehicleBrand: string,
  vehicleModel: string,
  vehicleLicensePlate: string
) {
  console.log('\n🚗 Seeding jockey assignments...\n');

  try {
    // Pickup assignment
    const pickupAssignment = await prisma.jockeyAssignment.create({
      data: {
        bookingId: booking.id,
        jockeyId,
        type: 'PICKUP',
        scheduledTime: booking.pickupDate,
        status: 'ASSIGNED',
        customerName,
        customerPhone: '+49 123 456789',
        customerAddress: booking.pickupAddress,
        customerCity: booking.pickupCity,
        customerPostalCode: booking.pickupPostalCode,
        vehicleBrand,
        vehicleModel,
        vehicleLicensePlate
      }
    });

    console.log(`  ✅ Created pickup assignment for booking ${booking.bookingNumber}`);

    // Return assignment
    const returnAssignment = await prisma.jockeyAssignment.create({
      data: {
        bookingId: booking.id,
        jockeyId,
        type: 'RETURN',
        scheduledTime: booking.pickupDate,
        status: 'ASSIGNED',
        customerName,
        customerPhone: '+49 123 456789',
        customerAddress: booking.pickupAddress,
        customerCity: booking.pickupCity,
        customerPostalCode: booking.pickupPostalCode,
        vehicleBrand,
        vehicleModel,
        vehicleLicensePlate
      }
    });

    console.log(`  ✅ Created return assignment for booking ${booking.bookingNumber}`);

    return { pickupAssignment, returnAssignment };
  } catch (error) {
    console.error(`  ❌ Failed to create jockey assignments:`, error);
    return null;
  }
}

async function seedExtensions(bookingId: string) {
  console.log('\n🔧 Seeding extensions...\n');

  try {
    const extension = await prisma.extension.create({
      data: {
        bookingId,
        description: 'Bremsbeläge müssen ersetzt werden',
        items: [
          {
            name: 'Bremsbeläge vorne',
            description: 'Original Bremsbeläge',
            price: 15000,
            quantity: 1
          },
          {
            name: 'Bremsbeläge hinten',
            description: 'Original Bremsbeläge',
            price: 12000,
            quantity: 1
          },
          {
            name: 'Arbeitszeit',
            description: '2 Stunden',
            price: 8000,
            quantity: 1
          }
        ],
        totalAmount: 35000,
        images: [],
        videos: [],
        status: 'PENDING'
      }
    });

    console.log(`  ✅ Created extension for booking ${bookingId} - Amount: €${extension.totalAmount / 100}`);

    return extension;
  } catch (error) {
    console.error(`  ❌ Failed to create extension:`, error);
    return null;
  }
}

async function main() {
  console.log('🌱 Starting E2E test data seeding...\n');
  console.log('═'.repeat(60));

  try {
    // 1. Seed users
    const users = await seedUsers();

    if (!users.customer || !users.jockey || !users.workshop) {
      throw new Error('Failed to create required test users');
    }

    // 2. Seed customer vehicles
    const vehicles = await seedVehicles(users.customer.id);

    if (vehicles.length === 0) {
      throw new Error('Failed to create customer vehicles');
    }

    // 3. Seed bookings
    const bookings = await seedBookings(users.customer.id, vehicles[0].id);

    if (bookings.length === 0) {
      throw new Error('Failed to create bookings');
    }

    // 4. Seed jockey assignments for confirmed booking
    const confirmedBooking = bookings.find(b => b.status === 'CONFIRMED');
    if (confirmedBooking) {
      await seedJockeyAssignments(
        confirmedBooking,
        users.jockey.id,
        `${users.customer.firstName} ${users.customer.lastName}`,
        vehicles[0].brand,
        vehicles[0].model,
        vehicles[0].licensePlate || ''
      );
    }

    // 5. Seed extension for in-workshop booking
    const workshopBooking = bookings.find(b => b.status === 'IN_WORKSHOP');
    if (workshopBooking) {
      await seedExtensions(workshopBooking.id);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ E2E test data seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${Object.keys(users).length}`);
    console.log(`   - Customer Vehicles: ${vehicles.length}`);
    console.log(`   - Bookings: ${bookings.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Customer: customer@test.com / Test123!');
    console.log('   Jockey: jockey@test.com / Test123!');
    console.log('   Workshop: workshop@test.com / Test123!\n');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
