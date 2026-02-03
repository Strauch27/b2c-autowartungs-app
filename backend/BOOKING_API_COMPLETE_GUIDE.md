# Complete Booking API Guide

**Version:** 1.0
**Last Updated:** February 1, 2026
**Author:** B2C Autowartung Development Team

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Workflows](#workflows)
6. [Integration Examples](#integration-examples)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Security](#security)
10. [Best Practices](#best-practices)

---

## Overview

The Booking API is the core component of the B2C Autowartungs-App, enabling customers to book vehicle maintenance services with automated pickup and delivery.

### Key Features

- **Full Booking Lifecycle Management**: From creation to completion
- **Automated Price Calculation**: Based on vehicle, service type, and mileage
- **Service Extensions**: Support for additional work requests during service
- **Payment Integration**: Stripe-based payment processing
- **Real-time Status Updates**: Email and push notifications
- **Cancellation with Refunds**: Automated refund processing

### Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Payment**: Stripe API
- **Notifications**: Firebase Cloud Messaging + Resend Email
- **Validation**: Zod schemas

---

## Architecture

### Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│                   (Mobile App / Web App)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (JWT Auth)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Routes                      │
│                 (Authentication Middleware)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Bookings Controller                         │
│               (Request Validation with Zod)                  │
└──────┬─────────┬──────────┬─────────┬────────┬─────────────┘
       │         │          │         │        │
       ▼         ▼          ▼         ▼        ▼
  ┌────────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────────┐
  │Bookings│ │Price │ │Payment │ │Email │ │Analytics │
  │Service │ │Service│ │Service │ │Service│ │ Service  │
  └───┬────┘ └───┬──┘ └───┬────┘ └───┬──┘ └─────┬────┘
      │          │        │          │          │
      ▼          ▼        ▼          ▼          ▼
  ┌────────────────────────────────────────────────────┐
  │              Repository Layer                      │
  │  (Bookings, Vehicles, PriceMatrix, Extensions)     │
  └──────────────────────┬─────────────────────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │  PostgreSQL  │
                 │   Database   │
                 └──────────────┘
```

### Data Flow

1. **Request**: Client sends authenticated HTTP request
2. **Validation**: Zod schemas validate request data
3. **Business Logic**: Service layer processes request
4. **Database**: Repository layer interacts with Prisma/PostgreSQL
5. **External Services**: Payment, Email, Notifications
6. **Response**: Formatted JSON response with proper status codes

---

## API Endpoints

### Authentication

All booking endpoints require authentication via JWT token:

```
Authorization: Bearer <jwt_token>
```

### Base URL

```
Production: https://api.b2c-autowartung.de/api
Development: http://localhost:5000/api
```

---

### 1. Create Booking

**Endpoint:** `POST /api/bookings`

**Description:** Creates a new booking and initiates payment flow.

**Request Body:**

```json
{
  "vehicleId": "clxxx123456789",
  "serviceType": "INSPECTION",
  "pickupDate": "2026-03-15T00:00:00Z",
  "pickupTimeSlot": "09:00-11:00",
  "pickupAddress": "Hauptstraße 1",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115",
  "customerNotes": "Bitte vorsichtig fahren"
}
```

**Validation Rules:**

- `vehicleId`: Must be valid CUID, vehicle must belong to customer
- `serviceType`: One of: INSPECTION, OIL_SERVICE, BRAKE_SERVICE, TUV, CLIMATE_SERVICE, CUSTOM
- `pickupDate`: ISO 8601 datetime, must be in future
- `pickupTimeSlot`: Format "HH:MM-HH:MM" (e.g., "09:00-11:00")
- `pickupAddress`, `pickupCity`, `pickupPostalCode`: Required strings
- `customerNotes`: Optional string

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx987654321",
    "bookingNumber": "BK260201001",
    "customerId": "clxxx111222333",
    "vehicleId": "clxxx123456789",
    "serviceType": "INSPECTION",
    "status": "PENDING_PAYMENT",
    "totalPrice": "299.99",
    "priceBreakdown": {
      "basePrice": 250.00,
      "ageMultiplier": 1.2,
      "finalPrice": 299.99,
      "priceSource": "calculated",
      "mileageInterval": "60000-100000"
    },
    "pickupDate": "2026-03-15T00:00:00.000Z",
    "pickupTimeSlot": "09:00-11:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "customerNotes": "Bitte vorsichtig fahren",
    "paymentIntent": {
      "id": "pi_xxx",
      "clientSecret": "pi_xxx_secret_xxx",
      "amount": 29999
    },
    "customer": { /* User object */ },
    "vehicle": { /* Vehicle object */ },
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  },
  "message": "Booking created successfully. Please complete payment to confirm."
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Vehicle does not belong to customer
- `404 Not Found`: Vehicle not found
- `409 Conflict`: Time slot not available

---

### 2. Get All Bookings

**Endpoint:** `GET /api/bookings`

**Description:** Retrieves paginated list of customer's bookings.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `status`: Filter by status (optional)

**Example:**

```
GET /api/bookings?page=1&limit=10&status=CONFIRMED
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx987654321",
      "bookingNumber": "BK260201001",
      "serviceType": "INSPECTION",
      "status": "CONFIRMED",
      "totalPrice": "299.99",
      "pickupDate": "2026-03-15T00:00:00.000Z",
      "pickupTimeSlot": "09:00-11:00",
      "vehicle": {
        "brand": "VW",
        "model": "Golf 7",
        "year": 2015,
        "licensePlate": "B-AB 1234"
      },
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Get Single Booking

**Endpoint:** `GET /api/bookings/:id`

**Description:** Retrieves detailed information for a specific booking.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx987654321",
    "bookingNumber": "BK260201001",
    "customerId": "clxxx111222333",
    "vehicleId": "clxxx123456789",
    "serviceType": "INSPECTION",
    "mileageAtBooking": 80000,
    "status": "IN_WORKSHOP",
    "totalPrice": "299.99",
    "priceBreakdown": { /* Price details */ },
    "pickupDate": "2026-03-15T00:00:00.000Z",
    "pickupTimeSlot": "09:00-11:00",
    "deliveryDate": "2026-03-15T18:00:00.000Z",
    "deliveryTimeSlot": "18:00-20:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "jockey": {
      "id": "clxxx444555666",
      "firstName": "Max",
      "lastName": "Müller",
      "phone": "+491234567890"
    },
    "paymentIntentId": "pi_xxx",
    "paidAt": "2026-02-01T10:15:00.000Z",
    "customerNotes": "Bitte vorsichtig fahren",
    "internalNotes": "Fahrzeug in gutem Zustand",
    "customer": { /* User object */ },
    "vehicle": { /* Vehicle object */ },
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  }
}
```

---

### 4. Update Booking

**Endpoint:** `PUT /api/bookings/:id`

**Description:** Updates booking (customers can only update customerNotes).

**Request Body:**

```json
{
  "customerNotes": "Aktualisierte Notiz"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { /* Updated booking object */ },
  "message": "Booking updated successfully"
}
```

**Note:** Other fields (status, jockeyId, etc.) can only be updated by workshop/admin roles.

---

### 5. Cancel Booking

**Endpoint:** `DELETE /api/bookings/:id`

**Description:** Cancels a booking and processes refund if applicable.

**Request Body:**

```json
{
  "reason": "Termin passt nicht mehr"
}
```

**Cancellable Statuses:**

- PENDING_PAYMENT
- CONFIRMED
- JOCKEY_ASSIGNED

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx987654321",
    "bookingNumber": "BK260201001",
    "status": "CANCELLED",
    /* ... other booking fields ... */
  },
  "message": "Booking cancelled successfully"
}
```

