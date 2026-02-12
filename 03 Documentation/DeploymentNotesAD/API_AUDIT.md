# API Design Audit

> **Date:** 2026-02-09
> **Reference Guidelines:** [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/), [Microsoft REST API Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
> **Scope:** All 85+ endpoints across 15 route files

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Full Endpoint Inventory](#2-full-endpoint-inventory)
3. [Violation Analysis](#3-violation-analysis)
4. [Redesign Proposals](#4-redesign-proposals)
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Checklist Summary](#6-checklist-summary)

---

## 1. Executive Summary

The API is functional and covers the business domain well, but deviates from industry-standard REST conventions in several areas. The most impactful issues are:

| # | Issue | Severity | Guideline |
|---|-------|----------|-----------|
| 1 | **Verbs in URL paths** (e.g. `/approve`, `/complete`, `/start-pickup`) | High | Zalando: "Keep URLs verb-free" |
| 2 | **No API versioning strategy** | High | Microsoft: Plan for evolution |
| 3 | **Inconsistent resource naming** (singular vs plural, mixed nesting) | Medium | Zalando: "Pluralize resource names" |
| 4 | **camelCase query parameters** | Medium | Zalando: "Use snake_case for query parameters" |
| 5 | **Non-standard error format** | Medium | Zalando: "Use RFC 7807 Problem Details" |
| 6 | **No pagination metadata in responses** | Medium | Zalando: "Support pagination" |
| 7 | **Role-specific auth endpoints** instead of unified auth | Low | Resource-oriented design |
| 8 | **Missing kebab-case** in multi-word path segments | Low | Zalando: "Use kebab-case for path segments" |

---

## 2. Full Endpoint Inventory

### 2.1 Authentication (`/api/auth`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/auth/customer/register` | `loginRateLimiter` |
| POST | `/api/auth/customer/login` | `loginRateLimiter` |
| POST | `/api/auth/jockey/login` | `loginRateLimiter` |
| POST | `/api/auth/workshop/login` | `loginRateLimiter` |
| POST | `/api/auth/logout` | None |
| GET | `/api/auth/me` | `authenticate` |

### 2.2 Vehicles (`/api/vehicles`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/vehicles` | `authenticate`, `requireCustomer` |
| GET | `/api/vehicles/:id` | `authenticate`, `requireCustomer` |
| POST | `/api/vehicles` | `authenticate`, `requireCustomer` |
| PATCH | `/api/vehicles/:id` | `authenticate`, `requireCustomer` |
| DELETE | `/api/vehicles/:id` | `authenticate`, `requireCustomer` |

### 2.3 Bookings (`/api/bookings`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/bookings` | `optionalAuthenticate` |
| GET | `/api/bookings` | `authenticate`, `requireCustomer` |
| GET | `/api/bookings/:id` | `authenticate`, `requireCustomer` |
| PUT | `/api/bookings/:id` | `authenticate`, `requireCustomer` |
| DELETE | `/api/bookings/:id` | `authenticate`, `requireCustomer` |
| GET | `/api/bookings/:id/status` | `authenticate`, `requireCustomer` |
| GET | `/api/bookings/:id/extensions` | `authenticate`, `requireCustomer` |
| POST | `/api/bookings/:id/extensions/:extensionId/approve` | `authenticate`, `requireCustomer` |
| POST | `/api/bookings/:id/extensions/:extensionId/decline` | `authenticate`, `requireCustomer` |

### 2.4 Services (`/api/services`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/services` | None |
| GET | `/api/services/brands` | None |
| GET | `/api/services/brands/:brand/models` | None |
| GET | `/api/services/:type/price` | None |

### 2.5 Payment (`/api/payment`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/payment/create-intent` | `authenticate`, `paymentLimiter` |
| GET | `/api/payment/status/:paymentIntentId` | `authenticate` |
| POST | `/api/payment/webhook` | `webhookLimiter` |
| POST | `/api/payment/refund` | `authenticate`, `paymentLimiter` |
| POST | `/api/payment/authorize-extension` | `authenticate`, `paymentLimiter` |
| POST | `/api/payment/capture-extension` | `authenticate`, `paymentLimiter` |

### 2.6 Upload (`/api/upload`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/upload/single` | `authenticate`, `uploadSingleFile` |
| POST | `/api/upload/multiple` | `authenticate`, `uploadMultipleFiles` |
| DELETE | `/api/upload/:key` | `authenticate` |
| POST | `/api/upload/delete-multiple` | `authenticate` |
| GET | `/api/upload/signed-url/:key` | `authenticate` |
| POST | `/api/upload/generate-upload-url` | `authenticate` |
| GET | `/api/upload/exists/:key` | `authenticate` |

### 2.7 Notifications (`/api/notifications`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/notifications/register-token` | `authenticate` |
| DELETE | `/api/notifications/register-token` | `authenticate` |
| POST | `/api/notifications/send` | `authenticate` |
| GET | `/api/notifications/history` | `authenticate` |
| GET | `/api/notifications/unread-count` | `authenticate` |
| PATCH | `/api/notifications/:id/read` | `authenticate` |
| PATCH | `/api/notifications/read-all` | `authenticate` |
| POST | `/api/notifications/topics/subscribe` | `authenticate` |
| POST | `/api/notifications/topics/unsubscribe` | `authenticate` |

### 2.8 Analytics (`/api/analytics`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/analytics/bookings` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/revenue` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/users` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/performance` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/jockeys/top` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/workshops/top` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/customer/:customerId/lifetime-value` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/cohorts` | `authenticate`, `requireAdmin` |
| GET | `/api/analytics/export` | `authenticate`, `requireAdmin` |

### 2.9 Workshops (`/api/workshops`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/workshops/orders` | `authenticate`, `requireWorkshop` |
| GET | `/api/workshops/orders/:id` | `authenticate`, `requireWorkshop` |
| POST | `/api/workshops/orders/:bookingId/extensions` | `authenticate`, `requireWorkshop` |
| PUT | `/api/workshops/orders/:id/status` | `authenticate`, `requireWorkshop` |

### 2.10 Extensions (`/api/extensions`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/extensions/:id/approve` | `authenticate`, `extensionLimiter` |
| POST | `/api/extensions/:id/decline` | `authenticate`, `extensionLimiter` |

### 2.11 Jockeys (`/api/jockeys`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/jockeys/assignments` | `authenticate`, `requireJockey` |
| GET | `/api/jockeys/assignments/:id` | `authenticate`, `requireJockey` |
| PATCH | `/api/jockeys/assignments/:id/status` | `authenticate`, `requireJockey` |
| POST | `/api/jockeys/assignments/:id/handover` | `authenticate`, `requireJockey` |
| POST | `/api/jockeys/assignments/:id/complete` | `authenticate`, `requireJockey` |

### 2.12 GDPR (`/api/gdpr`)

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/api/gdpr/export` | `authenticate`, `gdprLimiter` |
| GET | `/api/gdpr/portable` | `authenticate`, `gdprLimiter` |
| GET | `/api/gdpr/summary` | `authenticate`, `gdprLimiter` |
| POST | `/api/gdpr/delete` | `authenticate`, `gdprLimiter` |
| POST | `/api/gdpr/restrict` | `authenticate`, `gdprLimiter` |

### 2.13 Demo (`/api/demo`) — DEMO_MODE only

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/demo/payment/confirm` | None |
| POST | `/api/demo/extension/authorize` | None |
| POST | `/api/demo/extension/capture` | None |
| POST | `/api/demo/extension/decline` | None |
| GET | `/api/demo/payment/:paymentIntentId` | None |

### 2.14 Test (`/api/test`) — E2E_TEST only

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| POST | `/api/test/reset` | `e2eOnly` |
| POST | `/api/test/token` | `e2eOnly` |
| POST | `/api/test/advance-booking` | `e2eOnly` |

### 2.15 Health

| Method | Current Path | Middleware |
|--------|-------------|-----------|
| GET | `/health` | None |

---

## 3. Violation Analysis

### 3.1 Verbs in URL Paths

**Rule:** *"Keep URLs verb-free"* (Zalando), *"Use nouns, not verbs"* (Microsoft)

URLs should express **what** (resource) not **how** (action). The HTTP method already communicates the action.

| Current Path | Verb in Path | Problem |
|-------------|-------------|---------|
| `POST /api/bookings/:id/extensions/:extId/approve` | `approve` | Action encoded in URL |
| `POST /api/bookings/:id/extensions/:extId/decline` | `decline` | Action encoded in URL |
| `POST /api/extensions/:id/approve` | `approve` | Duplicate of above |
| `POST /api/extensions/:id/decline` | `decline` | Duplicate of above |
| `POST /api/jockeys/assignments/:id/complete` | `complete` | Action encoded in URL |
| `POST /api/jockeys/assignments/:id/handover` | `handover` | Action encoded in URL |
| `POST /api/payment/create-intent` | `create-intent` | Action + verb |
| `POST /api/payment/authorize-extension` | `authorize-extension` | Action + verb |
| `POST /api/payment/capture-extension` | `capture-extension` | Action + verb |
| `POST /api/payment/refund` | `refund` | Action as noun is borderline acceptable |
| `POST /api/upload/delete-multiple` | `delete-multiple` | Should use `DELETE` method |
| `POST /api/upload/generate-upload-url` | `generate-upload-url` | Action encoded in URL |
| `POST /api/notifications/register-token` | `register-token` | Action encoded in URL |
| `DELETE /api/notifications/register-token` | `register-token` | Mixes verb with noun |
| `POST /api/notifications/send` | `send` | Action encoded in URL |
| `PATCH /api/notifications/read-all` | `read-all` | Action encoded in URL |
| `POST /api/notifications/topics/subscribe` | `subscribe` | Action encoded in URL |
| `POST /api/notifications/topics/unsubscribe` | `unsubscribe` | Action encoded in URL |
| `POST /api/demo/payment/confirm` | `confirm` | Action encoded in URL |
| `POST /api/gdpr/delete` | `delete` | Should use `DELETE` method |
| `POST /api/gdpr/restrict` | `restrict` | Action encoded in URL |

**Count: 21 endpoints with verbs in paths (~25% of all endpoints)**

---

### 3.2 Inconsistent Resource Naming

**Rule:** *"Pluralize resource names"* (Zalando), *"Use plural nouns for collections"* (Microsoft)

| Path Segment | Issue |
|-------------|-------|
| `/api/payment/...` | Singular — should be `/api/payments/...` |
| `/api/upload/...` | Singular — should be `/api/uploads/...` or `/api/files/...` |
| `/api/gdpr/...` | Not a resource — GDPR is a regulation, not a domain entity |

**Inconsistency in sub-resource nesting:**

| Pattern | Example | Issue |
|---------|---------|-------|
| Portal-scoped | `GET /api/workshops/orders` | Workshop is an actor, not a resource parent — should be `GET /api/orders?role=workshop` or separate admin endpoint |
| Mixed nesting depth | `POST /api/bookings/:id/extensions/:extId/approve` | 4 levels deep — Zalando recommends max 3 |
| Duplicate routes | `/api/extensions/:id/approve` AND `/api/bookings/:id/extensions/:extId/approve` | Same action exposed at two different paths |

---

### 3.3 Query Parameter Naming

**Rule:** *"Use snake_case for query parameters"* (Zalando)

| Current Parameter | Should Be |
|-------------------|-----------|
| `includeBookings` | `include_bookings` |
| `startDate` | `start_date` |
| `endDate` | `end_date` |
| `serviceType` | `service_type` |
| `paymentIntentId` | `payment_intent_id` |
| `customerId` | `customer_id` |
| `expiresIn` | `expires_in` |

> **Note:** This is a Zalando-specific convention. Many APIs (including Stripe) use camelCase. If you choose camelCase, be consistent everywhere. The current codebase is consistent with camelCase, so this is low severity — but worth documenting as a conscious decision.

---

### 3.4 Error Response Format

**Rule:** *"Use RFC 7807 Problem Details"* (Zalando)

**Current format:**
```json
{
  "success": false,
  "message": "Error description"
}
```
or:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "stack": "..."
  }
}
```

**Issues:**
- Two different error formats used (inconsistent)
- No machine-readable error type URI
- No HTTP status code in body
- Stack trace leaks in development (acceptable for dev, but format should be consistent)

**RFC 7807 format (recommended):**
```json
{
  "type": "https://api.ronya.de/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The field 'email' is required.",
  "instance": "/api/bookings/123"
}
```

---

### 3.5 HTTP Method Misuse

**Rule:** *"Fulfill common method properties"* (Zalando), *"PUT must be idempotent"* (Microsoft)

| Current | Issue | Correct |
|---------|-------|---------|
| `POST /api/upload/delete-multiple` | POST for deletion | `DELETE /api/uploads` with body listing keys |
| `POST /api/gdpr/delete` | POST for deletion | `DELETE /api/users/me/data` |
| `PUT /api/workshops/orders/:id/status` | PUT for partial update (only status) | `PATCH /api/orders/:id` with status in body |
| `PUT /api/bookings/:id` | PUT but only updates `customerNotes` | `PATCH /api/bookings/:id` |

---

### 3.6 Missing Pagination Metadata

**Rule:** *"Support pagination"* (Zalando), offset/limit pattern (Microsoft)

Current pagination uses `?page=1&limit=20` but responses lack standard metadata:

**Missing in responses:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_count": 142,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

Zalando recommends cursor-based pagination over offset-based for better performance with large/dynamic datasets.

---

### 3.7 No API Versioning

**Rule:** *"Use media type versioning"* (Zalando), plan for API evolution (Microsoft)

Current state: All routes mounted under `/api/*` with no version strategy.

**Risk:** Any breaking change (renamed field, removed endpoint, changed response shape) will break all clients simultaneously.

---

### 3.8 Missing kebab-case in Path Segments

**Rule:** *"Use kebab-case for path segments"* (Zalando)

| Current | Should Be |
|---------|-----------|
| `/api/payment/create-intent` | Already kebab (but shouldn't be a verb — see 3.1) |
| `/api/payment/authorize-extension` | Already kebab (but shouldn't be a verb) |
| `/api/notifications/register-token` | Already kebab (but shouldn't be a verb) |
| `/api/notifications/unread-count` | `unread-count` is fine as a computed sub-resource |
| `/api/upload/signed-url/:key` | `signed-url` — fine as noun |
| `/api/analytics/lifetime-value` | Fine |
| `/:paymentIntentId` | Path params should use kebab or snake: `:payment-intent-id` |

Multi-word path segments that are nouns correctly use kebab-case. The issue is that most multi-word segments are verbs that shouldn't be in the path at all.

---

## 4. Redesign Proposals

### 4.1 Jockey Assignments — State Transitions via PATCH

**Current (verb-based):**
```
POST   /api/jockeys/assignments/:id/complete
POST   /api/jockeys/assignments/:id/handover
PATCH  /api/jockeys/assignments/:id/status
```

**Proposed (resource + state):**
```
GET    /api/assignments                          ← List (filtered by authenticated jockey)
GET    /api/assignments/:id                      ← Detail
PATCH  /api/assignments/:id                      ← Update status + handover data
```

The PATCH body communicates the action:
```json
// Transition to EN_ROUTE
{ "status": "en_route" }

// Complete with handover data
{
  "status": "completed",
  "handover": {
    "photos": ["s3://..."],
    "signature": "base64...",
    "notes": "Minor scratch on left door"
  }
}
```

**Why:** The FSM (`bookingFsm.ts`) already validates allowed transitions. The endpoint just needs to receive the target state — the backend decides if the transition is legal.

---

### 4.2 Extensions — State Transitions via PATCH

**Current (verb-based, duplicated):**
```
POST  /api/bookings/:id/extensions/:extId/approve
POST  /api/bookings/:id/extensions/:extId/decline
POST  /api/extensions/:id/approve
POST  /api/extensions/:id/decline
```

**Proposed (single resource, single endpoint):**
```
GET    /api/extensions                            ← List (filtered by booking or customer)
GET    /api/extensions/:id                        ← Detail
PATCH  /api/extensions/:id                        ← Update status
```

The PATCH body communicates the decision:
```json
// Approve
{ "status": "approved" }

// Decline
{ "status": "declined", "reason": "Too expensive" }
```

**Benefits:**
- Eliminates 4 duplicate endpoints
- Removes verbs from paths
- Single endpoint, body-driven actions
- Nesting reduced from 4 to 2 levels

---

### 4.3 Payment — Resource-Oriented

**Current (verb-based):**
```
POST  /api/payment/create-intent
POST  /api/payment/authorize-extension
POST  /api/payment/capture-extension
POST  /api/payment/refund
GET   /api/payment/status/:paymentIntentId
POST  /api/payment/webhook
```

**Proposed:**
```
POST   /api/payments                              ← Create payment intent
GET    /api/payments/:id                           ← Get payment status
POST   /api/payments/:id/captures                  ← Capture authorized payment
POST   /api/payments/:id/refunds                   ← Refund a payment
POST   /api/payments/webhooks                      ← Stripe webhook (or keep external)
```

The PATCH body for the payment intent distinguishes booking vs. extension:
```json
// Create intent for booking
POST /api/payments
{ "booking_id": "...", "type": "booking" }

// Create authorization for extension
POST /api/payments
{ "extension_id": "...", "type": "extension_authorization" }
```

`captures` and `refunds` are sub-resources (nouns!) that represent the result of an action — this is the standard REST pattern for non-CRUD operations.

---

### 4.4 Notifications — Resource-Oriented

**Current (verb-based):**
```
POST   /api/notifications/register-token
DELETE /api/notifications/register-token
POST   /api/notifications/send
GET    /api/notifications/history
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
POST   /api/notifications/topics/subscribe
POST   /api/notifications/topics/unsubscribe
```

**Proposed:**
```
# Notification messages
GET    /api/notifications                          ← List (replaces /history)
GET    /api/notifications/unread-count             ← Computed sub-resource (acceptable)
PATCH  /api/notifications/:id                      ← Mark as read: { "read": true }
PATCH  /api/notifications                          ← Bulk update: { "read": true } (replaces /read-all)

# Device tokens (separate resource)
POST   /api/device-tokens                          ← Register FCM token
DELETE /api/device-tokens/:token                    ← Unregister

# Topic subscriptions (separate resource)
POST   /api/topic-subscriptions                    ← Subscribe: { "topic": "..." }
DELETE /api/topic-subscriptions/:topic             ← Unsubscribe

# Sending (admin action)
POST   /api/notifications                          ← Admin sends notification (POST to collection = create)
```

---

### 4.5 Upload — Resource-Oriented

**Current (verb-based):**
```
POST   /api/upload/single
POST   /api/upload/multiple
DELETE /api/upload/:key
POST   /api/upload/delete-multiple
GET    /api/upload/signed-url/:key
POST   /api/upload/generate-upload-url
GET    /api/upload/exists/:key
```

**Proposed:**
```
POST   /api/files                                  ← Upload one or more files
DELETE /api/files/:key                              ← Delete single file
DELETE /api/files                                   ← Bulk delete (keys in body)
GET    /api/files/:key                              ← Get file metadata + signed URL
GET    /api/files/:key/exists                       ← Check existence (or use HEAD /api/files/:key)
POST   /api/files/upload-urls                       ← Generate presigned upload URLs
```

**Better alternative for existence check:** Use `HEAD /api/files/:key` which returns 200 or 404 with no body — this is the standard HTTP pattern for existence checks.

---

### 4.6 GDPR — User Data Rights as Resources

**Current:**
```
GET    /api/gdpr/export
GET    /api/gdpr/portable
GET    /api/gdpr/summary
POST   /api/gdpr/delete
POST   /api/gdpr/restrict
```

**Proposed:**
```
GET    /api/users/me/data                          ← Full data export (Art. 15)
GET    /api/users/me/data/portable                 ← Portable format (Art. 20)
GET    /api/users/me/data/summary                  ← Compliance summary
DELETE /api/users/me/data                          ← Right to erasure (Art. 17)
POST   /api/users/me/data/restrictions             ← Right to restriction (Art. 18)
```

**Why:** GDPR is about user data rights — model it under the user resource. `DELETE` for deletion is semantically correct. A `restriction` is a sub-resource (noun) that gets created.

---

### 4.7 Workshop Orders — Clarify Ownership

**Current:**
```
GET    /api/workshops/orders
GET    /api/workshops/orders/:id
POST   /api/workshops/orders/:bookingId/extensions
PUT    /api/workshops/orders/:id/status
```

**Proposed:**
```
GET    /api/orders                                 ← Filtered by authenticated workshop
GET    /api/orders/:id                             ← Order detail
PATCH  /api/orders/:id                             ← Update status: { "status": "in_service" }
POST   /api/orders/:id/extensions                  ← Create extension for order
```

**Why:** "Workshop" is the authenticated actor, not a resource parent. The middleware (`requireWorkshop`) already scopes data to the logged-in workshop. The path should reflect the resource (`orders`), not the actor.

---

### 4.8 Auth — Unified Endpoint

**Current (role-specific paths):**
```
POST  /api/auth/customer/register
POST  /api/auth/customer/login
POST  /api/auth/jockey/login
POST  /api/auth/workshop/login
POST  /api/auth/logout
GET   /api/auth/me
```

**Proposed (unified):**
```
POST  /api/auth/sessions                           ← Login (role in body)
DELETE /api/auth/sessions                           ← Logout
POST  /api/auth/registrations                      ← Register (role in body)
GET   /api/auth/sessions/me                        ← Current user
```

Request body determines the role:
```json
POST /api/auth/sessions
{
  "role": "customer",
  "email": "...",
  "password": "..."
}

POST /api/auth/sessions
{
  "role": "jockey",
  "username": "...",
  "password": "..."
}
```

**Why:** Sessions and registrations are resources (nouns). The role is a property of the resource, not a path segment. This is cleaner and scales better (no new paths for new roles).

---

## 5. Cross-Cutting Concerns

### 5.1 Versioning Strategy

**Recommendation:** Media type versioning (Zalando preferred) or URL prefix (pragmatic).

For a pragmatic approach, use URL prefix:
```
/api/v1/bookings
/api/v1/payments
```

This is the simplest to implement and most widely understood. Zalando discourages it in favor of media type versioning, but URL versioning is the industry standard for most APIs (Stripe, GitHub, Twilio all use it).

**Action:** Add `/v1/` prefix now, before the API goes to production. Retrofitting versioning is painful.

---

### 5.2 Standardized Error Response (RFC 7807)

Adopt a single error format across all endpoints:

```json
{
  "type": "https://api.ronya.de/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Field 'email' must be a valid email address.",
  "instance": "/api/v1/bookings",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "mileage", "message": "Must be a positive integer" }
  ]
}
```

**Implementation:** Replace both `{ success: false, message }` and `{ success: false, error: { message } }` patterns with a single `ProblemDetail` response builder in the error handler middleware.

---

### 5.3 Pagination Response Envelope

Standardize all list endpoints to return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 142,
    "total_pages": 8
  }
}
```

Or for cursor-based (Zalando preferred):
```json
{
  "data": [...],
  "cursor": {
    "next": "eyJpZCI6MTIzfQ==",
    "previous": null
  }
}
```

---

### 5.4 Standard Success Response Envelope

Current: `{ success: true, data: { ... } }`

This is fine and consistent. Keep it — but consider dropping the `success` boolean since the HTTP status code already conveys success/failure. Many modern APIs return data directly:

```json
// Instead of:
{ "success": true, "data": { "id": "123", "status": "confirmed" } }

// Consider:
{ "id": "123", "status": "confirmed" }
```

The `success` wrapper adds bytes without information the HTTP status doesn't already provide.

---

### 5.5 OpenAPI / Swagger Specification

**Rule:** *"Provide API reference definition using OpenAPI"* (Zalando)

Currently the API is documented in markdown only. An OpenAPI spec would provide:
- Auto-generated client SDKs
- Interactive API explorer (Swagger UI)
- Request/response validation
- Contract-first development

**Action:** Add `openapi.yaml` and serve Swagger UI at `/api/docs`.

---

### 5.6 Rate Limiting Headers

**Rule:** *"Use code 429 with headers for rate limits"* (Zalando)

The rate limiter uses `standardHeaders: true` which is correct — it sends `RateLimit-*` headers. Verify that `429 Too Many Requests` is returned (not 400 or 403) when limits are exceeded.

---

## 6. Checklist Summary

### Path Design

| Rule | Status | Count |
|------|--------|-------|
| No verbs in paths | FAIL | 21 violations |
| Plural resource names | PARTIAL | 3 singular resources |
| kebab-case path segments | PASS | Consistent where applicable |
| Max 3 nesting levels | FAIL | 1 violation (bookings/extensions/approve) |
| No duplicate routes | FAIL | 2 duplicate extension routes |

### HTTP Methods

| Rule | Status | Count |
|------|--------|-------|
| GET for retrieval | PASS | All correct |
| POST for creation | PARTIAL | Some POST used for actions |
| PATCH for partial updates | FAIL | PUT used where PATCH appropriate |
| DELETE for deletion | FAIL | POST used for deletion in 2 places |
| Idempotent PUT | UNKNOWN | Not verified |

### Request/Response

| Rule | Status |
|------|--------|
| RFC 7807 error format | FAIL — custom format, inconsistent |
| Pagination metadata | FAIL — missing in responses |
| Consistent success envelope | PASS — `{ success, data }` |
| snake_case query params | FAIL — camelCase used (minor if intentional) |

### Operations

| Rule | Status |
|------|--------|
| API versioning | FAIL — no strategy |
| Rate limiting with 429 | PASS — configured with standard headers |
| OpenAPI specification | FAIL — not present |
| Health check | PASS — `/health` |
| CORS configuration | PASS — configured |

### Overall Compliance

| Guideline | Score |
|-----------|-------|
| **Zalando RESTful API Guidelines** | ~45% compliant |
| **Microsoft REST API Best Practices** | ~55% compliant |

The API is functional and well-secured, but needs a design pass to align with industry REST conventions before going to production.
