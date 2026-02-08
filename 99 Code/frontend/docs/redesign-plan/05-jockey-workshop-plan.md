# Jockey & Workshop Portal Redesign -- Implementation Plan

**Date:** 2026-02-08
**Input:** UX Proposals Sections 5 & 6, HTML Mockup `03-jockey-workshop-mockup.html`, File Inventory, Current Source Code
**Target:** Mobile-first Jockey, Desktop-optimized Workshop

---

## PART A: JOCKEY PORTAL

### 1. Mobile-First Architecture

**Current state:** The jockey dashboard (`app/[locale]/jockey/dashboard/page.tsx`, 593 lines) renders a desktop-style card list with a sticky green header. Navigation is inline in the header (stats link, availability link, bell icon, logout). No bottom nav. No dedicated layout file for jockey routes.

**Target:** Optimized for phone use in the field. Bottom navigation bar, dark navy header (matching mockup), large touch targets (min 48px), one-tap actions.

#### Layout component changes

Create a shared Jockey layout that wraps all jockey pages (dashboard, stats, availability):

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/jockey/layout.tsx` | **CREATE** | New Next.js layout with `<JockeyBottomNav>` for mobile and a compact top bar for desktop. Wraps all jockey child routes. |
| `components/jockey/JockeyBottomNav.tsx` | **CREATE** | Fixed bottom navigation bar (4 items: Aufgaben, Statistiken, Verfuegbarkeit, Profil). 56px height, white bg, elevation shadow upward, safe-area-inset-bottom padding. Active: CTA amber icon+label. Inactive: neutral-400 icon, neutral-500 label. |
| `components/jockey/JockeyTopBar.tsx` | **CREATE** | Dark navy header with greeting, date, notification bell (with badge count), and avatar initials. Replaces inline header from dashboard page. |

**Bottom nav items:**

| Item | Icon | Label (DE/EN) | Route |
|------|------|---------------|-------|
| Aufgaben / Tasks | `ClipboardList` | Aufgaben / Tasks | `/[locale]/jockey/dashboard` |
| Statistiken / Stats | `BarChart3` | Statistiken / Stats | `/[locale]/jockey/stats` |
| Verfuegbarkeit / Availability | `CalendarDays` | Verfuegbarkeit / Availability | `/[locale]/jockey/availability` |
| Profil / Profile | `User` | Profil / Profile | `/[locale]/jockey/dashboard` (scroll to profile section, or future profile page) |

**Responsive behavior:**
- Mobile (<768px): Bottom nav visible, top bar simplified (no nav links, just greeting + bell + avatar)
- Desktop (>=768px): Bottom nav hidden, top bar includes inline nav links (current behavior but restyled)

---

### 2. Dashboard Redesign

**Current state:** Green sticky header, 3 stat cards in a row, quick link buttons (stats, availability), filter bar (type+status), date-grouped assignment card list. Each card shows status badge, type badge, customer name, address (clickable Google Maps link), vehicle, call/navigate buttons, and status-specific action button (ghost style).

**Target (from mockup):** Dark navy header with greeting + availability toggle, today's summary bar, active assignment card with blue/purple accent, large full-width action buttons, secondary actions row.

#### 2.1 Header with greeting + availability toggle

Replace the current green `bg-jockey` sticky header with a dark navy gradient header matching the mockup:

```
Header layout:
- Left: Greeting "Hallo, [firstName]!" + date subtitle
- Right: Notification bell (with red badge count) + avatar circle (initials)
```

Below header: Status toggle row (white bg, border-bottom):
- "Status" label left
- Toggle switch right: "Verfuegbar" (green) / "Beschaeftigt" (gray)
- Uses the availability API to update jockey status

#### 2.2 Today's summary bar

Replace the 3 stat cards with a compact single-line summary bar:

```
"2 Auftraege heute  ·  1 Abholung  ·  1 Rueckgabe"
```

Styled as a rounded pill with `bg-navy/5`, matching the mockup.

#### 2.3 Active assignment card

**Current:** All assignments use the same `Card` with a thin color stripe at top and `ghost` action buttons.

**Target:** Dramatically differentiated cards:

| Assignment type | Card accent | Border color | Action button |
|-----------------|-------------|--------------|---------------|
| Pickup (active) | `border-l-4 border-accent-blue` | Blue | "Route starten" (blue bg, full-width) |
| Return (active) | `border-l-4 border-accent-purple` | Purple | "Route starten" (purple bg, full-width) |
| Upcoming | `border-l-4 border-slate-200` | Gray | No primary action |
| Completed | Collapsed single row | Green left border | Expandable |

**Active card layout (matching mockup):**
1. Top row: Type badge ("Abholung" blue pill / "Rueckgabe" purple pill) + status indicator (pulsing green dot + "Zugewiesen") + time ("10:00 Uhr")
2. Customer name (bold)
3. Address with MapPin icon
4. Vehicle with Car icon + license plate
5. **Full-width action button** (56px height, colored bg): "Route starten" / "Angekommen" / "Uebergabe abschliessen"
6. **Secondary actions row** (split bottom): "Anrufen" | "Navigation" (divider between)

#### 2.4 Upcoming assignments section

Below the active card, show upcoming assignments under a section header "Naechster Auftrag" with compact cards (no action buttons, just info).

#### 2.5 Completed today section

Collapsible section "Heute erledigt (N)" with a chevron toggle. Collapsed by default. Shows completed assignments as single-row summaries.

#### File-by-file changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/jockey/dashboard/page.tsx` | **MODIFY** | Major rewrite: Remove inline header (moved to JockeyTopBar). Remove stat cards (replaced by summary bar). Restructure card rendering to use new `JockeyAssignmentCard` component. Add availability toggle. Remove quick-link buttons (moved to bottom nav). Keep API fetching, filtering, status mapping logic. |
| `components/jockey/JockeyAssignmentCard.tsx` | **CREATE** | New component for individual assignment cards with state-differentiated styling, full-width action button, secondary actions row. Props: `assignment`, `onStartPickup`, `onOpenHandover`, `getMapsUrl`, `statusConfig`. |
| `components/jockey/JockeyStatusToggle.tsx` | **CREATE** | Availability toggle switch with API integration. Props: `initialAvailable`, `onToggle`. |
| `components/jockey/JockeySummaryBar.tsx` | **CREATE** | Today's summary pill component. Props: `totalAssignments`, `pickupCount`, `returnCount`. |