**Error Responses:**

- `400 Bad Request`: Booking cannot be cancelled (status too advanced)
- `403 Forbidden`: Not your booking
- `404 Not Found`: Booking not found

---

### 6. Get Booking Status

**Endpoint:** `GET /api/bookings/:id/status`

**Description:** Retrieves current status with history timeline.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK260201001",
    "status": "IN_WORKSHOP",
    "statusHistory": [
      {
        "status": "PENDING_PAYMENT",
        "timestamp": "2026-02-01T10:00:00.000Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2026-02-01T10:15:00.000Z"
      },
      {
        "status": "JOCKEY_ASSIGNED",
        "timestamp": "2026-02-01T11:00:00.000Z"
      },
      {
        "status": "IN_TRANSIT_TO_WORKSHOP",
        "timestamp": "2026-03-15T08:30:00.000Z"
      },
      {
        "status": "IN_WORKSHOP",
        "timestamp": "2026-03-15T09:45:00.000Z"
      }
    ],
    "estimatedDelivery": "2026-03-15T18:00:00.000Z"
  }
}
```

---

### 7. Get Booking Extensions

**Endpoint:** `GET /api/bookings/:id/extensions`

**Description:** Retrieves all service extensions for a booking.

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx777888999",
      "bookingId": "clxxx987654321",
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
        "https://storage.b2c-autowartung.de/extensions/brake-pads-1.jpg"
      ],
      "videos": [],
      "status": "PENDING",
      "paymentIntentId": null,
      "paidAt": null,
      "createdAt": "2026-03-15T10:30:00.000Z",
      "updatedAt": "2026-03-15T10:30:00.000Z",
      "approvedAt": null,
      "declinedAt": null
    }
  ]
}
```

