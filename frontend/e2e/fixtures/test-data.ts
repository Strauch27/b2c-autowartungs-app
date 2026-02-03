/**
 * Test Data Fixtures
 *
 * Centralized test data for consistent testing across the suite.
 * Update these values if the backend test data changes.
 */

export const TEST_USERS = {
  workshop: {
    username: 'werkstatt1',
    password: 'password123',
    email: 'werkstatt@test.de',
    displayName: 'Werkstatt Witten',
    role: 'workshop',
  },
  jockey: {
    username: 'jockey1',
    password: 'password123',
    email: 'jockey@test.de',
    displayName: 'Hans Fahrer',
    role: 'jockey',
  },
  customer: {
    email: 'kunde@test.de',
    password: 'password123', // Note: Magic Link in production, password for tests
    firstName: 'Max',
    lastName: 'Mustermann',
    phone: '+49170123456',
  },
  guestCustomer: {
    email: 'guest.test@example.com',
    firstName: 'Guest',
    lastName: 'Tester',
    phone: '+49 171 98765432',
  },
  invalidUser: {
    username: 'wrong-user',
    password: 'wrong-password',
  },
} as const;

export const TEST_VEHICLES = {
  bmw: {
    brand: 'BMW',
    model: '3er',
    year: '2020',
    mileage: '50000',
  },
  vw: {
    brand: 'VW',
    model: 'Golf',
    year: '2019',
    mileage: '60000',
  },
  mercedes: {
    brand: 'Mercedes-Benz',
    model: 'C-Klasse',
    year: '2021',
    mileage: '30000',
  },
  audi: {
    brand: 'Audi',
    model: 'A4',
    year: '2022',
    mileage: '15000',
  },
} as const;

export const TEST_SERVICES = {
  inspection: {
    id: 'inspection',
    nameDE: 'Inspektion',
    nameEN: 'Inspection',
    price: 149,
  },
  oil: {
    id: 'oil',
    nameDE: 'Ölwechsel',
    nameEN: 'Oil Change',
    price: 89,
  },
  brakes: {
    id: 'brakes',
    nameDE: 'Bremsenwartung',
    nameEN: 'Brake Service',
    price: 199,
  },
  ac: {
    id: 'ac',
    nameDE: 'Klimaanlage',
    nameEN: 'AC Service',
    price: 119,
  },
} as const;

export const TEST_ADDRESSES = {
  witten: {
    street: 'Musterstraße 123',
    zip: '58453',
    city: 'Witten',
  },
  dortmund: {
    street: 'Testweg 45',
    zip: '44135',
    city: 'Dortmund',
  },
  bochum: {
    street: 'Beispielstraße 67',
    zip: '44789',
    city: 'Bochum',
  },
} as const;

export const TEST_TIME_SLOTS = {
  morning: {
    pickup: '09:00-11:00',
    delivery: '17:00-19:00',
  },
  afternoon: {
    pickup: '14:00-16:00',
    delivery: '17:00-19:00',
  },
  evening: {
    pickup: '17:00-19:00',
    delivery: '09:00-11:00',
  },
} as const;

export const TEST_EXTENSIONS = {
  brakeReplacement: {
    titleDE: 'Bremsbeläge müssen ersetzt werden',
    titleEN: 'Brake pads need replacement',
    descriptionDE: 'Die Bremsbeläge sind stark abgenutzt und sollten ersetzt werden.',
    descriptionEN: 'The brake pads are heavily worn and should be replaced.',
    estimatedCost: 350,
    estimatedTime: 2, // hours
  },
  tireReplacement: {
    titleDE: 'Reifenwechsel erforderlich',
    titleEN: 'Tire replacement required',
    descriptionDE: 'Die Reifen haben weniger als 3mm Profil und müssen ersetzt werden.',
    descriptionEN: 'The tires have less than 3mm tread and must be replaced.',
    estimatedCost: 600,
    estimatedTime: 3,
  },
} as const;

/**
 * Helper to generate unique email for tests
 */
export function generateUniqueEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}.${timestamp}@example.com`;
}

/**
 * Helper to get future date for booking
 */
export function getFutureDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Helper to format date for German locale
 */
export function formatDateDE(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Helper to format date for English locale
 */
export function formatDateEN(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
