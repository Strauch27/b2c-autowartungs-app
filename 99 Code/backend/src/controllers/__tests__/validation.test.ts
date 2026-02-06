/**
 * Zod Validation Schema Unit Tests
 *
 * Tests validation schemas used in booking and workshop controllers.
 * We re-create the schemas here to test them in isolation from controller logic.
 */

import { z } from 'zod';
import { BookingStatus, ServiceType } from '@prisma/client';

// Re-create schemas as defined in bookings.controller.ts
const createBookingDtoSchema = z.object({
  customer: z.object({
    email: z.string().email('Valid email is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone number is required')
  }).optional(),
  vehicle: z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1994).max(new Date().getFullYear() + 1),
    mileage: z.number().int().min(0).max(1000000),
    saveVehicle: z.boolean().optional()
  }),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  pickup: z.object({
    date: z.string().min(1, 'Pickup date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }),
  delivery: z.object({
    date: z.string().min(1, 'Delivery date is required'),
    timeSlot: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (expected HH:MM)')
  }),
  customerNotes: z.string().optional()
});

const createExtensionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().positive('Quantity must be a positive integer')
  })).min(1, 'At least one item is required'),
  images: z.array(z.string().url()).optional(),
  videos: z.array(z.string().url()).optional()
});

const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  jockeyId: z.string().cuid().optional(),
  deliveryDate: z.string().datetime().optional(),
  deliveryTimeSlot: z.string().optional(),
  paymentIntentId: z.string().optional(),
  paidAt: z.string().datetime().optional()
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus)
});

// Valid test data
const validBookingDto = {
  vehicle: {
    brand: 'BMW',
    model: '3er',
    year: 2020,
    mileage: 45000,
  },
  services: ['inspection'],
  pickup: {
    date: '2026-03-15',
    timeSlot: '09:00',
    street: 'Hauptstr. 1',
    city: 'Witten',
    postalCode: '58453',
  },
  delivery: {
    date: '2026-03-16',
    timeSlot: '14:00',
  },
};

describe('CreateBookingDto Schema', () => {
  it('should accept valid booking DTO without customer (authenticated)', () => {
    const result = createBookingDtoSchema.safeParse(validBookingDto);
    expect(result.success).toBe(true);
  });

  it('should accept valid booking DTO with customer (guest checkout)', () => {
    const data = {
      ...validBookingDto,
      customer: {
        email: 'test@test.de',
        firstName: 'Max',
        lastName: 'Mustermann',
        phone: '+49123456789',
      },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject missing vehicle brand', () => {
    const data = {
      ...validBookingDto,
      vehicle: { ...validBookingDto.vehicle, brand: '' },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject vehicle year before 1994', () => {
    const data = {
      ...validBookingDto,
      vehicle: { ...validBookingDto.vehicle, year: 1990 },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject negative mileage', () => {
    const data = {
      ...validBookingDto,
      vehicle: { ...validBookingDto.vehicle, mileage: -1 },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject mileage over 1000000', () => {
    const data = {
      ...validBookingDto,
      vehicle: { ...validBookingDto.vehicle, mileage: 1000001 },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject empty services array', () => {
    const data = { ...validBookingDto, services: [] };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid time format', () => {
    const data = {
      ...validBookingDto,
      pickup: { ...validBookingDto.pickup, timeSlot: '25:00' },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing pickup date', () => {
    const data = {
      ...validBookingDto,
      pickup: { ...validBookingDto.pickup, date: '' },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept customer notes', () => {
    const data = { ...validBookingDto, customerNotes: 'Bitte vor 10 Uhr' };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerNotes).toBe('Bitte vor 10 Uhr');
    }
  });

  it('should reject invalid customer email', () => {
    const data = {
      ...validBookingDto,
      customer: {
        email: 'not-an-email',
        firstName: 'Max',
        lastName: 'Mustermann',
        phone: '+49123',
      },
    };
    const result = createBookingDtoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept valid time formats', () => {
    for (const time of ['00:00', '09:30', '14:00', '23:59']) {
      const data = {
        ...validBookingDto,
        pickup: { ...validBookingDto.pickup, timeSlot: time },
      };
      expect(createBookingDtoSchema.safeParse(data).success).toBe(true);
    }
  });
});

describe('CreateExtension Schema', () => {
  const validExtension = {
    description: 'Bremsbeläge abgenutzt',
    items: [
      { name: 'Bremsbeläge vorne', price: 12900, quantity: 1 },
    ],
  };

  it('should accept valid extension', () => {
    const result = createExtensionSchema.safeParse(validExtension);
    expect(result.success).toBe(true);
  });

  it('should accept extension with multiple items', () => {
    const data = {
      ...validExtension,
      items: [
        { name: 'Bremsbeläge vorne', price: 12900, quantity: 1 },
        { name: 'Bremsscheiben', price: 25000, quantity: 2 },
      ],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty description', () => {
    const result = createExtensionSchema.safeParse({ ...validExtension, description: '' });
    expect(result.success).toBe(false);
  });

  it('should reject empty items array', () => {
    const result = createExtensionSchema.safeParse({ ...validExtension, items: [] });
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const data = {
      ...validExtension,
      items: [{ name: 'Part', price: -100, quantity: 1 }],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject zero quantity', () => {
    const data = {
      ...validExtension,
      items: [{ name: 'Part', price: 100, quantity: 0 }],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject non-integer quantity', () => {
    const data = {
      ...validExtension,
      items: [{ name: 'Part', price: 100, quantity: 1.5 }],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept optional images and videos', () => {
    const data = {
      ...validExtension,
      images: ['https://example.com/photo.jpg'],
      videos: ['https://example.com/video.mp4'],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid image URLs', () => {
    const data = {
      ...validExtension,
      images: ['not-a-url'],
    };
    const result = createExtensionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('UpdateBooking Schema', () => {
  it('should accept valid status update', () => {
    const result = updateBookingSchema.safeParse({ status: BookingStatus.CONFIRMED });
    expect(result.success).toBe(true);
  });

  it('should accept customerNotes update', () => {
    const result = updateBookingSchema.safeParse({ customerNotes: 'Updated notes' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateBookingSchema.safeParse({ status: 'INVALID_STATUS' });
    expect(result.success).toBe(false);
  });

  it('should accept empty object', () => {
    const result = updateBookingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept valid datetime for deliveryDate', () => {
    const result = updateBookingSchema.safeParse({ deliveryDate: '2026-03-20T10:00:00.000Z' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid datetime format', () => {
    const result = updateBookingSchema.safeParse({ deliveryDate: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});

describe('UpdateStatus Schema (Workshop)', () => {
  it('should accept valid BookingStatus', () => {
    const result = updateStatusSchema.safeParse({ status: BookingStatus.IN_SERVICE });
    expect(result.success).toBe(true);
  });

  it('should reject missing status', () => {
    const result = updateStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject invalid status string', () => {
    const result = updateStatusSchema.safeParse({ status: 'NOT_A_STATUS' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid BookingStatus values', () => {
    for (const status of Object.values(BookingStatus)) {
      const result = updateStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });
});
