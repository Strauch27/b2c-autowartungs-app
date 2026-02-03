# Booking FSM Implementation Summary

## Übersicht

Diese Implementierung führt ein **Finite State Machine (FSM)** für Booking-Status-Übergänge ein, um die Integrität des Buchungs-Lifecycles zu gewährleisten und ungültige Status-Übergänge zu verhindern.

## Deliverables

### Teil 1: Prisma Schema Update ✅

**Datei:** `/backend/prisma/schema.prisma`

**Änderungen:**
- Neue BookingStatus-Werte hinzugefügt:
  - `PICKUP_ASSIGNED` - Jockey für Abholung zugewiesen
  - `PICKED_UP` - Fahrzeug beim Kunden abgeholt
  - `AT_WORKSHOP` - Fahrzeug in der Werkstatt angekommen
  - `IN_SERVICE` - Werkstatt arbeitet aktiv am Fahrzeug
  - `READY_FOR_RETURN` - Service abgeschlossen, bereit für Rückgabe
  - `RETURN_ASSIGNED` - Jockey für Rückgabe zugewiesen
  - `RETURNED` - Fahrzeug an Kunde zurückgegeben (finaler Status)

- Beibehaltene Legacy-Status (mit @deprecated Marker):
  - `JOCKEY_ASSIGNED` → nutze `PICKUP_ASSIGNED`
  - `IN_TRANSIT_TO_WORKSHOP` → nutze `PICKED_UP`
  - `IN_WORKSHOP` → nutze `AT_WORKSHOP` oder `IN_SERVICE`
  - `COMPLETED` → nutze `READY_FOR_RETURN`
  - `IN_TRANSIT_TO_CUSTOMER` → nutze `RETURN_ASSIGNED` oder `RETURNED`

**Migration:**
- Datei: `/backend/prisma/migrations/20260203000000_refactor_booking_status_fsm/migration.sql`
- Status: Erstellt, aber NICHT ausgeführt (wie gefordert)
- Migration ist reversibel (alte Enum-Werte bleiben erhalten)

### Teil 2: FSM Implementation ✅

**Datei:** `/backend/src/domain/bookingFsm.ts`

**Funktionen:**

1. **`isTransitionAllowed(currentStatus, newStatus)`**
   - Prüft ob ein Status-Übergang erlaubt ist
   - Nutzt `ALLOWED_TRANSITIONS` Map

2. **`assertTransition(currentStatus, newStatus, actor?)`**
   - Validiert Status-Übergang und wirft ApiError bei Fehler
   - Optional: Prüft Actor-Berechtigungen
   - **Dies ist die Hauptmethode für Status-Änderungen**

3. **`getNextPossibleStates(currentStatus)`**
   - Gibt alle möglichen nächsten Status zurück
   - Hilfreich für UI-Darstellung

4. **`isFinalState(status)`**
   - Prüft ob Status ein finaler Status ist (keine weiteren Übergänge)

5. **`isCancellable(status)`**
   - Prüft ob Buchung in diesem Status storniert werden kann

6. **`mapLegacyToNewStatus(legacyStatus)`**
   - Mapped alte Status auf neue Status (für Migration)

7. **`getStatusDescription(status)`**
   - Liefert menschenlesbare Beschreibung des Status

**Actor-Types:**
```typescript
enum Actor {
  SYSTEM,    // Automatische System-Aktionen
  CUSTOMER,  // Kunden-Aktionen
  JOCKEY,    // Jockey-Aktionen
  WORKSHOP,  // Werkstatt-Aktionen
  ADMIN      // Admin-Override
}
```

**FSM Flow:**
```
PENDING_PAYMENT → CONFIRMED → PICKUP_ASSIGNED → PICKED_UP →
AT_WORKSHOP → IN_SERVICE → READY_FOR_RETURN → RETURN_ASSIGNED →
RETURNED
```

**Stornierung möglich von:**
- `PENDING_PAYMENT`
- `CONFIRMED`
- `PICKUP_ASSIGNED`

### Teil 3: Service Layer Refactoring ✅

#### 3.1 Bookings Service

**Datei:** `/backend/src/services/bookings.service.ts`

**Änderungen:**

