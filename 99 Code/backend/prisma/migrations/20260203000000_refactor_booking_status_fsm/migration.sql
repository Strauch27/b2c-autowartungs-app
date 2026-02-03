-- Migration: Refactor Booking Status for FSM
-- This migration adds new booking statuses to support a more granular FSM
-- while maintaining backward compatibility with deprecated statuses.

-- Step 1: Add new enum values to BookingStatus
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PICKUP_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PICKED_UP';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AT_WORKSHOP';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_SERVICE';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_RETURN';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'RETURN_ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- Step 2: Create a mapping table for status migration (optional, for data migration)
-- This helps track which old statuses should map to which new statuses
-- JOCKEY_ASSIGNED → PICKUP_ASSIGNED
-- IN_TRANSIT_TO_WORKSHOP → PICKED_UP
-- IN_WORKSHOP → AT_WORKSHOP (or IN_SERVICE depending on context)
-- COMPLETED → READY_FOR_RETURN
-- IN_TRANSIT_TO_CUSTOMER → RETURNED (or RETURN_ASSIGNED)

-- Step 3: Migrate existing booking statuses (if needed)
-- NOTE: This is commented out by default. Uncomment and adjust as needed for production.
-- UPDATE "Booking" SET status = 'PICKUP_ASSIGNED' WHERE status = 'JOCKEY_ASSIGNED';
-- UPDATE "Booking" SET status = 'PICKED_UP' WHERE status = 'IN_TRANSIT_TO_WORKSHOP';
-- UPDATE "Booking" SET status = 'AT_WORKSHOP' WHERE status = 'IN_WORKSHOP';
-- UPDATE "Booking" SET status = 'READY_FOR_RETURN' WHERE status = 'COMPLETED';
-- UPDATE "Booking" SET status = 'RETURNED' WHERE status = 'IN_TRANSIT_TO_CUSTOMER';

-- Step 4: Add comments for deprecated statuses (PostgreSQL supports comments)
COMMENT ON TYPE "BookingStatus" IS 'Booking status enum with FSM support. Deprecated: JOCKEY_ASSIGNED (use PICKUP_ASSIGNED), IN_TRANSIT_TO_WORKSHOP (use PICKED_UP), IN_WORKSHOP (use AT_WORKSHOP or IN_SERVICE), COMPLETED (use READY_FOR_RETURN), IN_TRANSIT_TO_CUSTOMER (use RETURN_ASSIGNED or RETURNED)';

-- Step 5: Create index for faster status queries if not exists
-- (Prisma already creates this, but adding for safety)
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");

-- This migration is REVERSIBLE via:
-- Simply keep the old enum values - they remain available.
-- To fully reverse, you would need to:
-- 1. Map new statuses back to old ones in application code
-- 2. Update all bookings to use old statuses
-- 3. Remove new enum values (requires rebuilding the enum type)
