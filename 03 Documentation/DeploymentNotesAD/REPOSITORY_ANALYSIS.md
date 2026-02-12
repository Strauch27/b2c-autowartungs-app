# B2C Autowartungs-App — Repository Analysis

> **Date:** 2026-02-09
> **Scope:** Full codebase analysis — architecture, requirements, code quality, test coverage

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Requirements & Features](#2-key-requirements--features)
3. [Actors & User Roles](#3-actors--user-roles)
4. [System Context & External Integrations](#4-system-context--external-integrations)
5. [Architectural Overview](#5-architectural-overview)
6. [Component Model](#6-component-model)
7. [Database Schema](#7-database-schema)
8. [Key Business Workflows](#8-key-business-workflows)
9. [Code Quality Analysis](#9-code-quality-analysis)
10. [Test Coverage Analysis](#10-test-coverage-analysis)
11. [Recommendations](#11-recommendations)

---

## 1. Project Overview

**Project Name:** B2C Autowartungs-App (B2C Auto-Maintenance App)

**Vision:** Create the simplest and most transparent digital solution for car maintenance in Germany with fixed-price guarantees, concierge service, and complete digitalization. The app rebuilds customer trust by eliminating surprise costs.

**Type:** Full-stack multi-portal web application (Next.js + Express + PostgreSQL)

**Key Differentiators:**

- Fixed-price guarantee ("you pay only what you book")
- Concierge service with Ronja replacement vehicles
- Digital service extension approval process
- Brand/model-specific pricing (not vehicle-class-based)

**Target Market:**

- Primary: Younger generation (under 30), digitally savvy
- Secondary: 2–4 vehicle owners, price-conscious but service-oriented
- Geographic focus: Witten, Germany (initial MVP, 50–60 km service radius)

**Deployment Strategy:**

- Phase 1 (MVP): Local/development deployment for testing and demos
- Phase 2 (Post-MVP): Azure Cloud migration for scalability

---

## 2. Key Requirements & Features

### Core Features (MVP)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Fixed-Price Booking** | Vehicle selection (brand, model, year, mileage) → dynamic price calculation → service & date selection → Stripe payment → confirmation |
| 2 | **Concierge Service** | Pick-up/delivery scheduling, Ronja replacement vehicle allocation, jockey assignment, handover documentation with photos/signatures |
| 3 | **Digital Service Extension** | Workshop identifies additional work → customer notified with photos, description, price → digital approve/decline → automatic payment processing |
| 4 | **Payment Processing** | Stripe integration: payment intents, authorize & capture flow for extensions, webhook handling, refund processing |
| 5 | **Multi-Portal Architecture** | Customer, Jockey, Workshop, and Admin portals with role-based access |
| 6 | **Multi-Language Support** | German (de) and English (en) via next-intl with 1000+ translation keys |
| 7 | **Notifications** | Firebase Cloud Messaging (push), email (Resend/SendGrid/SMTP), SMS (framework in place) |

### Service Types

- Inspection (30k / 60k / 90k / 120k km intervals)
- Oil Service
- Brake Service
- TÜV/HU
- Climate Service

---

## 3. Actors & User Roles

| Role | Auth Method | Portal | Key Capabilities |
|------|------------|--------|-----------------|
| **Customer** | Magic Link (email, JWT + httpOnly cookies, 7-day expiry) | Customer Portal | Browse/book services, pay, track status, approve/decline extensions, manage vehicles |
| **Jockey** | Username + Password (bcrypt) | Jockey Portal | View assigned jobs, update status (ASSIGNED → EN_ROUTE → AT_LOCATION → IN_PROGRESS → COMPLETED), document handovers |
| **Workshop** | Username + Password (bcrypt) | Workshop Portal | Manage orders (Kanban), create extensions with media, manage time slots/capacity, view analytics |
| **Admin** | Username + Password (bcrypt) | Admin Portal | System analytics (framework in place, detailed implementation in progress) |

---

## 4. System Context & External Integrations

```
                          ┌─────────────────────────┐
                          │    B2C Auto-Wartung App  │
                          │  (Next.js 16 + Express)  │
                          └────────────┬────────────┘
                                       │
        ┌──────────┬───────────┬───────┴───┬───────────┬───────────┐
        ▼          ▼           ▼           ▼           ▼           ▼
    Stripe      AWS S3     Firebase    Nodemailer  PostgreSQL   (Future)
   Payments   File Store     FCM        Email       Prisma     Odoo ERP
                            Push                               Maps/SMS
```

### Stripe (Payment Processing)

- Payment intent creation for bookings
- Webhook handling for payment confirmations
- Manual capture flow for extension payments
- Refund processing
- Test mode (development) and Live mode (production)

### AWS S3 (File Storage)

- Multi-resolution image processing (thumbnail, medium, large) via Sharp
- Video upload support (MP4, MOV up to 50 MB; images up to 10 MB)
- Signed URL generation
- Folder structure: `jockeys/`, `workshops/`, `vehicles/`, `maintenance/`

### Firebase Cloud Messaging (Push Notifications)

- FCM token storage per user
- Push notification logging and tracking
- Delivery status monitoring
- Notification types: `BOOKING_CONFIRMATION`, `STATUS_UPDATE`, `PICKUP_REMINDER`, `SERVICE_COMPLETE`, `DELIVERY_REMINDER`, etc.

### Email (Multi-Provider)

- Providers: Resend (recommended), SendGrid, SMTP (Mailtrap for dev), Console (dev)
- Handlebars template engine with custom helpers (`formatDate`, `formatPrice`, etc.)
- Types: booking confirmations, status updates, extension notifications, payment confirmations

### Future Integrations (Post-MVP)

- **Odoo ERP** — Accounting, order management, inventory
- **Maps/Geolocation** — Service radius validation
- **SMS** — Notification framework in place

---

## 5. Architectural Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.1.6 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui (Radix UI) |
| Forms/Validation | React Hook Form 7.71 + Zod 3.23 |
| Payment UI | Stripe React/Elements |
| i18n | next-intl 4.8.1 |
| Backend | Express 4.21, TypeScript 5.7, Node.js 20 |
| Database | PostgreSQL 14+ with Prisma 6.2 ORM |
| Auth | JWT (jsonwebtoken 9.0) + bcrypt 5.1 |
| Logging | Winston 3.17 |
| E2E Testing | Playwright 1.58 (Chromium, Firefox, Safari, Mobile) |
| Backend Testing | Jest 29.7 + Supertest 7.2 |
| Infrastructure | Docker Compose (Node 20 Alpine), PostgreSQL container |

### Architecture Pattern: Monorepo with Separate Frontend & Backend

```
/99 Code/
├── frontend/          (Next.js SPA with App Router)
├── backend/           (Express REST API)
├── docker-compose.yml (dev environment)
└── docker-compose.e2e.yml (E2E test environment)
```

### Backend Layered Architecture

```
HTTP Request
    │
    ▼
Routes          ← Define endpoints, attach middleware
    │
    ▼
Middleware      ← CORS, JSON parsing, Auth (JWT), RBAC, Rate Limiting
    │
    ▼
Controllers     ← Validate request, call services, return response
    │
    ▼
Services        ← Business logic (pricing, bookings, payment, email, etc.)
    │
    ▼
Repositories    ← Data access abstraction
    │
    ▼
Prisma ORM      ← PostgreSQL queries (parameterized, type-safe)
```

### Data Flow

```
Frontend (Next.js)                        Backend (Express)
┌─────────────────────┐                  ┌─────────────────────┐
│ Components (UI)     │                  │ Routes              │
│ API Client          │ ──HTTP/REST──▶   │ Controllers         │
│ Auth Context        │                  │ Services            │
│ Custom Hooks        │ ◀──JSON────────  │ Repositories        │
└─────────────────────┘                  │ Prisma → PostgreSQL │
                                         └─────────────────────┘
```

### State Management

- **Client:** React Context API (`AuthContext` for user state, token in localStorage)
- **Server:** Stateless REST API with JWT-based auth
- **No Redux/Zustand/React Query** — manual fetch management in components

---

## 6. Component Model

### Frontend Structure

```
frontend/
├── app/[locale]/                  ← Locale-first routing (/de/*, /en/*)
│   ├── (landing)/                 ← Landing page
│   ├── booking/                   ← Public booking wizard (4-step flow)
│   │   ├── success/
│   │   └── register/
│   ├── customer/                  ← Customer portal
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   └── booking/
│   │       ├── appointment/
│   │       ├── payment/
│   │       └── confirmation/
│   ├── jockey/                    ← Jockey portal
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── availability/
│   │   ├── profile/
│   │   └── stats/
│   ├── workshop/                  ← Workshop portal
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── orders/[id]/
│   │   ├── calendar/
│   │   ├── team/
│   │   └── stats/
│   ├── admin/                     ← Admin portal
│   │   └── analytics/
│   └── (public)/                  ← terms, privacy, imprint, support
│
├── components/
│   ├── ui/                        ← 22 shadcn/ui primitives
│   ├── booking/                   ← VehicleStep, ServiceStep, PickupStep, ConfirmationStep
│   ├── payment/                   ← StripeCheckout, PaymentForm, PaymentStatus, PaymentSummary
│   ├── customer/                  ← ActiveBookingHeroCard, ExtensionApprovalModal, BookingProgressTimeline
│   ├── workshop/                  ← KanbanBoard, OrderDetailsModal, ExtensionForm
│   ├── jockey/                    ← Job management & handover components
│   ├── auth/                      ← LoginForm, ProtectedRoute, LogoutButton
│   ├── layout/                    ← PortalLayout, Header, Footer
│   ├── landing/                   ← Landing page components
│   ├── upload/                    ← FileUploadZone
│   ├── notifications/             ← Push notification components
│   └── demo/                      ← Demo mode components
│
├── lib/
│   ├── api/                       ← Centralized API client
│   ├── hooks/                     ← useNotifications, useFileUpload, useLanguage
│   ├── auth/                      ← Auth context + token storage
│   ├── contexts/                  ← React contexts
│   ├── validations/               ← Zod schemas
│   ├── types/                     ← TypeScript type definitions
│   └── utils/                     ← Utility functions
│
├── messages/                      ← de.json (65 KB), en.json (60 KB)
└── e2e/                           ← Playwright E2E tests
```

### Backend Structure

```
backend/src/
├── routes/                        ← 16 endpoint groups
│   ├── auth.routes.ts
│   ├── bookings.routes.ts
│   ├── payment.routes.ts
│   ├── workshops.routes.ts
│   ├── jockeys.routes.ts
│   ├── extensions.routes.ts
│   ├── vehicles.routes.ts
│   ├── services.routes.ts
│   ├── upload.routes.ts
│   ├── notifications.routes.ts
│   └── analytics.routes.ts
│
├── controllers/                   ← 16 controller files
├── services/                      ← 19 service files
│   ├── pricing.service.ts         ← Dynamic price calculation
│   ├── bookings.service.ts        ← Booking lifecycle management
│   ├── payment.service.ts         ← Stripe integration
│   ├── email.service.ts           ← Multi-provider email
│   ├── notification.service.ts    ← FCM push notifications
│   ├── analytics.service.ts       ← Revenue/booking metrics
│   ├── upload.service.ts          ← S3 file handling
│   └── gdpr.service.ts            ← Data export, soft-delete
│
├── repositories/                  ← Data access abstraction
├── middleware/                    ← Auth, RBAC, error handler, upload
├── domain/                        ← Booking FSM (state machine)
├── config/                        ← Database, Firebase, logger, upload config
├── types/                         ← TypeScript definitions
├── utils/                         ← JWT, rate limiting, price calculation
├── seeds/                         ← Database seed data
└── tests/                         ← Jest unit & API tests

prisma/
├── schema.prisma                  ← 12 models
└── seed.ts                        ← Seed script
```

### API Endpoints

| Group | Base Path | Key Endpoints |
|-------|-----------|--------------|
| Auth | `/api/auth` | `POST /customer/login`, `POST /jockey/login`, `POST /workshop/login`, `GET /me` |
| Bookings | `/api/bookings` | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `GET /:id/status`, `GET /:id/extensions` |
| Extensions | `/api/bookings` | `POST /:id/extensions/:extId/approve`, `POST /:id/extensions/:extId/decline` |
| Payment | `/api/payment` | `POST /create-intent`, `GET /status/:id`, `POST /webhook`, `POST /refund`, `POST /authorize-extension`, `POST /capture-extension` |
| Vehicles | `/api/vehicles` | `POST /`, `GET /`, `GET /:id`, `PUT /:id` |
| Workshops | `/api/workshops` | `GET /orders`, `GET /orders/:id`, `POST /orders/:bookingId/extensions`, `PUT /orders/:id/status` |
| Jockeys | `/api/jockeys` | `GET /assignments`, `PUT /assignments/:id/status`, `POST /assignments/:id/handover` |
| Pricing | `/api/pricing` | `GET /:brand/:model/:year` |
| Upload | `/api/upload` | `POST /`, `GET /:fileId` |
| Notifications | `/api/notifications` | `POST /register-fcm`, `GET /`, `POST /:id/read` |
| Analytics | `/api/analytics` | `GET /bookings`, `GET /revenue`, `GET /utilization` |

---

## 7. Database Schema

### Core Models (PostgreSQL + Prisma ORM)

```
┌──────────┐     ┌─────────────────┐     ┌──────────┐
│   User   │────▶│ CustomerProfile  │     │ Vehicle  │
│          │────▶│ JockeyProfile    │     │          │
│          │────▶│ WorkshopProfile  │     └────┬─────┘
└────┬─────┘     └─────────────────┘          │
     │                                        │
     │           ┌──────────┐                 │
     └──────────▶│ Booking  │◀────────────────┘
                 │          │
                 └────┬─────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌───────────┐ ┌──────────┐ ┌─────────────────┐
    │ Extension │ │ Jockey   │ │ NotificationLog │
    │           │ │Assignment│ │                 │
    └───────────┘ └──────────┘ └─────────────────┘

Other models: Session, PriceMatrix, TimeSlot
```

### Key Enums

**BookingStatus** (13 states):
`PENDING_PAYMENT` → `CONFIRMED` → `PICKUP_ASSIGNED` → `PICKED_UP` → `AT_WORKSHOP` → `IN_SERVICE` → `READY_FOR_RETURN` → `RETURN_ASSIGNED` → `RETURNED` → `DELIVERED` / `CANCELLED`

**ExtensionStatus:** `PENDING` → `APPROVED` / `DECLINED` / `CANCELLED` → `COMPLETED`

**AssignmentStatus:** `ASSIGNED` → `EN_ROUTE` → `AT_LOCATION` → `IN_PROGRESS` → `COMPLETED`

**UserRole:** `CUSTOMER`, `JOCKEY`, `WORKSHOP`, `ADMIN`

---

## 8. Key Business Workflows

### Booking Flow

```
1. Customer selects vehicle (brand, model, year, mileage)
2. System calculates price from PriceMatrix (brand/model-specific)
3. Customer selects services and pickup date/time
4. Customer enters contact details
5. System shows price guarantee
6. Customer pays via Stripe (PaymentIntent)
7. Webhook confirms payment → booking status: CONFIRMED
8. Notifications sent (FCM + email) to all relevant parties
```

### Jockey Handover Flow

```
1. Jockey assigned to pickup → status: ASSIGNED
2. Jockey en route → status: EN_ROUTE
3. At customer location → status: AT_LOCATION
4. Document vehicle condition (photos) + collect signature
5. Handover notes recorded
6. Vehicle transported to workshop → status: COMPLETED
```

### Service Extension Flow

```
1. Workshop identifies additional work needed
2. Workshop creates Extension with photos/videos + price
3. Customer receives push notification + email
4. Customer views extension details in portal
5a. APPROVE → payment authorized & captured → extension: APPROVED
5b. DECLINE → reason recorded → extension: DECLINED
6. Booking updated, all parties notified
```

---

## 9. Code Quality Analysis

### Scorecard

| Category | Score | Status | Notes |
|----------|-------|--------|-------|
| Code Organization | 9/10 | Excellent | Clean separation of concerns, clear layering |
| TypeScript Usage | 8/10 | Good | Strict mode enabled, Zod validation — but 138 `any` occurrences across 37 backend files |
| Error Handling | 8/10 | Good | Custom `ApiError` class, global middleware, React ErrorBoundary, toast notifications |
| Naming Conventions | 8/10 | Good | Consistent PascalCase components, camelCase functions — minor file casing inconsistencies |
| Dependency Health | 8/10 | Good | Modern stack, all major deps current — dual `bcrypt`/`bcryptjs` redundancy |
| i18n Implementation | 7/10 | Partial | Solid next-intl setup, but hardcoded strings remain in payment/demo components |
| Security Practices | 7/10 | Adequate | Good JWT/RBAC/rate limiting — insecure JWT_SECRET fallback, no Helmet, no CSRF |
| State Management | 7/10 | Adequate | Context API works, but no React Query/SWR (manual fetch + cache) |
| Code Smells | 6/10 | Warning | Large files, duplicated patterns, `as any` casts |
| Linting & Formatting | 5/10 | Warning | Basic ESLint only, no Prettier, no import ordering |

**Overall Grade: B+ (7.3/10)**

### Detailed Findings

#### Strengths

- **Clean Architecture**: Clear routes → controllers → services → repositories layering
- **Booking FSM**: Well-implemented state machine with actor permissions — prevents invalid transitions
- **Zod Validation**: Runtime type safety on all API endpoints with detailed error messages
- **Type Definitions**: Proper interfaces (`JWTPayload`, `ApiResponse<T>`, `PaginatedResponse<T>`)
- **Error Handling Pipeline**: `ApiError` class → global middleware → structured logging (Winston) → user-friendly responses
- **Domain Separation**: Components organized by portal (customer, workshop, jockey) and concern (booking, payment, auth)

#### Issues

**Security:**

| Issue | Location | Severity |
|-------|----------|----------|
| Insecure JWT_SECRET fallback | `backend/src/utils/jwt.ts` | **High** |
| No Helmet security headers | Backend app | Medium |
| No CSRF token validation | Backend middleware | Medium |
| Sensitive data in logs without masking | Payment controllers | Medium |
| No Content Security Policy (CSP) | Frontend/Backend | Low |

**TypeScript `any` Usage (138 occurrences):**

| File | Count | Example |
|------|-------|---------|
| `extensions.controller.ts` | 13 | `(extension as any).booking.customerId` |
| `notifications.controller.ts` | 18 | `(req.user as any)?.id` |
| `upload.middleware.ts` | 4 | `@ts-ignore` + `file: any` |

**Large Files:**

| File | Lines | Recommendation |
|------|-------|---------------|
| `services/email.service.ts` | 942 | Split into TemplateService, ProviderFactory, EmailClient |
| `services/bookings.service.ts` | 857 | Extract extension/jockey/pricing logic |
| `controllers/bookings.controller.ts` | 658 | Split by HTTP method or sub-resource |

**Code Smells:**

- No database transactions for multi-step operations (extension approval: updates Extension + Booking + NotificationLog without atomicity)
- Duplicated `as any` type assertions (13x in extensions controller)
- Duplicated auth checks (`if (!req.user) throw...`) across controllers
- Magic numbers: `extension.totalAmount / 100` (cent-to-euro), `15 * 60` (magic link expiry)
- Multiple `useState` hooks in booking page instead of `useReducer`
- Manual cache management that React Query/SWR would handle

**Missing Tooling:**

- No Prettier configuration
- No import ordering rules
- No cyclomatic complexity checks
- No file size limits
- No error tracking integration (Sentry)
- No OpenAPI/Swagger documentation

---

## 10. Test Coverage Analysis

### Test Framework Summary

| Layer | Framework | Config |
|-------|-----------|--------|
| Backend Unit/API | Jest 29.7 + Supertest 7.2 | `ts-jest`, Node environment |
| Frontend E2E | Playwright 1.58 | Chromium, Firefox, Safari, iPhone 13, iPad |
| Frontend Unit | — | **None** |

### Test File Inventory

| Category | Count | Notes |
|----------|-------|-------|
| Backend unit/service tests | 4 | pricing, demo-payment, auth middleware, booking FSM |
| Backend API integration tests | 5 | auth, bookings, extensions, jockeys, workshops |
| Backend other tests | 3 | bookings integration/unit |
| Frontend E2E tests (active) | 31 | Comprehensive journey, smoke, portal, i18n tests |
| Frontend E2E tests (archived) | 6 | Legacy tests in `_archived/` |
| Frontend component unit tests | **0** | No React Testing Library usage |
| **Total** | **49** | |

### Coverage Metrics

| Metric | Value | Assessment |
|--------|-------|-----------|
| Backend services tested | 5 of 15 (33%) | Significant gaps |
| Estimated overall coverage | ~30–40% | No reports generated |
| Coverage enforcement | None | Jest configured but no thresholds set |

### What's Well-Tested

| Area | Quality | Details |
|------|---------|---------|
| **Pricing Logic** | Excellent | 60+ test cases: mileage intervals, age multipliers, brand/model mapping, fallback strategy, edge cases |
| **Booking FSM** | Excellent | 30+ tests: valid/invalid transitions, actor permissions, complete journeys, cancellation rules |
| **Authentication** | Good | Multi-role login, token validation, inactive user handling, RBAC |
| **E2E Booking Journey** | Comprehensive | Full flow: vehicle → service → date → payment → confirmation |
| **E2E Portal Smoke Tests** | Good | Customer, jockey, workshop dashboards + navigation |
| **E2E Multi-Language** | Tested | German and English flows, locale switching |
| **E2E Extension Approval** | Tested | View, authorize payment, status updates |

### Critical Gaps

| Gap | Risk Level | Impact |
|-----|-----------|--------|
| **Zero React component tests** | High | UI logic untested in isolation |
| **Email service untested** | High | Could fail silently in production |
| **Notification service untested** | High | Push notifications unverified |
| **Payment service** (only demo tested) | High | Real Stripe flow not unit-tested |
| **No DB integration tests** | Medium | All tests mock Prisma — real queries never verified |
| **Analytics service untested** | Medium | Revenue/booking metrics unverified |
| **GDPR service untested** | Medium | Data export/deletion unverified |
| **Upload service untested** | Medium | S3 integration unverified |
| **No coverage enforcement** | Medium | No CI gate to prevent regression |
| **No accessibility tests** | Low | Compliance risk |
| **No performance tests** | Low | Load behavior unknown |

### Test Scripts

**Backend** (`package.json`):

```bash
npm test           # jest --forceExit
npm run test:unit  # jest --testPathPattern='__tests__' --forceExit
npm run test:api   # jest --testPathPattern='tests/api' --forceExit
npm run test:all   # jest --forceExit
npm run test:watch # jest --watch
```

**Frontend** (`package.json`):

```bash
npm run test:e2e           # playwright test
npm run test:e2e:ui        # playwright test --ui
npm run test:e2e:smoke     # portal smoke + auth flows
npm run test:e2e:journey   # master-journey.spec.ts
npm run test:e2e:booking   # ui-booking-flow.spec.ts
npm run test:e2e:mobile    # chromium-mobile project
npm run test:e2e:report    # playwright show-report
```

### Mocking Patterns

- **Prisma**: Fully mocked via `jest.mock('../../config/database')` — no real DB ever tested
- **Firebase**: Mocked with `jest.fn().mockReturnValue(false)`
- **Notifications**: Mocked with `jest.fn().mockResolvedValue(undefined)`
- **Rate Limiter**: Bypassed with `(req, res, next) => next()`
- **Pricing Repository**: Custom `MockPriceMatrixRepository` extending real class (good pattern)
- **E2E Auth**: Global setup generates JWT tokens via `/api/test/token` endpoint

---

## 11. Recommendations

### High Priority (Security & Stability)

| # | Action | Rationale |
|---|--------|-----------|
| 1 | **Remove insecure `JWT_SECRET` fallback** — fail if env var missing | Currently defaults to `'your-secret-key-change-in-production'` |
| 2 | **Add `helmet`** for HTTP security headers | No CSP, HSTS, X-Frame-Options etc. |
| 3 | **Wrap multi-step DB ops in Prisma transactions** | Extension approval updates 3 tables without atomicity |
| 4 | **Add coverage reporting + CI enforcement** (target 80%) | Jest configured but no thresholds or reporting |
| 5 | **Fix `as any` casts** in extensions/notifications controllers | 31+ occurrences bypassing type safety |

### Medium Priority (Code Quality)

| # | Action | Rationale |
|---|--------|-----------|
| 6 | **Add Prettier** + stricter ESLint rules | No formatting tool, basic linting only |
| 7 | **Introduce React Query or SWR** | Manual fetch/cache management in components |
| 8 | **Add React Testing Library** unit tests for critical components | Zero frontend component tests |
| 9 | **Split large service files** (email: 942 lines, bookings: 857 lines) | Single-responsibility principle |
| 10 | **Test untested services** (email, notification, analytics, GDPR, upload, vehicles) | Only 5 of 15 services have tests |
| 11 | **Complete i18n coverage** in payment/demo components | Hardcoded strings remain |
| 12 | **Add database integration tests** | All tests mock Prisma — real queries never verified |

### Low Priority (Polish)

| # | Action | Rationale |
|---|--------|-----------|
| 13 | Standardize file naming (pick kebab-case or PascalCase) | Mixed conventions |
| 14 | Add Sentry or similar error monitoring | No production error tracking |
| 15 | Remove `bcryptjs` redundancy (keep just `bcrypt`) | Both packages installed |
| 16 | Add OpenAPI/Swagger documentation | API docs are markdown-only |
| 17 | Add accessibility (a11y) testing | No compliance verification |
| 18 | Extract duplicated validation logic to reusable middleware | Auth checks repeated across controllers |

---

## Appendix: Environment Variables

### Backend (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 5001) |
| `NODE_ENV` | development / production |
| `DEMO_MODE` | Enable demo endpoints |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | Token expiration |
| `MAGIC_LINK_SECRET` | Magic link signing secret |
| `FRONTEND_URL` | CORS origin |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `EMAIL_PROVIDER` | resend / sendgrid / smtp / console |
| `EMAIL_FROM` | Sender address |
| `RESEND_API_KEY` | Resend provider key |
| `AWS_REGION` | S3 region (default: eu-central-1) |
| `AWS_ACCESS_KEY_ID` | S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| `AWS_S3_BUCKET` | S3 bucket name |
| `FIREBASE_PROJECT_ID` | FCM project |
| `FIREBASE_SERVICE_ACCOUNT` | FCM service account JSON |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests |

---

## Appendix: Documentation Index

| Document | Location |
|----------|----------|
| Main README | `/99 Code/README.md` |
| Quick Start Guide | `/99 Code/QUICK_START_GUIDE.md` |
| Demo Walkthrough | `/99 Code/DEMO_WALKTHROUGH.md` |
| Payment Architecture | `/99 Code/PAYMENT_ARCHITECTURE.md` |
| Implementation Summary | `/99 Code/IMPLEMENTATION_SUMMARY.md` |
| Product Vision | `/01 Requirements/00_Product_Vision.md` |
| User Stories | `/01 Requirements/02_MVP_User_Stories.md` |
| Epics | `/01 Requirements/01_Epics.md` |
| API Documentation | `backend/src/API_DOCUMENTATION.md` |
| Auth Documentation | `backend/src/AUTH_DOCUMENTATION.md` |
| i18n Summary | `frontend/I18N_IMPLEMENTATION_SUMMARY.md` |
| Component Structure | `frontend/COMPONENT-STRUCTURE.md` |
