# Jockey Assignment API Testing Guide

Quick reference for testing the Jockey Assignment APIs during development and demo.

## Prerequisites

1. Backend server running on `http://localhost:5001`
2. Test users seeded (run `npm run db:seed` if needed)

## Test Users

```bash
# Jockey
Username: jockey
Password: jockey
Email: jockey@jockey.de

# Workshop
Username: werkstatt
Password: werkstatt
Email: werkstatt@werkstatt.de

# Customer
Email: kunde@kunde.de
Password: kunde
```

---

## Complete E2E Test Workflow

### Step 1: Login as Jockey
```bash
curl -X POST http://localhost:5001/api/auth/jockey/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jockey","password":"jockey"}' | jq .

# Save the token for subsequent requests
export JOCKEY_TOKEN="<token from response>"
```

### Step 2: Create Test Booking (Guest Checkout)
```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "testcustomer@example.com",
      "firstName": "Test",
      "lastName": "Customer",
      "phone": "+49123456789"
    },
    "vehicle": {
      "brand": "VW",
      "model": "Golf",
      "year": 2018,
      "mileage": 50000
    },
    "services": ["inspection"],
    "pickup": {
      "date": "2026-02-10",
      "timeSlot": "09:00",
      "street": "Teststrasse 123",
      "city": "Berlin",
      "postalCode": "10115"
    },
    "delivery": {
      "date": "2026-02-12",
      "timeSlot": "15:00"
    },
    "customerNotes": "Test booking for jockey assignment"
  }' | jq .

# Save the booking ID
export BOOKING_ID="<id from response>"
```

Expected result:
- Booking created with status `JOCKEY_ASSIGNED`
- PICKUP assignment auto-created for jockey

### Step 3: Get Jockey Assignments
```bash
curl -X GET http://localhost:5001/api/jockeys/assignments \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .

# Get the first assignment ID
export ASSIGNMENT_ID="<id from first assignment>"
```

Expected result:
- Array of assignments
- At least one PICKUP assignment visible

### Step 4: Jockey Starts Pickup (EN_ROUTE)
```bash
curl -X PATCH "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/status" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"EN_ROUTE"}' | jq .
```

### Step 5: Jockey Arrives at Location
```bash
curl -X PATCH "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/status" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"AT_LOCATION"}' | jq .
```

Expected result:
- `arrivedAt` timestamp is set automatically

### Step 6: Save Handover Data
```bash
curl -X POST "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/handover" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photos": ["photo1.jpg", "photo2.jpg"],
    "customerSignature": "data:image/png;base64,xyz",
    "notes": "Vehicle in good condition"
  }' | jq .
```

### Step 7: Complete Pickup Assignment
```bash
curl -X POST "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/complete" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

Expected result:
- Assignment status → `COMPLETED`
- Booking status → `IN_TRANSIT_TO_WORKSHOP`

### Step 8: Login as Workshop
```bash
curl -X POST http://localhost:5001/api/auth/workshop/login \
  -H "Content-Type: application/json" \
  -d '{"username":"werkstatt","password":"werkstatt"}' | jq .

export WORKSHOP_TOKEN="<token from response>"
```

### Step 9: Workshop Updates to IN_WORKSHOP
```bash
curl -X PUT "http://localhost:5001/api/workshops/orders/$BOOKING_ID/status" \
  -H "Authorization: Bearer $WORKSHOP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_WORKSHOP"}' | jq .
```

### Step 10: Workshop Completes Service
```bash
curl -X PUT "http://localhost:5001/api/workshops/orders/$BOOKING_ID/status" \
  -H "Authorization: Bearer $WORKSHOP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}' | jq .
```

Expected result:
- Booking status → `COMPLETED`
- RETURN assignment auto-created for jockey

### Step 11: Get Updated Assignments (Jockey)
```bash
curl -X GET http://localhost:5001/api/jockeys/assignments \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .

# Find the RETURN assignment for the booking
export RETURN_ASSIGNMENT_ID="<id of RETURN assignment>"
```

Expected result:
- RETURN assignment visible with type `RETURN` and status `ASSIGNED`

### Step 12: Complete Return Assignment
```bash
curl -X POST "http://localhost:5001/api/jockeys/assignments/$RETURN_ASSIGNMENT_ID/complete" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "handoverData": {
      "photos": ["return_photo1.jpg"],
      "customerSignature": "data:image/png;base64,abc",
      "ronjaSignature": "data:image/png;base64,def",
      "notes": "Vehicle returned in excellent condition"
    }
  }' | jq .
