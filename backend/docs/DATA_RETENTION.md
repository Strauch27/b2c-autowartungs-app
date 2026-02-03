# Data Retention Policy
**B2C Autowartungs-App**

**Version:** 1.0.0
**Effective Date:** 2026-02-01
**Review Date:** 2027-02-01 (Annual Review Required)

---

## 1. POLICY OVERVIEW

### 1.1 Purpose
This Data Retention Policy defines how long we retain personal data and the criteria for determining retention periods, in compliance with:
- GDPR Article 5(1)(e) - Storage Limitation
- German Tax Code (Abgabenordnung §147) - 7-year retention for business records
- German Commercial Code (HGB §257) - 6-10 year retention for accounting records

### 1.2 Scope
This policy applies to all personal data processed by the B2C Autowartungs-App platform.

### 1.3 Principles
- **Data Minimization:** Only retain data necessary for defined purposes
- **Storage Limitation:** Delete or anonymize data when no longer needed
- **Regular Review:** Audit retention schedules annually
- **Secure Deletion:** Use secure deletion methods (see Section 5)

---

## 2. RETENTION SCHEDULES BY DATA CATEGORY

### 2.1 User Account Data

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Email address | While account active + 30 days | Contract fulfillment | Deleted on account deletion |
| Password hash | While account active | Security | Never stored in plaintext |
| First/Last name | While account active + 30 days | Contract fulfillment | Optional field |
| Phone number | While account active + 30 days | Contract fulfillment | Optional field |
| Last login timestamp | While account active | Security monitoring | For inactive account cleanup |
| Account creation date | While account active + 7 years | Tax/legal compliance | Anonymized after deletion |

**Inactive Account Cleanup:**
- Accounts inactive for **3 years** → Notification sent
- No response within **90 days** → Account automatically deleted

---

### 2.2 Customer Profile Data

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Address (street, city, postal code) | While account active + 30 days | Service delivery | Soft-deleted on account deletion |
| Preferred contact method | While account active | User preference | |
| Stripe Customer ID | While account active + 7 years | Payment reconciliation | Required for refunds/disputes |

---

### 2.3 Vehicle Data

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Brand, model, year | While account active + 30 days | Service delivery | Deleted with account |
| Mileage | While account active + 30 days | Service calculation | Historical records in bookings |
| License plate | While account active + 30 days | Optional identifier | Can be omitted |

**Note:** Vehicle data in completed bookings is retained separately (see 2.4).

---

### 2.4 Booking Data (CRITICAL - Tax Law Compliance)

| Data Type | Retention Period | Legal Basis | After Account Deletion |
|-----------|------------------|-------------|------------------------|
| Booking number | **7 years** | §147 AO (German Tax Code) | ✅ Retained (anonymized) |
| Service type | **7 years** | §147 AO | ✅ Retained (anonymized) |
| Total price | **7 years** | §147 AO | ✅ Retained (anonymized) |
| Booking date | **7 years** | §147 AO | ✅ Retained (anonymized) |
| Payment information | **7 years** | §147 AO | ✅ Retained (anonymized) |
| Customer ID (reference) | **7 years** | §147 AO | ❌ Anonymized to `deleted-user-{hash}` |
| Pickup address | While account active + 30 days | Service delivery | ❌ Anonymized to "REDACTED" |
| Delivery address | While account active + 30 days | Service delivery | ❌ Anonymized to "REDACTED" |
| Customer notes | While account active + 30 days | Service communication | ❌ Deleted |
| Internal notes | **7 years** | Business records | ✅ Retained (may contain service details) |

**German Tax Law Requirement:**
Per §147 Abgabenordnung (AO), business records must be retained for **7 years** from the end of the calendar year in which the record was created.

**Example:**
- Booking created: 2026-03-15
- Retention until: 2033-12-31 (7 years from end of 2026)

**Anonymization Process:**
When a user deletes their account, booking records are **anonymized** (not deleted):
```
BEFORE:
  Customer ID: clx123abc
  Pickup Address: Musterstraße 10, 12345 Berlin
  Customer Notes: "Please call before pickup"

AFTER:
  Customer ID: deleted-user-fa8e2c1d
  Pickup Address: ANONYMIZED
  Customer Notes: [DELETED]
```