1. **Neue Methode `transitionStatus()`:**
   ```typescript
   async transitionStatus(
     bookingId: string,
     newStatus: BookingStatus,
     actor: Actor = Actor.SYSTEM
   ): Promise<BookingWithRelations>
   ```
   - Empfohlene Methode für alle Status-Änderungen
   - Nutzt FSM für Validierung
   - Loggt alle Übergänge

2. **`validateStatusTransition()` aktualisiert:**
   - Nutzt jetzt `assertTransition()` aus FSM
   - Marked als @deprecated - `transitionStatus()` bevorzugen

3. **`cancelBooking()` aktualisiert:**
   - Nutzt `isCancellable()` aus FSM
   - Prüft Actor-Berechtigung (CUSTOMER)

#### 3.2 Bookings Controller

**Datei:** `/backend/src/controllers/bookings.controller.ts`

**Änderungen:**

1. **Neue Helper-Funktion `createPickupAssignment()`:**
   - Erstellt Pickup-Assignment für bestätigte Buchung
   - Setzt Status auf `PICKUP_ASSIGNED` (nicht mehr `JOCKEY_ASSIGNED`)
   - Wird NACH erfolgreicher Zahlung aufgerufen

2. **`handleBookingPaymentAndNotifications()` aktualisiert:**
   - Demo Mode: Auto-confirm + sofortige Assignment-Erstellung
   - Production Mode: Assignment erst nach Zahlung (via Webhook)
   - Verhindert doppelte Assignment-Erstellung

3. **Wichtig:** Assignment-Erstellung verschoben:
   - **Vorher:** Bei Buchungserstellung
   - **Nachher:** Nach erfolgreicher Zahlung

#### 3.3 Workshops Controller

**Datei:** `/backend/src/controllers/workshops.controller.ts`

**Änderungen:**

1. **`updateBookingStatus()` mit FSM-Validierung:**
   - Holt aktuellen Booking-Status vor Update
   - Validiert Übergang mit `assertTransition(currentStatus, newStatus, Actor.WORKSHOP)`
   - Liefert aussagekräftige Fehlermeldungen bei ungültigen Übergängen

2. **Return Assignment bei `READY_FOR_RETURN`:**
   - Erstellt Return-Assignment wenn Workshop Status auf `READY_FOR_RETURN` setzt
   - Unterstützt auch Legacy-Status `COMPLETED`
   - Auto-Capture von Extension-Payments (mit Demo-Mode-Support)

3. **Improved Error Handling:**
   - Separate Fehlerbehandlung für FSM-Validierung
   - HTTP 400 für ungültige Transitions
   - HTTP 404 für nicht gefundene Buchungen

#### 3.4 Jockeys Controller

**Datei:** `/backend/src/controllers/jockeys.controller.ts`

**Änderungen:**

1. **`updateAssignmentStatus()` aktualisiert:**
   - Pickup completed → `PICKED_UP` (statt `IN_TRANSIT_TO_WORKSHOP`)
   - Return completed → `RETURNED` (statt `DELIVERED`)
   - Besseres Logging mit assignmentType

2. **`completeAssignment()` aktualisiert:**
   - Nutzt neue FSM-Status
   - Konsistentes Status-Mapping für beide Assignment-Typen

### Teil 4: Unit Tests ✅

**Datei:** `/backend/src/domain/__tests__/bookingFsm.test.ts`

**Test-Coverage:**

- ✅ **49 Tests, alle bestanden**
- Test-Suites:
  - `isTransitionAllowed` (11 Tests)
  - `assertTransition` (8 Tests)
  - `getNextPossibleStates` (4 Tests)
  - `isFinalState` (5 Tests)
  - `isCancellable` (5 Tests)
  - `mapLegacyToNewStatus` (7 Tests)
  - `getStatusDescription` (2 Tests)
  - Complete Booking Journey (4 Tests)
  - Edge Cases (3 Tests)

**Test-Abdeckung:**
- ✅ Erlaubte Übergänge
- ✅ Verbotene Übergänge
- ✅ Actor-Berechtigungen
- ✅ Komplette Booking-Journey (Happy Path)
- ✅ Stornierung in verschiedenen Phasen
- ✅ Legacy-Status-Kompatibilität
- ✅ Verhinderung von Status-Sprüngen
- ✅ Final-State-Handling
- ✅ Edge Cases

## Wichtige Hinweise

