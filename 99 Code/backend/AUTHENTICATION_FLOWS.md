# Authentication Flows - Visual Documentation

This document provides visual representations of the three authentication flows implemented in the B2C Autowartung platform.

---

## 1. Customer Authentication Flow (Magic Link)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER MAGIC LINK FLOW                         │
└──────────────────────────────────────────────────────────────────────┘

Frontend                    Backend                     Database        Email
   │                           │                            │             │
   │  1. Enter Email           │                            │             │
   ├──────────────────────────>│                            │             │
   │  POST /auth/customer/     │                            │             │
   │  magic-link               │                            │             │
   │  { email: "..." }         │                            │             │
   │                           │                            │             │
   │                           │  2. Validate Email         │             │
   │                           │────────────────────────────>│             │
   │                           │                            │             │
   │                           │  3. Find/Create User       │             │
   │                           │<────────────────────────────│             │
   │                           │                            │             │
   │                           │  4. Generate Magic Token   │             │
   │                           │                            │             │
   │                           │  5. Send Email             │             │
   │                           │─────────────────────────────────────────>│
   │                           │                            │             │
   │  6. Success Response      │                            │             │
   │<──────────────────────────│                            │             │
   │  { success: true,         │                            │             │
   │    message: "sent" }      │                            │             │
   │                           │                            │             │
   │                           │                            │   7. User   │
   │                           │                            │   Receives  │
   │                           │                            │   Email     │
   │                           │                            │<────────────│
   │                           │                            │             │
   │  8. Click Magic Link      │                            │             │
   ├──────────────────────────>│                            │             │
   │  GET /auth/customer/      │                            │             │
   │  verify?token=...         │                            │             │
   │                           │                            │             │
   │                           │  9. Verify Token           │             │
   │                           │                            │             │
   │                           │ 10. Find User              │             │
   │                           │────────────────────────────>│             │
   │                           │<────────────────────────────│             │
   │                           │                            │             │
   │                           │ 11. Generate JWT Token     │             │
   │                           │                            │             │
   │ 12. JWT Token + User      │                            │             │
   │<──────────────────────────│                            │             │
   │  { token: "eyJ...",       │                            │             │
   │    user: {...} }          │                            │             │
   │                           │                            │             │
   │ 13. Store Token           │                            │             │
   │    (localStorage)         │                            │             │
   │                           │                            │             │
   │ 14. Redirect to Dashboard │                            │             │
   │                           │                            │             │
```

**Key Points:**
- Token expires in 15 minutes
- Auto-creates customer account if doesn't exist
- Rate limited to 5 requests per hour per IP
- Email contains secure one-time use link

---

## 2. Jockey/Workshop Authentication Flow (Username/Password)

```
┌──────────────────────────────────────────────────────────────────────┐
│                   JOCKEY/WORKSHOP LOGIN FLOW                         │
└──────────────────────────────────────────────────────────────────────┘

Frontend                    Backend                     Database
   │                           │                            │
   │  1. Enter Credentials     │                            │
   ├──────────────────────────>│                            │
   │  POST /auth/jockey/login  │                            │
   │  { username: "...",       │                            │
   │    password: "..." }      │                            │
   │                           │                            │
   │                           │  2. Validate Format        │
   │                           │                            │
   │                           │  3. Find User by Username  │
   │                           │────────────────────────────>│
   │                           │     WHERE role = JOCKEY    │
   │                           │<────────────────────────────│
   │                           │     { user with hash }     │
   │                           │                            │
   │                           │  4. Compare Password Hash  │
   │                           │     (bcrypt.compare)       │
   │                           │                            │
   │                           │  5. Check if Active        │
   │                           │                            │
   │                           │  6. Generate JWT Token     │
   │                           │                            │
   │                           │  7. Update lastLoginAt     │
   │                           │────────────────────────────>│
   │                           │                            │
   │  8. JWT Token + User      │                            │
   │<──────────────────────────│                            │
   │  { success: true,         │                            │
   │    token: "eyJ...",       │                            │
   │    user: {...} }          │                            │
   │                           │                            │
   │  9. Store Token           │                            │
   │    (localStorage)         │                            │
   │                           │                            │
   │ 10. Redirect to Dashboard │                            │
   │                           │                            │