---

### 8. Approve Extension

**Endpoint:** `POST /api/bookings/:id/extensions/:extensionId/approve`

**Description:** Approves an extension and creates payment intent.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxxx777888999",
      "status": "APPROVED",
      "approvedAt": "2026-03-15T11:00:00.000Z",
      "paymentIntentId": "pi_extension_xxx",
      /* ... other extension fields ... */
    },
    "paymentIntent": {
      "id": "pi_extension_xxx",
      "clientSecret": "pi_extension_xxx_secret_xxx",
      "amount": 20000
    }
  },
  "message": "Extension approved. Please complete payment to proceed."
}
```

---

### 9. Decline Extension

**Endpoint:** `POST /api/bookings/:id/extensions/:extensionId/decline`

**Description:** Declines a service extension.

**Request Body:**

```json
{
  "reason": "Zu teuer, möchte selbst machen"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx777888999",
    "status": "DECLINED",
    "declinedAt": "2026-03-15T11:00:00.000Z",
    /* ... other extension fields ... */
  },
  "message": "Extension declined"
}
```

---

## Data Models

### Booking Model

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
  priceBreakdown: JSON;
  pickupDate: DateTime;
  pickupTimeSlot: string;
  deliveryDate?: DateTime;
  deliveryTimeSlot?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  jockeyId?: string;
  paymentIntentId?: string;
  paidAt?: DateTime;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: DateTime;
  updatedAt: DateTime;

  // Relations
  customer: User;
  vehicle: Vehicle;
  jockey?: User;
  extensions: Extension[];
}
```

### Extension Model

```typescript
interface Extension {
  id: string;
  bookingId: string;
  description: string;
  items: ExtensionItem[];
  totalAmount: number; // in cents
  images: string[];
  videos: string[];
  status: ExtensionStatus;
  paymentIntentId?: string;
  paidAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
  approvedAt?: DateTime;
  declinedAt?: DateTime;

  // Relations
  booking: Booking;
}

interface ExtensionItem {
  name: string;
  price: number;
  quantity: number;
}
```

### Enums

```typescript
enum ServiceType {
  INSPECTION = 'INSPECTION',
  OIL_SERVICE = 'OIL_SERVICE',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  TUV = 'TUV',
  CLIMATE_SERVICE = 'CLIMATE_SERVICE',
  CUSTOM = 'CUSTOM'
}

enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  JOCKEY_ASSIGNED = 'JOCKEY_ASSIGNED',
  IN_TRANSIT_TO_WORKSHOP = 'IN_TRANSIT_TO_WORKSHOP',
  IN_WORKSHOP = 'IN_WORKSHOP',
  COMPLETED = 'COMPLETED',
  IN_TRANSIT_TO_CUSTOMER = 'IN_TRANSIT_TO_CUSTOMER',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

enum ExtensionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
}
```

