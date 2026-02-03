/**
 * Test script for booking creation
 * Run with: npx ts-node src/scripts/test-booking.ts
 *
 * Note: This test bypasses payment processing since Stripe is out of scope
 */

import { PrismaClient } from '@prisma/client';
import { BookingsService } from '../services/bookings.service';
import { VehiclesService } from '../services/vehicles.service';
import { BookingsRepository } from '../repositories/bookings.repository';
import { VehiclesRepository } from '../repositories/vehicles.repository';
import { PriceMatrixRepository } from '../repositories/price-matrix.repository';
import { PricingService } from '../services/pricing.service';
import { CreateBookingDto } from '../types/booking.types';

// Set environment to skip payment processing
process.env.SKIP_PAYMENT = 'true';

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

    // 2. Initialize services
    const bookingsRepository = new BookingsRepository(prisma);
    const vehiclesRepository = new VehiclesRepository(prisma);
    const priceMatrixRepository = new PriceMatrixRepository(prisma);
    const pricingService = new PricingService(priceMatrixRepository);
    const vehiclesService = new VehiclesService(vehiclesRepository, priceMatrixRepository);
    const bookingsService = new BookingsService(
      bookingsRepository,
      vehiclesRepository,
      pricingService,
      vehiclesService
    );

    // 3. Create test booking DTO
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(17, 0, 0, 0);

    const bookingDto: CreateBookingDto = {
      vehicle: {
        brand: 'VW',
        model: 'Golf 7',
        year: 2018,
        mileage: 50000,
        saveVehicle: true
      },
      services: ['inspection', 'oil'],
      pickup: {
        date: tomorrow.toISOString(),
        timeSlot: '09:00-11:00',
        street: 'Teststraße 123',
        city: 'München',
        postalCode: '80331'
      },
      delivery: {
        date: nextWeek.toISOString(),
        timeSlot: '17:00-19:00'
      },
      customerNotes: 'Test booking - please handle with care'
    };

    console.log('\n📋 Creating booking with data:');
    console.log('Vehicle:', bookingDto.vehicle);
    console.log('Services:', bookingDto.services);
    console.log('Pickup:', bookingDto.pickup.date, bookingDto.pickup.timeSlot);
    console.log('Delivery:', bookingDto.delivery.date, bookingDto.delivery.timeSlot);

    // 4. Create booking
    const booking = await bookingsService.createBookingFromDto(customer.id, bookingDto);

    console.log('\n✅ Booking created successfully!');
    console.log('Booking Number:', booking.bookingNumber);
    console.log('Booking ID:', booking.id);
    console.log('Status:', booking.status);
    console.log('Total Price:', booking.totalPrice.toString(), 'EUR');
    console.log('Vehicle ID:', booking.vehicleId);
    console.log('Service Type:', booking.serviceType);

    // 5. Fetch and display the complete booking
    const fullBooking = await bookingsService.getBookingById(booking.id);

    console.log('\n📦 Full Booking Details:');
    console.log(JSON.stringify({
      id: fullBooking.id,
      bookingNumber: fullBooking.bookingNumber,
      status: fullBooking.status,
      serviceType: fullBooking.serviceType,
      totalPrice: fullBooking.totalPrice.toString(),
      vehicle: fullBooking.vehicle,
      customer: {
        email: fullBooking.customer.email,
        name: `${fullBooking.customer.firstName} ${fullBooking.customer.lastName}`
      },
      pickup: {
        date: fullBooking.pickupDate,
        timeSlot: fullBooking.pickupTimeSlot,
        address: fullBooking.pickupAddress,
        city: fullBooking.pickupCity
      },
      delivery: {
        date: fullBooking.deliveryDate,
        timeSlot: fullBooking.deliveryTimeSlot
      }
    }, null, 2));

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testBookingCreation();
