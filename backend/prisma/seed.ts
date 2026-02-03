import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // ============================================================================
  // 1. WORKSHOP WITTEN
  // ============================================================================
  console.log('Creating Workshop Witten...');
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Werkstatt Witten',
      street: 'Hauptstraße 1',
      zip: '58452',
      city: 'Witten',
      phone: '+49 2302 123456',
      email: 'info@werkstatt-witten.de',
      openingHours: {
        monday: '8-18',
        tuesday: '8-18',
        wednesday: '8-18',
        thursday: '8-18',
        friday: '8-18',
        saturday: '8-14',
        sunday: 'closed',
      },
      maxDailySlots: 16,
      status: 'ACTIVE',
    },
  });
  console.log(`✓ Workshop created: ${workshop.name} (ID: ${workshop.id})`);

  // ============================================================================
  // 2. PRICE MATRIX - TOP 10 VEHICLE MODELS
  // ============================================================================
  console.log('\nCreating PriceMatrix entries...');
  const priceMatrixData = [
    {
      brand: 'VW',
      model: 'Golf 7',
      yearFrom: 2012,
      yearTo: 2019,
      inspection30k: 189,
      inspection60k: 219,
      inspection90k: 289,
      inspection120k: 329,
      oilService: 159,
      brakeServiceFront: 349,
      brakeServiceRear: 299,
      tuv: 89,
      climateService: 129,
    },
    {
      brand: 'VW',
      model: 'Golf 8',
      yearFrom: 2019,
      yearTo: 2026,
      inspection30k: 199,
      inspection60k: 229,
      inspection90k: 299,
      inspection120k: 339,
      oilService: 169,
      brakeServiceFront: 359,
      brakeServiceRear: 309,
      tuv: 89,
      climateService: 129,
    },
    {
      brand: 'VW',
      model: 'Passat B8',
      yearFrom: 2014,
      yearTo: 2023,
      inspection30k: 219,
      inspection60k: 259,
      inspection90k: 329,
      inspection120k: 369,
      oilService: 179,
      brakeServiceFront: 399,
      brakeServiceRear: 349,
      tuv: 89,
      climateService: 139,
    },
    {
      brand: 'VW',
      model: 'Polo',
      yearFrom: 2017,
      yearTo: 2026,
      inspection30k: 169,
      inspection60k: 199,
      inspection90k: 259,
      inspection120k: 299,
      oilService: 149,
      brakeServiceFront: 319,
      brakeServiceRear: 279,
      tuv: 89,
      climateService: 119,
    },
    {
      brand: 'Audi',
      model: 'A4 B9',
      yearFrom: 2015,
      yearTo: 2023,
      inspection30k: 249,
      inspection60k: 289,
      inspection90k: 359,
      inspection120k: 399,
      oilService: 199,
      brakeServiceFront: 449,
      brakeServiceRear: 399,
      tuv: 89,
      climateService: 149,
    },
    {
      brand: 'Audi',
      model: 'A3 8V',
      yearFrom: 2012,
      yearTo: 2020,
      inspection30k: 229,
      inspection60k: 269,
      inspection90k: 339,
      inspection120k: 379,
      oilService: 189,
      brakeServiceFront: 429,
      brakeServiceRear: 379,
      tuv: 89,
      climateService: 139,
    },
    {
      brand: 'BMW',
      model: '3er G20',
      yearFrom: 2019,
      yearTo: 2026,
      inspection30k: 269,
      inspection60k: 309,
      inspection90k: 379,
      inspection120k: 419,
      oilService: 219,
      brakeServiceFront: 479,
      brakeServiceRear: 429,
      tuv: 89,
      climateService: 159,
    },
    {
      brand: 'BMW',
      model: '3er F30',
      yearFrom: 2012,
      yearTo: 2019,
      inspection30k: 259,
      inspection60k: 299,
      inspection90k: 369,
      inspection120k: 409,
      oilService: 209,
      brakeServiceFront: 469,
      brakeServiceRear: 419,
      tuv: 89,
      climateService: 149,
    },
    {
      brand: 'Mercedes',
      model: 'C-Klasse W205',
      yearFrom: 2014,
      yearTo: 2021,
      inspection30k: 279,
      inspection60k: 319,
      inspection90k: 389,
      inspection120k: 429,
      oilService: 229,
      brakeServiceFront: 499,
      brakeServiceRear: 449,
      tuv: 89,
      climateService: 159,
    },
    {
      brand: 'Opel',
      model: 'Astra K',
      yearFrom: 2015,
      yearTo: 2026,
      inspection30k: 179,
      inspection60k: 209,
      inspection90k: 279,
      inspection120k: 319,
      oilService: 159,
      brakeServiceFront: 339,
      brakeServiceRear: 289,
      tuv: 89,
      climateService: 119,
    },
  ];

  await prisma.priceMatrix.createMany({
    data: priceMatrixData,
  });
  console.log(`✓ Created ${priceMatrixData.length} PriceMatrix entries`);

  // ============================================================================
  // 3. TEST CUSTOMER
  // ============================================================================
  console.log('\nCreating test customer...');
  const testCustomer = await prisma.customer.create({
    data: {
      email: 'kunde@test.de',
      name: 'Max Mustermann',
      phone: '+49170123456',
      street: 'Musterstraße 42',
      zip: '58452',
      city: 'Witten',
      stripeCustomerId: 'cus_test_12345',
    },
  });
  console.log(`✓ Test customer created: ${testCustomer.email} (ID: ${testCustomer.id})`);

  // ============================================================================
  // 4. TEST VEHICLE
  // ============================================================================
  console.log('\nCreating test vehicle...');
  const testVehicle = await prisma.vehicle.create({
    data: {
      customerId: testCustomer.id,
      brand: 'VW',
      model: 'Golf 7',
      year: 2016,
      mileage: 75000,
      licensePlate: 'EN-MW-1234',
    },
  });
  console.log(`✓ Test vehicle created: ${testVehicle.brand} ${testVehicle.model} (ID: ${testVehicle.id})`);

  // ============================================================================
  // 5. TEST JOCKEY
  // ============================================================================
  console.log('\nCreating test jockey...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const testJockey = await prisma.jockey.create({
    data: {
      username: 'jockey1',
      passwordHash: passwordHash,
      name: 'Hans Fahrer',
      phone: '+49170234567',
      workshopId: workshop.id,
      status: 'AVAILABLE',
    },
  });
  console.log(`✓ Test jockey created: ${testJockey.name} (Username: ${testJockey.username})`);

  // ============================================================================
  // 6. TEST WORKSHOP USER
  // ============================================================================
  console.log('\nCreating test workshop user...');
  const workshopPasswordHash = await bcrypt.hash('password123', 10);
  const workshopUser = await prisma.user.create({
    data: {
      email: 'werkstatt@test.de',
      username: 'werkstatt1',
      passwordHash: workshopPasswordHash,
      role: 'WORKSHOP',
      firstName: 'Workshop',
      lastName: 'Manager',
      phone: '+49170345678',
      isActive: true,
      workshopProfile: {
        create: {
          workshopId: workshop.id,
        },
      },
    },
  });
  console.log(`✓ Test workshop user created: ${workshopUser.email} (Username: ${workshopUser.username})`);

  // ============================================================================
  // 7. REPLACEMENT CARS
  // ============================================================================
  console.log('\nCreating replacement cars...');
  const replacementCars = [
    {
      brand: 'VW',
      model: 'Polo',
      licensePlate: 'EN-MW-9001',
      status: 'AVAILABLE' as const,
    },
    {
      brand: 'VW',
      model: 'Golf',
      licensePlate: 'EN-MW-9002',
      status: 'AVAILABLE' as const,
    },
    {
      brand: 'Opel',
      model: 'Corsa',
      licensePlate: 'EN-MW-9003',
      status: 'AVAILABLE' as const,
    },
  ];

  await prisma.replacementCar.createMany({
    data: replacementCars,
  });
  console.log(`✓ Created ${replacementCars.length} replacement cars`);

  // ============================================================================
  // 8. TIME SLOTS FOR NEXT 7 DAYS
  // ============================================================================
  console.log('\nCreating time slots for next 7 days...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeSlots = [
    { start: 8, end: 10 },
    { start: 10, end: 12 },
    { start: 13, end: 15 },
    { start: 15, end: 17 },
  ];

  let slotsCreated = 0;
  for (let day = 0; day < 7; day++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + day);

    // Skip Sundays (day 0)
    if (slotDate.getDay() === 0) continue;

    for (const timeSlot of timeSlots) {
      const timeStart = new Date(slotDate);
      timeStart.setHours(timeSlot.start, 0, 0, 0);

      const timeEnd = new Date(slotDate);
      timeEnd.setHours(timeSlot.end, 0, 0, 0);

      await prisma.slot.create({
        data: {
          workshopId: workshop.id,
          date: slotDate,
          timeStart: timeStart,
          timeEnd: timeEnd,
          maxCapacity: 4,
          currentBookings: 0,
          available: true,
        },
      });
      slotsCreated++;
    }
  }
  console.log(`✓ Created ${slotsCreated} time slots`);

  // ============================================================================
  // 8. TEST BOOKING (Optional - uncomment if needed)
  // ============================================================================
  /*
  console.log('\nCreating test booking...');
  const firstSlot = await prisma.slot.findFirst({
    where: { workshopId: workshop.id },
    orderBy: { timeStart: 'asc' },
  });

  if (firstSlot) {
    const testBooking = await prisma.booking.create({
      data: {
        customerId: testCustomer.id,
        vehicleId: testVehicle.id,
        workshopId: workshop.id,
        serviceType: 'INSPECTION',
        mileageAtBooking: 75000,
        price: 219,
        status: 'CONFIRMED',
        pickupSlotStart: firstSlot.timeStart,
        pickupSlotEnd: firstSlot.timeEnd,
        pickupAddress: {
          street: 'Musterstraße 42',
          zip: '58452',
          city: 'Witten',
        },
        stripePaymentId: 'pi_test_12345',
      },
    });
    console.log(`✓ Test booking created: ${testBooking.bookingNumber}`);
  }
  */

  console.log('\n========================================');
  console.log('✓ Seeding completed successfully!');
  console.log('========================================');
  console.log('\nSummary:');
  console.log(`- Workshop: ${workshop.name}`);
  console.log(`- PriceMatrix entries: ${priceMatrixData.length}`);
  console.log(`- Test customer: ${testCustomer.email}`);
  console.log(`- Test vehicle: ${testVehicle.brand} ${testVehicle.model}`);
  console.log(`- Test jockey: ${testJockey.username} (password: password123)`);
  console.log(`- Test workshop user: ${workshopUser.username} (password: password123)`);
  console.log(`- Replacement cars: ${replacementCars.length}`);
  console.log(`- Time slots: ${slotsCreated}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