---

## Workflows

### 1. Standard Booking Flow

```
Customer Creates Booking
         ↓
   PENDING_PAYMENT (Payment Intent created)
         ↓
   Customer Completes Payment
         ↓
   CONFIRMED (Email + Push notification)
         ↓
   Workshop Assigns Jockey
         ↓
   JOCKEY_ASSIGNED (Notification sent)
         ↓
   Jockey Picks Up Vehicle
         ↓
   IN_TRANSIT_TO_WORKSHOP
         ↓
   Vehicle Arrives at Workshop
         ↓
   IN_WORKSHOP (Service in progress)
         ↓
   Service Completed
         ↓
   COMPLETED (Notification sent)
         ↓
   Jockey Returns Vehicle
         ↓
   IN_TRANSIT_TO_CUSTOMER
         ↓
   Vehicle Delivered
         ↓
   DELIVERED (Final notification + feedback request)
```

### 2. Extension Request Flow

```
   Vehicle IN_WORKSHOP
         ↓
   Workshop Identifies Additional Work
         ↓
   Workshop Creates Extension Request
         ↓
   Customer Receives Notification
         ↓
   Customer Reviews Extension
         ↓
    ┌────────────┐
    │   Approve  │  Decline
    ↓            ↓
Payment      Notification
Created      to Workshop
    ↓            ↓
Customer    Service
Pays        Continues
    ↓        Without
Work        Extension
Proceeds
```

### 3. Cancellation Flow

```
   Customer Requests Cancellation
         ↓
   Check Booking Status
         ↓
    Cancellable?
    ┌────────────┐
   Yes          No
    ↓            ↓
  Update      Return
  Status      Error
  to          Message
  CANCELLED
    ↓
  Process Refund (if paid)
    ↓
  Send Notification
    ↓
  Update Analytics
```

---

## Integration Examples

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.b2c-autowartung.de/api';
const JWT_TOKEN = 'your_jwt_token';

// Create booking
async function createBooking() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings`,
      {
        vehicleId: 'clxxx123456789',
        serviceType: 'INSPECTION',
        pickupDate: '2026-03-15T00:00:00Z',
        pickupTimeSlot: '09:00-11:00',
        pickupAddress: 'Hauptstraße 1',
        pickupCity: 'Berlin',
        pickupPostalCode: '10115',
        customerNotes: 'Bitte vorsichtig fahren'
      },
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Booking created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response?.data);
    throw error;
  }
}

// Get all bookings
async function getBookings(page = 1, limit = 20) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/bookings`,
      {
        params: { page, limit },
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error.response?.data);
    throw error;
  }
}

// Cancel booking
async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/bookings/${bookingId}`,
      {
        data: { reason },
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Booking cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error.response?.data);
    throw error;
  }
}

// Approve extension
async function approveExtension(bookingId: string, extensionId: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/extensions/${extensionId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      }
    );

    console.log('Extension approved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error approving extension:', error.response?.data);
    throw error;
  }
}
```

### React Hooks Example

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

// Custom hook for bookings
function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBookings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setBookings([response.data.data, ...bookings]);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    try {
      await axios.delete(`/api/bookings/${bookingId}`, {
        data: { reason },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking
  };
}

// Usage in component
function BookingsPage() {
  const { bookings, loading, error, createBooking, cancelBooking } = useBookings();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={(reason) => cancelBooking(booking.id, reason)}
        />
      ))}
    </div>
  );
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Booking not found",
    "code": "BOOKING_NOT_FOUND",
    "statusCode": 404,
    "details": {}
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|-----------|-------------|
| 400 | VALIDATION_ERROR | Request data validation failed |
| 400 | INVALID_TIME_SLOT | Time slot format is invalid |
| 400 | PAST_DATE | Pickup date is in the past |
| 400 | CANNOT_CANCEL | Booking status doesn't allow cancellation |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 403 | FORBIDDEN | User doesn't have permission |
| 404 | BOOKING_NOT_FOUND | Booking doesn't exist |
| 404 | VEHICLE_NOT_FOUND | Vehicle doesn't exist |
| 409 | TIMESLOT_UNAVAILABLE | Selected time slot is not available |
| 500 | INTERNAL_ERROR | Server error |

