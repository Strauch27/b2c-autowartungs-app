# Prio 1 Demo Flow Documentation
## Master Plan & Implementation Guides

**Version:** 1.0
**Date:** February 3, 2026
**Tech Lead:** Agent 1

---

## Overview

This directory contains the complete implementation plan for **Prio 1: Demo Flow with New Booking Status**. The goal is to implement granular status tracking for the complete booking journey from creation through service completion and delivery.

---

## Document Index

### 1. Master Implementation Plan
**File:** [`prio1-demo-plan.md`](./prio1-demo-plan.md)

**Purpose:** Complete architectural plan for implementing new booking status FSM

**Contents:**
- Complete FSM (Finite State Machine) definition
- Status migration strategy
- API endpoint changes
- Sequence diagram for complete demo journey
- Parallel work distribution (Agents 2-5)
- Acceptance criteria
- Risk assessment & mitigation

**Audience:** All agents, Product Owner, QA Team

**Read this first:** Yes - this is the master document

---

### 2. Demo Payment System
**File:** [`demo-payments.md`](./demo-payments.md)

**Purpose:** Documentation for the fake payment provider used in demo mode

**Contents:**
- How demo payment service works
- API endpoints: create, confirm, authorize, capture
- Extension payment flow (PENDING → APPROVED → AUTHORIZED → CAPTURED)
- Usage examples
- Testing strategies
- Production migration guide

**Audience:** All agents, QA Team

**When to read:** Before working on payment-related features

---

### 3. Migration Strategy
**File:** [`migration-strategy.md`](./migration-strategy.md)

**Purpose:** Safe database migration from old to new booking status enum

**Contents:**
- Prisma schema changes
- Database migration scripts (SQL)
- Rollback procedures
- Backwards compatibility strategy
- Testing checklist
- Production deployment timeline

**Audience:** Agent 2 (Backend FSM), DevOps, Database Admin

**When to read:** Before starting database migration work

**Risk Level:** HIGH (database schema change)

---

### 4. Registration Enforcement
**File:** [`registration-enforcement.md`](./registration-enforcement.md)

**Purpose:** Enforce user registration before booking (remove guest checkout)

**Contents:**
- Current state analysis (guest checkout exists)
- Implementation strategy
- Frontend changes (registration page, redirect logic)
- Backend changes (remove guest account creation)
- User experience flow
- Testing strategies

**Audience:** Agent 2 (Backend), Agent 5 (Frontend)

**When to read:** Before implementing authentication enforcement

---

## Quick Start Guide

### For Agent 2: Backend FSM Implementation

**Your tasks:**
1. Read: [`prio1-demo-plan.md`](./prio1-demo-plan.md) - Section "FSM Architecture"
2. Read: [`migration-strategy.md`](./migration-strategy.md) - Complete
3. Read: [`registration-enforcement.md`](./registration-enforcement.md) - Section "Backend Changes"
4. Implement FSM validator (`backend/src/types/fsm.types.ts`)
5. Create database migration
6. Update `bookings.service.ts` with FSM validation
7. Remove guest checkout logic

**Deliverables:**
- FSM transition validator
- Database migration scripts
- Updated booking service with authentication enforcement
- Unit tests

---

### For Agent 3: Jockey API Updates

**Your tasks:**
1. Read: [`prio1-demo-plan.md`](./prio1-demo-plan.md) - Section "API Endpoint Changes"
2. Implement new endpoint: `PATCH /api/jockeys/assignments/:id/arrive-workshop`
3. Update endpoint: `PATCH /api/jockeys/assignments/:id/complete`
4. Update status transitions: `PICKUP_ASSIGNED → PICKED_UP` (not `AT_WORKSHOP`)

**Deliverables:**
- New arrive-at-workshop endpoint
- Updated complete pickup/return logic
- API tests

---

### For Agent 4: Workshop API Updates

**Your tasks:**
1. Read: [`prio1-demo-plan.md`](./prio1-demo-plan.md) - Section "API Endpoint Changes"
2. Read: [`demo-payments.md`](./demo-payments.md) - Section "Extension Payment Flow"
3. Implement new endpoint: `PATCH /api/workshops/orders/:id/start-service`
4. Update endpoint: `POST /api/workshops/orders/:id/extensions` (validate `IN_SERVICE`)
5. Update endpoint: `PATCH /api/workshops/orders/:id/complete` (capture Extension payments)

