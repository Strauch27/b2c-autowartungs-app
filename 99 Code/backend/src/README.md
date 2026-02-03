# B2C Autowartung - Backend Authentication System

## Overview

This directory contains the complete implementation of the multi-portal authentication system for the B2C Autowartung platform, as specified in **TECH-015** from Sprint 1.

## Implementation Status

✅ **COMPLETED**: Multi-Portal Authentication & RBAC System

### Features Implemented

1. **Customer Authentication (Magic Link)**
   - Passwordless login via email
   - Automatic account creation on first login
   - 15-minute token expiry for security
   - Email service integration (SendGrid/SMTP/Console)

2. **Jockey/Workshop Authentication (Username/Password)**
   - Secure password hashing with bcrypt
   - Username-based login
   - Role-specific authentication endpoints

3. **JWT Token Management**
   - Access token generation (7-day expiry)
   - Magic link token generation (15-minute expiry)
   - Token verification middleware
   - Secure token signing with HMAC-SHA256

4. **Role-Based Access Control (RBAC)**
   - Four user roles: CUSTOMER, JOCKEY, WORKSHOP, ADMIN
   - Role verification middleware
   - Protected route middleware
   - Ownership verification for resource access

5. **Security Features**
   - Rate limiting (5 login attempts per 15 minutes)
   - Password strength validation
   - Email format validation
   - CORS protection
   - Helmet security headers

## File Structure

```
src/
├── controllers/
│   └── auth.controller.ts           # Authentication request handlers
│
├── middleware/
│   ├── auth.ts                      # JWT verification middleware
│   └── rbac.ts                      # Role-based access control
│
├── routes/
│   └── auth.routes.ts               # Authentication endpoints
│
├── services/
│   ├── auth.service.ts              # Authentication business logic
│   ├── database.service.ts          # Database operations (Prisma)
│   └── email.service.ts             # Email sending (Magic Links)
│
├── types/
│   └── auth.types.ts                # TypeScript type definitions
│
├── utils/
│   ├── jwt.ts                       # JWT token utilities
│   └── rateLimiter.ts               # Rate limiting configuration
│
├── seeds/
│   └── auth.seed.example.ts         # Test user creation script
│
├── tests/
│   └── auth.test.example.ts         # Unit and integration tests
│
├── server.example.ts                # Express server setup example
├── AUTH_DOCUMENTATION.md            # Complete API documentation
└── README.md                        # This file
```

## API Endpoints

### Customer Portal

- `POST /api/auth/customer/magic-link` - Request magic link
- `GET /api/auth/customer/verify?token=...` - Verify magic link and login

### Jockey Portal

- `POST /api/auth/jockey/login` - Login with username/password

### Workshop Portal

- `POST /api/auth/workshop/login` - Login with username/password

### Common Endpoints

- `GET /api/auth/me` - Get current user (authenticated)
- `POST /api/auth/logout` - Logout (client-side token removal)

## Quick Start

### 1. Install Dependencies

```bash
npm install express jsonwebtoken bcryptjs express-rate-limit cors helmet morgan @prisma/client
npm install --save-dev @types/express @types/jsonwebtoken @types/bcryptjs typescript ts-node nodemon
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Update the following variables in `.env`:
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
MAGIC_LINK_SECRET=your-magic-link-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name add-auth-system

# Seed test users (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5001` (or port specified in .env).

## Usage Examples

### Protecting Routes

```typescript
import { authenticate } from './middleware/auth';
import { requireCustomer, requireRole } from './middleware/rbac';
import { UserRole } from './types/auth.types';

// Require authentication only
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Require customer role
app.get('/api/bookings', authenticate, requireCustomer, (req, res) => {
  // Only customers can access
});

// Require multiple roles
app.get('/api/admin', authenticate, requireRole(UserRole.ADMIN), (req, res) => {
  // Only admins can access
});
```

### Frontend Integration

```typescript
// Request magic link
const response = await fetch('http://localhost:5001/api/auth/customer/magic-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'customer@example.com' })
});

// Store token after login
const { token, user } = await response.json();
localStorage.setItem('authToken', token);

// Make authenticated requests
fetch('http://localhost:5001/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Testing

### Test Credentials (after seeding)

**Customers (Magic Link):**
- customer1@example.com
- customer2@example.com
- customer3@example.com

**Jockeys (Username/Password):**
- Username: `jockey1`, Password: `password123`
- Username: `jockey2`, Password: `password123`

**Workshops (Username/Password):**
- Username: `workshop1`, Password: `password123`
- Username: `workshop2`, Password: `password123`

**Admin:**
- Username: `admin`, Password: `admin123`

### Manual Testing with cURL

```bash
# Customer magic link
curl -X POST http://localhost:5001/api/auth/customer/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com"}'

# Jockey login
curl -X POST http://localhost:5001/api/auth/jockey/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jockey1","password":"password123"}'

# Get current user
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

The authentication system uses the following Prisma models:

- **User** - Main user model with role, email, username, password hash
- **Session** - Optional session storage
- **TokenBlacklist** - Optional token invalidation

See `prisma/schema.prisma` for complete schema definition.

## Security Considerations

### Production Checklist

- [ ] Change all default secrets in `.env`
- [ ] Use environment-specific secrets (development, staging, production)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags in production
- [ ] Configure proper CORS origins
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Implement token refresh flow (optional)
- [ ] Add token blacklist for logout (optional)

### Password Requirements

- Minimum 8 characters (configurable in `auth.service.ts`)
- Hashed using bcrypt with 10 salt rounds
- Never stored or transmitted in plain text

### Token Security

- **JWT Secret**: Minimum 32 characters, cryptographically random
- **Magic Link Secret**: Separate from JWT secret
- **Token Expiry**: 7 days for access tokens, 15 minutes for magic links
- **Signature Algorithm**: HMAC-SHA256

## Documentation

- **Complete API Documentation**: See `AUTH_DOCUMENTATION.md`
- **Dependencies Guide**: See `../DEPENDENCIES.md`
- **Sprint Plan**: See `../../02 Planning/16_Sprint_01_Plan.md`

## Support

For questions or issues:
1. Check `AUTH_DOCUMENTATION.md` for detailed API documentation
2. Review Sprint 1 Plan for requirements
3. Check Prisma schema for database structure
4. Review test examples in `tests/auth.test.example.ts`

## Next Steps

### Sprint 1 Completion
- [ ] Integrate with frontend login forms
- [ ] Set up email service provider
- [ ] Create seed data for test users
- [ ] Write integration tests
- [ ] Deploy to development environment

### Future Enhancements (Post-MVP)
- [ ] Refresh token implementation
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] OAuth providers (Google, Apple)
- [ ] Account lockout after failed attempts
- [ ] Audit logging for security events

## License

Internal use only - B2C Autowartung Platform
