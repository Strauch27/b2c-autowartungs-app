# Security Validation Skill

## Purpose
Validate code changes for common security vulnerabilities before implementation, focusing on OWASP Top 10 and booking-specific threats.

## When to Use
- **Auto-invoked** when working with:
  - API endpoints
  - Database queries
  - User input handling
  - Authentication/Authorization
  - File operations
  - External API calls

## Security Checklist

### 1. Input Validation
```typescript
// ❌ BAD: No validation
const email = req.body.email;
await db.user.findOne({ email });

// ✅ GOOD: Schema validation with Zod
const schema = z.object({
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});
const validated = schema.parse(req.body);
```

**Check:**
- [ ] All user inputs validated with Zod schemas
- [ ] Max length limits on string fields
- [ ] Email/phone format validation
- [ ] No direct access to `req.body` without validation

### 2. SQL Injection Prevention
```typescript
// ❌ BAD: String interpolation
const query = `SELECT * FROM bookings WHERE id = '${req.params.id}'`;

// ✅ GOOD: Parameterized queries (Prisma ORM)
const booking = await prisma.booking.findUnique({
  where: { id: req.params.id }
});
```

**Check:**
- [ ] All database queries use Prisma ORM (no raw SQL)
- [ ] If raw SQL needed, use parameterized queries
- [ ] No string concatenation in SQL queries

### 3. Authentication & Authorization
```typescript
// ❌ BAD: No auth check
app.delete('/api/bookings/:id', async (req, res) => {
  await prisma.booking.delete({ where: { id: req.params.id } });
});

// ✅ GOOD: Verify ownership via magic token
app.delete('/api/bookings/:id', async (req, res) => {
  const token = req.query.token;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, magicToken: token }
  });
  if (!booking) throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);
  await prisma.booking.delete({ where: { id: booking.id } });
});
```

**Check:**
- [ ] All protected routes verify magic token
- [ ] Admin routes check role/permissions
- [ ] No userId/workshopId in URLs (use tokens)
- [ ] Token expiry validation (90 days max)

### 4. XSS Prevention
```typescript
// ❌ BAD: Direct innerHTML
element.innerHTML = req.body.message;

// ✅ GOOD: React auto-escapes, or use DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(req.body.message);
element.innerHTML = clean;
```

**Check:**
- [ ] React components used (auto-escaping)
- [ ] If innerHTML needed, use DOMPurify
- [ ] No `dangerouslySetInnerHTML` without sanitization

### 5. CSRF Protection
```typescript
// ✅ GOOD: Next.js has built-in CSRF protection for same-origin requests
// No action needed for MVP (same-origin only)
```

**Check:**
- [ ] API routes don't disable CSRF protection
- [ ] If external API needed, implement CSRF tokens

### 6. Rate Limiting
```typescript
// ✅ GOOD: Rate limit booking endpoint
import rateLimit from 'express-rate-limit';

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 bookings per 15 minutes
  message: 'Too many booking attempts, please try again later',
});

app.post('/api/bookings', bookingLimiter, createBookingHandler);
```

**Check:**
- [ ] Booking endpoint rate limited (5 per 15min)
- [ ] OTP/Magic link request limited (3 per hour)
- [ ] Search endpoints limited (20 per minute)

### 7. Sensitive Data Exposure
```typescript
// ❌ BAD: Return password hash to client
const user = await prisma.user.findUnique({ where: { id } });
res.json(user); // includes passwordHash!

// ✅ GOOD: Use Prisma select to exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    firstName: true,
    // passwordHash: false (excluded)
  }
});
```

**Check:**
- [ ] Never return password hashes
- [ ] Magic tokens never returned in listings (only in confirmation)
- [ ] Admin API excludes sensitive workshop data
- [ ] Log sanitization (no PII in logs)

### 8. GDPR Compliance
```typescript
// ✅ GOOD: GDPR-compliant data handling
await prisma.booking.create({
  data: {
    // ... booking data
    consentDataProcessing: true,
    consentEmailReminders: false,
    consentDate: new Date(),
    consentIp: req.ip,
  }
});
```

**Check:**
- [ ] Explicit consent before data processing
- [ ] Consent timestamp + IP logged
- [ ] Data deletion support (dataDeletedAt field)
- [ ] 24-month retention policy enforced
- [ ] Privacy policy link on consent screen

### 9. Secure Dependencies
```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

**Check:**
- [ ] No high/critical vulnerabilities in dependencies
- [ ] Regular `npm audit` in CI/CD
- [ ] Lock file committed (package-lock.json)

### 10. Environment Variables
```typescript
// ❌ BAD: Secrets in code
const apiKey = 'sk-1234567890';

// ✅ GOOD: Environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not configured');
```

**Check:**
- [ ] All secrets in .env (never committed)
- [ ] .env.example provided
- [ ] Vercel environment variables configured
- [ ] No secrets in error messages/logs

## Validation Process

When this skill is invoked:

1. **Review the code change** for security issues
2. **Run through checklist** for relevant categories
3. **Flag any issues** with severity:
   - 🔴 **Critical**: Must fix before merge (SQL injection, auth bypass)
   - 🟡 **High**: Should fix before merge (XSS, missing validation)
   - 🟢 **Medium**: Fix in next sprint (rate limiting, logging)
4. **Provide fix suggestions** with code examples
5. **Document decision** if accepting a risk

## Example Output

```markdown
## Security Validation Results

### 🔴 CRITICAL: SQL Injection Risk
**File**: app/api/bookings/route.ts:45
**Issue**: Direct string interpolation in SQL query
**Fix**: Use Prisma ORM with parameterized queries

### 🟡 HIGH: Missing Input Validation
**File**: app/booking/contact/page.tsx:78
**Issue**: Phone number not validated against regex
**Fix**: Add Zod schema validation with phone regex

### ✅ PASSED: All other checks
- Authentication: ✅ Magic token verified
- XSS Prevention: ✅ React auto-escaping
- CSRF: ✅ Next.js built-in protection
```

## Integration with Agents

- **fullstack-engineer**: Run before committing code
- **security-privacy-engineer**: Deep dive on flagged issues
- **qa-test-engineer**: Verify security tests cover flagged issues

## References
- OWASP Top 10: https://owasp.org/Top10/
- Prisma Security: https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization
- Next.js Security: https://nextjs.org/docs/app/building-your-application/configuring/security-headers
