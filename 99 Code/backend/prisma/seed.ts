import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // ============================================================================
  // 1. PRICE MATRIX - TOP 10 VEHICLE MODELS
  // ============================================================================
  console.log('\nCreating PriceMatrix entries...');
  const priceMatrixData = [
    {
      brand: 'VW',
      model: 'Golf 7',
      yearFrom: 2012,
      yearTo: 2019,
      serviceType: 'INSPECTION',
      basePrice: 219,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 229,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 259,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 199,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 289,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 269,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 309,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 299,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 319,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
      serviceType: 'INSPECTION',
      basePrice: 209,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
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
    skipDuplicates: true,
  });
  console.log(`✓ Created ${priceMatrixData.length} PriceMatrix entries`);

  // ============================================================================
  // 2. WORKSHOP USER + PROFILE
  // ============================================================================
  console.log('\nCreating workshop user and profile...');
  const workshopPasswordHash = await bcrypt.hash('password123', 10);
  const workshopUser = await prisma.user.create({
    data: {
      email: 'werkstatt@test.de',
      username: 'werkstatt1',
      passwordHash: workshopPasswordHash,
      role: 'WORKSHOP',
      firstName: 'Workshop',
      lastName: 'Manager',
      phone: '+49 2302 123456',
      isActive: true,
      workshopProfile: {
        create: {
          workshopName: 'Werkstatt Witten',
          address: 'Hauptstraße 1',
          city: 'Witten',
          postalCode: '58452',
          phone: '+49 2302 123456',
          capacity: 16,
        },
      },
    },
    include: {
      workshopProfile: true,
    },
  });
  console.log(`✓ Workshop user created: ${workshopUser.email} (Username: ${workshopUser.username})`);

  // ============================================================================
  // 3. JOCKEY USER + PROFILE
  // ============================================================================
  console.log('\nCreating jockey user and profile...');
  const jockeyPasswordHash = await bcrypt.hash('password123', 10);
  const jockeyUser = await prisma.user.create({
    data: {
      email: 'jockey@test.de',
      username: 'jockey1',
      passwordHash: jockeyPasswordHash,
      role: 'JOCKEY',
      firstName: 'Hans',
      lastName: 'Fahrer',
      phone: '+49170234567',
      isActive: true,
      jockeyProfile: {
        create: {
          licenseNumber: 'DL123456',
          vehicleType: 'VW Golf',
          isAvailable: true,
          rating: 5.0,
        },
      },
    },
    include: {
      jockeyProfile: true,
    },
  });
  console.log(`✓ Jockey user created: ${jockeyUser.email} (Username: ${jockeyUser.username})`);

  // ============================================================================
  // 4. TEST CUSTOMER USER + PROFILE
  // ============================================================================
  console.log('\nCreating test customer user and profile...');
  const customerPasswordHash = await bcrypt.hash('password123', 10);
  const customerUser = await prisma.user.create({
    data: {
      email: 'kunde@test.de',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49170123456',
      isActive: true,
      customerProfile: {
        create: {
          street: 'Musterstraße 42',
          city: 'Witten',
          postalCode: '58452',
          stripeCustomerId: 'cus_test_12345',
          preferredContactMethod: 'EMAIL',
        },
      },
    },
    include: {
      customerProfile: true,
    },
  });
  console.log(`✓ Customer user created: ${customerUser.email}`);

  // ============================================================================
  // 5. TEST VEHICLE
  // ============================================================================
  console.log('\nCreating test vehicle...');
  const testVehicle = await prisma.vehicle.create({
    data: {
      customerId: customerUser.id,
      brand: 'VW',
      model: 'Golf 7',
      year: 2016,
      mileage: 75000,
      licensePlate: 'EN-MW-1234',
    },
  });
  console.log(`✓ Test vehicle created: ${testVehicle.brand} ${testVehicle.model} (ID: ${testVehicle.id})`);

  // ============================================================================
  // 6. TIME SLOTS FOR NEXT 7 DAYS
  // ============================================================================
  console.log('\nCreating time slots for next 7 days...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeSlots = [
    '08:00-10:00',
    '10:00-12:00',
    '13:00-15:00',
    '15:00-17:00',
  ];

  let slotsCreated = 0;
  for (let day = 0; day < 7; day++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + day);

    // Skip Sundays (day 0)
    if (slotDate.getDay() === 0) continue;

    for (const timeSlot of timeSlots) {
      await prisma.timeSlot.create({
        data: {
          workshopUserId: workshopUser.workshopProfile!.id,
          date: slotDate,
          timeSlot: timeSlot,
          isAvailable: true,
          maxCapacity: 4,
          currentBookings: 0,
        },
      });
      slotsCreated++;
    }
  }
  console.log(`✓ Created ${slotsCreated} time slots`);

  console.log('\n========================================');
  console.log('✓ Seeding completed successfully!');
  console.log('========================================');
  console.log('\nSummary:');
  console.log(`- Workshop user: ${workshopUser.email} (username: ${workshopUser.username}, password: password123)`);
  console.log(`- Jockey user: ${jockeyUser.email} (username: ${jockeyUser.username}, password: password123)`);
  console.log(`- Customer user: ${customerUser.email} (password: password123)`);
  console.log(`- Test vehicle: ${testVehicle.brand} ${testVehicle.model}`);
  console.log(`- PriceMatrix entries: ${priceMatrixData.length}`);
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
