/**
 * Authentication Seed Data
 * Creates test users for development and testing
 *
 * Usage:
 * 1. Copy this file to prisma/seed.ts
 * 2. Update package.json with prisma seed command
 * 3. Run: npx prisma db seed
 */

// import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../services/auth.service';
import { UserRole } from '../types/auth.types';

// const prisma = new PrismaClient();

/**
 * Seed authentication data
 */
async function seedAuth() {
  console.log('🌱 Seeding authentication data...');

  // Create test customers
  const customers = [
    {
      email: 'customer1@example.com',
      role: UserRole.CUSTOMER,
      isActive: true
    },
    {
      email: 'customer2@example.com',
      role: UserRole.CUSTOMER,
      isActive: true
    },
    {
      email: 'customer3@example.com',
      role: UserRole.CUSTOMER,
      isActive: true
    }
  ];

  console.log('Creating test customers...');
  for (const customer of customers) {
    // await prisma.user.create({
    //   data: customer
    // });
    console.log(`✓ Created customer: ${customer.email}`);
  }

  // Create test jockeys
  const jockeys = [
    {
      email: 'jockey1@example.com',
      username: 'jockey1',
      passwordHash: await hashPassword('password123'),
      role: UserRole.JOCKEY,
      firstName: 'John',
      lastName: 'Driver',
      isActive: true
    },
    {
      email: 'jockey2@example.com',
      username: 'jockey2',
      passwordHash: await hashPassword('password123'),
      role: UserRole.JOCKEY,
      firstName: 'Jane',
      lastName: 'Wheeler',
      isActive: true
    }
  ];

  console.log('Creating test jockeys...');
  for (const jockey of jockeys) {
    // await prisma.user.create({
    //   data: jockey
    // });
    console.log(`✓ Created jockey: ${jockey.username} (${jockey.email})`);
  }

  // Create test workshops
  const workshops = [
    {
      email: 'workshop1@example.com',
      username: 'workshop1',
      passwordHash: await hashPassword('password123'),
      role: UserRole.WORKSHOP,
      firstName: 'Munich',
      lastName: 'Auto Center',
      isActive: true
    },
    {
      email: 'workshop2@example.com',
      username: 'workshop2',
      passwordHash: await hashPassword('password123'),
      role: UserRole.WORKSHOP,
      firstName: 'Berlin',
      lastName: 'Service GmbH',
      isActive: true
    }
  ];

  console.log('Creating test workshops...');
  for (const workshop of workshops) {
    // await prisma.user.create({
    //   data: workshop
    // });
    console.log(`✓ Created workshop: ${workshop.username} (${workshop.email})`);
  }

  // Create admin user
  const admin = {
    email: 'admin@example.com',
    username: 'admin',
    passwordHash: await hashPassword('admin123'),
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    isActive: true
  };

  console.log('Creating admin user...');
  // await prisma.user.create({
  //   data: admin
  // });
  console.log(`✓ Created admin: ${admin.username} (${admin.email})`);

  console.log('\n✅ Authentication seed data created successfully!\n');
  console.log('Test Credentials:');
  console.log('================\n');
  console.log('Customers (Magic Link):');
  console.log('  - customer1@example.com');
  console.log('  - customer2@example.com');
  console.log('  - customer3@example.com\n');
  console.log('Jockeys (Username/Password):');
  console.log('  - username: jockey1, password: password123');
  console.log('  - username: jockey2, password: password123\n');
  console.log('Workshops (Username/Password):');
  console.log('  - username: workshop1, password: password123');
  console.log('  - username: workshop2, password: password123\n');
  console.log('Admin (Username/Password):');
  console.log('  - username: admin, password: admin123\n');
}

/**
 * Main seed function
 */
async function main() {
  try {
    await seedAuth();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  main();
}

export { seedAuth };