---

### 3. Assignment Detail View

**Current state:** No dedicated detail view page exists. Assignment details are shown inline on the cards. The `HandoverModal` (421 lines) opens as a dialog for completing handovers.

**Target (from mockup):** A full detail view within the phone frame, accessible by tapping an assignment card.

#### 3.1 Status banner with animation

Top banner with gradient background matching assignment type (blue for pickup, purple for return):
- "Aktueller Status" overline
- "Unterwegs zum Kunden" bold text
- Animated car icon moving on a dashed line (CSS animation from mockup)

#### 3.2 Map placeholder

Rounded container showing map integration placeholder with route info ("~15 Min. / 8,3 km"). Future: actual Google Maps / Mapbox embed.

#### 3.3 Customer info with tap-to-call, tap-to-navigate

White card with:
- Customer name (bold)
- Phone number as `tel:` link (blue, tappable)
- Full address
- Optional customer note in amber info box

#### 3.4 Vehicle info

Grid layout (2 columns): Marke, Modell, Baujahr, Kennzeichen, Farbe, Kilometerstand.

#### 3.5 Handover checklist

Interactive checkboxes (5x5px rounded, green accent):
- Fahrzeug empfangen
- Zustand dokumentiert
- Schluessel erhalten
- Unterschrift Kunde

#### 3.6 Photo documentation grid

4-column grid of photo upload slots. Each slot: dashed border placeholder with "+" icon. After capture: thumbnail with green check overlay. "Kamera oeffnen" button below.

#### 3.7 Signature area

Lined canvas area ("Hier unterschreiben") with "Loeschen" button. Touch-enabled drawing.

#### 3.8 Complete button

Full-width green button: "Uebergabe abschliessen" with checkmark icon. 56px height, rounded-2xl, shadow.

#### File changes

| File | Action | Description |
|------|--------|-------------|
| `components/jockey/JockeyAssignmentDetail.tsx` | **CREATE** | Full detail view component rendered inline (not a modal). Includes status banner, map placeholder, customer info, vehicle info, checklist, photo grid, signature, complete button. Props: `assignment`, `onBack`, `onComplete`. |
| `components/jockey/HandoverModal.tsx` | **MODIFY** | Refactor: Extract checklist, photo grid, and signature logic into reusable sub-components that both HandoverModal and JockeyAssignmentDetail can use. Keep modal wrapper for backward compat. |
| `components/jockey/HandoverChecklist.tsx` | **CREATE** | Reusable checklist component extracted from HandoverModal. Props: `items`, `checked`, `onToggle`. |
| `components/jockey/PhotoDocGrid.tsx` | **CREATE** | Reusable photo documentation grid. Props: `photos`, `onCapture`, `onRemove`, `maxPhotos`. |
| `components/jockey/SignaturePad.tsx` | **CREATE** | Reusable signature canvas. Props: `onSignatureChange`, `onClear`. |

---

### 4. New Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `JockeyBottomNav` | `components/jockey/JockeyBottomNav.tsx` | `locale: string`, `activeRoute: string` | Fixed bottom nav bar for mobile |
| `JockeyTopBar` | `components/jockey/JockeyTopBar.tsx` | `userName: string`, `date: string`, `notificationCount: number`, `locale: string` | Dark navy header bar |
| `JockeyAssignmentCard` | `components/jockey/JockeyAssignmentCard.tsx` | `assignment: Assignment`, `statusConfig: StatusConfig`, `onAction: (id, action) => void`, `getMapsUrl: (addr) => string` | State-differentiated assignment card |
| `JockeyAssignmentDetail` | `components/jockey/JockeyAssignmentDetail.tsx` | `assignment: Assignment`, `onBack: () => void`, `onComplete: (data) => void` | Full detail view with all handover steps |
| `JockeyStatusToggle` | `components/jockey/JockeyStatusToggle.tsx` | `initialAvailable: boolean`, `onToggle: (available: boolean) => void` | Availability toggle switch |
| `JockeySummaryBar` | `components/jockey/JockeySummaryBar.tsx` | `totalAssignments: number`, `pickupCount: number`, `returnCount: number` | Compact summary pill |
| `HandoverChecklist` | `components/jockey/HandoverChecklist.tsx` | `items: ChecklistItem[]`, `checked: Record<string, boolean>`, `onToggle: (key: string) => void` | Reusable checklist |
| `PhotoDocGrid` | `components/jockey/PhotoDocGrid.tsx` | `photos: string[]`, `onCapture: () => void`, `onRemove: (index) => void`, `maxPhotos?: number`, `labels?: string[]` | Reusable photo grid |
| `SignaturePad` | `components/jockey/SignaturePad.tsx` | `width?: number`, `height?: number`, `onSignatureChange: (dataUrl: string \| null) => void`, `onClear: () => void` | Reusable signature canvas |

