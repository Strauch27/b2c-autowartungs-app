# Customer Portal Redesign -- Implementation Plan

**Date:** 2026-02-08
**Based on:** File Inventory (`01-file-inventory.md`), UX Proposals (Sections 4 & 7), Customer Portal Mockup (`02-customer-portal-mockup.html`), current source code review, walkthrough E2E specs (Phases 3, 5, 8)

---

## Table of Contents

1. [Mobile-First Architecture](#1-mobile-first-architecture)
2. [Dashboard Redesign](#2-dashboard-redesign)
3. [Booking Details Redesign](#3-booking-details-redesign)
4. [Extension Approval Flow](#4-extension-approval-flow)
5. [New Components to Create](#5-new-components-to-create)
6. [File Change Matrix](#6-file-change-matrix)
7. [i18n Key Changes](#7-i18n-key-changes)
8. [E2E Test Impact](#8-e2e-test-impact)

---

## 1. Mobile-First Architecture

### Current State

- **Navigation:** Desktop sidebar nav is embedded inline within `customer/dashboard/page.tsx` (lines 190-253). It uses a `<aside className="hidden ... lg:block">` pattern, making it completely invisible on mobile.
- **Mobile header:** A simple top bar with logo, LanguageSwitcher, NotificationCenter, and Logout button (lines 258-272). No mobile navigation links -- users cannot navigate between sections on mobile.
- **Layout:** There is **no** `app/[locale]/customer/layout.tsx`. Each customer page is standalone. Navigation exists only on the dashboard page.
- **Booking detail page** (`bookings/[id]/page.tsx`) has its own back button but no portal navigation at all.

### Target State (from mockup)

The mockup defines a phone-frame mobile-first layout with:
- **Sticky top header bar:** Logo (AutoConcierge gradient icon + text), notification bell with unread badge (2), user avatar initials.
- **Fixed bottom navigation bar:** 4 items: Home, Buchung, Chat, Profil. Active state uses blue-500 color.
- **Content area:** Scrollable between top header and bottom nav, with 72px bottom padding.
- **No sidebar:** The desktop sidebar is eliminated; the bottom nav handles all navigation even on desktop (or a top horizontal nav replaces it on desktop).

### Implementation Plan

#### 1.1 Create Customer Portal Layout (`app/[locale]/customer/layout.tsx`)

Create a new shared layout file that wraps all customer pages:

```
app/[locale]/customer/layout.tsx
```

**Responsibilities:**
- Wrap children with `<ProtectedRoute requiredRole="customer">`
- Render the **mobile header bar** (logo, notification bell, user avatar)
- Render the **bottom navigation bar** (fixed, all screens)
- Provide `pb-[72px]` padding for content to clear the bottom nav
- On desktop (lg+), optionally switch bottom nav to a horizontal top nav or keep bottom nav for consistency

**Structure:**
```tsx
<ProtectedRoute requiredRole="customer">
  <div className="min-h-screen bg-background">
    {/* Mobile Header */}
    <CustomerHeader />

    {/* Scrollable content */}
    <main className="pb-[72px] lg:pb-[72px]">
      {children}
    </main>

    {/* Fixed Bottom Nav */}
    <CustomerBottomNav />
  </div>
</ProtectedRoute>
```

#### 1.2 Bottom Navigation Items

| Item | Icon | Label DE | Label EN | Route | data-testid |
|------|------|----------|----------|-------|-------------|
| Home | `Home` (lucide) | Home | Home | `/[locale]/customer/dashboard` | `bnav-home` |
| Buchung | `ClipboardList` | Buchung | Booking | `/[locale]/customer/bookings` | `bnav-booking` |
| Chat | `MessageCircle` | Chat | Chat | `/[locale]/customer/notifications` (interim) | `bnav-chat` |
| Profil | `User` | Profil | Profile | `/[locale]/customer/profile` | `bnav-profile` |

Active state: `text-blue-500 font-semibold` on icon + label. Inactive: `text-gray-400`.

#### 1.3 Responsive Strategy

The mockup uses a phone-frame (390px) with a bottom nav. The actual app should be responsive:

- **Mobile (<768px):** Bottom nav visible, no sidebar. Header is compact.
- **Tablet (768-1023px):** Bottom nav visible, wider content area.
- **Desktop (1024px+):** Either keep bottom nav (consistent with mockup), OR replace with a horizontal top nav bar under the header. Bottom nav is simpler and consistent across breakpoints, so recommended to keep it universally.

#### 1.4 Remove Inline Navigation from Dashboard

The current dashboard page has ~65 lines of sidebar code (lines 190-253) and separate mobile/desktop headers. All of this moves into the layout:
- Remove `<aside>` sidebar (lines 190-253)
- Remove mobile header (lines 258-272)
- Remove desktop header (lines 274-278)
- Remove the `<div className="flex min-h-screen bg-background">` wrapper
- The dashboard page becomes just the content area

---

## 2. Dashboard Redesign

### Current State (`customer/dashboard/page.tsx`, 550 lines)

- Welcome message: "Willkommen zuruck, {name || 'Kunde'}" with static subtitle
- 3 stat cards: Active Bookings, Saved Vehicles, Last Booking (not clickable)
- "Meine Buchungen" section with status filter tabs, search, sort
- Full booking list with progress bars + status badges + pending extension alerts
- "Neuen Service buchen" CTA card at bottom
- Uses `useLanguage()` (Lovable adapter)

### Target State (from mockup)

#### 2.1 Welcome Section with Time-of-Day Greeting

**Current:** Static "Willkommen zuruck, {name}" + "Hier ist eine Ubersicht Ihrer Buchungen."
**Target:** Dynamic greeting: "Willkommen zuruck, Stefan!" + time-based subtitle:
- Before 12:00: "Guten Morgen! Hier ist Ihre aktuelle Ubersicht."
- 12:00-18:00: "Guten Tag! Hier ist Ihre aktuelle Ubersicht."
- After 18:00: "Guten Abend! Hier ist Ihre aktuelle Ubersicht."

**Fallback name:** Use "Willkommen zuruck!" instead of "Willkommen zuruck, Kunde" when no first name available.

**Selector:** `data-testid="welcome-section"`, `data-testid="greeting-text"`

#### 2.2 Extension Alert Banner

**Current:** Per-booking amber alert inline in each booking card (lines 470-483).
**Target:** A single, prominent full-width banner at the top of the dashboard (above the hero booking card), matching the mockup's `glow-amber` animated card.

**Design from mockup:**
- Amber gradient background (`from-amber-50 to-orange-50`), amber border, rounded-2xl
- Left: AlertTriangle icon in amber circle (w-10 h-10)
- Center: "1 Erweiterung wartet auf Genehmigung" (bold) + "Bremsbelage vorne -- 280,50 EUR" (secondary)
- Bottom: "Jetzt prufen" button (full-width, amber-500 bg)
- `glow-amber` CSS animation (subtle pulsing box-shadow)
- Click navigates to booking detail with Extensions tab open AND auto-opens the review modal

**Data-testid:** `extension-alert-banner`, `extension-alert-cta`

#### 2.3 Active Booking Hero Card

**Current:** Booking cards in a list with simple progress bars.
**Target:** A single hero card for the most important active booking, with a visual 5-step progress timeline.

**Progress Timeline (5 steps):**

| Step | DE Label | EN Label | Icon (completed) | Icon (active) | Icon (future) |
|------|----------|----------|-------------------|---------------|---------------|
| 1 | Gebucht | Booked | Check (green circle) | -- | Gray circle |
| 2 | Abgeholt | Picked Up | Check (green circle) | Blue circle (pulse) | Gray circle |
| 3 | Werkstatt | Workshop | Check (green circle) | Blue circle (pulse) + gear icon | Gray circle |
| 4 | Fertig | Ready | Check (green circle) | Blue circle (pulse) | Gray circle |
| 5 | Zuruckgegeben | Returned | Check (green circle) | Blue circle (pulse) | Gray circle |

**Card layout from mockup:**
- Blue gradient left accent strip (w-1.5)
- Status badge: "In Bearbeitung" with pulsing blue dot
- Booking number in mono font: "BK26020001"
- Horizontal progress timeline with connectors (green for completed, gray for future)
- Vehicle info row: BMW 3er * 2020, WI-AB 1234
- Service info row: Inspektion, Hauptservice
- Next event row: "Heute, 16:00 Uhr" + "Voraussichtl. Fertigstellung"
- Action buttons: "Details ansehen" (blue) + "Kontakt Werkstatt" (outline)

**Data-testid:** `active-booking-hero`, `booking-progress-timeline`, `progress-step-{index}`

#### 2.4 Quick Stats Row

**Current:** 3 large stat cards with icons (not clickable).
**Target:** 3 compact stat cards in a 3-column grid (from mockup):

| Stat | Icon | Value | Label DE | Label EN |
|------|------|-------|----------|----------|
| Services | ClipboardList | `{count}` | Services | Services |
| Nachster Termin | Calendar | `{date}` | Nachster Termin | Next Appointment |
| Bewertung | Star (filled) | `{rating}` | Bewertung | Rating |

**Design:** White bg, rounded-2xl, shadow-sm, border gray-100. Icon in tinted circle (8x8). Value in text-xl bold. Label in text-[10px] gray-500.

**Data-testid:** `quick-stats-row`, `stat-services`, `stat-next-appointment`, `stat-rating`

#### 2.5 Past Bookings List

**Current:** Full booking list with filters, search, sort.
**Target:** Simplified "Vergangene Buchungen" section (from mockup):
- Section header: "Vergangene Buchungen" + "Alle anzeigen" link
- 3 most recent past bookings as compact card rows
- Each row: Car icon (gray circle) + service name + vehicle/date + status badge (green "Abgeschlossen") + price + chevron
- Clicking navigates to booking detail

**Data-testid:** `past-bookings-section`, `past-booking-card-{index}`

#### 2.6 File-by-File Changes for Dashboard

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/customer/dashboard/page.tsx` | **Major rewrite** | Remove sidebar, headers, and full booking list. Replace with: welcome section (time-based greeting), extension alert banner, active booking hero card, quick stats row, past bookings list. Remove `ProtectedRoute` wrapper (moved to layout). |
| `app/[locale]/customer/layout.tsx` | **Create new** | Shared customer layout with header + bottom nav + ProtectedRoute |

---

## 3. Booking Details Redesign

### Current State (`customer/bookings/[id]/page.tsx`, 459 lines)

- Back button + "Buchungsdetails" heading + booking number + status badge
- Pending extension alert banner (amber)
- 2-tab interface: Details / Erweiterungen (using shadcn Tabs)
- Details tab: Vehicle card, Service card (shows raw `booking.serviceType` like "INSPECTION"), Pickup/Delivery cards, Price card, Notes card
- Extensions tab: Renders `<ExtensionList>` component
- Uses local inline translation object `t` (not i18n files)
- No Activities/Timeline tab

### Target State (from mockup)

#### 3.1 Mobile Header with Back Button

**Target:** Compact header with:
- Back arrow (`ChevronLeft`) that returns to dashboard
- "Buchungsdetails" title + booking number (mono font) with copy button
- Status badge (blue pill with pulsing dot: "In Bearbeitung")

**Data-testid:** `booking-detail-header`, `booking-back-button`, `booking-number-copy`

#### 3.2 Pill-Style Sub-Tabs

**Current:** Standard shadcn `TabsList` with grid layout (`grid-cols-2`).
**Target:** 3 pill-style tabs in a rounded container (from mockup):

```
[  Details  ] [ Erweiterungen (1) ] [ Aktivitaten ]
```

- Container: `bg-gray-100 rounded-full p-1`
- Active tab: `bg-blue-500 text-white rounded-full`
- Inactive tab: `text-gray-600`, hover: `bg-gray-200`
- Extensions tab: amber badge count if pending (`w-5 h-5 bg-amber-500 text-white rounded-full`)

**Data-testid:** `subtab-details`, `subtab-extensions`, `subtab-activities`, `extension-count-badge`

#### 3.3 Details Tab Content

**From mockup -- 4 cards:**

1. **Vehicle Card** (`data-testid="detail-vehicle-card"`)
   - Icon: Car in gray circle
   - Grid 2x2: Marke & Modell (BMW 3er), Baujahr (2020), Kilometerstand (50.000 km), Kennzeichen (WI-AB 1234)

2. **Service Card** (`data-testid="detail-service-card"`)
   - Icon: Gear in blue circle
   - Service name: "Inspektion" (translated, not raw enum)
   - Description: "Komplette Fahrzeuginspektion nach Herstellervorgaben"

3. **Pickup & Delivery Cards** (`data-testid="detail-pickup-card"`, `data-testid="detail-delivery-card"`)
   - Pickup: Green icon, "Erledigt" badge, date, time, address with MapPin, map placeholder
   - Delivery: Blue icon, "Ausstehend" badge, estimated date, time range, address (same as pickup notation), map placeholder

4. **Price Summary Card** (`data-testid="detail-price-summary"`)
   - Line items: Inspektion 250,00 EUR, Erweiterung 280,50 EUR (with "AUSSTEHEND" amber badge), Concierge-Service 0,00 EUR (inklusive)
   - Total: 530,50 EUR in success green
   - "Rechnung herunterladen" button with download icon

#### 3.4 Extensions Tab Content

**From mockup -- 2 card types:**

1. **Pending Extension Card** (`data-testid="extension-pending-card"`)
   - Amber border + `glow-amber` animation
   - Amber header strip: AlertCircle icon + "Genehmigung erforderlich" + request date
   - Body: Description, items table (gray-50 bg with dividers), total amount (2xl bold amber)
   - Actions: "Ablehnen" (red outline) + "Genehmigen & Bezahlen -- 280,50 EUR" (amber filled)

2. **Approved Extension Card** (`data-testid="extension-approved-card"`)
   - Green border
   - Green header strip: CheckCircle + "Genehmigt" + approval date
   - Body: Description, items, total (green), opacity-75

#### 3.5 Activities Tab Content (NEW)

**From mockup -- vertical timeline:**

- Container: White card with "Aktivitatenverlauf" heading
- Vertical line: `absolute left-4 top-3 bottom-3 w-0.5 bg-gray-200`
- Each entry: colored circle (left) + timestamp (mono, gray-400) + title (bold) + description
- Entry types:
  - **Current (blue, pulsing):** "In der Werkstatt" -- `timeline-active` animation
  - **Extension event (amber):** "Auftragserweiterung erstellt"
  - **Completed (green):** "Fahrzeug abgeholt", "Jockey unterwegs"
  - **Info (blue):** "Buchung bestatigt"

**Data-testid:** `activities-timeline`, `timeline-entry-{index}`

**Data source:** The activities/timeline data needs to be derived from:
- Booking status change history (if the backend provides it via `booking.statusHistory` or similar)
- Extension creation/approval events
- Fallback: construct a static timeline from the current booking status + known timestamps

#### 3.6 File-by-File Changes for Booking Details

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/customer/bookings/[id]/page.tsx` | **Major rewrite** | Replace 2-tab shadcn Tabs with 3 pill-style sub-tabs. Add Activities tab. Redesign Details tab cards per mockup. Move translations to i18n files. Fix serviceType enum display. |

---

## 4. Extension Approval Flow

### Current State

**Flow (3+ clicks):**
1. Dashboard: See amber alert on a booking card -> click -> go to booking detail
2. Booking detail: See pending banner -> click "Jetzt prufen" -> switch to Extensions tab
3. Extensions tab: See pending card -> click "Genehmigen & Bezahlen" -> opens approval modal
4. Modal: Review view -> click "Genehmigen & Bezahlen" -> payment view -> click demo pay -> success

**Issues:**
- 3-4 clicks from dashboard to approval
- Modal has separate review/payment steps
- Demo payment form shows English text ("Pay with Demo")
- No workshop note displayed in the extension cards

### Target State (from mockup)

#### 4.1 Dashboard Alert -> Direct Navigation

**From mockup:** The extension alert banner has a "Jetzt prufen" button that directly opens the approval modal:

```
Dashboard alert click -> Navigate to /customer/bookings/{id}?tab=extensions&modal=review
```

The booking detail page checks for `modal=review` URL param and auto-opens the `ExtensionApprovalModal` on mount.

This reduces the flow to **1 click** from dashboard.

#### 4.2 Extension Approval Modal Redesign

**From mockup -- single-view modal:**
- Close button (top-right)
- Header: Amber alert icon + "Auftragserweiterung prufen" + "Die Werkstatt hat zusatzliche Arbeiten vorgeschlagen"
- Workshop note: Blue left-border card with workshop message (italic)
- Items table: Gray-50 background, numbered items with prices
- Total: Amber-50 background card with bold total (280,50 EUR)
- Actions (stacked vertically):
  - "Genehmigen & Bezahlen -- 280,50 EUR" (amber, full-width, large, with shadow)
  - "Ablehnen" (gray outline, hover turns red)

**Key differences from current:**
- No separate payment step in the modal -- the "Genehmigen & Bezahlen" button triggers the payment inline
- Workshop note prominently displayed (new)
- Stacked buttons instead of side-by-side
- All German text (no English in demo mode)

#### 4.3 Demo Payment Integration

When the user clicks "Genehmigen & Bezahlen":
- In demo mode: Call the demo authorize API directly, show a brief loading spinner, then success state
- In Stripe mode: Inline Stripe Elements within the same modal (no separate "payment view")

The current `DemoPaymentForm` component renders its own UI with English text. For the redesign:
- Do NOT render `DemoPaymentForm` as a separate component
- Instead, the modal handles the demo payment API call directly and shows a localized success state

#### 4.4 State Management Changes

**Current:** `ExtensionApprovalModal` manages `currentView: "review" | "payment" | "decline"` as separate views.
**Target:** Single-scroll view with:
- `isProcessingPayment: boolean` -- shows loading state on the approve button
- `showDeclineForm: boolean` -- toggles inline decline reason textarea
- Remove the multi-view pattern

#### 4.5 File-by-File Changes for Extension Flow

| File | Action | Description |
|------|--------|-------------|
| `components/customer/ExtensionApprovalModal.tsx` | **Major rewrite** | Single-view layout matching mockup. Add workshop note display. Inline payment (no separate view). Localize all text. Remove separate PaymentForm component. |
| `components/customer/ExtensionList.tsx` | **Modify** | Update card designs to match mockup (amber glow for pending, green for approved). Add workshop description display. Update button styles. |
| `app/[locale]/customer/bookings/[id]/page.tsx` | **Modify** | Check for `modal=review` URL param to auto-open approval modal. |
| `app/[locale]/customer/dashboard/page.tsx` | **Modify** | Extension alert banner navigates with `?tab=extensions&modal=review` |

---

## 5. New Components to Create

| # | Component | File Path | Props | Purpose | Used By |
|---|-----------|-----------|-------|---------|---------|
| 1 | `CustomerLayout` | `app/[locale]/customer/layout.tsx` | `{ children }` | Shared layout with header + bottom nav + ProtectedRoute | All customer pages |
| 2 | `CustomerHeader` | `components/customer/CustomerHeader.tsx` | none (uses auth context) | Sticky top bar: logo, notification bell, user avatar | CustomerLayout |
| 3 | `CustomerBottomNav` | `components/customer/CustomerBottomNav.tsx` | none (uses router for active state) | Fixed bottom nav: Home, Buchung, Chat, Profil | CustomerLayout |
| 4 | `BookingProgressTimeline` | `components/customer/BookingProgressTimeline.tsx` | `{ currentStep: number, steps: string[] }` | 5-step horizontal timeline with connectors, completed/active/future states | Dashboard hero card, Booking details |
| 5 | `ExtensionAlertBanner` | `components/customer/ExtensionAlertBanner.tsx` | `{ bookingId: string, count: number, totalAmount: number, description: string, onReview: () => void }` | Amber glow banner for pending extensions | Dashboard |
| 6 | `ActiveBookingHeroCard` | `components/customer/ActiveBookingHeroCard.tsx` | `{ booking: BookingResponse, pendingExtensions: number }` | Full hero card with progress timeline, vehicle info, actions | Dashboard |
| 7 | `BookingActivityTimeline` | `components/customer/BookingActivityTimeline.tsx` | `{ booking: BookingResponse, extensions: ExtensionResponse[] }` | Vertical activity timeline with colored dots and timestamps | Booking details (Activities tab) |
| 8 | `QuickStatsRow` | `components/customer/QuickStatsRow.tsx` | `{ servicesCount: number, nextAppointment: string, rating: number }` | 3-column compact stats row | Dashboard |
| 9 | `PastBookingCard` | `components/customer/PastBookingCard.tsx` | `{ booking: BookingResponse }` | Compact past booking row with icon, service, vehicle, date, status, price | Dashboard past bookings list |

---

## 6. File Change Matrix

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/customer/layout.tsx` | **CREATE** | Shared customer portal layout with CustomerHeader + CustomerBottomNav + ProtectedRoute wrapper |
| `app/[locale]/customer/dashboard/page.tsx` | **REWRITE** | Remove sidebar, inline headers, full booking list. Replace with: welcome section (time-based greeting), ExtensionAlertBanner, ActiveBookingHeroCard, QuickStatsRow, past bookings list. Remove ProtectedRoute (in layout). ~550 lines -> ~250 lines. |
| `app/[locale]/customer/bookings/[id]/page.tsx` | **REWRITE** | Replace 2-tab shadcn Tabs with 3 pill-style sub-tabs (Details/Erweiterungen/Aktivitaten). Add Activities tab with BookingActivityTimeline. Redesign Details tab cards. Handle `?modal=review` URL param. Fix service type enum rendering. ~459 lines -> ~350 lines. |
| `components/customer/CustomerHeader.tsx` | **CREATE** | Mobile header: logo, notification bell with badge, user avatar initials |
| `components/customer/CustomerBottomNav.tsx` | **CREATE** | Fixed bottom navigation: Home, Buchung, Chat, Profil with active state |
| `components/customer/BookingProgressTimeline.tsx` | **CREATE** | 5-step horizontal progress timeline with connectors and animations |
| `components/customer/ExtensionAlertBanner.tsx` | **CREATE** | Full-width amber glow alert banner for pending extensions |
| `components/customer/ActiveBookingHeroCard.tsx` | **CREATE** | Hero card for active booking with progress timeline and vehicle info |
| `components/customer/BookingActivityTimeline.tsx` | **CREATE** | Vertical activity timeline for booking details |
| `components/customer/QuickStatsRow.tsx` | **CREATE** | 3-column compact stats row |
| `components/customer/PastBookingCard.tsx` | **CREATE** | Compact past booking card row |
| `components/customer/ExtensionList.tsx` | **MODIFY** | Update card designs: amber glow for pending, green header for approved. Add workshop description. Update button styling to match mockup. |
| `components/customer/ExtensionApprovalModal.tsx` | **REWRITE** | Single-view layout matching mockup. Workshop note card. Inline payment. Localized demo mode. Remove multi-view pattern. ~521 lines -> ~300 lines. |
| `components/customer/NotificationCenter.tsx` | **MODIFY** | Minor: adjust for new header layout (no longer standalone in dashboard header) |
| `components/customer/index.ts` | **MODIFY** | Add exports for all new components |
| `app/globals.css` | **MODIFY** | Add CSS animations: `glow-amber`, `timeline-active`, `pulse-dot`, `badge-bounce`. Add bottom-nav styles. |
| `messages/de.json` | **MODIFY** | Add new keys (see Section 7) |
| `messages/en.json` | **MODIFY** | Add new keys (see Section 7) |

---

## 7. i18n Key Changes

### 7.1 New DE Keys

```json
{
  "customerPortal": {
    "header": {
      "title": "AutoConcierge"
    },
    "nav": {
      "home": "Home",
      "booking": "Buchung",
      "chat": "Chat",
      "profile": "Profil"
    },
    "greeting": {
      "morning": "Guten Morgen! Hier ist Ihre aktuelle Ubersicht.",
      "afternoon": "Guten Tag! Hier ist Ihre aktuelle Ubersicht.",
      "evening": "Guten Abend! Hier ist Ihre aktuelle Ubersicht.",
      "welcomeBack": "Willkommen zuruck, {name}!",
      "welcomeGeneric": "Willkommen zuruck!"
    },
    "extensionAlert": {
      "title": "{count} Erweiterung wartet auf Genehmigung",
      "titlePlural": "{count} Erweiterungen warten auf Genehmigung",
      "subtitle": "{description} -- {amount}",
      "cta": "Jetzt prufen"
    },
    "activeBooking": {
      "title": "Aktive Buchung",
      "inProgress": "In Bearbeitung",
      "viewDetails": "Details ansehen",
      "contactWorkshop": "Kontakt Werkstatt",
      "estimatedCompletion": "Voraussichtl. Fertigstellung"
    },
    "progressSteps": {
      "booked": "Gebucht",
      "pickedUp": "Abgeholt",
      "workshop": "Werkstatt",
      "ready": "Fertig",
      "returned": "Zuruckgegeben"
    },
    "stats": {
      "services": "Services",
      "nextAppointment": "Nachster Termin",
      "rating": "Bewertung"
    },
    "pastBookings": {
      "title": "Vergangene Buchungen",
      "viewAll": "Alle anzeigen",
      "completed": "Abgeschlossen"
    },
    "bookingDetail": {
      "title": "Buchungsdetails",
      "copyBookingNumber": "Buchungsnummer kopieren",
      "tabs": {
        "details": "Details",
        "extensions": "Erweiterungen",
        "activities": "Aktivitaten"
      },
      "vehicle": {
        "title": "Fahrzeug",
        "brandModel": "Marke & Modell",
        "year": "Baujahr",
        "mileage": "Kilometerstand",
        "plate": "Kennzeichen"
      },
      "service": {
        "title": "Service",
        "mainService": "Hauptservice"
      },
      "pickup": {
        "title": "Abholung",
        "done": "Erledigt",
        "date": "Datum",
        "timeSlot": "Zeitfenster",
        "address": "Adresse",
        "map": "Karte"
      },
      "delivery": {
        "title": "Ruckgabe",
        "pending": "Ausstehend",
        "estimatedDate": "Voraussichtliches Datum",
        "sameAddress": "Adresse (gleiche wie Abholung)"
      },
      "pricing": {
        "title": "Kostenubersicht",
        "extension": "Erweiterung",
        "extensionPending": "AUSSTEHEND",
        "conciergeService": "Concierge-Service",
        "conciergeIncluded": "inklusive",
        "total": "Gesamt",
        "downloadInvoice": "Rechnung herunterladen"
      }
    },
    "extensionCard": {
      "approvalRequired": "Genehmigung erforderlich",
      "requestedOn": "Angefragt am",
      "totalAmount": "Gesamtbetrag",
      "approveAndPay": "Genehmigen & Bezahlen -- {amount}",
      "decline": "Ablehnen",
      "approved": "Genehmigt",
      "approvedOn": "Genehmigt am"
    },
    "extensionModal": {
      "title": "Auftragserweiterung prufen",
      "subtitle": "Die Werkstatt hat zusatzliche Arbeiten vorgeschlagen",
      "workshopNote": "Werkstatt-Hinweis",
      "items": "Positionen",
      "totalAmount": "Gesamtbetrag",
      "approveAndPay": "Genehmigen & Bezahlen -- {amount}",
      "decline": "Ablehnen",
      "processing": "Wird verarbeitet...",
      "paymentSuccess": "Zahlung erfolgreich!",
      "extensionApproved": "Erweiterung genehmigt"
    },
    "activities": {
      "title": "Aktivitatenverlauf",
      "current": "AKTUELL",
      "inWorkshop": "In der Werkstatt",
      "serviceInProgress": "Service wird durchgefuhrt",
      "extensionCreated": "Auftragserweiterung erstellt",
      "vehiclePickedUp": "Fahrzeug abgeholt",
      "jockeyPickedUp": "Jockey {name} hat Ihr Fahrzeug ubernommen",
      "jockeyEnRoute": "Jockey unterwegs",
      "pickupEstimate": "Abholung in ca. {minutes} Minuten",
      "bookingConfirmed": "Buchung bestatigt",
      "bookingCreatedDesc": "Ihre Buchung {bookingNumber} wurde erfolgreich angelegt",
      "extensionApproved": "Erweiterung genehmigt",
      "extensionDeclined": "Erweiterung abgelehnt",
      "vehicleReturned": "Fahrzeug zuruckgegeben",
      "serviceCompleted": "Service abgeschlossen"
    }
  }
}
```

### 7.2 New EN Keys

```json
{
  "customerPortal": {
    "header": {
      "title": "AutoConcierge"
    },
    "nav": {
      "home": "Home",
      "booking": "Booking",
      "chat": "Chat",
      "profile": "Profile"
    },
    "greeting": {
      "morning": "Good morning! Here is your current overview.",
      "afternoon": "Good afternoon! Here is your current overview.",
      "evening": "Good evening! Here is your current overview.",
      "welcomeBack": "Welcome back, {name}!",
      "welcomeGeneric": "Welcome back!"
    },
    "extensionAlert": {
      "title": "{count} extension awaiting approval",
      "titlePlural": "{count} extensions awaiting approval",
      "subtitle": "{description} -- {amount}",
      "cta": "Review now"
    },
    "activeBooking": {
      "title": "Active Booking",
      "inProgress": "In Progress",
      "viewDetails": "View Details",
      "contactWorkshop": "Contact Workshop",
      "estimatedCompletion": "Est. Completion"
    },
    "progressSteps": {
      "booked": "Booked",
      "pickedUp": "Picked Up",
      "workshop": "Workshop",
      "ready": "Ready",
      "returned": "Returned"
    },
    "stats": {
      "services": "Services",
      "nextAppointment": "Next Appointment",
      "rating": "Rating"
    },
    "pastBookings": {
      "title": "Past Bookings",
      "viewAll": "View All",
      "completed": "Completed"
    },
    "bookingDetail": {
      "title": "Booking Details",
      "copyBookingNumber": "Copy booking number",
      "tabs": {
        "details": "Details",
        "extensions": "Extensions",
        "activities": "Activities"
      },
      "vehicle": {
        "title": "Vehicle",
        "brandModel": "Make & Model",
        "year": "Year",
        "mileage": "Mileage",
        "plate": "License Plate"
      },
      "service": {
        "title": "Service",
        "mainService": "Main Service"
      },
      "pickup": {
        "title": "Pickup",
        "done": "Done",
        "date": "Date",
        "timeSlot": "Time Slot",
        "address": "Address",
        "map": "Map"
      },
      "delivery": {
        "title": "Return",
        "pending": "Pending",
        "estimatedDate": "Estimated Date",
        "sameAddress": "Address (same as pickup)"
      },
      "pricing": {
        "title": "Cost Overview",
        "extension": "Extension",
        "extensionPending": "PENDING",
        "conciergeService": "Concierge Service",
        "conciergeIncluded": "included",
        "total": "Total",
        "downloadInvoice": "Download Invoice"
      }
    },
    "extensionCard": {
      "approvalRequired": "Approval Required",
      "requestedOn": "Requested on",
      "totalAmount": "Total Amount",
      "approveAndPay": "Approve & Pay -- {amount}",
      "decline": "Decline",
      "approved": "Approved",
      "approvedOn": "Approved on"
    },
    "extensionModal": {
      "title": "Review Order Extension",
      "subtitle": "The workshop has proposed additional work",
      "workshopNote": "Workshop Note",
      "items": "Items",
      "totalAmount": "Total Amount",
      "approveAndPay": "Approve & Pay -- {amount}",
      "decline": "Decline",
      "processing": "Processing...",
      "paymentSuccess": "Payment successful!",
      "extensionApproved": "Extension approved"
    },
    "activities": {
      "title": "Activity Log",
      "current": "CURRENT",
      "inWorkshop": "At Workshop",
      "serviceInProgress": "Service being performed",
      "extensionCreated": "Order extension created",
      "vehiclePickedUp": "Vehicle picked up",
      "jockeyPickedUp": "Jockey {name} has taken over your vehicle",
      "jockeyEnRoute": "Jockey en route",
      "pickupEstimate": "Pickup in approx. {minutes} minutes",
      "bookingConfirmed": "Booking confirmed",
      "bookingCreatedDesc": "Your booking {bookingNumber} was successfully created",
      "extensionApproved": "Extension approved",
      "extensionDeclined": "Extension declined",
      "vehicleReturned": "Vehicle returned",
      "serviceCompleted": "Service completed"
    }
  }
}
```

### 7.3 Modified Keys

The existing `customerDashboard` namespace keys will remain for backward compatibility but the new components should use the `customerPortal` namespace. During migration:

- `customerDashboard.nav.*` -> replaced by `customerPortal.nav.*` (bottom nav labels differ)
- `customerDashboard.stats.*` -> replaced by `customerPortal.stats.*` (different stat types)
- `extensions.*` and `extensionApproval.*` -> supplement with `customerPortal.extensionCard.*` and `customerPortal.extensionModal.*` for the redesigned components

### 7.4 Service Type Translation Keys

The booking detail page currently renders raw enum values like "INSPECTION". The fix:
- Use existing `payment.serviceTypes` or `bookingSummary.serviceTypes` namespaces which already have translations:
  - DE: `INSPECTION` -> "Inspektion", `OIL_SERVICE` -> "Olwechsel", etc.
  - EN: `INSPECTION` -> "Inspection", `OIL_SERVICE` -> "Oil Change", etc.
- Apply this mapping in the service display within booking details

---

## 8. E2E Test Impact

### 8.1 Walkthrough Phase 3 (Customer Dashboard, screenshots 021-024)

Phase 3 in the walkthrough is actually the Workshop phase (P3-01 = Workshop Login, P3-02 = Workshop Dashboard). The **customer dashboard** screenshot in the walkthrough is captured during Phase 5 (P5-04).

**P5-04 screenshot `customer-dashboard-pending-extension`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| Page loads at `/de/customer/dashboard` | **Same** | Same URL |
| Booking cards with inline extension alert | **Changed** | Extension alert is now a standalone `ExtensionAlertBanner` at top. Look for `[data-testid="extension-alert-banner"]` |
| Sidebar navigation (desktop only) | **Removed** | Bottom navigation `[data-testid="bnav-home"]`, `[data-testid="bnav-booking"]` etc. |
| `button:has-text("Details")` per booking | **Changed** | Hero card with `[data-testid="active-booking-hero"]` and "Details ansehen" button |

**Required test changes:**
- P5-04: Update assertions to look for the new extension alert banner instead of per-booking alerts
- Screenshot may look very different -- will need visual baseline reset

### 8.2 Walkthrough Phase 5 (Extensions, screenshots 037-043)

**P5-05 screenshot `customer-booking-details-with-extension`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| `button[role="tab"]` filter `Erweiterungen` | **Changed** | Pill-style sub-tabs: `[data-testid="subtab-extensions"]` or `button:has-text("Erweiterungen")` still works |
| `TabsTrigger value="extensions"` | **Changed** | Custom pill button (not shadcn TabsTrigger). Selector: `#subtab-extensions` or `[data-testid="subtab-extensions"]` |

**P5-06 screenshot `customer-extensions-tab-pending`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| `button[role="tab"]` filter by text | **Changed** | New pill-style tabs. The text-based filter `/Erweiterungen\|Extensions/i` should still work on button text, but `role="tab"` may not be present on custom pill buttons |
| Extension cards in `[role="tabpanel"]` | **Changed** | Cards now in a div without `role="tabpanel"`. Look for `[data-testid="extension-pending-card"]` |

**P5-07 screenshot `customer-extension-review-details`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| `[role="tabpanel"] button` with `svg.lucide-triangle-alert` | **Changed** | New card has inline "Genehmigen & Bezahlen" button. Look for `button:has-text("Genehmigen")` or `[data-testid="extension-approve-btn"]` |

**P5-08 screenshot `customer-extension-payment-form`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| `[role="dialog"] button` filter approve | **Changed** | Modal is redesigned as single-view. The approve button text "Genehmigen & Bezahlen -- 280,50 EUR" is directly in the modal. `button:has-text("Genehmigen")` in dialog still works |
| `button:has-text("Pay with Demo")` | **REMOVED** | Demo payment is handled inline. Look for the approve button triggering payment directly. May need `button:has-text("Genehmigen & Bezahlen")` |

**P5-10 screenshot `customer-extension-confirmed-state`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| Extension card with green header | **Similar** | Green-bordered card with `[data-testid="extension-approved-card"]` |

### 8.3 Walkthrough Phase 8 (Final, screenshots 051-052/053)

**P8-01 screenshot `customer-dashboard-final`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| Dashboard at `/de/customer/dashboard` | **Same URL** | Same |
| Booking cards with "Abgeschlossen" status | **Changed** | No hero card (no active booking). Past bookings section shows completed bookings with green badges. |
| Sidebar visible on desktop | **Removed** | Bottom nav instead |

**P8-02 screenshot `customer-booking-details-final`:**

| Current Selector | Change | New Selector |
|------------------|--------|--------------|
| Booking detail page | **Changed layout** | Pill-style tabs instead of shadcn tabs. Price summary card shows final total with all extensions included. "Rechnung herunterladen" button visible. |

### 8.4 Both DE and EN Specs

The same selector changes apply to `walkthrough-en-unified.spec.ts`. Key differences:
- Tab labels: "Extensions" instead of "Erweiterungen", "Activities" instead of "Aktivitaten"
- Button text: "Approve & Pay" instead of "Genehmigen & Bezahlen"
- Alert text: "extension awaiting approval" instead of "Erweiterung wartet auf Genehmigung"

### 8.5 Other Affected E2E Tests

| Test File | Impact | Changes Needed |
|-----------|--------|----------------|
| `03-customer-portal.spec.ts` | **Medium** | Dashboard structure changed; sidebar nav gone; bottom nav present. Update navigation assertions. |
| `07-extension-approval-flow.spec.ts` | **High** | Extension flow selectors change significantly. Tab selectors, modal selectors, payment button selectors all need updating. |
| `08-extension-integration.spec.ts` | **High** | Same extension flow selector changes. |
| `09-complete-e2e-journey.spec.ts` | **Medium** | Customer dashboard section needs updated selectors. |
| `10-complete-e2e-with-auth.spec.ts` | **Medium** | Customer portal auth flow unchanged, but dashboard assertions need updating. |
| `12-extension-flow.spec.ts` | **High** | Extension approval selectors change. |
| `customer-journey.spec.ts` | **Medium** | Dashboard and booking detail selectors change. |
| `portal-smoke-tests.spec.ts` | **Low** | May check for sidebar elements that no longer exist. |
| `qa-navigation-audit.spec.ts` | **Medium** | Navigation pattern changed from sidebar to bottom nav. |
| `qa-portal-interactions.spec.ts` | **Medium** | Portal interaction selectors may reference sidebar links. |

### 8.6 Recommended Test Migration Strategy

1. **Add `data-testid` attributes** to all new components for stable selectors
2. **Update text-based selectors** where button text changes (e.g., "Pay with Demo" is removed)
3. **Replace `role="tab"` selectors** with `data-testid` for the new pill-style tabs
4. **Replace `role="tabpanel"` selectors** with `data-testid` for tab content areas
5. **Update screenshot baselines** -- all customer portal screenshots will change significantly
6. **Keep old selectors working during transition** by maintaining `role="tab"` on pill buttons if possible, or update tests in the same PR

---

*End of Customer Portal Redesign Implementation Plan*
