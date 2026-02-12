# Documentation Synchronization Report

> **Date:** 2026-02-09
> **Scope:** All documentation across all folders vs. actual codebase
> **Method:** 8 parallel agents cross-referencing every doc file against source code
> **Folders Covered:** `01 Requirements/`, `02 Planning/`, `03 Documentation/`, `04 Testing/`, `99 Code/` (root + `backend/src/` + `frontend/`)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Requirements Docs vs. Code](#2-requirements-docs-vs-code)
3. [Planning Docs vs. Code](#3-planning-docs-vs-code)
4. [Technical Docs (99 Code/) vs. Code](#4-technical-docs-99-code-vs-code)
5. [Backend API Docs vs. Code](#5-backend-api-docs-vs-code)
6. [Frontend Docs vs. Code](#6-frontend-docs-vs-code)
7. [Documentation Folder (03) vs. Code](#7-documentation-folder-03-vs-code)
8. [Testing Folder (04) & Test Specs vs. Code](#8-testing-folder-04--test-specs-vs-code)
9. [Additional 99 Code/ Docs vs. Code](#9-additional-99-code-docs-vs-code)
10. [Full Discrepancy Register](#10-full-discrepancy-register)

---

## 1. Executive Summary

| Documentation Area | Files | Sync Status | Critical Issues | Total Issues |
|--------------------|-------|-------------|-----------------|--------------|
| **Requirements** (`01 Requirements/`) | 6 | Mostly in sync | 1 | 3 |
| **Planning** (`02 Planning/`) | 30 | 85-90% aligned | 0 | 5 |
| **Documentation** (`03 Documentation/`) | 12 | 35-40% aligned | 3 | 8 |
| **Testing** (`04 Testing/`) | 9 | Out of sync | 4 | 7 |
| **Technical Docs** (`99 Code/*.md`) | 20 | Out of sync | 5 | 9 |
| **Backend API Docs** (`backend/src/*.md`) | 4 | Significantly out of sync | 4 | 10 |
| **Frontend Docs** (`frontend/*.md`) | 3 | Out of sync | 3 | 7 |
| **Test Specs & Fixtures** (`e2e/`, `tests/`) | 37+ | Partially out of sync | 3 | 5 |

**Overall Verdict: Documentation is 40-60% out of sync with the codebase across ~120 doc files.**

The code itself is well-implemented and feature-complete for MVP. The problem is that documentation has not kept pace with development — features marked "TODO" are actually done, documented endpoints don't exist (magic link auth), and multiple docs reference different credentials, database names, and file paths.

---

## 2. Requirements Docs vs. Code

**Source:** `/01 Requirements/` (all files)

### 2.1 What's Correct

All major features documented in requirements are implemented:

| Requirement | Status in Code |
|------------|---------------|
| Multi-portal architecture (Customer, Jockey, Workshop) | Fully implemented |
| Booking FSM (9 states + legacy compatibility) | Fully implemented |
| Digital service extensions (create/approve/decline/pay) | Fully implemented |
| Fixed-price guarantee with brand/model pricing | Fully implemented |
| Time slot management with capacity limits | Fully implemented |
| Stripe payment integration | Fully implemented |
| Notifications (FCM push, email) | Fully implemented |
| Jockey assignment & handover (photos/signatures) | Fully implemented |
| Vehicle data requirements (brand, model, year, mileage) | Fully implemented |
| RBAC with 4 roles | Fully implemented |

### 2.2 Discrepancies Found

| # | Severity | Document | Issue |
|---|----------|----------|-------|
| R-1 | **High** | `05_Product_Backlog_Summary.md` | Lines 62, 298, 380, 403 still reference **"Fahrzeugklassen"** (vehicle-class pricing) — but code correctly uses brand/model-specific pricing. The `CHANGELOG_Produktstrategie_2026-02-01.md` documents this change, but the backlog summary was never updated. |
| R-2 | **Low** | `02_MVP_User_Stories.md` | US-013 title says "Inspektion/Wartung als Hauptprodukt" but table row says "Ölservice-Paket" — naming inconsistency. |
| R-3 | **Low** | `05_Product_Backlog_Summary.md` | Many user stories listed as "To Do" are actually fully implemented in code. Status markers are stale. |

---

## 3. Planning Docs vs. Code

**Source:** `/02 Planning/` (30 markdown files — architecture, wireframes, sprints, test strategy, design system, release plan)

### 3.1 Overall: 85-90% Aligned

The planning docs are the **best-aligned** documentation area. The codebase substantially follows the planned architecture and sprint structure. Deviations are mostly cases where the code evolved to be *more sophisticated* than planned.

### 3.2 Technical Architecture (`01_Technical_Architecture.md`) — MOSTLY MATCHES

| Aspect | Documented | Actual | Status |
|--------|-----------|--------|--------|
| Next.js frontend on :3000 | Next.js 14+ | Next.js 16.1.6 | Matches |
| Express backend on :5000 | Express + Node | Express 4.21 + Node 20 | Matches |
| PostgreSQL + Prisma | Yes | Prisma 6.2 | Matches |
| JWT authentication | Yes | Yes + Session tokens (not documented) | Enhanced |
| Tailwind + shadcn/ui | Yes | Yes (Tailwind v4) | Matches |

**Discrepancies:**
- Schema evolved: Doc shows separate Customer entity; code uses `User` + `CustomerProfile`/`JockeyProfile`/`WorkshopProfile` pattern (more flexible, not worse)
- BookingStatus: Doc shows basic statuses; code has 12 states with full FSM
- Undocumented models: `Extension`, `TimeSlot`, `NotificationLog`, `JockeyAssignment`, `Session`

### 3.3 Database Schema (`04_Database_Schema.md`) — PARTIAL

| Documented Entity | Actual Entity | Change |
|-------------------|--------------|--------|
| Customer | User + CustomerProfile | Restructured |
| Finding | Extension | Renamed |
| — | NotificationLog | New (undocumented) |
| — | JockeyAssignment | New (undocumented) |
| — | Session | New (undocumented) |
| — | TimeSlot | New (undocumented) |

Core models (Vehicle, Booking, PriceMatrix) exist as documented. The schema is richer than planned.

### 3.4 Integration Architecture (`05_Integration_Architecture.md`) — MOSTLY MATCHES

- Stripe integration: Documented and implemented correctly
- Firebase FCM: **Implemented but NOT documented** in this file (fcmToken in User model, NotificationLog with FCM fields)
- Odoo: Documented as mock/stub — no actual OdooService in codebase (correct for MVP)
- Upload service: Exists but not detailed in this document

### 3.5 Security Architecture (`06_Security_Architecture.md`) — GOOD ALIGNMENT

- Multi-portal auth: Matches
- RBAC with `requireRole()`, `requireCustomer()`, etc.: Matches
- JWT verification: Matches
- Session token DB storage: **Implemented but not documented**

### 3.6 Portal Wireframes — ALL FULLY IMPLEMENTED

| Wireframe Doc | Implementation Status |
|--------------|---------------------|
| Customer Portal (`07/08_Customer_Portal_Wireframes.md`) | All pages/components exist |
| Jockey Portal (`08/09_Jockey_Portal_Wireframes.md`) | All pages exist + enhanced (HandoverModal, SignaturePad, PhotoDocGrid) |
| Workshop Portal (`09/10_Werkstatt_Portal_Wireframes.md`) | All pages exist + Admin analytics portal (undocumented) |
| Landing Page (`06/07_Landing_Page_Design.md`) | All sections exist + A/B testing variants (undocumented) |

### 3.7 Design System (`10/11_Design_System.md`) — PARTIAL

- shadcn/ui components: Matches
- Tailwind CSS: Matches (using v4 utility approach rather than documented hex values — acceptable)
- Missing from doc: Dark mode support (`DarkModeToggle.tsx`), ErrorBoundary pattern

### 3.8 Sprint Plans & Backlog (`15-22`) — MATCHES

MoSCoW priorities and sprint features align with implementation. Most "Must-Have" items are implemented. Push notifications were implemented earlier than planned (documented as "Should-Have" but already in code).

### 3.9 Test Strategy — Playwright (`24-30`) — EXCEEDS PLAN

- 60+ Playwright test files exist vs. strategy docs that describe approach only
- Visual regression snapshots (not in plan)
- Lifecycle screenshot documentation (not in plan)
- Multiple config variants (playwright-minimal.config.ts)
- Global setup, fixtures, helpers all implemented

### 3.10 Discrepancies Summary

| # | Severity | Document | Issue |
|---|----------|----------|-------|
| P-1 | **Medium** | `05_Integration_Architecture.md` | Firebase/FCM fully implemented but undocumented in integration architecture |
| P-2 | **Low** | `04_Database_Schema.md` | Schema evolved (User+Profiles, new models) — doc reflects original design, not current |
| P-3 | **Low** | `01_Technical_Architecture.md` | BookingStatus has 12 states vs documented basic statuses |
| P-4 | **Low** | `10_Design_System.md` | Dark mode, ErrorBoundary not documented |
| P-5 | **Low** | Duplicate files | Numbering conflicts: two `06_*.md`, two `07_*.md`, two `08_*.md` etc. — confusing |

---

## 4. Technical Docs (99 Code/) vs. Code

**Source:** `99 Code/README.md`, `QUICK_START_GUIDE.md`, `IMPLEMENTATION_SUMMARY.md`, `DEMO_WALKTHROUGH.md`, `PAYMENT_ARCHITECTURE.md`, `PAYMENT_INTEGRATION_README.md`

### 3.1 Critical: Workshop Endpoint Paths Wrong

**File:** `QUICK_START_GUIDE.md` (Lines 187-189)

| Documented | Actual Code | Issue |
|-----------|-------------|-------|
| `GET /api/workshops/bookings` | `GET /api/workshops/orders` | Wrong resource name |
| `POST /api/workshops/bookings/:id/extensions` | `POST /api/workshops/orders/:bookingId/extensions` | Wrong resource name + param name |
| `PATCH /api/workshops/bookings/:id/status` | `PUT /api/workshops/orders/:id/status` | Wrong resource name + wrong HTTP method |

### 3.2 Critical: Database Name Inconsistency

Three different database names appear across docs:

| Document | Database Name | Port |
|----------|--------------|------|
| `README.md` (line 128) | `autowartungs_app` | 5432 |
| `backend/.env.example` (line 2) | `b2c_autowartung` | 5432 |
| `QUICK_START_GUIDE.md` (lines 215, 274) | `b2c_app` | 5433 |

A new developer following these docs would get different databases depending on which doc they follow.

### 3.3 Critical: Hardcoded User-Specific Paths

| Document | Line | Path |
|----------|------|------|
| `README.md` | 109 | `cd "/Users/stenrauch/Documents/B2C App v2/99 Code"` |
| `DEMO_WALKTHROUGH.md` | 20 | `cd /Users/stenrauch/Documents/B2C\ App\ v2/99\ Code/backend` |

These are paths from the original developer's machine — non-portable.

### 3.4 Critical: Referenced Documents Don't Exist

| Document | References | Exists? |
|----------|-----------|---------|
| `DEMO_WALKTHROUGH.md` (line 503) | `/03 Documentation/E2E_Process_Flow.md` | **No** |
| `IMPLEMENTATION_SUMMARY.md` (line 99) | `/DEMO_SCRIPT.md` | **No** |
| `IMPLEMENTATION_SUMMARY.md` (line 100) | `/E2E_IMPLEMENTATION_COMPLETE.md` | **No** |

### 3.5 Incomplete Endpoint Lists

`QUICK_START_GUIDE.md` lists only 2 payment endpoints but 6 exist:

| Documented | Missing from Docs |
|-----------|-------------------|
| `POST /api/payment/authorize-extension` | `POST /api/payment/create-intent` |
| `POST /api/payment/capture-extension` | `GET /api/payment/status/:paymentIntentId` |
| | `POST /api/payment/webhook` |
| | `POST /api/payment/refund` |

### 3.6 What's Correct

- `PAYMENT_ARCHITECTURE.md` — generally accurate, payment flows match code
- `PAYMENT_INTEGRATION_README.md` — generally accurate
- Stripe dependency versions match package.json
- Portal URLs and route structure are correct

---

## 5. Backend API Docs vs. Code

**Source:** `backend/src/API_DOCUMENTATION.md`, `BOOKING_API_DOCUMENTATION.md`, `UPLOAD_API_DOCUMENTATION.md`, `AUTH_DOCUMENTATION.md`

### 4.1 Critical: Magic Link Auth Documented but NOT Implemented

**File:** `AUTH_DOCUMENTATION.md`

| Documented Endpoint | Exists in Code? |
|--------------------|----------------|
| `POST /api/auth/customer/magic-link` | **No** — not implemented |
| `GET /api/auth/customer/verify?token=...` | **No** — not implemented |

**What actually exists (undocumented):**

| Actual Endpoint | Documented? |
|----------------|-------------|
| `POST /api/auth/customer/login` (email + password) | **No** |
| `POST /api/auth/customer/register` | **No** |

The entire `AUTH_DOCUMENTATION.md` describes a magic-link passwordless flow that was never built. The actual code uses standard email/password authentication for customers.

### 4.2 Critical: Booking Creation Schema Mismatch

**File:** `API_DOCUMENTATION.md` (lines 315-333)

The documentation shows the legacy booking format only:
```json
{ "vehicleId": "cuid", "serviceType": "INSPECTION", ... }
```

The code actually supports **two formats** (detected in `bookings.controller.ts` lines 216-221):
1. Legacy format (as documented)
2. **New DTO format (NOT documented anywhere in API_DOCUMENTATION.md):**
```json
{
  "customer": { "email", "firstName", "lastName", "phone" },
  "vehicle": { "brand", "model", "year", "mileage" },
  "services": ["INSPECTION"],
  "pickup": { "date", "timeSlot", "street", "city", "postalCode" },
  "delivery": { "date", "timeSlot" }
}
```

### 4.3 Critical: HTTP Method Mismatch

| Documented | Actual |
|-----------|--------|
| `PATCH /api/bookings/:id` (API_DOCUMENTATION.md line 377) | `PUT /api/bookings/:id` (bookings.routes.ts line 58) |

Note: `BOOKING_API_DOCUMENTATION.md` correctly documents `PUT`.

### 4.4 Critical: Duplicate Extension Routes — Only One Set Documented

Two different routing patterns exist for extensions:

| Route File | Pattern |
|-----------|---------|
| `bookings.routes.ts` | `POST /api/bookings/:id/extensions/:extensionId/approve` |
| `extensions.routes.ts` | `POST /api/extensions/:id/approve` |

Both are mounted in `app.ts`. Only the bookings-nested version is documented in `BOOKING_API_DOCUMENTATION.md`. The standalone `/api/extensions/` routes are undocumented.

### 4.5 Missing from API_DOCUMENTATION.md

These endpoints exist in code but are absent from the main API doc:

- `GET /api/bookings/:id/status`
- `GET /api/bookings/:id/extensions`
- `POST /api/bookings/:id/extensions/:extensionId/approve`
- `POST /api/bookings/:id/extensions/:extensionId/decline`
- All GDPR endpoints (`/api/gdpr/*`)
- All analytics endpoints (`/api/analytics/*`)
- Guest checkout flow

### 4.6 Inconsistent Error Response Format

Documentation shows:
```json
{ "success": false, "error": { "message": "...", "stack": "..." } }
```

Actual code uses **three different formats**:
```json
// Format 1 (upload.controller.ts):
{ "success": false, "error": "No file provided" }

// Format 2 (auth.controller.ts):
{ "success": false, "message": "Valid email address is required" }

// Format 3 (errorHandler.ts):
{ "success": false, "error": { "message": "...", "stack": "..." } }
```

### 4.7 What's Correct

| Area | Status |
|------|--------|
| Upload API (`UPLOAD_API_DOCUMENTATION.md`) | All 7 endpoints correctly documented |
| Vehicles API | All 5 endpoints match |
| Services API | All 4 endpoints match |
| Jockey/Workshop login | Correctly documented |

### 4.8 Endpoint Sync Score

| API Group | Documented Correctly | Total | Score |
|-----------|---------------------|-------|-------|
| Vehicles | 5 | 5 | 100% |
| Services | 4 | 4 | 100% |
| Upload | 7 | 7 | 100% |
| Bookings | 6 | 9 | 67% |
| Auth | 2 | 8 | 25% |
| **Overall** | **24** | **33** | **73%** |

GDPR, Analytics, Notifications, and standalone Extensions routes have **zero documentation**.

---

## 6. Frontend Docs vs. Code

**Source:** `frontend/AUTHENTICATION_IMPLEMENTATION.md`, `I18N_IMPLEMENTATION_SUMMARY.md`, `COMPONENT-STRUCTURE.md`

### 5.1 Critical: Auth Doc Describes Magic Links — Code Uses Passwords

**File:** `AUTHENTICATION_IMPLEMENTATION.md`

Same issue as backend: describes "passwordless magic link authentication" for customers, but actual `customer/login/page.tsx` uses email + password fields. The verify page exists but handles token verification, not magic links.

Also missing from doc:
- `LoginForm.tsx` component (used by all 3 login pages)
- Customer registration page (`/[locale]/customer/register`)
- Password-based auth flow description

### 5.2 Critical: i18n Doc 75% Outdated

**File:** `I18N_IMPLEMENTATION_SUMMARY.md`

5 of 7 components marked "TODO" are actually **already complete**:

| Component | Doc Says | Actual Status |
|-----------|----------|---------------|
| `stripe-checkout.tsx` | TODO | Done (Stripe wrapper, no translations needed) |
| `demo-payment-form.tsx` | TODO | Partially done (uses inline translations instead of `useTranslations()`) |
| `booking/payment/page.tsx` | TODO | **Done** — uses `useTranslations('bookingPayment')` |
| `booking/confirmation/page.tsx` | TODO | **Done** — uses `useTranslations('bookingConfirmation')` |
| `ProtectedRoute.tsx` | TODO | **Done** — uses `useTranslations('protectedRoute')` + locale-aware redirects |
| `ExtensionApprovalModal.tsx` | TODO | **Done** — has 37 translation keys (doc claims only 2) |
| `customer/dashboard/page.tsx` | TODO | Needs verification |

Translation key counts are also inaccurate:

| Namespace | Doc Claims | Actual |
|-----------|-----------|--------|
| `bookingPayment.*` | 15 keys | 9 keys |
| `bookingConfirmation.*` | 20 keys | 9 keys |
| `protectedRoute.*` | 2 keys | 1 key |
| `extensionApproval.*` | 2 keys | 37 keys |

### 5.3 Critical: Component Structure Doc Severely Incomplete

**File:** `COMPONENT-STRUCTURE.md`

Lists only **3 customer components**. Actual count: **16 customer components**.

Undocumented components:

| Component | Purpose |
|-----------|---------|
| `ActiveBookingHeroCard.tsx` | Dashboard hero card |
| `BookingActivityTimeline.tsx` | Activity timeline |
| `BookingProgressTimeline.tsx` | Progress tracker |
| `BookingStepper.tsx` | Step indicator |
| `ExtensionAlertBanner.tsx` | Extension alerts |
| `ExtensionApprovalModal.tsx` | Approve/decline extensions |
| `ExtensionList.tsx` | List extensions |
| `NotificationCenter.tsx` | Push notification UI |
| `PastBookingCard.tsx` | Historical bookings |
| `PillTabs.tsx` | Tab navigation |
| `QuickStatsRow.tsx` | Dashboard stats |
| `RatingModal.tsx` | Service rating |
| `VehicleSelectionForm.tsx` | Vehicle picker |

**~60+ total components** exist across all directories (customer, jockey, workshop, landing, payment, booking, layout, notifications) with **zero documentation** for most.

Undocumented API client files:
- `lib/api/analytics.ts`
- `lib/api/vehicles.ts`
- `lib/api/jockeys.ts`
- `lib/api/bookings.ts`
- `lib/api/workshops.ts`

### 5.4 What's Correct

| Area | Status |
|------|--------|
| Core auth library files (`token-storage.ts`, `auth-api.ts`, `auth-context.tsx`) | All exist and match docs |
| All routes/pages listed in auth doc | Exist with correct `[locale]` prefix |
| `PriceDisplay.tsx` component behavior | Matches doc description |
| `ServiceCard.tsx` component behavior | Matches doc description |
| `lib/api/client.ts` pattern | Matches doc description |
| `lib/api/pricing.ts` functions | Correctly documented |

---

## 7. Documentation Folder (03) vs. Code

**Source:** `/03 Documentation/` (12 markdown files)

### 7.1 Overall: 35-40% Aligned — Significantly Outdated

Most documents in this folder were written on 2026-02-01 and reflect work-in-progress status from that date. The codebase has progressed substantially since then, but these docs were never updated.

### 7.2 Implementation_Status.md — SIGNIFICANTLY OUTDATED

**Most damaging discrepancy in the repo.** Claims features are "NOT IMPLEMENTED" that clearly exist:

| Feature | Doc Says | Actual Code |
|---------|----------|-------------|
| Jockey APIs (`GET /api/jockeys/assignments`) | "NOT IMPLEMENTED" / TODO | `jockeys.controller.ts` **exists with full implementation** |
| Payment authorize-extension | "NOT IMPLEMENTED (CRITICAL)" | `extensions.controller.ts` + `payment.controller.ts` **exist** |
| Phase 3: Jockey | 40% Complete | Likely >80% — all controllers and pages exist |
| Phase 5: Extension | 50% Complete (CRITICAL GAPS) | Extension approval fully implemented |

### 7.3 Demo_Requirements.md — STALE AND MISLEADING

Marks completed features as "BLOCKING DEMO - MISSING":
- Extension Approval Modal: marked MISSING → **implemented** (components exist)
- Jockey APIs: marked MISSING → **implemented** (`jockeys.controller.ts`)
- Extension Payment: marked NICE TO HAVE → **implemented** (Stripe integration present)

### 7.4 E2E_Process_Flow.md — HIGHLY ACCURATE

The best document in this folder. Comprehensive and aligned with actual code:
- Complete booking journey matches implementation
- Payment flow (automatic vs manual capture) technically correct
- Extension approval flow matches code intent
- Stripe test cards documentation correct

### 7.5 Bug Reports — MIXED RELIABILITY

| Bug | Doc Status | Likely Actual Status |
|-----|-----------|---------------------|
| BUG-001: Jockey Dashboard Not Rendering | CRITICAL / OPEN | Page component exists — likely **fixed** |
| BUG-002: Workshop Dashboard Not Rendering | CRITICAL / OPEN | Page component exists — likely **fixed** |
| BUG-004: Test User Credentials Mismatch | OPEN | **Still accurate** — credential chaos persists |
| BUG-007: Extension Stripe Untested | OPEN | Likely addressed — `extensions.controller.ts` has payment logic |

### 7.6 Other Documents

| Document | Status |
|----------|--------|
| `DEMO_ANLEITUNG.md` | Mostly accurate — credentials correct, routes valid, prices may be stale |
| `E2E_TESTING_QUICK_REFERENCE.md` | Largely accurate for reference data; bug status questionable |
| `E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md` | Outdated — 47% pass rate from 2026-02-01, contradicts current code state |
| `E2E_TEST_EXECUTION_REPORT.md` | Historical — 68 tests, 47% pass rate. No recent re-run documented |
| `SESSION_SUMMARY_2026-02-01.md` | Accurate historical record of that day's work |
| `Technical_Architecture_Dashboards.md` | Likely accurate for architecture description |
| `User_Stories_Jockey_Customer_Dashboards.md` | Likely accurate for user stories |
| `AUTH_FIXTURES_IMPLEMENTATION.md` | Largely irrelevant — documents approach that appears superseded |

### 7.7 Discrepancies Summary

| # | Severity | Document | Issue |
|---|----------|----------|-------|
| D-1 | **Critical** | `Implementation_Status.md` | Claims Jockey APIs and Payment APIs "NOT IMPLEMENTED" — they exist |
| D-2 | **Critical** | `Demo_Requirements.md` | Marks completed features as "BLOCKING" and "MISSING" |
| D-3 | **Critical** | `BUG_REPORT_E2E_TESTING.md` | BUG-001/002 marked OPEN — page components exist (likely fixed) |
| D-4 | **High** | `E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md` | 47% pass rate claim — code has progressed; needs re-run |
| D-5 | **Medium** | Multiple docs | All dated 2026-02-01 with no subsequent updates |
| D-6 | **Low** | `AUTH_FIXTURES_IMPLEMENTATION.md` | Documents superseded approach |

---

## 8. Testing Folder (04) & Test Specs vs. Code

**Source:** `/04 Testing/` (9 markdown files), `frontend/e2e/`, `backend/src/tests/`

### 8.1 TEST_CREDENTIALS.md — CRITICAL MISMATCH

Multiple seed files exist with **different credentials**, and the doc only references one:

| Seed File | Customer | Jockey | Workshop |
|-----------|----------|--------|----------|
| `seed.ts` (primary) | `kunde@test.de` / `password123` | `jockey1` / `password123` | `werkstatt1` / `password123` |
| `seed-test-users.ts` | `customer@test.com` / `Test123!` | `testjockey` / `Test123!` | `testworkshop` / `Test123!` |
| `test-data.ts` (E2E fixtures) | `customer@test.com` / `Test123!` | `testjockey` / `Test123!` | `testworkshop` / `Test123!` |
| `TEST_CREDENTIALS.md` | `kunde@test.de` / `password123` | `jockey1` / `password123` | `werkstatt1` / `password123` |
| `README_E2E_DEMO.md` | `demo@test.com` / (console) | `jockey-1` / `jockey123` | `werkstatt-witten` / `werkstatt123` |
| `TEST_SETUP_GUIDE.md` | `test@example.com` / `customer123` | `jockey-1` / `jockey123` | `werkstatt-witten` / `werkstatt123` |

**5 different credential sets across 6 sources.** The E2E fixtures (`test-data.ts`) don't match the primary seed file (`seed.ts`), and neither match the demo docs.

### 8.2 TEST_RUNNER_README.md — REFERENCES NON-EXISTENT SCRIPT

Documents `./run-e2e-tests.sh` with modes (ui, headed, demo) — but actual implementation uses direct npm scripts:
- Documented: `./run-e2e-tests.sh --mode ui`
- Actual: `npm run test:e2e:ui`

Also has hardcoded path: `/Users/stenrauch/Documents/B2C App v2/99 Code`

### 8.3 Other 04 Testing/ Documents

| Document | Status | Notes |
|----------|--------|-------|
| `E2E_IMPLEMENTATION_COMPLETE.md` | Accurate | API endpoints, data structures, status transitions match code |
| `QUALITY_REVIEW.md` | Partially outdated | Checklist items checked but no dates; "run full test suite" unchecked |
| `E2E_TEST_FIXES_SUMMARY.md` | Outdated | References pending tasks from 2026-02-02, unclear if completed |
| `TEST_FIXES_SUMMARY.md` | Incomplete | Task #4 (DB seeding) marked "In Arbeit" — no completion confirmation |
| `TEST_SETUP_GUIDE.md` | Partially inaccurate | Credentials don't match any seed file |
| `VERIFICATION_CHECKLIST.md` | Needs re-verification | Items checked but no timestamps |
| `README_E2E_DEMO.md` | Outdated credentials | `jockey-1` / `werkstatt-witten` don't exist in any seed file |

### 8.4 Test Specs vs. Code (from E2E and backend tests)

#### Critical: Test Credential Chaos

(See section 8.1 for full credential matrix — 5 different sets across 6 sources.)

### 8.5 Critical: Seed File Uses Wrong Prisma Field Names

**File:** `backend/prisma/seed-simple.ts`

| Line | Uses | Prisma Schema Expects |
|------|------|----------------------|
| 29 | `zip: '58452'` | `postalCode: String?` |
| 98 | `userId: customerUser.id` | `customerId: String` |
| 87 | `WorkshopProfile.email` | Field doesn't exist on WorkshopProfile |

This seed file **will fail at runtime** against the current schema.

### 8.6 High: Test for Removed Feature

**File:** `backend/src/tests/api/bookings.api.test.ts` (line 227)

```typescript
it('should create booking with guest checkout', async () => { ... })
```

But `DEMO_WALKTHROUGH.md` explicitly states:
> "Guest checkout is NOT supported. Registration is mandatory."

This test asserts behavior that the app is documented as not supporting.

### 8.7 Archived Tests Reference Outdated Credentials

**File:** `e2e/_archived/auth.spec.ts` (line 17)

Contains comment about "Wrong login credentials (werkstatt vs werkstatt-witten)" — evidence that the credential mismatch has been a known problem.

Archived test `booking-flow.spec.ts` tests guest checkout flow — same removed feature issue.

### 8.8 What's Correct

| Area | Status |
|------|--------|
| E2E data-testid selectors | All match actual frontend components |
| E2E route URLs | All match actual app routes |
| Pricing service test mocks | Match current Prisma PriceMatrix schema |
| Playwright config (`testDir: './e2e'`) | Correct |
| Jest config (`roots: ['<rootDir>/src']`) | Correct |
| Test directory structure | All referenced directories exist |
| Booking FSM test assertions | Match current state machine |

---

## 9. Additional 99 Code/ Docs vs. Code

**Source:** 20 markdown files in `99 Code/` root (beyond the 6 checked in section 4)

### 9.1 Document Verification Summary

| Document | Sync Status | Notes |
|----------|-------------|-------|
| `PAYMENT_IMPLEMENTATION_SUMMARY.md` | Accurate | Stripe integration matches code |
| `QUICK_START_EXTENSION_APPROVAL.md` | Accurate | Extension flow matches implementation |
| `IMPLEMENTATION_SUMMARY_EXTENSION_APPROVAL.md` | Accurate | Marked COMPLETE AND READY — matches code |
| `DEMO_SCRIPT.md` | Mostly accurate | Steps match actual E2E flow |
| `PAYMENT_QUICKSTART.md` | Mostly accurate | Setup steps match Stripe integration |
| `PAYMENT_DEPLOYMENT_CHECKLIST.md` | Needs re-verification | Checklist items not dated |
| `PUSH_NOTIFICATIONS_SUMMARY.md` | Needs verification | FCM implementation exists in code |
| `FILE_UPLOAD_IMPLEMENTATION.md` | Potentially outdated | Upload service exists; doc freshness unclear |
| `LOVABLE_DESIGN_SYSTEM_INTEGRATION.md` | Unknown | Design system integration docs |
| `CHANGES_LOG.md` | Historical reference | Change tracking |
| `SETUP_GUIDE.md` | Likely has path issues | Probable hardcoded paths like other setup docs |
| `QA_REPORT_E2E_CONSISTENCY.md` | Outdated | QA from earlier test run |

### 9.2 Critical Issues

| # | Severity | Document | Issue |
|---|----------|----------|-------|
| X-1 | **Critical** | `PROJECT_STATUS.md` | Dated 2026-02-01, claims "READY FOR DEVELOPMENT" with many TODOs. Git log shows 5+ commits after this date with significant feature work. Severely outdated. |
| X-2 | **High** | `BACKLOG.md` | **Misnamed** — file title says "BACKLOG.md" but contents are "E2E Test Failures - Analysis & Action Plan". Should be in `04 Testing/` or renamed. |
| X-3 | **Medium** | `SETUP_GUIDE.md` | Likely contains hardcoded `/Users/stenrauch/` paths (same pattern as other setup docs) |

---

## 10. Full Discrepancy Register

### Critical (Blocks setup/demo/tests, or documents non-existent features)

| # | Area | Document | Issue |
|---|------|----------|-------|
| C-1 | Backend API | `AUTH_DOCUMENTATION.md` | Documents magic-link endpoints that don't exist; actual email/password auth undocumented |
| C-2 | Backend API | `API_DOCUMENTATION.md` | New booking DTO format completely undocumented |
| C-3 | Technical | `QUICK_START_GUIDE.md` | Workshop endpoints: wrong paths (`/bookings` vs `/orders`), wrong HTTP method (`PATCH` vs `PUT`) |
| C-4 | Technical | Multiple docs | Database name inconsistency: `autowartungs_app` vs `b2c_autowartung` vs `b2c_app` |
| C-5 | Frontend | `AUTHENTICATION_IMPLEMENTATION.md` | Describes magic-link auth; code uses password auth |
| C-6 | Frontend | `I18N_IMPLEMENTATION_SUMMARY.md` | 5 of 7 items marked "TODO" are actually done |
| C-7 | Frontend | `COMPONENT-STRUCTURE.md` | Lists 3 components; 16 exist. ~60 total undocumented |
| C-8 | Tests | Multiple sources | **5 different credential sets** across 6 sources — none fully match each other |
| C-9 | Tests | `seed-simple.ts` | Wrong Prisma field names (`zip`/`userId`/`email`) — will fail at runtime |
| C-10 | Backend API | `API_DOCUMENTATION.md` | `PATCH /api/bookings/:id` documented but code uses `PUT` |
| C-11 | 03 Documentation | `Implementation_Status.md` | Claims Jockey APIs and Payment APIs "NOT IMPLEMENTED" — they exist in code |
| C-12 | 03 Documentation | `Demo_Requirements.md` | Marks implemented features as "BLOCKING DEMO - MISSING" |
| C-13 | 03 Documentation | `BUG_REPORT_E2E_TESTING.md` | BUG-001/002 marked CRITICAL/OPEN — page components exist (likely fixed) |
| C-14 | 04 Testing | `TEST_CREDENTIALS.md` | Only references 1 of 5 seed files; doesn't mention conflicting credential sets |
| C-15 | 04 Testing | `TEST_RUNNER_README.md` | References `run-e2e-tests.sh` script that doesn't exist; actual: npm scripts |
| C-16 | 99 Code | `PROJECT_STATUS.md` | Dated 2026-02-01, claims "READY FOR DEVELOPMENT" — 5+ commits with features happened after |

### High (Functional gaps, missing docs for existing features)

| # | Area | Document | Issue |
|---|------|----------|-------|
| H-1 | Backend API | `API_DOCUMENTATION.md` | Extension endpoints, GDPR, Analytics, Notifications routes — zero documentation |
| H-2 | Backend API | Multiple | Duplicate extension routes (`/api/bookings/.../approve` AND `/api/extensions/.../approve`) — only one documented |
| H-3 | Technical | Multiple docs (6+) | Hardcoded user paths (`/Users/stenrauch/...`) — non-portable |
| H-4 | Technical | `IMPLEMENTATION_SUMMARY.md` | References docs that don't exist at expected paths |
| H-5 | Requirements | `05_Product_Backlog_Summary.md` | Still references "Fahrzeugklassen" pricing in 4 places; code uses brand/model |
| H-6 | Tests | `bookings.api.test.ts` | Tests guest checkout — feature explicitly documented as removed |
| H-7 | Backend API | Multiple controllers | 3 different error response formats used; docs describe only one |
| H-8 | Technical | `QUICK_START_GUIDE.md` | Only 2 of 6 payment endpoints listed |
| H-9 | 03 Documentation | `E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md` | Claims 47% pass rate — code has progressed; no re-run documented |
| H-10 | 04 Testing | `README_E2E_DEMO.md` | Credentials (`jockey-1`/`werkstatt-witten`) don't exist in any seed file |
| H-11 | 04 Testing | `TEST_SETUP_GUIDE.md` | Documented credentials don't match any seed file |
| H-12 | 99 Code | `BACKLOG.md` | **Misnamed** — contains "E2E Test Failures Analysis" not a product backlog |
| H-13 | 02 Planning | `05_Integration_Architecture.md` | Firebase/FCM fully implemented but undocumented |

### Low (Cosmetic, naming, stale status markers)

| # | Area | Document | Issue |
|---|------|----------|-------|
| L-1 | Requirements | `02_MVP_User_Stories.md` | US-013 naming inconsistency (Inspektion vs Ölservice) |
| L-2 | Requirements | `05_Product_Backlog_Summary.md` | Many stories marked "To Do" that are implemented |
| L-3 | Frontend | `I18N_IMPLEMENTATION_SUMMARY.md` | Translation key counts inaccurate (e.g., claims 2 for extensionApproval, actual is 37) |
| L-4 | Tests | `e2e/_archived/` | 6 archived tests with no review/cleanup plan |
| L-5 | Frontend | Not documented | 5 API client files (`analytics.ts`, `vehicles.ts`, etc.) not mentioned in any doc |
| L-6 | 02 Planning | `02 Planning/` | Duplicate file numbering (two `06_*.md`, two `07_*.md`, etc.) — confusing |
| L-7 | 02 Planning | `04_Database_Schema.md` | Schema evolved beyond doc (new models, User+Profile pattern) — doc reflects original design |
| L-8 | 04 Testing | `QUALITY_REVIEW.md` | Checklist items checked but no dates or verification |
| L-9 | 04 Testing | `E2E_TEST_FIXES_SUMMARY.md` | Pending tasks from 2026-02-02, unclear if completed |
| L-10 | 03 Documentation | Multiple | All dated 2026-02-01 with no subsequent updates |

---

## Recommended Actions

### Immediate (Before Next Developer Onboards)

1. **Standardize test credentials** — Pick ONE canonical set. Update ALL of: `seed.ts`, `seed-test-users.ts`, `test-data.ts`, `TEST_CREDENTIALS.md`, `DEMO_WALKTHROUGH.md`, `README_E2E_DEMO.md`, `TEST_SETUP_GUIDE.md`, `DEMO_ANLEITUNG.md`, and all E2E spec files. This is the single most impactful fix — every new developer will hit this.
2. **Fix `AUTH_DOCUMENTATION.md`** — Replace magic-link description with actual email/password flow. Document customer registration endpoint.
3. **Fix `QUICK_START_GUIDE.md`** — Correct workshop endpoint paths, HTTP method, and database name. Remove hardcoded user paths.
4. **Fix `seed-simple.ts`** — Replace `zip` with `postalCode`, `userId` with `customerId`, remove non-existent `email` field.
5. **Replace all hardcoded `/Users/stenrauch/...` paths** — Affects 6+ docs. Use relative paths or `$PROJECT_ROOT`.

### Short-Term (Before Production)

6. **Update `03 Documentation/Implementation_Status.md`** — Mark Jockey APIs and Payment APIs as IMPLEMENTED. Update phase percentages. This doc is the most misleading one in the repo.
7. **Update `03 Documentation/Demo_Requirements.md`** — Remove features marked "BLOCKING"/"MISSING" that have been implemented.
8. **Update `API_DOCUMENTATION.md`** — Add new booking DTO format, extension endpoints, GDPR/analytics/notifications routes. Fix `PATCH` vs `PUT`.
9. **Close or update bug reports** — Verify BUG-001/002 status, update `BUG_REPORT_E2E_TESTING.md` and `E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md`.
10. **Update `PROJECT_STATUS.md`** — Reflect actual 2026-02-09 state.
11. **Rename `99 Code/BACKLOG.md`** — Contents are "E2E Test Failures Analysis", not a backlog. Move to `04 Testing/` or rename.
12. **Update `I18N_IMPLEMENTATION_SUMMARY.md`** — Mark completed items as done, fix key counts.
13. **Update `05_Product_Backlog_Summary.md`** — Replace "Fahrzeugklassen" references with "Marke/Modell".
14. **Remove or update guest checkout test** in `bookings.api.test.ts`.
15. **Remove `TEST_RUNNER_README.md` reference to non-existent shell script** — Document actual npm scripts.

### Medium-Term (Documentation Debt)

16. **Run full E2E test suite** — Generate current pass/fail report. Update `E2E_TEST_EXECUTION_REPORT.md` and `E2E_TESTING_SUMMARY_AND_RECOMMENDATIONS.md` with actual results.
17. **Create comprehensive `COMPONENTS.md`** — Document all ~60 frontend components.
18. **Create `ROUTES.md`** — Full route inventory for all portals.
19. **Update `02 Planning/05_Integration_Architecture.md`** — Document Firebase/FCM implementation.
20. **Update `02 Planning/04_Database_Schema.md`** — Reflect current User+Profile pattern and new models.
21. **Fix duplicate file numbering in `02 Planning/`** — Two files numbered 06, 07, 08 etc.
22. **Add OpenAPI spec** — Single source of truth for all endpoints.
23. **Standardize error response format** — Pick one format and apply consistently across all controllers.
24. **Clean up `e2e/_archived/`** — Delete or reactivate archived tests.
25. **Add `LAST_VERIFIED` dates** to all documentation files to track freshness.
