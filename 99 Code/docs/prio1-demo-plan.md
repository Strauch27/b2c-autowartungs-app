# Prio 1 Demo-Flow: Master Implementation Plan
## New Booking Status & FSM Architecture

**Version:** 1.0
**Date:** February 3, 2026
**Tech Lead:** Agent 1
**Status:** READY FOR IMPLEMENTATION

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [FSM Architecture: Complete State Machine](#fsm-architecture-complete-state-machine)
3. [Status Migration Strategy](#status-migration-strategy)
4. [API Endpoint Changes](#api-endpoint-changes)
5. [Sequence Diagram: Complete Journey](#sequence-diagram-complete-journey)
6. [Parallel Work Distribution](#parallel-work-distribution)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
9. [Testing Strategy](#testing-strategy)
10. [Rollout Plan](#rollout-plan)

---

## Executive Summary

### Goal
Implement granular booking status tracking to enable complete demo walkthrough from booking creation through service completion and delivery, with proper Extension flow integration.

### Current State (Existing Status)
```
PENDING_PAYMENT → CONFIRMED → JOCKEY_ASSIGNED →
IN_TRANSIT_TO_WORKSHOP → IN_WORKSHOP → COMPLETED →
IN_TRANSIT_TO_CUSTOMER → DELIVERED → CANCELLED
```

### Target State (New Status)
```
PENDING_PAYMENT → CONFIRMED →
PICKUP_ASSIGNED → PICKED_UP → AT_WORKSHOP →
IN_SERVICE → READY_FOR_RETURN →
RETURN_ASSIGNED → RETURNED → DELIVERED → CANCELLED
```

### Key Changes
1. **Removed:** `JOCKEY_ASSIGNED`, `IN_TRANSIT_TO_WORKSHOP`, `IN_WORKSHOP`, `COMPLETED`, `IN_TRANSIT_TO_CUSTOMER`
2. **Added:** `PICKUP_ASSIGNED`, `PICKED_UP`, `AT_WORKSHOP`, `IN_SERVICE`, `READY_FOR_RETURN`, `RETURN_ASSIGNED`, `RETURNED`
3. **Unchanged:** `PENDING_PAYMENT`, `CONFIRMED`, `DELIVERED`, `CANCELLED`

### Why This Matters
- **Customer Transparency:** Clearer status progression ("My car is being picked up" vs "Jockey assigned")
- **Workshop Integration:** Explicit `IN_SERVICE` status for Extension creation
- **Demo Walkthrough:** Each status has clear trigger action for demo flow
- **Extension Flow:** Extensions can only be created when `IN_SERVICE`

---

## FSM Architecture: Complete State Machine

### 1. Complete FSM Definition

```typescript
// File: backend/src/types/fsm.types.ts (NEW FILE)

export enum BookingStatus {
  // Payment Phase
  PENDING_PAYMENT = 'PENDING_PAYMENT',      // Initial: Booking created, awaiting payment
  CONFIRMED = 'CONFIRMED',                  // Payment successful

  // Pickup Phase
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',      // Jockey assigned for pickup
  PICKED_UP = 'PICKED_UP',                  // Vehicle collected from customer

  // Workshop Phase
  AT_WORKSHOP = 'AT_WORKSHOP',              // Vehicle arrived at workshop
  IN_SERVICE = 'IN_SERVICE',                // Workshop actively working
  READY_FOR_RETURN = 'READY_FOR_RETURN',    // Service complete, ready for delivery

  // Return Phase
  RETURN_ASSIGNED = 'RETURN_ASSIGNED',      // Jockey assigned for return
  RETURNED = 'RETURNED',                    // Vehicle returned to customer
  DELIVERED = 'DELIVERED',                  // Customer confirmed receipt (final)

  // Exception
  CANCELLED = 'CANCELLED'                   // Booking cancelled
}

// FSM Transition Rules
export const FSM_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKUP_ASSIGNED', 'CANCELLED'],
  PICKUP_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['AT_WORKSHOP', 'CANCELLED'],
  AT_WORKSHOP: ['IN_SERVICE', 'CANCELLED'],
  IN_SERVICE: ['READY_FOR_RETURN', 'CANCELLED'],
  READY_FOR_RETURN: ['RETURN_ASSIGNED', 'CANCELLED'],
  RETURN_ASSIGNED: ['RETURNED', 'CANCELLED'],
  RETURNED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

// Extension Creation Rules
export const EXTENSION_ALLOWED_STATES: BookingStatus[] = [
  BookingStatus.IN_SERVICE  // Extensions can ONLY be created when in service
];

// Validate FSM transition
export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  const allowedTransitions = FSM_TRANSITIONS[from];
  return allowedTransitions.includes(to);
}

// Get next valid states
export function getNextStates(current: BookingStatus): BookingStatus[] {
  return FSM_TRANSITIONS[current] || [];
}
```

### 2. FSM Transitions with Triggers

| From Status | To Status | Trigger | Actor | API Endpoint |
|------------|-----------|---------|-------|-------------|
| `PENDING_PAYMENT` | `CONFIRMED` | Payment success (demo: auto-confirm) | System | Automatic |
| `CONFIRMED` | `PICKUP_ASSIGNED` | Jockey assignment created | System | Automatic |
| `PICKUP_ASSIGNED` | `PICKED_UP` | Jockey completes pickup | Jockey | `PATCH /api/jockeys/assignments/:id/complete` |
| `PICKED_UP` | `AT_WORKSHOP` | Jockey arrives at workshop | Jockey | `PATCH /api/jockeys/assignments/:id/arrive-workshop` |
| `AT_WORKSHOP` | `IN_SERVICE` | Workshop starts service | Workshop | `PATCH /api/workshops/orders/:id/start-service` |
| `IN_SERVICE` | `READY_FOR_RETURN` | Workshop completes service | Workshop | `PATCH /api/workshops/orders/:id/complete` |
| `READY_FOR_RETURN` | `RETURN_ASSIGNED` | Return jockey assigned | System | Automatic |
| `RETURN_ASSIGNED` | `RETURNED` | Jockey completes return | Jockey | `PATCH /api/jockeys/assignments/:id/complete` |
| `RETURNED` | `DELIVERED` | Customer confirms receipt | Customer/Jockey | `PATCH /api/bookings/:id/confirm-delivery` |
| Any | `CANCELLED` | Customer/Admin cancels | Customer/Admin | `DELETE /api/bookings/:id` |

### 3. Extension FSM Integration

**Extension Status:** `PENDING` → `APPROVED` → `COMPLETED` (or `DECLINED`)

**Extension Rules:**
1. Can create Extension ONLY when Booking is `IN_SERVICE`
2. Creating Extension does NOT change Booking status
3. Approving Extension does NOT change Booking status
4. Booking stays `IN_SERVICE` during Extension approval/work
5. Workshop can only mark service complete when:
   - No Extensions exist, OR
   - All Extensions are `APPROVED` or `DECLINED` or `COMPLETED`
6. When service complete: `IN_SERVICE` → `READY_FOR_RETURN`

**Extension Payment Flow:**
```
Workshop creates Extension → PENDING
Customer approves → APPROVED (payment AUTHORIZED)
Workshop completes work → payment CAPTURED
```

---

## Status Migration Strategy

### 1. Deprecated Status Mapping

| Old Status | New Status | Migration Rule |
|-----------|------------|----------------|
| `JOCKEY_ASSIGNED` | `PICKUP_ASSIGNED` | Direct rename |
| `IN_TRANSIT_TO_WORKSHOP` | `PICKED_UP` | Direct rename |
| `IN_WORKSHOP` | `AT_WORKSHOP` | Direct rename |
| `COMPLETED` | `READY_FOR_RETURN` | Direct rename |
| `IN_TRANSIT_TO_CUSTOMER` | `RETURN_ASSIGNED` | Direct rename |

### 2. Prisma Migration

**File:** `backend/prisma/migrations/YYYYMMDDHHMMSS_update_booking_status/migration.sql`

```sql
-- Step 1: Add new enum values
ALTER TYPE "BookingStatus" ADD VALUE 'PICKUP_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_SERVICE';
ALTER TYPE "BookingStatus" ADD VALUE 'READY_FOR_RETURN';
ALTER TYPE "BookingStatus" ADD VALUE 'RETURN_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE 'RETURNED';

-- Step 2: Migrate existing data
UPDATE "Booking"
SET status = 'PICKUP_ASSIGNED'
WHERE status = 'JOCKEY_ASSIGNED';

UPDATE "Booking"
SET status = 'PICKED_UP'
WHERE status = 'IN_TRANSIT_TO_WORKSHOP';

UPDATE "Booking"
SET status = 'AT_WORKSHOP'
WHERE status = 'IN_WORKSHOP';

UPDATE "Booking"
SET status = 'READY_FOR_RETURN'
WHERE status = 'COMPLETED';

UPDATE "Booking"
SET status = 'RETURN_ASSIGNED'
WHERE status = 'IN_TRANSIT_TO_CUSTOMER';

-- Step 3: Create backup table for rollback
CREATE TABLE "Booking_Status_Backup" AS
SELECT id, status, "updatedAt"
FROM "Booking";

-- Step 4: Remove old enum values (DANGEROUS - requires new migration)
-- DO NOT RUN THIS until all code is updated:
-- ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
-- CREATE TYPE "BookingStatus" AS ENUM (...new values...);
-- ALTER TABLE "Booking" ALTER COLUMN status TYPE "BookingStatus" USING status::text::"BookingStatus";
-- DROP TYPE "BookingStatus_old";
```

### 3. Schema Changes

**File:** `backend/prisma/schema.prisma`

```prisma
enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  PICKUP_ASSIGNED      // NEW
  PICKED_UP            // NEW
  AT_WORKSHOP
  IN_SERVICE           // NEW
  READY_FOR_RETURN     // NEW
  RETURN_ASSIGNED      // NEW
  RETURNED             // NEW
  DELIVERED
  CANCELLED

  // DEPRECATED (keep for backwards compatibility during migration):
  // JOCKEY_ASSIGNED
  // IN_TRANSIT_TO_WORKSHOP
  // IN_WORKSHOP
  // COMPLETED
  // IN_TRANSIT_TO_CUSTOMER
}
```

### 4. Backwards Compatibility Strategy

**Phase 1: Dual Support (2 weeks)**
- Keep old enum values in database
- API accepts both old and new status names
- Frontend uses new status
- Backend maps old → new automatically

**Phase 2: New Only (after 2 weeks)**
- Remove old enum values
- API rejects old status names
- All systems use new status

**Rollback Plan:**
```sql
-- Restore from backup if migration fails
UPDATE "Booking" b
SET status = bsb.status
FROM "Booking_Status_Backup" bsb
WHERE b.id = bsb.id;
```

---

## API Endpoint Changes

### 1. New Endpoints (to create)

#### A. Jockey: Arrive at Workshop
```typescript
PATCH /api/jockeys/assignments/:id/arrive-workshop
Authorization: Bearer {jockeyToken}

Request Body:
{
  "arrivedAt": "2026-02-03T10:45:00Z",
  "notes": "Vehicle parked in bay 3"
}

Response:
{
  "success": true,
  "data": {
    "assignment": { ... },
    "booking": {
      "id": "...",
      "status": "AT_WORKSHOP"
    }
  }
}

Side Effects:
- Updates JockeyAssignment.arrivedAt
- Changes Booking status: PICKED_UP → AT_WORKSHOP
- Sends notification to workshop
- Sends notification to customer
```

#### B. Workshop: Start Service
```typescript
PATCH /api/workshops/orders/:id/start-service
Authorization: Bearer {workshopToken}

Request Body:
{
  "startedAt": "2026-02-03T11:00:00Z",
  "technicianName": "Hans Mueller"
}

Response:
{
  "success": true,
  "data": {
    "booking": {
      "id": "...",
      "status": "IN_SERVICE"
    }
  }
}

Side Effects:
- Changes Booking status: AT_WORKSHOP → IN_SERVICE
- Sends notification to customer
- Workshop can now create Extensions
```

#### C. Customer: Confirm Delivery
```typescript
PATCH /api/bookings/:id/confirm-delivery
Authorization: Bearer {customerToken}

Request Body:
{
  "confirmedAt": "2026-02-03T18:00:00Z",
  "rating": 5,  // optional
  "feedback": "Excellent service!"  // optional
}

Response:
{
  "success": true,
  "data": {
    "booking": {
      "id": "...",
      "status": "DELIVERED"
    }
  }
}

Side Effects:
- Changes Booking status: RETURNED → DELIVERED
- Triggers review request (if not already provided)
- Archives booking after 24h
```

### 2. Modified Endpoints (existing, to update)

#### A. Complete Jockey Assignment (Pickup)
```typescript
PATCH /api/jockeys/assignments/:id/complete

// OLD BEHAVIOR:
// - Pickup: IN_TRANSIT_TO_WORKSHOP → IN_WORKSHOP
// - Return: IN_TRANSIT_TO_CUSTOMER → DELIVERED

// NEW BEHAVIOR:
// - Pickup: PICKUP_ASSIGNED → PICKED_UP (stop here, not AT_WORKSHOP yet!)
// - Return: RETURN_ASSIGNED → RETURNED (stop here, not DELIVERED yet!)
```

#### B. Workshop Complete Service
```typescript
PATCH /api/workshops/orders/:id/complete

// OLD BEHAVIOR:
// - Changes status: IN_WORKSHOP → COMPLETED

// NEW BEHAVIOR:
// - Validates no pending Extensions
// - Changes status: IN_SERVICE → READY_FOR_RETURN
// - Auto-creates return jockey assignment
// - Captures authorized Extension payments
```

#### C. Create Extension
```typescript
POST /api/workshops/orders/:id/extensions

// NEW VALIDATION:
// - Booking MUST be IN_SERVICE (reject if not)
// - Cannot create Extension if status is AT_WORKSHOP or READY_FOR_RETURN
```

### 3. Demo Mode Endpoints (already exist)

```typescript
// backend/src/routes/demo.routes.ts
POST /api/demo/payment/confirm           // Confirm booking payment
POST /api/demo/extension/authorize       // Authorize extension payment
POST /api/demo/extension/capture         // Capture extension payment
GET /api/demo/payment/:paymentIntentId   // Get payment status
```

---

## Sequence Diagram: Complete Journey

### Full Demo Flow Sequence

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Customer │    │  System │    │  Jockey │    │Workshop │    │ Payment │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │              │
     │ 1. Create    │              │              │              │
     │   Booking    │              │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ 2. Create    │              │              │
     │              │    Payment   │              │              │
     │              │─────────────────────────────────────────>  │
     │              │              │              │              │
     │ 3. Pay with  │              │              │              │
     │   Demo Card  │              │              │              │
     │──────────────────────────────────────────────────────────>│
     │              │              │              │              │
     │              │ 4. Payment   │              │              │
     │              │    Confirmed │              │              │
     │              │<─────────────────────────────────────────  │
     │              │              │              │              │
     │              │ STATUS: CONFIRMED           │              │
     │              │              │              │              │
     │              │ 5. Auto-create              │              │
     │              │    Pickup Assignment        │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │ STATUS: PICKUP_ASSIGNED     │              │
     │              │              │              │              │
     │              │              │ 6. Complete  │              │
     │              │              │    Pickup    │              │
     │              │<─────────────│              │              │
     │              │              │              │              │
     │              │ STATUS: PICKED_UP           │              │
     │              │              │              │              │
     │              │              │ 7. Arrive at │              │
     │              │              │    Workshop  │              │
     │              │<─────────────│              │              │
     │              │              │              │              │
     │              │ STATUS: AT_WORKSHOP         │              │
     │              │              │              │              │
     │              │              │              │ 8. Start     │
     │              │              │              │    Service   │
     │              │<─────────────────────────────│              │
     │              │              │              │              │
     │              │ STATUS: IN_SERVICE          │              │
     │              │              │              │              │
     │              │              │              │ 9. Create    │
     │              │              │              │    Extension │
     │              │<─────────────────────────────│              │
     │              │              │              │              │
     │ 10. Notify   │              │              │              │
     │     Extension│              │              │              │
     │<─────────────│              │              │              │
     │              │              │              │              │
     │ 11. Approve  │              │              │              │
     │     Extension│              │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ 12. Authorize│              │              │
     │              │     Payment  │              │              │
     │              │─────────────────────────────────────────>  │
     │              │              │              │              │
     │              │              │              │ STATUS: IN_SERVICE
     │              │              │              │ (unchanged)  │
     │              │              │              │              │
     │              │              │              │ 13. Complete │
     │              │              │              │     Service  │
     │              │<─────────────────────────────│              │
     │              │              │              │              │
     │              │ 14. Capture  │              │              │
     │              │     Extension│              │              │
     │              │─────────────────────────────────────────>  │
     │              │              │              │              │
     │              │ STATUS: READY_FOR_RETURN    │              │
     │              │              │              │              │
     │              │ 15. Auto-create             │              │
     │              │     Return Assignment       │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │ STATUS: RETURN_ASSIGNED     │              │
     │              │              │              │              │
     │              │              │ 16. Complete │              │
     │              │              │     Return   │              │
     │              │<─────────────│              │              │
     │              │              │              │              │
     │              │ STATUS: RETURNED            │              │
     │              │              │              │              │
     │ 17. Confirm  │              │              │              │
     │     Delivery │              │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ STATUS: DELIVERED (FINAL)   │              │
     │              │              │              │              │
```

### Key Timing for Demo

| Step | Status Change | Demo Action | Expected Duration |
|------|--------------|-------------|-------------------|
| 1-4 | → `CONFIRMED` | Customer books + pays (test card) | 2-3 minutes |
| 5 | → `PICKUP_ASSIGNED` | Automatic (system) | Instant |
| 6 | → `PICKED_UP` | Jockey: Complete pickup | 30 seconds |
| 7 | → `AT_WORKSHOP` | Jockey: Arrive at workshop | 30 seconds |
| 8 | → `IN_SERVICE` | Workshop: Start service | 30 seconds |
| 9 | (no change) | Workshop: Create extension | 1 minute |
| 10-11 | (no change) | Customer: Approve extension | 1 minute |
| 12 | (no change) | System: Authorize payment | Instant |
| 13-14 | → `READY_FOR_RETURN` | Workshop: Complete + capture | 30 seconds |
| 15 | → `RETURN_ASSIGNED` | Automatic (system) | Instant |
| 16 | → `RETURNED` | Jockey: Complete return | 30 seconds |
| 17 | → `DELIVERED` | Customer: Confirm delivery | 30 seconds |

**Total Demo Duration:** ~7-8 minutes (if rehearsed)

---

## Parallel Work Distribution

### Agent Assignments

#### Agent 2: Backend FSM Implementation
**Files to modify:**
- `backend/prisma/schema.prisma` - Update enum
- `backend/src/types/fsm.types.ts` - NEW FILE (FSM logic)
- `backend/src/services/bookings.service.ts` - Add FSM validation
- `backend/prisma/migrations/...` - Create migration

**Deliverables:**
1. FSM transition validator
2. Database migration
3. Unit tests for FSM logic

**Conflict Risk:** LOW (new files + isolated changes)

---

#### Agent 3: Jockey API Updates
**Files to modify:**
- `backend/src/controllers/jockeys.controller.ts` - Update endpoints
- `backend/src/routes/jockeys.routes.ts` - Add new route

**New Endpoints:**
1. `PATCH /api/jockeys/assignments/:id/arrive-workshop`

**Modified Endpoints:**
1. `PATCH /api/jockeys/assignments/:id/complete` - Change status logic

**Deliverables:**
1. Arrive at workshop endpoint
2. Updated complete pickup/return logic
3. API tests

**Conflict Risk:** LOW (isolated to jockey files)

---

#### Agent 4: Workshop API Updates
**Files to modify:**
- `backend/src/controllers/workshops.controller.ts` - Update endpoints
- `backend/src/routes/workshops.routes.ts` - Add new route

**New Endpoints:**
1. `PATCH /api/workshops/orders/:id/start-service`

**Modified Endpoints:**
1. `POST /api/workshops/orders/:id/extensions` - Validate `IN_SERVICE` status
2. `PATCH /api/workshops/orders/:id/complete` - Change status logic + capture payment

**Deliverables:**
1. Start service endpoint
2. Extension validation logic
3. Auto-capture Extension payments on complete
4. API tests

**Conflict Risk:** MEDIUM (bookings.service.ts also touched by Agent 2)

---

#### Agent 5: Frontend Status Display
**Files to modify:**
- `frontend/lib/types/booking.ts` - Update enum
- `frontend/components/customer/BookingCard.tsx` - Update status badges
- `frontend/components/customer/BookingStatusTimeline.tsx` - NEW FILE
- `frontend/app/[locale]/customer/bookings/[id]/page.tsx` - Add timeline

**Deliverables:**
1. Updated status enum
2. New status badge colors/icons
3. Status timeline component (visual)
4. German/English translations

**Conflict Risk:** LOW (frontend only)

---

### Merge Order (Recommended)

1. **Agent 2** merges first (FSM + migration)
2. **Agent 3** + **Agent 4** merge in parallel (independent)
3. **Agent 5** merges last (depends on backend changes)

---

## Acceptance Criteria

### Critical Path: Demo Must Work E2E

✅ **AC1: Complete Booking Flow**
- [ ] Customer can create booking with test card `4242 4242 4242 4242`
- [ ] Booking auto-confirms and changes to `CONFIRMED`
- [ ] Pickup assignment auto-created
- [ ] Status changes to `PICKUP_ASSIGNED`

✅ **AC2: Jockey Pickup Flow**
- [ ] Jockey can complete pickup
- [ ] Status changes: `PICKUP_ASSIGNED` → `PICKED_UP`
- [ ] Jockey can mark arrival at workshop
- [ ] Status changes: `PICKED_UP` → `AT_WORKSHOP`

✅ **AC3: Workshop Service Flow**
- [ ] Workshop can start service
- [ ] Status changes: `AT_WORKSHOP` → `IN_SERVICE`
- [ ] Workshop can create Extension (only when `IN_SERVICE`)
- [ ] Extension creation does NOT change Booking status

✅ **AC4: Extension Approval Flow**
- [ ] Customer receives Extension notification
- [ ] Customer can approve with test card
- [ ] Payment is AUTHORIZED (not captured yet)
- [ ] Extension status: `PENDING` → `APPROVED`
- [ ] Booking status remains `IN_SERVICE`

✅ **AC5: Service Completion Flow**
- [ ] Workshop can complete service
- [ ] System auto-captures authorized Extension payment
- [ ] Status changes: `IN_SERVICE` → `READY_FOR_RETURN`
- [ ] Return assignment auto-created
- [ ] Status changes: `READY_FOR_RETURN` → `RETURN_ASSIGNED`

✅ **AC6: Jockey Return Flow**
- [ ] Jockey can complete return
- [ ] Status changes: `RETURN_ASSIGNED` → `RETURNED`
- [ ] Customer can confirm delivery
- [ ] Status changes: `RETURNED` → `DELIVERED`

✅ **AC7: FSM Validation**
- [ ] Cannot skip status (e.g., `CONFIRMED` → `PICKED_UP` rejected)
- [ ] Cannot create Extension when not `IN_SERVICE`
- [ ] Cannot complete service if Extension is `PENDING`

✅ **AC8: Demo Mode E2E Test**
- [ ] Complete flow runs in <10 minutes
- [ ] All status transitions logged
- [ ] No errors in console
- [ ] All notifications sent

---

## Risk Assessment & Mitigation

### High Risk Items

#### Risk 1: Database Migration Failure
**Impact:** Critical - entire system down
**Probability:** Medium
**Mitigation:**
1. Test migration on staging database first
2. Create backup before migration
3. Have rollback script ready
4. Run migration during low-traffic window

**Rollback Procedure:**
```bash
# Restore from backup
psql $DATABASE_URL < backup_before_migration.sql

# Revert Prisma schema
git checkout HEAD~1 backend/prisma/schema.prisma
npx prisma generate
```

---

#### Risk 2: Conflicting Changes to bookings.service.ts
**Impact:** High - merge conflicts, broken logic
**Probability:** High
**Mitigation:**
1. Agent 2 merges FSM logic first
2. Agents 3 & 4 rebase before implementing
3. Use feature flags for new endpoints during development
4. Comprehensive integration tests

---

#### Risk 3: Extension Payment Capture Fails
**Impact:** High - money not collected, work completed
**Probability:** Low (demo mode), Medium (production)
**Mitigation:**
1. Retry capture 3 times with exponential backoff
2. Log failed captures to separate table
3. Send alert to admin if capture fails
4. Create manual invoice as fallback

**Capture Logic:**
```typescript
async function captureExtensionPayment(extensionId: string): Promise<void> {
  const extension = await prisma.extension.findUnique({ where: { id: extensionId } });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (process.env.DEMO_MODE === 'true') {
        await demoPaymentService.capturePayment(extension.paymentIntentId);
      } else {
        await stripe.paymentIntents.capture(extension.paymentIntentId);
      }

      // Update extension
      await prisma.extension.update({
        where: { id: extensionId },
        data: { paidAt: new Date() }
      });

      return; // Success
    } catch (error) {
      logger.error(`Capture attempt ${attempt} failed for extension ${extensionId}`, error);
      if (attempt < 3) {
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
      } else {
        // Final failure - create manual invoice
        await createManualInvoice(extensionId);
        throw new Error('Payment capture failed after 3 attempts');
      }
    }
  }
}
```

---

#### Risk 4: Frontend Status Not Synced
**Impact:** Medium - confusing UX, wrong status display
**Probability:** Medium
**Mitigation:**
1. Use TypeScript enum shared between frontend/backend
2. Add E2E test that validates status display
3. Real-time status updates via WebSocket (future enhancement)

---

### Medium Risk Items

#### Risk 5: Backwards Compatibility Break
**Impact:** Medium - existing integrations fail
**Probability:** Low (if phase 1 implemented correctly)
**Mitigation:**
1. Keep old enum values for 2 weeks
2. API maps old status → new status automatically
3. Add deprecation warnings to API responses
4. Notify all API consumers before final cutover

---

#### Risk 6: Demo Mode Flag Not Set
**Impact:** Medium - demo fails, or real charges attempted
**Probability:** Low
**Mitigation:**
1. Check `DEMO_MODE` env var in all payment endpoints
2. Add banner on frontend showing "DEMO MODE" when active
3. Log all demo transactions with `[DEMO]` prefix

---

## Testing Strategy

### 1. Unit Tests (Agent 2)

**File:** `backend/src/tests/fsm.test.ts`

```typescript
describe('FSM Transition Logic', () => {
  test('allows valid transitions', () => {
    expect(canTransition('CONFIRMED', 'PICKUP_ASSIGNED')).toBe(true);
    expect(canTransition('PICKED_UP', 'AT_WORKSHOP')).toBe(true);
  });

  test('blocks invalid transitions', () => {
    expect(canTransition('CONFIRMED', 'PICKED_UP')).toBe(false);
    expect(canTransition('AT_WORKSHOP', 'READY_FOR_RETURN')).toBe(false);
  });

  test('allows cancellation from any status', () => {
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransition('IN_SERVICE', 'CANCELLED')).toBe(true);
  });
});

describe('Extension Creation Rules', () => {
  test('allows extension creation when IN_SERVICE', () => {
    const booking = { status: 'IN_SERVICE' };
    expect(canCreateExtension(booking.status)).toBe(true);
  });

  test('blocks extension creation when not IN_SERVICE', () => {
    expect(canCreateExtension('AT_WORKSHOP')).toBe(false);
    expect(canCreateExtension('READY_FOR_RETURN')).toBe(false);
  });
});
```

---

### 2. Integration Tests (Agents 3 & 4)

**File:** `backend/src/tests/booking-flow.integration.test.ts`

```typescript
describe('Complete Booking Flow', () => {
  test('full demo flow with extension', async () => {
    // 1. Create booking
    const booking = await createTestBooking();
    expect(booking.status).toBe('PENDING_PAYMENT');

    // 2. Confirm payment (demo mode)
    await confirmDemoPayment(booking.id);
    expect(await getBookingStatus(booking.id)).toBe('CONFIRMED');

    // 3. Complete pickup
    const pickupAssignment = await getPickupAssignment(booking.id);
    await completePickup(pickupAssignment.id);
    expect(await getBookingStatus(booking.id)).toBe('PICKED_UP');

    // 4. Arrive at workshop
    await arriveAtWorkshop(pickupAssignment.id);
    expect(await getBookingStatus(booking.id)).toBe('AT_WORKSHOP');

    // 5. Start service
    await startService(booking.id);
    expect(await getBookingStatus(booking.id)).toBe('IN_SERVICE');

    // 6. Create extension
    const extension = await createExtension(booking.id, {
      description: 'Brake pads worn',
      items: [{ name: 'Brake pads', price: 189.99, quantity: 1 }]
    });
    expect(extension.status).toBe('PENDING');
    expect(await getBookingStatus(booking.id)).toBe('IN_SERVICE'); // Unchanged

    // 7. Approve extension
    await approveExtension(booking.id, extension.id);
    expect(await getExtensionStatus(extension.id)).toBe('APPROVED');
    expect(await getBookingStatus(booking.id)).toBe('IN_SERVICE'); // Still unchanged

    // 8. Complete service
    await completeService(booking.id);
    expect(await getBookingStatus(booking.id)).toBe('READY_FOR_RETURN');
    expect(await getExtensionPaymentStatus(extension.id)).toBe('CAPTURED');

    // 9. Complete return
    const returnAssignment = await getReturnAssignment(booking.id);
    await completeReturn(returnAssignment.id);
    expect(await getBookingStatus(booking.id)).toBe('RETURNED');

    // 10. Confirm delivery
    await confirmDelivery(booking.id);
    expect(await getBookingStatus(booking.id)).toBe('DELIVERED');
  });
});
```

---

### 3. E2E Test (Playwright)

**File:** `frontend/e2e/01-prio1-complete-flow.spec.ts`

```typescript
test('Prio 1: Complete demo flow with new status', async ({ page }) => {
  // 1. Customer creates booking
  await page.goto('/de/booking');
  await fillVehicleInfo(page, { brand: 'VW', model: 'Golf', year: 2020 });
  await selectServices(page, ['INSPECTION']);
  await fillSchedule(page, { pickupDate: tomorrow(), deliveryDate: dayAfterTomorrow() });
  await fillCustomerInfo(page, testCustomer);
  await page.getByRole('button', { name: 'Jetzt verbindlich buchen' }).click();

  // Pay with test card
  await fillStripeCard(page, '4242424242424242');
  await page.getByRole('button', { name: 'Bezahlen' }).click();

  // 2. Verify status: CONFIRMED
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Bestätigt');
  const bookingId = await page.locator('[data-testid="booking-id"]').textContent();

  // 3. Jockey completes pickup
  await loginAsJockey(page);
  await page.goto('/jockey/dashboard');
  await page.getByRole('button', { name: 'Abholung abschließen' }).click();
  await uploadPickupPhotos(page);
  await collectSignature(page);
  await page.getByRole('button', { name: 'Abschluss bestätigen' }).click();

  // Verify status: PICKED_UP
  await loginAsCustomer(page);
  await page.goto(`/customer/bookings/${bookingId}`);
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Abgeholt');

  // 4. Jockey arrives at workshop
  await loginAsJockey(page);
  await page.getByRole('button', { name: 'In Werkstatt angekommen' }).click();

  // Verify status: AT_WORKSHOP
  await loginAsCustomer(page);
  await page.reload();
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('In Werkstatt');

  // 5. Workshop starts service
  await loginAsWorkshop(page);
  await page.goto('/workshop/dashboard');
  await page.getByText(bookingId).click();
  await page.getByRole('button', { name: 'Service starten' }).click();

  // Verify status: IN_SERVICE
  await loginAsCustomer(page);
  await page.reload();
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Wird bearbeitet');

  // 6. Workshop creates extension
  await loginAsWorkshop(page);
  await page.getByRole('button', { name: 'Erweiterung erstellen' }).click();
  await fillExtension(page, {
    description: 'Bremsbeläge verschlissen',
    items: [{ name: 'Bremsbeläge vorne', price: 189.99, quantity: 1 }]
  });
  await page.getByRole('button', { name: 'An Kunden senden' }).click();

  // 7. Customer approves extension
  await loginAsCustomer(page);
  await page.reload();
  await page.getByRole('tab', { name: 'Erweiterungen' }).click();
  await page.getByRole('button', { name: 'Details anzeigen' }).click();
  await page.getByRole('button', { name: 'Genehmigen & Bezahlen' }).click();
  await fillStripeCard(page, '4242424242424242');
  await page.getByRole('button', { name: 'Bezahlen' }).click();

  // Verify extension approved but booking status unchanged
  await expect(page.locator('[data-testid="extension-status"]')).toHaveText('Genehmigt');
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Wird bearbeitet');

  // 8. Workshop completes service
  await loginAsWorkshop(page);
  await page.getByRole('button', { name: 'Service abschließen' }).click();

  // Verify status: READY_FOR_RETURN
  await loginAsCustomer(page);
  await page.reload();
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Bereit zur Rückgabe');

  // 9. Jockey completes return
  await loginAsJockey(page);
  await page.goto('/jockey/dashboard');
  await page.getByRole('button', { name: 'Rückgabe abschließen' }).click();
  await uploadReturnPhotos(page);
  await collectSignature(page);
  await page.getByRole('button', { name: 'Abschluss bestätigen' }).click();

  // Verify status: RETURNED
  await loginAsCustomer(page);
  await page.reload();
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Zurückgegeben');

  // 10. Customer confirms delivery
  await page.getByRole('button', { name: 'Lieferung bestätigen' }).click();

  // Verify status: DELIVERED
  await expect(page.locator('[data-testid="booking-status"]')).toHaveText('Zugestellt');

  // Verify extension payment captured
  await page.getByRole('tab', { name: 'Erweiterungen' }).click();
  await expect(page.locator('[data-testid="extension-payment-status"]')).toHaveText('Bezahlt');
});
```

---

## Rollout Plan

### Phase 1: Development (Week 1)
**Monday-Wednesday:**
- Agent 2: Implement FSM logic + migration
- Agents 3 & 4: Implement new endpoints in parallel
- Agent 5: Update frontend types and components

**Thursday:**
- Code review all PRs
- Run unit tests + integration tests
- Staging deployment

**Friday:**
- E2E test on staging
- Fix any bugs discovered
- Final code review

---

### Phase 2: Staging Validation (Week 2)
**Monday-Tuesday:**
- QA team runs full demo walkthrough
- Product owner validates flow
- Performance testing

**Wednesday:**
- Bug fixes from QA
- Re-test

**Thursday:**
- Stakeholder demo
- Final approval

---

### Phase 3: Production Rollout (Week 2)
**Friday (low-traffic window):**
1. **T-60min:** Announce maintenance window
2. **T-30min:** Take backup of production database
3. **T-15min:** Deploy backend (new FSM logic)
4. **T-10min:** Run database migration
5. **T-5min:** Deploy frontend
6. **T+0min:** Verify demo flow works in production
7. **T+15min:** Monitor logs for errors
8. **T+30min:** Announce deployment complete

**Rollback Trigger:** If any critical error, immediately restore from backup and revert deployment.

---

## Next Steps

### Immediate Actions (Agent 1 → Product Owner)
1. ✅ Review and approve this plan
2. ✅ Confirm demo flow matches business requirements
3. ✅ Schedule kickoff meeting with Agents 2-5
4. ✅ Create Jira tickets for each agent's work
5. ✅ Set up staging environment for testing

### Agent 2-5: Start Implementation
- **Timeline:** Start Monday, complete by Friday
- **Daily standups:** 10:00 AM (15 minutes)
- **Blocker escalation:** Immediate Slack message to Tech Lead

---

## Appendix A: File Conflict Matrix

| File | Agent 2 | Agent 3 | Agent 4 | Agent 5 | Conflict Risk |
|------|---------|---------|---------|---------|---------------|
| `prisma/schema.prisma` | ✅ | - | - | - | None |
| `types/fsm.types.ts` | ✅ | - | - | - | None (new file) |
| `services/bookings.service.ts` | ✅ | - | ✅ | - | **HIGH** |
| `controllers/jockeys.controller.ts` | - | ✅ | - | - | None |
| `controllers/workshops.controller.ts` | - | - | ✅ | - | None |
| `routes/jockeys.routes.ts` | - | ✅ | - | - | None |
| `routes/workshops.routes.ts` | - | - | ✅ | - | None |
| `frontend/lib/types/booking.ts` | - | - | - | ✅ | None |
| `frontend/components/**` | - | - | - | ✅ | None |

**Conflict Resolution:**
- Agent 2 merges `bookings.service.ts` changes FIRST
- Agent 4 rebases and merges SECOND
- All others can work in parallel

---

## Appendix B: Environment Variables

### Backend (.env)
```bash
# Demo Mode
DEMO_MODE=true

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/b2c_app

# Payment (Demo Mode uses test keys)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Feature Flags
ENABLE_NEW_FSM=true  # Set to false for rollback
```

### Frontend (.env.local)
```bash
# Demo Mode
NEXT_PUBLIC_DEMO_MODE=true

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Payment (Demo Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

---

## Document Control

**Version:** 1.0
**Created:** February 3, 2026
**Author:** Agent 1 (Tech Lead)
**Reviewers:** Agent 2, 3, 4, 5 (pending)
**Status:** DRAFT → REVIEW → APPROVED → IMPLEMENTATION

**Approval Signatures:**
- [ ] Agent 1 (Tech Lead)
- [ ] Product Owner
- [ ] QA Lead

---

**END OF MASTER PLAN**