```

Expected result:
- Assignment status → `COMPLETED`
- Booking status → `DELIVERED`

### Step 13: Verify Final Booking Status
```bash
curl -X GET "http://localhost:5001/api/workshops/orders/$BOOKING_ID" \
  -H "Authorization: Bearer $WORKSHOP_TOKEN" | jq '{bookingNumber: .data.bookingNumber, status: .data.status}'
```

Expected result:
```json
{
  "bookingNumber": "BK26020006",
  "status": "DELIVERED"
}
```

---

## Quick Test Commands

### Get All Assignments
```bash
curl -X GET http://localhost:5001/api/jockeys/assignments \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .
```

### Filter by Status
```bash
# Only assigned
curl -X GET "http://localhost:5001/api/jockeys/assignments?status=ASSIGNED" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .

# Only completed
curl -X GET "http://localhost:5001/api/jockeys/assignments?status=COMPLETED" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .
```

### Get Single Assignment
```bash
curl -X GET "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" | jq .
```

### Update Status Only
```bash
curl -X PATCH "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/status" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}' | jq .
```

---

## Assignment Status Flow

```
ASSIGNED        → Initial state when assignment created
   ↓
EN_ROUTE        → Jockey starts driving to location
   ↓
AT_LOCATION     → Jockey arrives (sets arrivedAt timestamp)
   ↓
IN_PROGRESS     → Jockey is performing handover
   ↓
COMPLETED       → Handover complete (sets completedAt, updates booking status)
```

Alternative: `CANCELLED` at any point

---

## Error Scenarios

### 1. Unauthorized Access
```bash
# Try to access without token
curl -X GET http://localhost:5001/api/jockeys/assignments
# Returns: {"success": false, "message": "No authentication token provided"}

# Try to access with customer token
curl -X GET http://localhost:5001/api/jockeys/assignments \
  -H "Authorization: Bearer <customer_token>"
# Returns: {"success": false, "message": "Insufficient permissions"}
```

### 2. Invalid Assignment ID
```bash
curl -X GET http://localhost:5001/api/jockeys/assignments/invalid-id \
  -H "Authorization: Bearer $JOCKEY_TOKEN"
# Returns: {"success": false, "error": {"code": "ASSIGNMENT_NOT_FOUND"}}
```

### 3. Invalid Status
```bash
curl -X PATCH "http://localhost:5001/api/jockeys/assignments/$ASSIGNMENT_ID/status" \
  -H "Authorization: Bearer $JOCKEY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"INVALID_STATUS"}'
# Returns: {"success": false, "error": {"code": "VALIDATION_ERROR"}}
```

---

## Database Queries for Verification

```sql
-- Check all assignments
SELECT * FROM jockey_assignments ORDER BY created_at DESC;

-- Check assignments for specific booking
SELECT * FROM jockey_assignments WHERE booking_id = 'cml464nt9000106h0qepez9sr';

-- Check booking status progression
SELECT id, booking_number, status, created_at, updated_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Get all jockeys
SELECT id, email, first_name, last_name, role, is_active
FROM users
WHERE role = 'JOCKEY';
```

---

## Troubleshooting

### Server Not Responding
```bash
# Check if server is running
curl http://localhost:5001/health
# Should return: {"status":"ok","timestamp":"...","service":"autowartungs-app-backend"}

# Restart server
cd /Users/stenrauch/Documents/B2C\ App\ v2/99\ Code/backend
npm run dev
```

### No Jockey Available
```bash
# Check if jockey user exists
curl -X POST http://localhost:5001/api/auth/jockey/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jockey","password":"jockey"}'

# If no jockey exists, run seed
npm run db:seed
```

### Assignment Not Created
- Check server logs for errors
- Verify jockey user exists and is active
- Check if booking was created successfully
- Verify booking status is JOCKEY_ASSIGNED

---

## Demo Script

For live demo, follow this condensed flow:

1. **Show existing assignments:** `GET /api/jockeys/assignments`
2. **Update to EN_ROUTE:** Demonstrate jockey starting journey
3. **Update to AT_LOCATION:** Show automatic timestamp tracking
4. **Show handover modal:** Save photos and signatures
5. **Complete assignment:** Show booking status update
6. **Workshop completes service:** Demonstrate return assignment creation
7. **Complete return:** Show final DELIVERED status

---

## Notes

- All timestamps are in UTC
- Assignment IDs are CUIDs
- Booking numbers follow format: BK{YYMMDD}{sequence}
- Photos/signatures are stored as strings (base64 or URLs)
- Same jockey is preferred for pickup and return
