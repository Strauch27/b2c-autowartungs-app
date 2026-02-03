# API Documentation

## Overview
This document describes the REST API endpoints for the B2C Autowartungs-App backend.

Base URL: `http://localhost:5001/api`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication (`/api/auth`)
See [AUTH_DOCUMENTATION.md](./AUTH_DOCUMENTATION.md) for authentication endpoints.

---

## Vehicles API (`/api/vehicles`)

All vehicle endpoints require customer authentication.

### List All Vehicles
**GET** `/api/vehicles`

Get all vehicles for the authenticated customer.

**Authentication:** Required (Customer)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "customerId": "cuid",
      "brand": "VW",
      "model": "Golf 7",
      "year": 2018,
      "mileage": 65000,
      "licensePlate": "B-AB 1234",
      "vin": "WVWZZZ1KZBW123456",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Vehicle by ID
**GET** `/api/vehicles/:id`

Get details of a specific vehicle.

**Authentication:** Required (Customer)

**Query Parameters:**
- `includeBookings` (boolean, optional): Include booking history

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "brand": "VW",
    "model": "Golf 7",
    "year": 2018,
    "mileage": 65000,
    "licensePlate": "B-AB 1234",
    "vin": "WVWZZZ1KZBW123456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "bookings": [...]  // Only if includeBookings=true
  }
}
```

---

### Create Vehicle
**POST** `/api/vehicles`

Add a new vehicle for the authenticated customer.

**Authentication:** Required (Customer)

**Request Body:**
```json
{
  "brand": "VW",
  "model": "Golf 7",
  "year": 2018,
  "mileage": 65000,
  "licensePlate": "B-AB 1234",  // optional
  "vin": "WVWZZZ1KZBW123456"    // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "brand": "VW",
    "model": "Golf 7",
    "year": 2018,
    "mileage": 65000,
    "licensePlate": "B-AB 1234",
    "vin": "WVWZZZ1KZBW123456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "warnings": [
    "Vehicle VW Golf 7 (2018) not found in price matrix. Fallback pricing will be used."
  ]
}
```

**Validation:**
- `brand`: Required, min 1 character
- `model`: Required, min 1 character
- `year`: Required, integer between 1994 and current year + 1
- `mileage`: Required, integer between 0 and 1,000,000
- `licensePlate`: Optional string
- `vin`: Optional string

---

### Update Vehicle
**PATCH** `/api/vehicles/:id`

Update vehicle information.

**Authentication:** Required (Customer)

**Request Body:**
```json
{
  "mileage": 70000,
  "licensePlate": "B-AB 5678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "customerId": "cuid",
    "brand": "VW",
    "model": "Golf 7",
    "year": 2018,
    "mileage": 70000,
    "licensePlate": "B-AB 5678",
    "vin": "WVWZZZ1KZBW123456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

### Delete Vehicle
**DELETE** `/api/vehicles/:id`

Delete a vehicle. Only allowed if the vehicle has no active bookings.

**Authentication:** Required (Customer)

**Response:**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

**Errors:**
- 400: Vehicle has active bookings
- 404: Vehicle not found
- 403: Not authorized to delete this vehicle

---

## Bookings API (`/api/bookings`)

All booking endpoints require customer authentication.

### List All Bookings
**GET** `/api/bookings`

Get all bookings for the authenticated customer.

**Authentication:** Required (Customer)

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (BookingStatus, optional): Filter by status

**Booking Status Values:**
- `PENDING_PAYMENT`
- `CONFIRMED`
- `JOCKEY_ASSIGNED`
- `IN_TRANSIT_TO_WORKSHOP`
- `IN_WORKSHOP`
- `COMPLETED`
- `IN_TRANSIT_TO_CUSTOMER`
- `DELIVERED`
- `CANCELLED`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "bookingNumber": "BK240100001",
      "customerId": "cuid",
      "vehicleId": "cuid",
      "serviceType": "INSPECTION",
      "mileageAtBooking": 65000,
      "status": "PENDING_PAYMENT",
      "totalPrice": "299.00",
      "priceBreakdown": {...},
      "pickupDate": "2024-02-15T00:00:00.000Z",
      "pickupTimeSlot": "08:00-10:00",
      "pickupAddress": "Hauptstraße 123",
      "pickupCity": "Berlin",
      "pickupPostalCode": "10115",
      "customerNotes": "Please call before arrival",
      "customer": {...},
      "vehicle": {...},
      "jockey": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

---

### Get Booking by ID
**GET** `/api/bookings/:id`

Get details of a specific booking.

**Authentication:** Required (Customer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "bookingNumber": "BK240100001",
    "customerId": "cuid",
    "vehicleId": "cuid",
    "serviceType": "INSPECTION",
    "mileageAtBooking": 65000,
    "status": "PENDING_PAYMENT",
    "totalPrice": "299.00",
    "priceBreakdown": {
      "basePrice": 250,
      "ageMultiplier": 1.2,
      "finalPrice": 300,
      "priceSource": "exact",
      "mileageInterval": "60k",
      "vehicle": {
        "brand": "VW",
        "model": "Golf 7",
        "year": 2018,
        "mileage": 65000
      },
      "serviceType": "INSPECTION"
    },
    "pickupDate": "2024-02-15T00:00:00.000Z",
    "pickupTimeSlot": "08:00-10:00",
    "pickupAddress": "Hauptstraße 123",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "customerNotes": "Please call before arrival",
    "customer": {...},
    "vehicle": {...},
    "jockey": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Create Booking
**POST** `/api/bookings`

Create a new booking. Price is automatically calculated based on vehicle and service type.

**Authentication:** Required (Customer)

**Request Body:**
```json
{
  "vehicleId": "cuid",
  "serviceType": "INSPECTION",
  "pickupDate": "2024-02-15T00:00:00.000Z",
  "pickupTimeSlot": "08:00-10:00",
  "pickupAddress": "Hauptstraße 123",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115",
  "customerNotes": "Please call before arrival"  // optional
}
```

**Service Type Values:**
- `INSPECTION`: Complete inspection and maintenance
- `OIL_SERVICE`: Oil and filter change
- `BRAKE_SERVICE`: Brake service
- `TUV`: TÜV/HU inspection
- `CLIMATE_SERVICE`: Climate service
- `CUSTOM`: Custom service

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "bookingNumber": "BK240100001",
    "status": "PENDING_PAYMENT",
    "totalPrice": "299.00",
    ...
  },
  "message": "Booking created successfully. Please complete payment to confirm."
}
```

**Validation:**
- `vehicleId`: Required, valid CUID
- `serviceType`: Required, valid ServiceType enum
- `pickupDate`: Required, ISO datetime format, must be in the future
- `pickupTimeSlot`: Required, format "HH:MM-HH:MM"
- `pickupAddress`: Required, min 1 character
- `pickupCity`: Required, min 1 character
- `pickupPostalCode`: Required, min 1 character
- `customerNotes`: Optional string

**Business Rules:**
- Vehicle must belong to the authenticated customer
- Pickup date must be in the future
- Time slot must be available (max 10 bookings per slot)
- Price is calculated automatically using PricingService

---

### Update Booking
**PATCH** `/api/bookings/:id`

Update booking information. Customers can only update customer notes.

**Authentication:** Required (Customer)

**Request Body:**
```json
{
  "customerNotes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "bookingNumber": "BK240100001",
    "customerNotes": "Updated notes",
    ...
  }
}
```

**Note:** Staff members (admin, jockey, workshop) can update additional fields like status, jockeyId, etc.

---

### Cancel Booking
**DELETE** `/api/bookings/:id`

Cancel a booking. Only allowed for bookings in certain statuses.

**Authentication:** Required (Customer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "bookingNumber": "BK240100001",
    "status": "CANCELLED",
    ...
  },
  "message": "Booking cancelled successfully"
}
```

