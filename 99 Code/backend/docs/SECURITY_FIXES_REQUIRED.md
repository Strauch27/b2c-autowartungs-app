# SECURITY FIXES REQUIRED - ACTION PLAN
**Priority-Ordered Remediation Guide**

**Status:** 🔴 DEPLOYMENT BLOCKED
**Estimated Effort:** 3-5 days
**Required Before:** Production deployment

---

## CRITICAL PRIORITY (Deploy Blockers)

### 1. FIX WEAK JWT SECRET ⚠️ CRITICAL
**File:** `/src/utils/jwt.ts`
**Severity:** CRITICAL - Authentication bypass possible
**Estimated Time:** 30 minutes

**Current Code:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'magic-link-secret-change-in-production';
```

**Fix:**
```typescript
// At top of file
const JWT_SECRET = process.env.JWT_SECRET;
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET;

// Validate on module load
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    'FATAL: JWT_SECRET must be set in environment and be at least 32 characters. ' +
    'Generate with: openssl rand -base64 32'
  );
}

if (!MAGIC_LINK_SECRET || MAGIC_LINK_SECRET.length < 32) {
  throw new Error(
    'FATAL: MAGIC_LINK_SECRET must be set in environment and be at least 32 characters. ' +
    'Generate with: openssl rand -base64 32'
  );
}
```

**Generate Secrets:**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate Magic Link secret
openssl rand -base64 32

# Add to .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "MAGIC_LINK_SECRET=$(openssl rand -base64 32)" >> .env
```

**Verification:**
```bash
# Test that app fails without secrets
unset JWT_SECRET
npm run dev  # Should throw error and exit

# Test with valid secrets
export JWT_SECRET=$(openssl rand -base64 32)
npm run dev  # Should start successfully
```

---

### 2. INSTALL HELMET.JS SECURITY HEADERS ⚠️ CRITICAL
**File:** `/src/server.ts`
**Severity:** CRITICAL - Multiple attack vectors open
**Estimated Time:** 1 hour

**Step 1: Install Helmet**
```bash
npm install helmet
npm install @types/helmet --save-dev
```

**Step 2: Update server.ts**
```typescript
import helmet from 'helmet';

// Add AFTER app initialization, BEFORE other middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL, "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));

// Then continue with existing middleware
app.use(cors({ ... }));
```

**Step 3: Verify Headers**
```bash
# Start server
npm run dev

# Test headers
curl -I http://localhost:5000/health

# Should see:
# Content-Security-Policy: default-src 'self'...
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

---

### 3. STRENGTHEN PASSWORD REQUIREMENTS ⚠️ HIGH
**File:** `/src/services/auth.service.ts`
**Severity:** HIGH - Weak passwords allowed
**Estimated Time:** 1 hour

**Replace isValidPassword function:**
```typescript
// Add common passwords list (or use library like 'common-passwords')
const commonPasswords = new Set([
  'password', '12345678', 'qwerty', 'abc123', 'password123',
  'welcome', 'monkey', '1234567890', 'letmein', 'admin'
  // Add more from: https://github.com/danielmiessler/SecLists
]);

