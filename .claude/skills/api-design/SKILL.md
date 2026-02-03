---
name: api-design
description: API design patterns and conventions for the B2C app. Use when creating or reviewing API endpoints.
user-invocable: false
---

# API Design Conventions

Follow these patterns when designing API endpoints for the B2C Autowartungs-App.

## RESTful Naming

### Resource URLs

Use plural nouns for resources:

```
✓ GET    /api/bookings
✓ POST   /api/bookings
✓ GET    /api/bookings/:id
✓ PATCH  /api/bookings/:id
✓ DELETE /api/bookings/:id
```

### Nested Resources

```
✓ GET    /api/bookings/:id/services
✓ POST   /api/bookings/:id/extensions
✓ GET    /api/users/:id/vehicles
```

## Request/Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "service": "oil-service",
    "price": 22900,
    "status": "confirmed"
  },
  "meta": {
    "timestamp": "2026-02-01T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Der gewählte Zeitslot ist nicht mehr verfügbar",
    "details": {
      "requestedSlot": "2026-02-05T10:00:00Z",
      "nextAvailable": "2026-02-05T14:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2026-02-01T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## Error Codes

### Business Logic Errors (400 range)

- `INVALID_VEHICLE_CLASS`: Fahrzeugklasse ungültig
- `SLOT_UNAVAILABLE`: Zeitslot nicht verfügbar
- `INVALID_POSTAL_CODE`: PLZ außerhalb Servicegebiet
- `PAYMENT_FAILED`: Zahlung fehlgeschlagen
- `VEHICLE_NOT_FOUND`: Fahrzeug nicht gefunden
- `BOOKING_NOT_FOUND`: Buchung nicht gefunden
- `EXTENSION_REJECTED`: Auftragserweiterung abgelehnt

### System Errors (500 range)

- `ODOO_UNAVAILABLE`: Odoo-Integration nicht erreichbar
- `PAYMENT_PROVIDER_ERROR`: Payment-Provider Fehler
- `DATABASE_ERROR`: Datenbankfehler

## Validation

### Request Validation

Always validate:
- Required fields present
- Data types correct
- Business rules satisfied
- Authorization valid

### Response Structure

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}
```

## Authentication

Use JWT tokens in Authorization header:

```
Authorization: Bearer <token>
```

Public endpoints (no auth required):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/services` (pricing info)
- `GET /api/availability` (slot checking)

## Rate Limiting

- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour
- Payment endpoints: 10 requests/minute

Include rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1643723400
```

## Pricing Format

Always use cents (integers) for prices:

```json
{
  "service": "oil-service",
  "basePrice": 22000,
  "conciergePrice": 5000,
  "totalPrice": 27000,
  "currency": "EUR"
}
```

## Timestamps

Use ISO 8601 format with UTC timezone:

```json
{
  "createdAt": "2026-02-01T10:30:00Z",
  "pickupTime": "2026-02-05T08:00:00Z",
  "returnTime": "2026-02-05T18:00:00Z"
}
```

## Pagination

For list endpoints:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

Query parameters:
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 20, max: 100)
- `sort`: Sort field
- `order`: Sort order (asc/desc)

## Idempotency

Payment and booking endpoints must be idempotent:

```
Idempotency-Key: <uuid>
```

Store idempotency keys for 24 hours.

## CORS

Allow origins:
- Production: `https://app.domain.com`
- Staging: `https://staging.domain.com`
- Development: `http://localhost:3000`

## Versioning

Use URL versioning:

```
/api/v1/bookings
/api/v2/bookings
```

Maintain v1 for 12 months after v2 launch.

## Security Headers

Always include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## Logging

Log all requests with:
- Request ID
- User ID (if authenticated)
- Endpoint
- Method
- Status code
- Response time
- Error details (if failed)

## Documentation

Use OpenAPI 3.0 for API documentation.
Auto-generate from code annotations.