**Business Rules:**
- Can only cancel bookings in status:
  - `PENDING_PAYMENT`
  - `CONFIRMED`
  - `JOCKEY_ASSIGNED`
- Cannot cancel bookings that are already in progress or completed

---

## Services API (`/api/services`)

Public endpoints for service catalog and pricing. No authentication required.

### List All Services
**GET** `/api/services`

Get all available service types with descriptions.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "INSPECTION",
      "name": "Inspection & Maintenance",
      "description": "Complete vehicle inspection and maintenance service based on manufacturer specifications"
    },
    {
      "type": "OIL_SERVICE",
      "name": "Oil Service",
      "description": "Oil and filter change service"
    },
    {
      "type": "BRAKE_SERVICE",
      "name": "Brake Service",
      "description": "Brake inspection and service (front and rear)"
    },
    {
      "type": "TUV",
      "name": "TÜV/HU Inspection",
      "description": "Official German TÜV/HU vehicle inspection"
    },
    {
      "type": "CLIMATE_SERVICE",
      "name": "Climate Service",
      "description": "Air conditioning system maintenance and service"
    },
    {
      "type": "CUSTOM",
      "name": "Custom Service",
      "description": "Custom service tailored to your specific needs"
    }
  ]
}
```

---

### Get Service Price
**GET** `/api/services/:type/price`

Calculate price for a specific service type based on vehicle information.

**Authentication:** Not required

**URL Parameters:**
- `type`: Service type (INSPECTION, OIL_SERVICE, etc.)

**Query Parameters:**
- `brand` (string, required): Vehicle brand
- `model` (string, required): Vehicle model
- `year` (number, required): Build year
- `mileage` (number, required): Current mileage

**Example:**
```
GET /api/services/INSPECTION/price?brand=VW&model=Golf%207&year=2018&mileage=65000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serviceType": "INSPECTION",
    "serviceName": "Inspection & Maintenance",
    "price": 300,
    "breakdown": {
      "basePrice": 250,
      "ageMultiplier": 1.2,
      "mileageInterval": "60k",
      "priceSource": "exact"
    },
    "vehicle": {
      "brand": "VW",
      "model": "Golf 7",
      "year": 2018,
      "mileage": 65000
    }
  }
}
```

**Price Source Values:**
- `exact`: Exact match found in price matrix
- `fallback_brand`: Using brand average (model not found)
- `fallback_default`: Using default price (brand not found)

---

### Get Available Brands
**GET** `/api/services/brands`

Get all vehicle brands available in the price matrix.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "VW",
    "Porsche"
  ]
}
```

