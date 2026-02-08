# Landing Page & Booking Flow — Implementation Plan

**Date:** 2026-02-08
**Based on:** File inventory (`01-file-inventory.md`), UX proposals (Sections 2 & 3), HTML mockup (`01-landing-booking-mockup.html`), current source code review, E2E walkthrough specs

---

## Table of Contents

1. [Landing Page — Section-by-Section Plan](#1-landing-page--section-by-section-plan)
2. [Booking Flow — Step-by-Step Plan](#2-booking-flow--step-by-step-plan)
3. [File Change Matrix](#3-file-change-matrix)
4. [i18n Key Changes](#4-i18n-key-changes)
5. [E2E Test Impact Analysis](#5-e2e-test-impact-analysis)
6. [Component Dependency Graph](#6-component-dependency-graph)

---

## 1. Landing Page — Section-by-Section Plan

The current landing page (`app/[locale]/page.tsx`, line 23-41) renders: `Header > Hero > PortalCards > ValueProps > HowItWorks > FAQ > Footer`. The mockup replaces this with: `Navbar > Hero > HowItWorks > Services > Trust/SocialProof > CTABanner > BookingFlow > Footer`. This is a fundamental restructuring.

### 1.1 Navbar

**Current implementation:**
- File: `components/landing/Header.tsx` (lines 1-109)
- Sticky header with white background, blur backdrop
- Nav links: Home, So funktioniert's, FAQ (from `t.header.*`)
- CTA: "Anmelden" ghost button + "Termin buchen" CTA button
- Mobile: Sheet slide-in menu
- Uses `useLanguage()` (Lovable adapter)

**Target design (from mockup, lines 132-161):**
- Glassmorphism dark navbar (`nav-glass`): dark semi-transparent background with blur
- Scrolled state: solid dark with shadow (`nav-scrolled`)
- Nav links: So funktioniert's, Services, Bewertungen, Buchen
- CTA: "Anmelden" text link + "Jetzt buchen" amber gradient button
- Logo: Blue gradient icon square + white "AutoConcierge" text
- Mobile: hamburger menu toggles inline dropdown (not Sheet)

**Changes needed:**
- Replace white/light sticky header with dark glassmorphism style
- Add scroll listener for `nav-scrolled` class transition
- Update nav links to match new sections (Services, Bewertungen, Buchen anchors)
- Restyle logo: gradient blue square with car SVG icon
- Change "Anmelden" to a subtle text link (white/gray)
- Change "Termin buchen" to amber gradient button
- Mobile: Replace Sheet component with inline collapsible div
- Switch from `useLanguage()` to `useTranslations('header')`

**New/modified components:**
- **Modify** `components/landing/Header.tsx` entirely (rename to `LandingNavbar.tsx` for clarity)
- Add CSS classes `nav-glass`, `nav-scrolled` to `globals.css`

### 1.2 Hero Section

**Current implementation:**
- File: `components/landing/Hero.tsx` (lines 1-87)
- Blue primary gradient background with SVG pattern overlay
- Centered layout: trust badge + H1 + subtitle + CTA buttons + star rating
- H1: "Premium Fahrzeugwartung mit Festpreis-Garantie"
- CTA: "Preis berechnen" (links to `/customer/booking`) + "Anmelden"
- Social proof: 4.5 stars + "aus 1.247 Bewertungen"
- Wave SVG divider at bottom

**Target design (from mockup, lines 164-215):**
- Full-screen dark navy gradient background with animated floating shapes
- 2-column layout on desktop: left text + right illustration
- Left column:
  - Green pill badge: "Festpreis-Garantie" with pulse dot
  - H1: "Ihr Fahrzeug, unser Service" + gradient span "Bequem von Zuhause"
  - Subtitle in gray-400
  - Two CTAs: "Jetzt Termin buchen" (amber gradient, arrow icon) + "So funktioniert's" (outline white)
  - Trust strip: 4.9 rating stars, 500+ zufriedene Kunden, Zertifizierte Partner
- Right column (desktop only): Animated car illustration in circular gradient with floating badges ("Festpreis", "Kostenlose Abholung")

**Changes needed:**
- Replace centered layout with 2-column grid (`md:grid-cols-2`)
- Change background from `bg-gradient-to-br from-primary` to dark navy gradient
- Add animated floating shapes (CSS `@keyframes float`)
- Replace H1 text and gradient highlight
- Fix CTA: rename "Preis berechnen" to "Jetzt Termin buchen" (links to `#booking`)
- Replace second CTA with anchor to `#how-it-works`
- Add right-side car illustration SVG with floating badge elements
- Update social proof to 3-item horizontal strip with icons
- Remove wave divider (mockup transitions directly to next section)
- Switch from `useLanguage()` to `useTranslations('hero')`

**New components:**
- **HeroIllustration** — SVG car graphic with animated badges (extracted for maintainability)

### 1.3 How-It-Works Section

**Current implementation:**
- File: `components/landing/HowItWorks.tsx` (lines 1-81)
- 3 steps: Fahrzeug eingeben, Service wahlen, Termin buchen
- Each step: primary circle with icon + numbered badge + title + description
- Connecting dots between steps (desktop only)
- Uses `t.howItWorks.*` from Lovable adapter

**Target design (from mockup, lines 218-270):**
- 4 steps (not 3): Online buchen, Wir holen ab, Werkstatt-Service, Ruckgabe
- Each step: colored gradient rounded square (68px) with SVG icon + white card below
- Connecting gradient line spanning between icons (desktop only)
- Step label: colored "Schritt N" above title
- Step colors gradient: blue > blue > amber > green
- Section heading: "So einfach geht's" overline + "In 4 Schritten zum Service"
- Fade-in animation on scroll

**Changes needed:**
- Increase from 3 steps to 4 steps
- Replace circular icons with rounded-square gradient icons (68px)
- Add horizontal connecting gradient line (absolute positioned)
- Add white card below each icon with step number label + title + description
- Update step content: Online buchen, Wir holen ab, Werkstatt-Service, Ruckgabe
- Add overline label ("So einfach geht's" in uppercase blue)
- Add scroll-triggered fade-in animations
- Switch from `useLanguage()` to `useTranslations('howItWorks')`

**New components:**
- **StepCard** — Reusable step visualization with icon square + card + connecting line

### 1.4 Services Section (NEW)

**Current implementation:**
- Does NOT exist on the landing page. Services are only visible inside the booking flow.
- There is a `components/landing/pricing-section.tsx` but it is not imported in `page.tsx`.

**Target design (from mockup, lines 273-349):**
- 3x2 grid of service cards (6 services)
- Each card: colored icon in tinted square + title + description + price + duration badge
- Services: Inspektion (blue, 149 EUR), Olwechsel (amber, 89 EUR), Bremsservice (red, 199 EUR), Reifenwechsel (green, 59 EUR), TUV/HU (purple, 119 EUR), Wartung (indigo, 249 EUR)
- Cards have hover effect: translate-Y + shadow + gradient border
- Section heading: "Unsere Services" overline + "Alles fur Ihr Fahrzeug"
- Fade-in animation staggered per card

**Changes needed:**
- Create entirely new section component
- Define 6 service entries with icons, colors, prices, durations
- Implement hover animation with gradient border effect

**New components:**
- **ServicesShowcase** (`components/landing/services-showcase.tsx`) — Full section with grid
- **LandingServiceCard** (`components/landing/landing-service-card.tsx`) — Individual card

### 1.5 Trust / Social Proof Section (NEW)

**Current implementation:**
- There are existing `trust-section.tsx`, `trust-badges-row.tsx`, `testimonials-section.tsx`, `stats-section.tsx` in `components/landing/` but NONE are imported in `page.tsx`.

**Target design (from mockup, lines 352-421):**
- Stats row: "1.247 Fahrzeuge betreut" (counter animation), "48 Partnerwerkstatten" (counter), "4.9 Durchschnittsbewertung" (stars)
- Testimonials: 3 cards with star rating + quote + author (initials avatar + name + vehicle info)
- Partner logos: Bosch, ATU, Euromaster, Vergolst, Pitstop (text placeholders at 40% opacity)
- Gray-50 background
- Fade-in animations

**Changes needed:**
- Create new unified trust section combining stats + testimonials + partners
- Implement counter animation using Intersection Observer
- Create testimonial cards with avatar initials

**New components:**
- **TrustSocialProof** (`components/landing/trust-social-proof.tsx`) — Full section
- **AnimatedCounter** (`components/landing/animated-counter.tsx`) — Counter with scroll trigger
- **TestimonialCard** (`components/landing/testimonial-card.tsx`) — Individual testimonial

### 1.6 CTA Banner (NEW)

**Current implementation:**
- `components/landing/final-cta-section.tsx` exists but is not imported in `page.tsx`.

**Target design (from mockup, lines 425-438):**
- Full-width amber gradient strip (`from-amber-500 to-amber-600`)
- Decorative white circles at corners (opacity 10%)
- Centered text: "Bereit? Buchen Sie in 2 Minuten!" + subtitle
- White button: "Jetzt Service buchen" with arrow icon
- Links to `#booking`

**Changes needed:**
- Create new CTA banner component
- Amber gradient background with decorative shapes
- White inverted button style

**New components:**
- **CTABanner** (`components/landing/cta-banner.tsx`)

### 1.7 Footer

**Current implementation:**
- File: `components/landing/Footer.tsx` (lines 1-103)
- Dark background (`#1a1f2e`)
- 4 columns: Brand + Quick Links (portal logins) + Rechtliches + Kontakt
- Bottom bar: copyright with dynamic year
- Uses `useLanguage()` (Lovable adapter)
- Some hardcoded German labels ("Quick Links", "Rechtliches", "Kontakt")

**Target design (from mockup, lines 906-960):**
- Dark gray-900 background
- 4 columns: Brand (logo + tagline) + Uber uns (team, partners, careers, press) + Rechtliches (Datenschutz, AGB, Impressum, Cookie) + Kontakt (email, phone, address)
- Social icons: Twitter, Instagram, LinkedIn (in Kontakt column)
- Bottom bar with copyright

**Changes needed:**
- Replace "Quick Links" (portal logins) with "Uber uns" (company links)
- Add social media icons to the brand or contact column
- Move all hardcoded German strings to i18n keys
- Add "Cookie-Einstellungen" to Rechtliches
- Switch from `useLanguage()` to `useTranslations('footer')`

**Modified components:**
- **Modify** `components/landing/Footer.tsx` significantly

### 1.8 Removed Sections

The following current sections will be **removed** from the landing page:

| Section | Current File | Reason |
|---------|-------------|--------|
| PortalCards | `components/landing/PortalCards.tsx` | Replaced by Services showcase; portal login is now in the footer "Uber uns" or header "Anmelden" |
| ValueProps | `components/landing/ValueProps.tsx` | Content merged into Hero trust strip and How-It-Works |
| FAQ | `components/landing/FAQ.tsx` | Not in mockup; can be linked from footer or kept as separate page |

### 1.9 Landing Page Assembly

The new `app/[locale]/page.tsx` will render:

```
LandingNavbar
Hero
  #how-it-works
HowItWorks (4 steps)
  #services
ServicesShowcase
  #trust
TrustSocialProof
CTABanner
  #booking (anchor, links from hero CTA scroll here or navigate to /booking)
Footer
```

Note: The mockup includes an inline booking flow section (`#booking`) on the landing page itself. Implementation decision: keep the booking flow on its own route (`/booking`) and have the hero/CTA buttons navigate there. The `#booking` anchor scrolls to a teaser card with a "Jetzt buchen" link to `/booking`. This avoids embedding the full 4-step wizard on the landing page.

---

## 2. Booking Flow — Step-by-Step Plan

The booking flow lives at `/[locale]/booking` with the main orchestrator in `app/[locale]/booking/page.tsx` (307 lines). It uses 4 step components from `components/booking/`.

### 2.1 Step Indicator (Progress Bar)

**Current implementation:**
- File: `components/booking/StepIndicator.tsx` (lines 1-50)
- Horizontal circles (h-10 w-10) with numbers/checkmarks connected by flat bars
- Bars hidden on mobile (`hidden sm:block`)
- Labels: `text-xs text-muted-foreground`
- Colors: success (completed), primary (current), muted (future)

**Target design (from mockup, lines 449-472):**
- 4 progress circles (44px) with step numbers, connected by gradient lines
- States: `.active` (blue gradient + shadow ring), `.completed` (green gradient), `.upcoming` (gray)
- Lines: `.done` (green-to-blue gradient), `.pending` (gray)
- Labels always visible below circles
- Current step label in blue, others in gray
- Smooth transition animations (300ms)

**Changes needed:**
- Increase circle size from 40px to 44px
- Replace flat bar with gradient progress lines
- Add gradient backgrounds to circles (active: blue gradient, completed: green gradient)
- Add shadow ring on active step (`box-shadow: 0 0 0 4px rgba(59,130,246,0.2)`)
- Make connecting lines always visible (remove `hidden sm:block`)
- On mobile: show compact "Schritt 2 von 4: Service" with thin progress bar instead
- Add CSS transition animations for step changes
- Step labels: "Fahrzeug", "Service", "Termin", "Ubersicht" (updated from "Abholung" to "Termin", "Bestatigung" to "Ubersicht")

**Modified component:**
- **Rewrite** `components/booking/StepIndicator.tsx`

### 2.2 Vehicle Step (Step 1)

**Current implementation:**
- File: `components/booking/VehicleStep.tsx` (lines 1-146)
- Card with `card-premium` class
- Brand: dropdown `Select` with logo images (from `VEHICLE_BRANDS`)
- Model: dropdown `Select` (from `VEHICLE_MODELS`)
- Year: number `Input` field
- Mileage: number `Input` with "km" suffix
- Save vehicle: `Checkbox`
- No license plate field

**Target design (from mockup, lines 474-591):**
- White card with rounded-2xl border
- **Brand selection as logo grid** (3 cols mobile, 6 cols desktop): BMW, Mercedes, Audi, VW, Porsche, Andere — each with SVG logo + name
- Selected state: blue border + check overlay
- Model: styled dropdown select
- Year: styled dropdown select (2015-2026 descending)
- Mileage: text input with "km" suffix and thousands separator
- License plate: new field ("B-AC 1234" format, uppercase, letter-spaced)
- Save vehicle checkbox
- "Weiter" button inside card bottom

**Changes needed:**
- Replace brand `Select` dropdown with visual **brand card grid**
- Create inline SVG logos for top 5 brands + "Andere" with plus icon
- Add `.brand-card` CSS class with selected state (blue border, blue-50 bg)
- Keep model as dropdown but with rounded-xl styling
- Change year from number input to dropdown select (2015-2026)
- Add thousands separator formatting to mileage input
- Add license plate field (new, optional)
- Move "Weiter" button inside the card footer area

**New components:**
- **BrandCardGrid** (`components/booking/BrandCardGrid.tsx`) — Grid of brand logo cards
- **BrandCard** (`components/booking/BrandCard.tsx`) — Individual brand card with SVG

### 2.3 Service Step (Step 2)

**Current implementation:**
- File: `components/booking/ServiceStep.tsx` (lines 1-116)
- Card with `card-premium` class
- 4 services in 2x2 grid: inspection (149), oil (89), brakes (199), ac (119)
- Each service: icon in tinted square + name + description + price
- Selected state: primary border + blue-5% bg + check circle
- Multi-select with running total when >1 selected
- Uses `data-testid="service-card-{id}"`

**Target design (from mockup, lines 593-680):**
- 6 services in 2-column grid: Inspektion, Olwechsel, Bremsservice, Reifenwechsel, TUV/HU, Wartung
- Each card: `.service-select` class with 2px border
- Selected: blue border + blue-50 bg + check overlay circle (top-right)
- Icon in colored tinted square (each service has unique color)
- Running total shown in blue-50 bar when services selected: "Zwischensumme: X EUR"
- Card hover: blue border + subtle shadow

**Changes needed:**
- Increase from 4 to 6 services (add tire_change, tuv)
- Update service card styling with `.service-select` CSS class
- Change running total display: show as full-width blue-50 bar below grid
- Always show running total when >=1 service selected (not just >1)
- Update price display format: "ab 149 EUR" (with "EUR" instead of EUR symbol)
- Keep `data-testid` attributes for E2E compatibility

**Modified component:**
- **Modify** `components/booking/ServiceStep.tsx`

### 2.4 Appointment Step (Step 3)

**Current implementation:**
- File: `components/booking/PickupStep.tsx` (lines 1-417)
- 4 cards: Concierge highlight, Pickup date/time, Return date/time, Address
- Pickup: Popover calendar + quick select buttons (Today/Tomorrow/Next Weekday) + 5 time slot buttons
- Return: Popover calendar + quick select (+1 day, +1 week) + 5 time slot buttons + validation
- Address: street, zip, city inputs + "same address for return" info
- Concierge highlight card with green success styling

**Target design (from mockup, lines 682-764):**
- Info banner: blue-50 card explaining concierge service
- **Inline calendar** (not popover): grid of 7 columns, month navigation, day cells
- Calendar day states: `.selected` (blue bg), `.today` (blue border), `.disabled` (gray)
- Time slots as pill buttons (10 slots: 08:00 to 16:00 in 30-min intervals)
- Address: street + house number (2/3 width), PLZ (1/3 width), city
- "Same address for return" with green check icon
- No separate return date card visible in mockup (simplified)

**Changes needed:**
- Replace Popover calendar with inline `Calendar` component rendered directly in the card
- Expand time slots from 5 to 10 (add 30-min intervals: 08:30, 09:00, 09:30, etc.)
- Style time slots as pill buttons (`.time-pill` CSS class)
- Consolidate concierge highlight to simpler blue info box
- Simplify return date handling: auto-set return based on service type, show estimated return text
- Update address layout: street+house in one wider input
- Add custom `.cal-day` styling for calendar days

**Modified component:**
- **Modify** `components/booking/PickupStep.tsx`

### 2.5 Summary/Confirmation Step (Step 4)

**Current implementation:**
- File: `components/booking/ConfirmationStep.tsx` (lines 1-255)
- 3 cards: Booking summary, Contact info, Payment/Terms
- Summary: services list + vehicle info + pickup/return timeline + concierge highlight + total price
- Contact: firstName, lastName, email, phone inputs
- Payment: placeholder text "Stripe integration will be shown here" + AGB checkbox

**Target design (from mockup, lines 766-901):**
- Single white card with full summary:
  - Vehicle section: icon + "BMW 3er, 2022" + "45.000 km | B-AC 1234"
  - Services section: icon + service name + price per line
  - Appointment section: icon + "Mo, 09.02.2026 um 10:00" + address
  - Concierge section: green highlighted card "Concierge-Service inklusive" + "0 EUR"
  - Total: "Gesamtpreis: 149 EUR" (amber, large) + "inkl. MwSt. | Festpreis-Garantie"
- Contact data: firstName, lastName, email, phone in grid
- AGB checkbox with linked terms/privacy text
- "Jetzt kostenpflichtig buchen" amber button with lock icon
- Confirmation screen (after submit): green checkmark + booking number + "Nachste Schritte" list + "Zur Startseite" / "Zum Kundenportal" buttons

**Changes needed:**
- Restructure summary layout: use icon + label + value rows in gray-50 background cards
- Add vehicle license plate display
- Add "inkl. MwSt. | Festpreis-Garantie" note under total
- Style total price in amber (not cta color variable)
- Add lock icon to submit button
- Replace payment placeholder with styled demo card (when DEMO_MODE)
- Link AGB text to `/terms` and `/privacy` routes

**Modified component:**
- **Modify** `components/booking/ConfirmationStep.tsx`

### 2.6 Booking Page Orchestrator

**Current implementation:**
- File: `app/[locale]/booking/page.tsx` (lines 1-307)
- Simple header with logo + cancel button
- ConciergeBanner below header
- StepIndicator + conditional step rendering
- Navigation buttons at bottom (Back/Next/Submit)

**Target design:**
- Styled header matching the landing navbar style (simplified, just logo + cancel)
- Remove ConciergeBanner from top (concierge info moved into the appointment step)
- Update step labels: "Fahrzeug", "Service", "Termin", "Ubersicht"
- Add section heading above progress bar: "Buchung" overline + "Service buchen"
- Style navigation buttons: "Zuruck" as outlined + "Weiter" as amber gradient

**Changes needed:**
- Remove `ConciergeBanner` from booking page (keep component for reuse elsewhere)
- Update step labels in booking page to match mockup
- Add section heading with overline
- Style buttons to match mockup amber gradient

**Modified file:**
- **Modify** `app/[locale]/booking/page.tsx`

---

## 3. File Change Matrix

| File Path | Action | Description |
|-----------|--------|-------------|
| `app/[locale]/page.tsx` | **Modify** | Replace component imports and section order: remove PortalCards/ValueProps/FAQ, add ServicesShowcase/TrustSocialProof/CTABanner |
| `components/landing/Header.tsx` | **Rewrite** | Dark glassmorphism navbar with scroll effect, new nav links, amber CTA |
| `components/landing/Hero.tsx` | **Rewrite** | 2-column dark hero with animated shapes, new text, new CTAs, car illustration |
| `components/landing/HowItWorks.tsx` | **Rewrite** | 4 steps (was 3), gradient icon squares, connecting line, white cards |
| `components/landing/services-showcase.tsx` | **Create** | New services grid section with 6 service cards |
| `components/landing/landing-service-card.tsx` | **Create** | Individual service card with hover animation |
| `components/landing/trust-social-proof.tsx` | **Create** | Stats counters + testimonials + partner logos |
| `components/landing/animated-counter.tsx` | **Create** | Intersection Observer counter animation |
| `components/landing/testimonial-card.tsx` | **Create** | Testimonial card with avatar, stars, quote |
| `components/landing/cta-banner.tsx` | **Create** | Amber gradient CTA strip |
| `components/landing/hero-illustration.tsx` | **Create** | SVG car illustration with floating badges |
| `components/landing/Footer.tsx` | **Modify** | Update columns (replace Quick Links with Uber uns), add social icons, i18n all strings |
| `components/landing/PortalCards.tsx` | **Remove from landing** | No longer imported in page.tsx (keep file for potential reuse) |
| `components/landing/ValueProps.tsx` | **Remove from landing** | No longer imported in page.tsx |
| `components/landing/FAQ.tsx` | **Remove from landing** | No longer imported in page.tsx |
| `components/booking/StepIndicator.tsx` | **Rewrite** | Gradient circles, gradient lines, mobile compact mode, animations |
| `components/booking/VehicleStep.tsx` | **Rewrite** | Brand card grid (replaces dropdown), year dropdown, license plate field |
| `components/booking/BrandCardGrid.tsx` | **Create** | Grid of selectable brand logo cards |
| `components/booking/BrandCard.tsx` | **Create** | Single brand card with SVG logo |
| `components/booking/ServiceStep.tsx` | **Modify** | 6 services (was 4), updated styling, always-visible running total |
| `components/booking/PickupStep.tsx` | **Modify** | Inline calendar, pill time slots, simplified layout |
| `components/booking/ConfirmationStep.tsx` | **Modify** | Restructured summary with icon rows, styled total, lock icon on submit |
| `app/[locale]/booking/page.tsx` | **Modify** | Remove ConciergeBanner, update step labels, add section heading |
| `app/globals.css` | **Modify** | Add: `nav-glass`, `nav-scrolled`, `brand-card`, `service-select`, `time-pill`, `cal-day`, `progress-circle`, `progress-line`, `service-card` hover, `fade-in`/`fade-in-left`/`fade-in-right`, `counter`, `testimonial-card`, `btn-primary` gradient, `btn-outline` |
| `messages/de.json` | **Modify** | Update hero, header, howItWorks, add services showcase, trust, cta, footer keys |
| `messages/en.json` | **Modify** | Same key changes as de.json with English translations |

---

## 4. i18n Key Changes

### 4.1 New Keys (DE)

```json
{
  "header": {
    "home": "Home",
    "howItWorks": "So funktioniert's",
    "services": "Services",
    "reviews": "Bewertungen",
    "booking": "Buchen",
    "login": "Anmelden",
    "bookNow": "Jetzt buchen",
    "faq": "FAQ"
  },
  "hero": {
    "badge": "Festpreis-Garantie",
    "title": "Ihr Fahrzeug, unser Service",
    "titleHighlight": "Bequem von Zuhause",
    "subtitle": "Wir holen Ihr Auto ab, bringen es zur Werkstatt und liefern es fertig gewartet zuruck. Kein Aufwand, kein Stress, zum Festpreis.",
    "ctaPrimary": "Jetzt Termin buchen",
    "ctaSecondary": "So funktioniert's",
    "trustRating": "4.9",
    "trustRatingLabel": "Bewertung",
    "trustCustomers": "500+",
    "trustCustomersLabel": "zufriedene Kunden",
    "trustPartners": "Zertifizierte Partner"
  },
  "howItWorks": {
    "overline": "So einfach geht's",
    "title": "In 4 Schritten zum Service",
    "subtitle": "Kein Werkstattbesuch, kein Zeitverlust. Wir erledigen alles fur Sie.",
    "steps": {
      "book": {
        "label": "Schritt 1",
        "title": "Online buchen",
        "description": "Wahlen Sie Fahrzeug, Service und Wunschtermin in nur 2 Minuten."
      },
      "pickup": {
        "label": "Schritt 2",
        "title": "Wir holen ab",
        "description": "Unser Fahrer holt Ihr Fahrzeug zum Wunschtermin bei Ihnen ab."
      },
      "workshop": {
        "label": "Schritt 3",
        "title": "Werkstatt-Service",
        "description": "Zertifizierte Partnerwerkstatten fuhren den Service fachgerecht durch."
      },
      "return": {
        "label": "Schritt 4",
        "title": "Ruckgabe",
        "description": "Ihr Fahrzeug wird fertig gewartet direkt zu Ihnen zuruckgebracht."
      }
    }
  },
  "servicesShowcase": {
    "overline": "Unsere Services",
    "title": "Alles fur Ihr Fahrzeug",
    "subtitle": "Professionelle Wartung und Reparatur zum transparenten Festpreis.",
    "items": {
      "inspection": {
        "title": "Inspektion",
        "description": "Komplette Fahrzeugprufung nach Herstellervorgaben inkl. Protokoll.",
        "price": "ab 149 EUR",
        "duration": "60-90 Min."
      },
      "oilChange": {
        "title": "Olwechsel",
        "description": "Motorol und Filter wechseln mit Premium-Markenprodukten.",
        "price": "ab 89 EUR",
        "duration": "30-45 Min."
      },
      "brakes": {
        "title": "Bremsservice",
        "description": "Bremselage, Scheiben und Flussigkeit prufen und erneuern.",
        "price": "ab 199 EUR",
        "duration": "90-120 Min."
      },
      "tires": {
        "title": "Reifenwechsel",
        "description": "Saisonaler Reifenwechsel inkl. Auswuchten und Reifencheck.",
        "price": "ab 59 EUR",
        "duration": "30-45 Min."
      },
      "tuv": {
        "title": "TUV / HU",
        "description": "Hauptuntersuchung mit Abgasuntersuchung bei TUV-Partnern.",
        "price": "ab 119 EUR",
        "duration": "60-90 Min."
      },
      "maintenance": {
        "title": "Wartung",
        "description": "Komplettservice nach Herstellerplan mit allen Verschleissteilen.",
        "price": "ab 249 EUR",
        "duration": "2-4 Std."
      }
    }
  },
  "trustSocialProof": {
    "stats": {
      "vehiclesServed": "1.247",
      "vehiclesServedLabel": "Fahrzeuge betreut",
      "partnerWorkshops": "48",
      "partnerWorkshopsLabel": "Partnerwerkstatten",
      "averageRating": "4.9",
      "averageRatingLabel": "Durchschnittsbewertung"
    },
    "testimonialsOverline": "Kundenstimmen",
    "testimonialsTitle": "Das sagen unsere Kunden",
    "testimonials": [
      {
        "text": "Absolut unkompliziert! Auto morgens abgeholt, abends fertig zuruckgebracht. Besser als jeder Werkstattbesuch. Kann ich nur empfehlen.",
        "author": "Marcus T.",
        "vehicle": "BMW 3er, Inspektion",
        "rating": 5
      },
      {
        "text": "Super Service! Der Fahrer war punktlich, freundlich und das Auto kam sauber zuruck. Der Festpreis war auch genau wie angegeben.",
        "author": "Sandra K.",
        "vehicle": "Audi A4, Olwechsel",
        "rating": 5
      },
      {
        "text": "Habe den TUV-Service genutzt. Alles online gebucht, keine Wartezeiten, Plakette drauf. So muss das sein! Preis-Leistung top.",
        "author": "Jan R.",
        "vehicle": "VW Golf, TUV/HU",
        "rating": 4
      }
    ],
    "partnersLabel": "Unsere Partnerwerkstatten"
  },
  "ctaBanner": {
    "title": "Bereit? Buchen Sie in 2 Minuten!",
    "subtitle": "Kein Anruf, kein Warten. Wahlen Sie Ihren Service und wir kummern uns um den Rest.",
    "button": "Jetzt Service buchen"
  },
  "footer": {
    "tagline": "Premium Fahrzeugwartung mit Concierge-Service. Wir holen ab, Sie lehnen sich zuruck.",
    "aboutUs": "Uber uns",
    "team": "Unser Team",
    "partnerWorkshops": "Partnerwerkstatten",
    "careers": "Karriere",
    "press": "Presse",
    "legal": "Rechtliches",
    "privacy": "Datenschutz",
    "terms": "AGB",
    "imprint": "Impressum",
    "cookies": "Cookie-Einstellungen",
    "contact": "Kontakt",
    "copyright": "AutoConcierge. Alle Rechte vorbehalten."
  }
}
```

### 4.2 New Keys (EN)

```json
{
  "header": {
    "home": "Home",
    "howItWorks": "How it works",
    "services": "Services",
    "reviews": "Reviews",
    "booking": "Book now",
    "login": "Sign in",
    "bookNow": "Book now",
    "faq": "FAQ"
  },
  "hero": {
    "badge": "Fixed price guarantee",
    "title": "Your vehicle, our service",
    "titleHighlight": "From the comfort of home",
    "subtitle": "We pick up your car, bring it to the workshop, and deliver it back fully serviced. No hassle, no stress, at a fixed price.",
    "ctaPrimary": "Book appointment now",
    "ctaSecondary": "How it works",
    "trustRating": "4.9",
    "trustRatingLabel": "Rating",
    "trustCustomers": "500+",
    "trustCustomersLabel": "satisfied customers",
    "trustPartners": "Certified partners"
  },
  "howItWorks": {
    "overline": "How it works",
    "title": "Your service in 4 steps",
    "subtitle": "No workshop visits, no wasted time. We handle everything for you.",
    "steps": {
      "book": {
        "label": "Step 1",
        "title": "Book online",
        "description": "Choose your vehicle, service, and preferred time slot in just 2 minutes."
      },
      "pickup": {
        "label": "Step 2",
        "title": "We pick up",
        "description": "Our driver picks up your vehicle at your preferred time and location."
      },
      "workshop": {
        "label": "Step 3",
        "title": "Workshop service",
        "description": "Certified partner workshops perform the service professionally."
      },
      "return": {
        "label": "Step 4",
        "title": "Return",
        "description": "Your vehicle is delivered back to you fully serviced."
      }
    }
  },
  "servicesShowcase": {
    "overline": "Our Services",
    "title": "Everything for your vehicle",
    "subtitle": "Professional maintenance and repair at transparent fixed prices.",
    "items": {
      "inspection": {
        "title": "Inspection",
        "description": "Complete vehicle inspection according to manufacturer specifications incl. report.",
        "price": "from 149 EUR",
        "duration": "60-90 min."
      },
      "oilChange": {
        "title": "Oil change",
        "description": "Engine oil and filter change with premium brand products.",
        "price": "from 89 EUR",
        "duration": "30-45 min."
      },
      "brakes": {
        "title": "Brake service",
        "description": "Brake pads, discs, and fluid inspection and renewal.",
        "price": "from 199 EUR",
        "duration": "90-120 min."
      },
      "tires": {
        "title": "Tire change",
        "description": "Seasonal tire change including balancing and tire check.",
        "price": "from 59 EUR",
        "duration": "30-45 min."
      },
      "tuv": {
        "title": "MOT / Inspection",
        "description": "Main inspection with emissions test at certified partners.",
        "price": "from 119 EUR",
        "duration": "60-90 min."
      },
      "maintenance": {
        "title": "Full service",
        "description": "Complete service according to manufacturer schedule with all wear parts.",
        "price": "from 249 EUR",
        "duration": "2-4 hrs."
      }
    }
  },
  "trustSocialProof": {
    "stats": {
      "vehiclesServed": "1,247",
      "vehiclesServedLabel": "Vehicles serviced",
      "partnerWorkshops": "48",
      "partnerWorkshopsLabel": "Partner workshops",
      "averageRating": "4.9",
      "averageRatingLabel": "Average rating"
    },
    "testimonialsOverline": "Customer reviews",
    "testimonialsTitle": "What our customers say",
    "testimonials": [
      {
        "text": "Absolutely hassle-free! Car picked up in the morning, returned fully serviced in the evening. Better than any workshop visit. Highly recommend.",
        "author": "Marcus T.",
        "vehicle": "BMW 3 Series, Inspection",
        "rating": 5
      },
      {
        "text": "Great service! The driver was on time, friendly, and the car came back clean. The fixed price was exactly as quoted.",
        "author": "Sandra K.",
        "vehicle": "Audi A4, Oil change",
        "rating": 5
      },
      {
        "text": "Used the MOT service. Booked everything online, no waiting times, sticker done. That's how it should be! Great value.",
        "author": "Jan R.",
        "vehicle": "VW Golf, MOT",
        "rating": 4
      }
    ],
    "partnersLabel": "Our partner workshops"
  },
  "ctaBanner": {
    "title": "Ready? Book in 2 minutes!",
    "subtitle": "No calls, no waiting. Choose your service and we take care of the rest.",
    "button": "Book service now"
  },
  "footer": {
    "tagline": "Premium vehicle maintenance with concierge service. We pick up, you relax.",
    "aboutUs": "About us",
    "team": "Our team",
    "partnerWorkshops": "Partner workshops",
    "careers": "Careers",
    "press": "Press",
    "legal": "Legal",
    "privacy": "Privacy policy",
    "terms": "Terms of service",
    "imprint": "Imprint",
    "cookies": "Cookie settings",
    "contact": "Contact",
    "copyright": "AutoConcierge. All rights reserved."
  }
}
```

### 4.3 Modified Keys

| Namespace | Key | Old Value (DE) | New Value (DE) | Reason |
|-----------|-----|----------------|----------------|--------|
| `hero` | `title` | "Premium Fahrzeugwartung mit" | "Ihr Fahrzeug, unser Service" | Mockup headline |
| `hero` | `titleHighlight` | "Festpreis-Garantie" | "Bequem von Zuhause" | Mockup gradient text |
| `hero` | `subtitle` | "Wir holen Ihr Auto ab & bringen es zuruck..." | (longer version from mockup) | More descriptive |
| `hero` | `cta` | "Preis berechnen" | Replaced by `ctaPrimary`/`ctaSecondary` | Split into two CTAs |
| `hero` | `login` | "Anmelden" | (removed, login moved to header) | UX simplification |
| `header` | `bookNow` | "Termin buchen" | "Jetzt buchen" | Shorter, more urgent |
| `howItWorks` | `steps.vehicle` | `{title, description}` | Replaced by `steps.book` | 4-step model |
| `howItWorks` | `steps.service` | `{title, description}` | Replaced by `steps.pickup` | 4-step model |
| `howItWorks` | `steps.booking` | `{title, description}` | Replaced by `steps.workshop` + `steps.return` | 4-step model |

### 4.4 Removed Keys

| Namespace | Key | Reason |
|-----------|-----|--------|
| `portals` | entire namespace | PortalCards section removed from landing |
| `values` | entire namespace | ValueProps section removed from landing |
| `hero` | `rating`, `reviews` | Replaced by `trustRating`, `trustCustomers` etc. |
| `hero` | `login` | Login CTA removed from hero, now only in header |

Note: The `portals` and `values` namespaces should be kept in the JSON files since other pages may reference them via the Lovable adapter. Only remove from the landing page imports.

### 4.5 Booking Flow i18n Changes

The booking flow uses the `lovableBooking` namespace. Key changes:

| Key | Old Value | New Value | Reason |
|-----|-----------|-----------|--------|
| `lovableBooking.steps.pickup` | "Abholung" | "Termin" | Mockup uses "Termin" |
| `lovableBooking.steps.confirm` | "Bestatigung" | "Ubersicht" | Mockup uses "Ubersicht" |
| `lovableBooking.step1.title` | "Fur welches Fahrzeug..." | "Fahrzeugdaten" | Shorter, mockup style |
| `lovableBooking.step1.licensePlate` | (new) | "Kennzeichen" | New field |
| `lovableBooking.step1.licensePlatePlaceholder` | (new) | "z.B. B-AC 1234" | New field |
| `lovableBooking.step2.title` | "Welchen Service..." | "Service wahlen" | Shorter |
| `lovableBooking.step2.services.tires` | (new) | `{name: "Reifenwechsel", description: "..."}` | New service |
| `lovableBooking.step2.services.tuv` | (new) | `{name: "TUV / HU", description: "..."}` | New service |
| `lovableBooking.step2.services.maintenance` | (new) | `{name: "Wartung", description: "..."}` | New service |
| `lovableBooking.step4.submit` | "Jetzt kostenpflichtig buchen" | "Jetzt kostenpflichtig buchen" | Keep same |
| `lovableBooking.step4.vatNote` | (new) | "inkl. MwSt. | Festpreis-Garantie" | New note |
| `lovableBooking.confirmation.title` | (new) | "Buchung erfolgreich!" | Success page |
| `lovableBooking.confirmation.bookingNumber` | (new) | "Buchungsnummer" | Success page |
| `lovableBooking.confirmation.nextSteps` | (new) | "Nachste Schritte" | Success page |

---

## 5. E2E Test Impact Analysis

### 5.1 Walkthrough Phase 1 — Landing (Screenshots 001)

**Current test:** `P1-01 - Customer: Landing Page`
- Navigates to `/${LOCALE}`, takes screenshot
- **Selector changes:** None (just navigates and screenshots)
- **Visual change:** Screenshot will look completely different (dark hero, new sections)
- **Screenshot description update:** "landing-page" remains valid but content changes dramatically

**Current test:** `P1-02 - Customer: Click Preis berechnen`
- Locator: `a:has-text("Preis berechnen"), button:has-text("Preis berechnen")`
- **BREAKING:** The CTA text changes from "Preis berechnen" to "Jetzt Termin buchen"
- **Fix:** Update locator to `a:has-text("Jetzt Termin buchen"), button:has-text("Jetzt Termin buchen")`
- Or better: use `data-testid="hero-booking-cta"` which already exists on the Hero CTA button
- **Fallback logic:** The test already has a fallback to navigate directly to `/booking`

### 5.2 Walkthrough Phase 1 — Booking (Screenshots 002-017)

**P1-03 through P1-09 — Vehicle Steps:**
- Locators: `[role="combobox"]`, `[role="option"]`, `#year`, `#mileage`
- **BREAKING if brand cards replace dropdown:** The `[role="combobox"]` selector for brand selection will break when replaced by brand card grid
- **Fix:** Add `data-testid="brand-card-BMW"` to brand cards, update selectors:
  - Old: `page.locator('[role="combobox"]').first().click()` + `[role="option"]:has-text("BMW")`
  - New: `page.locator('[data-testid="brand-card-BMW"]').click()`
- Model selector stays as `[role="combobox"]` (still a dropdown)
- Year changes from `#year` input to a `Select` dropdown: needs updated selector
- Mileage `#mileage` stays the same
- **New screenshot opportunity:** Brand card grid selection view

**P1-10 through P1-11 — Service Steps:**
- Locator: `[data-testid="service-card-inspection"]`
- **SAFE:** `data-testid` attributes are preserved
- New services (tires, tuv, maintenance) will be visible but not break existing tests

**P1-12 through P1-15 — Appointment Steps:**
- Locators: `#street`, `#zip`, `#city`, `button:has-text("Abholdatum")`, `button:has-text("Morgen")`, `.grid.grid-cols-5`, `button:has-text("+1 Woche")`
- **Potentially breaking:** If calendar becomes inline (not popover), the `button:has-text("Abholdatum")` trigger may not exist
- **Fix:** Add `data-testid="pickup-date-trigger"` and update selectors
- Time slot grid selector `.grid.grid-cols-5` may change if slots expand from 5 to 10 columns
- **Fix:** Use `data-testid="pickup-time-10:00"` instead of grid position

**P1-16 — Booking Submit:**
- Locators: `#firstName`, `#lastName`, `#email`, `#phone`, `#terms`, `button:has-text("Jetzt kostenpflichtig buchen")`
- **SAFE:** These form field IDs and button text remain the same

**P1-17 — Dashboard after booking:**
- **SAFE:** No landing/booking selectors involved

### 5.3 Walkthrough Phase 2 — Jockey Pickup (Screenshots 018-021)

- **NO IMPACT:** Phase 2 tests the jockey portal, not affected by landing/booking redesign

### 5.4 Other Affected Test Files

| Test File | Impact | Details |
|-----------|--------|---------|
| `01-landing-page.spec.ts` | **HIGH** | Tests landing page elements — all selectors for sections will change |
| `01-complete-booking-journey.spec.ts` | **MEDIUM** | Tests booking flow end-to-end — vehicle brand selector changes |
| `02-booking-flow.spec.ts` | **MEDIUM** | Tests booking form validation — vehicle step selector changes |
| `06-multi-language.spec.ts` | **LOW** | Tests DE/EN switching — may need updated text assertions |
| `booking-i18n-tests.spec.ts` | **MEDIUM** | Tests booking flow i18n — text assertions for step labels change |
| `ui-booking-flow.spec.ts` | **MEDIUM** | Tests booking UI — brand/service selector changes |
| `qa-booking-flow-audit.spec.ts` | **HIGH** | Audits booking flow elements — selector changes throughout |
| `portal-smoke-tests.spec.ts` | **LOW** | Tests portal accessibility — landing page structure may change |
| `walkthrough-en-unified.spec.ts` | **HIGH** | English version of unified walkthrough — same selector changes as DE |
| `00-quick-smoke-test.spec.ts` | **LOW** | Quick health check — may need text assertion updates |

### 5.5 E2E Migration Strategy

1. **Add `data-testid` attributes** to all new components before changing selectors
2. **Phase approach:** Update tests in parallel with component changes
3. **Key new data-testid attributes needed:**
   - `data-testid="landing-navbar"` — on the navbar
   - `data-testid="hero-section"` — on the hero
   - `data-testid="hero-booking-cta"` — already exists
   - `data-testid="how-it-works-section"` — on how-it-works
   - `data-testid="services-section"` — on services showcase
   - `data-testid="trust-section"` — on trust/social proof
   - `data-testid="cta-banner"` — on CTA banner
   - `data-testid="brand-card-{brandId}"` — on each brand card
   - `data-testid="service-card-{serviceId}"` — already exists
   - `data-testid="pickup-calendar"` — on inline calendar
   - `data-testid="pickup-time-{time}"` — on time slot pills
   - `data-testid="booking-summary"` — on summary card
   - `data-testid="booking-submit"` — on submit button

---

## 6. Component Dependency Graph

### 6.1 Implementation Order

Components should be implemented in this order to manage dependencies:

```
Phase A: Foundation (no dependencies)
├── globals.css additions (nav-glass, brand-card, service-select, etc.)
├── animated-counter.tsx (standalone utility)
├── testimonial-card.tsx (standalone)
├── landing-service-card.tsx (standalone)
├── hero-illustration.tsx (standalone SVG)
├── BrandCard.tsx (standalone)
└── cta-banner.tsx (standalone)

Phase B: Composed Components (depend on Phase A)
├── BrandCardGrid.tsx (depends on BrandCard)
├── trust-social-proof.tsx (depends on animated-counter, testimonial-card)
├── services-showcase.tsx (depends on landing-service-card)
├── StepIndicator.tsx rewrite (depends on new CSS classes)
└── Header.tsx rewrite (depends on nav-glass CSS)

Phase C: Page-Level Components (depend on Phase B)
├── Hero.tsx rewrite (depends on hero-illustration)
├── HowItWorks.tsx rewrite (depends on new CSS)
├── Footer.tsx modify (i18n changes only)
├── VehicleStep.tsx rewrite (depends on BrandCardGrid)
├── ServiceStep.tsx modify (new services, styling)
├── PickupStep.tsx modify (inline calendar, time pills)
└── ConfirmationStep.tsx modify (summary restructure)

Phase D: Assembly (depend on Phase C)
├── app/[locale]/page.tsx (new section assembly)
├── app/[locale]/booking/page.tsx (updated orchestrator)
└── messages/de.json + en.json (all i18n changes)

Phase E: E2E Test Updates (depend on Phase D)
├── walkthrough-de-unified.spec.ts (selector updates)
├── walkthrough-en-unified.spec.ts (selector updates)
├── 01-landing-page.spec.ts (full rewrite)
├── 01-complete-booking-journey.spec.ts (vehicle step selectors)
└── Other affected specs (incremental fixes)
```

### 6.2 Dependency Diagram

```
page.tsx (landing)
├── Header.tsx (rewritten)
│   └── globals.css (nav-glass, nav-scrolled)
├── Hero.tsx (rewritten)
│   ├── hero-illustration.tsx (new)
│   └── globals.css (hero-bg, hero-shape, fade-in)
├── HowItWorks.tsx (rewritten)
│   └── globals.css (step-line, fade-in)
├── services-showcase.tsx (new)
│   └── landing-service-card.tsx (new)
│       └── globals.css (service-card hover)
├── trust-social-proof.tsx (new)
│   ├── animated-counter.tsx (new)
│   └── testimonial-card.tsx (new)
│       └── globals.css (testimonial-card)
├── cta-banner.tsx (new)
└── Footer.tsx (modified)

booking/page.tsx
├── StepIndicator.tsx (rewritten)
│   └── globals.css (progress-circle, progress-line)
├── VehicleStep.tsx (rewritten)
│   └── BrandCardGrid.tsx (new)
│       └── BrandCard.tsx (new)
│           └── globals.css (brand-card)
├── ServiceStep.tsx (modified)
│   └── globals.css (service-select)
├── PickupStep.tsx (modified)
│   └── globals.css (time-pill, cal-day)
└── ConfirmationStep.tsx (modified)
```

### 6.3 Risk Assessment

| Component | Risk | Reason |
|-----------|------|--------|
| Header (navbar) | Low | Self-contained, no external consumers |
| Hero | Low | Self-contained, only used on landing |
| HowItWorks | Low | Self-contained, simple data change |
| ServicesShowcase | Low | New component, no existing dependencies |
| TrustSocialProof | Low | New component, no existing dependencies |
| CTABanner | Low | New component, no existing dependencies |
| Footer | Low | Minor modifications, mostly i18n |
| **StepIndicator** | **Medium** | Used by both public and authenticated booking flows |
| **VehicleStep** | **High** | Brand card grid changes selector patterns; affects multiple E2E tests |
| ServiceStep | Medium | Adding services requires i18n + API price changes |
| PickupStep | Medium | Calendar change affects UX flow significantly |
| ConfirmationStep | Low | Layout change, same data model |
| **page.tsx (landing)** | **Medium** | Import changes affect all landing tests |
| **page.tsx (booking)** | Low | Minor orchestrator changes |
| **i18n files** | **Medium** | Must update both DE and EN simultaneously; breaking if keys removed |

---

*End of Landing Page & Booking Flow Implementation Plan*