### Backward Compatibility

Die Implementierung ist **vollständig rückwärtskompatibel**:
- Alte Status-Werte bleiben im Enum erhalten
- FSM erlaubt Übergänge von/zu Legacy-Status
- `mapLegacyToNewStatus()` Funktion für Migration

### Breaking Changes: KEINE

- Keine Breaking Changes an Extension-Modell
- Demo Payment Service wird korrekt genutzt
- Alle bestehenden Endpoints funktionieren weiter

### Migration Strategy

1. **Phase 1 (Aktuell):**
   - Neue Status verfügbar
   - Legacy-Status funktionieren parallel
   - FSM validiert alle Übergänge

2. **Phase 2 (Optional, später):**
   - Migration-Script für bestehende Daten
   - Legacy-Status in neue Status konvertieren
   - SQL-Migration ausführen

3. **Phase 3 (Zukunft):**
   - Legacy-Status aus Enum entfernen
   - Nur neue Status nutzen

### Demo Mode Support

Die Implementierung respektiert `DEMO_MODE=true`:
- ✅ Demo Payment Service wird genutzt
- ✅ Auto-Confirm in Demo Mode
- ✅ Extension Payment Capture mit Demo Service
- ✅ Keine Stripe-Abhängigkeit im Demo Mode

## Testing

```bash
# FSM Unit Tests ausführen
cd backend
npm test -- bookingFsm.test.ts

# Alle Tests ausführen
npm test

# Prisma Client regenerieren (nach Schema-Änderungen)
npx prisma generate
```

## Verwendung

### Status-Übergang durchführen

```typescript
import { assertTransition, Actor } from '../domain/bookingFsm';

// Mit FSM-Validierung
try {
  assertTransition(currentStatus, newStatus, Actor.WORKSHOP);
  // Status-Update durchführen
} catch (error) {
  // Ungültiger Übergang
}
```

### Bookings Service nutzen

```typescript
// Empfohlene Methode
await bookingsService.transitionStatus(
  bookingId,
  BookingStatus.IN_SERVICE,
  Actor.WORKSHOP
);
```

### Nächste mögliche Status anzeigen

```typescript
import { getNextPossibleStates } from '../domain/bookingFsm';

const nextStates = getNextPossibleStates(booking.status);
// UI kann diese States als Buttons anzeigen
```

## Dateien-Übersicht

### Neue Dateien
- ✅ `/backend/src/domain/bookingFsm.ts` - FSM Implementierung
- ✅ `/backend/src/domain/__tests__/bookingFsm.test.ts` - Unit Tests
- ✅ `/backend/prisma/migrations/20260203000000_refactor_booking_status_fsm/migration.sql` - DB Migration (nicht ausgeführt)

### Modifizierte Dateien
- ✅ `/backend/prisma/schema.prisma` - BookingStatus Enum erweitert
- ✅ `/backend/src/services/bookings.service.ts` - FSM Integration
- ✅ `/backend/src/controllers/bookings.controller.ts` - Assignment-Erstellung verschoben
- ✅ `/backend/src/controllers/workshops.controller.ts` - FSM-Validierung + neue Status
- ✅ `/backend/src/controllers/jockeys.controller.ts` - Neue Status-Mappings

## Nächste Schritte (Optional)

1. **Frontend-Integration:**
   - Status-Labels in Dashboards aktualisieren
   - Neue Status in UI anzeigen

2. **Data Migration:**
   - Bestehende Bookings auf neue Status migrieren
   - SQL-Migration ausführen

3. **Monitoring:**
   - Logging für FSM-Violations einrichten
   - Metriken für Status-Übergänge

4. **Documentation:**
   - API-Dokumentation aktualisieren
   - Swagger/OpenAPI mit neuen Status

## Autor

Agent 2: Backend Domain / FSM & Data Integrity

## Status

✅ **KOMPLETT IMPLEMENTIERT**

Alle Anforderungen erfüllt:
- [x] Prisma Schema Update
- [x] Migration erstellt (nicht ausgeführt)
- [x] FSM Implementierung
- [x] Service Layer Refactoring
- [x] Controller Updates
- [x] Unit Tests (49/49 passed)
- [x] Demo Payment Support
- [x] Backward Compatibility
- [x] Keine Breaking Changes
