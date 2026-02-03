# Booking API Documentation

Complete documentation for the Customer Booking API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Create Booking](#create-booking)
  - [List Bookings](#list-bookings)
  - [Get Booking](#get-booking)
  - [Update Booking](#update-booking)
  - [Cancel Booking](#cancel-booking)
  - [Get Booking Status](#get-booking-status)
  - [Extensions](#extensions)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Business Logic](#business-logic)

## Overview

The Booking API enables customers to create, manage, and track vehicle maintenance bookings. The API handles the complete booking lifecycle from creation to delivery, including payment processing, status tracking, and service extensions.

### Base URL

```
https://api.b2c-autowartung.de/api/bookings
```

### Features

- Booking creation with automatic price calculation
- Integrated payment processing via Stripe
- Real-time status tracking
- Service extension requests and approvals
- Email and push notifications
- Automatic refund processing for cancellations

## Authentication

All booking endpoints require authentication via JWT token.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Required Role:** `CUSTOMER`

## Endpoints

### Create Booking

Create a new vehicle maintenance booking with automatic price calculation and payment intent creation.

**Endpoint:** `POST /api/bookings`

**Request Body:**
```json
{
  "vehicleId": "clxy123abc",
  "serviceType": "INSPECTION",
  "pickupDate": "2026-03-15T00:00:00Z",
  "pickupTimeSlot": "08:00-10:00",
  "pickupAddress": "Hauptstraße 1",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115",
  "customerNotes": "Bitte vorsichtig fahren" // Optional
}
```

**Service Types:**
- `INSPECTION` - Inspektion
- `OIL_SERVICE` - Ölwechsel
- `BRAKE_SERVICE` - Bremsenwartung
- `TUV` - TÜV/HU
- `CLIMATE_SERVICE` - Klimaservice
- `CUSTOM` - Individueller Service

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clxy456def",
    "bookingNumber": "BK2601001",
    "customerId": "clxy789ghi",
    "vehicleId": "clxy123abc",
    "serviceType": "INSPECTION",
    "status": "PENDING_PAYMENT",
    "totalPrice": "299.99",
    "priceBreakdown": {
      "basePrice": 250,
      "ageMultiplier": 1.2,
      "finalPrice": 299.99,
      "priceSource": "calculated",
      "mileageInterval": "60000-100000",
      "vehicle": {
        "brand": "VW",
        "model": "Golf 7",
        "year": 2015,
        "mileage": 80000
      },
      "serviceType": "INSPECTION"
    },
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "08:00-10:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "customerNotes": "Bitte vorsichtig fahren",
    "createdAt": "2026-02-01T10:30:00Z",
    "updatedAt": "2026-02-01T10:30:00Z",
    "customer": { /* User object */ },
    "vehicle": { /* Vehicle object */ },
    "paymentIntent": {
      "id": "pi_abc123",
      "clientSecret": "pi_abc123_secret_xyz",
      "amount": 29999
    }
  },
  "message": "Booking created successfully. Please complete payment to confirm."
}
```

**Business Logic:**
1. Validates vehicle ownership
2. Checks if pickup date is in the future
3. Validates time slot format (HH:MM-HH:MM)
4. Checks time slot availability
5. Calculates price based on vehicle and service type
6. Creates booking with PENDING_PAYMENT status
7. Creates Stripe Payment Intent
8. Sends booking confirmation notification
9. Tracks event in analytics

**Validation Errors:**
- `400` - Invalid vehicle ID, service type, or date format
- `403` - Vehicle does not belong to customer
- `404` - Vehicle not found
- `409` - Time slot not available

---

### List Bookings

Get all bookings for the authenticated customer with pagination and filtering.

**Endpoint:** `GET /api/bookings`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `status` (BookingStatus, optional) - Filter by status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxy456def",
      "bookingNumber": "BK2601001",
      "status": "CONFIRMED",
      "serviceType": "INSPECTION",
      "totalPrice": "299.99",
      "pickupDate": "2026-03-15T00:00:00Z",
      "pickupTimeSlot": "08:00-10:00",
      "vehicle": {
        "brand": "VW",
        "model": "Golf 7",
        "licensePlate": "B-AB 1234"
      },
      "createdAt": "2026-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Booking Statuses:**
- `PENDING_PAYMENT` - Zahlung ausstehend
- `CONFIRMED` - Bestätigt (Payment received)
- `JOCKEY_ASSIGNED` - Jockey zugewiesen
- `IN_TRANSIT_TO_WORKSHOP` - Auf dem Weg zur Werkstatt
- `IN_WORKSHOP` - In der Werkstatt
- `COMPLETED` - Service abgeschlossen
- `IN_TRANSIT_TO_CUSTOMER` - Auf dem Rückweg
- `DELIVERED` - Übergeben
- `CANCELLED` - Storniert

---

### Get Booking

Get detailed information about a specific booking.

**Endpoint:** `GET /api/bookings/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxy456def",
    "bookingNumber": "BK2601001",
    "customerId": "clxy789ghi",
    "vehicleId": "clxy123abc",
    "serviceType": "INSPECTION",
    "mileageAtBooking": 80000,
    "status": "CONFIRMED",
    "totalPrice": "299.99",
    "priceBreakdown": { /* Price details */ },
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "08:00-10:00",
    "deliveryDate": "2026-03-16T00:00:00Z",
    "deliveryTimeSlot": "14:00-16:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "jockeyId": "clxy999xyz",
    "paymentIntentId": "pi_abc123",
    "paidAt": "2026-02-01T10:35:00Z",
    "customerNotes": "Bitte vorsichtig fahren",
    "internalNotes": null,
    "createdAt": "2026-02-01T10:30:00Z",
    "updatedAt": "2026-02-01T10:35:00Z",
    "customer": { /* User object */ },
    "vehicle": { /* Vehicle object */ },
    "jockey": { /* User object */ }
  }
}
```

**Errors:**
- `403` - Booking does not belong to customer
- `404` - Booking not found

---

### Update Booking

Update booking details. Customers can only update `customerNotes`.

**Endpoint:** `PUT /api/bookings/:id`

**Request Body:**
```json
{
  "customerNotes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* Updated booking object */ },
  "message": "Booking updated successfully"
}
```

**Errors:**
- `400` - Invalid update fields for customer role
- `403` - Not authorized to update this booking
- `404` - Booking not found

---

### Cancel Booking

Cancel a booking and process automatic refund if payment was made.

**Endpoint:** `DELETE /api/bookings/:id`

**Request Body:**
```json
{
  "reason": "Terminänderung notwendig" // Optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* Cancelled booking object */ },
  "message": "Booking cancelled successfully"
}
```

**Business Logic:**
1. Validates booking can be cancelled (only PENDING_PAYMENT, CONFIRMED, JOCKEY_ASSIGNED)
2. Processes automatic refund via Stripe if payment was made
3. Updates booking status to CANCELLED
4. Sends cancellation notification to customer
5. Tracks cancellation event in analytics

**Cancellable Statuses:**
- `PENDING_PAYMENT`
- `CONFIRMED`
- `JOCKEY_ASSIGNED`

**Errors:**
- `400` - Booking cannot be cancelled in current status
- `403` - Not authorized to cancel this booking
- `404` - Booking not found

---

### Get Booking Status

Get current booking status with status history and tracking information.

**Endpoint:** `GET /api/bookings/:id/status`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK2601001",
    "status": "IN_TRANSIT_TO_WORKSHOP",
    "statusHistory": [
      {
        "status": "PENDING_PAYMENT",
        "timestamp": "2026-02-01T10:30:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2026-02-01T10:35:00Z"
      },
      {
        "status": "IN_TRANSIT_TO_WORKSHOP",
        "timestamp": "2026-03-15T08:15:00Z"
      }
    ],
    "estimatedDelivery": "2026-03-16T14:00:00Z"
  }
}
```

---

### Extensions

Service extensions allow workshops to propose additional work during service.

#### Get Booking Extensions

**Endpoint:** `GET /api/bookings/:id/extensions`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyext001",
      "bookingId": "clxy456def",
      "description": "Bremsbeläge müssen gewechselt werden",
      "items": [
        {
          "name": "Bremsbeläge vorne",
          "price": 120,
          "quantity": 1
        },
        {
          "name": "Arbeitszeit",
          "price": 80,
          "quantity": 1
        }
      ],
      "totalAmount": 20000,
      "images": [
        "https://storage.b2c.de/extensions/brake-pads-1.jpg"
      ],
      "videos": [],
      "status": "PENDING",
      "createdAt": "2026-03-15T10:00:00Z"
    }
  ]
}
```

**Extension Statuses:**
- `PENDING` - Awaiting customer approval
- `APPROVED` - Customer approved, payment pending
- `DECLINED` - Customer declined
- `CANCELLED` - Cancelled by workshop

#### Approve Extension

Approve an extension and create payment intent.

**Endpoint:** `POST /api/bookings/:id/extensions/:extensionId/approve`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxyext001",
      "status": "APPROVED",
      "approvedAt": "2026-03-15T11:00:00Z",
      "paymentIntentId": "pi_ext_abc123"
    },
    "paymentIntent": {
      "id": "pi_ext_abc123",
      "clientSecret": "pi_ext_abc123_secret_xyz",
      "amount": 20000
    }
  },
  "message": "Extension approved. Please complete payment to proceed."
}
```

