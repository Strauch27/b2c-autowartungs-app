# Payment System Architecture

Visual documentation of the Stripe payment integration architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Customer (Browser)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Booking   │→ │  Payment   │→ │Confirmation│                │
│  │   Form     │  │   Page     │  │    Page    │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                         ↓                                        │
│                  Stripe Elements                                 │
│                  (Card Input Form)                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Payment Components                           │  │
│  │  ┌────────────────┐  ┌─────────────┐  ┌───────────────┐ │  │
│  │  │StripeCheckout  │  │PaymentForm  │  │PaymentStatus  │ │  │
│  │  └────────────────┘  └─────────────┘  └───────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Client (fetch)                           │  │
│  │  • POST /api/payment/create-intent                        │  │
│  │  • GET  /api/payment/status/:id                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Express)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Payment Routes                               │  │
│  │  • POST /api/payment/create-intent (auth, rate-limited)  │  │
│  │  • GET  /api/payment/status/:id (auth)                   │  │
│  │  • POST /api/payment/webhook (signature-verified)        │  │
│  │  • POST /api/payment/refund (admin-only)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Payment Controller                              │  │
│  │  • Validate requests                                      │  │
│  │  • Check permissions                                      │  │
│  │  • Handle errors                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Payment Service                                │  │
│  │  • createPaymentIntent()                                  │  │
│  │  • getPaymentIntent()                                     │  │
│  │  • refundPayment()                                        │  │
│  │  • verifyWebhookSignature()                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Bookings Repository                               │  │
│  │  • findById()                                             │  │
│  │  • findByPaymentIntentId()                                │  │
│  │  • update()                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Booking Table                                            │  │
│  │  • id                                                     │  │
│  │  • customerId                                             │  │
│  │  • totalPrice (calculated server-side)                   │  │
│  │  • status (PENDING_PAYMENT → CONFIRMED)                  │  │
│  │  • paymentIntentId                                        │  │
│  │  • paidAt                                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

         ↑                                            ↓
         │                                            │
         │              Stripe API                    │
         │                                            │
    ┌────┴────────────────────────────────────────────┴────┐
    │                   Stripe                             │
    │  • Process Payments                                  │
    │  • Handle 3D Secure                                  │
    │  • Store Payment Methods                             │
    │  • Send Webhooks                                     │
    │  • Manage Refunds                                    │
    └──────────────────────────────────────────────────────┘