---

## PART B: WORKSHOP PORTAL

### 5. Desktop-Optimized Layout

**Current state:** The workshop dashboard (`app/[locale]/workshop/dashboard/page.tsx`, 569 lines) uses a `<Table>` layout with pagination, status filters, and search. Header has inline links (Calendar, Stats, Team) as ghost buttons. No shared layout file.

**Target:** Kanban board approach (3 columns), professional top bar with search, notifications, user menu. Stats bar with 4 metric cards.

#### Layout component changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/workshop/layout.tsx` | **CREATE** | New layout with `<WorkshopTopBar>` for desktop and `<WorkshopBottomNav>` for mobile. |
| `components/workshop/WorkshopTopBar.tsx` | **CREATE** | White top bar: left (orange gear icon + "Werkstatt-Portal" brand), center (search input), right (notification bell with badge, user menu dropdown with workshop name + avatar). Matches mockup. |
| `components/workshop/WorkshopBottomNav.tsx` | **CREATE** | Mobile bottom nav (4 items: Auftrage, Kalender, Statistiken, Team). Same styling pattern as JockeyBottomNav. |

**Workshop top bar (from mockup):**
- Left: Orange gradient gear icon (8x8) + "Werkstatt-Portal" bold text
- Center-right: Search input with magnifying glass icon ("Suchen...")
- Right: Notification bell (with red badge "5"), user menu (avatar "WS" + "Meister-KFZ" + chevron dropdown)

**Mobile bottom nav items:**

| Item | Icon | Label (DE/EN) | Route |
|------|------|---------------|-------|
| Auftrage / Orders | `ClipboardList` | Auftrage / Orders | `/[locale]/workshop/dashboard` |
| Kalender / Calendar | `CalendarDays` | Kalender / Calendar | `/[locale]/workshop/calendar` |
| Statistiken / Stats | `BarChart3` | Statistiken / Stats | `/[locale]/workshop/stats` |
| Team | `Users` | Team | `/[locale]/workshop/team` |

---

### 6. Order Cards (Kanban)

**Current state:** Table-based layout with columns: Order ID, Customer, Vehicle, Service, Status, Actions. Status badges use custom CSS classes (`badge-pending`, `badge-in-progress`, `badge-completed`). Actions: "Details" (Eye icon), "Erweiterung" (Plus icon).

**Target:** 3-column Kanban board with draggable order cards.

#### Kanban columns

| Column | Header | Header color | Count badge | Cards show |
|--------|--------|-------------|-------------|------------|
| Neu / New | Blue dot + "Neu" | Blue strip | Blue bg `"3"` | New orders awaiting work start |
| In Bearbeitung / In Progress | Amber dot + "In Bearbeitung" | Amber strip | Amber bg `"2"` | Orders being worked on |
| Abgeschlossen / Completed | Green dot + "Abgeschlossen" | Green strip | Green bg `"8"` | Completed orders |

#### Card design per column

**Neu column cards:**
- White bg, rounded-xl, border-slate-100, shadow-sm
- Top: drag handle (3 bars) + booking number (mono font) + "Neu" badge (blue)
- Middle: Vehicle + plate (bold) + service type tags
- Bottom: Customer name + date
- Full-width "Annehmen" button (blue bg)

**In Bearbeitung column cards:**
- White bg with `border-l-4 border-accent-amber`
- Same top/middle layout as Neu
- Progress bar (amber, pulsing animation)
- Extension status badge if applicable ("Erweiterung genehmigt" green pill)
- Split bottom: "+ Erweiterung" (amber text) | "Abschliessen" (green text)

**Abgeschlossen column cards:**
- `bg-white/60` (slightly transparent), green check icon instead of badge
- Muted text colors
- "Details ansehen" text link at bottom

#### Responsive fallback

- Desktop (>=1024px): 3-column Kanban grid
- Tablet (768-1023px): 3-column Kanban but narrower
- Mobile (<768px): Vertical tabbed view. Three tabs at top ("Neu" / "In Bearbeitung" / "Erledigt"). Cards stack vertically within each tab.

#### File-by-file changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/workshop/dashboard/page.tsx` | **MODIFY** | Major rewrite: Remove inline header (moved to WorkshopTopBar via layout). Replace Table rendering with KanbanBoard component. Keep API fetching, status mapping, extension handling logic. Add mobile tab view fallback. |
| `components/workshop/KanbanBoard.tsx` | **CREATE** | 3-column Kanban layout. Props: `orders: Order[]`, `onStatusChange`, `onOpenDetails`, `onOpenExtension`. Handles column grouping. Desktop: 3-col grid. Mobile: tabbed view. |
| `components/workshop/KanbanColumn.tsx` | **CREATE** | Single Kanban column. Props: `title`, `color`, `count`, `children`. |
| `components/workshop/KanbanOrderCard.tsx` | **CREATE** | Individual order card within Kanban. Props: `order: Order`, `column: 'new' \| 'inProgress' \| 'completed'`, `onAction: (orderId, action) => void`. State-specific styling. |