---

### Get Available Models
**GET** `/api/services/brands/:brand/models`

Get all models for a specific brand.

**Authentication:** Not required

**URL Parameters:**
- `brand`: Brand name

**Example:**
```
GET /api/services/brands/VW/models
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Golf 7",
    "Golf 8",
    "Passat B8",
    "Tiguan",
    "T-Roc"
  ]
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "..."  // Only in development mode
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required or token invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Conflict with current state (e.g., time slot not available)
- **500 Internal Server Error**: Server error

---

## Rate Limiting

Authentication endpoints are rate-limited:
- Magic link: 5 requests per 15 minutes per IP
- Login: 10 requests per 15 minutes per IP

---

## Integration Points

### Payment Integration (Future)
When creating a booking, the response includes `paymentIntentId` field for Stripe integration:

```json
{
  "id": "booking_id",
  "status": "PENDING_PAYMENT",
  "totalPrice": "299.00",
  "paymentIntentId": null  // Will be populated after payment integration
}
```

After payment confirmation, update the booking:
```
PATCH /api/bookings/:id
{
  "status": "CONFIRMED",
  "paymentIntentId": "pi_...",
  "paidAt": "2024-01-01T12:00:00.000Z"
}
```

---

## Development Notes

### Database Schema
All API endpoints use Prisma ORM with PostgreSQL. See `prisma/schema.prisma` for the complete schema.

### Pricing Logic
Prices are calculated using:
1. Base price from PriceMatrix (brand/model/year/mileage)
2. Age multiplier:
   - >15 years: +20%
   - >10 years: +10%
   - ≤10 years: no surcharge
3. Fallback strategy:
   - Try exact match (brand + model + year)
   - Fall back to brand average
   - Fall back to default price

### Booking Number Format
Format: `BK[YY][MM][NNNN]`
- `BK`: Prefix
- `YY`: Year (2 digits)
- `MM`: Month (2 digits)
- `NNNN`: Sequential number within that month (4 digits)

Example: `BK240100001` = First booking of January 2024

---

## Testing

Use the provided authentication to get a JWT token, then include it in all requests:

```bash
# Get magic link (development mode returns link in response)
curl -X POST http://localhost:5001/api/auth/customer/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com"}'

# Use the token from the magic link verification
curl -X GET http://localhost:5001/api/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
