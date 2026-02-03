#!/usr/bin/env node

/**
 * Script to create a workshop user for testing
 * Run with: node create-workshop-user.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createWorkshopUser() {
  console.log('🔧 Creating workshop user...\n');

  const workshopData = {
    email: 'werkstatt@ronja.de',
    username: 'werkstatt-witten',
    firstName: 'Werkstatt',
    lastName: 'Witten',
    phone: '+49 234 567890',
    password: 'werkstatt123', // Change this!
  };

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: workshopData.email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('📧 Email:', workshopData.email);
      console.log('🔑 Password: werkstatt123 (if not changed)\n');
      console.log('➡️  Login at: http://localhost:3000/de/workshop/login\n');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(workshopData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: workshopData.email,
        username: workshopData.username,
        firstName: workshopData.firstName,
        lastName: workshopData.lastName,
        phone: workshopData.phone,
        passwordHash,
        role: 'WORKSHOP',
        isActive: true,
      }
    });

    console.log('✅ Workshop user created successfully!\n');
    console.log('📋 Login Details:');
    console.log('   Email:', workshopData.email);
    console.log('   Password:', workshopData.password);
    console.log('   Role: WORKSHOP\n');
    console.log('🌐 Login URL:');
    console.log('   German: http://localhost:3000/de/workshop/login');
    console.log('   English: http://localhost:3000/en/workshop/login\n');
    console.log('📊 Dashboard URL:');
    console.log('   http://localhost:3000/de/workshop/dashboard\n');

  } catch (error) {
    console.error('❌ Error creating workshop user:', error.message);
    if (error.code === 'P2002') {
      console.log('\n💡 User with this email or username already exists.');
      console.log('   Try logging in with: werkstatt@ronja.de / werkstatt123\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createWorkshopUser();
