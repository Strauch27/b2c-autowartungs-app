# Code Review Skill

## Purpose
Comprehensive code review focusing on code quality, maintainability, best practices, and potential bugs before merging.

## When to Use
- Before merging pull requests
- After completing a feature
- When requested by developer
- As part of Definition of Done

## Review Dimensions

### 1. Code Quality & Readability
```typescript
// ❌ BAD: Unclear variable names, no comments
function p(d: any) {
  const r = [];
  for (let i = 0; i < d.length; i++) {
    if (d[i].s === 'a') r.push(d[i]);
  }
  return r;
}

// ✅ GOOD: Clear names, self-documenting
function filterAvailableSlots(slots: Slot[]): Slot[] {
  return slots.filter(slot => slot.status === 'available');
}

// ✅ GOOD: Complex logic with explanatory comment
/**
 * Prevents race conditions when booking slots by using pessimistic locking.
 * 1. Lock slot row with SELECT FOR UPDATE
 * 2. Check if slot is still available
 * 3. Create booking within same transaction
 * 4. Release lock on commit
 */
async function bookSlotWithLocking(slotId: string) {
  return await db.transaction(async (trx) => {
    const slot = await trx('slots').where({ id: slotId }).forUpdate().first();
    // ...
  });
}
```

**Readability Checklist:**
- [ ] Variable/function names are descriptive (no `d`, `temp`, `data1`)
- [ ] Functions are small (<50 lines, single responsibility)
- [ ] Complex logic has explanatory comments
- [ ] No magic numbers (use named constants)
- [ ] Consistent code style (ESLint rules followed)
- [ ] No commented-out code (remove or explain why kept)

### 2. Type Safety (TypeScript)
```typescript
// ❌ BAD: `any` types, no validation
function createBooking(data: any) {
  return db.insert(data);
}

// ✅ GOOD: Strong types, validation
interface CreateBookingInput {
  workshopId: string;
  serviceId: string;
  slotStart: Date;
  slotEnd: Date;
  customerEmail: string;
  customerPhone: string;
  vehicleLicensePlate?: string;
  consentDataProcessing: boolean;
}

const createBookingSchema = z.object({
  workshopId: z.string().cuid(),
  serviceId: z.string().cuid(),
  slotStart: z.date(),
  slotEnd: z.date(),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  vehicleLicensePlate: z.string().max(15).optional(),
  consentDataProcessing: z.literal(true),
});

async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const validated = createBookingSchema.parse(input);
  return db.booking.create({ data: validated });
}
```

**Type Safety Checklist:**
- [ ] No `any` types (use `unknown` if truly dynamic)
- [ ] All function parameters typed
- [ ] All function return types explicit
- [ ] API responses typed (not `any`)
- [ ] Zod schemas for runtime validation
- [ ] No TypeScript errors or warnings
- [ ] Strict mode enabled in tsconfig.json

### 3. Error Handling
```typescript
// ❌ BAD: Silent failures, generic errors
async function getWorkshop(id: string) {
  try {
    return await db.workshop.findUnique({ where: { id } });
  } catch (e) {
    console.log('Error');
    return null;
  }
}

// ✅ GOOD: Specific errors, proper logging
async function getWorkshop(id: string): Promise<Workshop> {
  try {
    const workshop = await db.workshop.findUnique({
      where: { id },
      include: { services: true }
    });

    if (!workshop) {
      throw new ApiError('WORKSHOP_NOT_FOUND', `Workshop with ID ${id} not found`, 404);
    }

    return workshop;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw known errors
    }

    // Log unexpected errors
    console.error('Unexpected error fetching workshop:', error);
    throw new ApiError('INTERNAL_ERROR', 'Failed to fetch workshop', 500);
  }
}
```

**Error Handling Checklist:**
- [ ] No silent failures (empty catch blocks)
- [ ] Errors logged with context
- [ ] Custom error types used (ApiError, ValidationError)
- [ ] HTTP status codes correct (400, 401, 404, 409, 500)
- [ ] User-friendly error messages (no stack traces to client)
- [ ] Async errors handled (try/catch or .catch())