```

**Key Points:**
- Password hashed with bcrypt (10 salt rounds)
- Rate limited to 5 attempts per 15 minutes per IP
- Username is unique per role (jockey1 can exist for both JOCKEY and WORKSHOP)
- JWT token expires in 7 days

---

## 3. Protected Route Access Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                      PROTECTED ROUTE ACCESS                          │
└──────────────────────────────────────────────────────────────────────┘

Frontend                    Backend Middleware           Controller
   │                           │                            │
   │  1. Make Request          │                            │
   ├──────────────────────────>│                            │
   │  GET /api/bookings        │                            │
   │  Authorization:           │                            │
   │  Bearer eyJ...            │                            │
   │                           │                            │
   │                      ┌────┴────┐                       │
   │                      │ Extract │                       │
   │                      │  Token  │                       │
   │                      └────┬────┘                       │
   │                           │                            │
   │                      ┌────┴────┐                       │
   │                      │ Verify  │                       │
   │                      │   JWT   │                       │
   │                      └────┬────┘                       │
   │                           │                            │
   │                      ┌────┴────┐                       │
   │                      │  Check  │                       │
   │                      │  Role   │                       │
   │                      └────┬────┘                       │
   │                           │                            │
   │                           │  2. Attach req.user        │
   │                           │  { userId, email, role }   │
   │                           │                            │
   │                           │  3. Pass to Controller     │
   │                           ├───────────────────────────>│
   │                           │                            │
   │                           │  4. Process Request        │
   │                           │                            │
   │  5. Response              │                            │
   │<──────────────────────────┼────────────────────────────│
   │  { data: [...] }          │                            │
   │                           │                            │

┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                                │
└─────────────────────────────────────────────────────────────────────┘

No Token Provided:
   401 Unauthorized
   { success: false, message: "No authentication token provided" }

Invalid Token:
   401 Unauthorized
   { success: false, message: "Invalid authentication token" }

Token Expired:
   401 Unauthorized
   { success: false, message: "Token has expired" }

Insufficient Permissions:
   403 Forbidden
   { success: false, message: "Insufficient permissions" }
```

---

## 4. RBAC Permission Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS CONTROL                         │
└──────────────────────────────────────────────────────────────────────┘

Route/Action                      CUSTOMER  JOCKEY  WORKSHOP  ADMIN
─────────────────────────────────────────────────────────────────────
Customer Routes:
  - View own bookings                ✓        ✗       ✗        ✓
  - Create booking                   ✓        ✗       ✗        ✓
  - Cancel booking                   ✓        ✗       ✗        ✓
  - View own vehicles                ✓        ✗       ✗        ✓

Jockey Routes:
  - View assigned bookings           ✗        ✓       ✗        ✓
  - Update booking status            ✗        ✓       ✗        ✓
  - Mark pickup/delivery             ✗        ✓       ✗        ✓
  - View available slots             ✗        ✓       ✓        ✓

Workshop Routes:
  - View all bookings                ✗        ✗       ✓        ✓
  - Manage time slots                ✗        ✗       ✓        ✓
  - Update service status            ✗        ✗       ✓        ✓
  - Assign jockeys                   ✗        ✗       ✓        ✓

Admin Routes:
  - View all users                   ✗        ✗       ✗        ✓
  - Manage users                     ✗        ✗       ✗        ✓
  - View analytics                   ✗        ✗       ✗        ✓
  - System configuration             ✗        ✗       ✗        ✓

Common Routes:
  - View own profile                 ✓        ✓       ✓        ✓
  - Update own profile               ✓        ✓       ✓        ✓
  - Logout                           ✓        ✓       ✓        ✓
```

---

## 5. Token Lifecycle

```
┌──────────────────────────────────────────────────────────────────────┐
│                        TOKEN LIFECYCLE                               │
└──────────────────────────────────────────────────────────────────────┘

Magic Link Token (15 min):
──────────────────────────────────────────────────────────────────────
Created                    Expires                   Deleted
   │                          │                         │
   ├─────────[15 min]────────>│                         │
   │                          │                         │
   │  Valid for verification  │  Token expired          │
   │                          │  Must request new link  │
   │                          │                         │
   └──────────────────────────┴─────────────────────────┘

JWT Access Token (7 days):
──────────────────────────────────────────────────────────────────────
Created              Active Use              Expires        Removed
   │                     │                      │              │
   ├────────[7 days]────>│                      │              │
   │                     │                      │              │
   │  Valid for API      │  Can refresh         │  Logout or   │
   │  requests           │  before expiry       │  Manual      │
   │                     │  (optional)          │  Removal     │
   │                     │                      │              │
   └─────────────────────┴──────────────────────┴──────────────┘

