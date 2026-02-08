import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateAuthToken } from '../services/auth.service';
import bcrypt from 'bcryptjs';

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

const PRICE_MATRIX_DATA = [
  {
    brand: 'VW', model: 'Golf 7', yearFrom: 2012, yearTo: 2019,
    serviceType: 'INSPECTION', basePrice: 219, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 189, inspection60k: 219, inspection90k: 289, inspection120k: 329,
    oilService: 159, brakeServiceFront: 349, brakeServiceRear: 299, tuv: 89, climateService: 129,
  },
  {
    brand: 'VW', model: 'Golf 8', yearFrom: 2019, yearTo: 2026,
    serviceType: 'INSPECTION', basePrice: 229, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 199, inspection60k: 229, inspection90k: 299, inspection120k: 339,
    oilService: 169, brakeServiceFront: 359, brakeServiceRear: 309, tuv: 89, climateService: 129,
  },
  {
    brand: 'VW', model: 'Passat B8', yearFrom: 2014, yearTo: 2023,
    serviceType: 'INSPECTION', basePrice: 259, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 219, inspection60k: 259, inspection90k: 329, inspection120k: 369,
    oilService: 179, brakeServiceFront: 399, brakeServiceRear: 349, tuv: 89, climateService: 139,
  },
  {
    brand: 'VW', model: 'Polo', yearFrom: 2017, yearTo: 2026,
    serviceType: 'INSPECTION', basePrice: 199, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 169, inspection60k: 199, inspection90k: 259, inspection120k: 299,
    oilService: 149, brakeServiceFront: 319, brakeServiceRear: 279, tuv: 89, climateService: 119,
  },
  {
    brand: 'Audi', model: 'A4 B9', yearFrom: 2015, yearTo: 2023,
    serviceType: 'INSPECTION', basePrice: 289, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 249, inspection60k: 289, inspection90k: 359, inspection120k: 399,
    oilService: 199, brakeServiceFront: 449, brakeServiceRear: 399, tuv: 89, climateService: 149,
  },
  {
    brand: 'Audi', model: 'A3 8V', yearFrom: 2012, yearTo: 2020,
    serviceType: 'INSPECTION', basePrice: 269, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 229, inspection60k: 269, inspection90k: 339, inspection120k: 379,
    oilService: 189, brakeServiceFront: 429, brakeServiceRear: 379, tuv: 89, climateService: 139,
  },
  {
    brand: 'BMW', model: '3er G20', yearFrom: 2019, yearTo: 2026,
    serviceType: 'INSPECTION', basePrice: 309, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 269, inspection60k: 309, inspection90k: 379, inspection120k: 419,
    oilService: 219, brakeServiceFront: 479, brakeServiceRear: 429, tuv: 89, climateService: 159,
  },
  {
    brand: 'BMW', model: '3er F30', yearFrom: 2012, yearTo: 2019,
    serviceType: 'INSPECTION', basePrice: 299, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 259, inspection60k: 299, inspection90k: 369, inspection120k: 409,
    oilService: 209, brakeServiceFront: 469, brakeServiceRear: 419, tuv: 89, climateService: 149,
  },
  {
    brand: 'Mercedes', model: 'C-Klasse W205', yearFrom: 2014, yearTo: 2021,
    serviceType: 'INSPECTION', basePrice: 319, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 279, inspection60k: 319, inspection90k: 389, inspection120k: 429,
    oilService: 229, brakeServiceFront: 499, brakeServiceRear: 449, tuv: 89, climateService: 159,
  },
  {
    brand: 'Opel', model: 'Astra K', yearFrom: 2015, yearTo: 2026,
    serviceType: 'INSPECTION', basePrice: 209, mileageMultiplier: 1.0, ageMultiplier: 1.0,
    inspection30k: 179, inspection60k: 209, inspection90k: 279, inspection120k: 319,
    oilService: 159, brakeServiceFront: 339, brakeServiceRear: 289, tuv: 89, climateService: 119,
  },
];

/**
 * Reset the database and re-seed test data.
 * POST /api/test/reset
 */
