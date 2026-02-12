-- ============================================================================
-- Analytics Views Migration
-- Creates database views for efficient analytics queries
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Daily Booking Statistics View
-- Aggregates bookings by day for trend analysis
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "DailyBookingStats" AS
SELECT
  DATE(b."createdAt") AS booking_date,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE b."status" = 'CONFIRMED') AS confirmed_bookings,
  COUNT(*) FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED')) AS completed_bookings,
  COUNT(*) FILTER (WHERE b."status" = 'CANCELLED') AS cancelled_bookings,
  SUM(b."totalPrice") AS total_revenue,
  SUM(b."totalPrice") FILTER (WHERE b."paidAt" IS NOT NULL) AS paid_revenue,
  AVG(b."totalPrice") AS avg_booking_value,
  b."serviceType"
FROM "Booking" b
GROUP BY DATE(b."createdAt"), b."serviceType"
ORDER BY booking_date DESC;

-- ----------------------------------------------------------------------------
-- 2. Monthly Revenue View
-- Aggregates revenue by month and service type
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "MonthlyRevenue" AS
SELECT
  DATE_TRUNC('month', b."createdAt") AS revenue_month,
  COUNT(*) AS total_bookings,
  SUM(b."totalPrice") AS total_revenue,
  SUM(b."totalPrice") FILTER (WHERE b."paidAt" IS NOT NULL) AS paid_revenue,
  SUM(b."totalPrice") FILTER (WHERE b."paidAt" IS NULL AND b."status" != 'CANCELLED') AS pending_revenue,
  AVG(b."totalPrice") AS avg_order_value,
  b."serviceType"
FROM "Booking" b
GROUP BY DATE_TRUNC('month', b."createdAt"), b."serviceType"
ORDER BY revenue_month DESC;

-- ----------------------------------------------------------------------------
-- 3. Customer Lifetime Value View
-- Calculates total value per customer
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "CustomerLifetimeValue" AS
SELECT
  b."customerId",
  u."email" AS customer_email,
  u."firstName",
  u."lastName",
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE b."paidAt" IS NOT NULL) AS paid_bookings,
  SUM(b."totalPrice") AS lifetime_value,
  SUM(b."totalPrice") FILTER (WHERE b."paidAt" IS NOT NULL) AS paid_lifetime_value,
  AVG(b."totalPrice") AS avg_booking_value,
  MIN(b."createdAt") AS first_booking_date,
  MAX(b."createdAt") AS last_booking_date,
  EXTRACT(EPOCH FROM (MAX(b."createdAt") - MIN(b."createdAt"))) / 86400 AS customer_lifetime_days
FROM "Booking" b
INNER JOIN "User" u ON b."customerId" = u."id"
GROUP BY b."customerId", u."email", u."firstName", u."lastName"
ORDER BY lifetime_value DESC;

-- ----------------------------------------------------------------------------
-- 4. Jockey Performance View
-- Tracks jockey metrics and performance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "JockeyPerformance" AS
SELECT
  j."id" AS jockey_id,
  j."email" AS jockey_email,
  j."firstName",
  j."lastName",
  jp."rating",
  jp."isAvailable",
  COUNT(b."id") AS total_assignments,
  COUNT(b."id") FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED')) AS completed_assignments,
  COUNT(b."id") FILTER (WHERE b."status" = 'CANCELLED') AS cancelled_assignments,
  ROUND(
    COUNT(b."id") FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED'))::numeric /
    NULLIF(COUNT(b."id"), 0) * 100,
    2
  ) AS completion_rate,
  SUM(b."totalPrice") FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED')) AS total_revenue_generated,
  AVG(b."totalPrice") AS avg_booking_value
FROM "User" j
INNER JOIN "JockeyProfile" jp ON j."id" = jp."userId"
LEFT JOIN "Booking" b ON j."id" = b."jockeyId"
WHERE j."role" = 'JOCKEY' AND j."isActive" = true
GROUP BY j."id", j."email", j."firstName", j."lastName", jp."rating", jp."isAvailable"
ORDER BY completed_assignments DESC;

-- ----------------------------------------------------------------------------
-- 5. Workshop Performance View
-- Tracks workshop utilization and performance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "WorkshopPerformance" AS
SELECT
  w."id" AS workshop_id,
  wp."workshopName",
  wp."city",
  wp."capacity",
  COUNT(ts."id") AS total_slots,
  COUNT(ts."id") FILTER (WHERE ts."isAvailable" = true) AS available_slots,
  COUNT(ts."id") FILTER (WHERE ts."currentBookings" > 0) AS booked_slots,
  ROUND(
    COUNT(ts."id") FILTER (WHERE ts."currentBookings" > 0)::numeric /
    NULLIF(COUNT(ts."id"), 0) * 100,
    2
  ) AS utilization_rate,
  SUM(ts."currentBookings") AS total_current_bookings,
  SUM(ts."maxCapacity") AS total_max_capacity
FROM "User" w
INNER JOIN "WorkshopProfile" wp ON w."id" = wp."userId"
LEFT JOIN "TimeSlot" ts ON wp."id" = ts."workshopUserId"
WHERE w."role" = 'WORKSHOP' AND w."isActive" = true
GROUP BY w."id", wp."workshopName", wp."city", wp."capacity"
ORDER BY utilization_rate DESC;