---

### 7. Order Detail View

**Current state:** `OrderDetailsModal.tsx` (545 lines) renders a dialog with customer info, vehicle info, service details, address, timeline, extension polling indicator, photo upload, vehicle history, and FSM-aware action buttons. Uses `useTranslations('workshopModal.orderDetails')`.

**Target (from mockup):** Full-page detail view (not modal) with status advancement section, status history timeline, two-column info layout, inline extension form, communication section.

#### 7.1 Status advancement with large buttons

Top section: "Status aendern" card with a single large action button:
- If "In Bearbeitung": "Als abgeschlossen markieren" (green, full-width, with checkmark icon, shadow)
- If "Eingegangen": "Bearbeitung starten" (blue)
- If "PICKED_UP": "Als angekommen markieren" (amber)

#### 7.2 Status history timeline

Horizontal timeline with 3 nodes:
- Eingegangen (green check if passed, timestamp below)
- In Bearbeitung (amber pulsing if current, timestamp below)
- Abgeschlossen (gray circle if future)
Connected by colored lines (green for completed segments, gray for future).

#### 7.3 Two-column info layout

- **Left column:** Vehicle info card (2x2 grid: Marke/Modell, Kennzeichen, Baujahr, Kilometerstand) + Customer info card (name, email mailto: link, phone tel: link, pickup/return address)
- **Right column:** Service details card (service type, pickup date, return date, price) + Notes card

#### 7.4 Extension creation form (inline)

Replaces the separate `ExtensionModal`. Renders inline within the order detail view, toggleable via "+ Neue Erweiterung" button.

Form layout:
- Description textarea
- Items table: Bezeichnung | Menge | Einzelpreis | Gesamt | Delete
- "+ Position hinzufuegen" button
- Running total
- "Abbrechen" / "Erweiterung senden" buttons
- Info note: "Der Kunde wird benachrichtigt und muss die Erweiterung genehmigen."

Existing approved extensions displayed above the form as green-tinted cards with itemized breakdown.

#### 7.5 Communication/notes section

- History of notes/messages with timestamps
- System messages in blue-tinted cards
- User messages in gray cards
- Text input + "Senden" button at bottom

#### File-by-file changes

| File | Action | Description |
|------|--------|-------------|
| `components/workshop/OrderDetailsModal.tsx` | **MODIFY** | Convert from modal to full-page view component. Rename to `OrderDetailView.tsx` (keep modal export as thin wrapper for backward compat). Restructure layout to two-column grid. Add inline extension form. Add communication section. |
| `components/workshop/OrderDetailView.tsx` | **CREATE** | New full-page order detail component. Can be rendered both as page content and inside a dialog. |
| `components/workshop/StatusTimeline.tsx` | **CREATE** | Horizontal status timeline with 3 nodes. Props: `currentStatus: string`, `timestamps: Record<string, string>`. |
| `components/workshop/InlineExtensionForm.tsx` | **CREATE** | Extension creation form rendered inline. Props: `orderId`, `customerName`, `onSubmit`, `onCancel`. Replaces ExtensionModal for in-page use. |
| `components/workshop/CommunicationSection.tsx` | **CREATE** | Notes/messages timeline + input. Props: `messages: Message[]`, `onSend: (text: string) => void`. |
| `components/workshop/ExtensionModal.tsx` | **MODIFY** | Keep as thin wrapper around InlineExtensionForm for backward compatibility. |

---

### 8. New Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `WorkshopTopBar` | `components/workshop/WorkshopTopBar.tsx` | `workshopName: string`, `notificationCount: number`, `searchQuery: string`, `onSearch: (q) => void`, `locale: string` | Professional desktop top bar |
| `WorkshopBottomNav` | `components/workshop/WorkshopBottomNav.tsx` | `locale: string`, `activeRoute: string` | Mobile bottom nav bar |
| `KanbanBoard` | `components/workshop/KanbanBoard.tsx` | `orders: Order[]`, `onStatusChange`, `onOpenDetails`, `onOpenExtension` | 3-column Kanban layout with mobile tab fallback |
| `KanbanColumn` | `components/workshop/KanbanColumn.tsx` | `title: string`, `color: string`, `count: number`, `children: ReactNode` | Individual Kanban column |
| `KanbanOrderCard` | `components/workshop/KanbanOrderCard.tsx` | `order: Order`, `column: string`, `onAction: (orderId, action) => void` | State-differentiated Kanban card |
| `OrderDetailView` | `components/workshop/OrderDetailView.tsx` | `order: Order`, `onStatusChange`, `onBack`, `onExtensionSubmit` | Full-page two-column order detail |
| `StatusTimeline` | `components/workshop/StatusTimeline.tsx` | `currentStatus: string`, `timestamps: Record<string, string>` | Horizontal 3-node status timeline |
| `InlineExtensionForm` | `components/workshop/InlineExtensionForm.tsx` | `orderId: string`, `customerName: string`, `onSubmit`, `onCancel` | Inline extension creation form |
| `CommunicationSection` | `components/workshop/CommunicationSection.tsx` | `messages: Message[]`, `onSend: (text) => void` | Notes/messages timeline |
| `WorkshopStatsBar` | `components/workshop/WorkshopStatsBar.tsx` | `newCount: number`, `inProgressCount: number`, `completedCount: number`, `revenue?: string` | Horizontal stats bar with 4 metric cards |

