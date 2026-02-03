# Privacy Policy
**B2C Autowartungs-App**

**Last Updated:** 2026-02-01
**Effective Date:** 2026-02-01

---

## 1. DATA CONTROLLER

**Company Name:** [Your Company Name]
**Address:** [Your Company Address]
**Email:** privacy@yourcompany.com
**Data Protection Officer:** dpo@yourcompany.com

---

## 2. INTRODUCTION

This Privacy Policy explains how we collect, use, store, and protect your personal data in compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.

**Your Rights:** You have the right to access, rectify, erase, restrict processing, port your data, and object to processing. See Section 8 for details.

---

## 3. DATA WE COLLECT

### 3.1 Account Information
**Purpose:** User authentication and account management
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

- Email address (required)
- Password (hashed, never stored in plaintext)
- First and last name (optional)
- Phone number (optional)
- Account creation date
- Last login timestamp

### 3.2 Profile Information
**Purpose:** Service delivery and communication
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

- Pickup/delivery address (street, city, postal code)
- Preferred contact method
- Stripe Customer ID (for payment processing)

### 3.3 Vehicle Information
**Purpose:** Service calculation and delivery
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

- Vehicle brand and model
- Year of manufacture
- Current mileage
- License plate (optional)

### 3.4 Booking Information
**Purpose:** Service fulfillment and billing
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

- Booking details (service type, date, time slot)
- Pickup and delivery addresses
- Customer notes
- Pricing information
- Payment information (via Stripe)

### 3.5 Payment Information
**Purpose:** Payment processing
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

**We do not store credit card details.** Payment processing is handled by Stripe (https://stripe.com), a PCI-DSS Level 1 certified payment processor.

We store:
- Payment Intent ID
- Payment status
- Payment timestamp
- Stripe Customer ID

### 3.6 Communication Data
**Purpose:** Service notifications and support
**Legal Basis:** GDPR Article 6(1)(b) - Contract Performance

- Email notifications (booking confirmations, status updates)
- Push notifications (via Firebase Cloud Messaging)
- SMS notifications (if opted in)

### 3.7 Technical Data
**Purpose:** Security, fraud prevention, service improvement
**Legal Basis:** GDPR Article 6(1)(f) - Legitimate Interest

- IP address
- Browser type and version
- Device information
- Access timestamps
- Error logs

**Retention:** Technical logs are retained for 90 days.

---

## 4. HOW WE USE YOUR DATA

### 4.1 Service Delivery
- Process and fulfill your bookings
- Coordinate vehicle pickup and delivery
- Communicate booking status
- Process payments

### 4.2 Legal Obligations
- Comply with tax laws (§147 AO - 7-year retention)
- Respond to legal requests
- Prevent fraud and abuse

### 4.3 Service Improvement
- Analyze usage patterns (anonymized)
- Improve user experience
- Debug technical issues

### 4.4 Marketing (with consent)
**Legal Basis:** GDPR Article 6(1)(a) - Consent

- Send promotional emails (only if you opt in)
- Provide service recommendations

**You can opt out at any time** by clicking "Unsubscribe" in emails or contacting us.

---

## 5. DATA SHARING

### 5.1 Service Providers
We share data with trusted third parties only as necessary:

**Stripe (Payment Processing)**
- Purpose: Payment processing
- Data shared: Name, email, payment amount
- Location: EU/EEA (GDPR-compliant)
- Privacy Policy: https://stripe.com/privacy

**Firebase (Push Notifications)**
- Purpose: Send app notifications
- Data shared: Device token, notification content
- Location: EU/EEA (GDPR-compliant)
- Privacy Policy: https://firebase.google.com/support/privacy

**AWS S3 (File Storage)**
- Purpose: Store uploaded photos (if applicable)
- Data shared: Uploaded images
- Location: EU-Central-1 (Frankfurt)
- Privacy Policy: https://aws.amazon.com/privacy/

**Email Service Provider**
- Purpose: Transactional emails
- Data shared: Email address, name, booking details
- Location: EU/EEA

### 5.2 Legal Requirements
We may disclose data when required by law or to:
- Comply with legal obligations
- Protect our rights and safety
- Prevent fraud or illegal activity

### 5.3 Business Transfers
In the event of a merger, acquisition, or sale, your data may be transferred to the new entity. You will be notified of any such change.

**We never sell your personal data to third parties.**

---

## 6. DATA SECURITY

### 6.1 Technical Measures
- **Encryption in Transit:** All data transmitted via HTTPS/TLS 1.3
- **Encryption at Rest:** Database encryption enabled
- **Password Security:** Passwords hashed with BCrypt (cost factor 12)
- **Access Control:** Role-based access control (RBAC)
- **API Security:** JWT-based authentication, rate limiting
- **Security Headers:** Content Security Policy, HSTS, X-Frame-Options

### 6.2 Organizational Measures
- Employee training on data protection
- Access limited to authorized personnel
- Regular security audits
- Incident response plan

### 6.3 Data Breach Notification
In the event of a data breach, we will:
1. Notify the supervisory authority within 72 hours (GDPR Article 33)
2. Notify affected users without undue delay (GDPR Article 34)
3. Document the breach and remediation steps

---

## 7. DATA RETENTION

### 7.1 Active Accounts
Data is retained while your account is active.

### 7.2 Deleted Accounts
**Personal data is deleted within 30 days** of account deletion, except:

- **Booking records:** Retained for 7 years (German tax law §147 AO)
  - These records are anonymized (personal identifiers removed)
  - Only financial data retained (service type, price, date)

- **Legal hold:** Data may be retained if subject to legal proceedings

### 7.3 Inactive Accounts
Accounts inactive for **3 years** will receive a notification. If no response within 90 days, the account will be deleted.

### 7.4 Technical Logs
- Error logs: 90 days
- Access logs: 90 days
- Security logs: 1 year

---

## 8. YOUR RIGHTS UNDER GDPR

### 8.1 Right of Access (Article 15)
**Request a copy of all your personal data**

How to exercise:
- Log in to your account
- Go to Settings → Privacy → Export My Data
- Or email: privacy@yourcompany.com

Response time: Within 30 days

### 8.2 Right to Rectification (Article 16)
**Correct inaccurate personal data**

How to exercise:
- Update your profile in account settings
- Or email: privacy@yourcompany.com

### 8.3 Right to Erasure (Article 17)
**Request deletion of your personal data**

How to exercise:
- Go to Settings → Privacy → Delete My Account
- Or email: privacy@yourcompany.com

**Note:** Some data may be retained for legal obligations (see Section 7.2)

Exceptions:
- Active bookings must be completed first
- Legal obligations (tax records)

### 8.4 Right to Restriction (Article 18)
**Limit how we use your data**

How to exercise:
- Go to Settings → Privacy → Restrict Processing
- Or email: privacy@yourcompany.com

### 8.5 Right to Data Portability (Article 20)
**Receive your data in machine-readable format**

How to exercise:
- Go to Settings → Privacy → Export Portable Data
- Receive JSON file with all your data
- Or email: privacy@yourcompany.com

### 8.6 Right to Object (Article 21)
**Object to processing based on legitimate interest**

How to exercise:
- Email: privacy@yourcompany.com

### 8.7 Right to Withdraw Consent
**Withdraw consent for marketing communications**

How to exercise:
- Click "Unsubscribe" in marketing emails
- Go to Settings → Notifications
- Or email: privacy@yourcompany.com

### 8.8 Right to Lodge a Complaint
You have the right to lodge a complaint with a supervisory authority:

**Germany:**
Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)
https://www.bfdi.bund.de

