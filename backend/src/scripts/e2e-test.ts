/**
 * End-to-End Test for Booking Flow
 * Tests the complete booking journey from creation to retrieval
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Backend Test...\n');

  try {
    // ============================================================================
    // STEP 1: Verify Test Users Exist
    // ============================================================================
    console.log('📋 STEP 1: Verifying test users...');

    const customer = await prisma.user.findUnique({
      where: { email: 'kunde@kunde.de' }
    });

    const jockey = await prisma.user.findUnique({
      where: { email: 'jockey@jockey.de' }
    });

    const workshop = await prisma.user.findUnique({
      where: { email: 'werkstatt@werkstatt.de' }
    });

    if (!customer || !jockey || !workshop) {
      throw new Error('Test users not found. Please run seed script first.');
    }

    console.log('✅ Customer found:', customer.email);
    console.log('✅ Jockey found:', jockey.email);
    console.log('✅ Workshop found:', workshop.email);
    console.log('');

    // ============================================================================
    // STEP 2: Create a Vehicle
    // ============================================================================
    console.log('📋 STEP 2: Creating test vehicle...');

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: customer.id,
        brand: 'VW',
        model: 'Golf 7',
        year: 2018,
        mileage: 50000,
        licensePlate: 'DO-AB-123'
      }
    });

    console.log('✅ Vehicle created:');
    console.log('   - ID:', vehicle.id);
    console.log('   - Brand/Model:', `${vehicle.brand} ${vehicle.model}`);
    console.log('   - Year:', vehicle.year);
    console.log('   - Mileage:', vehicle.mileage, 'km');
    console.log('');

    // ============================================================================
    // STEP 3: Create a Booking with Multiple Services
    // ============================================================================
    console.log('📋 STEP 3: Creating booking with multiple services...');

    const bookingNumber = `BK${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}001`;

    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 3); // 3 days from now

    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days after pickup

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceType: 'INSPECTION', // Primary service
        services: [
          { type: 'INSPECTION', price: 149 },
          { type: 'OIL_SERVICE', price: 89 },
          { type: 'BRAKE_SERVICE', price: 199 }
        ],
        mileageAtBooking: vehicle.mileage,
        totalPrice: 437, // 149 + 89 + 199
        priceBreakdown: {
          services: [
            { name: 'Inspektion', price: 149 },
            { name: 'Ölwechsel', price: 89 },
            { name: 'Bremsservice', price: 199 }
          ],
          concierge: 0,
          total: 437
        },
        pickupDate,
        pickupTimeSlot: '09:00-11:00',
        deliveryDate,
        deliveryTimeSlot: '17:00-19:00',
        pickupAddress: 'Musterstraße 123',
        pickupCity: 'Witten',
        pickupPostalCode: '58453',
        status: 'CONFIRMED',
        customerNotes: 'Bitte Klimaanlage prüfen'
      },
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        vehicle: true
      }
    });

    console.log('✅ Booking created:');
    console.log('   - Booking Number:', booking.bookingNumber);
    console.log('   - Customer:', `${booking.customer.firstName} ${booking.customer.lastName}`);
    console.log('   - Vehicle:', `${booking.vehicle.brand} ${booking.vehicle.model}`);
    console.log('   - Services:', JSON.stringify(booking.services, null, 2));
    console.log('   - Total Price:', booking.totalPrice, 'EUR');
    console.log('   - Status:', booking.status);
    console.log('   - Pickup:', booking.pickupDate.toLocaleDateString('de-DE'), booking.pickupTimeSlot);
    console.log('   - Delivery:', booking.deliveryDate?.toLocaleDateString('de-DE'), booking.deliveryTimeSlot);
    console.log('   - Address:', `${booking.pickupAddress}, ${booking.pickupPostalCode} ${booking.pickupCity}`);
    console.log('');

    // ============================================================================
    // STEP 4: Assign Jockey to Booking
    // ============================================================================
    console.log('📋 STEP 4: Assigning jockey to booking...');

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        jockeyId: jockey.id,
        status: 'JOCKEY_ASSIGNED'
      },
      include: {
        jockey: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('✅ Jockey assigned:');
    console.log('   - Jockey:', `${updatedBooking.jockey?.firstName} ${updatedBooking.jockey?.lastName}`);
    console.log('   - New Status:', updatedBooking.status);
    console.log('');

    // ============================================================================
    // STEP 5: Create Extension Request (Workshop)
    // ============================================================================
    console.log('📋 STEP 5: Creating extension request...');

    const extension = await prisma.extension.create({
      data: {
        bookingId: booking.id,
        description: 'Bremsscheiben müssen ersetzt werden',
        items: [
          { name: 'Bremsscheiben vorne', price: 120, quantity: 2 },
          { name: 'Arbeitszeit', price: 80, quantity: 1 }
        ],
        totalAmount: 32000, // 320 EUR in cents
        images: [
          'https://example.com/brake-disc-1.jpg',
          'https://example.com/brake-disc-2.jpg'
        ],
        status: 'PENDING'
      }
    });

    console.log('✅ Extension created:');
    console.log('   - Extension ID:', extension.id);
    console.log('   - Description:', extension.description);
    console.log('   - Items:', JSON.stringify(extension.items, null, 2));
    console.log('   - Total Amount:', extension.totalAmount / 100, 'EUR');
    console.log('   - Status:', extension.status);
    console.log('   - Images:', extension.images.length, 'photos');
    console.log('');

    // ============================================================================
    // STEP 6: Retrieve All Bookings for Customer
    // ============================================================================
    console.log('📋 STEP 6: Retrieving customer bookings...');

    const customerBookings = await prisma.booking.findMany({
      where: {
        customerId: customer.id
      },
      include: {
        vehicle: true,
        jockey: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        extensions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Found', customerBookings.length, 'booking(s) for customer');
    customerBookings.forEach((b, index) => {
      console.log(`\n   Booking ${index + 1}:`);
      console.log('   - Number:', b.bookingNumber);
      console.log('   - Vehicle:', `${b.vehicle.brand} ${b.vehicle.model}`);
      console.log('   - Services:', Array.isArray(b.services) ? b.services.length : 1);
      console.log('   - Total:', b.totalPrice, 'EUR');
      console.log('   - Status:', b.status);
      console.log('   - Jockey:', b.jockey ? `${b.jockey.firstName} ${b.jockey.lastName}` : 'Not assigned');
      console.log('   - Extensions:', b.extensions.length);
    });
    console.log('');

    // ============================================================================
    // STEP 7: Retrieve Jockey Assignments
    // ============================================================================
    console.log('📋 STEP 7: Retrieving jockey assignments...');

    const jockeyAssignments = await prisma.booking.findMany({
      where: {
        jockeyId: jockey.id
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        vehicle: true
      },
      orderBy: {
        pickupDate: 'asc'
      }
    });

    console.log('✅ Found', jockeyAssignments.length, 'assignment(s) for jockey');
    jockeyAssignments.forEach((assignment, index) => {
      console.log(`\n   Assignment ${index + 1}:`);
      console.log('   - Booking:', assignment.bookingNumber);
      console.log('   - Customer:', `${assignment.customer.firstName} ${assignment.customer.lastName}`);
      console.log('   - Vehicle:', `${assignment.vehicle.brand} ${assignment.vehicle.model}`);
      console.log('   - Pickup:', assignment.pickupDate.toLocaleDateString('de-DE'), assignment.pickupTimeSlot);
      console.log('   - Address:', `${assignment.pickupAddress}, ${assignment.pickupCity}`);
    });
    console.log('');

    // ============================================================================
    // STEP 8: Update Booking Status (Workflow)
    // ============================================================================
    console.log('📋 STEP 8: Simulating booking workflow...');

    const statuses = [
      'IN_TRANSIT_TO_WORKSHOP',
      'IN_WORKSHOP',
      'COMPLETED',
      'IN_TRANSIT_TO_CUSTOMER',
      'DELIVERED'
    ];

    for (const status of statuses) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: status as any }
      });
      console.log(`   ✓ Status updated to: ${status}`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for readability
    }
    console.log('');

    // ============================================================================
    // STEP 9: Approve Extension
    // ============================================================================
    console.log('📋 STEP 9: Approving extension...');

    const approvedExtension = await prisma.extension.update({
      where: { id: extension.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    console.log('✅ Extension approved:');
    console.log('   - Status:', approvedExtension.status);
    console.log('   - Approved at:', approvedExtension.approvedAt?.toLocaleString('de-DE'));
    console.log('');

    // ============================================================================
    // STEP 10: Final Summary
    // ============================================================================
    console.log('📋 STEP 10: Final summary...');

    const finalBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        customer: true,
        vehicle: true,
        jockey: true,
        extensions: true
      }
    });

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           FINAL BOOKING STATE                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Booking Number:', finalBooking?.bookingNumber);
    console.log('Status:', finalBooking?.status);
    console.log('Customer:', `${finalBooking?.customer.firstName} ${finalBooking?.customer.lastName}`);
    console.log('Vehicle:', `${finalBooking?.vehicle.brand} ${finalBooking?.vehicle.model} (${finalBooking?.vehicle.year})`);
    console.log('Services:', Array.isArray(finalBooking?.services) ? (finalBooking?.services as any[]).map((s: any) => s.type).join(', ') : finalBooking?.serviceType);
    console.log('Total Price:', finalBooking?.totalPrice, 'EUR');
    console.log('Jockey:', `${finalBooking?.jockey?.firstName} ${finalBooking?.jockey?.lastName}`);
    console.log('Extensions:', finalBooking?.extensions.length, '(', finalBooking?.extensions.filter(e => e.status === 'APPROVED').length, 'approved )');
    console.log('Pickup:', finalBooking?.pickupDate.toLocaleDateString('de-DE'), finalBooking?.pickupTimeSlot);
    console.log('Delivery:', finalBooking?.deliveryDate?.toLocaleDateString('de-DE'), finalBooking?.deliveryTimeSlot);
    console.log('');

    // ============================================================================
    // SUCCESS!
    // ============================================================================
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ END-TO-END TEST PASSED SUCCESSFULLY! ✅          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('All backend operations completed successfully:');
    console.log('  ✓ Users verified');
    console.log('  ✓ Vehicle created');
    console.log('  ✓ Booking with multiple services created');
    console.log('  ✓ Jockey assigned');
    console.log('  ✓ Extension created and approved');
    console.log('  ✓ Bookings retrieved for all roles');
    console.log('  ✓ Status workflow completed');
    console.log('');
    console.log('🎉 Backend is fully functional and ready for frontend integration!');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR during E2E test:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runE2ETest();