export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[]
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (commonPasswords.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

**Update all password validation calls:**
```typescript
// In registration/password change handlers
const validation = isValidPassword(password);
if (!validation.valid) {
  throw new ApiError(400, validation.errors.join('; '));
}
```

---

### 4. INCREASE BCRYPT COST FACTOR ⚠️ HIGH
**File:** `/src/services/auth.service.ts`
**Severity:** HIGH - Weak hashing
**Estimated Time:** 15 minutes + migration

**Change:**
```typescript
const BCRYPT_SALT_ROUNDS = 12; // Changed from 10
```

**Add Progressive Rehashing:**
```typescript
/**
 * Verify password and rehash if using old cost factor
 */
export async function verifyPasswordAndRehash(
  userId: string,
  password: string,
  currentHash: string
): Promise<{ valid: boolean; newHash?: string }> {
  const isValid = await comparePassword(password, currentHash);

  if (isValid) {
    // Check cost factor (bcrypt hash format: $2a$10$...)
    const costMatch = currentHash.match(/\$2[ab]\$(\d+)\$/);
    const currentCost = costMatch ? parseInt(costMatch[1]) : 10;

    if (currentCost < BCRYPT_SALT_ROUNDS) {
      // Rehash with new cost factor
      const newHash = await hashPassword(password);
      return { valid: true, newHash };
    }
  }

  return { valid: isValid };
}
```

**Update Login Handler:**
```typescript
// In auth.controller.ts login function
const result = await verifyPasswordAndRehash(user.id, password, user.passwordHash);

if (result.valid && result.newHash) {
  // Update hash in database
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: result.newHash }
  });
}
```

---

## HIGH PRIORITY (Before Production)

### 5. IMPLEMENT CSRF PROTECTION ⚠️ HIGH
**Scope:** Application-wide
**Estimated Time:** 2 hours

**Option A: Migrate to HttpOnly Cookies (Recommended)**

**Update auth.service.ts:**
```typescript
// Instead of sending token in response body
export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}
```

**Update auth middleware:**
```typescript
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Try Authorization header first, then cookie
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader) || req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  // ... rest of verification
}
```

**Frontend Changes Required:**
```typescript
// Remove localStorage usage
// Cookies are automatically sent with requests
fetch('/api/bookings', {
  credentials: 'include' // Important: include cookies
});
```

---

### 6. FIX IDOR VULNERABILITIES ⚠️ HIGH
**Files:** Multiple controllers
**Estimated Time:** 2 hours

**Create Ownership Middleware:**
```typescript
// src/middleware/ownership.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ApiError } from './errorHandler';
import { UserRole } from '@prisma/client';

export function requireBookingOwnership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const bookingId = req.params.id;

    // Admin can access all bookings
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customerId: true }
    });

    if (!booking) {
      // Return 404 instead of 403 to prevent enumeration
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.customerId !== req.user.userId) {
      // Return 404 instead of 403 to prevent enumeration
      throw new ApiError(404, 'Booking not found');
    }

    next();
  };
}
```

**Apply to Routes:**
```typescript
// src/routes/bookings.routes.ts
import { requireBookingOwnership } from '../middleware/ownership';

router.get('/:id', authenticate, requireCustomer, requireBookingOwnership(), getBooking);
router.patch('/:id', authenticate, requireCustomer, requireBookingOwnership(), updateBooking);
router.delete('/:id', authenticate, requireCustomer, requireBookingOwnership(), cancelBooking);
```

**Repeat for:**
- Vehicles (requireVehicleOwnership)
- User profile (requireProfileOwnership)

---

## MEDIUM PRIORITY (First Sprint)

### 7. ENHANCE RATE LIMITING ⏱️ MEDIUM
**File:** `/src/utils/rateLimiter.ts`
**Estimated Time:** 2 hours

**Add Account-Level Tracking:**
```typescript
// Track failed login attempts per username
const failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

export async function checkAccountLockout(username: string): Promise<void> {
  const attempts = failedAttempts.get(username);

  if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (attempts.lockedUntil.getTime() - Date.now()) / 60000
    );
    throw new ApiError(
      423,
      `Account locked. Try again in ${minutesLeft} minutes.`
    );
  }
}

export function recordFailedLogin(username: string): void {
  const attempts = failedAttempts.get(username) || { count: 0 };
  attempts.count++;

  if (attempts.count >= 5) {
    attempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    logger.warn('Account locked', { username, attempts: attempts.count });
  }

  failedAttempts.set(username, attempts);
}

export function clearFailedAttempts(username: string): void {
  failedAttempts.delete(username);
}
```

**Use in Login Handler:**
```typescript
// Before password verification
await checkAccountLockout(username);

// After failed login
if (!isValid) {
  recordFailedLogin(username);
  throw new ApiError(401, 'Invalid credentials');
}

// After successful login
clearFailedAttempts(username);
```

---

### 8. IMPLEMENT SECURITY LOGGING ⏱️ MEDIUM
**File:** Create `/src/middleware/securityLogger.ts`
**Estimated Time:** 1 hour

```typescript
import { logger } from '../config/logger';
import { Request } from 'express';

export type SecurityEventType =
  | 'login_failed'
  | 'login_success'
  | 'token_invalid'
  | 'authz_failed'
  | 'suspicious_activity'
  | 'account_locked'
  | 'password_changed'
  | 'data_export'
  | 'data_deletion';

export function logSecurityEvent(
  type: SecurityEventType,
  req: Request,
  details?: Record<string, any>
) {
  const event = {
    type,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
    path: req.path,
    method: req.method,
    ...details,
  };

  logger.warn('SECURITY_EVENT', event);

  // In production, send to SIEM
  if (process.env.NODE_ENV === 'production') {
    // sendToSIEM(event);
  }
}
```

**Use Throughout Codebase:**
```typescript
// In auth middleware
if (!result.valid) {
  logSecurityEvent('token_invalid', req, { error: result.error });
  // ...
}

// In login handler
if (!isValid) {
  logSecurityEvent('login_failed', req, { username });
  // ...
}

// In GDPR controller
logSecurityEvent('data_export', req);
```

---

### 9. ENFORCE HTTPS IN PRODUCTION ⏱️ MEDIUM
**File:** `/src/server.ts`
**Estimated Time:** 15 minutes

**Add Middleware:**
```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

---

### 10. OPTIMIZE JWT EXPIRATION ⏱️ MEDIUM
**File:** `/src/utils/jwt.ts`
**Estimated Time:** 2 hours (includes refresh token implementation)

**Implement Refresh Tokens:**
```typescript
const JWT_EXPIRES_IN = '1h'; // Changed from 7d
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET || REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('REFRESH_TOKEN_SECRET must be set and be at least 32 characters');
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

export function verifyRefreshToken(token: string): { valid: boolean; userId?: string } {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;
    if (decoded.type !== 'refresh') {
      return { valid: false };
    }
    return { valid: true, userId: decoded.userId };
  } catch {
    return { valid: false };
  }
}
```

**Add Refresh Endpoint:**
```typescript
// src/routes/auth.routes.ts
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  const result = verifyRefreshToken(refreshToken);
  if (!result.valid || !result.userId) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: result.userId } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const newAccessToken = generateToken(createJWTPayload(user));
  setAuthCookie(res, newAccessToken);

  res.json({ success: true });
});
```

---

## ADDITIONAL FIXES

### 11. Add Request Size Limits
```typescript
// src/server.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 12. Sanitize Error Messages
```typescript
// src/middleware/errorHandler.ts
const message = process.env.NODE_ENV === 'production'
  ? 'An error occurred'
  : err.message;
```