**Business Logic:**
1. Validates extension belongs to booking
2. Checks extension is in PENDING status
3. Creates Stripe Payment Intent for extension amount
4. Updates extension status to APPROVED
5. Sends approval notification

**Errors:**
- `400` - Extension already approved/declined
- `403` - Extension does not belong to booking
- `404` - Extension not found

#### Decline Extension

**Endpoint:** `POST /api/bookings/:id/extensions/:extensionId/decline`

**Request Body:**
```json
{
  "reason": "Zu teuer" // Optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxyext001",
    "status": "DECLINED",
    "declinedAt": "2026-03-15T11:00:00Z"
  },
  "message": "Extension declined"
}
```

---

## Data Models

### Booking

```typescript
interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  vehicleId: string;
  serviceType: ServiceType;
  mileageAtBooking: number;
  status: BookingStatus;
  totalPrice: Decimal;
  priceBreakdown?: object;
  pickupDate: Date;
  pickupTimeSlot: string;
  deliveryDate?: Date;
  deliveryTimeSlot?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  jockeyId?: string;
  paymentIntentId?: string;
  paidAt?: Date;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: User;
  vehicle: Vehicle;
  jockey?: User;
  extensions: Extension[];
}
```

### Extension

```typescript
interface Extension {
  id: string;
  bookingId: string;
  description: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number; // in cents
  images: string[];
  videos: string[];
  status: ExtensionStatus;
  paymentIntentId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  declinedAt?: Date;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Missing/invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Time slot not available)
- `500` - Internal Server Error

---

## Business Logic

### Booking Creation Workflow

1. **Validation Phase**
   - Validate customer authentication
   - Check vehicle ownership
   - Validate pickup date (must be in future)
   - Validate time slot format
   - Check time slot availability

2. **Price Calculation**
   - Fetch vehicle details
   - Look up price matrix for brand/model/year
   - Apply mileage and age multipliers
   - Calculate final price

3. **Booking Creation**
   - Generate unique booking number (BK + YYMM + sequence)
   - Create booking with PENDING_PAYMENT status
   - Store price breakdown

4. **Payment Setup**
   - Create Stripe Payment Intent
   - Link payment intent to booking
   - Return client secret to frontend

5. **Notifications**
   - Send booking confirmation email
   - Send push notification
   - Track analytics event

### Status Transition Rules

Valid status transitions:

```
PENDING_PAYMENT → CONFIRMED (after payment)
PENDING_PAYMENT → CANCELLED