```

## Payment Flow Sequence

```
Customer    Frontend    Backend     Stripe      Database
   │           │           │           │            │
   ├──1─────→  │           │           │            │
   │  Create   │           │           │            │
   │  Booking  │           │           │            │
   │           │──2─────→  │           │            │
   │           │  POST     │           │            │
   │           │ /bookings │           │            │
   │           │           │──3─────→  │            │
   │           │           │  Create   │            │
   │           │           │  Booking  │            │
   │           │           │           │            │
   │           │←──4───────┤           │            │
   │           │  Booking  │           │            │
   │           │  Created  │           │            │
   │           │           │           │            │
   │←──5───────┤           │           │            │
   │  Redirect │           │           │            │
   │  Payment  │           │           │            │
   │           │           │           │            │
   ├──6─────→  │           │           │            │
   │  Load     │           │           │            │
   │  Payment  │           │           │            │
   │  Page     │           │           │            │
   │           │──7─────→  │           │            │
   │           │   POST    │           │            │
   │           │  /create- │           │            │
   │           │   intent  │           │            │
   │           │           │──8─────→  │            │
   │           │           │  Validate │            │
   │           │           │  Booking  │            │
   │           │           │           │            │
   │           │           │──9────────────────→    │
   │           │           │     Create Payment     │
   │           │           │       Intent           │
   │           │           │           │            │
   │           │           │←──10──────────────────┤
   │           │           │    client_secret       │
   │           │           │                        │
   │           │           │──11────→               │
   │           │           │  Update  │             │
   │           │           │  Booking │             │
   │           │           │  with PI │             │
   │           │           │          │             │
   │           │←──12──────┤          │             │
   │           │ clientSecret         │             │
   │           │           │          │             │
   │←──13──────┤           │          │             │
   │  Render   │           │          │             │
   │  Payment  │           │          │             │
   │  Form     │           │          │             │
   │           │           │          │             │
   ├──14──────────────────────────→  │             │
   │        Enter Card Details        │             │
   │        (via Stripe Elements)     │             │
   │                                  │             │
   ├──15──────────────────────────→  │             │
   │      Confirm Payment             │             │
   │                                  │             │
   │           │           │←──16─────┤             │
   │           │           │  Webhook:│             │
   │           │           │  payment_│             │
   │           │           │  intent. │             │
   │           │           │ succeeded│             │
   │           │           │          │             │
   │           │           │──17───────────────→    │
   │           │           │  Update Booking        │
   │           │           │  status=CONFIRMED      │
   │           │           │  paidAt=NOW()          │
   │           │           │                        │
   │←──18──────────────────────────┤                │
   │      Payment Successful         │              │
   │      (redirect to confirmation) │              │
   │                                                 │
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Components                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      StripeProvider                              │
│  (Wraps entire app - provides Stripe instance)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Payment Page                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              PaymentSummary                          │  │  │
│  │  │  • Booking details                                   │  │  │
│  │  │  • Service type                                      │  │  │
│  │  │  • Vehicle info                                      │  │  │
│  │  │  • Price breakdown                                   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              StripeCheckout                          │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │    1. Create Payment Intent                   │  │  │  │
│  │  │  │       (API call to backend)                   │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │    2. Initialize Stripe Elements              │  │  │  │
│  │  │  │       (with client_secret)                    │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │           PaymentForm                         │  │  │  │
│  │  │  │  ┌─────────────────────────────────────────┐ │  │  │  │
│  │  │  │  │      PaymentElement                     │ │  │  │  │
│  │  │  │  │  • Card input                           │ │  │  │  │
│  │  │  │  │  • SEPA input                           │ │  │  │  │
│  │  │  │  │  • Sofort input                         │ │  │  │  │
│  │  │  │  └─────────────────────────────────────────┘ │  │  │  │
│  │  │  │  • Error handling                             │  │  │  │
│  │  │  │  • Loading states                             │  │  │  │
│  │  │  │  • Submit button                              │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Confirmation Page                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PaymentStatus                                 │  │
│  │  • Real-time status check                                  │  │
│  │  • Status badge (succeeded/processing/failed)              │  │
│  │  • Amount display                                          │  │
│  │  • Refresh button                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  • Booking details                                              │
│  • Next steps information                                       │
│  • Action buttons (Dashboard, Print)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Service Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                      Payment Service                             │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ createPaymentIntent()
              │   • Validate amount (min 50 cents)
              │   • Get/create Stripe customer
              │   • Create payment intent with metadata
              │   • Enable automatic payment methods
              │   • Return client secret
              │
              ├─→ getPaymentIntent()
              │   • Retrieve from Stripe
              │   • Handle errors
              │
              ├─→ capturePayment()
              │   • Manual capture (if needed)
              │   • Log capture
              │
              ├─→ cancelPayment()
              │   • Cancel pending payment
              │   • Log cancellation
              │
              ├─→ refundPayment()
              │   • Full or partial refund
              │   • Specify reason
              │   • Log refund
              │
              ├─→ verifyWebhookSignature()
              │   • Verify Stripe signature
              │   • Construct event
              │   • Prevent replay attacks
              │
              └─→ getOrCreateStripeCustomer()
                  • Search by email
                  • Create if not exists
                  • Link to internal customer ID

┌─────────────────────────────────────────────────────────────────┐
│                  Webhook Event Handlers                          │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─→ handlePaymentSucceeded()
              │   • Update booking: status → CONFIRMED
              │   • Set paidAt timestamp
              │   • TODO: Send confirmation email
              │   • TODO: Notify workshop/jockey
              │
              ├─→ handlePaymentFailed()
              │   • Log failure
              │   • TODO: Send notification to customer
              │
              ├─→ handlePaymentCanceled()
              │   • Log cancellation
              │
              └─→ handleChargeRefunded()
                  • Find booking by payment intent
                  • Log refund
                  • TODO: Send refund confirmation
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Models                               │
└─────────────────────────────────────────────────────────────────┘

Booking (PostgreSQL)
├── id: string (cuid)
├── bookingNumber: string (unique, e.g., "BK240101")
├── customerId: string
├── vehicleId: string
├── serviceType: enum (INSPECTION, OIL_SERVICE, etc.)
├── totalPrice: Decimal (calculated server-side)
├── status: enum (PENDING_PAYMENT → CONFIRMED)
├── paymentIntentId: string? (Stripe payment intent ID)
├── paidAt: DateTime? (timestamp of successful payment)
└── priceBreakdown: JSON (detailed pricing info)

PaymentIntent (Stripe)
├── id: string (pi_xxx)
├── amount: number (in cents)
├── currency: string ("eur")
├── status: string ("requires_payment_method", "succeeded", etc.)
├── customer: string (Stripe customer ID)
├── client_secret: string (for frontend)
└── metadata
    ├── bookingId: string
    ├── customerId: string
    └── bookingNumber: string

Customer (Stripe)
├── id: string (cus_xxx)
├── email: string
└── metadata
    └── customerId: string (internal customer ID)
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Architecture                       │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├── HTTPS/TLS encryption
├── CORS policy (allowed origins)
└── Rate limiting (DDoS protection)

