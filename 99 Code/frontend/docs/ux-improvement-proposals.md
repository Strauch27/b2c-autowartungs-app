# UX Improvement Proposals -- AutoConcierge B2C App

**Date:** 2026-02-08
**Based on:** UX Audit Report (2026-02-08), 52 walkthrough screenshots, source code review
**Scope:** All portals (Landing, Booking Flow, Customer, Jockey, Workshop)

---

## Table of Contents

1. [Design System Overhaul](#1-design-system-overhaul)
2. [Landing Page Redesign](#2-landing-page-redesign)
3. [Booking Flow Redesign](#3-booking-flow-redesign)
4. [Customer Portal Redesign](#4-customer-portal-redesign)
5. [Jockey Portal Redesign](#5-jockey-portal-redesign-mobile-first)
6. [Workshop Portal Redesign](#6-workshop-portal-redesign)
7. [Extension Approval Flow Redesign](#7-extension-approval-flow-redesign)
8. [Cross-cutting Improvements](#8-cross-cutting-improvements)
9. [Innovation Ideas](#9-innovation-ideas)

---

## 1. Design System Overhaul

### 1.1 New Color Palette

**Problem:** The current design uses HSL variables that are inconsistent across portals. Button colors vary arbitrarily (orange in booking, blue in customer portal, green in jockey), and semantic colors are not applied consistently. The CTA color (orange) and workshop portal color are identical (`25 95% 53%`), causing brand confusion. (Audit refs: M12, 5.1)

**Solution:** Introduce a unified color palette with clear semantic roles. Every color has a designated purpose and portals share the same CTA and semantic colors -- only the portal *accent stripe* differs.

#### Primary Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Primary | Deep Navy | `#1E3A5F` | 212 52% 25% | Headers, sidebar bg, navigation, trust |
| Primary Light | Bright Blue | `#3B82F6` | 217 91% 60% | Links, active states, selected items |
| Primary Dark | Midnight | `#0F172A` | 222 47% 11% | Text headings, high-contrast elements |

#### CTA / Action Palette

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| CTA Primary | Amber Orange | `#F59E0B` | 45 93% 47% | All primary action buttons app-wide |
| CTA Hover | Deep Amber | `#D97706` | 32 95% 44% | CTA hover state |
| CTA Light | Amber Glow | `#FEF3C7` | 48 96% 89% | CTA background tints, highlights |

#### Semantic Colors

| Role | Name | Hex | HSL | Usage |
|------|------|-----|-----|-------|
| Success | Emerald | `#10B981` | 160 84% 39% | Completed states, confirmations, check marks |
| Success Light | Emerald Tint | `#D1FAE5` | 152 81% 90% | Success backgrounds |
| Warning | Amber | `#F59E0B` | 45 93% 47% | Pending states, alerts needing attention |
| Warning Light | Amber Tint | `#FEF3C7` | 48 96% 89% | Warning backgrounds |
| Error | Rose | `#EF4444` | 0 84% 60% | Errors, destructive actions, cancellations |
| Error Light | Rose Tint | `#FEE2E2` | 0 93% 94% | Error backgrounds |
| Info | Sky | `#0EA5E9` | 199 89% 48% | Informational notices, tips |
| Info Light | Sky Tint | `#E0F2FE` | 204 94% 94% | Info backgrounds |

#### Neutral Scale

| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#F8FAFC` | Page background |
| 100 | `#F1F5F9` | Card background, subtle fills |
| 200 | `#E2E8F0` | Borders, dividers |
| 300 | `#CBD5E1` | Disabled states, placeholder text |
| 400 | `#94A3B8` | Secondary text, icons |
| 500 | `#64748B` | Body text |
| 600 | `#475569` | Subheadings |
| 700 | `#334155` | Headings |
| 800 | `#1E293B` | Primary text |
| 900 | `#0F172A` | Strongest text |

#### Portal Accent Stripes (for differentiation only -- not CTAs)

| Portal | Name | Hex | Usage |
|--------|------|-----|-------|
| Customer | Portal Blue | `#3B82F6` | Left border, sidebar active indicator |
| Jockey | Portal Green | `#22C55E` | Top bar, left border |
| Workshop | Portal Orange | `#F97316` | Top bar, left border |

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 01 (Landing + Booking), 02 (Customer Portal), 03 (Jockey + Workshop)

---

### 1.2 Typography Scale

**Problem:** Heading sizes are inconsistent across portals. Landing hero uses text-4xl/5xl/6xl, customer dashboard uses text-2xl/3xl, jockey uses plain bold text. No formalized type scale exists. (Audit ref: 5.5)

**Solution:** Adopt a modular scale (ratio 1.25) with Inter as the primary font (already in use) and a complementary system.

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display-lg` | 48px / 3rem | 800 (ExtraBold) | 1.1 | -0.025em | Hero headline only |
| `display-sm` | 36px / 2.25rem | 700 (Bold) | 1.15 | -0.025em | Section headlines on landing |
| `heading-1` | 30px / 1.875rem | 700 | 1.2 | -0.02em | Page titles (dashboard, detail pages) |
| `heading-2` | 24px / 1.5rem | 600 (SemiBold) | 1.3 | -0.015em | Section headings within pages |
| `heading-3` | 20px / 1.25rem | 600 | 1.4 | -0.01em | Card titles |
| `heading-4` | 16px / 1rem | 600 | 1.5 | 0 | Subsection headings |
| `body-lg` | 18px / 1.125rem | 400 (Regular) | 1.6 | 0 | Hero subtitle, intro text |
| `body` | 16px / 1rem | 400 | 1.6 | 0 | Default body text |
| `body-sm` | 14px / 0.875rem | 400 | 1.5 | 0 | Secondary text, descriptions |
| `caption` | 12px / 0.75rem | 500 (Medium) | 1.4 | 0.02em | Labels, timestamps, badges |
| `overline` | 11px / 0.6875rem | 600 | 1.3 | 0.08em | Uppercase category labels |

Font stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (unchanged from current)

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01, 02, 03

---

### 1.3 Spacing System

**Problem:** Spacing is ad-hoc across components. Section spacing varies (`py-16`, `py-12`, custom padding), and there is no consistent internal rhythm. (Audit ref: L8, 5.5)

**Solution:** 4px base grid with named tokens.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Minimal gap (icon-to-text inline) |
| `space-2` | 8px | Tight spacing (badge padding, small gaps) |
| `space-3` | 12px | Form element internal padding |
| `space-4` | 16px | Default gap between related elements |
| `space-5` | 20px | Card internal padding (compact) |
| `space-6` | 24px | Card internal padding (standard) |
| `space-8` | 32px | Gap between card groups |
| `space-10` | 40px | Section padding (mobile) |
| `space-12` | 48px | Section padding (tablet) |
| `space-16` | 64px | Section padding (desktop) |
| `space-20` | 80px | Major section breaks (landing page) |
| `space-24` | 96px | Hero section vertical padding |

Container max-widths:
- Content: `max-w-5xl` (1024px) -- landing page, booking flow
- Dashboard: `max-w-7xl` (1280px) -- portal dashboards
- Modal: `max-w-2xl` (672px) -- dialogs and overlays

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01, 02, 03

---

### 1.4 Shadows, Border-Radius, and Elevation

**Problem:** Shadow values are defined in CSS custom properties but not consistently applied. Cards use `shadow-card` while some components use `shadow-sm` or inline Tailwind classes. (Audit ref: 5.1)

**Solution:** Three-tier elevation system.

| Level | Name | Box-Shadow | Usage |
|-------|------|-----------|-------|
| 0 | `elevation-flat` | none | Inline elements, flush surfaces |
| 1 | `elevation-low` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest, input fields |
| 2 | `elevation-mid` | `0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Cards on hover, dropdowns, popovers |
| 3 | `elevation-high` | `0 12px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)` | Modals, floating panels, sticky headers |
| 4 | `elevation-overlay` | `0 24px 48px rgba(0,0,0,0.16)` | Full-screen overlays, image lightbox |

Border-radius tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Small elements (badges, chips, tooltips) |
| `radius-md` | 8px | Buttons, inputs, select boxes |
| `radius-lg` | 12px | Cards, modals, panels |
| `radius-xl` | 16px | Hero elements, large feature cards |
| `radius-full` | 9999px | Avatars, pills, toggles |

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01, 02, 03

---

### 1.5 Component Style Guide

**Problem:** Buttons, cards, inputs, and badges have inconsistent styling across portals. The `buttonVariants` in `button.tsx` defines 11 variants which creates confusion. Cards use a mix of `Card` component, `.card-premium` CSS class, and raw `div` elements. (Audit ref: 5.1, M12)

**Solution:**

#### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| `primary` | `#F59E0B` (CTA Amber) | `#FFFFFF` | none | All primary CTAs: "Weiter", "Buchen", "Genehmigen" |
| `secondary` | `#F1F5F9` (Neutral 100) | `#334155` (Neutral 700) | `1px #E2E8F0` | Secondary actions: "Abbrechen", "Zuruck" |
| `ghost` | transparent | `#3B82F6` (Primary Light) | none | Tertiary actions: "Mehr erfahren", inline links |
| `destructive` | `#FEE2E2` (Error Light) | `#EF4444` (Error) | none | "Ablehnen", "Stornieren" |
| `outline` | transparent | `#334155` | `1px #E2E8F0` | Toggle/filter buttons, less prominent actions |
| `portal-jockey` | `#22C55E` | `#FFFFFF` | none | Jockey-specific primary CTAs |
| `portal-workshop` | `#F97316` | `#FFFFFF` | none | Workshop-specific primary CTAs |

Button sizes: `sm` (32px height), `md` (40px height, default), `lg` (48px height), `xl` (56px height, hero only)

Minimum touch target: 44x44px on mobile (addresses audit M13).

#### Cards

| Variant | Styling | Usage |
|---------|---------|-------|
| `card-default` | White bg, `elevation-low`, `radius-lg`, 1px neutral-200 border | Standard content containers |
| `card-interactive` | Same as default + hover: `elevation-mid` + `translateY(-2px)` | Clickable cards (bookings, services, assignments) |
| `card-highlight` | White bg, 3px left border in semantic color, `elevation-low` | Status-bearing cards (portal accent, status indicator) |
| `card-stat` | White bg, `elevation-low`, centered large number + label | Dashboard stat cards |

#### Inputs

All inputs: 44px height (mobile), 40px height (desktop), `radius-md`, 1px neutral-200 border, 12px horizontal padding. Focus: 2px ring in Primary Light (`#3B82F6`), border color change. Error: 2px ring in Error (`#EF4444`), helper text in Error below.

#### Badges

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `badge-info` | `#E0F2FE` | `#0EA5E9` | Informational, neutral status |
| `badge-success` | `#D1FAE5` | `#10B981` | Completed, confirmed, approved |
| `badge-warning` | `#FEF3C7` | `#D97706` | Pending, needs attention |
| `badge-error` | `#FEE2E2` | `#EF4444` | Cancelled, rejected, failed |
| `badge-neutral` | `#F1F5F9` | `#64748B` | Disabled, archived |

All badges: `radius-full`, `caption` font size, `space-1` vertical + `space-2` horizontal padding.

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 01, 02, 03

---

## 2. Landing Page Redesign

### 2.1 Hero Section

**Problem:** The current hero uses a flat `blue-50` gradient (`bg-gradient-to-b from-blue-50 via-blue-50/50 to-white`) that feels muted rather than premium. The "Anmelden" button in the header is nearly invisible against the background. The CTA button text "Preis berechnen" is misleading -- it starts a booking, not a price calculator. (Audit refs: L2, 6.1)

**Solution:** Replace with a full-bleed gradient hero using the Deep Navy to Primary Light gradient. Add a subtle animated mesh/grain overlay for depth. Restructure the header with a visible sign-in button. Fix the CTA copy.

- **Background:** Linear gradient from `#1E3A5F` (top-left) to `#3B82F6` (bottom-right), with a subtle radial highlight at center-right.
- **Header:** Sticky transparent header that transitions to solid white (with `elevation-mid` shadow) on scroll. Logo left, nav center, "Anmelden" button right in a white outline pill (`border-2 border-white/30 text-white hover:bg-white/10`). On mobile: hamburger menu with slide-in sheet.
- **Headline hierarchy:**
  - Social proof badge: Pill with star icons + "4.8 / 5 -- 1.247 Bewertungen" (white bg, amber stars).
  - H1: `display-lg`, white, "Ihr Auto-Service, ohne Aufwand" (or equivalent -- single clear value proposition).
  - Sub-headline: `body-lg`, white/80%, "Wir holen Ihr Auto ab, bringen es zur Werkstatt und liefern es zuruck -- zum Festpreis."
  - Trust USP strip: Three inline items with check icons in white ("Festpreis-Garantie", "Zertifizierte Werkstatten", "Concierge-Service inklusive").
- **CTA area:**
  - Primary button: `xl` size, CTA Amber, "Service buchen" with right arrow icon. Subtle bounce animation on load (3s delay).
  - Secondary link: Ghost button, white text, "So funktioniert's" with down-arrow.
- **Animated element:** A minimal line illustration of a car being handed over, or a looping Lottie animation showing the pickup-service-return flow, positioned to the right on desktop (hidden on mobile).

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 01

---

### 2.2 Trust Signals Section

**Problem:** The current landing page has scattered trust elements -- star rating in the hero, "Warum AutoConcierge?" value props below, and an FAQ. There is no consolidated trust/stats section that builds confidence. (Audit ref: 1.1)

**Solution:** Add a dedicated trust bar immediately below the hero.

- **Layout:** Full-width strip with `neutral-50` background.
- **Content (4 columns on desktop, 2x2 on mobile):**
  - "1.247+" -- "Zufriedene Kunden" (animated counter on scroll into view)
  - "50+" -- "Partner-Werkstatten" (animated counter)
  - "4.8/5" -- "Durchschnittliche Bewertung" (with 5 star icons)
  - "100%" -- "Festpreis-Garantie" (with shield icon)
- **Styling:** Each stat is centered in its column. Number in `display-sm` weight-800 Primary Dark. Label in `body-sm` Neutral 500. Subtle divider lines between columns on desktop.
- **Animation:** Numbers count up from 0 when the section scrolls into viewport (Intersection Observer + CSS counter or lightweight JS).

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01

---

### 2.3 How-It-Works Section

**Problem:** The current "So einfach geht's" section uses a basic 3-step layout that works but lacks visual engagement. Steps are text-heavy and there is no visual connector between them. (Audit ref: 1.1)

**Solution:** Replace with a connected visual step process.

- **Layout:** 3 steps in a horizontal row (desktop) or vertical stack (mobile).
- **Each step:**
  - Large circle (64px) with step number, filled with CTA Amber, white number.
  - Connecting line (dashed, 2px, Neutral 300) between circles on desktop. On mobile: vertical dashed line.
  - Icon above or inside the circle: Step 1 = Calendar icon, Step 2 = Car icon, Step 3 = CheckCircle icon.
  - `heading-3` title below the icon.
  - `body-sm` description (2-3 lines max).
- **Steps:**
  1. "Online buchen" -- "Wahlen Sie Ihren Service, Zeitfenster und Adresse. In nur 3 Minuten erledigt."
  2. "Wir kummern uns" -- "Unser Fahrer holt Ihr Auto ab und bringt es zur Partnerwerkstatt."
  3. "Fertig geliefert" -- "Ihr Auto wird repariert zuruck an Ihre Adresse geliefert. Alles zum Festpreis."
- **Animation:** Steps fade-in-up sequentially (staggered 200ms) on scroll.

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01

---

### 2.4 Service Showcase

**Problem:** Services are only visible once the user enters the booking flow. The landing page does not preview available services, which means users must start booking to learn what is offered. (Audit ref: 1.1)

**Solution:** Add an interactive service showcase section.

- **Layout:** Horizontal scrollable card row (mobile) or 2x2 grid (desktop).
- **Each service card:**
  - `card-interactive` variant, `radius-xl`.
  - Top section: Large icon (48px) in a tinted circle (e.g., Wrench icon in `info-light` circle for "Inspektion").
  - Service name in `heading-3`.
  - 2-line description in `body-sm`.
  - Price badge at bottom: "ab 149 EUR" in CTA Amber pill.
  - Hover: card lifts, icon color shifts from Neutral to Primary.
- **Services:** Inspektion, Olwechsel, Bremsen-Service, Reifenwechsel (with potential to expand).
- **CTA below grid:** "Alle Services ansehen" ghost link.

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 01

---

### 2.5 Modern Footer

**Problem:** The current footer is functional but basic. It has Quick Links, Rechtliches, and Kontakt columns but no social links, newsletter, or brand reinforcement. (Audit ref: 1.1)

**Solution:** Redesign the footer with four columns + bottom bar.

- **Background:** Primary Dark (`#0F172A`) with white/neutral-400 text.
- **Layout (4 columns on desktop, stacked on mobile):**
  1. **Brand:** Logo + one-line tagline + social icons row (LinkedIn, Instagram, Facebook -- icon-only, Neutral 400, hover: white).
  2. **Service:** Inspektion, Olwechsel, Bremsen-Service, Reifenwechsel, Alle Services (links).
  3. **Unternehmen:** Uber uns, Partnerwerkstatten, Karriere, Presse (links).
  4. **Rechtliches:** AGB, Datenschutz, Impressum, Cookie-Einstellungen (links).
- **Newsletter (optional, below columns):** Single-line email input + "Anmelden" button. "Erhalten Sie exklusive Angebote und Service-Tipps."
- **Bottom bar:** Divider line. Left: "(c) 2026 AutoConcierge. Alle Rechte vorbehalten." Right: Language switcher (DE / EN).

**Priority:** Low
**Complexity:** Small
**Mockup reference:** 01

---

## 3. Booking Flow Redesign

### 3.1 Visual Step Indicator

**Problem:** The current `StepIndicator.tsx` uses circles with numbers/checkmarks connected by flat bars. The bars are hidden on mobile (`hidden sm:block`), so mobile users see only floating circles. Step labels are `text-xs text-muted-foreground` -- hard to read. (Audit refs: L3, H5)

**Solution:** Replace with a connected progress bar with animated transitions.

- **Desktop layout:** Horizontal bar spanning full width. Each step is a node on the bar:
  - Completed: Filled circle (Success Green) + check icon + green bar segment.
  - Current: Filled circle (Primary Light) with pulse animation + bold label + partially filled bar (shows sub-progress).
  - Future: Outlined circle (Neutral 300) + gray bar segment.
- **Mobile layout:** Compact top bar showing "Schritt 2 von 4: Service" with a thin progress bar below (25% / 50% / 75% / 100% fill, animated width transition).
- **Labels:** `body-sm` weight-600 for current step, `caption` weight-400 for others. Labels always visible on desktop, only current step label on mobile.
- **Transition:** When advancing, the bar segment animates from left to right (300ms ease-out). The circle scales from 1.0 to 1.1 and back (200ms).

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 01

---

### 3.2 Vehicle Input with Smart Suggestions

**Problem:** The current vehicle form uses standard dropdowns for brand/model. Year uses a native number spinner (allows invalid values). Mileage has no formatting. The "Weiter" button floats outside the card on some viewports. (Audit refs: L1, M15, 1.2)

**Solution:** Replace with a visual brand selection and improved form layout.

- **Brand selection (Step 1a):** Grid of brand logo cards (3 columns mobile, 6 columns desktop). Each card shows the brand logo (already available in the dropdown) + brand name below. Clicking a brand card selects it with a Primary Light border + check overlay. A "Weitere Marken" expandable row at the bottom shows less common brands in a searchable dropdown.
- **Model selection (Step 1b):** After brand selection, show a searchable dropdown with model names grouped by category (e.g., "Limousine", "SUV", "Kombi"). Show the most popular models first.
- **Year input:** Replace number spinner with a dropdown containing years from 2000-2026 in descending order. Pre-select the most common year (2020).
- **Mileage input:** Formatted number input with thousands separator (e.g., "45.000"). Show unit label "km" as suffix inside the input.
- **Layout fix:** Place the "Weiter" button inside the card footer, full-width on mobile, right-aligned on desktop. Add a subtle sticky bottom bar on mobile that shows the "Weiter" button when the original is scrolled out of view.
- **Save vehicle:** Keep the "Fahrzeug fur zukunftige Buchungen speichern" checkbox but style it as a highlighted tip card: "Tipp: Fahrzeug speichern -- Beim nachsten Mal noch schneller buchen!"

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 01

---

### 3.3 Service Selection as Interactive Cards

**Problem:** Service cards are functional but basic. No tooltip or detail view explains what each service includes. Card heights vary because descriptions have different lengths. Only 4 services in a fixed 2x2 grid. (Audit refs: 1.3)

**Solution:** Redesign service cards with rich information and consistent heights.

- **Card layout:** Equal height cards in a responsive grid (1 col mobile, 2 col tablet, 3+ col desktop).
- **Each card:**
  - Top: Service icon (48px) in a tinted circle.
  - Title: `heading-3` (e.g., "Inspektion").
  - Description: 2-line `body-sm` description with a "Details" expandable that shows a bullet list of what is included.
  - Price: "ab 149 EUR" badge at bottom, always visible regardless of card height (use flexbox with `mt-auto`).
  - Selection state: Primary Light border (3px) + check icon overlay in top-right corner. Unselected: Neutral 200 border.
  - Multi-select hint: Small text above the grid: "Sie konnen mehrere Services wahlen" with a checkbox icon.
- **Detail flyout:** Clicking "Details" expands the card (or opens a bottom sheet on mobile) showing:
  - What is included (bullet list).
  - Estimated duration.
  - "Empfohlen alle X km/Monate" recommendation.
- **Price update:** As services are selected, a sticky bottom bar shows "X Services gewahlt -- Gesamtpreis ab Y EUR" with the "Weiter" button.

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 01

---

### 3.4 Modern Calendar/Date Picker

**Problem:** The current date input is a native browser date input, which looks inconsistent across platforms and feels imprecise for a premium service. Time slots are 2-hour intervals only. (Audit refs: H2, M4)

**Solution:** Custom calendar component (the project already has `components/ui/calendar.tsx` from shadcn) with integrated time selection.

- **Calendar widget:** Inline calendar (not a popover) displayed within the card. Shows current + next month side-by-side on desktop, single month on mobile. Unavailable dates grayed out. Selected date highlighted in CTA Amber circle.
- **Time slot selection:** Below the calendar, show available time slots as pill buttons:
  - 30-minute intervals from 08:00 to 18:00.
  - Show only available slots (gray out booked slots).
  - Selected slot: CTA Amber background.
  - Group visually: "Vormittag" (08:00-12:00) and "Nachmittag" (12:00-18:00) with section headers.
- **Address input:** Add Google Places autocomplete (or Mapbox) for the address field. As the user types, show suggestions in a dropdown. Show a small static map preview after address selection confirming the location.
- **Return scheduling:** Default to "Gleiche Adresse" (pre-checked toggle). Show estimated return date based on the service type (e.g., "Voraussichtlich: Mi, 12.02.2026"). Allow the customer to override the return time with the same time slot picker.
- **Validation:** Inline real-time validation. If return date is before pickup + minimum service duration, show an Error-styled helper text immediately (not after submit). (Audit ref: 1.4)

**Priority:** High
**Complexity:** Large
**Mockup reference:** 01

---

### 3.5 Summary with Clear Breakdown

**Problem:** The confirmation page shows a booking summary but the price is just a single number. The vehicle brand is lowercase ("bmw"). The AGB checkbox is not linked to actual documents. The Stripe placeholder blocks real payments. (Audit refs: C1, H9, M1, M2)

**Solution:** Redesign the confirmation step as a clear order summary with a proper payment section.

- **Summary card:**
  - Section 1: "Ihr Fahrzeug" -- Brand (properly capitalized, e.g., "BMW 3er"), year, mileage. Small edit link to go back to step 1.
  - Section 2: "Gewahlte Services" -- List of selected services with individual prices. Each line: service icon + name + price.
  - Section 3: "Termine" -- Pickup date/time + address, Return date/time + address. Small map thumbnail.
  - Section 4: "Concierge-Service" -- "Inklusive" badge, "Abholung & Ruckgabe durch unseren Fahrer".
  - Divider line.
  - "Zwischensumme: X EUR", "Concierge-Service: 0 EUR (inklusive)", bold "Gesamtpreis: X EUR".
- **Contact data:** Pre-filled from auth state (if logged in). For guest users: minimal inline form (Vorname, Nachname, Email, Telefon) with a note "Sie konnen nach der Buchung ein Konto erstellen."
- **AGB:** Checkbox with linked text: "Ich akzeptiere die [AGB](/terms) und [Datenschutzbestimmungen](/privacy)" -- both open in new tab.
- **Payment section:**
  - When Stripe is configured: Stripe Elements embed (card input, SEPA debit tab).
  - When in Demo mode: Replace the raw technical form with a styled demo card: Credit card visual mock-up showing "4242 **** **** 4242", "Demo Karte" label, and the "Jetzt bezahlen" button in CTA Amber. No technical IDs, no English text.
  - The "Jetzt buchen" button should be disabled until AGB is checked and payment is valid.

**Priority:** Critical
**Complexity:** Large
**Mockup reference:** 01

---

### 3.6 Inline Registration

**Problem:** The post-booking registration page (Screenshot 018) feels like a separate, heavy form. It is conceptually overloaded -- the user just finished a complex booking and now faces another 6 fields. (Audit refs: 1.6, 6.1)

**Solution:** Simplify post-booking registration to a lightweight inline step.

- **After booking confirmation:** Show a success page with:
  - Large green checkmark animation.
  - Booking number prominently displayed.
  - "Nachste Schritte" timeline (3 items: "Bestatigung per E-Mail", "Fahrer wird zugewiesen", "Abholung am [Datum]").
- **Registration prompt (inline, not a new page):**
  - Collapsible card below the success info, expanded by default.
  - Title: "Konto erstellen und Status verfolgen".
  - Only 2 fields: Password + Password confirmation (email already captured during booking).
  - One-click option: "Mit Google anmelden" / "Mit Apple anmelden" (if available).
  - Skip link: "Spater registrieren" that collapses the card and shows a toast "Sie erhalten eine E-Mail mit dem Registrierungslink."
- **Benefit list (next to form):** 3 bullet points with green checks: "Echtzeit Status-Updates", "Schnellere zukunftige Buchungen", "Alle Rechnungen an einem Ort".

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 01

---

## 4. Customer Portal Redesign

### 4.1 Dashboard: Hero Booking Card with Live Status

**Problem:** The dashboard shows stat cards (Aktive Buchungen, Fahrzeuge, Letzte Buchung) that are not clickable. The booking list uses small progress bar labels. The welcome message falls back to "Kunde" which feels impersonal. No mobile navigation exists (sidebar is hidden on mobile with no hamburger menu). (Audit refs: H1, M9, L4, 2.1)

**Solution:** Redesign the dashboard with a hero booking card and proper mobile navigation.

- **Mobile navigation:** Replace the hidden sidebar with a fixed bottom navigation bar (5 items):
  - Dashboard (Home icon)
  - Buchungen (ClipboardList icon)
  - Neue Buchung (Plus icon, centered, CTA Amber accent circle)
  - Fahrzeuge (Car icon)
  - Profil (User icon)

  Active state: CTA Amber icon + label. Inactive: Neutral 400 icon, Neutral 500 label.

- **Welcome section:** "Hallo, [Vorname]!" in `heading-1`. If no first name, just "Willkommen zuruck!" (no "Kunde" fallback). Below: `body-sm` showing today's date.

- **Hero booking card (if active booking exists):**
  - Full-width `card-highlight` with Primary Blue left border.
  - Top: Booking number + status badge.
  - Center: Visual progress timeline (horizontal on desktop, vertical on mobile):
    - 5 nodes: Gebucht > Abholung > Werkstatt > Ruckgabe > Fertig.
    - Completed nodes: Filled Success Green circle + check icon + green connecting line.
    - Current node: Pulsing Primary Blue circle + bold label + "Aktuell" badge.
    - Future nodes: Outlined Neutral 300 circles + gray connecting line.
    - Below each node: timestamp of when that stage was reached (if available).
  - Bottom: Vehicle info (BMW 3er, 2021) + next action hint ("Ihr Fahrzeug wird morgen um 10:00 abgeholt").
  - Click anywhere on the card to navigate to booking details.

- **Stat cards (below hero, 3 columns):** Make each card clickable:
  - "Aktive Buchungen: 1" -- links to `/customer/bookings?status=active`.
  - "Fahrzeuge: 1" -- links to `/customer/vehicles`.
  - "Nachster Termin: Mo, 09.02." -- links to the specific booking.

  Stat number: `heading-1` in Primary Light. Label: `body-sm` Neutral 500.

- **Recent bookings list (below stats):** Show the 3 most recent bookings as `card-interactive` items. Each shows: booking ID, vehicle, service, status badge, date. "Alle Buchungen anzeigen" link at bottom.

**Priority:** Critical (mobile navigation)
**Complexity:** Large
**Mockup reference:** 02

---

### 4.2 Booking Detail: Tabbed with Details/Extensions/Timeline

**Problem:** Booking details show "INSPECTION" (English uppercase) instead of "Inspektion". Price discrepancy (149 vs 250 EUR) is unexplained. Return address is not shown. (Audit refs: C3, M1, 2.2)

**Solution:** Redesign booking detail page with a tabbed interface and enriched information.

- **Header:** Back arrow + "Buchung #BK26020001" + status badge (large, prominent). Edit link if booking is still in "Gebucht" status.

- **Tabs:** Three tabs with badge counts where applicable:
  1. **Details** -- Vehicle info, services, addresses, pricing breakdown.
  2. **Erweiterungen** (badge: count of pending extensions) -- Extension list with approval actions.
  3. **Verlauf** -- Chronological timeline of all status changes with timestamps.

- **Details tab:**
  - Vehicle card: Brand (capitalized), model, year, mileage, license plate (if available). Small car icon.
  - Services card: List of services with translated names (fix the INSPECTION enum rendering). Each service: icon + name + individual price.
  - Addresses card: Side-by-side (desktop) or stacked (mobile). Pickup: full address + date + time + map thumbnail. Return: full address + date + time + map thumbnail (show same address with "(gleiche Adresse)" note if applicable).
  - Pricing breakdown card:
    - Line items for each service with price.
    - "Concierge-Service: 0 EUR (inklusive)".
    - If extension was approved: "Erweiterung: +X EUR" line.
    - Bold total at bottom.
    - If price changed from original quote: Show original quote crossed out + new total with explanatory note ("Preis aktualisiert durch Werkstatt-Erweiterung").

- **Verlauf (Timeline) tab:**
  - Vertical timeline with nodes on the left and descriptions on the right.
  - Each node: timestamp + status label + optional description.
  - Example: "09.02.2026 10:15 -- Abholung gestartet: Fahrer Max ist unterwegs zu Ihnen."
  - Green filled nodes for past events, blue pulsing for current, gray outlined for future estimated steps.

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 02

---

### 4.3 Extension Approval: Prominent Notification + Streamlined Flow

**Problem:** Reaching the extension review requires 3 clicks from the dashboard alert. The payment modal in demo mode shows English text, technical IDs, and "Demo Payment (Simulated)". CTA colors are inconsistent between the tab view (orange) and modal (blue). (Audit refs: C2, H7, 6.3)

**Solution:** Reduce the extension approval to a 1-click flow from the dashboard and redesign the payment experience.

- **Dashboard alert (when extension pending):**
  - Full-width banner at the top of the dashboard (above the hero booking card).
  - Amber Warning background (`#FEF3C7`) with amber left border (4px).
  - Left: AlertTriangle icon. Center: "Neue Erweiterung fur Buchung #BK26020001 -- 280,50 EUR". Right: "Jetzt prufen" button (CTA Amber).
  - Clicking "Jetzt prufen" navigates directly to the booking detail page with the Extensions tab open AND the review modal auto-opened. One click, not three.

- **Extension review modal redesign:**
  - Keep the current structure (items list, images, total) but ensure:
    - All text is in the session language (German or English).
    - No technical IDs visible (remove Extension ID from the UI entirely).
    - Consistent CTA color: "Genehmigen & Bezahlen" always uses CTA Amber (#F59E0B).
    - "Ablehnen" uses the destructive variant (Error Light bg, Error text).
  - Add a "Was passiert als Nachstes?" section below the items:
    - If approved: "Die Werkstatt fuhrt die zusatzlichen Arbeiten sofort aus. Die Kosten werden Ihrer Gesamtrechnung hinzugefugt."
    - If declined: "Die Werkstatt wird informiert und setzt die ursprunglichen Arbeiten fort. Sie konnen spater erneut anfragen."

- **Demo payment form redesign:**
  - Replace the current English-only `DemoPaymentForm` with a localized version.
  - Remove: "DEMO MODE" banner, "Payment Method: Demo Payment (Simulated)", raw Extension/Booking IDs, "Pay with Demo" button text.
  - Replace with: A styled card showing a mock credit card visual (like Stripe Elements but static). Label: "Demo-Zahlungsmethode". Button: "Jetzt bezahlen -- 280,50 EUR" in CTA Amber. Small gray note: "Demo-Modus: Es wird keine echte Zahlung durchgefuhrt."
  - Success state: Green checkmark animation + "Zahlung erfolgreich!" (in German) + "Erweiterung genehmigt" status update.

**Priority:** Critical
**Complexity:** Medium
**Mockup reference:** 02

---

### 4.4 Past Bookings: Clean Card Grid

**Problem:** The current bookings list works but completed assignments sit alongside active ones with minimal visual differentiation. No invoice download or rating prompt exists for completed bookings. (Audit refs: M10, M11, 6.5)

**Solution:** Redesign the bookings page with clear status separation and post-service actions.

- **Tab filter:** "Aktiv" (default) / "Abgeschlossen" / "Storniert" tabs at the top. Badge counts on each.
- **Active bookings:** `card-highlight` with blue left border. Show progress timeline inline. Primary action: "Details ansehen".
- **Completed bookings:** `card-default` with green success check icon. Show completion date, total cost, services performed. Two actions:
  - "Rechnung herunterladen" (PDF icon) -- generates/downloads invoice.
  - "Bewerten" (Star icon) -- opens the `RatingModal` (already exists in codebase at `components/customer/RatingModal.tsx`).
  - "Erneut buchen" (Repeat icon) -- pre-fills a new booking with the same vehicle and service.
- **Card layout (completed):** Grid layout (1 col mobile, 2 col desktop). Each card: vehicle thumbnail/icon, service name, completion date, total price, action buttons row at bottom.
- **Empty state (no bookings):** Illustration of a car + "Noch keine Buchungen" + "Buchen Sie jetzt Ihren ersten Service" CTA button.

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 02

---

### 4.5 Notification Center

**Problem:** No push notification or email notification is visible when an extension arrives. Customers only see pending extensions when they check the dashboard. (Audit ref: 6.3)

**Solution:** Enhance the existing `NotificationCenter` component with better visibility.

- **Bell icon in header:** Show a red dot badge with unread count (already partially implemented).
- **Notification dropdown:** Click the bell to open a dropdown panel (not a new page):
  - List of notifications sorted by recency.
  - Each notification: icon (type-specific) + title + time ago + unread dot.
  - Types: Extension pending (amber), status update (blue), booking confirmed (green), payment received (green).
  - Click a notification to navigate to the relevant page (e.g., click extension notification goes to booking detail with Extensions tab).
  - "Alle als gelesen markieren" link at top.
- **Future: Push notifications (browser):** The `notification-permission.tsx` component already exists. Show a one-time prompt after first booking: "Mochten Sie Benachrichtigungen erhalten, wenn sich der Status Ihrer Buchung andert?"

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 02

---

## 5. Jockey Portal Redesign (Mobile-First)

### 5.1 Card-Based Assignment Dashboard

**Problem:** Assignment cards look nearly identical across states (Bevorstehend, Unterwegs, Angekommen, Abgeschlossen). Completed assignments clutter the active list. No map view exists for route planning. No ETA or distance information. (Audit refs: H3, H8, M6, L10, 3.2)

**Solution:** Redesign the jockey dashboard as a mobile-first, card-based interface with dramatic state differentiation.

- **Top bar:** Green header with jockey name, today's date, notification bell, language switcher.
- **Stat strip (horizontal scroll on mobile):**
  - "Heute: 3 Fahrten" (large number)
  - "Abgeschlossen: 1" (green)
  - "Nachste: 10:00 Uhr" (blue, countdown if < 1 hour)
- **View toggle:** "Liste" / "Karte" toggle at top of assignments section.
- **List view -- state-differentiated cards:**

  | State | Card Style | Accent | Key Visual Element |
  |-------|-----------|--------|-------------------|
  | Bevorstehend | `card-default`, compact | Neutral 200 border | Clock icon + countdown ("in 45 Min") |
  | Unterwegs | `card-highlight` with blue left border, expanded | Blue gradient top | Pulsing blue dot + "Unterwegs..." animated text |
  | Angekommen | `card-highlight` with amber left border, expanded | Amber gradient top | MapPinCheck icon + "Angekommen" flash |
  | Abgeschlossen | `card-default`, collapsed to single row | Green left border | Green check + one-line summary |

- **Active card (Unterwegs/Angekommen) -- expanded layout:**
  - Top: Status badge (large, colored) + assignment type badge ("Abholung" / "Ruckgabe").
  - Customer: Name + phone (tap-to-call button, 48px height).
  - Vehicle: Brand + Model + license plate.
  - Address: Full address + "Navigieren" button (48px height, green, tap-to-open Maps).
  - Action area: LARGE button (56px height, full-width) for the next status transition:
    - "Fahrt starten" (blue) / "Angekommen" (amber) / "Ubergabe abschliessen" (green).
  - ETA display (if available): "Geschatzt: 15 Min / 8,3 km" below the address.

- **Completed cards -- collapsed:**
  - Single row: Type icon + "Abholung Max Mustermann" + green check + time completed.
  - Expandable: tap to show full details.
  - Visually pushed below active cards with a "Erledigt" section header.

- **Date grouping:** Cards grouped under "Heute", "Morgen", "Spater" section headers.

**Priority:** High
**Complexity:** Large
**Mockup reference:** 03

---

### 5.2 One-Tap Status Advancement

**Problem:** Status transitions require finding and clicking a small text link at the bottom of the card. This is dangerous for a jockey who may be on a phone while pulled over. The "Ubergabe dokumentieren" action is also too small. (Audit refs: H3, 6.4)

**Solution:** Replace text links with large, prominent buttons and add confirmation for critical transitions.

- **Button placement:** Always at the bottom of the active card, full-width, 56px height, bold text + icon.
- **Button colors by action:**
  - "Fahrt starten": Primary Blue. After tap: "Wirklich starten?" confirmation overlay (2 buttons: "Ja, starten" + "Abbrechen").
  - "Angekommen": CTA Amber. Tap: immediate transition (no confirmation needed, low risk).
  - "Ubergabe abschliessen": Success Green. Tap: opens handover documentation modal (see 5.3).
- **Swipe gesture (optional enhancement):** Allow swiping the card right to advance status. Show a green arrow indicator during swipe. Requires 60%+ swipe distance to trigger.
- **Undo:** After status advancement, show a toast notification: "Status aktualisiert: Unterwegs" with an "Ruckgangig" undo button (5 second window).

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 03

---

### 5.3 Tap-to-Call, Tap-to-Navigate

**Problem:** The "Anrufen" button exists but the "Navigation starten" button does not deep-link properly on all platforms. (Audit ref: 3.2)

**Solution:** Ensure all contact/navigation actions use native deep links.

- **Phone button:** `tel:` link. Icon: Phone. Label: "Anrufen". 48px height. Show customer name inline: "Max Mustermann anrufen".
- **Navigate button:** Opens native maps app using `https://maps.google.com/?daddr=[address]` (or `maps://` on iOS). Icon: Navigation. Label: "Dorthin navigieren". 48px height, Success Green.
- **Placement:** Both buttons side-by-side below the address on the active assignment card. Phone: outline style (secondary). Navigate: filled Success Green (primary).

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 03

---

### 5.4 Photo Documentation Concept

**Problem:** The "Ubergabe dokumentieren" step (with Camera icon) suggests photo documentation, but the handover modal is not fully visible in the walkthrough. This critical step should be a prominent experience. (Audit ref: 6.4)

**Solution:** Design a dedicated handover documentation flow.

- **Trigger:** Tapping "Ubergabe abschliessen" on the active card opens the `HandoverModal` (already exists at `components/jockey/HandoverModal.tsx`).
- **Modal layout (full-screen on mobile):**
  - Step 1: "Fahrzeugzustand dokumentieren"
    - Camera button (large, 80px, centered) to take a photo.
    - Grid of required shots: "Front", "Seite links", "Seite rechts", "Heck", "Innenraum", "Kilometerstand".
    - Each slot: camera icon placeholder. After photo: thumbnail with green check overlay.
    - Minimum 2 photos required to proceed. Counter: "3 von 6 Fotos aufgenommen".
  - Step 2: "Anmerkungen" (optional)
    - Text area for notes: "Sichtbare Schaden, Besonderheiten, Hinweise..."
  - Step 3: "Bestatigen"
    - Summary: photo thumbnails grid + notes preview + customer name + vehicle.
    - "Ubergabe abschliessen" button (Success Green, full-width, 56px).
- **The jockey-photo-upload component** (`components/jockey/jockey-photo-upload.tsx`) already exists -- enhance it with the structured shot grid above.

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 03

---

### 5.5 Route Overview Concept

**Problem:** There is no map view for the jockey to see assignments geographically. With multiple daily assignments, a list view is insufficient for route planning. (Audit ref: H8)

**Solution:** Add a map view toggle to the jockey dashboard.

- **Map view:** Full-screen map (using Leaflet/Mapbox/Google Maps) showing:
  - Jockey's current location (blue pulsing dot).
  - Assignment pins: blue for upcoming, amber for current (larger pin), green for completed.
  - Pin labels: Customer name + time.
  - Tap a pin to show a mini-card overlay with assignment details + "Navigieren" / "Details" buttons.
  - Suggested route line connecting assignments in chronological order (dashed line).
- **Toggle:** "Liste" / "Karte" segmented control at the top. Remembers last selection.
- **Map + list hybrid (tablet/desktop):** Split view -- map on the left (60%), assignment list on the right (40%). Hovering a list card highlights the corresponding map pin.

**Priority:** High
**Complexity:** Large
**Mockup reference:** 03

---

## 6. Workshop Portal Redesign

### 6.1 Kanban Board Layout

**Problem:** The workshop dashboard uses a table layout that is not responsive on mobile/tablet. Status badges use different terminology than the customer portal. The "Details" action is an eye icon that is easy to miss. (Audit refs: H6, M12, 4.2)

**Solution:** Replace the table with a Kanban board layout that provides visual status overview.

- **Layout:** Three columns (scrollable horizontally on mobile):
  1. **Neu** (Eingegangen) -- Blue header strip.
  2. **In Bearbeitung** -- Amber header strip.
  3. **Erledigt** -- Green header strip.

- **Column header:** Color strip + column title + count badge (e.g., "Neu (2)").

- **Order cards within columns:**
  - `card-default` with `radius-lg`.
  - Top: Booking ID + date.
  - Middle: Customer name + vehicle (bold) + service type.
  - Bottom: Action button:
    - Neu: "Arbeit beginnen" (Primary Blue button).
    - In Bearbeitung: "Als erledigt markieren" (Success Green button) + "+ Erweiterung" (CTA Amber outline button).
    - Erledigt: "Details ansehen" (ghost link).
  - Click anywhere on card (except buttons): Opens detail modal.

- **Responsive fallback (mobile):**
  - On screens < 768px, switch from horizontal Kanban to a vertical tabbed view.
  - Three tabs at top: "Neu" / "In Bearbeitung" / "Erledigt".
  - Cards stack vertically within each tab.

- **Drag-and-drop (desktop, optional):** Allow dragging cards between columns to advance status. Show drop zone highlight. Confirmation modal on drop: "Auftrag #BK123 auf 'In Bearbeitung' setzen?"

**Priority:** High
**Complexity:** Large
**Mockup reference:** 03

---

### 6.2 Quick Status Advancement

**Problem:** Status transitions are not clearly visible. The transition from "Eingegangen" to "In Bearbeitung" is not shown with a clear button. (Audit ref: 6.2)

**Solution:** Each order card has a single primary action button that advances to the next status.

- **State machine buttons:**
  | Current Status | Button Label | Button Color | Confirmation |
  |---------------|-------------|-------------|--------------|
  | Eingegangen | "Arbeit beginnen" | Primary Blue | Yes: "Auftrag annehmen und Arbeit starten?" |
  | In Bearbeitung | "Arbeit abgeschlossen" | Success Green | Yes: "Auftrag als erledigt markieren?" |

- **Button placement:** Bottom of each Kanban card, full-width, `md` size.
- **After clicking:** Brief loading spinner, then card animates from current column to next column (slide + fade).
- **Toast feedback:** "Auftrag #BK123: Arbeit gestartet" with undo option (5 seconds).

**Priority:** High
**Complexity:** Small
**Mockup reference:** 03

---

### 6.3 Extension Creation Streamlined

**Problem:** The extension modal requires manual price entry with period decimal separators (should be comma for German). No preview step before sending. No visibility into whether the customer has seen the extension. (Audit refs: M7, M8, M14, 4.4)

**Solution:** Redesign the extension creation flow.

- **Modal layout:**
  - Header: "Erweiterung fur Auftrag #BK123 -- Max Mustermann".
  - Position input rows: Each row has:
    - Description (text input, single line).
    - Price (formatted currency input with comma separator, EUR suffix label).
    - Delete button (trash icon).
  - "+ Weitere Position hinzufugen" button.
  - Photo upload section: Grid of upload slots (use existing `workshop-photo-upload.tsx`). Label: "Fotos als Nachweis (empfohlen)".
  - Running total: "Gesamtpreis: 280,50 EUR" -- updates live.
  - **Preview step (new):** Button: "Vorschau anzeigen" instead of direct "Senden".
    - Preview shows the extension exactly as the customer will see it.
    - Two buttons: "Zuruck bearbeiten" / "An Kunden senden".
  - **Quick templates (new):** Dropdown at top: "Vorlage verwenden" with common extensions:
    - "Bremsscheiben ersetzen" -- 185,50 EUR
    - "Olfilter zusatzlich" -- 45,00 EUR
    - "Scheibenwischer ersetzen" -- 35,00 EUR
    - Selecting a template pre-fills the description and price.

- **After sending -- status tracking:**
  - Extension card on the order shows: "Gesendet" (gray) > "Vom Kunden gesehen" (blue) > "Genehmigt" (green) / "Abgelehnt" (red).
  - "Vom Kunden gesehen" state triggers when the customer opens the booking detail (requires a backend "viewed" event).
  - Show timestamp for each state change.

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 03

---

### 6.4 Stats Bar at Top

**Problem:** The stat cards show inconsistent counts compared to the table (e.g., "1 Auftrage heute" but 2 rows visible). The stats are not actionable. (Audit ref: 4.2)

**Solution:** Replace stat cards with a compact stats bar.

- **Layout:** Horizontal bar at the top of the dashboard (below the navigation), full-width.
- **Stats (4 items, equal width):**
  - "Heute: 3" (total orders for today, clickable: filters to today's orders)
  - "Neu: 1" (Eingegangen count, blue number, clickable: scrolls to Neu column)
  - "In Arbeit: 1" (In Bearbeitung count, amber number, clickable: scrolls to In Bearbeitung column)
  - "Erledigt: 1" (Abgeschlossen count, green number, clickable: scrolls to Erledigt column)
- **Styling:** White background, `elevation-low`, `radius-md`. Each stat: large number in `heading-2` (colored) + label in `caption` Neutral 500.
- **Fix counting:** Ensure "Heute" counts all orders with any activity today (new + in progress + completed today), not just new ones.

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 03

---

### 6.5 Responsive Table to Card Fallback

**Problem:** The current 6-column table is not responsive. (Audit ref: H6)

**Solution:** This is addressed by the Kanban redesign (6.1). On mobile, the Kanban columns become tabs with card-based content. This eliminates the table entirely in favor of a universally responsive card layout.

For any remaining list views (e.g., search results, filtered views), implement a responsive pattern:
- Desktop (>= 1024px): Table view with sortable columns.
- Tablet (768-1023px): Condensed table (hide less important columns, show tooltip on truncated text).
- Mobile (< 768px): Card list. Each card shows the most important info (booking ID, customer, vehicle, status, primary action). Tap to expand for full details.

**Priority:** High (already addressed by 6.1)
**Complexity:** Included in 6.1
**Mockup reference:** 03

---

## 7. Extension Approval Flow Redesign

### 7.1 Push Notification Concept

**Problem:** Customers only discover pending extensions when they open the dashboard. There is no proactive notification. (Audit ref: 6.3)

**Solution:** Multi-channel notification when an extension is created.

- **Email notification:** Immediate email with subject: "Neue Erweiterung fur Ihre Buchung #BK123".
  - Body: Workshop name, extension description, item list with prices, total amount.
  - CTA button: "Erweiterung prufen" -- deep link to `/customer/bookings/[id]?tab=extensions&modal=review`.
  - Note: "Bitte antworten Sie innerhalb von 48 Stunden."

- **Browser push notification (if permitted):**
  - Title: "Neue Erweiterung: 280,50 EUR"
  - Body: "Die Werkstatt empfiehlt zusatzliche Arbeiten fur Ihre Buchung."
  - Click: Deep link to the extension review.

- **In-app notification:** Red dot on bell icon + notification in the dropdown (as described in 4.5).

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 02

---

### 7.2 Prominent Dashboard Alert

**Problem:** The alert exists but requires 3 clicks to reach the review. (Audit ref: 6.3)

**Solution:** (Covered in detail in section 4.3.) Summary: Full-width amber banner with direct "Jetzt prufen" button that deep-links to the extension review modal in one click.

**Priority:** Critical
**Complexity:** Small (routing change only)
**Mockup reference:** 02

---

### 7.3 One-Step Approve + Pay

**Problem:** The approval flow currently has separate review and payment steps in the modal. The demo payment form is in English and shows technical details. (Audit refs: C2, 6.3)

**Solution:** Combine review and payment into a single scrollable view.

- **Single-view modal:**
  - Top section: Extension description + item list with prices (review content).
  - Middle section: Payment form (Stripe Elements or redesigned demo form) inline, not a separate step.
  - Bottom: Total amount (large, prominent) + "Genehmigen & Bezahlen: 280,50 EUR" button (CTA Amber, full-width, 56px).
  - Below button: AGB note + security lock icon + "Ihre Zahlung ist sicher verschlusselt."

- **Alternative: Two-button approach for cautious users:**
  - "Details anzeigen" (expands item list, collapsed by default if items are clear).
  - "Genehmigen & Bezahlen" button always visible.
  - The less the user has to think, the faster the conversion.

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 02

---

### 7.4 Clear Pricing Breakdown

**Problem:** Price discrepancies between the original booking (149 EUR) and the detail view (250 EUR) are unexplained. Extension prices are shown but not contextualized within the total. (Audit ref: M1)

**Solution:** Always show a complete pricing history.

- **In booking details:**
  - Original service price: "Inspektion: 149,00 EUR" (with "Ursprunglicher Preis" label).
  - Extension (if approved): "+ Bremsscheiben: 185,50 EUR" and "+ Olfilter: 95,00 EUR".
  - Concierge-Service: "0,00 EUR (inklusive)".
  - Divider.
  - "Gesamtpreis: 429,50 EUR".
  - If price was updated by the workshop (not via extension): Show "Werkstatt-Aktualisierung: 250,00 EUR" with a note explaining why (e.g., "Der endgultige Preis wurde nach Inspektion des Fahrzeugs aktualisiert").

- **In extension review modal:** Show context:
  - "Ihr aktueller Buchungspreis: 149,00 EUR".
  - "Vorgeschlagene Erweiterung: +280,50 EUR".
  - "Neuer Gesamtpreis: 429,50 EUR".

**Priority:** High
**Complexity:** Small
**Mockup reference:** 02

---

## 8. Cross-cutting Improvements

### 8.1 Skeleton Loading States

**Problem:** Content appears instantly with no visual choreography. No skeleton screens are used during data loading. (Audit refs: L5, H5, 5.3)

**Solution:** Add skeleton loading placeholders for all data-dependent sections.

- **Pattern:** Use animated pulse placeholders (gray rounded rectangles) that match the shape and size of the content they replace.
- **Implementation per portal:**
  - Customer dashboard: 3 skeleton stat cards + 2 skeleton booking cards.
  - Booking detail: Skeleton header + skeleton tabs + skeleton content area.
  - Jockey dashboard: 3 skeleton stat numbers + 2 skeleton assignment cards.
  - Workshop dashboard: Skeleton stats bar + 3 skeleton Kanban columns with 1 skeleton card each.
  - Landing page: No skeleton needed (static content, already loaded).
- **Duration:** Show skeleton for minimum 200ms (prevent flash) and maximum until data loads.
- **Transition:** Skeleton fades out (opacity 1 to 0, 200ms) as real content fades in (opacity 0 to 1, 300ms).

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 02, 03

---

### 8.2 Page Transitions/Animations

**Problem:** Portal pages have no entrance animations. Dashboard content appears instantly. Booking step transitions have no animation. (Audit refs: 5.4, L3)

**Solution:** Add subtle page and component entrance animations.

- **Page transitions (between routes):**
  - Fade transition: outgoing page fades to 0 (150ms), incoming page fades from 0 (200ms).
  - Use `next-view-transitions` or CSS-only approach with a wrapper component.

- **Component entrance animations:**
  - Cards: Staggered `fadeInUp` (existing animation in globals.css). First card at 0ms, each subsequent card +100ms delay.
  - Stat numbers: Count-up animation from 0 to value (500ms, ease-out).
  - Progress bars: Width animates from 0% to target percentage (600ms, ease-out).
  - Status badges: Scale from 0.8 to 1.0 (200ms) on state change.

- **Booking step transitions:**
  - Forward: Current step slides out left (200ms) while new step slides in from right (200ms).
  - Backward: Current step slides out right while previous step slides in from left.
  - Step indicator bar: Animated width growth (300ms) when advancing.

- **Reduced motion:** Respect `prefers-reduced-motion` media query. When enabled: disable all animations, use instant transitions.

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 01, 02, 03

---

### 8.3 Empty States with Illustrations

**Problem:** No designed empty states exist for when jockeys have zero assignments, customers have no bookings, or workshops have no orders. (Audit ref: 5.3)

**Solution:** Design meaningful empty states for every list/collection view.

- **Pattern:** Centered content with illustration + headline + description + CTA.

| View | Illustration | Headline | Description | CTA |
|------|-------------|----------|-------------|-----|
| Customer: No bookings | Car with sparkles | "Noch keine Buchungen" | "Buchen Sie Ihren ersten Auto-Service und wir kummern uns um den Rest." | "Service buchen" (CTA Amber) |
| Customer: No vehicles | Car outline | "Keine Fahrzeuge gespeichert" | "Fugen Sie Ihr Fahrzeug hinzu, um schneller buchen zu konnen." | "Fahrzeug hinzufugen" |
| Jockey: No assignments | Road illustration | "Keine Fahrten heute" | "Aktuell sind keine Aufgaben zugewiesen. Geniesssen Sie die Pause!" | "Verfugbarkeit andern" (link) |
| Workshop: No orders | Wrench + checkmark | "Keine offenen Auftrage" | "Alle Auftrage sind erledigt. Neue Auftrage erscheinen hier automatisch." | -- (no action needed) |
| Search: No results | Magnifying glass | "Keine Ergebnisse" | "Versuchen Sie andere Suchbegriffe oder entfernen Sie Filter." | "Filter zurucksetzen" |

- **Illustration style:** Simple line illustrations in Neutral 300/400 colors. Maximum 200x200px SVG.

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 02, 03

---

### 8.4 Error States with Recovery Actions

**Problem:** No error states are designed for the booking flow (validation failure, payment failure, service unavailability). No offline handling for the jockey portal. (Audit refs: H4, 5.3)

**Solution:** Design error states for every failure scenario.

- **Form validation errors:**
  - Inline errors below each field in Error color (`#EF4444`).
  - Error summary at the top of the form if multiple errors: Red banner listing all issues.
  - Fields with errors get a red border (2px) and subtle red background tint.

- **Payment failure:**
  - Replace the payment section with an error card: Red border, Error icon, "Zahlung fehlgeschlagen" headline, specific error message (e.g., "Ihre Karte wurde abgelehnt"), "Erneut versuchen" button + "Andere Zahlungsmethode" link.

- **Network/API errors:**
  - Full-page error state: Error illustration + "Etwas ist schiefgelaufen" + "Bitte versuchen Sie es erneut" + "Seite neu laden" button.
  - Inline API errors (e.g., booking submission failure): Toast notification with Error variant + "Erneut versuchen" action in the toast.

- **Jockey offline handling:**
  - When connection is lost: Show a persistent amber banner at the top: "Keine Internetverbindung. Statusanderungen werden gespeichert und automatisch ubertragen."
  - Queue status updates in localStorage. When connection is restored, submit queued updates and show success toast.

- **Service unavailability:**
  - If a selected service is not available in the user's area: Disable the service card, show "Nicht verfugbar in Ihrer Region" overlay, suggest alternative services.

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 01, 02, 03

---

### 8.5 Toast Notification Redesign

**Problem:** Toast notifications exist (using Sonner) but their styling is not explicitly aligned with the design system. Success/error toasts should use semantic colors consistently. (Audit ref: 5.1)

**Solution:** Configure Sonner toast styling to match the design system.

- **Success toast:** Left border: 4px Success Green. Icon: CheckCircle in Success Green. Background: Success Light (#D1FAE5). Text: Neutral 800.
- **Error toast:** Left border: 4px Error Red. Icon: AlertTriangle in Error Red. Background: Error Light (#FEE2E2). Text: Neutral 800.
- **Warning toast:** Left border: 4px Warning Amber. Icon: AlertTriangle in Warning Amber. Background: Warning Light (#FEF3C7). Text: Neutral 800.
- **Info toast:** Left border: 4px Info Sky. Icon: Info in Info Sky. Background: Info Light (#E0F2FE). Text: Neutral 800.
- **Positioning:** Top-right on desktop, top-center on mobile (full-width, no margin).
- **Duration:** 4 seconds default. Error toasts: 6 seconds (more time to read). With "Ruckgangig" action: 5 seconds.
- **Animation:** Slide in from right on desktop, slide down from top on mobile.

**Priority:** Low
**Complexity:** Small
**Mockup reference:** 01, 02, 03

---

### 8.6 Consistent Bottom Navigation for Mobile

**Problem:** Three different navigation patterns across portals. Customer portal has a hidden sidebar with no mobile alternative. Jockey portal uses a top bar with inline buttons. Workshop portal uses a top horizontal nav. (Audit refs: H1, M12, 5.1)

**Solution:** Implement consistent mobile navigation across all portals.

- **Customer portal (mobile):** Fixed bottom navigation bar (described in 4.1). 5 items: Dashboard, Buchungen, + Neue Buchung, Fahrzeuge, Profil.

- **Jockey portal (mobile):** Fixed bottom navigation bar. 4 items:
  - Aufgaben (ClipboardList icon) -- main assignment list/map
  - Statistiken (BarChart3 icon) -- earnings stats
  - Verfugbarkeit (CalendarDays icon) -- availability management
  - Profil (User icon) -- profile + settings + logout

- **Workshop portal (mobile):** Fixed bottom navigation bar. 4 items:
  - Auftrage (ClipboardList icon) -- Kanban dashboard
  - Kalender (CalendarDays icon) -- calendar view
  - Statistiken (BarChart3 icon) -- stats
  - Team (Users icon) -- team management

- **Shared styling:** 56px height, white background, `elevation-high` shadow (upward), safe-area-inset-bottom padding for notched phones. Active item: CTA Amber icon + label. Inactive: Neutral 400 icon, Neutral 500 label (10px `caption` size).

- **Desktop:** Keep the sidebar (customer) / top navigation (jockey, workshop) as-is, but ensure consistent nav item labels between mobile bottom bar and desktop nav.

**Priority:** Critical
**Complexity:** Medium
**Mockup reference:** 02, 03

---

## 9. Innovation Ideas

### 9.1 Real-Time Vehicle Tracking with Map

**Problem:** Customers have no way to see where their vehicle is during the jockey's pickup/return phase. The status badge updates but provides no spatial context. (Audit ref: 3.2)

**Solution:**
- When the booking status is "Unterwegs" (jockey en route), show a live map in the customer's booking detail page.
- Map shows: customer's address (pin A), workshop address (pin B), jockey's current location (moving car icon).
- ETA display: "Ihr Fahrer ist ca. 12 Minuten entfernt."
- Auto-refresh jockey location every 15 seconds.
- Requires: jockey app sending GPS coordinates (via the existing status update API, extended with lat/lng).
- Map provider: Mapbox GL JS or Google Maps.

**Priority:** Medium
**Complexity:** Large
**Mockup reference:** 02

---

### 9.2 In-App Messaging (Customer to Workshop)

**Problem:** There is no direct communication channel between customer and workshop. Customers with questions about extensions must call or email separately. (Audit ref: M14)

**Solution:**
- Add a "Nachrichten" tab to the booking detail page (4th tab after Details, Erweiterungen, Verlauf).
- Simple chat interface: message bubbles with timestamps.
- Messages are scoped to a specific booking.
- Workshop sees messages in the order detail modal, can respond inline.
- Push notification when a new message arrives.
- No file sharing in v1 (text only). Photos are handled via extensions.

**Priority:** Low
**Complexity:** Large
**Mockup reference:** 02

---

### 9.3 Photo Before/After Documentation

**Problem:** There is no visual proof of what work was done. The customer has no photos of the completed work. (Audit ref: 6.5)

**Solution:**
- Workshop uploads "Before" photos when starting work (optional) and "After" photos when completing work (recommended).
- Photos appear in the customer's booking detail under a "Fotos" section (or within the Verlauf timeline at the relevant step).
- The jockey's handover photos (from 5.4) appear at the "Abholung" and "Ruckgabe" timeline steps.
- Photo grid: 3 columns, tap to enlarge (lightbox). Labeled: "Vor der Reparatur" / "Nach der Reparatur" / "Abholung" / "Ruckgabe".

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 02, 03

---

### 9.4 Post-Service Rating System

**Problem:** No rating or review prompt exists after a service is completed. The landing page shows reviews (4.5/5) but there is no mechanism to collect them. (Audit refs: M10, 6.5)

**Solution:**
- After the booking reaches "Fertig" status, show a rating prompt on the customer dashboard:
  - "Wie war Ihr Service-Erlebnis?" with 5-star selector.
  - Optional: Comment text area.
  - Optional: "Wurde Sie uns weiterempfehlen?" (NPS-style 1-10).
  - "Bewertung abgeben" button.
- The `RatingModal` component already exists at `components/customer/RatingModal.tsx` -- connect it to this flow.
- Ratings are displayed: on the landing page testimonials section, on the workshop's profile (if public).
- Email prompt: Send a rating request email 24 hours after service completion with a deep link to the rating modal.

**Priority:** Medium
**Complexity:** Small
**Mockup reference:** 02

---

### 9.5 ETA Display for Jockey

**Problem:** No ETA or distance information is shown on jockey assignments. A jockey en route needs to know how far away the customer is. (Audit ref: L10)

**Solution:**
- Calculate ETA using a routing API (Google Directions / Mapbox Directions) based on jockey's current GPS location and the assignment address.
- Display on the active assignment card: "Geschatzt: 15 Min / 8,3 km" with a car icon.
- Update ETA every 60 seconds while the assignment is in "Unterwegs" status.
- Show ETA to the customer as well (on their booking detail page): "Ihr Fahrer ist ca. 15 Minuten entfernt."

**Priority:** Medium
**Complexity:** Medium
**Mockup reference:** 03

---

### 9.6 Invoice PDF Download

**Problem:** No "Rechnung herunterladen" option exists for completed bookings. Customers have no financial documentation. (Audit ref: M11)

**Solution:**
- Add a "Rechnung herunterladen" button on completed booking detail pages and in the completed bookings list.
- Generate a PDF invoice containing:
  - AutoConcierge company header + logo.
  - Invoice number (matching booking ID).
  - Customer billing details.
  - Line items: each service + price, extensions + price, concierge service (0 EUR).
  - Subtotal, tax (19% MwSt.), total.
  - Payment information (method, date paid).
  - Footer: company address, Steuernummer, Handelsregistereintrag.
- Backend generates PDF on demand (using a library like PDFKit or Puppeteer). Frontend triggers download.
- Alternative: Pre-generate PDF when booking is completed and store it; download is then instant.

**Priority:** High
**Complexity:** Medium
**Mockup reference:** 02

---

### 9.7 Service History Timeline

**Problem:** Customers with multiple completed bookings have no overview of their service history for a specific vehicle. (Audit ref: 6.5)

**Solution:**
- On the customer's "Fahrzeuge" page, add a "Service-Verlauf" section for each saved vehicle.
- Timeline view (vertical) showing all bookings for that vehicle, sorted by date:
  - Each node: date + service type + workshop name + total price.
  - Click to navigate to the full booking detail.
- Benefit: Customers can track when the last oil change was done, when brakes were replaced, etc.
- Future: "Nachster empfohlener Service" recommendation based on mileage and time since last service.

**Priority:** Low
**Complexity:** Medium
**Mockup reference:** 02

---

## Implementation Priority Summary

### Phase 1: Critical (Before Launch)

| # | Proposal | Section | Complexity |
|---|----------|---------|-----------|
| 1 | Fix demo payment form (i18n, remove technical details) | 4.3, 7.3 | Medium |
| 2 | Fix service type enum display (INSPECTION -> Inspektion) | 4.2 | Small |
| 3 | Mobile bottom navigation for all portals | 8.6, 4.1 | Medium |
| 4 | Extension approval 1-click flow from dashboard | 4.3, 7.2 | Small |
| 5 | Booking confirmation payment section redesign | 3.5 | Large |

### Phase 2: High Priority (Significant UX Impact)

| # | Proposal | Section | Complexity |
|---|----------|---------|-----------|
| 6 | Design system color + component overhaul | 1.1, 1.5 | Medium |
| 7 | Visual step indicator redesign | 3.1 | Medium |
| 8 | Custom calendar/date picker | 3.4 | Large |
| 9 | Jockey mobile-first card redesign | 5.1, 5.2 | Large |
| 10 | Workshop Kanban board layout | 6.1, 6.2 | Large |
| 11 | Error states for booking flow | 8.4 | Medium |
| 12 | Booking detail tabbed redesign | 4.2 | Medium |
| 13 | Push notifications for extensions | 7.1 | Medium |
| 14 | Invoice PDF download | 9.6 | Medium |
| 15 | Pricing breakdown / price transparency | 7.4 | Small |

### Phase 3: Medium Priority (Polish)

| # | Proposal | Section | Complexity |
|---|----------|---------|-----------|
| 16 | Landing page hero + trust signals redesign | 2.1, 2.2 | Medium |
| 17 | Service showcase on landing | 2.4 | Small |
| 18 | How-it-works animated section | 2.3 | Small |
| 19 | Vehicle input with brand cards | 3.2 | Medium |
| 20 | Service cards with detail flyout | 3.3 | Medium |
| 21 | Skeleton loading states | 8.1 | Small |
| 22 | Empty states with illustrations | 8.3 | Small |
| 23 | Page transitions/animations | 8.2 | Medium |
| 24 | Jockey photo documentation flow | 5.4 | Medium |
| 25 | Extension creation preview + templates | 6.3 | Medium |
| 26 | Past bookings with rating + re-booking | 4.4 | Medium |
| 27 | Notification center enhancement | 4.5 | Medium |
| 28 | Post-service rating system | 9.4 | Small |
| 29 | Workshop stats bar | 6.4 | Small |
| 30 | Inline post-booking registration | 3.6 | Medium |
| 31 | Typography + spacing system | 1.2, 1.3 | Small |
| 32 | Photo before/after documentation | 9.3 | Medium |

### Phase 4: Nice-to-Have (Innovation)

| # | Proposal | Section | Complexity |
|---|----------|---------|-----------|
| 33 | Jockey route map view | 5.5 | Large |
| 34 | Real-time vehicle tracking | 9.1 | Large |
| 35 | ETA display for jockey | 9.5 | Medium |
| 36 | In-app messaging | 9.2 | Large |
| 37 | Service history timeline | 9.7 | Medium |
| 38 | Modern footer redesign | 2.5 | Small |
| 39 | Toast notification redesign | 8.5 | Small |
| 40 | Shadows/elevation system | 1.4 | Small |

---

*End of UX Improvement Proposals*