CONFIRMED → JOCKEY_ASSIGNED
CONFIRMED → CANCELLED

JOCKEY_ASSIGNED → IN_TRANSIT_TO_WORKSHOP
JOCKEY_ASSIGNED → CANCELLED

IN_TRANSIT_TO_WORKSHOP → IN_WORKSHOP

IN_WORKSHOP → COMPLETED

COMPLETED → IN_TRANSIT_TO_CUSTOMER

IN_TRANSIT_TO_CUSTOMER → DELIVERED
```

### Cancellation Policy

**Allowed Cancellation Statuses:**
- PENDING_PAYMENT
- CONFIRMED
- JOCKEY_ASSIGNED

**Automatic Refund:**
- Full refund processed automatically via Stripe
- Refund reason: "requested_by_customer"
- Notification sent on successful refund

**Not Cancellable:**
- IN_TRANSIT_TO_WORKSHOP (Service in progress)
- IN_WORKSHOP (Service in progress)
- COMPLETED (Service completed)
- IN_TRANSIT_TO_CUSTOMER (Delivery in progress)
- DELIVERED (Already delivered)

### Extension Workflow

1. **Workshop Creates Extension**
   - Workshop identifies additional work needed
   - Creates extension with description, items, and photos
   - Status: PENDING
   - Customer receives notification

2. **Customer Reviews**
   - Customer views extension details
   - Reviews items, prices, and photos
   - Decides to approve or decline

3. **Customer Approves**
   - Payment intent created for extension amount
   - Status: APPROVED
   - Customer completes payment

4. **Customer Declines**
   - Status: DECLINED
   - Workshop proceeds without extension

---

## Integration with Services

### Payment Service Integration

```typescript
// Create payment on booking creation
const paymentIntent = await paymentService.createPaymentIntent({
  amount: totalPriceInCents,
  bookingId: booking.id,
  customerId: customer.id,
  customerEmail: customer.email,
  metadata: {
    bookingNumber: booking.bookingNumber,
    serviceType: booking.serviceType
  }
});

