# API Quick Reference

## Base URL
```
http://localhost:5001/api
```

## Authentication
Include JWT token in header:
```
Authorization: Bearer <token>
```

---

## Vehicles API
**Auth Required:** Customer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | List all customer vehicles |
| GET | `/vehicles/:id` | Get vehicle details |
| POST | `/vehicles` | Create new vehicle |
| PATCH | `/vehicles/:id` | Update vehicle |
| DELETE | `/vehicles/:id` | Delete vehicle |

### Create Vehicle
```json
POST /api/vehicles
{
  "brand": "VW",
  "model": "Golf 7",
  "year": 2018,
  "mileage": 65000,
  "licensePlate": "B-AB 1234",  // optional
  "vin": "WVWZZZ1KZBW123456"    // optional
}
```

---

## Bookings API
**Auth Required:** Customer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List all customer bookings |
| GET | `/bookings/:id` | Get booking details |
| POST | `/bookings` | Create new booking |
| PATCH | `/bookings/:id` | Update booking (notes only) |
| DELETE | `/bookings/:id` | Cancel booking |

### Create Booking
```json
POST /api/bookings
{
  "vehicleId": "clx...",
  "serviceType": "INSPECTION",
  "pickupDate": "2024-02-15T00:00:00.000Z",
  "pickupTimeSlot": "08:00-10:00",
  "pickupAddress": "Hauptstraße 123",
  "pickupCity": "Berlin",
  "pickupPostalCode": "10115",
  "customerNotes": "Optional notes"
}
```

### Service Types
- `INSPECTION` - Inspection & Maintenance
- `OIL_SERVICE` - Oil Service
- `BRAKE_SERVICE` - Brake Service
- `TUV` - TÜV/HU Inspection
- `CLIMATE_SERVICE` - Climate Service
- `CUSTOM` - Custom Service

### Booking Status
- `PENDING_PAYMENT`
- `CONFIRMED`
- `JOCKEY_ASSIGNED`
- `IN_TRANSIT_TO_WORKSHOP`
- `IN_WORKSHOP`
- `COMPLETED`
- `IN_TRANSIT_TO_CUSTOMER`
- `DELIVERED`
- `CANCELLED`

---

## Services API
**Auth Required:** None (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/services` | List all service types |
| GET | `/services/:type/price?brand=&model=&year=&mileage=` | Calculate price |
| GET | `/services/brands` | List all brands |
| GET | `/services/brands/:brand/models` | List models for brand |

### Get Price
```
GET /api/services/INSPECTION/price?brand=VW&model=Golf%207&year=2018&mileage=65000

Response:
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
    }
  }
}
```

---

## Error Responses
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

### Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Server Error

---

## Testing Examples

### 1. Create Vehicle
```bash
curl -X POST http://localhost:5001/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "VW",
    "model": "Golf 7",
    "year": 2018,
    "mileage": 65000
  }'
```

### 2. Get Price (No Auth)
```bash
curl "http://localhost:5001/api/services/INSPECTION/price?brand=VW&model=Golf%207&year=2018&mileage=65000"
```

### 3. Create Booking
```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "clx...",
    "serviceType": "INSPECTION",
    "pickupDate": "2024-02-15T08:00:00.000Z",
    "pickupTimeSlot": "08:00-10:00",
    "pickupAddress": "Hauptstraße 123",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }'
```

### 4. List Bookings with Filters
```bash
curl "http://localhost:5001/api/bookings?page=1&limit=10&status=CONFIRMED" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Validation Rules

### Vehicle
- `brand`: Required, min 1 char
- `model`: Required, min 1 char
- `year`: 1994 - (current year + 1)
- `mileage`: 0 - 1,000,000

### Booking
- `vehicleId`: Required, valid CUID
- `serviceType`: Required, valid enum
- `pickupDate`: Required, ISO datetime, future date
- `pickupTimeSlot`: Required, format "HH:MM-HH:MM"
- `pickupAddress`: Required
- `pickupCity`: Required
- `pickupPostalCode`: Required

---

## Common Workflows

### Complete Booking Flow
1. **Create Vehicle** → `POST /api/vehicles`
2. **Get Price Quote** → `GET /api/services/:type/price`
3. **Create Booking** → `POST /api/bookings` (status: PENDING_PAYMENT)
4. **Complete Payment** (external)
5. **Update Booking** → `PATCH /api/bookings/:id` (status: CONFIRMED)

### Update Vehicle Mileage
```bash
PATCH /api/vehicles/:id
{
  "mileage": 70000
}
```

### Cancel Booking
```bash
DELETE /api/bookings/:id
```
Only allowed for: PENDING_PAYMENT, CONFIRMED, JOCKEY_ASSIGNED

---

## Quick Tips

1. **Time Slots**: Use format "08:00-10:00", "10:00-12:00", etc.
2. **Dates**: Always use ISO 8601 format: "2024-02-15T08:00:00.000Z"
3. **Pagination**: Use `?page=1&limit=20` for list endpoints
4. **Filtering**: Use query params: `?status=CONFIRMED`
5. **Price Source**:
   - `exact` = Found in price matrix
   - `fallback_brand` = Using brand average
   - `fallback_default` = Using default price