### Error Handling Best Practices

```typescript
try {
  const booking = await createBooking(data);
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        // Validation error - show user-friendly message
        showError('Please check your input data');
        break;
      case 401:
        // Unauthorized - redirect to login
        redirectToLogin();
        break;
      case 409:
        // Conflict - time slot not available
        showError('Selected time slot is not available. Please choose another.');
        break;
      default:
        showError('An error occurred. Please try again.');
    }
  } else if (error.request) {
    // Network error
    showError('Network error. Please check your connection.');
  } else {
    // Other error
    showError('An unexpected error occurred.');
  }
}
```

---

## Testing

### Unit Tests

Run unit tests:

```bash
npm test -- bookings.test.ts
```

### Integration Tests

Run integration tests:

```bash
npm test -- bookings.integration.test.ts
```

### Manual Testing with Curl

Use the provided examples script:

```bash
./src/examples/booking-api-examples.sh
```

### Test Coverage Goals

- **Service Layer**: 90%+ coverage
- **Controller Layer**: 85%+ coverage
- **Repository Layer**: 95%+ coverage

---

## Security

### Authentication

- All endpoints require valid JWT token
- Token expiration: 24 hours
- Refresh tokens supported

### Authorization

- Customers can only access their own bookings
- RBAC enforced at middleware level
- Workshop/Admin roles have extended permissions

### Data Validation

- All inputs validated with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection via sanitization

### Payment Security

- PCI-DSS compliant via Stripe
- No credit card data stored
- Payment intents used for secure processing

### Rate Limiting

```typescript
// Applied per IP address
{
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
async function createBooking(data) {
  try {
    const booking = await api.createBooking(data);
    return booking;
  } catch (error) {
    // Log error
    logger.error('Booking creation failed', error);
    // Show user-friendly message
    showError('Failed to create booking. Please try again.');
    // Optionally retry or fallback
    throw error;
  }
}
```

### 2. Implement Optimistic Updates

```typescript
function BookingsList() {
  const [bookings, setBookings] = useState([]);

  async function cancelBooking(id) {
    // Optimistically update UI
    const originalBookings = [...bookings];
    setBookings(bookings.map(b =>
      b.id === id ? { ...b, status: 'CANCELLED' } : b
    ));

    try {
      await api.cancelBooking(id);
    } catch (error) {
      // Rollback on error
      setBookings(originalBookings);
      showError('Cancellation failed');
    }
  }
}
```

### 3. Cache Frequently Accessed Data

```typescript
const cache = new Map();

async function getBooking(id) {
  // Check cache first
  if (cache.has(id)) {
    const cached = cache.get(id);
    if (Date.now() - cached.timestamp < 60000) { // 1 minute TTL
      return cached.data;
    }
  }

  // Fetch from API
  const booking = await api.getBooking(id);

  // Update cache
  cache.set(id, {
    data: booking,
    timestamp: Date.now()
  });

  return booking;
}
```

### 4. Use Webhooks for Status Updates

Instead of polling, subscribe to webhook events:

```typescript
// Backend webhook handler
app.post('/webhooks/booking-status', async (req, res) => {
  const { bookingId, status } = req.body;

  // Update booking status
  await updateBookingStatus(bookingId, status);

  // Notify customer via push notification
  await sendPushNotification(bookingId, status);

  res.status(200).send('OK');
});
```

### 5. Implement Retry Logic

```typescript
async function createBookingWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.createBooking(data);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

---

## Support

### Documentation

- API Reference: `/docs/api`
- Developer Portal: `https://developers.b2c-autowartung.de`
- Changelog: `/CHANGELOG.md`

### Contact

- Email: dev-support@b2c-autowartung.de
- Slack: `#api-support`
- GitHub Issues: `https://github.com/b2c-autowartung/backend/issues`

---

**End of Complete Booking API Guide**