---

### 2.5 Payment Data

| Data Type | Retention Period | Legal Basis | Storage Location |
|-----------|------------------|-------------|------------------|
| Payment Intent ID | **7 years** | §147 AO | Our database |
| Payment status | **7 years** | §147 AO | Our database |
| Payment timestamp | **7 years** | §147 AO | Our database |
| Credit card details | **Never stored** | N/A | Stripe only (PCI-DSS) |
| Stripe Customer ID | **7 years** + disputes | Refund processing | Our database |

**Note:** We do **not** store credit card numbers, CVV, or expiration dates. This is handled by Stripe in compliance with PCI-DSS.

---

### 2.6 Communication & Notification Data

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Email notifications (sent) | **90 days** | Customer support | Logs only, not content |
| Push notifications (sent) | **90 days** | Debugging | FCM message IDs |
| SMS notifications (sent) | **90 days** | Customer support | If implemented |
| Email communication logs | **2 years** | Dispute resolution | Metadata only |

---

### 2.7 Technical & Security Data

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Access logs (IP, timestamp) | **90 days** | Security monitoring | GDPR recital 49 |
| Error logs | **90 days** | Service improvement | Anonymized after 90 days |
| Security event logs | **1 year** | Security investigations | Failed logins, auth failures |
| Audit logs (GDPR requests) | **3 years** | Compliance documentation | Export/delete requests |

---

### 2.8 Marketing & Analytics

| Data Type | Retention Period | Legal Basis | Notes |
|-----------|------------------|-------------|-------|
| Marketing consent | While account active | GDPR Article 7(1) | Withdrawn consent logged |
| Email open/click rates | **1 year** | Marketing optimization | Anonymized after 1 year |
| Analytics (anonymized) | **2 years** | Service improvement | No personal identifiers |

**Consent Withdrawal:**
When a user withdraws marketing consent, their email is added to a suppression list (retained indefinitely to prevent re-enrollment).

---

## 3. DELETION TRIGGERS

### 3.1 User-Initiated Deletion
**Trigger:** User requests account deletion via Settings or API

**Timeline:**
1. **Immediate:** Account marked as deleted, login disabled
2. **Within 24 hours:** Personal data deleted/anonymized
3. **Within 30 days:** Verification that deletion is complete
4. **Booking records:** Anonymized, retained for 7 years (tax law)

**Process:**
```
1. Verify user identity (email confirmation)
2. Check for pending bookings (must be completed/cancelled)
3. Export user data (if requested)
4. Delete/anonymize data per category schedule
5. Send confirmation email
6. Log deletion in audit trail
```

### 3.2 Automatic Deletion (Inactive Accounts)
**Trigger:** Account inactive for 3 years

**Timeline:**
1. **Year 3:** Warning email sent ("Your account will be deleted in 90 days")
2. **Day 90:** Second warning email
3. **Day 91:** Account automatically deleted

**Definition of "Inactive":**
- No login in past 3 years
- No active bookings
- No payment activity

### 3.3 Legal Hold
**Trigger:** Legal proceedings, investigations, or disputes

**Process:**
1. Mark account with legal hold flag
2. Suspend automatic deletion
3. Retain all data until hold is lifted
4. Document reason and authority
5. Review hold status monthly

**Notification:** Users are informed if their data is subject to legal hold.

---

## 4. ANONYMIZATION STANDARDS

### 4.1 Definition
**Anonymization:** Irreversible removal of personal identifiers such that individuals cannot be re-identified.

**GDPR:** Anonymized data is no longer "personal data" and is not subject to GDPR (Recital 26).

### 4.2 Anonymization Techniques

**4.2.1 Booking Records**
```sql
UPDATE bookings
SET
  customerId = CONCAT('deleted-user-', SHA256(customerId)),
  pickupAddress = 'ANONYMIZED',
  pickupCity = 'ANONYMIZED',
  pickupPostalCode = 'XXXXX',
  customerNotes = NULL,
  internalNotes = 'User data anonymized per GDPR Article 17'
WHERE customerId = 'clx123abc';
```

