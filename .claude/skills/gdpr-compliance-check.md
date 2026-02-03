# GDPR Compliance Check Skill

## Purpose
Ensure all data handling, user consent, and privacy practices comply with GDPR (General Data Protection Regulation) for EU customers.

## When to Use
- **Auto-invoked** when working with:
  - User data collection
  - Consent management
  - Data storage/processing
  - Third-party integrations
  - Email/SMS communication

## GDPR Principles

### 1. Lawfulness, Fairness & Transparency
**Requirement**: Users must explicitly consent to data processing and understand what data is collected and why.

```typescript
// ✅ GOOD: Explicit consent before booking
<form onSubmit={handleSubmit}>
  <input name="email" type="email" required />
  <input name="phone" type="tel" required />

  <label>
    <input
      type="checkbox"
      name="consentDataProcessing"
      required
      checked={consent.dataProcessing}
      onChange={(e) => setConsent({...consent, dataProcessing: e.target.checked})}
    />
    Ich willige in die Verarbeitung meiner personenbezogenen Daten gemäß der{' '}
    <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> ein. *
  </label>

  <label>
    <input
      type="checkbox"
      name="consentEmailReminders"
      checked={consent.emailReminders}
      onChange={(e) => setConsent({...consent, emailReminders: e.target.checked})}
    />
    Ich möchte Erinnerungs-E-Mails erhalten (optional)
  </label>

  <button type="submit" disabled={!consent.dataProcessing}>
    Verbindlich buchen
  </button>
</form>
```

**Check:**
- [ ] Explicit consent checkbox before booking (required)
- [ ] Separate consent for optional communications (email reminders)
- [ ] Link to privacy policy visible and accessible
- [ ] Consent cannot be pre-checked
- [ ] Clear explanation of what data is collected

### 2. Purpose Limitation
**Requirement**: Data can only be used for the explicitly stated purpose.

```typescript
// ✅ GOOD: Store purpose-limited data
await prisma.booking.create({
  data: {
    // Required for booking
    customerEmail: 'user@example.com',
    customerPhone: '+49 151 12345678',

    // Required for service
    vehicleLicensePlate: 'B-MW 1234', // Optional

    // Consent tracking
    consentDataProcessing: true,
    consentEmailReminders: false,
    consentDate: new Date(),
    consentIp: req.ip,
    consentPurpose: 'booking_management', // ← Purpose documented
  }
});

// ❌ BAD: Using data for different purpose without consent
await sendMarketingEmail(booking.customerEmail); // NO! No consent for marketing
```

**Check:**
- [ ] Each data field has documented purpose
- [ ] No data used for purposes beyond original consent
- [ ] Marketing emails require separate consent
- [ ] Data minimization: only collect necessary fields

### 3. Data Minimization
**Requirement**: Only collect data that is necessary for the stated purpose.

```typescript
// ✅ GOOD: Minimal required fields
const requiredFields = {
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
};

const optionalFields = {
  vehicleLicensePlate: false, // Only if user wants to provide
  vehicleMake: false,
  vehicleModel: false,
  vehicleYear: false,
};

// ❌ BAD: Unnecessary data collection
const booking = {
  ...requiredFields,
  dateOfBirth: '1990-01-01', // ← NOT needed for booking!
  creditCardNumber: 'xxx', // ← NOT needed (no payment in MVP)
  passportNumber: 'xxx', // ← Absolutely NOT needed
};
```

**Check:**
- [ ] Only name, email, phone as required fields
- [ ] Vehicle data marked as optional
- [ ] No unnecessary fields (DOB, credit card, etc.)
- [ ] Form indicates which fields are optional

### 4. Accuracy
**Requirement**: Data must be kept accurate and up-to-date.