Session States:
──────────────────────────────────────────────────────────────────────
1. NOT_AUTHENTICATED  →  No token present
2. AUTHENTICATING     →  Verifying magic link / logging in
3. AUTHENTICATED      →  Valid token, active session
4. EXPIRED            →  Token expired, must re-authenticate
5. LOGGED_OUT         →  User manually logged out
```

---

## 6. Security Measures

```
┌──────────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                                  │
└──────────────────────────────────────────────────────────────────────┘

Layer 1: Rate Limiting
─────────────────────────────────────────────────────────────────────
  Login Endpoints:     5 requests / 15 min / IP
  Magic Link:          5 requests / 1 hour / IP
  General API:         100 requests / 15 min / IP

Layer 2: Input Validation
─────────────────────────────────────────────────────────────────────
  Email:               Valid format, max length
  Password:            Min 8 characters
  Username:            Valid characters, unique per role

Layer 3: Password Security
─────────────────────────────────────────────────────────────────────
  Algorithm:           bcrypt
  Salt Rounds:         10
  Storage:             Never in plain text
  Transmission:        HTTPS only (production)

Layer 4: Token Security
─────────────────────────────────────────────────────────────────────
  JWT Secret:          Min 32 chars, cryptographically random
  Magic Link Secret:   Separate from JWT secret
  Signature:           HMAC-SHA256
  Expiry:              Short for magic links, long for access

Layer 5: Transport Security
─────────────────────────────────────────────────────────────────────
  HTTPS:               Required in production
  CORS:                Restricted to known origins
  Headers:             Helmet.js security headers
  Cookies:             httpOnly, secure, sameSite flags

Layer 6: Access Control
─────────────────────────────────────────────────────────────────────
  Authentication:      Required for protected routes
  Authorization:       Role-based permissions
  Ownership:           Users can only access own resources
  Admin Override:      Admin can access all resources
```

---

## 7. Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING                                   │
└──────────────────────────────────────────────────────────────────────┘

Request → Validation → Authentication → Authorization → Controller
   │          │              │               │              │
   │          ✗              │               │              │
   │          │              │               │              │
   │      400 Bad Request    │               │              │
   │      Invalid Input      │               │              │
   │                         │               │              │
   │                         ✗               │              │
   │                         │               │              │
   │                    401 Unauthorized     │              │
   │                    Invalid Token        │              │
   │                                         │              │
   │                                         ✗              │
   │                                         │              │
   │                                    403 Forbidden       │
   │                                    Insufficient Perms  │
   │                                                        │
   │                                                        ✗
   │                                                        │
   │                                                   500 Error
   │                                                   Server Error
   │
   └────────────────────────────────────────────────────────────────────

Error Response Format:
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE" (optional),
  "stack": "..." (development only)
}
```

---

## 8. Database Queries Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     DATABASE OPERATIONS                              │
└──────────────────────────────────────────────────────────────────────┘

Magic Link Flow:
─────────────────────────────────────────────────────────────────────
1. findUserByEmail(email)
   → SELECT * FROM User WHERE email = ?

2. createCustomer(email) [if not exists]
   → INSERT INTO User (email, role) VALUES (?, 'CUSTOMER')

3. updateLastLogin(userId)
   → UPDATE User SET lastLoginAt = NOW() WHERE id = ?

Username/Password Flow:
─────────────────────────────────────────────────────────────────────
1. findUserByUsername(username, role)
   → SELECT * FROM User WHERE username = ? AND role = ?

2. updateLastLogin(userId)
   → UPDATE User SET lastLoginAt = NOW() WHERE id = ?

Protected Routes:
─────────────────────────────────────────────────────────────────────
1. findUserById(userId) [from JWT]
   → SELECT * FROM User WHERE id = ?

2. Resource ownership verification
   → SELECT * FROM Resource WHERE id = ? AND userId = ?

Indexes Used:
─────────────────────────────────────────────────────────────────────
- User.email (unique)
- User.username (unique)
- User.role
- Session.token
- Session.userId
```

---

## Summary

This authentication system provides:

1. **Three distinct authentication methods** for different user types
2. **Secure token-based authentication** with JWT
3. **Comprehensive RBAC** for access control
4. **Rate limiting** to prevent abuse
5. **Email-based passwordless login** for customers
6. **Traditional username/password** for staff
7. **Flexible and extensible** architecture

All flows are production-ready and follow security best practices.
