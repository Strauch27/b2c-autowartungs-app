import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // ============================================================================
  // 0. CLEAN UP - Delete all transactional data and extra users
  // ============================================================================
  console.log('\nCleaning up existing data...');

  // Delete in dependency order (children first)
  const deletedExtensions = await prisma.extension.deleteMany({});
  console.log(`  Deleted ${deletedExtensions.count} extensions`);

  const deletedAssignments = await prisma.jockeyAssignment.deleteMany({});
  console.log(`  Deleted ${deletedAssignments.count} jockey assignments`);

  const deletedNotifications = await prisma.notificationLog.deleteMany({});
  console.log(`  Deleted ${deletedNotifications.count} notifications`);

  const deletedBookings = await prisma.booking.deleteMany({});
  console.log(`  Deleted ${deletedBookings.count} bookings`);

  const deletedVehicles = await prisma.vehicle.deleteMany({});
  console.log(`  Deleted ${deletedVehicles.count} vehicles`);

  const deletedTimeSlots = await prisma.timeSlot.deleteMany({});
  console.log(`  Deleted ${deletedTimeSlots.count} time slots`);

  // Delete all users except jockey1 and workshop1
  const deletedCustomerProfiles = await prisma.customerProfile.deleteMany({});
  console.log(`  Deleted ${deletedCustomerProfiles.count} customer profiles`);

  // Delete extra jockey/workshop users (keep only our two)
  const deletedJockeyProfiles = await prisma.jockeyProfile.deleteMany({
    where: { user: { email: { not: 'jockey@test.de' } } },
  });
  console.log(`  Deleted ${deletedJockeyProfiles.count} extra jockey profiles`);

  const deletedWorkshopProfiles = await prisma.workshopProfile.deleteMany({
    where: { user: { email: { not: 'werkstatt@test.de' } } },
  });
  console.log(`  Deleted ${deletedWorkshopProfiles.count} extra workshop profiles`);

  // Delete all users that are not jockey1 or workshop1
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: { notIn: ['jockey@test.de', 'werkstatt@test.de'] },
    },
  });
  console.log(`  Deleted ${deletedUsers.count} extra users`);

  console.log('✓ Cleanup complete');

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
      brand: 'Audi',
      model: 'A6',
      yearFrom: 2018,
      yearTo: 2026,
      serviceType: 'INSPECTION',
      basePrice: 329,
      mileageMultiplier: 1.0,
      ageMultiplier: 1.0,
      inspection30k: 289,
      inspection60k: 329,
      inspection90k: 399,
      inspection120k: 449,
      oilService: 229,
      brakeServiceFront: 489,
      brakeServiceRear: 439,
      tuv: 89,
      climateService: 159,
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
  // 2. WORKSHOP USER + PROFILE (workshop1)
  // ============================================================================
  console.log('\nCreating/updating workshop user and profile...');
  const workshopPasswordHash = await bcrypt.hash('password123', 10);
  const workshopUser = await prisma.user.upsert({
    where: { email: 'werkstatt@test.de' },
    update: {
      username: 'workshop1',
      passwordHash: workshopPasswordHash,
      role: 'WORKSHOP',
      firstName: 'Workshop',
      lastName: 'Manager',
      phone: '+49 2302 123456',
      isActive: true,
    },
    create: {
      email: 'werkstatt@test.de',
      username: 'workshop1',
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
  // Ensure workshop profile exists (in case user existed but profile didn't)
  if (!workshopUser.workshopProfile) {
    await prisma.workshopProfile.create({
      data: {
        userId: workshopUser.id,
        workshopName: 'Werkstatt Witten',
        address: 'Hauptstraße 1',
        city: 'Witten',
        postalCode: '58452',
        phone: '+49 2302 123456',
        capacity: 16,
      },
    });
  }
  console.log(`✓ Workshop user: ${workshopUser.email} (Username: ${workshopUser.username})`);

  // ============================================================================
  // 3. JOCKEY USER + PROFILE (jockey1)
  // ============================================================================
  console.log('\nCreating/updating jockey user and profile...');
  const jockeyPasswordHash = await bcrypt.hash('password123', 10);
  const jockeyUser = await prisma.user.upsert({
    where: { email: 'jockey@test.de' },
    update: {
      username: 'jockey1',
      passwordHash: jockeyPasswordHash,
      role: 'JOCKEY',
      firstName: 'Hans',
      lastName: 'Fahrer',
      phone: '+49170234567',
      isActive: true,
    },
    create: {
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
  // Ensure jockey profile exists (in case user existed but profile didn't)
  if (!jockeyUser.jockeyProfile) {
    await prisma.jockeyProfile.create({
      data: {
        userId: jockeyUser.id,
        licenseNumber: 'DL123456',
        vehicleType: 'VW Golf',
        isAvailable: true,
        rating: 5.0,
      },
    });
  }
  console.log(`✓ Jockey user: ${jockeyUser.email} (Username: ${jockeyUser.username})`);

  // ============================================================================
  // 4. TIME SLOTS FOR NEXT 7 DAYS
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
      const workshopProfileId = workshopUser.workshopProfile?.id;
      if (!workshopProfileId) continue;
      await prisma.timeSlot.upsert({
        where: {
          workshopUserId_date_timeSlot: {
            workshopUserId: workshopProfileId,
            date: slotDate,
            timeSlot: timeSlot,
          },
        },
        update: {},
        create: {
          workshopUserId: workshopProfileId,
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
  console.log('- No customers, vehicles, or bookings seeded (clean slate for testing)');
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
