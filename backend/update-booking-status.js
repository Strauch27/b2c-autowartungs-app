#!/usr/bin/env node

/**
 * Update booking status to IN_WORKSHOP for testing
 * Run with: node update-booking-status.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBookingStatus() {
  console.log('🔧 Updating booking status to IN_WORKSHOP...\n');

  try {
    // Find the most recent booking
    const booking = await prisma.booking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        vehicle: true
      }
    });

    if (!booking) {
      console.log('❌ No bookings found');
      return;
    }

    console.log('📋 Found booking:');
    console.log('   Booking Number:', booking.bookingNumber);
    console.log('   Customer:', `${booking.customer.firstName} ${booking.customer.lastName}`);
    console.log('   Vehicle:', `${booking.vehicle.brand} ${booking.vehicle.model}`);
    console.log('   Current Status:', booking.status);

    // Update status to IN_WORKSHOP
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'IN_WORKSHOP' }
    });

    console.log('\n✅ Booking status updated!');
    console.log('   New Status:', updated.status);
    console.log('\n🎯 You can now create an extension for this booking in the workshop dashboard!');
    console.log('   Dashboard: http://localhost:3000/de/workshop/dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingStatus();