**Deliverables:**
- Start service endpoint
- Extension validation logic
- Auto-capture Extension payments on service completion
- API tests

---

### For Agent 5: Frontend Status Display

**Your tasks:**
1. Read: [`prio1-demo-plan.md`](./prio1-demo-plan.md) - Section "FSM Architecture"
2. Read: [`registration-enforcement.md`](./registration-enforcement.md) - Section "Frontend Changes"
3. Update booking types enum
4. Create registration page
5. Add authentication redirect in booking flow
6. Update status badge colors/icons
7. Create status timeline component
8. Add German/English translations

**Deliverables:**
- Registration page (`/auth/register`)
- Login page (`/auth/login`)
- Authentication redirect logic
- Updated status badges
- Status timeline component
- E2E tests

---

## Key Concepts

### Finite State Machine (FSM)

The new booking system uses a strict FSM to control status transitions:

```
PENDING_PAYMENT → CONFIRMED → PICKUP_ASSIGNED → PICKED_UP →
AT_WORKSHOP → IN_SERVICE → READY_FOR_RETURN → RETURN_ASSIGNED →
RETURNED → DELIVERED
```

**Rules:**
- Cannot skip status (enforced by FSM validator)
- Extensions can only be created when `IN_SERVICE`
- Each transition has a specific trigger and actor

**Example:**
```typescript
// Valid transition
canTransition('CONFIRMED', 'PICKUP_ASSIGNED') // ✅ true

// Invalid transition (skipping status)
canTransition('CONFIRMED', 'PICKED_UP') // ❌ false
```

---

### Extension Payment Flow

Extensions use **manual capture** (authorize first, charge later):

```
1. Workshop creates Extension → PENDING
2. Customer approves → APPROVED (payment AUTHORIZED)
3. Workshop completes work → payment CAPTURED
```

**Why manual capture?**
- Customer protection: only charged after work is done
- Workshop flexibility: can adjust amount if needed
- Cancellation option: can cancel if work cannot be done

**Demo Mode:**
All payments use `DemoPaymentService` (in-memory, no Stripe API calls).

---

### Registration Enforcement

**Current state:** Guest checkout is supported (creates account with temp password)

**Target state:** Registration required before booking

**Implementation:**
1. Frontend: Redirect to registration if not authenticated
2. Backend: Reject unauthenticated booking creation (401 Unauthorized)
3. Remove guest account creation logic

---

## Demo Flow Timeline

| Step | Status | Action | Duration |
|------|--------|--------|----------|
| 1 | → `CONFIRMED` | Customer books + pays | 2-3 min |
| 2 | → `PICKUP_ASSIGNED` | System auto-creates assignment | Instant |
| 3 | → `PICKED_UP` | Jockey completes pickup | 30 sec |
| 4 | → `AT_WORKSHOP` | Jockey arrives at workshop | 30 sec |
| 5 | → `IN_SERVICE` | Workshop starts service | 30 sec |
| 6 | (no change) | Workshop creates extension | 1 min |
| 7 | (no change) | Customer approves extension | 1 min |
| 8 | → `READY_FOR_RETURN` | Workshop completes + captures | 30 sec |
| 9 | → `RETURN_ASSIGNED` | System auto-creates assignment | Instant |
| 10 | → `RETURNED` | Jockey completes return | 30 sec |
| 11 | → `DELIVERED` | Customer confirms delivery | 30 sec |

**Total:** ~7-8 minutes (if rehearsed)

---

## Critical Files to Modify

### Backend

| File | Agent | Changes | Risk |
|------|-------|---------|------|
| `prisma/schema.prisma` | Agent 2 | Update `BookingStatus` enum | HIGH |
| `src/types/fsm.types.ts` | Agent 2 | NEW FILE - FSM logic | LOW |
| `src/services/bookings.service.ts` | Agent 2, 4 | Add FSM validation, remove guest checkout | HIGH |
| `src/controllers/jockeys.controller.ts` | Agent 3 | Update status transitions | MEDIUM |
| `src/controllers/workshops.controller.ts` | Agent 4 | Add start-service, auto-capture | MEDIUM |
| `src/controllers/auth.controller.ts` | Agent 2 | Add registration endpoint | LOW |

### Frontend

