# UX/UI Audit Report -- AutoConcierge B2C App

**Date:** 2026-02-08
**Scope:** All portals (Landing, Booking Flow, Customer, Jockey, Workshop)
**Evidence:** 52 walkthrough screenshots (de-unified), source code review

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Landing Page & Booking Flow](#1-landing-page--booking-flow)
3. [Customer Portal](#2-customer-portal)
4. [Jockey Portal](#3-jockey-portal)
5. [Workshop Portal](#4-workshop-portal)
6. [Cross-Cutting Issues](#5-cross-cutting-issues)
7. [Key Flow Analysis](#6-key-flow-analysis)
8. [Summary & Priority Matrix](#7-summary--priority-matrix)

---

## Executive Summary

The AutoConcierge app is a solid MVP with working end-to-end flows across all four roles. The design system shows clear intentionality -- a blue primary with orange CTAs, green for success/jockey, and orange for workshop theming. However, the application has significant UX gaps that would hurt conversion and user confidence in production:

**Top 3 Critical Issues:**
1. The booking confirmation page (Screenshot 016-017) shows a Stripe placeholder instead of a real payment form, and the page price discrepancy (149 EUR booking vs 250 EUR details) creates trust issues.
2. The payment modal for extensions (Screenshot 041) exposes technical details ("Demo Payment (Simulated)", raw Extension ID) and uses English in a German-language session.
3. Service type shows as untranslated "INSPECTION" in booking details (Screenshots 038, 052), breaking the localized experience.

**Overall Grade: B-** -- Functional but needs polish for production readiness.

---

## 1. Landing Page & Booking Flow

### 1.1 Landing Page (Screenshot 001)

**Visual Design**
- The hero section uses a deep blue gradient that looks professional and trustworthy.
- Good visual hierarchy with the "Festpreis-Garantie" trust badge at the top.
- Star ratings (4.5/5) and "1.247 Bewertungen" provide social proof effectively.
- Orange CTA button ("Preis berechnen") has strong contrast against the blue background.

**Strengths:**
- Clean, modern layout with clear information architecture.
- The "Ihr Portal wahlen" section with three portal cards (Kunden, Fahrer, Werkstatt) is well-differentiated with colored left borders and distinct icons.
- "Warum AutoConcierge?" value props use consistent icon styling.
- "So einfach geht's" 3-step process is easy to scan.
- FAQ section uses accordion pattern appropriately.
- Footer is well-organized with Quick Links, Rechtliches, and Kontakt columns.

**Weaknesses:**
- **[Medium]** The header navigation ("Home", "So funktioniert's", "FAQ") is visually lightweight and could be missed. The "Anmelden" button in the top right is the same color as the background, making it nearly invisible.
- **[Low]** Portal cards all say "Zum Portal" but use different colors -- the "Kunden" card is blue, "Fahrer" is green, "Werkstatt" is orange. This is correct but there is no visual cue explaining what these portals do beyond the subtitle text, which is small.
- **[Low]** The wave divider between hero and content is a nice touch but the spacing between sections could be more generous -- sections feel slightly crowded on larger screens.

### 1.2 Booking Flow -- Vehicle Entry (Screenshots 003-009)

**Strengths:**
- Excellent 4-step progress indicator (Fahrzeug > Service > Abholung > Bestatigung) with green checkmarks for completed steps.
- Green info banner ("Concierge-Service inklusive") reinforces the value proposition on every step.
- Brand logos appear next to brand names in the dropdown (BMW, Audi, etc.) -- a delightful detail.
- Form layout is clean with appropriate 2-column grid for Marke/Modell and Baujahr/Kilometerstand.
- "Fahrzeug fur zukunftige Buchungen speichern" checkbox shows forward-thinking UX.

**Weaknesses:**
- **[Medium]** The "Weiter" (Next) button (Screenshot 004) is right-aligned but floats outside the card container. It should be inside the card or have a sticky footer bar. Users may not scroll down to find it on shorter viewport heights.
- **[Medium]** Before selecting a brand (Screenshot 003), "Baujahr" and "Kilometerstand" fields overlap with the dropdown, suggesting the dropdown is an overlay but not properly z-indexed or the layout does not account for it.
- **[Low]** The year input (Screenshot 007) uses a native number spinner which looks platform-inconsistent and allows invalid years. A dropdown of years (2000-2026) would be more appropriate.
- **[Low]** No "Abbrechen" (Cancel) link on step 1 to return to landing. Only visible on later steps in the header.

### 1.3 Booking Flow -- Service Selection (Screenshots 010-011)

**Strengths:**
- Service cards have clear icons, descriptions, and "ab X EUR" pricing.
- Selection state is indicated by a green checkmark and subtle border change.
- "Sie konnen mehrere Services auswahlen" is helpful.

**Weaknesses:**
- **[Medium]** Only 4 services shown in a 2x2 grid. If more services were added, there is no scroll or "show more" pattern visible. The card height varies slightly because descriptions have different lengths.
- **[Low]** No tooltip or "i" icon to explain what each service includes in detail. Users selecting "Inspektion" vs "Olwechsel" may not understand the difference for their specific vehicle.

### 1.4 Booking Flow -- Appointment Page (Screenshots 012-015)

**Strengths:**
- Clear separation of pickup and return scheduling with distinct sections.
- Time slot selection uses pill-style buttons that look tappable (good for mobile).
- "Ihr Fahrzeug wird an dieselbe Adresse zuruckgebracht" default with green checkmark reduces cognitive load.
- Info box "So funktioniert unser Concierge-Service" at the top educates first-time users.

**Weaknesses:**
- **[High]** The date picker displays inline text ("Abholung am: Mo, 09.02.2026") but there is no visible calendar widget -- it appears to be a native date input. This feels imprecise and platform-inconsistent. A custom calendar component would be more appropriate for a premium service.
- **[Medium]** Time slots only show even hours (08:00, 10:00, 12:00, 14:00, 16:00). For a concierge service, 30-minute intervals would feel more premium and flexible.
- **[Medium]** The address fields (Strasse & Hausnummer, PLZ, Stadt) have no autocomplete suggestion. Google Places or similar integration would dramatically reduce friction for address entry.
- **[Low]** Return date/time section has no constraint feedback visible -- the helper text says "mindestens einen Tag nach der Abholung" but there is no visible validation error if someone violates this.

### 1.5 Booking Flow -- Confirmation & Payment (Screenshots 016-017)

**Strengths:**
- Good booking summary card showing service, vehicle, pickup/return dates, and concierge service (0 EUR).
- Contact data section with pre-filled fields reduces friction.
- Total price prominently displayed in orange.
- Progress indicator shows all green checkmarks.

**Weaknesses:**
- **[Critical]** The "Zahlungsmethode" section shows only a gray placeholder: "Stripe Zahlungsintegration wird hier angezeigt." This is not a functioning payment form -- it is a placeholder. In production this would completely block bookings.
- **[High]** The AGB checkbox ("Ich akzeptiere die AGB und Datenschutzbestimmungen") is not linked -- "AGB" and "Datenschutzbestimmungen" should be clickable links to the actual legal pages.
- **[Medium]** Vehicle shows as "bmw 3er" (lowercase brand). This should display as "BMW 3er" for a premium feel.
- **[Low]** "Ihre Kontaktdaten" shows Vorname "Max" and Nachname "Mustermann" pre-filled, but these are placeholders in the E2E test. For real users, this section should distinguish between known (logged-in) and unknown (guest) users more clearly.

### 1.6 Post-Booking -- Registration & Confirmation (Screenshots 018-020)

**Strengths:**
- Screenshot 018 shows a smooth post-booking registration flow: "Fast geschafft!" with the booking number prominently displayed, the benefits listed ("Alle Buchungen auf einen Blick", "Status-Updates in Echtzeit", "Schnellere zukunftige Buchungen"), and a "Spater registrieren" escape hatch.
- Screenshot 020 shows a clean confirmation page with booking number, next steps, and dual CTAs ("Zur Startseite" / "Zum Kundenportal").
- Toast notification in top-right confirms success.

**Weaknesses:**
- **[Medium]** Screenshot 002 shows a different registration page (full page with "Neues Konto" header) that has no context about why the user needs to register. This page (Screenshot 002) is actually the landing page "Anmelden" click target, but it looks identical to the post-booking registration (Screenshot 018/019). These two contexts should feel different: post-booking registration should feel lightweight ("just set a password"), while standalone registration should have more context.
- **[Low]** The confirmation page (Screenshot 020) is quite small/compressed in the screenshot, suggesting it may not fill the viewport well on desktop.

---

## 2. Customer Portal

### 2.1 Dashboard (Screenshots 021, 037, 051)

**Strengths:**
- Clean sidebar navigation with clear icons and labels (Dashboard, Neue Buchung, Meine Buchungen, Fahrzeuge, Profil).
- Three stat cards (Aktive Buchungen, Gespeicherte Fahrzeuge, Letzte Buchung) provide quick overview.
- Booking list cards show progress bar (Gebucht > Abholung > Werkstatt > Ruckgabe > Fertig) which is an excellent visualization of the service lifecycle.
- Filter bar with status pills (Alle, Aktiv, Abgeschlossen, Storniert) + search + sort.
- "Neuen Service buchen" CTA card with plus icon and dashed border is visually distinct.
- Language switcher and notification bell in header.

**Weaknesses:**
- **[High]** The sidebar is hidden on mobile (uses `lg:block`). Screenshot 021 shows the mobile header but there is no hamburger menu or bottom navigation. Mobile users have no way to navigate between Dashboard, Buchungen, Fahrzeuge, and Profil. This is a critical mobile navigation gap.
- **[Medium]** The stat cards have no click interaction -- "Aktive Buchungen: 1" should link to filtered bookings, "Gespeicherte Fahrzeuge: 1" should link to vehicles page.
- **[Medium]** The progress bar labels ("Gebucht", "Abholung", "Werkstatt", "Ruckgabe", "Fertig") are 10px text, which is very small and hard to read, especially on mobile.
- **[Low]** "Willkommen zuruck, Kunde" -- the fallback name "Kunde" feels impersonal. Should at least show the user's first name or "Willkommen zuruck!" without a name.

### 2.2 Booking Details (Screenshots 038, 052)

**Strengths:**
- Clean card-based layout with sections for Fahrzeug, Service, Abholung/Ruckgabe.
- Tabs for Details and Erweiterungen with badge count.
- Back navigation ("Zuruck") is present.
- Status badge ("Wird bearbeitet", "Zuruckgegeben") is prominently displayed.

**Weaknesses:**
- **[High]** Screenshot 038: Service section shows "INSPECTION" (English, uppercase) instead of "Inspektion". This is an i18n/enum display bug that appears in every booking detail view. The raw enum value is being rendered instead of a translated label.
- **[Medium]** Screenshot 038: The price shows "250,00 EUR" but the booking was created at "149 EUR" (Screenshot 016). This discrepancy is confusing -- it likely represents the workshop's actual pricing vs. the initial estimate, but there is no explanation of why the price changed.
- **[Medium]** The Abholung and Ruckgabe cards are side-by-side on desktop, which is good, but the Ruckgabe card has no address shown (only "Datum" and "Zeitfenster"), while Abholung shows the full address. Since the service says "wird an dieselbe Adresse zuruckgebracht," the return address should also be shown for clarity.
- **[Low]** The "Preis: 250,00 EUR" at the bottom is formatted with comma decimal separator (correct for German) but uses EUR instead of the EUR symbol. Should be "250,00 EUR" consistently.

### 2.3 Extension Approval Flow (Screenshots 037-043)

**Strengths:**
- Screenshot 037: Pending extension alert on dashboard is eye-catching with amber background and "wartet auf Genehmigung" text.
- Screenshot 039: Extensions tab shows detailed breakdown of positions with individual prices.
- Screenshot 040: Review modal clearly presents positions with prices and "Genehmigen & Bezahlen" / "Ablehnen" buttons.
- Screenshot 042: Success state with green "Erweiterung genehmigt!" banner is clear.

**Weaknesses:**
- **[Critical]** Screenshot 041: The payment modal shows "Payment Method: Demo Payment (Simulated)" and "Extension ID: cmldnfvfz003m06mls40f5t13" -- these are technical/debug details that should never be shown to customers. The "Pay with Demo (280.50 EUR)" button text is in English in a German session. This entire modal needs to be redesigned for production with Stripe Elements integration and proper i18n.
- **[High]** Screenshot 040: The "Genehmigen & Bezahlen" button is blue, but the same button in the tab view behind it (Screenshot 039) is orange. This creates inconsistency in the CTA hierarchy -- the approve+pay action should always use the same color.
- **[Medium]** There is no way to partially approve extensions -- it is all-or-nothing. If the workshop proposes 2 items (185.50 EUR + 95.00 EUR), the customer cannot approve one and decline the other.
- **[Medium]** No explanation is provided for what happens after rejection -- will the workshop be notified? Can they re-submit? The customer has no context.

---

## 3. Jockey Portal

### 3.1 Login (Screenshot 022)

**Strengths:**
- Split-screen login with green branded right panel ("Fahrer-Portal") is visually distinctive from the customer and workshop portals.
- Password visibility toggle (eye icon).
- Clean, minimal form.

**Weaknesses:**
- **[Medium]** Uses "Benutzername" (Username) instead of "E-Mail" like the customer portal. This inconsistency may confuse users who work across portals. If jockeys use a username, that is fine, but the placeholder "jockey" is not helpful.
- **[Low]** No "Passwort vergessen?" link visible.

### 3.2 Dashboard (Screenshots 023-026, 047-050)

**Strengths:**
- Green header bar with user email, date, and utility icons (language, notifications, logout) is clean and branded.
- Three stat cards (Heutige Fahrten, Abgeschlossen, Ausstehend) with large colored numbers provide instant overview.
- Quick-access buttons for "Verdienst-Statistiken" and "Verfugbarkeit."
- Dual filter system: type filters (Alle, Abholung, Ruckgabe) and status filters (Alle Status, Bevorstehend, Unterwegs, Erledigt).
- Assignment cards show color-coded top border (blue for upcoming, orange for in-progress, green for completed).
- Customer info (name, address, vehicle) at a glance.
- Prominent "Navigation starten" button (green, full-width half) is optimized for quick action.
- "Anrufen" button (outline) is appropriately secondary.
- Status progression text links ("Abholung starten", "Ubergabe dokumentieren") advance the workflow.

**Weaknesses:**
- **[High]** There is no map view. A jockey needs to see assignments geographically -- a list view alone is insufficient for route planning when multiple assignments exist. Screenshot 047 shows 2 assignments; with 5-10 daily, a map becomes essential.
- **[High]** The assignment cards on Screenshots 023-026 all look nearly identical in layout between states (Bevorstehend, Unterwegs, Angekommen, Abgeschlossen). The only difference is the status badge text and the bottom action link. The card should visually transform more dramatically between states -- e.g., "Unterwegs" could show a pulsing indicator, "Angekommen" could expand to show handover checklist.
- **[Medium]** The "Ubergabe dokumentieren" action link (Screenshots 024-025) is small text at the bottom of the card. For such a critical workflow step (documenting vehicle condition with photos), this should be a much more prominent button.
- **[Medium]** No ETA or distance information is shown on assignments. A jockey en route to a customer needs to know "15 min / 8 km away."
- **[Medium]** Screenshot 050 shows both completed assignments stacked. The completed "Abholung" assignment (bottom) still shows all the same information but with "Erfolgreich abgeschlossen" -- completed assignments should be visually collapsed or moved to a separate section to reduce clutter.
- **[Low]** The "Verdienst-Statistiken" and "Verfugbarkeit" buttons use outline style which makes them look like secondary actions. These are important navigation items and should be more prominent or integrated into a proper nav bar.

---

## 4. Workshop Portal

### 4.1 Login (Screenshot 027)

**Strengths:**
- Orange-branded split screen distinguishes it clearly from jockey (green) and customer (blue) portals.
- "Werkstatt-Portal" with wrench icon.

**Weaknesses:**
- Same issues as jockey login: uses "Benutzername" instead of "E-Mail", no "Passwort vergessen?" link.

### 4.2 Dashboard (Screenshots 028-032, 036, 045)

**Strengths:**
- Orange-themed header matches the portal branding.
- Top navigation (Kalender, Statistiken, Team, language switcher, Abmelden) is horizontal and always visible.
- Three stat cards (Auftrage heute, In Bearbeitung, Abgeschlossen) with colored icons.
- Orders table with clear columns (Auftrags-ID, Kunde, Fahrzeug, Service, Status, Aktionen).
- Search bar for filtering orders.
- Filter pills (Alle, Wartend, In Arbeit, Erledigt).
- "Tipp: Auftragserweiterungen" info box at the bottom educates workshop staff.
- "+ Erweiterung" orange button only appears for "In Bearbeitung" orders (Screenshot 030), not for "Eingegangen" ones (Screenshot 028) -- correct contextual visibility.

**Weaknesses:**
- **[High]** The table layout is not responsive. On mobile/tablet, a 6-column table will be cramped or require horizontal scroll. This should switch to a card layout on smaller screens.
- **[Medium]** Status badges use different terminology than the customer portal: "Eingegangen" (workshop) vs "Wird bearbeitet" (customer). While this may be intentional (showing workshop-relevant vs customer-relevant language), it creates confusion when workshop staff communicate with customers.
- **[Medium]** The "Details" action is just an eye icon + text -- this opens a modal overlay (Screenshot 029). But the modal covers the table, and there is no way to navigate directly to a detail page. For complex orders, a dedicated detail page would be better than a modal.
- **[Medium]** Screenshot 028: The stat cards show "1 Auftrage heute" but the table shows 2 rows (BK26020001 and AC-SEED-0001). The stat seems to count differently than the table, which is confusing.
- **[Low]** No pagination visible despite having only 2 orders. The code shows `ORDERS_PER_PAGE = 10`, but there is no pagination UI shown when fewer than 10 orders exist. This is fine now but needs testing with more data.

### 4.3 Order Details Modal (Screenshots 029, 031, 044, 046)

**Strengths:**
- Clean sections: Kundeninformationen, Fahrzeuginformationen, Service, Abhol-/Ruckgabeadresse, Zeitverlauf.
- Customer contact info (email, phone) is clickable.
- Status badge in header updates correctly across states.

**Weaknesses:**
- **[Medium]** The modal is a simple scrollable dialog with no action buttons visible above the fold. The workshop user needs to scroll down past all the info sections to find the "Status andern" or "Arbeit beginnen" actions (not visible in screenshots -- they may be below the fold at "Zeitverlauf").
- **[Medium]** Fahrzeuginformationen shows only "bmw 3er" (lowercase) with no year, mileage, or license plate. The workshop needs this information prominently.
- **[Low]** The close "X" button is small and in the top-right corner. A "Schliessen" button at the bottom would improve usability.

### 4.4 Extension Modal (Screenshots 033-036)

**Strengths:**
- Clear modal title "Auftragserweiterung erstellen" with booking reference and customer name.
- Position-based input (Beschreibung + Preis) is intuitive.
- "+ Position hinzufugen" allows multiple items.
- Delete icon (trash) on each position for removal.
- "Fotos als Nachweis" section with upload area adds credibility.
- Running total ("Gesamtpreis: 280.50 EUR") updates as items are added.
- Screenshot 036: Success toast "Auftragserweiterung wurde an den Kunden gesendet!" confirms the action.

**Weaknesses:**
- **[Medium]** The price field (Screenshot 033) shows "0.00" with a number spinner. This uses a period as decimal separator, but German convention uses a comma. Should be "0,00" or use a formatted currency input.
- **[Medium]** No "Vorschau" (Preview) button before sending -- the workshop user clicks "Senden" and it goes directly to the customer. A preview/confirmation step would prevent accidental sends.
- **[Low]** The "Beschreibung" textarea is quite large for a single-line description like "Bremsscheiben vorne abgenutzt." A single-line input might be more appropriate, with an optional "Details" expandable area.

---

## 5. Cross-Cutting Issues

### 5.1 Design Consistency

- **[High]** Three different navigation patterns across portals:
  - Customer: Left sidebar (desktop) + mobile header (no nav)
  - Jockey: Top bar with inline buttons
  - Workshop: Top bar with horizontal nav links

  While role differentiation is acceptable, the fundamental navigation paradigm should be more consistent, especially the presence/absence of mobile navigation.

- **[Medium]** Button style inconsistency: The primary action button is orange ("Weiter") in booking flow, blue in customer portal ("Alle" filter), green in jockey ("Navigation starten"), and blue/orange mixed in workshop. The CTA color should follow a consistent rule: orange = primary action, blue = secondary action.

- **[Medium]** Card styles differ: Landing page uses rounded cards with shadows, customer portal uses "card-premium" with hover effects, jockey uses flat cards with colored top borders, workshop uses table rows. These could share more DNA.

### 5.2 Accessibility Concerns

- **[High]** No visible focus indicators on many interactive elements. The booking flow buttons (time slots, service cards) do not show keyboard focus rings in the screenshots.
- **[High]** Color-only status indication: Progress bars (blue vs gray) and status badges rely solely on color. Users with color vision deficiency need text labels (which exist on badges but not on progress bars).
- **[Medium]** Touch target sizes: Time slot buttons (Screenshots 012-014) appear to be around 40x30px, below the recommended 44x44px minimum for mobile.
- **[Medium]** The jockey portal stat numbers (Screenshots 023-026) use color alone (green for "Heutige Fahrten", green for "Abgeschlossen", orange/red for "Ausstehend") to convey meaning. The labels help, but the large colored numbers are the primary visual element.
- **[Low]** No visible skip-to-content link on any page.
- **[Low]** Image alt texts not auditable from screenshots, but the code should ensure all icons have aria-labels.

### 5.3 Missing States

- **[High]** No visible error states in the booking flow. What happens when a service is unavailable? When the date is invalid? When payment fails? None of these states are shown or apparently designed.
- **[High]** No loading states visible during page transitions in the booking flow. The customer dashboard has a Loader2 spinner, but the booking flow steps show no loading indication when "Weiter" is clicked.
- **[Medium]** No empty state for the jockey portal -- what does a jockey see when they have zero assignments? The dashboard should show an encouraging message, not just empty space.
- **[Medium]** No offline/connectivity error handling visible. If a jockey loses connection while on the road, what happens to their status update?
- **[Low]** No skeleton loading screens -- the current implementation jumps from empty to populated.

### 5.4 Animation & Transitions

- **[Medium]** The landing page defines fade-in and slide-in animations in CSS (globals.css lines 307-362), but the portal pages have no entrance animations. Dashboard content appears instantly with no visual choreography.
- **[Low]** The card-premium hover effect (translateY -4px) is defined in CSS but may cause layout shifts on touch devices where hover is simulated by tap.
- **[Low]** No transition on the booking flow step indicator -- steps snap from gray to green without animation.

### 5.5 Typography & Spacing

- **[Medium]** Heading sizes are not consistently scaled:
  - Landing hero: text-4xl/5xl/6xl (responsive)
  - Customer dashboard: text-2xl/3xl
  - Jockey dashboard: plain bold text (no explicit size class visible in header)
  - Workshop dashboard: uses card-based stat numbers without headings

  A typographic scale should be formalized.

- **[Low]** Body text in the booking flow is generally well-sized but some helper text (like the note under Ruckgabedatum in Screenshot 012) is very small and gray, reducing readability.

### 5.6 i18n Issues

- **[Critical]** Screenshot 038/052: "INSPECTION" shown in English uppercase instead of translated "Inspektion."
- **[Critical]** Screenshot 041: Payment modal entirely in English ("Payment Method", "Extension ID", "Total Amount", "Pay with Demo") during a German session.
- **[Medium]** Vehicle brand "bmw" shown in lowercase throughout (Screenshots 016, 023, 038). Should be "BMW" (proper capitalization).

---

## 6. Key Flow Analysis

### 6.1 Flow: Booking Creation (Screenshots 001-021)

**Path:** Landing > Vehicle > Service > Appointment > Confirmation > Registration > Dashboard

**Friction Points:**
1. The transition from landing page (Screenshot 001) to booking form (Screenshot 003) skips over registration -- users can book without an account, which is good for conversion, but the "Preis berechnen" button in the hero is misleading because it starts a booking rather than showing a price calculator.
2. The step from "Confirmation + Payment" (Screenshot 017) to "Fast geschafft!" (Screenshot 018) implies the booking was submitted *before* payment was processed (the Stripe placeholder was never replaced). This means the booking flow creates the booking optimistically, which could lead to orphaned bookings.
3. The post-booking registration (Screenshot 018) combines account creation with the booking confirmation, which is conceptually overloaded. The user just completed a complex form and now faces another 6-field form immediately.

**Confusion Risks:**
- The "Preis berechnen" hero CTA implies a price calculator, but actually starts the booking wizard.
- Screenshot 016 shows "Gesamtpreis 149 EUR" but Screenshot 038 shows "Preis: 250,00 EUR" for the same booking. This discrepancy is unexplained.

**Missing Feedback:**
- No "saving..." or loading indicator between steps.
- No confirmation that date/time is actually available (no real-time availability check visible).

### 6.2 Flow: Workshop Order Management (Screenshots 027-036)

**Path:** Login > Dashboard > Order Details > Start Work > Extension > Submit

**Friction Points:**
1. The transition from "Eingegangen" to "In Bearbeitung" status is not shown explicitly -- between Screenshot 028 and 030, the order status changed, but we never see the "Arbeit beginnen" button or confirmation. The workshop user needs a clear "Arbeit beginnen" action with confirmation.
2. The extension modal (Screenshot 033) requires manual price entry. For common services, a price catalog/template would reduce errors and speed up the workflow.
3. After submitting an extension (Screenshot 036), the workshop has no visibility into whether the customer has seen it, opened it, or is considering it. A "Kunde hat Erweiterung angesehen" notification would reduce follow-up calls.

**Visual Hierarchy:**
- The "+ Erweiterung" button (Screenshot 030) is appropriately eye-catching in orange.
- The "Details" button uses a low-contrast eye icon that could be missed.

### 6.3 Flow: Extension Approval (Screenshots 037-043)

**Path:** Customer Dashboard (alert) > Booking Details > Extensions Tab > Review Modal > Payment > Confirmation

**Friction Points:**
1. Screenshot 037: The alert on the dashboard is well-designed, but clicking it navigates to the booking details page, then the user must click "Jetzt prufen" again, then navigate to the Extensions tab. That is 3 clicks to reach the review -- it should be 1 (direct link to the extension review).
2. Screenshot 040: The review modal shows positions but no photos (the workshop uploaded none in this test). If photos exist, their display is untested.
3. Screenshot 041: The payment step is entirely broken from a UX perspective -- technical IDs, English text, simulated payment. This flow would fail in production.

**Missing Feedback:**
- No email or push notification visible when an extension arrives. The customer only sees it when they check the dashboard.
- After approving, no summary email or receipt is sent (not visible in the flow).

### 6.4 Flow: Jockey Assignment Lifecycle (Screenshots 022-026, 047-050)

**Path:** Login > Dashboard > Start Pickup > En Route > At Location > Handover Complete > (Return) Start Return > En Route > At Location > Complete

**Friction Points:**
1. Each state transition (Bevorstehend > Unterwegs > Angekommen > Abgeschlossen) requires the jockey to find and click a small text link at the bottom of the card. On a phone while driving (pulled over), this should be a large, unmissable button.
2. The "Ubergabe dokumentieren" step (with camera icon, Screenshots 024-025) suggests photo documentation, but the actual handover modal is not visible in these screenshots. This critical step should be a full-screen experience with clear instructions.
3. Between pickup completion (Screenshot 026) and return assignment (Screenshot 047), there is a gap -- the jockey sees "0 Ausstehend" and "1 Abgeschlossen." There is no indication of when the return task will arrive. A timeline or estimated return schedule would help.

**Confusion Risks:**
- Screenshots 047-050 show both the pickup (completed) and return assignments on the same list. The completed pickup card takes up significant space and could cause the jockey to accidentally interact with the wrong card.

### 6.5 Flow: Customer Return Experience (Screenshots 051-052)

**Path:** Customer Dashboard > Booking Details (final state)

**Friction Points:**
1. Screenshot 051: The dashboard shows "Zuruckgebracht" status with a fully completed progress bar. This is the final state, but there is no prompt to rate the service, leave a review, or provide feedback. A post-service survey would be valuable.
2. Screenshot 052: The booking details show the same information as before but with "Zuruckgegeben" badge. There is no summary of what was done, no final invoice, no photos of the completed work. The customer has no proof of service completion.

**Missing Feedback:**
- No "Rechnung herunterladen" (Download Invoice) button.
- No service completion report or photos from the workshop.
- No "Nachsten Termin buchen" upsell prompt.
- No rating/review prompt for the service experience.

---

## 7. Summary & Priority Matrix

### Critical (Must Fix Before Launch)

| # | Issue | Location | Screenshots |
|---|-------|----------|-------------|
| C1 | Payment placeholder ("Stripe Zahlungsintegration wird hier angezeigt") instead of real payment form | Booking confirmation | 016-017 |
| C2 | Extension payment modal shows English text, technical IDs, demo payment in German session | Extension approval | 041 |
| C3 | Service type displayed as untranslated enum "INSPECTION" in booking details | Booking details | 038, 052 |

### High (Significant UX Impact)

| # | Issue | Location | Screenshots |
|---|-------|----------|-------------|
| H1 | No mobile navigation in customer portal (sidebar hidden, no hamburger menu) | Customer portal | 021, 037, 051 |
| H2 | No date picker calendar widget -- native date input only | Booking appointment | 012-013 |
| H3 | Jockey action links too small for mobile use while on the go | Jockey dashboard | 023-026, 047-050 |
| H4 | No error states designed for booking flow (validation, payment failure, unavailability) | Booking flow | 003-017 |
| H5 | No loading states during booking flow step transitions | Booking flow | 003-017 |
| H6 | Workshop table layout not responsive for mobile/tablet | Workshop dashboard | 028, 030 |
| H7 | Extension approval/rejection CTA color inconsistency (blue modal vs orange tab) | Extension approval | 039-040 |
| H8 | No map view for jockey route planning | Jockey dashboard | 023, 047 |
| H9 | AGB checkbox links not clickable (legal requirement) | Booking confirmation | 016-017 |
| H10 | Focus indicators missing on interactive elements (accessibility) | All portals | Multiple |

### Medium (Noticeable Polish Issues)

| # | Issue | Location | Screenshots |
|---|-------|----------|-------------|
| M1 | Price discrepancy: 149 EUR (booking) vs 250 EUR (details) unexplained | Booking flow / Details | 016, 038 |
| M2 | Vehicle brand in lowercase ("bmw" instead of "BMW") | Multiple | 016, 023, 038 |
| M3 | Address autocomplete missing in booking form | Booking appointment | 012-015 |
| M4 | Time slots only at 2-hour intervals; 30-min would feel more premium | Booking appointment | 012-014 |
| M5 | No partial extension approval (all-or-nothing) | Extension approval | 039-040 |
| M6 | Completed jockey assignments clutter the active list | Jockey dashboard | 047-050 |
| M7 | Extension price input uses period decimal (should be comma for German) | Workshop extension | 033-034 |
| M8 | No "Vorschau" step before sending extension to customer | Workshop extension | 033-036 |
| M9 | Dashboard stat cards not clickable/linked | Customer dashboard | 021, 037, 051 |
| M10 | No post-service feedback/rating prompt | Customer final state | 051-052 |
| M11 | No invoice download or service report | Customer final state | 052 |
| M12 | Three different navigation patterns across portals | All portals | Multiple |
| M13 | Touch targets below 44x44px minimum for time slots | Booking appointment | 012-014 |
| M14 | No visibility for workshop on whether customer viewed extension | Workshop extension | 036, 044 |
| M15 | "Weiter" button floats outside card container | Booking vehicle step | 004-009 |

### Low (Nice to Have)

| # | Issue | Location | Screenshots |
|---|-------|----------|-------------|
| L1 | Year input uses native spinner instead of dropdown | Booking vehicle | 007 |
| L2 | Header "Anmelden" button nearly invisible on landing page | Landing page | 001 |
| L3 | No transition animation on booking step indicator | Booking flow | 003-017 |
| L4 | Dashboard welcome fallback "Kunde" feels impersonal | Customer dashboard | 021 |
| L5 | No skeleton loading screens (content appears instantly) | All portals | Multiple |
| L6 | Jockey "Verdienst-Statistiken" buttons look like secondary actions | Jockey dashboard | 023 |
| L7 | No "Passwort vergessen?" link on Jockey/Workshop login | Login pages | 022, 027 |
| L8 | Wave divider spacing slightly tight between landing sections | Landing page | 001 |
| L9 | Confirmation page may not fill viewport well on desktop | Post-booking | 020 |
| L10 | No ETA or distance info on jockey assignments | Jockey dashboard | 023-026 |

---

*End of UX Audit Report*