### 4. Testing Coverage
```typescript
// ✅ GOOD: Comprehensive test coverage
describe('bookSlot', () => {
  it('should successfully book available slot', async () => {
    const result = await bookSlot(userId, slotId, idempotencyKey);
    expect(result.status).toBe('CONFIRMED');
  });

  it('should reject booking when slot is full', async () => {
    await expect(bookSlot(userId, fullSlotId, idempotencyKey))
      .rejects
      .toThrow('SLOT_FULL');
  });

  it('should prevent duplicate booking with same idempotency key', async () => {
    await bookSlot(userId, slotId, key);
    const duplicate = await bookSlot(userId, slotId, key);
    expect(duplicate.id).toBe(original.id); // Returns same booking
  });

  it('should handle race condition with concurrent bookings', async () => {
    const results = await Promise.allSettled([
      bookSlot(user1, slotId, key1),
      bookSlot(user2, slotId, key2),
      bookSlot(user3, slotId, key3),
    ]);

    const succeeded = results.filter(r => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(1); // Only 1 booking succeeds
  });
});
```

**Testing Checklist:**
- [ ] Unit tests for business logic (>80% coverage)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Tests for happy path AND edge cases
- [ ] Tests for error scenarios
- [ ] Race condition tests for concurrent operations
- [ ] Tests pass consistently (no flaky tests)

### 5. Performance & Scalability
```typescript
// ❌ BAD: N+1 query problem
async function getWorkshopsWithServices() {
  const workshops = await db.workshop.findMany();

  for (const workshop of workshops) {
    workshop.services = await db.service.findMany({
      where: { workshopId: workshop.id }
    });
  }

  return workshops;
}

// ✅ GOOD: Single query with includes
async function getWorkshopsWithServices() {
  return await db.workshop.findMany({
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
    where: { isActive: true },
  });
}

// ❌ BAD: No pagination
app.get('/api/bookings', async (req, res) => {
  const bookings = await db.booking.findMany(); // Returns ALL bookings!
  res.json(bookings);
});

// ✅ GOOD: Cursor-based pagination
app.get('/api/bookings', async (req, res) => {
  const { cursor, limit = 20 } = req.query;

  const bookings = await db.booking.findMany({
    take: limit + 1, // Fetch one extra to check if there are more
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = bookings.length > limit;
  const items = hasMore ? bookings.slice(0, -1) : bookings;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  res.json({ items, nextCursor, hasMore });
});
```

**Performance Checklist:**
- [ ] No N+1 queries (use `include` or batch queries)
- [ ] Pagination for large datasets (>100 items)
- [ ] Database indexes on frequently queried fields
- [ ] Heavy computations memoized or cached
- [ ] Images optimized (Next.js Image, lazy loading)
- [ ] API responses sized reasonably (<1MB)
- [ ] No blocking operations on main thread

### 6. Security (Quick Check)
```typescript
// ❌ BAD: No authentication
app.delete('/api/bookings/:id', async (req, res) => {
  await db.booking.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ✅ GOOD: Verify ownership via magic token
app.delete('/api/bookings/:id', async (req, res) => {
  const token = req.query.token as string;
  const booking = await db.booking.findFirst({
    where: { id: req.params.id, magicToken: token }
  });

  if (!booking) {
    throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);
  }

  await db.booking.delete({ where: { id: booking.id } });
  res.json({ success: true });
});
```

**Security Quick Check:**
- [ ] Input validation (Zod schemas)
- [ ] Authentication/Authorization checks
- [ ] No SQL injection (Prisma ORM)
- [ ] No XSS (React auto-escaping)
- [ ] No secrets in code (environment variables)
- [ ] HTTPS enforced (Vercel automatic)

