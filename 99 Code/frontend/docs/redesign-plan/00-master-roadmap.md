# Master Implementation Roadmap -- AutoConcierge Frontend Redesign

**Date:** 2026-02-08
**Author:** roadmap-planner agent
**Input Documents:** 01-file-inventory, 02-design-system-plan, 03-landing-booking-plan, 04-customer-portal-plan, 05-jockey-workshop-plan, ux-improvement-proposals
**Status of 06-test-automation-plan:** Not yet complete (placeholder section included)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Phase Breakdown](#2-phase-breakdown)
3. [Dependency Graph](#3-dependency-graph)
4. [Risk Assessment](#4-risk-assessment)
5. [Scope Summary per Phase](#5-scope-summary-per-phase)
6. [Verification Checklist per Phase](#6-verification-checklist-per-phase)
7. [i18n Completeness Matrix](#7-i18n-completeness-matrix)
8. [Implementation Notes](#8-implementation-notes)

---

## 1. Executive Summary

### What We Are Doing

A comprehensive UX/UI redesign of the AutoConcierge B2C frontend application, covering all four portals (Customer, Jockey, Workshop, Admin), the public landing page, and the booking flow. The redesign introduces a unified design system, mobile-first navigation, modernized component patterns (Kanban boards, progress timelines, bottom navigation), and complete i18n coverage for German and English.

### Why

The current UX audit scored the application at a B- grade. Key pain points include:
- **No mobile navigation** in the customer portal (sidebar hidden on mobile)
- **3+ clicks** to approve an extension (should be 1)
- **Inconsistent design language** -- CTA and workshop colors are identical, buttons vary arbitrarily across portals
- **Broken i18n** -- raw English enums ("INSPECTION") displayed in the German UI, 553-line Lovable adapter instead of native next-intl
- **Table-based workshop dashboard** that is not responsive
- **English-only demo payment form** with exposed technical IDs

### Scope

| Dimension | Count |
|-----------|-------|
| Portals redesigned | 4 (Customer, Jockey, Workshop, Landing/Booking) |
| Languages | 2 (DE, EN) |
| Page components to modify | ~20 |
| Page components to create | 3 (portal layouts) |
| Shared components to modify | ~15 |
| New shared components to create | ~35 |
| i18n namespaces added/modified | ~12 |
| New i18n keys (estimated) | ~300 DE + ~300 EN |
| CSS changes | 1 file (globals.css), ~200 new lines |
| E2E test specs affected | ~20 of 32 active specs |
| shadcn primitives modified | 3 (button, badge, input) |
| Legacy duplicates removable | 7 root-level landing components |

---

## 2. Phase Breakdown

### Phase 0: Design System Foundation

**What:** Update CSS variables, typography scale, animation library, elevation tokens, and shadcn component primitives. Create shared layout components (BottomNav, TopBar, PortalLayout, MobileFrame).

**Source Plan:** `02-design-system-plan.md`

**Key Files:**

| File | Action | Description |
|------|--------|-------------|
| `app/globals.css` | MODIFY | Add ~25 new CSS variables (neutral scale, semantic light variants, elevation tokens, cta-hover, primary-navy). Add 7 new keyframes. Add ~15 new utility classes. Update `--primary`, `--cta`, `--workshop`, `--success` values. Add reduced-motion media query. |
| `components/ui/button.tsx` | MODIFY | Update variant classes (remove `hero`, update `cta` to use amber, add `btn-hover`). Update sizes (default h-10, lg h-12, xl h-14). |
| `components/ui/badge.tsx` | MODIFY | Add `info`, `warning`, `error`, `neutral` variants. Change base shape to `rounded-full`. |
| `components/ui/input.tsx` | MODIFY | Update to h-10, rounded-lg, focus ring 2px primary. |
| `components/layout/MobileFrame.tsx` | CREATE | Phone-frame wrapper for mobile portal views. |
| `components/layout/BottomNav.tsx` | CREATE | Fixed bottom navigation bar (portal-agnostic). |
| `components/layout/TopBar.tsx` | CREATE | Compact mobile header for portal pages. |
| `components/layout/PortalLayout.tsx` | CREATE | Per-portal wrapper combining TopBar + content + BottomNav. |

**Sub-phases:**
- **Phase 0A:** globals.css only (additive, no component changes)
- **Phase 0B:** shadcn primitive updates (button, badge, input)
- **Phase 0C:** Layout components (new files, no existing pages changed)

**Verification:** Existing E2E tests still pass (`npm run test:e2e:smoke`). Color changes are intentional but minor (blue hue shift, CTA orange-to-amber, workshop differentiation).

**Dependencies:** None.

---

### Phase 1: Landing Page + Booking Flow

**What:** Complete landing page redesign (dark hero, glassmorphism navbar, 4-step how-it-works, services showcase, trust/social proof section, CTA banner, modernized footer). Booking flow UX overhaul (brand card grid, inline calendar, pill time slots, restructured summary, 6 services).

**Source Plan:** `03-landing-booking-plan.md`

**Key Files -- Landing Page:**

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/page.tsx` | MODIFY | Replace section imports: remove PortalCards/ValueProps/FAQ, add ServicesShowcase/TrustSocialProof/CTABanner. |
| `components/landing/Header.tsx` | REWRITE | Dark glassmorphism navbar with scroll effect, new nav links, amber CTA. |
| `components/landing/Hero.tsx` | REWRITE | 2-column dark hero with animated shapes, gradient text, car illustration. |
| `components/landing/HowItWorks.tsx` | REWRITE | 4 steps (was 3), gradient icon squares, connecting line, white cards. |
| `components/landing/services-showcase.tsx` | CREATE | Services grid section with 6 service cards. |
| `components/landing/landing-service-card.tsx` | CREATE | Individual service card with hover animation. |
| `components/landing/trust-social-proof.tsx` | CREATE | Stats counters + testimonials + partner logos. |
| `components/landing/animated-counter.tsx` | CREATE | Intersection Observer counter animation. |
| `components/landing/testimonial-card.tsx` | CREATE | Testimonial card with avatar, stars, quote. |
| `components/landing/cta-banner.tsx` | CREATE | Amber gradient CTA strip. |
| `components/landing/hero-illustration.tsx` | CREATE | SVG car illustration with floating badges. |
| `components/landing/Footer.tsx` | MODIFY | Update columns (replace Quick Links with Uber uns), add social icons, i18n all strings. |

**Key Files -- Booking Flow:**

| File | Action | Description |
|------|--------|-------------|
| `components/booking/StepIndicator.tsx` | REWRITE | Gradient circles, gradient lines, mobile compact mode, animations. |
| `components/booking/VehicleStep.tsx` | REWRITE | Brand card grid (replaces dropdown), year dropdown, license plate field. |
| `components/booking/BrandCardGrid.tsx` | CREATE | Grid of selectable brand logo cards. |
| `components/booking/BrandCard.tsx` | CREATE | Single brand card with SVG logo. |
| `components/booking/ServiceStep.tsx` | MODIFY | 6 services (was 4), updated styling, always-visible running total. |
| `components/booking/PickupStep.tsx` | MODIFY | Inline calendar, pill time slots, simplified layout. |
| `components/booking/ConfirmationStep.tsx` | MODIFY | Restructured summary with icon rows, styled total, lock icon on submit. |
| `app/[locale]/booking/page.tsx` | MODIFY | Remove ConciergeBanner, update step labels, add section heading. |
| `messages/de.json` | MODIFY | Add ~80 new keys (header, hero, howItWorks, servicesShowcase, trustSocialProof, ctaBanner, footer, lovableBooking updates). |
| `messages/en.json` | MODIFY | Same key additions with English translations. |

**Verification:** Walkthrough Phase 1-2 screenshots regenerated. Landing page tests (`01-landing-page.spec.ts`) rewritten. Booking flow tests updated for brand card grid selectors.

**Dependencies:** Phase 0 (design system tokens and CSS classes).

---

### Phase 2: Customer Portal

**What:** Mobile-first dashboard with bottom navigation, active booking hero card with 5-step progress timeline, extension alert banner with 1-click approval, booking details with 3 pill-style tabs (Details/Extensions/Activities), redesigned extension approval modal.

**Source Plan:** `04-customer-portal-plan.md`

**Key Files:**

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/customer/layout.tsx` | CREATE | Shared customer layout with header + bottom nav + ProtectedRoute. |
| `app/[locale]/customer/dashboard/page.tsx` | REWRITE | Remove sidebar/headers. Add: welcome section, ExtensionAlertBanner, ActiveBookingHeroCard, QuickStatsRow, past bookings list. ~550 -> ~250 lines. |
| `app/[locale]/customer/bookings/[id]/page.tsx` | REWRITE | 3 pill-style tabs (Details/Erweiterungen/Aktivitaten). Activities tab with timeline. Handle `?modal=review` URL param. ~459 -> ~350 lines. |
| `components/customer/CustomerHeader.tsx` | CREATE | Mobile header: logo, notification bell, user avatar. |
| `components/customer/CustomerBottomNav.tsx` | CREATE | Fixed bottom nav: Home, Buchung, Chat, Profil. |
| `components/customer/BookingProgressTimeline.tsx` | CREATE | 5-step horizontal timeline with connectors and animations. |
| `components/customer/ExtensionAlertBanner.tsx` | CREATE | Full-width amber glow alert banner. |
| `components/customer/ActiveBookingHeroCard.tsx` | CREATE | Hero card with progress timeline and vehicle info. |
| `components/customer/BookingActivityTimeline.tsx` | CREATE | Vertical activity timeline for booking details. |
| `components/customer/QuickStatsRow.tsx` | CREATE | 3-column compact stats row. |
| `components/customer/PastBookingCard.tsx` | CREATE | Compact past booking card. |
| `components/customer/ExtensionApprovalModal.tsx` | REWRITE | Single-view layout, workshop note, inline payment, localized. ~521 -> ~300 lines. |
| `components/customer/ExtensionList.tsx` | MODIFY | Updated card designs (amber glow pending, green approved). |
| `messages/de.json` | MODIFY | Add ~60 new keys under `customerPortal` namespace. |
| `messages/en.json` | MODIFY | Same key additions with English translations. |

**Verification:** Walkthrough Phase 3, 5, 8 screenshots updated. Extension approval tests (`07-extension-approval-flow.spec.ts`, `08-extension-integration.spec.ts`, `12-extension-flow.spec.ts`) updated for new selectors. Customer portal smoke tests updated.

**Dependencies:** Phase 0 (layout components, design tokens, animation classes).

---

### Phase 3: Jockey Portal

**What:** Mobile-first assignment dashboard with dark navy header, availability toggle, today's summary bar, state-differentiated assignment cards with full-width action buttons, assignment detail view with checklist/photos/signature, reusable handover sub-components.

**Source Plan:** `05-jockey-workshop-plan.md` (Part A)

**Key Files:**

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/jockey/layout.tsx` | CREATE | Shared jockey layout with JockeyTopBar + JockeyBottomNav. |
| `app/[locale]/jockey/dashboard/page.tsx` | MODIFY | Remove inline header, stat cards, quick-link buttons. Use new card components, summary bar, status toggle. |
| `components/jockey/JockeyBottomNav.tsx` | CREATE | Mobile bottom nav (Aufgaben, Statistiken, Verfuegbarkeit, Profil). |
| `components/jockey/JockeyTopBar.tsx` | CREATE | Dark navy header with greeting, bell, avatar. |
| `components/jockey/JockeyAssignmentCard.tsx` | CREATE | State-differentiated card with full-width action button. |
| `components/jockey/JockeyAssignmentDetail.tsx` | CREATE | Full detail view with map, checklist, photos, signature. |
| `components/jockey/JockeyStatusToggle.tsx` | CREATE | Availability toggle switch. |
| `components/jockey/JockeySummaryBar.tsx` | CREATE | Compact today summary bar. |
| `components/jockey/HandoverChecklist.tsx` | CREATE | Reusable checklist extracted from HandoverModal. |
| `components/jockey/PhotoDocGrid.tsx` | CREATE | Reusable photo documentation grid. |
| `components/jockey/SignaturePad.tsx` | CREATE | Reusable signature canvas. |
| `components/jockey/HandoverModal.tsx` | MODIFY | Refactor to use new sub-components. |
| `messages/de.json` | MODIFY | Add ~50 new keys under `jockeyDashboard`. |
| `messages/en.json` | MODIFY | Same key additions with English translations. |

**Verification:** Walkthrough Phase 4, 7 screenshots updated. Jockey portal tests (`04-jockey-portal.spec.ts`, `11-jockey-handover-flow.spec.ts`) verified. API-driven status tests (Phase 2, 7 in walkthrough) should pass without selector changes.

**Dependencies:** Phase 0 (design tokens, layout components, animation classes).

---

### Phase 4: Workshop Portal

**What:** Kanban board dashboard (3 columns: Neu/In Bearbeitung/Abgeschlossen) replacing table layout, professional top bar with search, stats bar, full-page order detail view with two-column layout, inline extension form, communication section, horizontal status timeline.

**Source Plan:** `05-jockey-workshop-plan.md` (Part B)

**Key Files:**

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/workshop/layout.tsx` | CREATE | Shared workshop layout with WorkshopTopBar + WorkshopBottomNav. |
| `app/[locale]/workshop/dashboard/page.tsx` | MODIFY | Replace Table with KanbanBoard. Remove inline header. Add WorkshopStatsBar. |
| `components/workshop/WorkshopTopBar.tsx` | CREATE | Professional desktop top bar with search and user menu. |
| `components/workshop/WorkshopBottomNav.tsx` | CREATE | Mobile bottom nav (Auftrage, Kalender, Statistiken, Team). |
| `components/workshop/KanbanBoard.tsx` | CREATE | 3-column Kanban with mobile tab fallback. |
| `components/workshop/KanbanColumn.tsx` | CREATE | Individual Kanban column container. |
| `components/workshop/KanbanOrderCard.tsx` | CREATE | State-differentiated order card. |
| `components/workshop/OrderDetailView.tsx` | CREATE | Full-page two-column order detail. |
| `components/workshop/StatusTimeline.tsx` | CREATE | Horizontal 3-node status timeline. |
| `components/workshop/InlineExtensionForm.tsx` | CREATE | Inline extension form (replaces modal for in-page use). |
| `components/workshop/CommunicationSection.tsx` | CREATE | Notes/messages timeline with input. |
| `components/workshop/WorkshopStatsBar.tsx` | CREATE | 4-metric horizontal stats bar. |
| `components/workshop/OrderDetailsModal.tsx` | MODIFY | Convert to thin wrapper around OrderDetailView. |
| `components/workshop/ExtensionModal.tsx` | MODIFY | Convert to thin wrapper around InlineExtensionForm. |
| `messages/de.json` | MODIFY | Add ~50 new keys under `workshopDashboard`. |
| `messages/en.json` | MODIFY | Same key additions with English translations. |

**Verification:** Walkthrough Phase 6 screenshots updated. Workshop portal tests (`05-workshop-portal.spec.ts`) rewritten for Kanban selectors. Extension creation flow updated (`P5-01`, `P5-02`). Table-row selectors (`tr`) replaced with Kanban card selectors throughout.

**Dependencies:** Phase 0 (design tokens, animation classes, CSS for Kanban).

---

### Phase 5: Test Automation + Final Walkthroughs

**What:** Add `data-testid` attributes to all new components, update all E2E test selectors, regenerate walkthrough screenshots for DE and EN, verify full test suite passes.

**Source Plan:** `06-test-automation-plan.md` (not yet complete -- placeholder)

**Key Activities:**

| Activity | Description |
|----------|-------------|
| Add `data-testid` attributes | Ensure all new components have stable test selectors (see lists in plans 03, 04, 05). |
| Update walkthrough DE spec | `walkthrough-de-unified.spec.ts`: Update selectors for landing (P1-01, P1-02), booking (P1-03 to P1-16), workshop Kanban (P3-02, P4-01), extension flow (P5-01 to P5-11), final state (P8-01, P8-02). |
| Update walkthrough EN spec | `walkthrough-en-unified.spec.ts`: Same selector changes as DE with English text assertions. |
| Update numbered specs | `01-landing-page.spec.ts` (full rewrite), `01-complete-booking-journey.spec.ts` (vehicle step), `02-booking-flow.spec.ts`, `05-workshop-portal.spec.ts` (Kanban), `07-extension-approval-flow.spec.ts`, `08-extension-integration.spec.ts`, `12-extension-flow.spec.ts`. |
| Update named specs | `booking-i18n-tests.spec.ts`, `ui-booking-flow.spec.ts`, `customer-journey.spec.ts`, `qa-booking-flow-audit.spec.ts`, `qa-navigation-audit.spec.ts`, `qa-portal-interactions.spec.ts`. |
| Regenerate all screenshots | Run full walkthrough in DE and EN to produce updated screenshot baselines. |
| Final regression run | Run all 435 E2E tests to verify no regressions. |

**Verification:** All 435+ tests pass. All walkthrough screenshots generated in DE and EN. No selector breakage.

**Dependencies:** Phases 1-4 (all portal changes must be complete before full test update).

---

## 3. Dependency Graph

```
Phase 0: Design System Foundation
   |
   |---> Phase 0A: globals.css (CSS variables, keyframes, utilities)
   |        |
   |        v
   |     Phase 0B: Component updates (button, badge, input)
   |        |
   |        v
   |     Phase 0C: Layout components (MobileFrame, BottomNav, TopBar, PortalLayout)
   |
   +------+------+------+
   |      |      |      |
   v      v      v      v
Phase 1  Phase 2  Phase 3  Phase 4
Landing  Customer Jockey   Workshop
+Booking Portal   Portal   Portal
   |      |      |      |
   +------+------+------+
          |
          v
       Phase 5
   Test Automation
   + Walkthroughs
```

**Key observations:**
- Phases 1-4 are **independent of each other** and can run in parallel after Phase 0 completes.
- Phase 5 depends on **all** of Phases 1-4 for final test updates, but individual phase tests can be updated incrementally.
- Within Phase 0, sub-phases A -> B -> C must run sequentially (each builds on the previous).
- Phase 1 (Landing) has the lowest coupling to other portals -- safest to start first.
- Phase 4 (Workshop) has the highest test breakage risk due to Table -> Kanban migration.

---

## 4. Risk Assessment

### 4.1 Breaking Changes per Phase

| Phase | Risk Level | Breaking Changes |
|-------|-----------|-----------------|
| Phase 0A | **Low** | `--primary`, `--cta`, `--workshop`, `--success` color shifts affect all existing pages. Shifts are intentional and relatively minor. |
| Phase 0B | **Medium** | Button size changes (h-9 -> h-10) affect touch targets globally. Badge `rounded-full` changes appearance everywhere. |
| Phase 0C | **Low** | New files only, no existing pages changed. |
| Phase 1 | **Medium** | Landing page structure completely changes. Hero CTA text changes break P1-02 walkthrough selector. Brand card grid breaks vehicle step selectors in multiple tests. |
| Phase 2 | **Medium** | Customer sidebar removal. Tab system change from shadcn Tabs to custom pills breaks `role="tab"` selectors. Extension modal redesign changes payment flow selectors. |
| Phase 3 | **Low** | Jockey tests primarily use API-driven status changes, not UI selectors. Dashboard layout changes but most tests screenshot-only. |
| Phase 4 | **High** | Table -> Kanban is the single biggest selector breakage. Every test that uses `page.locator('tr', { hasText: bookingNumber })` will break. Affects walkthrough P3-02, P4-01, P5-01, P5-11, P6-01, plus `05-workshop-portal.spec.ts`. |
| Phase 5 | **Low** | Test-only changes, no production code risk. |

### 4.2 i18n Completeness Risks

| Risk | Mitigation |
|------|-----------|
| Missing EN translations for new keys | Both DE and EN keys are specified in each plan document. Implement simultaneously. |
| Existing `useLanguage()` adapter breakage | New components use `useTranslations()` directly. Old components continue using `useLanguage()` until migrated. Both approaches coexist. |
| Inline hardcoded German text (customer/faq, admin/analytics) | Out of scope for this redesign; document as known debt. |
| `portals` and `values` namespaces removed from landing | Keep keys in JSON files (other pages may reference via Lovable adapter). Only remove imports from landing page. |

### 4.3 Test Coverage Gaps

| Gap | Risk | Mitigation |
|-----|------|-----------|
| New components (35+) have no tests yet | Medium | Add `data-testid` attributes during creation. Update E2E specs in Phase 5. |
| Brand card grid is a fundamentally different UX | High | Ensure `data-testid="brand-card-{brandId}"` is added before updating walkthrough selectors. |
| Kanban board has no precedent in test suite | High | Add `data-testid="kanban-card-{bookingNumber}"` and `data-testid="kanban-column-{status}"`. Keep `ExtensionModal` accessible from Kanban cards (not only inline) to minimize test breakage. |
| Activities tab is entirely new | Low | New content, new tests. No existing tests to break. |

### 4.4 Backward Compatibility During Transition

| Concern | Strategy |
|---------|----------|
| `.card-premium` CSS class used by existing pages | Keep as alias alongside new `.card-interactive`. |
| `hero` button variant used in some components | Keep mapping to same styles as `cta` until all references removed. |
| Status badge CSS classes (`.badge-pending`, etc.) | Retain in globals.css alongside new Badge component variants. |
| `OrderDetailsModal` used by walkthrough tests | Keep as thin wrapper around new `OrderDetailView`. |
| `ExtensionModal` opened from workshop dashboard | Keep modal trigger from Kanban card buttons. Inline form is only used in detail view. |
| `HandoverModal` dialog interface | Preserve dialog wrapper. Internal refactoring uses new sub-components. |

### 4.5 Performance Impact of New Animations

| Animation | Impact | Mitigation |
|-----------|--------|-----------|
| Hero floating shapes (`@keyframes float`, 20s) | Low | CSS-only, no JS. GPU-accelerated transforms. |
| Animated counters (Intersection Observer) | Low | One-time count-up, no continuous repaints. |
| `glow-amber` pulsing box-shadow | Medium | `box-shadow` animations can cause repaints. Limit to 1-2 elements per page. |
| `timeline-pulse` on active status nodes | Low | Single small element. |
| Glassmorphism `backdrop-filter: blur(16px)` | Medium | Can be expensive on low-end mobile. Degrade gracefully with `@supports`. |
| `prefers-reduced-motion` | N/A | All animations disabled when user prefers reduced motion. |

---

## 5. Scope Summary per Phase

| Phase | Files Modified | Files Created | New Components | New i18n Keys (DE+EN) | Tests Affected |
|-------|---------------|---------------|----------------|----------------------|----------------|
| **Phase 0** | 4 (globals.css, button.tsx, badge.tsx, input.tsx) | 4 (MobileFrame, BottomNav, TopBar, PortalLayout) | 4 layout components | 0 | ~5 (smoke tests for color regression) |
| **Phase 1** | 8 (page.tsx, Header, Hero, HowItWorks, Footer, ServiceStep, PickupStep, ConfirmationStep, booking/page.tsx) + 2 i18n files | 9 (services-showcase, landing-service-card, trust-social-proof, animated-counter, testimonial-card, cta-banner, hero-illustration, BrandCardGrid, BrandCard) | 9 new components | ~160 (80 DE + 80 EN) | ~10 (landing, booking flow, walkthrough P1) |
| **Phase 2** | 4 (dashboard, bookings/[id], ExtensionList, ExtensionApprovalModal) + 2 i18n files | 8 (layout, CustomerHeader, CustomerBottomNav, BookingProgressTimeline, ExtensionAlertBanner, ActiveBookingHeroCard, BookingActivityTimeline, QuickStatsRow, PastBookingCard) | 9 new components | ~120 (60 DE + 60 EN) | ~10 (customer portal, extension flow, walkthrough P5, P8) |
| **Phase 3** | 3 (dashboard, stats, availability) + 2 i18n files | 10 (layout, JockeyBottomNav, JockeyTopBar, JockeyAssignmentCard, JockeyAssignmentDetail, JockeyStatusToggle, JockeySummaryBar, HandoverChecklist, PhotoDocGrid, SignaturePad) | 10 new components | ~100 (50 DE + 50 EN) | ~4 (jockey portal, handover, walkthrough P2, P7) |
| **Phase 4** | 5 (dashboard, calendar, stats, team, OrderDetailsModal, ExtensionModal) + 2 i18n files | 10 (layout, WorkshopTopBar, WorkshopBottomNav, KanbanBoard, KanbanColumn, KanbanOrderCard, OrderDetailView, StatusTimeline, InlineExtensionForm, CommunicationSection, WorkshopStatsBar) | 11 new components | ~100 (50 DE + 50 EN) | ~8 (workshop portal, walkthrough P3, P4, P5, P6) |
| **Phase 5** | ~20 E2E spec files | 0 | 0 | 0 | All 435+ tests |
| **TOTAL** | ~24 source files + ~20 test files | ~41 new files | ~43 new components | ~480 keys | All 435+ tests |

---

## 6. Verification Checklist per Phase

### Phase 0: Design System Foundation

- [ ] All new CSS variables render correctly in both light and dark mode
- [ ] `--primary`, `--cta`, `--workshop`, `--success` color changes applied consistently
- [ ] Button size increase (h-9 -> h-10) does not break layouts
- [ ] Badge `rounded-full` renders correctly across all portals
- [ ] Input h-10 and focus ring work correctly
- [ ] Layout components render correctly in isolation
- [ ] `prefers-reduced-motion` disables all new animations
- [ ] `npm run test:e2e:smoke` passes
- [ ] No visual regression in existing portals (manual spot check)

### Phase 1: Landing Page + Booking Flow

- [ ] Landing page renders all new sections correctly (Navbar, Hero, HowItWorks, Services, Trust, CTA, Footer)
- [ ] Glassmorphism navbar scroll transition works
- [ ] Animated counters trigger on scroll
- [ ] Brand card grid selects correctly, model dropdown populates
- [ ] 6 services visible in ServiceStep with running total
- [ ] Inline calendar and pill time slots work in PickupStep
- [ ] Confirmation summary shows vehicle, services, appointment, total
- [ ] i18n complete for DE and EN (all new keys present and rendered)
- [ ] Mobile responsive (320px to 1440px)
- [ ] E2E tests updated and passing for landing + booking flow
- [ ] Walkthrough screenshots Phase 1-2 regenerated
- [ ] No regression in customer/jockey/workshop portals

### Phase 2: Customer Portal

- [ ] Customer layout renders header + bottom nav on all customer pages
- [ ] Bottom nav active state highlights correctly per route
- [ ] Dashboard: time-of-day greeting works (morning/afternoon/evening)
- [ ] Extension alert banner appears when pending extensions exist
- [ ] Active booking hero card shows correct progress timeline step
- [ ] Quick stats row displays correct counts
- [ ] Past bookings list shows 3 most recent completed bookings
- [ ] Booking detail: 3 pill tabs render correctly
- [ ] Activities tab shows timeline entries
- [ ] `?modal=review` URL param auto-opens extension approval modal (1-click from dashboard)
- [ ] Extension approval modal: single-view, workshop note, inline payment
- [ ] Demo payment handled inline (no separate English form)
- [ ] Service type displayed as translated name (not raw enum)
- [ ] i18n complete for DE and EN
- [ ] Mobile responsive
- [ ] E2E tests updated and passing
- [ ] Walkthrough screenshots Phase 3, 5, 8 regenerated
- [ ] No regression in landing/jockey/workshop portals

### Phase 3: Jockey Portal

- [ ] Jockey layout renders JockeyTopBar + JockeyBottomNav on all jockey pages
- [ ] Dark navy header with greeting and notification bell
- [ ] Availability toggle updates status
- [ ] Summary bar shows today's assignment count
- [ ] Active assignment card: full-width action button, correct color by type (blue pickup, purple return)
- [ ] Secondary actions (call, navigate) use native deep links
- [ ] Completed assignments in collapsible section
- [ ] Assignment detail view: checklist, photo grid, signature pad work
- [ ] HandoverModal still works with refactored sub-components
- [ ] i18n complete for DE and EN
- [ ] Mobile responsive (primary target: phone)
- [ ] E2E tests updated and passing
- [ ] Walkthrough screenshots Phase 4, 7 regenerated
- [ ] No regression in landing/customer/workshop portals

### Phase 4: Workshop Portal

- [ ] Workshop layout renders WorkshopTopBar + WorkshopBottomNav
- [ ] Kanban board: 3 columns with correct order grouping
- [ ] Mobile: tabs replace horizontal columns
- [ ] KanbanOrderCard: correct styling per column (Neu=blue, In Bearbeitung=amber, Abgeschlossen=green)
- [ ] Action buttons on cards advance status correctly
- [ ] Stats bar shows correct counts
- [ ] Order detail view: two-column layout on desktop, stacked on mobile
- [ ] StatusTimeline: horizontal 3-node display with correct state
- [ ] Inline extension form: add items, calculate total, submit
- [ ] Communication section: display messages, send new notes
- [ ] ExtensionModal still works from Kanban card buttons (backward compat)
- [ ] OrderDetailsModal still works as thin wrapper (backward compat)
- [ ] i18n complete for DE and EN
- [ ] Mobile responsive
- [ ] E2E tests updated and passing
- [ ] Walkthrough screenshots Phase 6 regenerated
- [ ] No regression in landing/customer/jockey portals

### Phase 5: Test Automation + Final Walkthroughs

- [ ] All `data-testid` attributes present on new components
- [ ] All walkthrough selectors updated (DE + EN)
- [ ] All numbered spec selectors updated
- [ ] All named spec selectors updated
- [ ] Full walkthrough DE: 44 tests passing, 52+ screenshots generated
- [ ] Full walkthrough EN: ~44 tests passing, screenshots generated
- [ ] Full regression: `npm run test:e2e:journey` passes
- [ ] Full regression: `npm run test:e2e:smoke` passes
- [ ] Full regression: `npm run test:e2e:auth` passes
- [ ] Full regression: `npm run test:e2e:portals` passes
- [ ] Screenshot baselines committed for both locales

---

## 7. i18n Completeness Matrix

### New Namespaces

| Namespace | Phase | Keys (DE) | Keys (EN) | Used By |
|-----------|-------|-----------|-----------|---------|
| `servicesShowcase` | 1 | ~25 | ~25 | Landing services section |
| `trustSocialProof` | 1 | ~15 | ~15 | Landing trust section |
| `ctaBanner` | 1 | 3 | 3 | Landing CTA banner |
| `customerPortal` | 2 | ~60 | ~60 | Customer layout, dashboard, booking details, extensions, activities |

### Modified Namespaces

| Namespace | Phase | Changes | Used By |
|-----------|-------|---------|---------|
| `header` | 1 | Add: `services`, `reviews`, `booking`, `bookNow`. Update: nav link labels. | Landing navbar |
| `hero` | 1 | Replace: `title`, `titleHighlight`, `subtitle`. Add: `badge`, `ctaPrimary`, `ctaSecondary`, trust items. Remove: `login`, `rating`, `reviews`. | Landing hero |
| `howItWorks` | 1 | Add: `overline`. Replace: 3-step model with 4-step model (`steps.book`, `steps.pickup`, `steps.workshop`, `steps.return`). | Landing how-it-works |
| `footer` | 1 | Add: `tagline`, `aboutUs`, `team`, `partnerWorkshops`, `careers`, `press`, `cookies`. Update: existing labels. | Landing footer |
| `lovableBooking` | 1 | Update step labels (`steps.pickup` -> "Termin", `steps.confirm` -> "Ubersicht"). Add: `licensePlate`, `vatNote`, confirmation keys, 3 new service entries. | Booking flow |
| `jockeyDashboard` | 3 | Add: `greeting`, `statusLabel`, `available`, `busy`, summary keys, assignment keys, detail sub-namespace (~40 keys), `bottomNav`. | Jockey portal |
| `workshopDashboard` | 4 | Add: `kanban` sub-namespace (~10 keys), `stats` additions, `detail` sub-namespace (~30 keys), `bottomNav`. | Workshop portal |

### Keys Deprecated (Not Removed)

| Namespace | Keys | Reason |
|-----------|------|--------|
| `portals` | Entire namespace | PortalCards removed from landing. Keep in JSON for Lovable adapter compatibility. |
| `values` | Entire namespace | ValueProps removed from landing. Keep in JSON for Lovable adapter compatibility. |
| `hero.login` | Single key | Login CTA moved from hero to header. |
| `hero.rating`, `hero.reviews` | 2 keys | Replaced by `trustRating`, `trustCustomers`, etc. |

### Total New Key Count

| Language | Estimated New Keys | Estimated Modified Keys |
|----------|-------------------|------------------------|
| DE | ~240 | ~30 |
| EN | ~240 | ~30 |

---

## 8. Implementation Notes

### 8.1 Coding Conventions

- **i18n:** New components MUST use `useTranslations('namespace')` (next-intl native), NOT `useLanguage()` (Lovable adapter). The adapter is legacy and should not be extended.
- **CSS:** Use the new CSS variables and utility classes from Phase 0. Prefer `bg-neutral-100` over `bg-gray-100`. Use elevation tokens (`var(--elevation-low)`) over raw shadow values.
- **TypeScript:** All new components must have TypeScript interfaces for props. No `any` types.
- **Test IDs:** Every interactive element in new components must have a `data-testid` attribute following the pattern `{component}-{purpose}` (e.g., `data-testid="kanban-card-BK123"`, `data-testid="extension-approve-btn"`).
- **Accessibility:** Maintain ARIA roles where applicable. New pill tabs should still have `role="tab"` and `role="tabpanel"` for screen readers. Bottom nav items should have `aria-label`.
- **Mobile-first:** Write CSS mobile-first, then add `md:` and `lg:` breakpoint overrides.

### 8.2 PR Strategy

**Recommended: One PR per phase.**

| PR | Branch | Contents | Reviewers |
|----|--------|----------|-----------|
| PR #1 | `redesign/phase-0-design-system` | globals.css, button, badge, input, layout components | Frontend lead |
| PR #2 | `redesign/phase-1-landing-booking` | Landing page, booking flow, i18n keys | Frontend lead + UX |
| PR #3 | `redesign/phase-2-customer-portal` | Customer layout, dashboard, booking details, extensions | Frontend lead + UX |
| PR #4 | `redesign/phase-3-jockey-portal` | Jockey layout, dashboard, assignment cards, handover | Frontend lead + UX |
| PR #5 | `redesign/phase-4-workshop-portal` | Workshop layout, Kanban, order detail, extensions | Frontend lead + UX |
| PR #6 | `redesign/phase-5-test-automation` | All E2E test updates, screenshot baselines | QA lead |

**Alternative: Smaller PRs within phases.** If phases are too large, split Phase 1 into "1a: Landing" and "1b: Booking". Split Phase 4 into "4a: Kanban" and "4b: Order Detail".

### 8.3 Review Checklist

For each PR:

- [ ] All modified components render correctly in browser (manual check)
- [ ] Mobile viewport tested (390px, 768px, 1024px, 1440px)
- [ ] i18n: both DE and EN keys present and rendering
- [ ] No hardcoded German or English strings in component files
- [ ] `data-testid` attributes present on all interactive elements
- [ ] No console errors or warnings
- [ ] Dark mode: verify new colors render correctly in `.dark` context
- [ ] TypeScript: no new `any` types, all props typed
- [ ] Accessibility: keyboard navigation works, screen reader labels present
- [ ] Performance: no unnecessary re-renders (React DevTools profiler)
- [ ] E2E tests pass for the affected portal(s)
- [ ] No regression in other portals

### 8.4 Cleanup Opportunities

During the redesign, the following cleanup can be performed:

| Item | Phase | Action |
|------|-------|--------|
| 7 legacy root-level component duplicates (`Header.tsx`, `Hero.tsx`, etc.) | Phase 1 | Delete after verifying no imports remain. |
| `components/landing/hero-section-portals.tsx` (unused) | Phase 1 | Delete. |
| `components/landing/hero-section-ab.tsx` (unused) | Phase 1 | Delete. |
| `button.tsx` `hero` variant | Phase 0B | Remove (merge into `cta`). |
| Inline navigation code in dashboard pages | Phases 2-4 | Remove as layout components absorb navigation. |
| `DemoPaymentForm` English text | Phase 2 | Localize or replace with inline payment handling. |

---

*End of Master Implementation Roadmap*