```typescript
// ✅ GOOD: Allow user to update their data
app.patch('/api/bookings/:id', async (req, res) => {
  const token = req.query.token;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, magicToken: token }
  });

  if (!booking) throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);

  // User can update contact info
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      customerEmail: req.body.email,
      customerPhone: req.body.phone,
      updatedAt: new Date(),
    }
  });

  res.json(updated);
});
```

**Check:**
- [ ] Users can view their data (magic link)
- [ ] Users can update their data
- [ ] updatedAt timestamp tracked

### 5. Storage Limitation
**Requirement**: Data must not be kept longer than necessary.

```typescript
// ✅ GOOD: Automatic data deletion after retention period
// Cron job: Run daily at 2am
export async function deleteExpiredData() {
  const retentionMonths = 24; // 24 months retention
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

  // Soft delete: Mark as deleted, don't actually delete (for auditing)
  const result = await prisma.booking.updateMany({
    where: {
      createdAt: { lt: cutoffDate },
      dataDeletedAt: null,
    },
    data: {
      // Anonymize data
      customerEmail: 'deleted@anonymized.local',
      customerPhone: '+00 000 0000000',
      customerFirstName: 'DELETED',
      customerLastName: 'USER',
      vehicleLicensePlate: null,
      vehicleMake: null,
      vehicleModel: null,
      dataDeletedAt: new Date(),
    }
  });

  console.log(`Anonymized ${result.count} expired bookings`);
}
```

**Check:**
- [ ] 24-month data retention policy implemented
- [ ] Automatic anonymization of old bookings
- [ ] dataDeletedAt field tracked
- [ ] Cron job for cleanup scheduled

### 6. Integrity & Confidentiality
**Requirement**: Data must be processed securely.

```typescript
// ✅ GOOD: Secure data transmission and storage
// 1. HTTPS enforced (Vercel automatic)
// 2. Database credentials in environment variables
// 3. Magic token for passwordless access (no passwords to steal)
// 4. No PII in logs

console.log(`Booking created: ${booking.id}`); // ✅ Only ID
console.log(`Booking created for ${booking.customerEmail}`); // ❌ PII in logs!
```

**Check:**
- [ ] HTTPS enforced in production
- [ ] Database connection encrypted (SSL)
- [ ] No PII in application logs
- [ ] Magic tokens use secure random generation (crypto.randomUUID())
- [ ] Rate limiting to prevent brute force

### 7. Right to Access (Art. 15)
**Requirement**: Users can request a copy of their data.

