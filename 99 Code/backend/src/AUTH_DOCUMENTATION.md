# Multi-Portal Authentication System

This authentication system implements three separate authentication flows for the B2C Autowartung platform, as specified in TECH-015.

## Overview

The system supports three distinct user portals:
1. **Customer Portal** - Magic Link authentication (passwordless)
2. **Jockey Portal** - Username/Password authentication
3. **Workshop Portal** - Username/Password authentication

## Architecture

### File Structure

```
src/
├── controllers/
│   └── auth.controller.ts      # Authentication request handlers
├── middleware/
│   ├── auth.ts                 # JWT verification middleware
│   └── rbac.ts                 # Role-based access control
├── routes/
│   └── auth.routes.ts          # Authentication endpoints
├── services/
│   ├── auth.service.ts         # Authentication business logic
│   └── database.service.ts     # Database operations
├── types/
│   └── auth.types.ts           # TypeScript type definitions
└── utils/
    ├── jwt.ts                  # JWT token utilities
    └── rateLimiter.ts          # Rate limiting configuration
```

## Authentication Flows

### 1. Customer Authentication (Magic Link)

**Step 1: Request Magic Link**
```http
POST /api/auth/customer/magic-link
Content-Type: application/json

{
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to customer@example.com",
  "magicLink": "http://localhost:3000/auth/customer/verify?token=..." // Only in development
}
```

**Step 2: Verify Magic Link**
```http
GET /api/auth/customer/verify?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123",
    "email": "customer@example.com",
    "role": "CUSTOMER"
  }
}
```

### 2. Jockey Authentication (Username/Password)

```http
POST /api/auth/jockey/login
Content-Type: application/json

{
  "username": "jockey1",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx456",
    "email": "jockey1@example.com",
    "role": "JOCKEY"
  }
}
```

### 3. Workshop Authentication (Username/Password)

```http
POST /api/auth/workshop/login
Content-Type: application/json

{
  "username": "workshop1",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx789",
    "email": "workshop1@example.com",
    "role": "WORKSHOP"
  }
}
```

## Protected Routes

### Using Authentication Middleware

```typescript
import { authenticate } from './middleware/auth';
import { requireRole, requireCustomer, requireJockey } from './middleware/rbac';

// Require authentication
app.get('/api/protected', authenticate, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});

// Require specific role
app.get('/api/customer/dashboard', authenticate, requireCustomer, (req, res) => {
  // Only customers can access
  res.json({ message: 'Customer dashboard' });
});

// Require multiple roles
app.get('/api/staff/dashboard', authenticate, requireRole(UserRole.JOCKEY, UserRole.WORKSHOP), (req, res) => {
  // Only jockeys and workshops can access
  res.json({ message: 'Staff dashboard' });
});
```

## JWT Token Structure

### Access Token (7 days expiry)

```json
{
  "userId": "clxxx123",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Magic Link Token (15 minutes expiry)

```json
{
  "email": "customer@example.com",
  "type": "magic_link",
  "exp": 1234567890
}
```

## Security Features

### Rate Limiting

- **Login endpoints**: 5 requests per 15 minutes per IP
- **Magic link requests**: 5 requests per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### Password Requirements

- Minimum 8 characters
- Hashed using bcrypt with 10 salt rounds

### Token Security

- Separate secrets for JWT and Magic Links
- Short expiry for Magic Links (15 minutes)
- Long expiry for Access Tokens (7 days)
- Tokens are signed and verified using HMAC-SHA256

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Magic Link Configuration
MAGIC_LINK_SECRET=your-magic-link-secret-change-in-production-min-32-chars

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourapp.com
```

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install express jsonwebtoken bcryptjs express-rate-limit cors helmet
npm install --save-dev @types/express @types/jsonwebtoken @types/bcryptjs
```

### Step 2: Set Up Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Step 3: Run Database Migrations

```bash
npx prisma migrate dev --name add-auth-system
```

### Step 4: Integrate Routes

Add the authentication routes to your Express app:

```typescript
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);
```

### Step 5: Protect Routes

Use the middleware to protect your routes:

```typescript
import { authenticate } from './middleware/auth';
import { requireCustomer } from './middleware/rbac';

app.get('/api/bookings', authenticate, requireCustomer, getBookings);
```

## Frontend Integration

### Storing Tokens

**Option 1: localStorage (Simple but less secure)**
```javascript
// Store token
localStorage.setItem('authToken', token);

// Retrieve token
const token = localStorage.getItem('authToken');

// Remove token
localStorage.removeItem('authToken');
```

**Option 2: httpOnly Cookie (More secure)**
```javascript
// Backend sets cookie
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

### Making Authenticated Requests

```javascript
// Using Fetch API
fetch('http://localhost:5001/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Using Axios
axios.get('http://localhost:5001/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### React Context Example

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Optionally verify token and fetch user data
    }
  }, []);

  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Testing

### Manual Testing with cURL

**Customer Magic Link:**
```bash
# Request magic link
curl -X POST http://localhost:5001/api/auth/customer/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify magic link (use token from email)
curl http://localhost:5001/api/auth/customer/verify?token=YOUR_TOKEN
```

**Jockey Login:**
```bash
curl -X POST http://localhost:5001/api/auth/jockey/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jockey1","password":"password123"}'
```

**Protected Route:**
```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

**1. "Invalid token" error**
- Check that JWT_SECRET matches between token creation and verification
- Verify token hasn't expired
- Ensure token format is correct (Bearer token)

**2. "Authentication required" error**
- Verify Authorization header is present
- Check token format: `Authorization: Bearer <token>`
- Ensure middleware is applied in correct order

**3. "Insufficient permissions" error**
- Verify user has correct role
- Check RBAC middleware is configured correctly

**4. Rate limit exceeded**
- Wait for rate limit window to reset
- Check IP address isn't being blocked
- Adjust rate limits in production if needed

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.env` files
   - Add `.env` to `.gitignore`
   - Use different secrets for development and production

2. **Use strong secrets**
   - Minimum 32 characters
   - Use random, cryptographically secure strings
   - Rotate secrets periodically

3. **Enable HTTPS in production**
   - Use SSL/TLS certificates
   - Set `secure: true` on cookies
   - Use HSTS headers

4. **Implement proper logging**
   - Log authentication attempts
   - Monitor for suspicious activity
   - Never log passwords or tokens

5. **Handle token expiry gracefully**
   - Implement refresh token logic (Post-MVP)
   - Redirect to login on expiry
   - Clear invalid tokens from storage

## Future Enhancements (Post-MVP)

- [ ] Refresh token implementation
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Apple)
- [ ] Session management dashboard
- [ ] Token blacklist for logout
- [ ] Audit logging for security events
- [ ] Account lockout after failed attempts
- [ ] Email verification for new accounts

## Support

For questions or issues with the authentication system, please contact the development team or refer to the technical documentation in the planning folder.
