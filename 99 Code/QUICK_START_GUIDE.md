# Quick Start Guide - E2E Demo

## Overview

Complete E2E flow demonstration: Customer booking → Jockey pickup → Workshop service + extension → Customer approval → Auto-payment capture → Jockey delivery

**Status:** ✅ READY

---

## 1. Start the Application

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Expected output: `Server running on port 5001`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Expected output: `Ready on http://localhost:3000`

### Terminal 3: Database
```bash
# If not already running
docker-compose up -d
```

---

## 2. Test Credentials

### Jockey
- Username: `jockey-1`
- Password: `jockey123`
- URL: http://localhost:3000/de/jockey/login

### Workshop
- Username: `werkstatt-witten`
- Password: `werkstatt123`
- URL: http://localhost:3000/de/workshop/login

### Customer (register during booking flow)
- Email: `demo@test.com`
- Password: `demo123` (or create your own during registration)

### Test Payment Card
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 3. Quick Test Flow (5 minutes)

### Step 1: Create Booking (2 min)
1. Go to http://localhost:3000/de
2. Click "Jetzt buchen"
3. Fill in vehicle: VW Golf, 2020, 45000 km
4. Select services: Inspektion + Ölwechsel
5. Choose date/time
6. Address: Musterstraße 123, 44135 Dortmund
7. **Register/Login** (REQUIRED):
   - New users: Email: demo@test.com, Password: demo123, Name: Demo User
   - Existing users: Login with credentials
8. Review and confirm booking
9. Pay with test card
10. ✅ Booking confirmed

### Step 2: Jockey Pickup (30 sec)
1. Login as jockey
2. See assignment
3. Click "Start Pickup"
4. Click "Complete Pickup"
5. ✅ Vehicle in transit

### Step 3: Workshop Extension (1 min)
1. Login as workshop
2. Find booking
3. Update status to "IN_SERVICE"
4. Create extension:
   - Description: "Bremsbeläge verschlissen"
   - Items: Bremsbeläge vorne (189.99€), hinten (169.99€)
5. ✅ Extension sent

### Step 4: Customer Approval (1 min)
1. Login as customer (demo@test.com)
2. Go to booking details
3. See extension
4. Click "Genehmigen & Bezahlen"
5. Enter test card
6. ✅ Payment authorized (NOT captured)

### Step 5: Workshop Completes (30 sec)
1. Back to workshop dashboard
2. Update booking status to "COMPLETED"
3. ✅ Payment AUTO-CAPTURED
4. ✅ Return assignment created

### Step 6: Jockey Delivery (30 sec)
1. Back to jockey dashboard
2. See new RETURN assignment
3. Click "Start Delivery"
4. Click "Complete Delivery"
5. ✅ Booking DELIVERED

### Step 7: Verify (30 sec)
1. Customer dashboard: Status = DELIVERED
2. Extension shows: "Bezahlt" (green badge)
3. ✅ Complete E2E flow successful

---

## 4. Key Features to Demo

### Real-Time Updates
- Jockey dashboard refreshes every 30 seconds
- Status changes visible immediately
- Payment status updates automatically

### Smart Payment Flow
- Customer authorizes payment upfront
- NO charge until service complete
- Auto-capture on workshop completion
- Customer sees real-time payment status

### Multi-Role Coordination
- Auto-assignment creation
- Status synchronization
- Toast notifications
- Error handling

---

## 5. Troubleshooting

### Backend not starting
```bash
# Check if port 5001 is available
lsof -ti:5001
# If occupied, kill process
kill -9 $(lsof -ti:5001)
```

### Frontend not starting
```bash
# Check if port 3000 is available
lsof -ti:3000
# If occupied, kill process or use different port
kill -9 $(lsof -ti:3000)
```

### Database connection error
```bash
# Check PostgreSQL is running
docker-compose ps
# Restart if needed
docker-compose restart
```

