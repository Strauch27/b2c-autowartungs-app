/**
 * Simple booking creation test (JavaScript)
 * Run with: node src/scripts/test-booking-simple.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBookingCreation() {
  console.log('🧪 Testing Booking Creation...\n');

  try {
    // 1. Find or create a test customer
    let customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });

    if (!customer) {
      console.log('Creating test customer...');
      customer = await prisma.user.create({
        data: {
          email: 'test@example.com',
          role: 'CUSTOMER',
          firstName: 'Test',
          lastName: 'User',
          customerProfile: {
            create: {
              street: 'Teststraße 123',
              city: 'München',
              postalCode: '80331'
            }
          }
        }
      });
      console.log('✓ Test customer created:', customer.email);
    } else {
      console.log('✓ Using existing customer:', customer.email);
    }

    // 2. Create or find vehicle
    let vehicle = await prisma.vehicle.findFirst({
      where: {
        customerId: customer.id,
        brand: 'VW',
        model: 'Golf 7'
      }
    });

    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          customerId: customer.id,
          brand: 'VW',
          model: 'Golf 7',
          year: 2018,
          mileage: 50000
        }
      });
      console.log('✓ Vehicle created:', vehicle.brand, vehicle.model);
    } else {
      console.log('✓ Using existing vehicle:', vehicle.brand, vehicle.model);
    }

    // 3. Generate booking number
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    const bookingNumber = `BK${year}${month}${sequence}`;

    // 4. Create booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0);

    const services = [
      { type: 'INSPECTION', price: 149 },
      { type: 'OIL_SERVICE', price: 89 }
    ];

    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceType: 'INSPECTION', // Primary service
        services: services, // Array of all services
        mileageAtBooking: vehicle.mileage,
        totalPrice,
        priceBreakdown: {
          services,
          totalPrice,
          vehicle: {
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            mileage: vehicle.mileage
          }
        },
        status: 'CONFIRMED',
        pickupDate: tomorrow,
        pickupTimeSlot: '09:00-11:00',
        pickupAddress: 'Teststraße 123',
        pickupCity: 'München',
        pickupPostalCode: '80331',
        deliveryDate: nextWeek,
        deliveryTimeSlot: '17:00-19:00',
        customerNotes: 'Test booking - multi-service'
      },
      include: {
        customer: true,
        vehicle: true
      }
    });

    console.log('\n✅ Booking created successfully!');
    console.log('Booking Number:', booking.bookingNumber);
    console.log('Booking ID:', booking.id);
    console.log('Status:', booking.status);
    console.log('Total Price:', booking.totalPrice.toString(), 'EUR');
    console.log('Services:', JSON.stringify(booking.services, null, 2));
    console.log('Vehicle:', booking.vehicle.brand, booking.vehicle.model);
    console.log('Customer:', booking.customer.email);
    console.log('Pickup:', booking.pickupDate.toISOString(), booking.pickupTimeSlot);
    console.log('Delivery:', booking.deliveryDate?.toISOString(), booking.deliveryTimeSlot);

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testBookingCreation();
