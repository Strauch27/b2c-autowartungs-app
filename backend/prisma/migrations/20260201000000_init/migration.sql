-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'IN_WORKSHOP', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('INSPECTION', 'OIL_SERVICE', 'BRAKE_SERVICE', 'TUV', 'CLIMATE_SERVICE');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BOOKING', 'FINDING', 'REFUND');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConciergeStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "JockeyStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT,
    "street" TEXT,
    "zip" TEXT,
    "city" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "licensePlate" TEXT,
    "vin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceMatrix" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearFrom" INTEGER NOT NULL,
    "yearTo" INTEGER NOT NULL,
    "inspection30k" DECIMAL(10,2),
    "inspection60k" DECIMAL(10,2),
    "inspection90k" DECIMAL(10,2),
    "inspection120k" DECIMAL(10,2),
    "oilService" DECIMAL(10,2),
    "brakeServiceFront" DECIMAL(10,2),
    "brakeServiceRear" DECIMAL(10,2),
    "tuv" DECIMAL(10,2),
    "climateService" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "mileageAtBooking" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "pickupSlotStart" TIMESTAMP(3) NOT NULL,
    "pickupSlotEnd" TIMESTAMP(3) NOT NULL,
    "deliverySlotStart" TIMESTAMP(3),
    "deliverySlotEnd" TIMESTAMP(3),
    "pickupAddress" JSONB NOT NULL,
    "deliveryAddress" JSONB,
    "stripePaymentId" TEXT,
    "odooOrderId" INTEGER,
    "jockeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "stripeStatus" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "paymentType" "PaymentType" NOT NULL DEFAULT 'BOOKING',
    "findingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[],
    "price" DECIMAL(10,2) NOT NULL,
    "status" "FindingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConciergeBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "pickupJockeyId" TEXT,
    "pickupStatus" "ConciergeStatus" NOT NULL DEFAULT 'SCHEDULED',
    "pickupCompletedAt" TIMESTAMP(3),
    "deliveryJockeyId" TEXT,
    "deliveryStatus" "ConciergeStatus" NOT NULL DEFAULT 'SCHEDULED',
    "deliveryCompletedAt" TIMESTAMP(3),
    "replacementCarId" TEXT,
    "handoverPhotos" TEXT[],
    "handoverSignature" TEXT,
    "handoverNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConciergeBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "openingHours" JSONB NOT NULL,
    "maxDailySlots" INTEGER NOT NULL DEFAULT 16,
    "status" "WorkshopStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jockey" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "status" "JockeyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jockey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeStart" TIMESTAMP(3) NOT NULL,
    "timeEnd" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 4,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementCar" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" "CarStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplacementCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Vehicle_customerId_idx" ON "Vehicle"("customerId");

-- CreateIndex
CREATE INDEX "Vehicle_brand_model_idx" ON "Vehicle"("brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "PriceMatrix_brand_model_yearFrom_yearTo_key" ON "PriceMatrix"("brand", "model", "yearFrom", "yearTo");

-- CreateIndex
CREATE INDEX "PriceMatrix_brand_model_idx" ON "PriceMatrix"("brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_workshopId_idx" ON "Booking"("workshopId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_pickupSlotStart_idx" ON "Booking"("pickupSlotStart");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentId_idx" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Finding_bookingId_idx" ON "Finding"("bookingId");

-- CreateIndex
CREATE INDEX "Finding_status_idx" ON "Finding"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ConciergeBooking_bookingId_key" ON "ConciergeBooking"("bookingId");

-- CreateIndex
CREATE INDEX "ConciergeBooking_bookingId_idx" ON "ConciergeBooking"("bookingId");

-- CreateIndex
CREATE INDEX "ConciergeBooking_pickupJockeyId_idx" ON "ConciergeBooking"("pickupJockeyId");

-- CreateIndex
CREATE INDEX "ConciergeBooking_deliveryJockeyId_idx" ON "ConciergeBooking"("deliveryJockeyId");

-- CreateIndex
CREATE INDEX "Workshop_status_idx" ON "Workshop"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Jockey_username_key" ON "Jockey"("username");

-- CreateIndex
CREATE INDEX "Jockey_workshopId_idx" ON "Jockey"("workshopId");

-- CreateIndex
CREATE INDEX "Jockey_status_idx" ON "Jockey"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Slot_workshopId_date_timeStart_key" ON "Slot"("workshopId", "date", "timeStart");

-- CreateIndex
CREATE INDEX "Slot_workshopId_date_idx" ON "Slot"("workshopId", "date");

-- CreateIndex
CREATE INDEX "Slot_available_idx" ON "Slot"("available");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementCar_licensePlate_key" ON "ReplacementCar"("licensePlate");

-- CreateIndex
CREATE INDEX "ReplacementCar_status_idx" ON "ReplacementCar"("status");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_jockeyId_fkey" FOREIGN KEY ("jockeyId") REFERENCES "Jockey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeBooking" ADD CONSTRAINT "ConciergeBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeBooking" ADD CONSTRAINT "ConciergeBooking_pickupJockeyId_fkey" FOREIGN KEY ("pickupJockeyId") REFERENCES "Jockey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeBooking" ADD CONSTRAINT "ConciergeBooking_deliveryJockeyId_fkey" FOREIGN KEY ("deliveryJockeyId") REFERENCES "Jockey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeBooking" ADD CONSTRAINT "ConciergeBooking_replacementCarId_fkey" FOREIGN KEY ("replacementCarId") REFERENCES "ReplacementCar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jockey" ADD CONSTRAINT "Jockey_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
