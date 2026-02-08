# Frontend File Inventory

**Date:** 2026-02-08
**Scope:** `/99 Code/frontend/` -- all source files excluding `node_modules`

---

## Table of Contents

1. [Summary Statistics](#1-summary-statistics)
2. [Page Components (Routes)](#2-page-components-routes)
3. [Shared Components](#3-shared-components)
4. [UI Primitives (shadcn/ui)](#4-ui-primitives-shadcnui)
5. [Layout and Navigation](#5-layout-and-navigation)
6. [Styling](#6-styling)
7. [i18n Structure](#7-i18n-structure)
8. [API Layer and Utilities](#8-api-layer-and-utilities)
9. [E2E Test Specs](#9-e2e-test-specs)
10. [Existing UX Docs](#10-existing-ux-docs)

---

## 1. Summary Statistics

| Category | Count |
|----------|-------|
| Page components (page.tsx) | 36 |
| Layout files (layout.tsx) | 2 |
| Shared components | ~70 |
| UI primitives (shadcn) | 21 |
| lib/ source files | 29 |
| i18n message files | 2 (de.json, en.json) |
| E2E specs (active) | 32 |
| E2E specs (archived) | 5 |
| CSS files | 1 (globals.css, 363 lines) |
| Docs (frontend) | 3 markdown files |

**Total frontend source lines (excl. node_modules):** ~18,000 (pages + components + lib)

---

## 2. Page Components (Routes)

### 2.1 Root & Landing

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/` | `app/page.tsx` | 9 | Redirects to `/de` | None | `redirect` from next/navigation |
| `/[locale]` | `app/[locale]/page.tsx` | 41 | Landing page | `useTranslations` (next-intl) | Header, Hero, PortalCards, ValueProps, HowItWorks, FAQ, Footer from `@/components/landing/` |

### 2.2 Public Booking Flow (4-step wizard, unauthenticated)

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/[locale]/booking` | `app/[locale]/booking/page.tsx` | 307 | 4-step wizard: Vehicle > Service > Pickup > Confirmation | `useLanguage` (Lovable adapter) | ConciergeBanner, StepIndicator, VehicleStep, ServiceStep, PickupStep, ConfirmationStep, bookingsApi |
| `/[locale]/booking/register` | `app/[locale]/booking/register/page.tsx` | 354 | Post-booking registration | `useLanguage` | Pre-fills from URL params, direct fetch to API |
| `/[locale]/booking/success` | `app/[locale]/booking/success/page.tsx` | 169 | Booking success confirmation | `useLanguage` | Displays booking number, link to dashboard |

### 2.3 Customer Portal (15 pages)

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/[locale]/customer/login` | `customer/login/page.tsx` | 84 | Split-screen login | `useTranslations('customerLogin')` | LoginForm |
| `/[locale]/customer/register` | `customer/register/page.tsx` | 288 | Registration form | `useLanguage` | Direct fetch to API |
| `/[locale]/customer/dashboard` | `customer/dashboard/page.tsx` | 550 | Main dashboard: sidebar nav, stats, booking list, status filters, search, sort, progress indicators | `useLanguage` | ProtectedRoute, bookingsApi, NotificationCenter, LanguageSwitcher |
| `/[locale]/customer/bookings` | `customer/bookings/page.tsx` | 329 | Full booking list with cancel dialog | `useLanguage` | bookingsApi, ProtectedRoute |
| `/[locale]/customer/bookings/[id]` | `customer/bookings/[id]/page.tsx` | 459 | Booking detail with Details/Extensions tabs, pending extension banner | `useLanguage` | ExtensionList, bookingsApi |
| `/[locale]/customer/booking` | `customer/booking/page.tsx` | 189 | Authenticated vehicle selection (step 1/3) | `useLanguage` | VehicleSelectionForm, BookingStepper, ProtectedRoute |
| `/[locale]/customer/booking/service` | `customer/booking/service/page.tsx` | 142 | Service selection with pricing API | `useLanguage` | ServiceCard, PriceDisplay, pricing API |
| `/[locale]/customer/booking/service/demo` | `customer/booking/service/demo/page.tsx` | 195 | Demo page for PriceDisplay component | `useLanguage` | PriceDisplay |
| `/[locale]/customer/booking/appointment` | `customer/booking/appointment/page.tsx` | 220 | Pickup scheduling (step 3/3) | `useLanguage` | Date/time pickers, address fields |
| `/[locale]/customer/booking/payment` | `customer/booking/payment/page.tsx` | 196 | Stripe/Demo payment | `useLanguage` | StripeCheckout, DemoPaymentForm |
| `/[locale]/customer/booking/confirmation` | `customer/booking/confirmation/page.tsx` | 287 | Post-payment confirmation | `useLanguage` | Booking summary display |
| `/[locale]/customer/vehicles` | `customer/vehicles/page.tsx` | 62 | Placeholder vehicle list | `useLanguage` | ProtectedRoute |
| `/[locale]/customer/profile` | `customer/profile/page.tsx` | 68 | Read-only profile display | `useLanguage` | ProtectedRoute |
| `/[locale]/customer/notifications` | `customer/notifications/page.tsx` | 316 | Notification list with pagination | `useLanguage` | ProtectedRoute, notification types |
| `/[locale]/customer/faq` | `customer/faq/page.tsx` | 138 | FAQ accordion | Inline German-only content | Accordion component |
| `/[locale]/customer/verify` | `customer/verify/page.tsx` | 132 | Magic link email verification | `useLanguage` | Direct fetch to API |

### 2.4 Jockey Portal (4 pages)

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/[locale]/jockey/login` | `jockey/login/page.tsx` | 149 | Split-screen login (username/password) | `useTranslations('login')` | useAuth |
| `/[locale]/jockey/dashboard` | `jockey/dashboard/page.tsx` | 593 | **Largest page.** Sticky green header, stats cards, date-grouped timeline, type/status filters, Google Maps navigation, call buttons. 44px min touch targets. | `useLanguage` | HandoverModal, jockeysApi, ProtectedRoute |
| `/[locale]/jockey/stats` | `jockey/stats/page.tsx` | 81 | Placeholder statistics page | `useLanguage` | ProtectedRoute |
| `/[locale]/jockey/availability` | `jockey/availability/page.tsx` | 151 | Weekly availability toggle with time slots | `useLanguage` | ProtectedRoute |

### 2.5 Workshop Portal (5 pages)

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/[locale]/workshop/login` | `workshop/login/page.tsx` | 149 | Split-screen login (username/password) | `useTranslations('login')` | useAuth |
| `/[locale]/workshop/dashboard` | `workshop/dashboard/page.tsx` | 569 | Table-based order management with pagination, status filters, search. FSM status mapping. | `useLanguage` | OrderDetailsModal, ExtensionModal, workshopsApi, ProtectedRoute |
| `/[locale]/workshop/calendar` | `workshop/calendar/page.tsx` | 191 | Weekly calendar grid | `useTranslations('workshopCalendar')` | Placeholder data |
| `/[locale]/workshop/stats` | `workshop/stats/page.tsx` | 107 | 4 KPI cards | `useTranslations('workshopStats')` | Placeholder data |
| `/[locale]/workshop/team` | `workshop/team/page.tsx` | 66 | "Coming soon" placeholder | `useTranslations('workshopTeam')` | None |

### 2.6 Admin Portal (1 page)

| Route | File | Lines | Purpose | i18n Approach | Key Imports |
|-------|------|-------|---------|---------------|-------------|
| `/[locale]/admin/analytics` | `admin/analytics/page.tsx` | 543 | Performance dashboard: MetricCards, date range, revenue/booking breakdowns, user metrics, top jockeys/workshops tables | Inline EN-only labels | analyticsApi, ProtectedRoute |

### 2.7 Static Pages

| Route | File | Lines | Purpose | i18n Approach |
|-------|------|-------|---------|---------------|
| `/[locale]/privacy` | `privacy/page.tsx` | 36 | Privacy policy placeholder | Inline DE/EN |
| `/[locale]/terms` | `terms/page.tsx` | 36 | Terms placeholder | Inline DE/EN |
| `/[locale]/imprint` | `imprint/page.tsx` | 48 | Imprint placeholder | Inline DE/EN |
| `/[locale]/forgot-password` | `forgot-password/page.tsx` | 95 | Password reset form (TODO: no API call) | `useLanguage` |
| `/[locale]/support` | `support/page.tsx` | 85 | Contact info cards | `useLanguage` |

---

## 3. Shared Components

### 3.1 Landing Components (`components/landing/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| Header | `landing-header.tsx` | ~60 | Top navigation with nav links, login button, language switcher | Landing page |
| Hero | `hero-section.tsx` | ~120 | Hero banner with gradient, CTA, trust badge, ratings | Landing page |
| HeroPortals | `hero-section-portals.tsx` | ~80 | Alternative hero with portal cards | Not actively used |
| HeroAB | `hero-section-ab.tsx` | ~80 | A/B test variant hero | Not actively used |
| PortalCards | `PortalCards.tsx` | ~60 | Three portal cards (Customer/Jockey/Workshop) with colored borders | Landing page |
| ValueProps | `value-props-section.tsx` | ~80 | "Warum AutoConcierge?" 4-card section | Landing page |
| HowItWorks | `how-it-works-section.tsx` | ~60 | 3-step process section | Landing page |
| HowItWorksSteps | `how-it-works-steps.tsx` | ~60 | Step components for how-it-works | Landing page |
| FAQ | `faq-section.tsx` | ~50 | FAQ accordion section | Landing page |
| FAQAccordion | `faq-accordion.tsx` | ~40 | FAQ individual accordion item | Landing page |
| PricingSection | `pricing-section.tsx` | ~80 | Service pricing display | Landing page |
| StatsSection | `stats-section.tsx` | ~50 | Statistics display | Landing page |
| TestimonialsSection | `testimonials-section.tsx` | ~60 | Customer testimonials | Landing page |
| TrustBadgesRow | `trust-badges-row.tsx` | ~40 | Trust badge row | Landing page |
| TrustSection | `trust-section.tsx` | ~40 | Trust elements section | Landing page |
| USPSection | `usp-section.tsx` | ~50 | Unique selling points | Landing page |
| WhyRonyaSection | `why-ronya-section.tsx` | ~50 | "Why Ronya?" section | Landing page |
| FinalCTASection | `final-cta-section.tsx` | ~40 | Bottom CTA section | Landing page |
| WorkshopShowcase | `workshop-showcase.tsx` | ~60 | Workshop partner showcase | Landing page |
| Footer | `landing-footer.tsx` | ~80 | Footer with links (Quick Links, Rechtliches, Kontakt) | Landing page |
| LanguageSwitcher | `language-switcher.tsx` | ~40 | DE/EN toggle | Header |

### 3.2 Booking Components (`components/booking/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| StepIndicator | `StepIndicator.tsx` | ~50 | 4-step progress bar with checkmarks | Public booking flow |
| ConciergeBanner | `ConciergeBanner.tsx` | ~30 | Green info banner "Concierge-Service inklusive" | Public booking flow |
| VehicleStep | `VehicleStep.tsx` | ~150 | Vehicle brand/model/year/mileage form | Public booking (step 1) |
| ServiceStep | `ServiceStep.tsx` | ~120 | Service selection cards | Public booking (step 2) |
| PickupStep | `PickupStep.tsx` | 417 | Date/time/address picker for pickup/return | Public booking (step 3) |
| ConfirmationStep | `ConfirmationStep.tsx` | ~200 | Summary + contact form + submit | Public booking (step 4) |

### 3.3 Payment Components (`components/payment/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| DemoPaymentForm | `demo-payment-form.tsx` | ~120 | Simulated payment for DEMO_MODE | Customer payment page |
| StripeCheckout | `stripe-checkout.tsx` | ~150 | Real Stripe payment form | Customer payment page |
| PaymentStatus | `payment-status.tsx` | ~80 | Payment status indicator | Customer payment page |
| PaymentForm | `payment-form.tsx` | ~100 | Generic payment form wrapper | Customer payment page |
| PaymentSummary | `payment-summary.tsx` | ~60 | Order summary during checkout | Customer payment page |

### 3.4 Customer Components (`components/customer/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| ExtensionList | `ExtensionList.tsx` | ~150 | List of extensions with approve/decline | Booking detail page |
| ExtensionApprovalModal | `ExtensionApprovalModal.tsx` | 521 | Full extension review + payment modal | Booking detail page |
| VehicleSelectionForm | `VehicleSelectionForm.tsx` | ~200 | Authenticated vehicle selection with saved vehicles | Customer booking (step 1) |
| RatingModal | `RatingModal.tsx` | ~100 | Star rating + comment after delivery | Customer dashboard |
| BookingSummary | `BookingSummary.tsx` | ~80 | Booking info summary card | Customer booking confirmation |
| BookingStepper | `BookingStepper.tsx` | ~60 | 3-step progress bar for authenticated flow | Customer booking |
| ServiceCard | `ServiceCard.tsx` | ~100 | Individual service card with price | Customer booking (step 2) |
| PriceDisplay | `PriceDisplay.tsx` | ~120 | Price breakdown display | Customer booking (step 2) |
| NotificationCenter | `NotificationCenter.tsx` | ~80 | Notification bell with badge | Customer dashboard |

### 3.5 Jockey Components (`components/jockey/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| HandoverModal | `HandoverModal.tsx` | 421 | Vehicle handover with photo upload, notes, confirmation | Jockey dashboard |
| JockeyPhotoUpload | `jockey-photo-upload.tsx` | ~100 | Camera/gallery photo upload | HandoverModal |

### 3.6 Workshop Components (`components/workshop/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| OrderDetailsModal | `OrderDetailsModal.tsx` | 545 | Full order detail view with status update | Workshop dashboard |
| ExtensionModal | `ExtensionModal.tsx` | ~200 | Create extension with items, photos, videos | Workshop dashboard |
| WorkshopPhotoUpload | `workshop-photo-upload.tsx` | ~100 | Photo upload for extensions | ExtensionModal |

### 3.7 Upload Components (`components/upload/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| FileUploader | `file-uploader.tsx` | ~120 | Drag-and-drop file upload with validation | Photo upload components |
| ImagePreview | `image-preview.tsx` | ~60 | Image thumbnail preview with remove | Photo upload components |
| UploadProgress | `upload-progress.tsx` | ~40 | Upload progress bar | FileUploader |

### 3.8 Notification Components (`components/notifications/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| NotificationPermission | `notification-permission.tsx` | ~60 | FCM permission request | Customer dashboard |
| NotificationList | `notification-list.tsx` | ~80 | Notification feed list | Customer notifications page |

### 3.9 Auth Components (`components/auth/`)

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| LoginForm | `LoginForm.tsx` | ~100 | Generic login form (email + password) | Customer login page |
| ProtectedRoute | `ProtectedRoute.tsx` | ~60 | Role-based route guard, redirects to login | All portal dashboards |
| LogoutButton | `LogoutButton.tsx` | ~30 | Logout trigger | Portal headers |

### 3.10 Shared/Layout Components

| Component | File | Lines | Purpose | Used By |
|-----------|------|-------|---------|---------|
| LanguageSwitcher | `LanguageSwitcher.tsx` | ~40 | DE/EN toggle button | Customer dashboard, headers |
| DarkModeToggle | `DarkModeToggle.tsx` | ~30 | Light/dark theme toggle | Not actively used |
| DemoBanner | `DemoBanner.tsx` | ~30 | Yellow banner showing DEMO_MODE is active | Root layout |
| DebugLogger | `DebugLogger.tsx` | 368 | Development debug panel (tokens, API calls) | Root layout |
| ErrorBoundary | `ErrorBoundary.tsx` | ~40 | React error boundary | App wrapper |
| NavLink | `NavLink.tsx` | ~20 | Active-state navigation link | Portal sidebars |

### 3.11 Legacy Root-Level Duplicates (`components/`)

These appear to be older versions that are also present in `components/landing/`:

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Header | `Header.tsx` | Landing header | **Duplicate** -- `landing/landing-header.tsx` |
| Hero | `Hero.tsx` | Landing hero | **Duplicate** -- `landing/hero-section.tsx` |
| Footer | `Footer.tsx` | Landing footer | **Duplicate** -- `landing/landing-footer.tsx` |
| FAQ | `FAQ.tsx` | FAQ section | **Duplicate** -- `landing/faq-section.tsx` |
| PortalCards | `PortalCards.tsx` | Portal cards | **Duplicate** -- `landing/PortalCards.tsx` |
| HowItWorks | `HowItWorks.tsx` | How-it-works | **Duplicate** -- `landing/how-it-works-section.tsx` |
| ValueProps | `ValueProps.tsx` | Value props | **Duplicate** -- `landing/value-props-section.tsx` |

> **Note:** The landing page (`app/[locale]/page.tsx`) imports from `@/components/landing/`, making the root-level duplicates unused. These can be removed during redesign.

---

## 4. UI Primitives (shadcn/ui)

All located in `components/ui/`. Configured via `components.json` (default style, RSC enabled, slate base color, CSS variables).

| Component | File | Props/Variants |
|-----------|------|----------------|
| Accordion | `accordion.tsx` | Item, Trigger, Content |
| Alert | `alert.tsx` | variant: default, destructive |
| Badge | `badge.tsx` | variant: default, secondary, destructive, outline + custom CSS classes |
| Button | `button.tsx` | variant: default, destructive, outline, secondary, ghost, link; size: default, sm, lg, icon |
| Calendar | `calendar.tsx` | date-fns based date picker |
| Card | `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Checkbox | `checkbox.tsx` | Standard checkbox |
| Dialog | `dialog.tsx` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter |
| DropdownMenu | `dropdown-menu.tsx` | Full dropdown menu system |
| Input | `input.tsx` | Standard text input |
| Label | `label.tsx` | Form label |
| Popover | `popover.tsx` | Popover, PopoverTrigger, PopoverContent |
| ScrollArea | `scroll-area.tsx` | Scrollable container |
| Select | `select.tsx` | Select, SelectTrigger, SelectContent, SelectItem, SelectValue |
| Separator | `separator.tsx` | Horizontal/vertical separator |
| Sheet | `sheet.tsx` | Side panel overlay (mobile nav) |
| Table | `table.tsx` | Table, TableHeader, TableBody, TableRow, TableHead, TableCell |
| Tabs | `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| Textarea | `textarea.tsx` | Multi-line text input |
| Tooltip | `tooltip.tsx` | Tooltip, TooltipTrigger, TooltipContent |
| TrustBadge | `trust-badge.tsx` | Custom trust indicator component |

---

## 5. Layout and Navigation

### 5.1 Layout Files

| File | Lines | Purpose |
|------|-------|---------|
| `app/layout.tsx` | 36 | Root layout: Inter font, `<DemoBanner>`, `<AuthProvider>`, `<Toaster>`, `<DebugLogger>` |
| `app/[locale]/layout.tsx` | 32 | Locale layout: `<NextIntlClientProvider>` with locale validation, loads messages from JSON |

### 5.2 Navigation Per Portal

| Portal | Navigation Pattern | Components |
|--------|--------------------|------------|
| **Landing** | Top header bar with inline links: Home, So funktioniert's, FAQ. Login button + language switcher in top-right. | `landing-header.tsx`, `LanguageSwitcher` |
| **Customer** | Sidebar navigation (desktop): Dashboard, Neue Buchung, Meine Buchungen, Fahrzeuge, Profil. Collapsible on mobile. NotificationCenter + LanguageSwitcher in header. | Inline in `dashboard/page.tsx`, `ProtectedRoute` |
| **Jockey** | Sticky green top bar with stats. No sidebar. Filter tabs for assignment type/status. Bottom action buttons on cards. | Inline in `dashboard/page.tsx`, green `bg-jockey` theming |
| **Workshop** | Orange top bar. Table-based main view. Top filter bar (status tabs + search). Sidebar links: Calendar, Stats, Team. | Inline in `dashboard/page.tsx`, orange `bg-workshop` theming |
| **Admin** | Minimal header. Date range selector. Tab-style metric navigation. | Inline in `analytics/page.tsx` |

> **Observation:** Each portal embeds its navigation inline in the dashboard page. There are no shared layout components per portal -- this means navigation code is duplicated and must be maintained per-page.

---

## 6. Styling

### 6.1 Configuration

| File | Lines | Purpose |
|------|-------|---------|
| `postcss.config.mjs` | 6 | `@tailwindcss/postcss` plugin (Tailwind CSS v4) |
| `app/globals.css` | 363 | Complete CSS design system |
| `components.json` | 22 | shadcn/ui config: default style, slate base, CSS variables |

**Note:** There is **no `tailwind.config.ts`**. The project uses Tailwind CSS v4 with the `@tailwindcss/postcss` plugin and CSS-variable-based theming defined entirely in `globals.css`.

### 6.2 CSS Custom Properties (globals.css)

#### Color System (HSL format)

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--primary` | 224 88% 55% | 217 91% 60% | Primary blue |
| `--cta` | 25 95% 53% | 25 95% 58% | Orange CTA buttons |
| `--success` | 142 76% 36% | 142 76% 40% | Success states |
| `--jockey` | 142 71% 45% | 142 71% 50% | Jockey portal accent (green) |
| `--workshop` | 25 95% 53% | 25 95% 58% | Workshop portal accent (orange) |
| `--background` | 0 0% 100% | 222 47% 11% | Page background |
| `--foreground` | 222 47% 11% | 210 40% 98% | Text color |
| `--destructive` | 0 84% 60% | 0 62% 30% | Error/destructive |

**Issue identified in audit:** CTA and workshop colors are identical (`25 95% 53%`), causing brand confusion.

#### Custom CSS Classes

| Class | Purpose |
|-------|---------|
| `card-premium` | Elevated card with shadow and hover effect |
| `portal-card-customer`, `portal-card-jockey`, `portal-card-workshop` | Colored left-border portal cards |
| `badge-pending`, `badge-pickup`, `badge-transit`, `badge-in-progress`, `badge-ready`, `badge-return`, `badge-completed`, `badge-destructive` | Status badge color variants |
| `section-spacing` | Consistent vertical spacing for landing sections |
| `btn-premium` | Premium button with gradient and shadow |
| `trust-badge` | Trust indicator styling |
| `step-indicator` | Booking progress step styling |
| `input-premium` | Enhanced input field styling |

#### Animations

| Animation | Purpose |
|-----------|---------|
| `fadeIn` | Opacity 0 to 1 |
| `fadeInUp` | Opacity + translate Y |
| `slideInRight` | Slide from right |
| `delay-100` through `delay-500` | Staggered animation delays |

#### Shadows

| Variable | Purpose |
|----------|---------|
| `--shadow-subtle` | Minimal shadow for flat cards |
| `--shadow-card` | Default card shadow |
| `--shadow-elevated` | Elevated card shadow |
| `--shadow-premium` | Premium shadow with subtle blue tint |

---

## 7. i18n Structure

### 7.1 Configuration

| File | Lines | Purpose |
|------|-------|---------|
| `i18n.ts` | ~20 | Defines locales `['de', 'en']`, default `'de'`, loads `./messages/${locale}.json` |
| `next.config.ts` | ~15 | `createNextIntlPlugin()` wrapping config |
| `middleware.ts` | ~10 | next-intl middleware for locale routing |

### 7.2 Two i18n Approaches (IMPORTANT)

The codebase uses **two different i18n approaches** simultaneously:

| Approach | Hook | Source | Used By |
|----------|------|--------|---------|
| **next-intl native** | `useTranslations('namespace')` | `next-intl` package | Login pages, workshop calendar/stats/team, landing page |
| **Lovable adapter** | `useLanguage()` / `useLovableTranslation()` | `lib/i18n/useLovableTranslation.ts` (553 lines) | Most dashboard pages, booking flows, customer portal |

The Lovable adapter (`useLovableTranslation`) wraps `useTranslations` calls for ~20 namespaces into a single flat object `t`, plus provides `language` and `setLanguage()`. It exists to bridge Lovable-generated components with next-intl.

**Recommendation for redesign:** Converge on `useTranslations` directly, eliminating the 553-line adapter.

### 7.3 Message File Structure

**`messages/de.json`** (1452 lines) and **`messages/en.json`** (similar structure)

Top-level namespaces:

| Namespace | Purpose | Used By |
|-----------|---------|---------|
| `common` | Shared labels (search, cancel, save, back, next, etc.) | Various |
| `vehicleForm` | Vehicle form labels and errors | VehicleStep, VehicleSelectionForm |
| `navigation` | Top nav labels | Header |
| `workshop` | Workshop search/details | Workshop search (unused?) |
| `booking` | Extensive booking flow labels (slots, contact, summary, pricing, service types) | Booking flow |
| `vehicleSelection` | Vehicle class selection | Booking flow |
| `vehicleClass` | Vehicle class labels | Booking flow |
| `appointment` | Appointment scheduling | Booking flow |
| `waitlist` | Waitlist labels | Booking flow |
| `validation` | Form validation messages | Forms |
| `dates` | Date formatting labels | Date displays |
| `feedback` | Rating/feedback labels | RatingModal |
| `dashboard` | Generic dashboard labels | Dashboards |
| `error` | Error messages | Error states |
| `landing` | Landing page sections | Landing page |
| `footer` | Footer links | Footer |
| `tracking` | Booking tracking labels | Tracking page |
| `jockey` | Jockey-specific labels | Jockey portal |
| `header` | Header navigation | Header |
| `hero` | Hero section | Hero |
| `portals` | Portal card labels | PortalCards |
| `values` | Value proposition labels | ValueProps |
| `howItWorks` | How-it-works labels | HowItWorks |
| `faq` | FAQ questions/answers (6 items) | FAQ section |
| `lovableFooter` | Lovable-style footer labels | Footer |
| `lovableBooking` | Lovable-style booking labels (steps 1-4) | Booking flow |
| `login` | Login form labels + portal titles/descriptions | All login pages |
| `customerDashboard` | Customer nav, stats, status labels | Customer dashboard |
| `jockeyDashboard` | Jockey assignments, stats, filters, actions | Jockey dashboard |
| `jockeyStats` | Jockey statistics | Jockey stats page |
| `jockeyAvailability` | Availability labels (days, time slots) | Jockey availability |
| `workshopDashboard` | Workshop orders, table, status, filters, pagination, toast | Workshop dashboard |
| `payment` | Payment labels | Payment page |
| `bookingPayment` | Booking payment labels | Payment page |
| `bookingConfirmation` | Confirmation labels | Confirmation page |
| `protectedRoute` | Auth guard messages | ProtectedRoute |
| `extensions` | Extension labels | Extension components |
| `extensionApproval` | Extension approval flow labels | ExtensionApprovalModal |
| `bookingPage` | Authenticated booking page labels | Customer booking |
| `serviceSelectionPage` | Service selection labels | Customer booking step 2 |
| `serviceCard` | Service card labels | ServiceCard component |
| `bookingSummary` | Booking summary labels | BookingSummary |
| `priceDisplay` | Price display labels | PriceDisplay |
| `bookingStepper` | Stepper labels | BookingStepper |
| `customerLogin` | Customer login specific | Customer login page |
| `services` | Service names and descriptions | Service selection |
| `workshopModal` | Workshop modal labels | OrderDetailsModal |
| `workshopCalendar` | Calendar labels | Workshop calendar |
| `workshopStats` | Stats labels | Workshop stats |
| `workshopTeam` | Team page labels | Workshop team |

**Known issues:** Some pages use inline hardcoded German text (e.g., customer/faq, admin/analytics) instead of i18n keys. Several booking detail pages show untranslated status enums like "INSPECTION" (audit ref).

---

## 8. API Layer and Utilities

### 8.1 API Client (`lib/api/`)

| File | Lines | Purpose | Endpoints |
|------|-------|---------|-----------|
| `client.ts` | 72 | Base `ApiClient` class with auth headers | GET, POST, PUT, PATCH, DELETE |
| `bookings.ts` | 327 | Booking CRUD, status, extensions, demo payment | `/api/bookings/*`, `/api/extensions/*`, `/api/payment/*`, `/api/demo/*` |
| `pricing.ts` | 63 | Price calculation per service/vehicle | `/api/services/{type}/price`, `/api/services` |
| `vehicles.ts` | 143 | Brand/model lookup with fallback data | `/api/services/brands`, `/api/services/brands/{id}/models`, `/api/vehicles` |
| `jockeys.ts` | 163 | Assignment management, status updates, handover | `/api/jockeys/assignments/*` |
| `workshops.ts` | 119 | Order management, status updates, extensions | `/api/workshops/orders/*` |
| `analytics.ts` | 410 | Admin analytics: bookings, revenue, users, performance | `/api/analytics/*` |

**Base URL:** `NEXT_PUBLIC_API_URL` or `http://localhost:5001`
**Auth:** Bearer token from `localStorage` via `tokenStorage`

### 8.2 Auth Layer (`lib/auth/`)

| File | Lines | Purpose |
|------|-------|---------|
| `types.ts` | 29 | `UserRole` (customer/jockey/workshop/admin), `User`, `AuthState`, `LoginCredentials`, `AuthResponse`, `AuthContextType` |
| `auth-api.ts` | 77 | Login per role (customer uses email, jockey/workshop use username), `getCurrentUser`, role normalization (UPPERCASE -> lowercase) |
| `token-storage.ts` | 22 | `localStorage` wrapper with SSR safety (`typeof window === 'undefined'` guard) |

| File | Lines | Purpose |
|------|-------|---------|
| `auth-context.tsx` | 117 | React Context `AuthProvider`: loads user on mount with 3s timeout, `login()` redirects to `/${locale}/${role}/dashboard`, `logout()` redirects to `/${locale}` |
| `auth-hooks.ts` | 54 | `useAuth()`, `useUser()`, `useRole()`, `useRequireAuth()` hooks |

### 8.3 Contexts (`lib/contexts/`)

| File | Lines | Purpose |
|------|-------|---------|
| `BookingContext.tsx` | 108 | Booking flow state: vehicleData, selectedService, appointmentData, currentStep, navigation |
| `StripeContext.tsx` | 61 | Stripe Elements provider wrapping `loadStripe()` |

### 8.4 Constants (`lib/constants/`)

| File | Lines | Purpose |
|------|-------|---------|
| `vehicles.ts` | 233 | `VEHICLE_BRANDS` (20 German market brands with logo URLs) and `VEHICLE_MODELS` (models per brand). Fallback data when API unavailable. |
| `services.ts` | 47 | `AVAILABLE_SERVICES` array (5 services: inspection, oil_service, brake_service, tuv, climate_service) with i18n keys and icons |

### 8.5 Types (`lib/types/`)

| File | Lines | Purpose |
|------|-------|---------|
| `service.ts` | 39 | `ServiceType` enum, `VehicleData`, `PriceBreakdown`, `PriceResponse` interfaces |
| `notifications.ts` | 213 | `NotificationType` enum (10 types), `Notification`, `NotificationConfig`, `NotificationPreferences`, `NOTIFICATION_CONFIGS` |
| `upload.ts` | 80 | `UploadResult`, `UploadProgress`, `UploadOptions`, `UploadFolder` type, `UPLOAD_CONFIG` (10MB image, 50MB video limits) |

### 8.6 Hooks (`lib/hooks/`)

| File | Lines | Purpose |
|------|-------|---------|
| `use-file-upload.ts` | 257 | File upload hook with progress tracking, multi-file, validation |
| `useNotifications.ts` | 121 | Notification polling, unread count, mark-as-read |

### 8.7 Firebase (`lib/firebase/`)

| File | Lines | Purpose |
|------|-------|---------|
| `config.ts` | 46 | Firebase app initialization (API key from env vars) |
| `messaging.ts` | 198 | FCM messaging: `getToken()`, `onMessageListener()`, permission request |

### 8.8 Notifications (`lib/notifications/`)

| File | Lines | Purpose |
|------|-------|---------|
| `notification-service.ts` | 17 | Notification API calls wrapper |
| `polling-service.ts` | 50 | Periodic notification polling (fallback for FCM) |

### 8.9 Validations (`lib/validations/`)

| File | Lines | Purpose |
|------|-------|---------|
| `vehicle-schema.ts` | 59 | Zod schema for vehicle form: brand, model, year (1994-current), mileage (0-500k). Includes plausibility check for unrealistic year/mileage combinations. |

### 8.10 Utilities

| File | Lines | Purpose |
|------|-------|---------|
| `lib/utils.ts` | 6 | `cn()` function (clsx + tailwind-merge) |
| `lib/utils/currency.ts` | 35 | `formatEuro()` (Intl.NumberFormat de-DE), `formatCents()`, `formatNumber()` |

---

## 9. E2E Test Specs

### 9.1 Test Configuration

| File | Lines | Purpose |
|------|-------|---------|
| `playwright.config.ts` | 159 | 5 browser projects: chromium-desktop (1280x720), chromium-mobile (iPhone 13), firefox-desktop, webkit-desktop, tablet (iPad gen 7). Sequential execution. Base URL: `http://localhost:3000`. |
| `e2e/global-setup.ts` | -- | Referenced in config, global test setup |

### 9.2 Walkthrough Specs (comprehensive, sequential)

| File | Lines | Tests | Phases | Purpose |
|------|-------|-------|--------|---------|
| `walkthrough-de-unified.spec.ts` | 988 | 44 tests | P1-P8 | Full German-language lifecycle walkthrough with sequential screenshots |
| `walkthrough-en-unified.spec.ts` | 1146 | ~44 tests | P1-P8 | Full English-language lifecycle walkthrough |

**Walkthrough Phases:**

| Phase | Description | Screenshots |
|-------|-------------|-------------|
| P1 (16 tests) | Customer: Landing > Vehicle > Service > Appointment > Submit > Register > Dashboard | 001-017 |
| P2 (3 tests) | Jockey: Login > Dashboard > Pickup flow (en_route > at_location > complete) | 018-021 |
| P3 (1 test) | Workshop: Login > Dashboard AT_WORKSHOP | 022-024 |
| P4 (1 test) | Workshop: Dashboard IN_SERVICE | 025-028 |
| P5 (11 tests) | Extension: Workshop creates > Customer reviews > Approves > Pays | 029-042 |
| P6 (2 tests) | Workshop: READY_FOR_RETURN > RETURN_ASSIGNED | 043-046 |
| P7 (4 tests) | Jockey: Return assignment flow | 047-050 |
| P8 (2 tests) | Customer: Final completed state | 051-052 |

### 9.3 Numbered Spec Files

| File | Lines | Purpose |
|------|-------|---------|
| `00-quick-smoke-test.spec.ts` | 88 | Quick app health check |
| `00-demo-smoke-test.spec.ts` | 401 | Full demo mode smoke test |
| `01-landing-page.spec.ts` | 92 | Landing page elements verification |
| `01-complete-booking-journey.spec.ts` | 496 | End-to-end booking flow |
| `02-booking-flow.spec.ts` | 158 | Booking form validation |
| `03-customer-portal.spec.ts` | 129 | Customer portal smoke test |
| `04-jockey-portal.spec.ts` | 131 | Jockey portal smoke test |
| `05-workshop-portal.spec.ts` | 101 | Workshop portal smoke test |
| `06-multi-language.spec.ts` | 143 | DE/EN language switching |
| `07-extension-approval-flow.spec.ts` | 172 | Extension approval workflow |
| `08-extension-integration.spec.ts` | 127 | Extension integration tests |
| `09-complete-e2e-journey.spec.ts` | 801 | Complete lifecycle E2E |
| `10-complete-e2e-with-auth.spec.ts` | 385 | Lifecycle with authentication |
| `11-jockey-handover-flow.spec.ts` | 267 | Jockey pickup/handover flow |
| `12-extension-flow.spec.ts` | 241 | Extension creation and approval |
| `13-return-journey.spec.ts` | 262 | Return assignment flow |

### 9.4 Named Spec Files

| File | Lines | Purpose |
|------|-------|---------|
| `master-journey.spec.ts` | 312 | Master lifecycle journey |
| `auth-flows.spec.ts` | 229 | Authentication flow tests |
| `en-locale-flow.spec.ts` | 184 | English locale flow |
| `booking-i18n-tests.spec.ts` | 457 | Booking flow i18n tests |
| `ui-booking-flow.spec.ts` | 225 | UI booking flow tests |
| `full-lifecycle-screenshots.spec.ts` | 360 | Full lifecycle with screenshots |
| `take-screenshots.spec.ts` | 555 | Screenshot capture utility |
| `customer-journey.spec.ts` | 374 | Customer journey tests |
| `portal-smoke-tests.spec.ts` | 184 | Portal accessibility smoke tests |
| `qa-navigation-audit.spec.ts` | 442 | Navigation audit tests |
| `qa-portal-interactions.spec.ts` | 613 | Portal interaction audit |
| `qa-booking-flow-audit.spec.ts` | 830 | Booking flow audit |
| `qa-route-audit.spec.ts` | 364 | Route accessibility audit |

### 9.5 Archived Specs (`e2e/_archived/`)

| File | Reason |
|------|--------|
| `booking-flow.spec.ts` | Superseded by numbered specs |
| `workshop-dashboard.spec.ts` | Superseded |
| `i18n.spec.ts` | Superseded by `06-multi-language` |
| `components.spec.ts` | Superseded |
| `visual-regression.spec.ts` | Superseded |

---

## 10. Existing UX Docs

### 10.1 Frontend Docs (`docs/`)

| File | Purpose | Key Content |
|------|---------|-------------|
| `ux-audit-report.md` | Comprehensive UX/UI audit of all portals | 8 sections, graded B-. Top issues: Stripe placeholder, price discrepancy, untranslated enums. Covers landing, booking flow (4 phases), customer/jockey/workshop portals, cross-cutting issues. |
| `ux-improvement-proposals.md` | Detailed redesign proposals | 9 sections: Design system overhaul (new color palette, typography, spacing, components), Landing redesign, Booking flow redesign, Customer/Jockey/Workshop portal redesigns, Extension flow redesign, Cross-cutting improvements, Innovation ideas. Includes specific color hex values and component specs. |
| `PAYMENT_INTEGRATION_EXAMPLE.md` | Stripe integration guide | Code examples for adding Stripe checkout to booking flow |

### 10.2 Backend Docs (for reference, `backend/docs/`)

| File | Purpose |
|------|---------|
| `SECURITY_AUDIT_REPORT.md` | Security audit |
| `PAYMENT_API.md` | Payment API documentation |
| `PAYMENT_TESTING_GUIDE.md` | Payment testing guide |
| `PRIVACY_POLICY.md` | Privacy policy |
| `DATA_RETENTION.md` | Data retention policy |
| `SECURITY.md` | Security guidelines |
| `FILES_CREATED.md` | Files inventory |

---

## Appendix: Key Architectural Observations

1. **Two booking flows:** Public 4-step wizard (`/booking`) and authenticated 3-step flow (`/customer/booking`). Both should be unified in redesign.

2. **Dual i18n system:** `useTranslations` (next-intl native) and `useLanguage` (553-line Lovable adapter) coexist. Should converge to one.

3. **Inline navigation:** Each portal embeds its own nav in the dashboard page -- no shared portal layout components.

4. **CTA/Workshop color collision:** Both use `25 95% 53%` (orange). Confuses CTA meaning in workshop context.

5. **Legacy component duplicates:** 7 root-level landing components duplicate `components/landing/` versions.

6. **Placeholder pages:** vehicles, profile, workshop team, workshop stats use hardcoded placeholder data.

7. **Mixed auth patterns:** Customer login uses `LoginForm` component with `useTranslations('customerLogin')`. Jockey/Workshop login pages use inline forms with `useTranslations('login')`.

8. **No shared portal layouts:** Navigation, headers, and footers are duplicated per portal page instead of using Next.js layout files per portal.

9. **Admin analytics is English-only:** The admin analytics page uses hardcoded English labels, not i18n.

10. **Vehicle API has fallback data:** `vehicles.ts` falls back to hardcoded `VEHICLE_BRANDS` and `VEHICLE_MODELS` when the API is unreachable -- good resilience pattern.
