# Booking FSM Flow Diagram

## Happy Path Flow

```
┌─────────────────┐
│ PENDING_PAYMENT │ ← Buchung erstellt, wartet auf Zahlung
└────────┬────────┘
         │ Payment successful (SYSTEM)
         ▼
┌─────────────────┐
│   CONFIRMED     │ ← Zahlung bestätigt
└────────┬────────┘
         │ Jockey zugewiesen (SYSTEM)
         ▼
┌─────────────────┐
│ PICKUP_ASSIGNED │ ← Jockey für Abholung zugewiesen
└────────┬────────┘
         │ Fahrzeug abgeholt (JOCKEY)
         ▼
┌─────────────────┐
│   PICKED_UP     │ ← Fahrzeug beim Kunden abgeholt, Transit zur Werkstatt
└────────┬────────┘
         │ Ankunft Werkstatt (JOCKEY/WORKSHOP)
         ▼
┌─────────────────┐
│  AT_WORKSHOP    │ ← Fahrzeug in Werkstatt angekommen
└────────┬────────┘
         │ Service startet (WORKSHOP)
         ▼
┌─────────────────┐
│   IN_SERVICE    │ ← Werkstatt arbeitet am Fahrzeug
└────────┬────────┘
         │ Service abgeschlossen (WORKSHOP)
         ▼
┌─────────────────┐
│READY_FOR_RETURN │ ← Service fertig, bereit für Rückgabe
└────────┬────────┘
         │ Jockey für Rückgabe zugewiesen (SYSTEM/WORKSHOP)
         ▼
┌─────────────────┐
│ RETURN_ASSIGNED │ ← Jockey für Rückgabe zugewiesen
└────────┬────────┘
         │ Fahrzeug zurückgebracht (JOCKEY)
         ▼
┌─────────────────┐
│    RETURNED     │ ← Fahrzeug an Kunde zurückgegeben (FINAL)
└─────────────────┘
```

## Cancellation Flow

```
┌─────────────────┐
│ PENDING_PAYMENT │ ──┐
└─────────────────┘   │
                      │ (CUSTOMER)
┌─────────────────┐   │
│   CONFIRMED     │ ──┼─► ┌───────────┐
└─────────────────┘   │   │ CANCELLED │ (FINAL)
                      │   └───────────┘
┌─────────────────┐   │
│ PICKUP_ASSIGNED │ ──┘
└─────────────────┘

(Stornierung nur in frühen Phasen möglich)
```

## Legacy Status Mapping

```
OLD STATUS               →  NEW STATUS
──────────────────────────────────────────────
JOCKEY_ASSIGNED         →  PICKUP_ASSIGNED
IN_TRANSIT_TO_WORKSHOP  →  PICKED_UP
IN_WORKSHOP             →  AT_WORKSHOP / IN_SERVICE
COMPLETED               →  READY_FOR_RETURN
IN_TRANSIT_TO_CUSTOMER  →  RETURN_ASSIGNED / RETURNED
DELIVERED               →  RETURNED
```

## Actor Permissions Matrix

| Transition                          | SYSTEM | CUSTOMER | JOCKEY | WORKSHOP | ADMIN |
|-------------------------------------|--------|----------|--------|----------|-------|
| PENDING_PAYMENT → CONFIRMED         | ✅      | ❌        | ❌      | ❌        | ✅     |
| CONFIRMED → PICKUP_ASSIGNED         | ✅      | ❌        | ❌      | ❌        | ✅     |
| PICKUP_ASSIGNED → PICKED_UP         | ❌      | ❌        | ✅      | ❌        | ✅     |
| PICKED_UP → AT_WORKSHOP             | ❌      | ❌        | ✅      | ✅        | ✅     |
| AT_WORKSHOP → IN_SERVICE            | ❌      | ❌        | ❌      | ✅        | ✅     |
| IN_SERVICE → READY_FOR_RETURN       | ❌      | ❌        | ❌      | ✅        | ✅     |
| READY_FOR_RETURN → RETURN_ASSIGNED  | ✅      | ❌        | ❌      | ✅        | ✅     |
| RETURN_ASSIGNED → RETURNED          | ❌      | ❌        | ✅      | ❌        | ✅     |
| * → CANCELLED (early stages)        | ❌      | ✅        | ❌      | ❌        | ✅     |