**4.2.2 User Records (for referential integrity)**
```sql
UPDATE users
SET
  email = CONCAT('deleted-', id, '@anonymized.local'),
  username = NULL,
  passwordHash = NULL,
  firstName = NULL,
  lastName = NULL,
  phone = NULL,
  fcmToken = NULL,
  isActive = FALSE
WHERE id = 'clx123abc';
```

**4.2.3 Verification**
After anonymization, verify:
- No personal identifiers remain
- Re-identification is not possible
- Statistical utility retained (for business analytics)

---

## 5. SECURE DELETION METHODS

### 5.1 Database Records
**Method:** PostgreSQL DELETE with immediate VACUUM

```sql
-- Delete record
DELETE FROM users WHERE id = 'clx123abc';

-- Force immediate cleanup (not just mark as deleted)
VACUUM FULL users;
```

**Backup Handling:**
- Database backups rotated after 90 days
- Deleted records purged from backups within 90 days

### 5.2 File Storage (S3)
**Method:** Permanent deletion with versioning disabled

```typescript
await s3.deleteObject({
  Bucket: 'user-uploads',
  Key: `users/${userId}/photo.jpg`
});
```

**Verification:** Confirm deletion via S3 API, check no versions exist.

### 5.3 Cache & Sessions
**Method:** Immediate invalidation

```typescript
// Invalidate all user sessions
await redis.del(`session:${userId}:*`);

// Clear cached data
await cache.invalidate(`user:${userId}`);
```

---

## 6. COMPLIANCE & AUDIT

### 6.1 Annual Review
**Schedule:** February 1st of each year

**Process:**
1. Review all retention schedules
2. Update for legal changes
3. Audit deletion processes
4. Verify anonymization effectiveness
5. Document findings

### 6.2 Audit Trail
**Requirements:** Log all data operations

| Event | Data Logged | Retention |
|-------|-------------|-----------|
| Data export request | User ID, timestamp, IP | 3 years |
| Account deletion | User ID, email, timestamp, reason | 3 years |
| Anonymization | Records affected, timestamp | 3 years |
| Legal hold | User ID, reason, authority, dates | Duration + 3 years |

### 6.3 Compliance Monitoring
**Metrics:**
- Average time to deletion (target: < 24 hours)
- Percentage of records properly anonymized (target: 100%)
- Audit log completeness (target: 100%)

---

## 7. EXCEPTIONS & SPECIAL CASES

### 7.1 Legal Obligations
**Override:** Tax law retention (7 years) overrides user deletion requests for financial records.

**Communication:** Users are informed that some records are retained for legal compliance.

### 7.2 Disputes & Legal Proceedings
**Legal Hold:** All deletion suspended until resolution.

### 7.3 Fraud Investigations
**Retention:** Data may be retained beyond normal schedules if fraud is suspected.

**Legal Basis:** GDPR Article 6(1)(f) - Legitimate interest in fraud prevention.

### 7.4 Payment Disputes
**Retention:** Payment-related data retained until dispute is resolved + 90 days.

---

## 8. ROLES & RESPONSIBILITIES

### 8.1 Data Protection Officer (DPO)
- Oversee retention policy compliance
- Approve policy updates
- Handle GDPR requests

### 8.2 Engineering Team
- Implement deletion processes
- Maintain audit logs
- Execute anonymization scripts

### 8.3 Legal Team
- Advise on legal retention requirements
- Approve legal holds
- Review policy annually

---

## 9. POLICY UPDATES

**Version History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-01 | Initial policy |

**Approval:**
- Data Protection Officer: _______________
- CTO: _______________
- Legal Counsel: _______________

---

## 10. CONTACT

**Data Protection Officer:**
Email: dpo@yourcompany.com

**Privacy Questions:**
Email: privacy@yourcompany.com

---

**Next Review Date:** 2027-02-01