---

## PART C: SHARED

### 9. File Change Matrix

| File | Action | Description |
|------|--------|-------------|
| **Jockey pages** | | |
| `app/[locale]/jockey/layout.tsx` | CREATE | Shared jockey layout with JockeyTopBar + JockeyBottomNav |
| `app/[locale]/jockey/dashboard/page.tsx` | MODIFY | Remove inline header, stat cards, quick-link buttons. Use JockeyAssignmentCard, JockeySummaryBar, JockeyStatusToggle. Add detail view toggle state. |
| `app/[locale]/jockey/stats/page.tsx` | MODIFY | Remove back-to-dashboard link (handled by bottom nav). Minor layout adjustments. |
| `app/[locale]/jockey/availability/page.tsx` | MODIFY | Remove back-to-dashboard link. Minor layout adjustments. |
| `app/[locale]/jockey/login/page.tsx` | NO CHANGE | Login page is independent of portal layout. |
| **Jockey components** | | |
| `components/jockey/JockeyBottomNav.tsx` | CREATE | Mobile bottom nav (4 items) |
| `components/jockey/JockeyTopBar.tsx` | CREATE | Dark navy header with greeting, bell, avatar |
| `components/jockey/JockeyAssignmentCard.tsx` | CREATE | State-differentiated assignment card with full-width action button |
| `components/jockey/JockeyAssignmentDetail.tsx` | CREATE | Full assignment detail view with map, checklist, photos, signature |
| `components/jockey/JockeyStatusToggle.tsx` | CREATE | Availability toggle switch |
| `components/jockey/JockeySummaryBar.tsx` | CREATE | Compact today summary bar |
| `components/jockey/HandoverChecklist.tsx` | CREATE | Reusable handover checklist |
| `components/jockey/PhotoDocGrid.tsx` | CREATE | Reusable photo documentation grid |
| `components/jockey/SignaturePad.tsx` | CREATE | Reusable signature canvas |
| `components/jockey/HandoverModal.tsx` | MODIFY | Refactor to use HandoverChecklist, PhotoDocGrid, SignaturePad sub-components |
| `components/jockey/jockey-photo-upload.tsx` | NO CHANGE | Profile photo upload, unrelated to dashboard redesign |
| **Workshop pages** | | |
| `app/[locale]/workshop/layout.tsx` | CREATE | Shared workshop layout with WorkshopTopBar + WorkshopBottomNav |
| `app/[locale]/workshop/dashboard/page.tsx` | MODIFY | Remove inline header, Table. Use KanbanBoard, WorkshopStatsBar. Keep API fetching, status mapping logic. |
| `app/[locale]/workshop/calendar/page.tsx` | MODIFY | Remove back-to-dashboard link (handled by bottom nav/layout). |
| `app/[locale]/workshop/stats/page.tsx` | MODIFY | Remove back-to-dashboard link. |
| `app/[locale]/workshop/team/page.tsx` | MODIFY | Remove back-to-dashboard link. |
| `app/[locale]/workshop/login/page.tsx` | NO CHANGE | Login page is independent of portal layout. |
| **Workshop components** | | |
| `components/workshop/WorkshopTopBar.tsx` | CREATE | Professional desktop top bar |
| `components/workshop/WorkshopBottomNav.tsx` | CREATE | Mobile bottom nav (4 items) |
| `components/workshop/KanbanBoard.tsx` | CREATE | 3-column Kanban with mobile tab fallback |
| `components/workshop/KanbanColumn.tsx` | CREATE | Individual Kanban column container |
| `components/workshop/KanbanOrderCard.tsx` | CREATE | State-differentiated order card |
| `components/workshop/OrderDetailView.tsx` | CREATE | Full-page two-column order detail |
| `components/workshop/StatusTimeline.tsx` | CREATE | Horizontal 3-node status timeline |
| `components/workshop/InlineExtensionForm.tsx` | CREATE | Inline extension form (replaces modal for in-page use) |
| `components/workshop/CommunicationSection.tsx` | CREATE | Notes/messages timeline with input |
| `components/workshop/WorkshopStatsBar.tsx` | CREATE | 4-metric horizontal stats bar |
| `components/workshop/OrderDetailsModal.tsx` | MODIFY | Convert to thin wrapper around OrderDetailView for backward compat |
| `components/workshop/ExtensionModal.tsx` | MODIFY | Convert to thin wrapper around InlineExtensionForm |
| `components/workshop/workshop-photo-upload.tsx` | NO CHANGE | Facility photo upload, unrelated to dashboard redesign |
| **Shared / Styling** | | |
| `app/globals.css` | MODIFY | Add CSS custom properties for new design tokens: `--accent-purple` (8b5cf6) for return assignments, Kanban column header strips, card-lift hover transition, pulse-dot animation, progress-pulse animation, sig-area lined background |
| `lib/api/jockeys.ts` | MODIFY | Add `updateAvailability()` method for the availability toggle |

---

### 10. i18n Key Changes

#### Jockey DE keys (additions to `jockeyDashboard` in `messages/de.json`)