### 7. Code Organization & Architecture
```typescript
// ❌ BAD: Everything in one file
// app/api/bookings/route.ts (500 lines)
export async function POST(req: Request) {
  // Validation logic (50 lines)
  // Business logic (100 lines)
  // Database operations (50 lines)
  // Email sending (50 lines)
  // ...
}

// ✅ GOOD: Separated concerns
// app/api/bookings/route.ts
export async function POST(req: Request) {
  const input = await req.json();
  const booking = await createBooking(input);
  return NextResponse.json(booking, { status: 201 });
}

// lib/booking/create.ts (Business Logic)
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const validated = validateBookingInput(input);
  const booking = await createBookingInDB(validated);
  await sendConfirmationEmail(booking);
  return booking;
}

// lib/booking/validation.ts (Validation)
export function validateBookingInput(input: unknown): CreateBookingInput {
  return createBookingSchema.parse(input);
}

// lib/booking/repository.ts (Database)
export async function createBookingInDB(data: CreateBookingInput): Promise<Booking> {
  return await db.transaction(async (trx) => {
    // Pessimistic locking logic
  });
}

// lib/email/service.ts (Email)
export async function sendConfirmationEmail(booking: Booking): Promise<void> {
  // Email template and sending logic
}
```

**Architecture Checklist:**
- [ ] Separation of concerns (API → Service → Repository)
- [ ] Single Responsibility Principle (functions do one thing)
- [ ] DRY (Don't Repeat Yourself) - no code duplication
- [ ] Files <300 lines (split large files)
- [ ] Consistent file/folder naming convention
- [ ] Imports organized (external → internal → types)

### 8. Documentation
```typescript
// ❌ BAD: No documentation
function generateSlots(w: Workshop, f: Date, t: Date) {
  // ...
}

// ✅ GOOD: JSDoc comments
/**
 * Generates available time slots for a workshop within a date range.
 *
 * @param workshop - Workshop with opening hours and slot settings
 * @param from - Start date (inclusive)
 * @param to - End date (exclusive)
 * @returns Array of time slots grouped by day
 *
 * @example
 * const slots = generateSlots(workshop, new Date('2026-01-20'), new Date('2026-01-27'));
 * // Returns slots for Jan 20-26 (7 days)
 */
export function generateSlots(
  workshop: Workshop,
  from: Date,
  to: Date
): SlotsByDay {
  // Implementation
}
```

**Documentation Checklist:**
- [ ] Public functions have JSDoc comments
- [ ] Complex algorithms explained
- [ ] API endpoints documented (OpenAPI/JSDoc)
- [ ] README updated with new features
- [ ] Environment variables documented in .env.example

## Review Process

When this skill is invoked:

1. **Read the code changes** (diff/PR)
2. **Run through all checklists** (readability, types, errors, tests, performance, security, architecture, docs)
3. **Flag issues** with severity:
   - 🔴 **Blocker**: Must fix before merge (broken tests, security issues)
   - 🟡 **Major**: Should fix before merge (missing tests, poor error handling)
   - 🟢 **Minor**: Fix in future (code style, minor optimizations)
   - 💡 **Suggestion**: Nice-to-have improvements
4. **Provide specific fixes** with code examples
5. **Approve or Request Changes**

## Example Output

```markdown
## Code Review Results

### 🔴 BLOCKER: No Error Handling in API Route
**File**: app/api/bookings/route.ts:15
**Issue**: No try/catch block, errors will crash the server
**Fix**:
\`\`\`typescript
export async function POST(req: Request) {
  try {
    const input = await req.json();
    const booking = await createBooking(input);
    return successResponse(booking, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
\`\`\`

### 🟡 MAJOR: Missing Tests for Race Condition
**File**: lib/booking/create.ts
**Issue**: No tests for concurrent booking attempts
**Fix**: Add integration test with Promise.allSettled([...])

### 🟢 MINOR: Variable Naming
**File**: lib/utils/slots.ts:42
**Issue**: Variable `d` is unclear
**Suggestion**: Rename to `daySlots` or `slotsForDay`

### 💡 SUGGESTION: Performance Optimization
**File**: app/workshops/page.tsx:78
**Suggestion**: Memoize `sortedWorkshops` with useMemo to avoid re-sorting on every render

### ✅ PASSED
- Type safety: All functions properly typed
- Security: Input validation with Zod
- Architecture: Clean separation of concerns
- Documentation: JSDoc comments present
```

## Integration with Agents

- **qa-test-engineer**: Primary user of this skill
- **tech-lead-architect**: Review architecture decisions
- **security-privacy-engineer**: Deep dive on security issues

## References
- Google Engineering Practices: https://google.github.io/eng-practices/review/
- Code Review Checklist: https://www.oreilly.com/library/view/code-review-checklist/9781491967201/
