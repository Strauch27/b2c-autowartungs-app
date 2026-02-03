# Booking API Quick Reference

Fast reference guide for the Customer Booking API.

## Base URL
```
/api/bookings
```

## Authentication
All endpoints require JWT authentication with CUSTOMER role.

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create new booking |
| `GET` | `/api/bookings` | List all bookings |
| `GET` | `/api/bookings/:id` | Get booking details |
| `PUT` | `/api/bookings/:id` | Update booking |
| `DELETE` | `/api/bookings/:id` | Cancel booking |
| `GET` | `/api/bookings/:id/status` | Get booking status |
| `GET` | `/api/bookings/:id/extensions` | List extensions |
| `POST` | `/api/bookings/:id/extensions/:extensionId/approve` | Approve extension |
| `POST` | `/api/bookings/:id/extensions/:extensionId/decline` | Decline extension |

---

## Quick Examples

### Create Booking

```bash
POST /api/bookings
Content-Type: application/json
Authorization: Bearer <token>

{
  "vehicleId": "clxy123abc",
  "serviceType": "INSPECTION",
  "pickupDate": "2026-03-15T00:00:00Z",
  "pickupTimeSlot": "08:00-10:00",
  "pickupAddress": "Hauptstraße 1",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115",
  "customerNotes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxy456def",
    "bookingNumber": "BK2601001",
    "status": "PENDING_PAYMENT",
    "totalPrice": "299.99",
    "paymentIntent": {
      "id": "pi_abc123",
      "clientSecret": "pi_abc123_secret_xyz",
      "amount": 29999
    }
  }
}
```

---

### List Bookings

```bash
GET /api/bookings?page=1&limit=20&status=CONFIRMED
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxy456def",
      "bookingNumber": "BK2601001",
      "status": "CONFIRMED",
      "totalPrice": "299.99"
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

### Get Booking

```bash
GET /api/bookings/clxy456def
Authorization: Bearer <token>
```

---

### Update Booking

```bash
PUT /api/bookings/clxy456def
Content-Type: application/json
Authorization: Bearer <token>

{
  "customerNotes": "Updated notes"
}
```

---

### Cancel Booking

```bash
DELETE /api/bookings/clxy456def
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Terminänderung notwendig"
}
```

**Note:** Automatic refund processed if payment was made.

---

### Get Booking Status

```bash
GET /api/bookings/clxy456def/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingNumber": "BK2601001",
    "status": "IN_WORKSHOP",
    "statusHistory": [
      {
        "status": "PENDING_PAYMENT",
        "timestamp": "2026-02-01T10:30:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2026-02-01T10:35:00Z"
      }
    ],
    "estimatedDelivery": "2026-03-16T14:00:00Z"
  }
}
```

---

### List Extensions

```bash
GET /api/bookings/clxy456def/extensions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyext001",
      "description": "Bremsbeläge müssen gewechselt werden",
      "totalAmount": 20000,
      "status": "PENDING",
      "items": [
        {
          "name": "Bremsbeläge vorne",
          "price": 120,
          "quantity": 1
        }
      ]
    }
  ]
}
```

---

### Approve Extension

```bash
POST /api/bookings/clxy456def/extensions/clxyext001/approve
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extension": {
      "id": "clxyext001",
      "status": "APPROVED",
      "approvedAt": "2026-03-15T11:00:00Z"
    },
    "paymentIntent": {
      "id": "pi_ext_abc123",
      "clientSecret": "pi_ext_abc123_secret_xyz",
      "amount": 20000
    }
  }
}
```

---

### Decline Extension

```bash
POST /api/bookings/clxy456def/extensions/clxyext001/decline
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Zu teuer"
}
```

---

## Enums

### ServiceType
- `INSPECTION`
- `OIL_SERVICE`
- `BRAKE_SERVICE`
- `TUV`
- `CLIMATE_SERVICE`
- `CUSTOM`

### BookingStatus
- `PENDING_PAYMENT` - Waiting for payment
- `CONFIRMED` - Payment received
- `JOCKEY_ASSIGNED` - Jockey assigned
- `IN_TRANSIT_TO_WORKSHOP` - En route to workshop
- `IN_WORKSHOP` - Being serviced
- `COMPLETED` - Service completed
- `IN_TRANSIT_TO_CUSTOMER` - En route to customer
- `DELIVERED` - Delivered to customer
- `CANCELLED` - Cancelled

### ExtensionStatus
- `PENDING` - Awaiting approval
- `APPROVED` - Approved by customer
- `DECLINED` - Declined by customer
- `CANCELLED` - Cancelled by workshop

---

## Validation Rules

### Time Slot Format
Must match pattern: `HH:MM-HH:MM`

Examples:
- ✅ `08:00-10:00`
- ✅ `14:00-16:00`
- ❌ `8:00-10:00`
- ❌ `08:00`

### Pickup Date
- Must be in ISO 8601 format
- Must be in the future

### Cancellation
Only allowed for statuses:
- `PENDING_PAYMENT`
- `CONFIRMED`
- `JOCKEY_ASSIGNED`

---

## Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., time slot not available)
- `500` - Internal Server Error

---

## Testing with cURL

### Create Booking
```bash
curl -X POST https://api.b2c-autowartung.de/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "clxy123abc",
    "serviceType": "INSPECTION",
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "08:00-10:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }'
```

### List Bookings
```bash
curl -X GET "https://api.b2c-autowartung.de/api/bookings?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cancel Booking
```bash
curl -X DELETE https://api.b2c-autowartung.de/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Terminänderung"}'
```

---

## Integration Flow

### Complete Booking Flow

1. **Customer creates booking**
   ```
   POST /api/bookings
   → Returns booking with payment intent
   ```

2. **Customer completes payment**
   ```
   Frontend uses Stripe SDK with clientSecret
   → Webhook updates booking status to CONFIRMED
   ```

3. **Track booking status**
   ```
   GET /api/bookings/:id/status
   → Returns current status and history
   ```

4. **Handle extension (if needed)**
   ```
   GET /api/bookings/:id/extensions
   → Customer reviews extension

   POST /api/bookings/:id/extensions/:id/approve
   → Creates payment intent for extension

   Frontend completes extension payment
   → Workshop proceeds with additional work
   ```

5. **Booking completion**
   ```
   Status automatically updates:
   COMPLETED → IN_TRANSIT_TO_CUSTOMER → DELIVERED
   ```

---

## Related Services

### Payment Service
- Automatic payment intent creation
- Refund processing on cancellation
- Extension payment handling

### Email Service
- Booking confirmation email
- Status update emails
- Extension notification emails

### Notification Service
- Push notifications for status updates
- Extension approval/decline notifications
- Delivery reminders

### Analytics Service
- Booking creation tracking
- Cancellation tracking
- Extension conversion tracking

---

## Support

For detailed documentation, see: [BOOKING_API_DOCUMENTATION.md](./BOOKING_API_DOCUMENTATION.md)

For API support:
- Email: api-support@b2c-autowartung.de
- Documentation: https://docs.b2c-autowartung.de