```json
{
  "jockeyDashboard": {
    "greeting": "Hallo, {name}!",
    "statusLabel": "Status",
    "available": "Verfuegbar",
    "busy": "Beschaeftigt",
    "summaryToday": "{count} Auftraege heute",
    "summaryPickups": "{count} Abholung",
    "summaryReturns": "{count} Rueckgabe",
    "currentAssignment": "Aktueller Auftrag",
    "nextAssignment": "Naechster Auftrag",
    "completedToday": "Heute erledigt ({count})",
    "noCompletedToday": "Noch keine abgeschlossenen Auftraege heute.",
    "assigned": "Zugewiesen",
    "startRoute": "Route starten",
    "arrived": "Angekommen",
    "completeHandover": "Uebergabe abschliessen",
    "callCustomer": "Anrufen",
    "navigateTo": "Navigation",
    "detail": {
      "back": "Zurueck",
      "title": "Auftragsdetails",
      "currentStatus": "Aktueller Status",
      "enRouteToCustomer": "Unterwegs zum Kunden",
      "enRouteToWorkshop": "Unterwegs zur Werkstatt",
      "atCustomerLocation": "Beim Kunden angekommen",
      "mapPlaceholder": "Google Maps Integration",
      "estimatedTime": "~{minutes} Min. / {km} km",
      "customerInfo": "Kundeninformationen",
      "vehicleInfo": "Fahrzeuginformationen",
      "brand": "Marke",
      "model": "Modell",
      "year": "Baujahr",
      "plate": "Kennzeichen",
      "color": "Farbe",
      "mileage": "Kilometerstand",
      "handoverChecklist": "Uebergabe-Checkliste",
      "checkVehicleReceived": "Fahrzeug empfangen",
      "checkConditionDocumented": "Zustand dokumentiert",
      "checkKeysReceived": "Schluessel erhalten",
      "checkCustomerSignature": "Unterschrift Kunde",
      "photoDocumentation": "Fahrzeugzustand dokumentieren",
      "openCamera": "Kamera oeffnen",
      "customerSignature": "Unterschrift des Kunden",
      "clearSignature": "Loeschen",
      "signHere": "Hier unterschreiben",
      "customerNote": "Hinweis"
    },
    "bottomNav": {
      "tasks": "Aufgaben",
      "stats": "Statistiken",
      "availability": "Verfuegbarkeit",
      "profile": "Profil"
    }
  }
}
```

#### Jockey EN keys (additions to `jockeyDashboard` in `messages/en.json`)

```json
{
  "jockeyDashboard": {
    "greeting": "Hello, {name}!",
    "statusLabel": "Status",
    "available": "Available",
    "busy": "Busy",
    "summaryToday": "{count} assignments today",
    "summaryPickups": "{count} Pickup",
    "summaryReturns": "{count} Return",
    "currentAssignment": "Current Assignment",
    "nextAssignment": "Next Assignment",
    "completedToday": "Completed today ({count})",
    "noCompletedToday": "No completed assignments today yet.",
    "assigned": "Assigned",
    "startRoute": "Start Route",
    "arrived": "Arrived",
    "completeHandover": "Complete Handover",
    "callCustomer": "Call",
    "navigateTo": "Navigation",
    "detail": {
      "back": "Back",
      "title": "Assignment Details",
      "currentStatus": "Current Status",
      "enRouteToCustomer": "En Route to Customer",
      "enRouteToWorkshop": "En Route to Workshop",
      "atCustomerLocation": "Arrived at Customer",
      "mapPlaceholder": "Google Maps Integration",
      "estimatedTime": "~{minutes} min / {km} km",
      "customerInfo": "Customer Information",
      "vehicleInfo": "Vehicle Information",
      "brand": "Brand",
      "model": "Model",
      "year": "Year",
      "plate": "License Plate",
      "color": "Color",
      "mileage": "Mileage",
      "handoverChecklist": "Handover Checklist",
      "checkVehicleReceived": "Vehicle received",
      "checkConditionDocumented": "Condition documented",
      "checkKeysReceived": "Keys received",
      "checkCustomerSignature": "Customer signature",
      "photoDocumentation": "Document vehicle condition",
      "openCamera": "Open Camera",
      "customerSignature": "Customer Signature",
      "clearSignature": "Clear",
      "signHere": "Sign here",
      "customerNote": "Note"
    },
    "bottomNav": {
      "tasks": "Tasks",
      "stats": "Statistics",
      "availability": "Availability",
      "profile": "Profile"
    }
  }
}
```

#### Workshop DE keys (additions to `workshopDashboard` in `messages/de.json`)

