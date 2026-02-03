import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Test Customer (with password for E2E tests)
  const customer = await prisma.user.upsert({
    where: { email: 'kunde@test.de' },
    update: {
      passwordHash, // Add password for E2E tests
    },
    create: {
      email: 'kunde@test.de',
      passwordHash, // Add password for E2E tests
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
        },
      },
    },
  });
  console.log(`✓ Customer created: ${customer.email} (password: password123 for E2E tests)`);

  // 2. Test Jockey
  const jockey = await prisma.user.upsert({
    where: { email: 'jockey@test.de' },
    update: {},
    create: {
      email: 'jockey@test.de',
      username: 'jockey1',
      passwordHash,
      role: 'JOCKEY',
      firstName: 'Hans',
      lastName: 'Fahrer',
      phone: '+49170234567',
      isActive: true,
      jockeyProfile: {
        create: {
          licenseNumber: 'DL12345',
          isAvailable: true,
        },
      },
    },
  });
  console.log(`✓ Jockey created: ${jockey.email} (username: jockey1, password: password123)`);

  // 3. Test Workshop User
  const workshop = await prisma.user.upsert({
    where: { email: 'werkstatt@test.de' },
    update: {},
    create: {
      email: 'werkstatt@test.de',
      username: 'werkstatt1',
      passwordHash,
      role: 'WORKSHOP',
      firstName: 'Workshop',
      lastName: 'Manager',
      phone: '+49170345678',
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
  });
  console.log(`✓ Workshop user created: ${workshop.email} (username: werkstatt1, password: password123)`);

  console.log('\n========================================');
  console.log('✓ Test users created successfully!');
  console.log('========================================');
  console.log('\nCredentials for E2E tests:');
  console.log('- Customer: kunde@test.de (Magic Link - no password)');
  console.log('- Jockey: jockey1 / password123');
  console.log('- Workshop: werkstatt1 / password123');
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
