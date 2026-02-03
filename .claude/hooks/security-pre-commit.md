# Security Pre-Commit Hook

## Type
`PreToolUse` - Runs before any tool execution

## Purpose
Automatically validate security concerns before code changes are made, preventing common vulnerabilities from being introduced.

## When It Triggers
This hook activates when these tools are about to be used:
- **Bash**: Command execution (potential for command injection)
- **Write**: File creation (check for secrets, dangerous code)
- **Edit**: File modification (validate changes for security issues)

## Security Patterns Monitored

### 1. Command Injection
```typescript
// 🔴 DETECTED: Command injection risk
const command = `rm -rf ${userInput}`; // DANGEROUS!
await exec(command);

// ✅ SAFE: Parameterized command
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
await execAsync('rm', ['-rf', sanitizedInput]);
```

**Detection Pattern**:
- String interpolation with `${...}` in shell commands
- `eval()`, `exec()`, `system()` calls with user input

### 2. Hardcoded Secrets
```typescript
// 🔴 DETECTED: Hardcoded API key
const apiKey = 'sk-1234567890abcdef';
const dbPassword = 'SuperSecret123';

// ✅ SAFE: Environment variables
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DATABASE_PASSWORD;
```

**Detection Pattern**:
- Strings matching `apiKey`, `password`, `secret`, `token` with hardcoded values
- AWS keys (AKIA...), private keys (BEGIN PRIVATE KEY)

### 3. SQL Injection
```typescript
// 🔴 DETECTED: SQL injection risk
const query = `SELECT * FROM users WHERE id = '${userId}'`;
await db.raw(query);

// ✅ SAFE: Parameterized query
await db.user.findUnique({ where: { id: userId } });
```

**Detection Pattern**:
- String concatenation in SQL queries
- `db.raw()` or `db.execute()` with template literals

### 4. XSS Vulnerabilities
```typescript
// 🔴 DETECTED: XSS risk
element.innerHTML = userInput; // DANGEROUS!
div.dangerouslySetInnerHTML = { __html: userComment };

// ✅ SAFE: React auto-escaping
<div>{userInput}</div>
// OR with sanitization
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

**Detection Pattern**:
- `innerHTML` assignment without sanitization
- `dangerouslySetInnerHTML` without DOMPurify

### 5. Path Traversal
```typescript
// 🔴 DETECTED: Path traversal risk
const filePath = `/uploads/${req.params.filename}`; // User could use ../../../etc/passwd
fs.readFile(filePath);

// ✅ SAFE: Path validation
import path from 'path';
const safeFilename = path.basename(req.params.filename);
const filePath = path.join(UPLOAD_DIR, safeFilename);
```

**Detection Pattern**:
- File path concatenation with user input
- No path validation before file operations

### 6. Weak Cryptography
```typescript
// 🔴 DETECTED: Weak crypto
const hash = md5(password); // MD5 is broken!
const token = Math.random().toString(); // Not cryptographically secure

// ✅ SAFE: Strong crypto
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 10);

import crypto from 'crypto';
const token = crypto.randomUUID();
```

**Detection Pattern**:
- Use of MD5, SHA1 for passwords
- `Math.random()` for security tokens

### 7. Insecure Deserialization
```typescript
// 🔴 DETECTED: Insecure deserialization
const data = JSON.parse(untrustedInput);
eval(data.code); // EXTREMELY DANGEROUS!

// ✅ SAFE: Schema validation
const schema = z.object({ /* ... */ });
const data = schema.parse(JSON.parse(input));
```

**Detection Pattern**:
- `eval()` usage
- `Function()` constructor
- Deserialization without validation

### 8. Missing Authentication
```typescript
// 🔴 DETECTED: No auth check
app.delete('/api/bookings/:id', async (req, res) => {
  await prisma.booking.delete({ where: { id: req.params.id } });
});

// ✅ SAFE: Auth verification
app.delete('/api/bookings/:id', async (req, res) => {
  const token = req.query.token;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, magicToken: token }
  });
  if (!booking) throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);
  // ...
});
```

**Detection Pattern**:
- API routes with DELETE/PATCH/POST without auth checks
- Admin routes without role verification

### 9. Insufficient Input Validation
```typescript
// 🔴 DETECTED: No validation
const email = req.body.email;
await sendEmail(email); // What if it's malicious?

// ✅ SAFE: Zod validation
const schema = z.object({
  email: z.string().email().max(255),
});
const { email } = schema.parse(req.body);
```

**Detection Pattern**:
- Direct use of `req.body`, `req.params`, `req.query` without validation
- No Zod/Joi/Yup schema validation

## Hook Behavior

### On Detection:
1. **Pause execution** before tool runs
2. **Display warning** with:
   - Security issue type (e.g., "SQL Injection Risk")
   - Severity level (Critical, High, Medium)
   - Code location (file:line)
   - Explanation of risk
   - Suggested fix with code example
3. **Require confirmation**:
   - 🔴 **Critical**: Block execution, must fix first
   - 🟡 **High**: Warning, require explicit override
   - 🟢 **Medium**: Warning, continue by default

### Example Output:
```
🔴 SECURITY ALERT: SQL Injection Risk Detected

File: lib/booking/create.ts:45
Code: const query = `SELECT * FROM bookings WHERE id = '${bookingId}'`;

Risk: User-controlled input in SQL query can lead to SQL injection.
Severity: CRITICAL

Suggested Fix:
await prisma.booking.findUnique({ where: { id: bookingId } });

❌ Execution blocked. Please fix this security issue before proceeding.
```

## Configuration

```json
{
  "hooks": [
    {
      "name": "security-pre-commit",
      "type": "PreToolUse",
      "config": {
        "enabled": true,
        "tools": ["Bash", "Write", "Edit"],
        "severity": "warning", // "error" | "warning" | "info"
        "autoFix": false,
        "patterns": [
          "command-injection",
          "hardcoded-secrets",
          "sql-injection",
          "xss",
          "path-traversal",
          "weak-crypto",
          "insecure-deserialization",
          "missing-auth",
          "insufficient-validation"
        ]
      }
    }
  ]
}
```

## Integration with Skills

This hook automatically invokes:
- **security-validation** skill for detailed analysis
- **gdpr-compliance-check** skill if data handling detected

## Bypass (Emergency Only)

To bypass for urgent fixes (use with caution):
```typescript
// SECURITY: Bypassing check for emergency hotfix (ticket: SEC-123)
// Reviewed by: security-team@example.com
// TODO: Refactor with proper validation in next sprint
const result = await dangerousOperation(input);
```

Comment must include:
- Reason for bypass
- Reviewer/approver
- Ticket reference
- TODO for proper fix

## References
- OWASP Top 10: https://owasp.org/Top10/
- CWE Top 25: https://cwe.mitre.org/top25/
- Security Cheat Sheet: https://cheatsheetseries.owasp.org/