```json
{
  "workshopDashboard": {
    "kanban": {
      "new": "Neu",
      "inProgress": "In Bearbeitung",
      "completed": "Abgeschlossen",
      "accept": "Annehmen",
      "complete": "Abschliessen",
      "addExtension": "+ Erweiterung",
      "viewDetails": "Details ansehen",
      "moreOrders": "+{count} weitere Auftraege",
      "dragToAdvance": "Ziehen um Status zu aendern"
    },
    "stats": {
      "newOrders": "Neue Auftraege",
      "revenueToday": "Umsatz heute"
    },
    "detail": {
      "back": "Zurueck",
      "changeStatus": "Status aendern",
      "markCompleted": "Als abgeschlossen markieren",
      "startWork": "Bearbeitung starten",
      "markArrived": "Als angekommen markieren",
      "statusTimeline": "Status-Verlauf",
      "received": "Eingegangen",
      "vehicleInfo": "Fahrzeuginformationen",
      "brandModel": "Marke / Modell",
      "plate": "Kennzeichen",
      "year": "Baujahr",
      "mileage": "Kilometerstand",
      "customerInfo": "Kundeninformationen",
      "pickupReturnAddress": "Abhol-/Rueckgabeadresse",
      "serviceDetails": "Service-Details",
      "service": "Service",
      "pickup": "Abholung",
      "returnDate": "Rueckgabe",
      "price": "Preis",
      "notes": "Notizen",
      "extensions": "Erweiterungen",
      "extensionApproved": "genehmigt",
      "newExtension": "+ Neue Erweiterung",
      "extensionItems": "Positionen",
      "extensionTotal": "Gesamt",
      "extensionDescription": "Grund fuer die Erweiterung...",
      "extensionItemPlaceholder": "z.B. Zahnriemen",
      "extensionQuantity": "Menge",
      "extensionUnitPrice": "Einzelpreis",
      "extensionItemTotal": "Gesamt",
      "addPosition": "+ Position hinzufuegen",
      "sendExtension": "Erweiterung senden",
      "cancelExtension": "Abbrechen",
      "extensionNotice": "Der Kunde wird benachrichtigt und muss die Erweiterung genehmigen.",
      "communication": "Notizen & Kommunikation",
      "addNote": "Notiz hinzufuegen...",
      "send": "Senden",
      "system": "System"
    },
    "bottomNav": {
      "orders": "Auftrage",
      "calendar": "Kalender",
      "stats": "Statistiken",
      "team": "Team"
    }
  }
}
```

#### Workshop EN keys (additions to `workshopDashboard` in `messages/en.json`)

```json
{
  "workshopDashboard": {
    "kanban": {
      "new": "New",
      "inProgress": "In Progress",
      "completed": "Completed",
      "accept": "Accept",
      "complete": "Complete",
      "addExtension": "+ Extension",
      "viewDetails": "View Details",
      "moreOrders": "+{count} more orders",
      "dragToAdvance": "Drag to change status"
    },
    "stats": {
      "newOrders": "New Orders",
      "revenueToday": "Revenue Today"
    },
    "detail": {
      "back": "Back",
      "changeStatus": "Change Status",
      "markCompleted": "Mark as Completed",
      "startWork": "Start Work",
      "markArrived": "Mark as Arrived",
      "statusTimeline": "Status Timeline",
      "received": "Received",
      "vehicleInfo": "Vehicle Information",
      "brandModel": "Make / Model",
      "plate": "License Plate",
      "year": "Year",
      "mileage": "Mileage",
      "customerInfo": "Customer Information",
      "pickupReturnAddress": "Pickup/Return Address",
      "serviceDetails": "Service Details",
      "service": "Service",
      "pickup": "Pickup",
      "returnDate": "Return",
      "price": "Price",
      "notes": "Notes",
      "extensions": "Extensions",
      "extensionApproved": "approved",
      "newExtension": "+ New Extension",
      "extensionItems": "Items",
      "extensionTotal": "Total",
      "extensionDescription": "Reason for extension...",
      "extensionItemPlaceholder": "e.g., Timing belt",
      "extensionQuantity": "Qty",
      "extensionUnitPrice": "Unit Price",
      "extensionItemTotal": "Total",
      "addPosition": "+ Add Item",
      "sendExtension": "Send Extension",
      "cancelExtension": "Cancel",
      "extensionNotice": "The customer will be notified and must approve the extension.",
      "communication": "Notes & Communication",
      "addNote": "Add note...",
      "send": "Send",
      "system": "System"
    },
    "bottomNav": {
      "orders": "Orders",
      "calendar": "Calendar",
      "stats": "Statistics",
      "team": "Team"
    }
  }
}
```

**Note:** Existing keys under `jockeyDashboard`, `workshopDashboard`, `workshopModal` are preserved. New keys are added alongside them. Some existing keys (e.g., `jockeyDashboard.call`, `jockeyDashboard.navigate`) may be aliased to the new keys during migration.

---

### 11. E2E Test Impact

#### Walkthrough Phase 2: Jockey Login + Dashboard (P2-02, P2-03)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P2-02 Jockey Login | `data-testid="jockey-username-input"`, `data-testid="jockey-password-input"`, `data-testid="jockey-login-button"` | **No change** -- login page is not affected by portal redesign. |
| P2-03 Jockey Dashboard | `page.goto('/de/jockey/dashboard')`, waits for `networkidle`, takes screenshot | **Minor**: Dashboard layout changes but URL and load behavior unchanged. Screenshot will reflect new design. Verify that assignment data still loads (API-driven). |

#### Walkthrough Phase 2: Jockey Pickup Flow (P2-04)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P2-04 Pickup flow | Uses API calls (`PATCH /api/jockeys/assignments/:id/status`) to advance status, then reloads dashboard and takes screenshots | **No change to test logic** -- tests advance status via API, not UI buttons. Screenshots will reflect new card designs. No selector breakage. |

#### Walkthrough Phase 3: Workshop Login + Dashboard AT_WORKSHOP (P3-01, P3-02)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P3-01 Workshop Login | `page.goto('/de/workshop/login')` | **No change.** |
| P3-02 Workshop Dashboard | `[data-testid="booking-status"]` for badge, `page.locator('tr', { hasText: bookingNumber })` for finding order row, `button:has-text("Details")` for opening modal | **BREAKING**: The `tr` selector targets table rows. With Kanban redesign, orders are in card components, not table rows. Must update to target Kanban cards. |