### 13. Update GDPR Routes in server.ts
```typescript
// src/server.ts
import gdprRoutes from './routes/gdpr.routes';
app.use('/api/gdpr', gdprRoutes);
```

---

## VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] App fails to start without required env vars
- [ ] Security headers present in all responses
- [ ] Weak passwords rejected during registration
- [ ] Failed logins locked after 5 attempts
- [ ] Tokens expire after 1 hour (not 7 days)
- [ ] CSRF protection active
- [ ] IDOR prevented (users can't access others' bookings)
- [ ] Security events logged
- [ ] HTTPS enforced in production
- [ ] All tests pass

**Test Commands:**
```bash
# Security headers
curl -I http://localhost:5000/health | grep -i security

# Password strength
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak"}'
# Should return 400 with validation errors

# Rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}';
done
# Should return 429 after 5 attempts
```

---

## PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All CRITICAL fixes implemented
- [ ] All HIGH fixes implemented
- [ ] Environment variables set (JWT_SECRET, etc.)
- [ ] Database SSL enabled
- [ ] Backups configured
- [ ] Monitoring configured (Sentry, etc.)
- [ ] Security headers verified
- [ ] HTTPS certificate installed
- [ ] Rate limiting tested
- [ ] GDPR endpoints functional
- [ ] Security audit passed
- [ ] Penetration testing completed (recommended)

---

## SUPPORT

**Questions?** Contact security@yourcompany.com

**Blockers?** Escalate to CTO immediately