### No assignments showing
- Check: Jockey is logged in correctly
- Check: Database has test data
- Check: Backend logs for errors
- Solution: Run `npm run seed` in backend

### Extension not capturing
- Check: Extension status is APPROVED
- Check: Stripe API key configured
- Check: Backend logs for Stripe errors
- Check: Extension has paymentIntentId

---

## 6. API Endpoints Reference

### Jockey
- `GET /api/jockeys/assignments` - Get all assignments
- `PATCH /api/jockeys/assignments/:id/status` - Update status
- `POST /api/jockeys/assignments/:id/complete` - Complete assignment

### Workshop
- `GET /api/workshops/bookings` - Get all orders
- `POST /api/workshops/bookings/:id/extensions` - Create extension
- `PATCH /api/workshops/bookings/:id/status` - Update booking status

### Payment
- `POST /api/payment/authorize-extension` - Authorize payment
- `POST /api/payment/capture-extension` - Capture payment

### Customer
- `GET /api/bookings/my-bookings` - Get customer bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/extensions/:id/approve` - Approve extension

---

## 7. Monitoring & Logs

### Backend Logs
```bash
cd backend
tail -f logs/combined.log
```

### Frontend Console
Open browser DevTools → Console

### Database Queries
```bash
docker exec -it postgres psql -U postgres -d b2c_app
# Example queries:
SELECT * FROM "JockeyAssignment" ORDER BY "createdAt" DESC LIMIT 5;
SELECT * FROM "Extension" ORDER BY "createdAt" DESC LIMIT 5;
SELECT * FROM "Booking" ORDER BY "createdAt" DESC LIMIT 5;
```

---

## 8. Clean Up After Demo

### Reset Database
```bash
cd backend
npx prisma migrate reset
npm run seed
```

### Clear Browser Data
- Open DevTools
- Application → Storage → Clear site data
- Reload page

### Restart Services
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## 9. Common Demo Scenarios

### Scenario A: Extension Declined
1. Customer declines extension instead of approving
2. Result: Extension status = DECLINED
3. Workshop can create new extension

### Scenario B: Multiple Extensions
1. Create first extension → Customer approves
2. Create second extension → Customer approves
3. Complete service → Both payments captured
4. Verify: Both show "Bezahlt"

### Scenario C: Service Without Extension
1. Complete booking flow
2. Workshop marks COMPLETED without creating extension
3. Return assignment still created
4. Normal flow continues

---

## 10. Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/b2c_app"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=5001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5001"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 11. Performance Expectations

### Response Times
- API calls: < 200ms
- Dashboard load: < 1s
- Payment authorization: < 3s
- Payment capture: < 2s

### Auto-Refresh
- Jockey dashboard: 30s interval
- No manual refresh needed

---

## 12. Demo Tips

1. **Open 4 browser tabs** before starting
2. **Use Incognito** for customer booking
3. **Keep DevTools open** to show API calls
4. **Highlight toast notifications** when they appear
5. **Show payment status change** (yellow → green)
6. **Demonstrate auto-refresh** by waiting 30s
7. **Check backend logs** to show capture event
8. **Show database** to verify status updates

---

## 13. Next Steps After Demo

If demo is successful:

### Short Term
- [ ] Add real image upload
- [ ] Implement WebSocket for real-time updates
- [ ] Add push notifications
- [ ] Build admin dashboard

### Medium Term
- [ ] Add SMS notifications
- [ ] Implement analytics
- [ ] Add reporting
- [ ] Load testing

### Long Term
- [ ] Production deployment
- [ ] Monitoring & alerting
- [ ] Automated testing
- [ ] Documentation

---

## Support

For detailed demo flow: See `DEMO_SCRIPT.md`
For technical details: See `E2E_IMPLEMENTATION_COMPLETE.md`
For issues: Check `DEMO_SCRIPT.md` → Troubleshooting section

---

**Ready to demo!** 🚀