Layer 2: Authentication
├── JWT token validation
├── User identification
└── Session management

Layer 3: Authorization
├── Customer can only pay own bookings
├── Admin-only refund endpoint
└── Role-based access control

Layer 4: Data Validation
├── Input validation (Zod schemas)
├── Amount validation (min 50 cents)
├── Booking status validation
└── Type checking (TypeScript)

Layer 5: Payment Security
├── PCI-DSS compliance via Stripe
├── No card data on server
├── Stripe Elements for card input
└── 3D Secure authentication

Layer 6: Webhook Security
├── Signature verification
├── Replay attack prevention
├── Raw body parsing
└── Timestamp validation

Layer 7: Price Integrity
├── Server-side price calculation
├── No client-provided amounts
├── Booking-based pricing
└── Audit trail in database
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Error Handling                              │
└─────────────────────────────────────────────────────────────────┘

Frontend Error Handling
├── Network Errors
│   ├── Show retry button
│   └── User-friendly message
├── Validation Errors
│   ├── Field-level error messages
│   └── Form submission prevention
├── Payment Errors
│   ├── Card declined → Show error, allow retry
│   ├── Insufficient funds → Suggest different card
│   └── 3D Secure failed → Explain next steps
└── API Errors
    ├── 401 → Redirect to login
    ├── 403 → Show permission error
    ├── 404 → Show not found message
    └── 500 → Show generic error, log details

Backend Error Handling
├── Validation Errors (400)
│   ├── Invalid booking ID
│   ├── Invalid amount
│   └── Missing required fields
├── Authentication Errors (401)
│   ├── Missing token
│   └── Invalid token
├── Authorization Errors (403)
│   ├── Wrong customer
│   └── Insufficient permissions
├── Not Found Errors (404)
│   ├── Booking not found
│   └── Payment intent not found
├── Conflict Errors (409)
│   └── Booking already paid
└── Stripe Errors
    ├── Card declined (400)
    ├── Insufficient funds (400)
    ├── Invalid request (400)
    └── Rate limit exceeded (429)

Error Recovery
├── Automatic Retry
│   └── Webhook delivery (Stripe handles)
├── Manual Retry
│   ├── Payment form retry button
│   └── Payment status refresh
└── Support Escalation
    ├── Error logging (Winston)
    └── Admin notification (TODO)
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring Points                             │
└─────────────────────────────────────────────────────────────────┘

Application Logs (Winston)
├── Payment Intent Created
│   ├── bookingId
│   ├── amount
│   └── timestamp
├── Payment Succeeded
│   ├── bookingId
│   ├── paymentIntentId
│   └── amount
├── Payment Failed
│   ├── reason
│   └── error details
└── Webhook Events
    ├── event type
    ├── event ID
    └── processing status

Stripe Dashboard
├── Payment List
│   ├── Status
│   ├── Amount
│   └── Customer
├── Events Log
│   ├── Webhook deliveries
│   └── API requests
├── Disputes
│   └── Chargebacks
└── Customers
    └── Payment history

Database Queries
├── Bookings by status
├── Bookings by payment status
├── Revenue metrics
└── Refund metrics

Performance Metrics
├── Payment intent creation time
├── Webhook processing time
├── API response times
└── Error rates
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Production Deployment                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Customer   │─────→│   Cloudflare │─────→│   Next.js    │
│   Browser    │      │   (CDN/SSL)  │      │   Frontend   │
└──────────────┘      └──────────────┘      └──────────────┘
                                                     │
                                                     ↓
                                             ┌──────────────┐
                                             │   API Load   │
                                             │   Balancer   │
                                             └──────────────┘
                                                     │
                        ┌────────────────────────────┼────────────┐
                        ↓                            ↓            ↓
                 ┌────────────┐             ┌────────────┐ ┌────────────┐
                 │  Express   │             │  Express   │ │  Express   │
                 │  Backend 1 │             │  Backend 2 │ │  Backend 3 │
                 └────────────┘             └────────────┘ └────────────┘
                        │                            │            │
                        └────────────────────────────┼────────────┘
                                                     ↓
                                             ┌──────────────┐
                                             │  PostgreSQL  │
                                             │   Database   │
                                             └──────────────┘

Stripe Webhooks (Direct to Backend)
┌──────────────┐
│    Stripe    │───────────────────────────────→ Backend Load Balancer
└──────────────┘                                 (webhook endpoint)

Environment Variables (Production)
├── Backend
│   ├── STRIPE_SECRET_KEY=sk_live_...
│   ├── STRIPE_WEBHOOK_SECRET=whsec_live_...
│   └── DATABASE_URL=postgresql://...
└── Frontend
    └── NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

**Last Updated:** February 1, 2024
**Version:** 1.0.0
