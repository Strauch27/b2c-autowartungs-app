import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');

  // 1. Create Customer User
  console.log('Creating customer user...');
  const customerUser = await prisma.user.upsert({
    where: { email: 'kunde@test.de' },
    update: {},
    create: {
      email: 'kunde@test.de',
      firstName: 'Test',
      lastName: 'Kunde',
      role: 'CUSTOMER',
    },
  });
  console.log(`✅ Customer created: ${customerUser.email}`);

  // 2. Create Customer Profile
  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      phone: '+49170123456',
      street: 'Musterstraße 1',
      zip: '58452',
      city: 'Witten',
    },
  });

  // 3. Create Jockey User
  console.log('Creating jockey user...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const jockeyUser = await prisma.user.upsert({
    where: { email: 'jockey1@test.de' },
    update: {},
    create: {
      email: 'jockey1@test.de',
      firstName: 'Test',
      lastName: 'Jockey',
      username: 'jockey1',
      role: 'JOCKEY',
      passwordHash,
    },
  });
  console.log(`✅ Jockey created: ${jockeyUser.email}`);

  // 4. Create Jockey Profile
  await prisma.jockeyProfile.upsert({
    where: { userId: jockeyUser.id },
    update: {},
    create: {
      userId: jockeyUser.id,
      phone: '+49170234567',
    },
  });

  // 5. Create Workshop User
  console.log('Creating workshop user...');
  const workshopUser = await prisma.user.upsert({
    where: { email: 'workshop1@test.de' },
    update: {},
    create: {
      email: 'workshop1@test.de',
      firstName: 'Werkstatt',
      lastName: 'Witten',
      username: 'workshop1',
      role: 'WORKSHOP',
      passwordHash,
    },
  });
  console.log(`✅ Workshop created: ${workshopUser.email}`);

  // 6. Create Workshop Profile
  await prisma.workshopProfile.upsert({
    where: { userId: workshopUser.id },
    update: {},
    create: {
      userId: workshopUser.id,
      workshopName: 'Werkstatt Witten',
      phone: '+49 2302 123456',
      email: 'info@werkstatt-witten.de',
      street: 'Hauptstraße 1',
      zip: '58452',
      city: 'Witten',
    },
  });

  // 7. Create Test Vehicle
  console.log('Creating test vehicle...');
  await prisma.vehicle.create({
    data: {
      userId: customerUser.id,
      brand: 'VW',
      model: 'Golf 7',
      year: 2016,
      mileage: 75000,
      licensePlate: 'DO AB 1234',
    },
  }).catch(() => console.log('Vehicle might already exist'));

  // 8. Create Price Matrix Entries
  console.log('Creating price matrix...');
  const priceEntries = [
    { brand: 'VW', model: 'Golf 7', yearFrom: 2012, yearTo: 2019, serviceType: 'INSPECTION', basePrice: 21900, ageSurchargePercent: 0 },
    { brand: 'VW', model: 'Golf 8', yearFrom: 2019, yearTo: 2026, serviceType: 'INSPECTION', basePrice: 22900, ageSurchargePercent: 0 },
    { brand: 'VW', model: 'Passat B8', yearFrom: 2014, yearTo: 2023, serviceType: 'INSPECTION', basePrice: 25900, ageSurchargePercent: 0 },
    { brand: 'Audi', model: 'A4 B9', yearFrom: 2015, yearTo: 2023, serviceType: 'INSPECTION', basePrice: 28900, ageSurchargePercent: 0 },
    { brand: 'BMW', model: '3er G20', yearFrom: 2019, yearTo: 2026, serviceType: 'INSPECTION', basePrice: 30900, ageSurchargePercent: 0 },
  ];

  for (const entry of priceEntries) {
    await prisma.priceMatrix.upsert({
      where: {
        brand_model_yearFrom_yearTo_serviceType: {
          brand: entry.brand,
          model: entry.model,
          yearFrom: entry.yearFrom,
          yearTo: entry.yearTo,
          serviceType: entry.serviceType,
        },
      },
      update: {},
      create: entry,
    }).catch(() => console.log(`Price matrix entry for ${entry.brand} ${entry.model} might already exist`));
  }
  console.log('✅ Price matrix created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  👤 Customer: kunde@test.de (use magic link)');
  console.log('  🚗 Jockey: jockey1@test.de / password123');
  console.log('  🔧 Workshop: workshop1@test.de / password123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