---

## 9. INTERNATIONAL DATA TRANSFERS

All data is stored within the EU/EEA (Frankfurt, Germany) to ensure GDPR compliance.

If transfers outside the EU/EEA are necessary, we ensure:
- Adequate safeguards (Standard Contractual Clauses)
- GDPR Article 46 compliance

---

## 10. CHILDREN'S PRIVACY

Our service is not intended for children under 16. We do not knowingly collect data from children.

If we become aware of data collected from a child, we will delete it immediately.

---

## 11. COOKIES AND TRACKING

### 11.1 Essential Cookies
**Purpose:** Authentication, security, functionality
**Legal Basis:** Legitimate interest (GDPR Article 6(1)(f))

- `auth_token` - Authentication session (7 days)

### 11.2 Analytics (if implemented)
**Purpose:** Usage statistics, service improvement
**Legal Basis:** Consent (GDPR Article 6(1)(a))

We use privacy-friendly analytics (anonymized IP, no cross-site tracking).

**You can opt out** in Settings → Privacy.

### 11.3 Third-Party Cookies
Stripe may set cookies during payment processing. See Stripe's Privacy Policy.

---

## 12. CHANGES TO THIS POLICY

We may update this Privacy Policy to reflect changes in:
- Legal requirements
- Service features
- Data practices

**You will be notified** of significant changes via:
- Email notification
- In-app notification
- Website banner

**Last updated:** 2026-02-01

---

## 13. CONTACT US

**Privacy Questions:**
Email: privacy@yourcompany.com

**Data Protection Officer:**
Email: dpo@yourcompany.com

**General Support:**
Email: support@yourcompany.com

**Mailing Address:**
[Your Company Name]
[Street Address]
[City, Postal Code]
[Country]

---

## 14. LEGAL BASIS SUMMARY

| Data Type | Purpose | Legal Basis |
|-----------|---------|-------------|
| Account info | Authentication | Contract (Art. 6(1)(b)) |
| Vehicle data | Service delivery | Contract (Art. 6(1)(b)) |
| Booking data | Service fulfillment | Contract (Art. 6(1)(b)) |
| Payment data | Payment processing | Contract (Art. 6(1)(b)) |
| Technical logs | Security, fraud prevention | Legitimate interest (Art. 6(1)(f)) |
| Marketing | Promotional emails | Consent (Art. 6(1)(a)) |
| Tax records (7yr) | Legal obligation | Legal obligation (Art. 6(1)(c)) |

---

**Your privacy is important to us.** If you have any questions or concerns, please contact us at privacy@yourcompany.com.