-- ----------------------------------------------------------------------------
-- 6. Service Type Performance View
-- Analyzes performance by service type
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "ServiceTypePerformance" AS
SELECT
  b."serviceType",
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED')) AS completed_bookings,
  COUNT(*) FILTER (WHERE b."status" = 'CANCELLED') AS cancelled_bookings,
  ROUND(
    COUNT(*) FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED'))::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS completion_rate,
  SUM(b."totalPrice") AS total_revenue,
  SUM(b."totalPrice") FILTER (WHERE b."paidAt" IS NOT NULL) AS paid_revenue,
  AVG(b."totalPrice") AS avg_price,
  MIN(b."totalPrice") AS min_price,
  MAX(b."totalPrice") AS max_price
FROM "Booking" b
GROUP BY b."serviceType"
ORDER BY total_revenue DESC;

-- ----------------------------------------------------------------------------
-- 7. User Retention Metrics View
-- Tracks user activity and retention
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "UserRetentionMetrics" AS
SELECT
  DATE_TRUNC('month', u."createdAt") AS signup_month,
  COUNT(*) AS users_signed_up,
  COUNT(*) FILTER (WHERE u."lastLoginAt" >= CURRENT_DATE - INTERVAL '30 days') AS active_last_30_days,
  COUNT(*) FILTER (WHERE u."lastLoginAt" >= CURRENT_DATE - INTERVAL '90 days') AS active_last_90_days,
  ROUND(
    COUNT(*) FILTER (WHERE u."lastLoginAt" >= CURRENT_DATE - INTERVAL '30 days')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS retention_30_days,
  ROUND(
    COUNT(*) FILTER (WHERE u."lastLoginAt" >= CURRENT_DATE - INTERVAL '90 days')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS retention_90_days,
  u."role"
FROM "User" u
WHERE u."isActive" = true
GROUP BY DATE_TRUNC('month', u."createdAt"), u."role"
ORDER BY signup_month DESC;

-- ----------------------------------------------------------------------------
-- 8. Booking Funnel View
-- Tracks conversion through booking stages
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW "BookingFunnel" AS
SELECT
  DATE(b."createdAt") AS booking_date,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE b."status" = 'PENDING_PAYMENT') AS pending_payment,
  COUNT(*) FILTER (WHERE b."status" = 'CONFIRMED') AS confirmed,
  COUNT(*) FILTER (WHERE b."status" = 'JOCKEY_ASSIGNED') AS jockey_assigned,
  COUNT(*) FILTER (WHERE b."status" = 'IN_TRANSIT_TO_WORKSHOP') AS in_transit_to_workshop,
  COUNT(*) FILTER (WHERE b."status" = 'IN_WORKSHOP') AS in_workshop,
  COUNT(*) FILTER (WHERE b."status" = 'COMPLETED') AS completed,
  COUNT(*) FILTER (WHERE b."status" = 'IN_TRANSIT_TO_CUSTOMER') AS in_transit_to_customer,
  COUNT(*) FILTER (WHERE b."status" = 'RETURNED') AS delivered,
  COUNT(*) FILTER (WHERE b."status" = 'CANCELLED') AS cancelled,
  ROUND(
    COUNT(*) FILTER (WHERE b."status" IN ('COMPLETED', 'RETURNED'))::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS conversion_rate
FROM "Booking" b
GROUP BY DATE(b."createdAt")
ORDER BY booking_date DESC;

-- ----------------------------------------------------------------------------
-- Create indexes for better view performance
-- ----------------------------------------------------------------------------

-- Index on booking createdAt for date-based queries
CREATE INDEX IF NOT EXISTS "idx_booking_created_at_date" ON "Booking" (DATE("createdAt"));

-- Index on booking status for filtering
CREATE INDEX IF NOT EXISTS "idx_booking_status_created_at" ON "Booking" ("status", "createdAt");

-- Index on booking paidAt for revenue queries
CREATE INDEX IF NOT EXISTS "idx_booking_paid_at" ON "Booking" ("paidAt") WHERE "paidAt" IS NOT NULL;

-- Index on user lastLoginAt for retention queries
CREATE INDEX IF NOT EXISTS "idx_user_last_login_at" ON "User" ("lastLoginAt") WHERE "lastLoginAt" IS NOT NULL;

-- Index on booking customerId and createdAt for customer analytics
CREATE INDEX IF NOT EXISTS "idx_booking_customer_created_at" ON "Booking" ("customerId", "createdAt");

-- Composite index on jockey assignments
CREATE INDEX IF NOT EXISTS "idx_booking_jockey_status" ON "Booking" ("jockeyId", "status") WHERE "jockeyId" IS NOT NULL;

-- Index on TimeSlot for workshop analytics
CREATE INDEX IF NOT EXISTS "idx_timeslot_workshop_date" ON "TimeSlot" ("workshopUserId", "date", "isAvailable");

-- ============================================================================
-- Grant permissions (adjust as needed for your security model)
-- ============================================================================

-- GRANT SELECT ON "DailyBookingStats" TO analytics_user;
-- GRANT SELECT ON "MonthlyRevenue" TO analytics_user;
-- GRANT SELECT ON "CustomerLifetimeValue" TO analytics_user;
-- GRANT SELECT ON "JockeyPerformance" TO analytics_user;
-- GRANT SELECT ON "WorkshopPerformance" TO analytics_user;
-- GRANT SELECT ON "ServiceTypePerformance" TO analytics_user;
-- GRANT SELECT ON "UserRetentionMetrics" TO analytics_user;
-- GRANT SELECT ON "BookingFunnel" TO analytics_user;
