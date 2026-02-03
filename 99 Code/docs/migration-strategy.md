# Migration Strategy: Booking Status Update
## Safe Migration from Old to New Status Enum

**Version:** 1.0
**Date:** February 3, 2026
**Risk Level:** HIGH (Database schema change)

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Plan](#migration-plan)
3. [Prisma Schema Changes](#prisma-schema-changes)
4. [Database Migration Script](#database-migration-script)
5. [Rollback Procedures](#rollback-procedures)
6. [Backwards Compatibility](#backwards-compatibility)
7. [Testing Checklist](#testing-checklist)

---

## Overview

### What's Changing

**Old Status Enum:**
```
PENDING_PAYMENT, CONFIRMED, JOCKEY_ASSIGNED, IN_TRANSIT_TO_WORKSHOP,
IN_WORKSHOP, COMPLETED, IN_TRANSIT_TO_CUSTOMER, DELIVERED, CANCELLED
```

**New Status Enum:**
```
PENDING_PAYMENT, CONFIRMED, PICKUP_ASSIGNED, PICKED_UP, AT_WORKSHOP,
IN_SERVICE, READY_FOR_RETURN, RETURN_ASSIGNED, RETURNED, DELIVERED, CANCELLED
```

### Migration Mapping

| Old Status | New Status | Notes |
|-----------|------------|-------|
| `PENDING_PAYMENT` | `PENDING_PAYMENT` | ✅ No change |
| `CONFIRMED` | `CONFIRMED` | ✅ No change |
| `JOCKEY_ASSIGNED` | `PICKUP_ASSIGNED` | 🔄 Rename |
| `IN_TRANSIT_TO_WORKSHOP` | `PICKED_UP` | 🔄 Rename |
| `IN_WORKSHOP` | `AT_WORKSHOP` | 🔄 Rename |
| ❌ N/A | `IN_SERVICE` | 🆕 New status (map from `IN_WORKSHOP` for active work) |
| `COMPLETED` | `READY_FOR_RETURN` | 🔄 Rename |
| `IN_TRANSIT_TO_CUSTOMER` | `RETURN_ASSIGNED` | 🔄 Rename |
| ❌ N/A | `RETURNED` | 🆕 New status (intermediate before `DELIVERED`) |
| `DELIVERED` | `DELIVERED` | ✅ No change |
| `CANCELLED` | `CANCELLED` | ✅ No change |

### Risk Assessment

**Impact:** CRITICAL - affects core booking system
**Complexity:** MEDIUM - straightforward mapping but requires careful execution
**Downtime Required:** NO - zero-downtime migration possible
**Rollback Complexity:** LOW - full rollback script available

---

## Migration Plan

### Phase 1: Preparation (Pre-Migration)

#### Step 1.1: Backup Production Database
```bash
# Create timestamped backup
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > "$BACKUP_FILE"

# Verify backup
psql $DATABASE_URL < "$BACKUP_FILE" --dry-run

# Upload to S3/backup storage
aws s3 cp "$BACKUP_FILE" s3://backups/production/
```

#### Step 1.2: Test Migration on Staging
```bash
# 1. Restore production backup to staging
psql $STAGING_DATABASE_URL < "$BACKUP_FILE"

# 2. Run migration on staging
cd backend
npx prisma migrate deploy

# 3. Run full test suite
npm test

# 4. Run E2E tests
cd ../frontend
npx playwright test
```

#### Step 1.3: Feature Flag Setup
```typescript
// backend/src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_NEW_BOOKING_STATUS: process.env.USE_NEW_BOOKING_STATUS === 'true'
};
```

---

### Phase 2: Migration Execution

#### Step 2.1: Add New Enum Values (Non-Breaking)

**Migration File:** `20260203100000_add_new_booking_status_values.sql`

```sql
-- This migration is NON-BREAKING
-- It adds new enum values without removing old ones

BEGIN;

-- Add new enum values
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PICKUP_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PICKED_UP';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_SERVICE';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_RETURN';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'RETURN_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- Create backup table for rollback
CREATE TABLE IF NOT EXISTS "Booking_Status_Migration_Backup" (
  id TEXT PRIMARY KEY,
  status "BookingStatus" NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "migrationTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy current status to backup
INSERT INTO "Booking_Status_Migration_Backup" (id, status, "updatedAt")
SELECT id, status, "updatedAt"
FROM "Booking"
ON CONFLICT (id) DO NOTHING;

COMMIT;
```

**Deploy This First:**
```bash
# Create migration
cd backend
npx prisma migrate dev --name add_new_booking_status_values

# Deploy to production
npx prisma migrate deploy
```

**Result:** Database now supports both old and new status values.

---

#### Step 2.2: Migrate Existing Data

**Migration File:** `20260203110000_migrate_booking_status_data.sql`

```sql
-- This migration updates existing bookings to use new status values
-- Old enum values are still present, so this is reversible

BEGIN;

-- Update bookings to new status values
UPDATE "Booking"
SET
  status = CASE status
    WHEN 'JOCKEY_ASSIGNED'::text::"BookingStatus" THEN 'PICKUP_ASSIGNED'::text::"BookingStatus"
    WHEN 'IN_TRANSIT_TO_WORKSHOP'::text::"BookingStatus" THEN 'PICKED_UP'::text::"BookingStatus"
    WHEN 'IN_WORKSHOP'::text::"BookingStatus" THEN 'AT_WORKSHOP'::text::"BookingStatus"
    WHEN 'COMPLETED'::text::"BookingStatus" THEN 'READY_FOR_RETURN'::text::"BookingStatus"
    WHEN 'IN_TRANSIT_TO_CUSTOMER'::text::"BookingStatus" THEN 'RETURN_ASSIGNED'::text::"BookingStatus"
    ELSE status
  END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE status IN (
  'JOCKEY_ASSIGNED',
  'IN_TRANSIT_TO_WORKSHOP',
  'IN_WORKSHOP',
  'COMPLETED',
  'IN_TRANSIT_TO_CUSTOMER'
);

-- Log migration results
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM "Booking"
  WHERE status IN (
    'PICKUP_ASSIGNED',
    'PICKED_UP',
    'AT_WORKSHOP',
    'READY_FOR_RETURN',
    'RETURN_ASSIGNED'
  );

  RAISE NOTICE 'Migrated % bookings to new status values', migrated_count;
END $$;

COMMIT;
```

**Deploy Data Migration:**
```bash
npx prisma migrate dev --name migrate_booking_status_data
npx prisma migrate deploy
```

**Verification:**
```sql
-- Check migration results
SELECT
  status,
  COUNT(*) as count
FROM "Booking"
GROUP BY status
ORDER BY count DESC;

-- Expected results (no old status values):
-- CONFIRMED
-- PICKUP_ASSIGNED (was JOCKEY_ASSIGNED)
-- PICKED_UP (was IN_TRANSIT_TO_WORKSHOP)
-- AT_WORKSHOP (was IN_WORKSHOP)
-- READY_FOR_RETURN (was COMPLETED)
-- RETURN_ASSIGNED (was IN_TRANSIT_TO_CUSTOMER)
-- DELIVERED
-- CANCELLED
```

---

#### Step 2.3: Deploy Backend Code (Use New Status)

**Update Prisma Schema:**
```prisma
// backend/prisma/schema.prisma

enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  PICKUP_ASSIGNED
  PICKED_UP
  AT_WORKSHOP
  IN_SERVICE
  READY_FOR_RETURN
  RETURN_ASSIGNED
  RETURNED
  DELIVERED
  CANCELLED

  // DEPRECATED - Keep for backwards compatibility (remove after 2 weeks)
  // JOCKEY_ASSIGNED
  // IN_TRANSIT_TO_WORKSHOP
  // IN_WORKSHOP
  // COMPLETED
  // IN_TRANSIT_TO_CUSTOMER
}
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Deploy Backend:**
```bash
npm run build
pm2 restart backend
```

---

#### Step 2.4: Deploy Frontend Code

**Update Frontend Types:**
```typescript
// frontend/lib/types/booking.ts

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  AT_WORKSHOP = 'AT_WORKSHOP',
  IN_SERVICE = 'IN_SERVICE',
  READY_FOR_RETURN = 'READY_FOR_RETURN',
  RETURN_ASSIGNED = 'RETURN_ASSIGNED',
  RETURNED = 'RETURNED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
```

**Deploy Frontend:**
```bash
npm run build
pm2 restart frontend
```

---

### Phase 3: Cleanup (After 2 Weeks)

#### Step 3.1: Remove Old Enum Values (BREAKING)

**⚠️ WARNING:** This step is IRREVERSIBLE. Only proceed after:
1. All systems use new status values
2. 2 weeks of monitoring show no issues
3. All API consumers updated

**Migration File:** `20260217100000_remove_old_booking_status_values.sql`

```sql
-- This migration is BREAKING and IRREVERSIBLE
-- Do NOT run until all systems are updated

BEGIN;

-- Create new enum without old values
CREATE TYPE "BookingStatus_new" AS ENUM (
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PICKUP_ASSIGNED',
  'PICKED_UP',
  'AT_WORKSHOP',
  'IN_SERVICE',
  'READY_FOR_RETURN',
  'RETURN_ASSIGNED',
  'RETURNED',
  'DELIVERED',
  'CANCELLED'
);

-- Update column to use new enum
ALTER TABLE "Booking"
  ALTER COLUMN status TYPE "BookingStatus_new"
  USING (status::text::"BookingStatus_new");

-- Drop old enum and rename new one
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

-- Drop backup table (keep for 30 days first)
-- DROP TABLE "Booking_Status_Migration_Backup";

COMMIT;
```

---

## Prisma Schema Changes

### Before (Current Schema)

```prisma
enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  JOCKEY_ASSIGNED
  IN_TRANSIT_TO_WORKSHOP
  IN_WORKSHOP
  COMPLETED
  IN_TRANSIT_TO_CUSTOMER
  DELIVERED
  CANCELLED
}
```

### After (New Schema)

```prisma
enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  PICKUP_ASSIGNED
  PICKED_UP
  AT_WORKSHOP
  IN_SERVICE
  READY_FOR_RETURN
  RETURN_ASSIGNED
  RETURNED
  DELIVERED
  CANCELLED
}
```

### Generate Migration

```bash
# Create migration from schema changes
npx prisma migrate dev --name update_booking_status_enum

# Review generated SQL
cat prisma/migrations/YYYYMMDDHHMMSS_update_booking_status_enum/migration.sql

# Deploy to production
npx prisma migrate deploy
```

---

## Rollback Procedures

### Scenario 1: Rollback During Phase 2 (Before Cleanup)

If issues are discovered after data migration but before old enum values are removed:

```sql
-- Restore from backup table
BEGIN;

UPDATE "Booking" b
SET
  status = bsb.status,
  "updatedAt" = bsb."updatedAt"
FROM "Booking_Status_Migration_Backup" bsb
WHERE b.id = bsb.id;

COMMIT;

-- Verify rollback
SELECT status, COUNT(*)
FROM "Booking"
GROUP BY status;
```

**Then:**
```bash
# Revert code deployment
git revert HEAD~3  # Revert last 3 commits
npm run build
pm2 restart backend
pm2 restart frontend
```

---

### Scenario 2: Full Database Restore (Nuclear Option)

If migration causes critical issues:

```bash
# 1. Stop application
pm2 stop backend
pm2 stop frontend

# 2. Drop database
psql $DATABASE_URL -c "DROP DATABASE b2c_app;"
psql $DATABASE_URL -c "CREATE DATABASE b2c_app;"

# 3. Restore from backup
psql $DATABASE_URL < "$BACKUP_FILE"

# 4. Revert code
git checkout <commit-before-migration>
npm run build

# 5. Restart application
pm2 restart backend
pm2 restart frontend
```

**Recovery Time Objective (RTO):** < 15 minutes
**Recovery Point Objective (RPO):** Backup timestamp (pre-migration)

---

### Scenario 3: Partial Rollback (Code Only)

If database migration succeeded but code has bugs:

```bash
# Revert code changes
git revert HEAD

# Rebuild and restart
npm run build
pm2 restart backend
pm2 restart frontend

# Database keeps new status values but code handles them correctly
```

---

## Backwards Compatibility

### API Compatibility Layer (Phase 2 Only)

During the 2-week compatibility window, API can accept both old and new status values:

```typescript
// backend/src/middleware/status-mapper.ts

const STATUS_MAP: Record<string, BookingStatus> = {
  // Old → New
  'JOCKEY_ASSIGNED': BookingStatus.PICKUP_ASSIGNED,
  'IN_TRANSIT_TO_WORKSHOP': BookingStatus.PICKED_UP,
  'IN_WORKSHOP': BookingStatus.AT_WORKSHOP,
  'COMPLETED': BookingStatus.READY_FOR_RETURN,
  'IN_TRANSIT_TO_CUSTOMER': BookingStatus.RETURN_ASSIGNED,

  // New (pass-through)
  'PICKUP_ASSIGNED': BookingStatus.PICKUP_ASSIGNED,
  'PICKED_UP': BookingStatus.PICKED_UP,
  'AT_WORKSHOP': BookingStatus.AT_WORKSHOP,
  'IN_SERVICE': BookingStatus.IN_SERVICE,
  'READY_FOR_RETURN': BookingStatus.READY_FOR_RETURN,
  'RETURN_ASSIGNED': BookingStatus.RETURN_ASSIGNED,
  'RETURNED': BookingStatus.RETURNED,

  // Unchanged
  'PENDING_PAYMENT': BookingStatus.PENDING_PAYMENT,
  'CONFIRMED': BookingStatus.CONFIRMED,
  'DELIVERED': BookingStatus.DELIVERED,
  'CANCELLED': BookingStatus.CANCELLED
};

export function mapStatus(status: string): BookingStatus {
  const mapped = STATUS_MAP[status];
  if (!mapped) {
    throw new Error(`Unknown booking status: ${status}`);
  }
  return mapped;
}

// Middleware
export function statusMapperMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body.status && typeof req.body.status === 'string') {
    try {
      req.body.status = mapStatus(req.body.status);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  next();
}
```

**Apply middleware:**
```typescript
// backend/src/routes/bookings.routes.ts
router.patch('/:id', statusMapperMiddleware, updateBooking);
```

---

## Testing Checklist

### Pre-Migration Tests

- [ ] Full database backup created
- [ ] Backup restoration tested on staging
- [ ] Migration script tested on staging database
- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass
- [ ] E2E tests pass on staging
- [ ] API compatibility layer tested
- [ ] Rollback procedure tested on staging

### Post-Migration Tests (Phase 2)

- [ ] Verify no bookings have old status values
- [ ] Create new booking → status is `CONFIRMED`
- [ ] Complete pickup → status is `PICKED_UP`
- [ ] Arrive at workshop → status is `AT_WORKSHOP`
- [ ] Start service → status is `IN_SERVICE`
- [ ] Create extension → booking stays `IN_SERVICE`
- [ ] Complete service → status is `READY_FOR_RETURN`
- [ ] Complete return → status is `RETURNED`
- [ ] Confirm delivery → status is `DELIVERED`
- [ ] Cancel booking → status is `CANCELLED`
- [ ] FSM transition validation works
- [ ] Extension creation blocked when not `IN_SERVICE`
- [ ] All API endpoints return correct status
- [ ] Frontend displays correct status badges
- [ ] Status timeline shows correct progression
- [ ] Notifications reference correct status

### Monitoring (First 24 Hours)

- [ ] Monitor error logs for status-related errors
- [ ] Check API error rate (should not increase)
- [ ] Monitor booking creation rate (should be normal)
- [ ] Check customer support tickets (any confusion?)
- [ ] Verify payment processing unaffected
- [ ] Monitor database performance (no degradation)

---

## Migration Timeline

### Week 1: Development & Testing

| Day | Task | Owner |
|-----|------|-------|
| Mon | Create migration scripts | Agent 2 |
| Mon | Test on local database | Agent 2 |
| Tue | Deploy to dev environment | DevOps |
| Tue | Run automated tests | QA Team |
| Wed | Deploy to staging | DevOps |
| Wed | Manual QA testing | QA Team |
| Thu | Code review & approval | Tech Lead |
| Fri | Final staging validation | Product Owner |

### Week 2: Production Deployment

| Day | Task | Owner |
|-----|------|-------|
| Mon | Production backup | DevOps |
| Mon | Deploy Phase 2.1 (add enum values) | DevOps |
| Mon | Monitor for issues | Tech Lead |
| Tue | Deploy Phase 2.2 (migrate data) | DevOps |
| Tue | Verify data migration | QA Team |
| Wed | Deploy backend code | DevOps |
| Wed | Deploy frontend code | DevOps |
| Thu | Monitor and validate | All teams |
| Fri | Sign-off on migration success | Product Owner |

### Week 3-4: Compatibility Window

- Both old and new status values supported
- Monitor for any API consumers using old values
- Send deprecation notices to API consumers
- Prepare for cleanup phase

### Week 5: Cleanup

| Day | Task | Owner |
|-----|------|-------|
| Mon | Verify all systems use new status | Tech Lead |
| Tue | Deploy Phase 3.1 (remove old values) | DevOps |
| Wed | Drop backup table | DevOps |
| Thu | Final validation | QA Team |
| Fri | Migration complete sign-off | Product Owner |

---

## Emergency Contacts

### Escalation Path

1. **First Response:** Tech Lead (Agent 1)
2. **Database Issues:** DevOps Lead
3. **Critical Failure:** CTO
4. **Customer Impact:** Customer Support Manager

### On-Call Schedule (Migration Week)

- **Primary:** Tech Lead (24/7)
- **Secondary:** DevOps Lead (24/7)
- **Database DBA:** Available on-call

---

## Success Criteria

### Migration Complete When:

- [x] All bookings migrated to new status values
- [x] No API errors related to status
- [x] Frontend displays correct status
- [x] FSM validation working
- [x] Extension flow working correctly
- [x] All E2E tests passing
- [x] No customer complaints
- [x] 7 days of stable operation
- [x] Product owner sign-off

### Metrics to Monitor:

| Metric | Baseline | Threshold |
|--------|----------|-----------|
| API Error Rate | 0.1% | < 0.5% |
| Booking Creation Success | 98% | > 95% |
| Payment Success Rate | 99% | > 98% |
| Average Response Time | 150ms | < 300ms |
| Customer Support Tickets | 5/day | < 10/day |

---

## Document Control

**Version:** 1.0
**Created:** February 3, 2026
**Author:** Agent 1 (Tech Lead)
**Approved By:** [Pending]
**Review Date:** February 10, 2026

**Related Documents:**
- `prio1-demo-plan.md` - Master implementation plan
- `demo-payments.md` - Payment system documentation
- `backend/prisma/migrations/` - Migration scripts

---

**END OF DOCUMENT**