| File | Agent | Changes | Risk |
|------|-------|---------|------|
| `lib/types/booking.ts` | Agent 5 | Update `BookingStatus` enum | LOW |
| `app/[locale]/auth/register/page.tsx` | Agent 5 | NEW FILE - Registration | LOW |
| `app/[locale]/auth/login/page.tsx` | Agent 5 | NEW FILE - Login | LOW |
| `app/[locale]/booking/page.tsx` | Agent 5 | Add auth redirect | MEDIUM |
| `components/customer/BookingCard.tsx` | Agent 5 | Update status badges | LOW |
| `components/customer/BookingStatusTimeline.tsx` | Agent 5 | NEW FILE - Timeline | LOW |

---

## Merge Order

To minimize conflicts:

1. **Agent 2** merges first (FSM + migration)
2. **Agent 3** + **Agent 4** merge in parallel (independent)
3. **Agent 5** merges last (depends on backend changes)

---

## Testing Strategy

### Unit Tests (Agent 2)
- FSM transition validation
- Extension creation rules
- Status mapping logic

### Integration Tests (Agents 3 & 4)
- Complete booking flow with new status
- Extension payment flow (authorize → capture)
- Jockey pickup/return flow
- Workshop service flow

### E2E Tests (Agent 5)
- Registration enforcement
- Complete demo walkthrough
- Status display validation
- Extension approval flow

### Manual Testing (QA Team)
- Full demo flow (<10 minutes)
- All status transitions logged
- No console errors
- All notifications sent

---

## Acceptance Criteria

✅ **Demo Must Work E2E:**
- [ ] Complete booking flow (authenticated)
- [ ] Jockey pickup flow (two steps: `PICKED_UP` → `AT_WORKSHOP`)
- [ ] Workshop service flow (start service → `IN_SERVICE`)
- [ ] Extension creation (only when `IN_SERVICE`)
- [ ] Extension approval with demo payment
- [ ] Auto-capture on service completion
- [ ] Jockey return flow (two steps: `RETURNED` → `DELIVERED`)
- [ ] FSM validation (cannot skip status)
- [ ] Registration required (no guest checkout)

---

## Risk Assessment

### High Risk Items

1. **Database Migration Failure** - Mitigation: Full backup + rollback script
2. **Conflicting Changes to `bookings.service.ts`** - Mitigation: Agent 2 merges first
3. **Extension Payment Capture Fails** - Mitigation: Retry logic + manual invoice fallback

### Medium Risk Items

1. **Backwards Compatibility Break** - Mitigation: Keep old enum values for 2 weeks
2. **Demo Mode Flag Not Set** - Mitigation: Add banner + logging

---

## Rollout Timeline

### Week 1: Development
- Mon-Wed: Implementation (parallel work)
- Thu: Code review + staging deployment
- Fri: E2E testing + bug fixes

### Week 2: Production
- Mon: Deploy FSM + migration
- Tue: Deploy backend code
- Wed: Deploy frontend code
- Thu-Fri: Monitor and validate

### Week 3-4: Compatibility Window
- Support both old and new status
- Monitor for issues
- Notify API consumers

### Week 5: Cleanup
- Remove old enum values
- Drop backup tables
- Final validation

---

## Questions & Support

### Agent-to-Agent Communication
- Use Slack channel: `#prio1-demo-flow`
- Tag `@agent-1` for architectural questions
- Tag `@agent-2` for backend/database questions
- Tag `@agent-5` for frontend questions

### Blocker Escalation
1. Post in Slack with `@channel`
2. Tag Tech Lead (`@agent-1`)
3. If critical, call emergency meeting

### Documentation Feedback
- Create PR to update docs
- Tag Tech Lead for review

---

## Related Documentation

- **Backend Docs:** `/backend/docs/` - Payment API, Security, GDPR
- **Frontend Docs:** `/frontend/docs/` - Component library, i18n
- **E2E Tests:** `/frontend/e2e/` - Playwright test specs
- **Process Flow:** `/03 Documentation/E2E_Process_Flow.md` - Complete journey

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-03 | Agent 1 | Initial master plan created |

---

## Document Control

**Status:** READY FOR IMPLEMENTATION
**Approval Required:** Product Owner, Tech Lead
**Next Review:** 2026-02-10

---

**Questions? Ask Agent 1 (Tech Lead)**

**Let's build this! 🚀**

---

**END OF DOCUMENT**
