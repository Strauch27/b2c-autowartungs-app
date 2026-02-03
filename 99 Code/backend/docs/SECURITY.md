# Security Policy & Best Practices
**B2C Autowartungs-App**

**Version:** 1.0.0
**Last Updated:** 2026-02-01

---

## TABLE OF CONTENTS

1. [Reporting Security Vulnerabilities](#1-reporting-security-vulnerabilities)
2. [Security Architecture](#2-security-architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Data Protection](#4-data-protection)
5. [API Security](#5-api-security)
6. [Infrastructure Security](#6-infrastructure-security)
7. [Secure Development Practices](#7-secure-development-practices)
8. [Incident Response](#8-incident-response)
9. [Security Checklist](#9-security-checklist)

---

## 1. REPORTING SECURITY VULNERABILITIES

### 1.1 Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

**Contact:** security@yourcompany.com
**PGP Key:** [Link to PGP public key]

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation (if known)

**Response Timeline:**
- Initial acknowledgment: Within 24 hours
- Assessment & plan: Within 72 hours
- Resolution target: Based on severity (Critical: 24h, High: 7d, Medium: 30d)

### 1.2 Bug Bounty Program

**Status:** Under consideration for future implementation

---

## 2. SECURITY ARCHITECTURE

### 2.1 Defense in Depth

Our security architecture uses multiple layers of defense:

```
┌─────────────────────────────────────────┐
│ Layer 1: Network Security               │
│ - HTTPS/TLS 1.3                         │
│ - Firewall rules                        │
│ - DDoS protection                       │
├─────────────────────────────────────────┤
│ Layer 2: Application Security           │
│ - Helmet.js security headers            │
│ - CORS configuration                    │
│ - Rate limiting                         │
│ - Input validation (Zod)                │
├─────────────────────────────────────────┤
│ Layer 3: Authentication & Authorization │
│ - JWT tokens                            │
│ - BCrypt password hashing               │
│ - RBAC (Role-Based Access Control)      │
│ - IDOR prevention                       │
├─────────────────────────────────────────┤
│ Layer 4: Data Security                  │
│ - Encryption at rest                    │
│ - Encryption in transit                 │
│ - Parameterized queries (Prisma)        │
│ - Data sanitization                     │
├─────────────────────────────────────────┤
│ Layer 5: Monitoring & Logging           │
│ - Security event logging                │
│ - Anomaly detection                     │
│ - Audit trails                          │
└─────────────────────────────────────────┘
```

### 2.2 Trust Boundaries

```
Internet → WAF/CDN → Load Balancer → API Server → Database
   ↓                                      ↓
Users                              Background Jobs
```

**Trust Zones:**
- **Untrusted:** Internet, user input
- **Semi-trusted:** Authenticated users
- **Trusted:** Internal services, admin users
- **Highly trusted:** Database, secrets vault

---

## 3. AUTHENTICATION & AUTHORIZATION

### 3.1 Password Security

**Requirements:**
- Minimum 12 characters
- Must contain: uppercase, lowercase, number, special character
- Cannot be common passwords (top 10,000 list)
- Not previously breached (check against HaveIBeenPwned API)

**Hashing:**
```typescript
// BCrypt with cost factor 12
const hash = await bcrypt.hash(password, 12);
```

**Best Practices:**
- Never log passwords
- Never send passwords via email
- Use password reset tokens (15-minute expiration)
- Implement account lockout after 5 failed attempts

### 3.2 JWT Token Security

**Configuration:**
```typescript
// Access Token
Expiration: 1 hour
Algorithm: HS256
Secret: 32+ characters (environment-specific)

// Refresh Token (recommended)
Expiration: 7 days
Stored: HttpOnly cookie (not localStorage)
```

**Security Measures:**
```typescript
// Validate secret on startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// Verify token signature
jwt.verify(token, JWT_SECRET, {
  algorithms: ['HS256'], // Prevent algorithm confusion
  issuer: 'autowartungs-app',
  audience: 'api'
});
```

**Best Practices:**
- Rotate secrets quarterly
- Use different secrets per environment
- Store secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Implement token revocation list for compromised tokens

### 3.3 Role-Based Access Control (RBAC)

**Roles:**
```typescript
enum UserRole {
  CUSTOMER   // Can book services, view own bookings
  JOCKEY     // Can view assigned bookings, update status
  WORKSHOP   // Can view all bookings, manage capacity
  ADMIN      // Full access
}
```

**Enforcement:**
```typescript
// Middleware chain
router.get('/bookings/:id',
  authenticate,              // Verify JWT
  requireCustomer,           // Check role
  requireBookingOwnership(), // Verify resource access
  getBooking
);
```

**Principle of Least Privilege:**
- Users granted minimum necessary permissions
- Admins use regular accounts for daily tasks
- Elevated access requires re-authentication

---

## 4. DATA PROTECTION

### 4.1 Encryption

**In Transit:**
- TLS 1.3 for all connections
- No HTTP (redirect to HTTPS)
- HSTS header (max-age=31536000)

**At Rest:**
- Database encryption enabled
- File storage encryption (S3 server-side encryption)
- Backup encryption

**Key Management:**
- Keys stored in AWS KMS or HashiCorp Vault
- Automatic key rotation (90 days)
- Separate keys per environment

### 4.2 Data Minimization

**Principles:**
- Collect only necessary data
- Use optional fields where possible
- Delete data when no longer needed
- Anonymize instead of delete for compliance

**Examples:**
```typescript
// GOOD: Optional license plate
{
  licensePlate: string | null  // User can omit if desired
}

// BAD: Collecting unnecessary data
{
  socialSecurityNumber: string  // Not needed for service
}
```

### 4.3 PII Protection

**Personal Identifiable Information (PII):**
- Email, name, phone, address

**Protection Measures:**
- Never log PII in plain text
- Redact in error messages
- Mask in UI (except last 4 digits)
- Encrypt backups containing PII

**Example Logging:**
```typescript
// GOOD
logger.info('User login', { userId: 'clx123', result: 'success' });

// BAD
logger.info('User login', { email: 'user@example.com', password: '***' });
```

---

## 5. API SECURITY

### 5.1 HTTP Security Headers

**Helmet.js Configuration:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));
```

### 5.2 CORS Configuration

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Specific origin, not '*'
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600 // Cache preflight for 10 minutes
}));
```

### 5.3 Rate Limiting

**Login Endpoints:**
```typescript
// 5 attempts per 15 minutes
loginRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
}
```

**API Endpoints:**
```typescript
// 100 requests per 15 minutes
apiRateLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 100
}
```

**Recommendation:** Use Redis-backed rate limiting in production for distributed systems.

### 5.4 Input Validation

**Zod Schemas:**
```typescript
import { z } from 'zod';

const createBookingSchema = z.object({
  vehicleId: z.string().cuid(),
  serviceType: z.enum(['INSPECTION', 'OIL_SERVICE', 'BRAKE_SERVICE']),
  pickupDate: z.string().datetime(),
  pickupAddress: z.string().min(1).max(200),
  customerNotes: z.string().max(1000).optional()
});

// Validate
const validated = createBookingSchema.parse(req.body);
```

**Best Practices:**
- Validate all input (body, query, params)
- Use whitelist approach (define allowed values)
- Sanitize HTML content with DOMPurify
- Reject unexpected fields

### 5.5 CSRF Protection

**Options:**

**Option 1: SameSite Cookies (Recommended)**
```typescript
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**Option 2: CSRF Tokens**
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Include token in forms
res.render('form', { csrfToken: req.csrfToken() });
```

---

## 6. INFRASTRUCTURE SECURITY

### 6.1 Environment Variables

**Best Practices:**
- Never commit `.env` files to git
- Use different secrets per environment
- Validate required variables on startup
- Use secret management service in production

**Startup Validation:**
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 6.2 Database Security

**PostgreSQL Configuration:**
```sql
-- Use least-privilege user
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE CREATE ON SCHEMA public FROM app_user;

-- Enable SSL
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

**Connection String:**
```
postgresql://app_user:password@host:5432/db?sslmode=require
```

### 6.3 Dependency Management

**Regular Audits:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual review for breaking changes
npm audit fix --force
```

**Automated Scanning:**
- Enable Dependabot (GitHub)
- Use Snyk for continuous monitoring
- Review updates weekly

**Best Practices:**
- Pin exact versions in `package.json`
- Review changelogs before updating
- Test in staging before production
- Maintain dependency inventory

---

## 7. SECURE DEVELOPMENT PRACTICES

### 7.1 Code Review Checklist

**Security Review:**
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all endpoints
- [ ] Authorization checks on protected resources
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include PII
- [ ] SQL queries use parameterization
- [ ] File uploads validated (type, size)
- [ ] Rate limiting on sensitive endpoints

### 7.2 Git Security

**Pre-commit Hooks:**
```bash
# Install git-secrets
brew install git-secrets

# Scan for secrets
git secrets --scan

# Block commits with secrets
git secrets --install
```

**`.gitignore`:**
```
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

### 7.3 Logging & Monitoring

**Security Events to Log:**
```typescript
// Failed login attempts
logger.warn('Login failed', {
  username: req.body.username,
  ip: req.ip,
  timestamp: new Date()
});

// Authorization failures
logger.warn('Authorization denied', {
  userId: req.user.userId,
  resource: req.path,
  requiredRole: 'ADMIN',
  userRole: req.user.role
});

// Suspicious activity
logger.error('Potential attack detected', {
  type: 'SQL_INJECTION_ATTEMPT',
  ip: req.ip,
  payload: req.body
});
```

**What NOT to Log:**
- Passwords (hashed or plain)
- Credit card numbers
- JWT tokens
- API keys
- Personal identifiable information (except user ID)

---

## 8. INCIDENT RESPONSE

### 8.1 Response Plan

**Phase 1: Detection & Analysis (0-1 hour)**
1. Identify the incident (monitoring alert, user report)
2. Assess severity (Critical, High, Medium, Low)
3. Assemble incident response team

**Phase 2: Containment (1-4 hours)**
1. Isolate affected systems
2. Prevent further damage
3. Preserve evidence

**Phase 3: Eradication (4-24 hours)**
1. Remove threat
2. Patch vulnerabilities
3. Verify systems are clean

**Phase 4: Recovery (24-72 hours)**
1. Restore services
2. Monitor for recurrence
3. Validate fixes

**Phase 5: Post-Incident (1 week)**
1. Document lessons learned
2. Update security measures
3. Notify affected users (if required)

### 8.2 Data Breach Response

**GDPR Requirements:**
- Notify supervisory authority within **72 hours** (Article 33)
- Notify affected users **without undue delay** (Article 34)
- Document breach and response

**Notification Template:**
```
Subject: Security Incident Notification

We are writing to inform you of a security incident that may have
affected your personal data.

What happened: [Brief description]
Data affected: [Types of data exposed]
Actions taken: [Remediation steps]
Your next steps: [What users should do]

For questions: security@yourcompany.com
```

---

## 9. SECURITY CHECKLIST

### 9.1 Pre-Deployment Checklist

**Environment:**
- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Database SSL enabled
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS configured (not `*`)

**Application:**
- [ ] Helmet.js security headers enabled
- [ ] Rate limiting configured
- [ ] Error stacks disabled in production
- [ ] Logging configured (no PII)
- [ ] CSRF protection enabled

**Dependencies:**
- [ ] `npm audit` passes (no critical/high vulnerabilities)
- [ ] Dependencies up to date
- [ ] No unused dependencies

**Data:**
- [ ] Backups configured and tested
- [ ] Encryption at rest enabled
- [ ] Data retention policy implemented
- [ ] GDPR endpoints functional

**Monitoring:**
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Security event logging
- [ ] Uptime monitoring
- [ ] Performance monitoring

### 9.2 Monthly Security Tasks

- [ ] Review access logs for suspicious activity
- [ ] Check for new CVEs in dependencies
- [ ] Review user access permissions
- [ ] Test backup restoration
- [ ] Update security documentation
- [ ] Review rate limiting thresholds
- [ ] Audit admin actions

### 9.3 Quarterly Security Tasks

- [ ] Rotate JWT secrets
- [ ] Rotate database credentials
- [ ] Review and update RBAC policies
- [ ] Penetration testing (internal)
- [ ] Security training for team
- [ ] Review and update incident response plan

### 9.4 Annual Security Tasks

- [ ] External penetration testing
- [ ] Security audit by third party
- [ ] Review and update security policies
- [ ] Disaster recovery drill
- [ ] Compliance audit (GDPR, PCI-DSS)

---

## 10. SECURITY RESOURCES

### 10.1 OWASP Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

### 10.2 Security Tools

**Static Analysis:**
- ESLint Security Plugin
- SonarQube
- Semgrep

**Dependency Scanning:**
- npm audit
- Snyk
- Dependabot

**Runtime Protection:**
- OWASP ZAP (API testing)
- Burp Suite (penetration testing)

### 10.3 Training

**Recommended Training:**
- OWASP Top 10 for Developers
- Secure Coding Practices
- GDPR Compliance Training
- Incident Response Training

---

## 11. CONTACT

**Security Team:**
Email: security@yourcompany.com

**Data Protection Officer:**
Email: dpo@yourcompany.com

**Emergency Contact:**
Phone: [Emergency hotline]

---

**Document Owner:** CTO/Security Lead
**Review Frequency:** Quarterly
**Next Review:** 2026-05-01