**Required selector changes for P3-02:**
- Replace `page.locator('tr', { hasText: bookingNumber })` with `page.locator('[data-testid="kanban-card"]', { hasText: bookingNumber })` or `page.locator('.kanban-order-card', { hasText: bookingNumber })`
- Replace `button:has-text("Details")` with the card's detail action button
- Keep `[data-testid="booking-status"]` as-is (will be on Kanban card badges)

#### Walkthrough Phase 4: Workshop IN_SERVICE (P4-01)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P4-01 Dashboard IN_SERVICE | Same `tr` + `button:has-text("Details")` pattern | **BREAKING**: Same table-to-Kanban migration as P3-02. Update card selectors. |

**Required selector changes for P4-01:**
- Same as P3-02 above
- The order will appear in the "In Bearbeitung" Kanban column

#### Walkthrough Phase 5: Extension Flow (P5-01 through P5-11)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P5-01 Open extension modal | `page.locator('tr', { hasText: bookingNumber })` + `button` with `svg.lucide-plus` | **BREAKING**: No more table rows. Find the extension button on the Kanban card. With inline extension form, the flow changes from modal to in-page. |
| P5-02 Fill extension form | `page.locator('[role="dialog"]')`, `dialog.locator('textarea')`, `dialog.locator('input[type="number"]')` | **BREAKING if inline**: If extension form becomes inline (not modal), `[role="dialog"]` won't match. Need to target the inline form container instead. **Recommendation**: Keep ExtensionModal as thin wrapper so existing tests still work. The inline form is used from the detail view; the Kanban card button still opens the modal. |
| P5-11 Workshop see approved extension | Same `tr` + `button:has-text("Details")` pattern | **BREAKING**: Same Kanban migration. |

**Recommendation for Phase 5:** Keep `ExtensionModal` opening from Kanban card buttons (same UX as current). The inline extension form is only used within the detail view. This minimizes test breakage.

#### Walkthrough Phase 6: Workshop READY_FOR_RETURN (P6-01, P6-02)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P6-01 Dashboard READY_FOR_RETURN | `[data-testid="booking-status"]`, `tr` row locator, `button:has-text("Details")` | **BREAKING**: Same Kanban migration. Order appears in "Abgeschlossen" column. |
| P6-02 Setup advance to RETURN_ASSIGNED | Pure API test | **No change.** |

#### Walkthrough Phase 7: Jockey Return (P7-01 through P7-04)

| Test | Current selectors | Change required |
|------|-------------------|-----------------|
| P7-01 Dashboard with return | `page.goto('/de/jockey/dashboard')`, screenshot | **No selector breakage** -- tests use API to advance status and take screenshots. New card design will be captured. |
| P7-02 Return en route | API status change + screenshot | **No change.** |
| P7-03 Return at location | API status change + screenshot | **No change.** |
| P7-04 Return complete | API complete + screenshot | **No change.** |

#### Both DE and EN specs

The English walkthrough (`walkthrough-en-unified.spec.ts`) follows the same pattern. All selector changes apply identically.

#### Other affected tests

| Test file | Impact |
|-----------|--------|
| `04-jockey-portal.spec.ts` | **Low risk**: Smoke test that navigates to jockey portal and checks basic elements. May need selector updates if header structure changes. |
| `05-workshop-portal.spec.ts` | **Medium risk**: Smoke test for workshop portal. Table-related selectors will break with Kanban. |
| `11-jockey-handover-flow.spec.ts` | **Medium risk**: Tests handover UI flow. If HandoverModal dialog interface is preserved, no breakage. If converted to inline view, selector updates needed. |
| `13-return-journey.spec.ts` | **Low risk**: Uses API-driven status changes. |
| `09-complete-e2e-journey.spec.ts` | **Medium risk**: Full lifecycle test may reference table rows in workshop section. |
| `qa-portal-interactions.spec.ts` | **Medium risk**: Portal interaction audit may have workshop table selectors. |
| `portal-smoke-tests.spec.ts` | **Low risk**: Basic accessibility checks. |

#### Recommended data-testid attributes for new components

To ensure stable E2E selectors, add these test IDs:

| Component | data-testid | Purpose |
|-----------|-------------|---------|
| KanbanBoard | `kanban-board` | Container for all columns |
| KanbanColumn | `kanban-column-{status}` | Individual column (new, inProgress, completed) |
| KanbanOrderCard | `kanban-card-{bookingNumber}` | Individual order card |
| KanbanOrderCard action button | `kanban-action-{bookingNumber}` | Primary action button on card |
| JockeyAssignmentCard | `jockey-card-{assignmentId}` | Individual assignment card |
| JockeyAssignmentCard action | `jockey-action-{assignmentId}` | Primary action button |
| JockeyBottomNav | `jockey-bottom-nav` | Bottom navigation container |
| WorkshopBottomNav | `workshop-bottom-nav` | Bottom navigation container |
| WorkshopTopBar search | `workshop-search-input` | Search input in top bar |
| StatusTimeline | `status-timeline` | Workshop order status timeline |
| InlineExtensionForm | `inline-extension-form` | Extension form container |

---

*End of Jockey & Workshop Portal Redesign Plan*