// Process refund on cancellation
await paymentService.refundPayment({
  paymentIntentId: booking.paymentIntentId,
  reason: 'requested_by_customer'
});
```

### Email Service Integration

```typescript
// Booking confirmation email
await emailService.sendBookingConfirmation({
  to: customer.email,
  booking: booking,
  paymentLink: `https://app.b2c.de/bookings/${booking.id}/payment`
});

// Status update email
await emailService.sendStatusUpdate({
  to: customer.email,
  booking: booking,
  newStatus: 'IN_WORKSHOP'
});
```

### Notification Service Integration

```typescript
// Push notification for status updates
await sendNotification({
  userId: customer.id,
  type: NotificationType.STATUS_UPDATE,
  title: 'Status Update',
  body: `Your booking ${booking.bookingNumber} is now ${status}`,
  bookingId: booking.id,
  data: {
    bookingId: booking.id,
    status: status
  }
});
```

### Analytics Service Integration

```typescript
// Track booking creation
await analyticsService.track({
  userId: customer.id,
  event: 'booking_created',
  properties: {
    bookingId: booking.id,
    serviceType: booking.serviceType,
    totalPrice: booking.totalPrice
  }
});
```

---

## Rate Limiting

All booking endpoints are rate-limited to prevent abuse:

- **Create Booking:** 10 requests per hour per user
- **Other Endpoints:** 100 requests per hour per user

Rate limit headers included in response:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1709295600
```

---

## Testing

Run booking API tests:

```bash
npm test src/tests/bookings.test.ts
```

Test coverage includes:
- Booking creation validation
- Price calculation
- Status transitions
- Cancellation logic
- Extension approval/decline
- Error handling

---

## Support

For API support or questions:
- Email: api-support@b2c-autowartung.de
- Documentation: https://docs.b2c-autowartung.de
- Status Page: https://status.b2c-autowartung.de
