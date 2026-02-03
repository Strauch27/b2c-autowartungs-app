# Booking System Testing Guide

## Quick Start Testing

### 1. Database Test (Already Passed ✅)
```bash
cd backend
node src/scripts/test-booking-simple.js
```

**Expected Output**:
```
✅ Booking created successfully!
Booking Number: BK26020001
Status: CONFIRMED
Total Price: 238 EUR
Services: [INSPECTION, OIL_SERVICE]
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

Server should start on `http://localhost:5001`

### 3. Start Frontend Server
```bash
cd ../frontend
npm run dev
```

Frontend should start on `http://localhost:3000`

### 4. Manual Testing Flow

#### Step 1: Create Test Customer (if needed)
If you don't have a customer account, create one:
- Go to signup/registration page
- Create customer account
- Login

#### Step 2: Access Booking Page
```
http://localhost:3000/de/booking
```
or
```
http://localhost:3000/en/booking
```

#### Step 3: Fill Booking Form

**Vehicle Information (Step 1)**:
- Brand: `VW`
- Model: `Golf 7`
- Year: `2018`
- Mileage: `50000`
- Save vehicle: ✓ (optional)

**Service Selection (Step 2)**:
- Select one or more services:
  - ✓ Inspection (149 EUR)
  - ✓ Oil Service (89 EUR)
  - ☐ Brake Service (199 EUR)
  - ☐ AC Service (119 EUR)

**Pickup & Delivery (Step 3)**:
- Pickup Date: Tomorrow or later
- Pickup Time: `09:00-11:00`
- Street: `Teststraße 123`
- ZIP: `80331`
- City: `München`
- Return Date: 1 week later
- Return Time: `17:00-19:00`

**Confirmation (Step 4)**:
- Review all details
- Accept terms
- Click "Jetzt buchen" / "Book now"

#### Step 4: Verify Success
After submission, you should:
1. See success toast with booking number
2. Be redirected to dashboard
3. See your booking in the list

### 5. Verify in Database

```bash
cd backend
npx prisma studio
```

Navigate to `Booking` table and verify:
- New booking exists
- `services` field contains JSON array
- `totalPrice` is correct sum of services
- Vehicle is created/linked
- All fields are populated

## API Testing with cURL

### Create Booking
```bash
# Get auth token first (replace with your token)
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehicle": {
      "brand": "VW",
      "model": "Golf 7",
      "year": 2018,
      "mileage": 50000,
      "saveVehicle": true
    },
    "services": ["inspection", "oil"],
    "pickup": {
      "date": "2026-02-05T09:00:00Z",
      "timeSlot": "09:00-11:00",
      "street": "Teststraße 123",
      "city": "München",
      "postalCode": "80331"
    },
    "delivery": {
      "date": "2026-02-12T17:00:00Z",
      "timeSlot": "17:00-19:00"
    },
    "customerNotes": "API test booking"
  }'
```

### Get All Bookings
```bash
curl -X GET http://localhost:5001/api/bookings \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Booking
```bash
curl -X GET http://localhost:5001/api/bookings/{booking-id} \
  -H "Authorization: Bearer $TOKEN"
```

## Expected API Responses

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cml3uu8qc000206aefv4izb32",
    "bookingNumber": "BK26020001",
    "status": "CONFIRMED",
    "serviceType": "INSPECTION",
    "services": [
      { "type": "INSPECTION", "price": 149 },
      { "type": "OIL_SERVICE", "price": 89 }
    ],
    "totalPrice": "238.00",
    "vehicle": {
      "id": "...",
      "brand": "VW",
      "model": "Golf 7",
      "year": 2018,
      "mileage": 50000
    },
    "customer": {
      "id": "...",
      "email": "kunde@test.de",
      "firstName": "Max",
      "lastName": "Mustermann"
    },
    "pickupDate": "2026-02-05T09:00:00.000Z",
    "pickupTimeSlot": "09:00-11:00",
    "deliveryDate": "2026-02-12T17:00:00.000Z",
    "deliveryTimeSlot": "17:00-19:00",
    "createdAt": "2026-02-01T...",
    "updatedAt": "2026-02-01T..."
  },
  "message": "Booking created and confirmed successfully."
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "At least one service must be selected"
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

## Common Issues & Solutions

### Issue: "Authentication required"
**Solution**: Make sure you're logged in and the token is valid
```javascript
// Check token in browser console
localStorage.getItem('auth_token')
```

### Issue: "Invalid vehicle ID"
**Solution**: Use new DTO format with vehicle data, not vehicleId

### Issue: "Selected time slot is not available"
**Solution**: Choose a different date or time slot

### Issue: "Pickup date must be in the future"
**Solution**: Select tomorrow or later

### Issue: Connection refused to localhost:5000
**Solution**: Make sure backend server is running
```bash
cd backend
npm run dev
```

### Issue: TypeError in frontend
**Solution**: Make sure frontend can import from `@/lib/api/bookings`
```bash
# Check file exists
ls frontend/lib/api/bookings.ts
```

## Validation Rules

### Vehicle
- Brand: Required, non-empty string
- Model: Required, non-empty string
- Year: Number between 1994 and current year + 1
- Mileage: Number between 0 and 1,000,000

### Services
- At least 1 service must be selected
- Valid service IDs: `inspection`, `oil`, `brakes`, `ac`, `tuv`

### Pickup/Delivery
- Date: Must be in the future
- Time slot: Format `HH:MM-HH:MM` (e.g., `09:00-11:00`)
- Street: Required
- City: Required
- Postal code: Required

## Database Verification Queries

### Check latest booking
```sql
SELECT
  bookingNumber,
  status,
  serviceType,
  services,
  totalPrice,
  pickupDate,
  deliveryDate
FROM "Booking"
ORDER BY createdAt DESC
LIMIT 1;
```

### Check customer's vehicles
```sql
SELECT
  v.*,
  COUNT(b.id) as booking_count
FROM "Vehicle" v
LEFT JOIN "Booking" b ON v.id = b.vehicleId
WHERE v.customerId = 'customer-id-here'
GROUP BY v.id;
```

### Check bookings with multiple services
```sql
SELECT
  bookingNumber,
  services,
  totalPrice
FROM "Booking"
WHERE services IS NOT NULL
  AND jsonb_array_length(services::jsonb) > 1;
```

## Performance Monitoring

### Check booking creation time
Monitor the time between:
1. Frontend form submission
2. API request sent
3. Database insertion
4. Response received
5. UI update

**Target**: < 2 seconds end-to-end

### Check database queries
```bash
# Enable query logging in Prisma
DEBUG=prisma:query node src/scripts/test-booking-simple.js
```

## Next Testing Steps

1. ✅ Database integration test
2. ⏳ Backend API endpoint test
3. ⏳ Frontend API client test
4. ⏳ End-to-end booking flow
5. ⏳ Error handling scenarios
6. ⏳ Edge cases (duplicate vehicles, time conflicts)
7. ⏳ Load testing (multiple concurrent bookings)

## Success Criteria

- ✅ Booking created in database
- ⏳ Booking appears in frontend dashboard
- ⏳ Vehicle automatically created/found
- ⏳ Multiple services correctly stored
- ⏳ Price calculation accurate
- ⏳ Proper error messages shown
- ⏳ No console errors
- ⏳ Fast response times (< 2s)

## Support

If issues persist:
1. Check backend logs: `console.log` output in terminal
2. Check frontend logs: Browser DevTools console
3. Check network requests: Browser DevTools Network tab
4. Verify database state: `npx prisma studio`
5. Review this integration summary: `BOOKING_INTEGRATION_SUMMARY.md`
