/**
 * Seed Test Users for E2E Testing
 *
 * Creates test users for customer, jockey, and workshop roles
 * Run with: npx tsx prisma/seed-test-users.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 Seeding test users...\n');

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existing) {
        console.log(`  ℹ️  User already exists: ${userData.email} (${userData.role})`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
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

      console.log(`  ✅ Created user: ${user.email} (${user.role}) - ID: ${user.id}`);
    } catch (error) {
      console.error(`  ❌ Failed to create user ${userData.email}:`, error);
    }
  }

  console.log('\n✅ Test user seeding complete!\n');
  console.log('Test credentials:');
  console.log('  Customer: customer@test.com / Test123!');
  console.log('  Jockey: jockey@test.com / Test123!');
  console.log('  Workshop: workshop@test.com / Test123!\n');
}

main()
  .catch((e) => {
    console.error('Error seeding test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