```typescript
// ✅ GOOD: Data export via magic link
app.get('/api/bookings/:id/export', async (req, res) => {
  const token = req.query.token;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, magicToken: token },
    include: { workshop: true, service: true }
  });

  if (!booking) throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);

  // Return structured data export
  const exportData = {
    personalData: {
      firstName: booking.customerFirstName,
      lastName: booking.customerLastName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
    },
    vehicleData: {
      licensePlate: booking.vehicleLicensePlate,
      make: booking.vehicleMake,
      model: booking.vehicleModel,
    },
    bookingData: {
      bookingNumber: booking.bookingNumber,
      workshopName: booking.workshop.name,
      serviceName: booking.service.name,
      appointmentDate: booking.slotStart,
      status: booking.status,
    },
    consent: {
      dataProcessing: booking.consentDataProcessing,
      emailReminders: booking.consentEmailReminders,
      consentDate: booking.consentDate,
      consentIp: booking.consentIp,
    },
    metadata: {
      created: booking.createdAt,
      updated: booking.updatedAt,
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.bookingNumber}.json"`);
  res.json(exportData);
});
```

**Check:**
- [ ] Users can export their data via magic link
- [ ] Export includes all personal data
- [ ] Export format is machine-readable (JSON)

### 8. Right to Rectification (Art. 16)
**Requirement**: Users can correct inaccurate data.

**Check:**
- [ ] PATCH /api/bookings/:id allows updating contact info
- [ ] User can update via magic link
- [ ] Changes logged with updatedAt timestamp

### 9. Right to Erasure / "Right to be Forgotten" (Art. 17)
**Requirement**: Users can request deletion of their data.

```typescript
// ✅ GOOD: Data deletion request
app.delete('/api/bookings/:id/gdpr-delete', async (req, res) => {
  const token = req.query.token;
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, magicToken: token }
  });

  if (!booking) throw new ApiError('UNAUTHORIZED', 'Invalid token', 401);

  // Soft delete with anonymization
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      customerEmail: 'deleted@anonymized.local',
      customerPhone: '+00 000 0000000',
      customerFirstName: 'DELETED',
      customerLastName: 'USER',
      vehicleLicensePlate: null,
      vehicleMake: null,
      vehicleModel: null,
      dataDeletedAt: new Date(),
      status: 'DELETED',
    }
  });

  res.json({ success: true, message: 'Your data has been deleted' });
});
```

**Check:**
- [ ] Users can request data deletion
- [ ] Anonymization instead of hard delete (for audit trail)
- [ ] Status set to 'DELETED' to prevent reuse
- [ ] Email notification of deletion

### 10. Right to Data Portability (Art. 20)
**Requirement**: Users can receive their data in a machine-readable format.

**Check:**
- [ ] JSON export available (see Right to Access)
- [ ] .ics calendar file download (booking portability)

### 11. Data Protection by Design & Default
**Requirement**: Privacy must be built into the system from the start.

**Check:**
- [ ] Privacy policy linked on all data collection screens
- [ ] Consent management integrated into booking flow
- [ ] Magic links instead of passwords (no password leaks)
- [ ] Minimal data collection by default
- [ ] Automatic data deletion after retention period

## Privacy Policy Requirements

The privacy policy MUST include:
- [ ] Identity and contact details of data controller (workshop or platform)
- [ ] Purpose of data processing
- [ ] Legal basis for processing (consent)
- [ ] Data retention period (24 months)
- [ ] User rights (access, rectification, erasure, portability)
- [ ] Right to withdraw consent
- [ ] Right to lodge complaint with supervisory authority
- [ ] Information about data recipients (email provider, etc.)
- [ ] Whether data is transferred outside EU (if applicable)

## Validation Process

When this skill is invoked:

1. **Review data flow** from collection → storage → usage → deletion
2. **Verify consent management** at each touchpoint
3. **Check data minimization** - only necessary fields collected
4. **Validate retention policy** - automatic cleanup configured
5. **Test user rights** - can user access/update/delete data?
6. **Document findings** with severity:
   - 🔴 **Critical**: GDPR violation (missing consent, excessive data collection)
   - 🟡 **High**: Missing user rights (no data export, no deletion)
   - 🟢 **Medium**: Documentation gaps (privacy policy incomplete)

## Example Output

```markdown
## GDPR Compliance Check Results

### ✅ PASSED: Consent Management
- Explicit consent checkbox implemented
- Separate consent for optional email reminders
- Consent timestamp and IP logged
- Privacy policy linked

### 🟡 HIGH: Missing Data Export
**Issue**: No endpoint for user data export
**Fix**: Implement GET /api/bookings/:id/export with JSON format

### ✅ PASSED: Data Minimization
- Only necessary fields collected
- Vehicle data optional
- No unnecessary fields (DOB, credit card, etc.)

### 🟢 MEDIUM: Privacy Policy Incomplete
**Issue**: Privacy policy doesn't mention data retention period
**Fix**: Add section on 24-month retention and automatic deletion
```

## Integration with Agents

- **security-privacy-engineer**: Deep GDPR audits before launch
- **fullstack-engineer**: Implement GDPR features (consent, deletion)
- **product-manager**: Ensure user stories include GDPR requirements

## References
- GDPR Full Text: https://gdpr-info.eu/
- GDPR Checklist: https://gdpr.eu/checklist/
- ICO Guide (UK): https://ico.org.uk/for-organisations/guide-to-data-protection/