export async function resetDatabase(req: Request, res: Response): Promise<void> {
  try {
    // Get all public table names except Prisma migrations
    const tables: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name != '_prisma_migrations'
    `;

    // Truncate all tables
    if (tables.length > 0) {
      const tableNames = tables.map(t => `"${t.table_name}"`).join(', ');
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`);
    }

    // Seed test users
    for (const userData of TEST_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
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
    }

    // Seed PriceMatrix
    await prisma.priceMatrix.createMany({ data: PRICE_MATRIX_DATA as any });

    // Seed a sample booking at AT_WORKSHOP so the workshop dashboard has data
    const customer = await prisma.user.findUnique({ where: { email: 'customer@test.com' } });
    const jockey = await prisma.user.findUnique({ where: { email: 'jockey@test.com' } });
    if (customer && jockey) {
      const vehicle = await prisma.vehicle.create({
        data: {
          customerId: customer.id,
          brand: 'VW',
          model: 'Golf 7',
          year: 2019,
          mileage: 45000,
          licensePlate: 'B-AC 1234',
        }
      });

      await prisma.booking.create({
        data: {
          bookingNumber: 'AC-SEED-0001',
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceType: 'INSPECTION',
          services: [{ type: 'INSPECTION', price: 249 }],
          mileageAtBooking: 45000,
          status: 'AT_WORKSHOP',
          totalPrice: 249,
          pickupDate: new Date(),
          pickupTimeSlot: '09:00-11:00',
          pickupAddress: 'Musterstraße 1',
          pickupCity: 'Berlin',
          pickupPostalCode: '10115',
          jockeyId: jockey.id,
          paidAt: new Date(),
          customerNotes: 'Seed booking for testing',
        }
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
}

/**
 * Advance a booking to a target status, stepping through valid FSM transitions.
 * POST /api/test/advance-booking
 * Body: { bookingId: string, targetStatus: string }
 */
export async function advanceBooking(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId, targetStatus } = req.body;

    if (!bookingId || !targetStatus) {
      res.status(400).json({ error: 'bookingId and targetStatus are required' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, vehicle: true }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Define the happy-path FSM order
    const FSM_PATH = [
      'PENDING_PAYMENT', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP',
      'AT_WORKSHOP', 'IN_SERVICE', 'READY_FOR_RETURN', 'RETURN_ASSIGNED', 'RETURNED'
    ];

    const currentIdx = FSM_PATH.indexOf(booking.status);
    const targetIdx = FSM_PATH.indexOf(targetStatus);

    if (targetIdx < 0) {
      res.status(400).json({ error: `Unknown target status: ${targetStatus}` });
      return;
    }

    if (currentIdx >= targetIdx) {
      res.json({ ok: true, message: `Booking already at ${booking.status}`, status: booking.status });
      return;
    }

    // Find first available jockey for assignments
    const jockey = await prisma.user.findFirst({ where: { role: 'JOCKEY', isActive: true } });

    // Advance step by step
    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      const nextStatus = FSM_PATH[i];

      // Create jockey assignment when advancing to PICKUP_ASSIGNED
      if (nextStatus === 'PICKUP_ASSIGNED' && jockey) {
        const existingAssignment = await prisma.jockeyAssignment.findFirst({
          where: { bookingId: booking.id, type: 'PICKUP' }
        });
        if (!existingAssignment) {
          await prisma.jockeyAssignment.create({
            data: {
              bookingId: booking.id,
              jockeyId: jockey.id,
              type: 'PICKUP',
              status: 'ASSIGNED',
              scheduledTime: new Date(),
              customerName: `${booking.customer?.firstName || 'Test'} ${booking.customer?.lastName || 'Customer'}`,
              customerPhone: booking.customer?.phone || '',
              customerAddress: booking.pickupAddress,
              customerCity: booking.pickupCity,
              customerPostalCode: booking.pickupPostalCode,
              vehicleBrand: booking.vehicle?.brand || '',
              vehicleModel: booking.vehicle?.model || '',
              vehicleLicensePlate: booking.vehicle?.licensePlate || '',
            }
          });
        }
      }

      // Complete pickup assignment when advancing past PICKED_UP
      if (nextStatus === 'PICKED_UP') {
        await prisma.jockeyAssignment.updateMany({
          where: { bookingId: booking.id, type: 'PICKUP', status: { not: 'COMPLETED' } },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
      }

      // Create return assignment when advancing to RETURN_ASSIGNED
      if (nextStatus === 'RETURN_ASSIGNED' && jockey) {
        const existingReturn = await prisma.jockeyAssignment.findFirst({
          where: { bookingId: booking.id, type: 'RETURN' }
        });
        if (!existingReturn) {
          await prisma.jockeyAssignment.create({
            data: {
              bookingId: booking.id,
              jockeyId: jockey.id,
              type: 'RETURN',
              status: 'ASSIGNED',
              scheduledTime: new Date(),
              customerName: `${booking.customer?.firstName || 'Test'} ${booking.customer?.lastName || 'Customer'}`,
              customerPhone: booking.customer?.phone || '',
              customerAddress: booking.pickupAddress,
              customerCity: booking.pickupCity,
              customerPostalCode: booking.pickupPostalCode,
              vehicleBrand: booking.vehicle?.brand || '',
              vehicleModel: booking.vehicle?.model || '',
              vehicleLicensePlate: booking.vehicle?.licensePlate || '',
            }
          });
        }
      }

      // Complete return assignment when advancing to RETURNED
      if (nextStatus === 'RETURNED') {
        await prisma.jockeyAssignment.updateMany({
          where: { bookingId: booking.id, type: 'RETURN', status: { not: 'COMPLETED' } },
          data: { status: 'COMPLETED', completedAt: new Date() }
        });
      }

      // Set paidAt when confirming
      const extraData: any = {};
      if (nextStatus === 'CONFIRMED') extraData.paidAt = new Date();

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: nextStatus as any, ...extraData }
      });
    }

    const updated = await prisma.booking.findUnique({ where: { id: bookingId } });
    res.json({ ok: true, status: updated?.status, previousStatus: booking.status });
  } catch (error) {
    console.error('Error advancing booking:', error);
    res.status(500).json({ error: 'Failed to advance booking' });
  }
}

const ROLE_EMAIL_MAP: Record<string, string> = {
  CUSTOMER: 'customer@test.com',
  JOCKEY: 'jockey@test.com',
  WORKSHOP: 'workshop@test.com',
  ADMIN: 'admin@test.com',
};

/**
 * Generate a JWT token for a test user by role.
 * POST /api/test/token
 * Body: { role: 'CUSTOMER' | 'JOCKEY' | 'WORKSHOP' | 'ADMIN' }
 */
export async function generateToken(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.body;

    if (!role || !['CUSTOMER', 'JOCKEY', 'WORKSHOP', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be CUSTOMER, JOCKEY, WORKSHOP, or ADMIN.' });
      return;
    }

    const email = ROLE_EMAIL_MAP[role];
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: `Test user not found for role ${role}. Run POST /api/test/reset first.` });
      return;
    }

    const token = generateAuthToken(user as any);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error generating test token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
}