## Status Properties

| Status             | Can Cancel? | Is Final? | Next States Count |
|--------------------|-------------|-----------|-------------------|
| PENDING_PAYMENT    | ✅ Yes       | ❌ No      | 2                 |
| CONFIRMED          | ✅ Yes       | ❌ No      | 3                 |
| PICKUP_ASSIGNED    | ✅ Yes       | ❌ No      | 3                 |
| PICKED_UP          | ❌ No        | ❌ No      | 1                 |
| AT_WORKSHOP        | ❌ No        | ❌ No      | 2                 |
| IN_SERVICE         | ❌ No        | ❌ No      | 1                 |
| READY_FOR_RETURN   | ❌ No        | ❌ No      | 2                 |
| RETURN_ASSIGNED    | ❌ No        | ❌ No      | 3                 |
| RETURNED           | ❌ No        | ✅ Yes     | 0                 |
| CANCELLED          | ❌ No        | ✅ Yes     | 0                 |
| DELIVERED          | ❌ No        | ✅ Yes     | 0                 |

## Real-World Example Journey

```
Timeline: 7-Tage Service-Journey

Tag 1, 09:00: Kunde erstellt Buchung
              Status: PENDING_PAYMENT

Tag 1, 09:05: Kunde zahlt mit Stripe/Demo
              Status: CONFIRMED

Tag 1, 09:10: System weist Jockey zu
              Status: PICKUP_ASSIGNED
              Jockey-Assignment: PICKUP, ASSIGNED

Tag 2, 08:00: Jockey fährt zum Kunden
              Assignment Status: EN_ROUTE

Tag 2, 08:30: Jockey holt Fahrzeug ab
              Status: PICKED_UP
              Assignment Status: COMPLETED

Tag 2, 09:00: Fahrzeug in Werkstatt
              Status: AT_WORKSHOP

Tag 2, 10:00: Werkstatt startet Service
              Status: IN_SERVICE

Tag 5, 16:00: Service abgeschlossen
              Status: READY_FOR_RETURN
              System erstellt Return-Assignment

Tag 6, 14:00: Jockey fährt zum Kunden
              Status: RETURN_ASSIGNED
              Assignment Status: EN_ROUTE

Tag 6, 15:00: Fahrzeug zurückgegeben
              Status: RETURNED ✓ FERTIG
              Assignment Status: COMPLETED
```

## Extension Flow Integration

```
Service läuft (IN_SERVICE)
│
├─► Werkstatt erstellt Extension
│   Extension Status: PENDING
│
├─► Kunde approved Extension
│   Extension Status: APPROVED
│   Payment Intent erstellt
│
├─► Service abgeschlossen
│   Booking Status: READY_FOR_RETURN
│   Extension Payment auto-captured
│   Extension Status: COMPLETED
│
└─► Continue mit Return Assignment
```

## Error Prevention Examples

### ❌ Ungültige Übergänge (werden verhindert)

```
PENDING_PAYMENT → IN_SERVICE
  Error: "Invalid status transition. Must go through CONFIRMED, PICKUP_ASSIGNED, PICKED_UP, AT_WORKSHOP first"

IN_SERVICE → RETURNED
  Error: "Invalid status transition. Must go through READY_FOR_RETURN, RETURN_ASSIGNED first"

RETURNED → CONFIRMED
  Error: "Invalid status transition. RETURNED is a final state"
```

### ❌ Ungültige Actor-Permissions (werden verhindert)

```
CUSTOMER attempting: AT_WORKSHOP → IN_SERVICE
  Error: "Actor CUSTOMER is not authorized. Allowed actors: WORKSHOP, ADMIN"

JOCKEY attempting: IN_SERVICE → READY_FOR_RETURN
  Error: "Actor JOCKEY is not authorized. Allowed actors: WORKSHOP, ADMIN"
```

## FSM Benefits

1. **Data Integrity:** Unmögliche Status-Sprünge werden verhindert
2. **Security:** Actor-basierte Berechtigungen
3. **Traceability:** Alle Übergänge werden geloggt
4. **UI Support:** `getNextPossibleStates()` für Button-Anzeige
5. **Testing:** Umfassende Test-Coverage
6. **Documentation:** Selbst-dokumentierender Code
