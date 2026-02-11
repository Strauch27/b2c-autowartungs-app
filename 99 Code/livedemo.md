# Live Demo - Hol- und Bringservice (AutoConcierge)

## Voraussetzungen

- PostgreSQL läuft lokal
- `.env` konfiguriert im Backend
- Node.js installiert

## Datenbank vorbereiten (Clean Slate)

```bash
cd "99 Code/backend"
npx prisma db seed
```

Das Seed-Skript:
- Löscht ALLE Buchungen, Fahrzeuge, Kunden, Assignments
- Behält nur **workshop1** und **jockey1**
- Erstellt Preismatrix und Zeitslots für die nächsten 7 Tage

## Server starten

### Backend (Port 5001)
```bash
cd "99 Code/backend"
npm run dev
```

### Frontend (Port 3000)
```bash
cd "99 Code/frontend"
npm run dev
```

## Login-Daten

| Portal   | URL                                     | Username    | Passwort     |
|----------|-----------------------------------------|-------------|--------------|
| Workshop | http://localhost:3000/en/workshop/login  | workshop1   | password123  |
| Jockey   | http://localhost:3000/en/jockey/login    | jockey1     | password123  |
| Kunde    | Registriert sich während der Buchung    | (E-Mail)    | (selbst gewählt) |

## Demo-Flow (Schritt für Schritt)

### 1. Kunde erstellt Buchung

1. Öffne http://localhost:3000/en
2. Klicke **"Book Now"**
3. Wähle Fahrzeugmarke (z.B. VW Golf 8)
4. Fahrzeugdaten eingeben: Jahr, Kilometerstand, Kennzeichen
5. Service auswählen (z.B. Inspection)
6. Termin wählen (Datum + Zeitslot)
7. Adresse eingeben (Straße, Stadt, PLZ)
8. Bestätigen → Kundendaten eingeben (E-Mail, Name, Telefon)
9. Buchung wird erstellt (Demo-Payment auto-confirmed)
10. **Registrierung**: Passwort setzen (min. 8 Zeichen)

> Nach der Registrierung wird der Kunde automatisch eingeloggt und zum Dashboard weitergeleitet.
> Die Buchung hat jetzt Status **PICKUP_ASSIGNED** (Jockey wurde automatisch zugewiesen).

### 2. Jockey holt Fahrzeug ab (Pickup)

1. Öffne http://localhost:3000/en/jockey/login
2. Login: `jockey1` / `password123`
3. Im Dashboard erscheint die Pickup-Assignment
4. Klicke auf die Assignment-Karte → Detail-Ansicht
5. **"Start Route"** → Status: EN_ROUTE
6. **"Arrived"** → Status: AT_LOCATION
7. Kilometerstand eingeben (Pflichtfeld)
8. **"Complete Pickup"** → Assignment COMPLETED, Buchung → **PICKED_UP**

> Im Kunden-Dashboard aktualisiert sich der Status automatisch (Polling alle 15s).

### 3. Workshop bearbeitet Fahrzeug

1. Öffne http://localhost:3000/en/workshop/login
2. Login: `workshop1` / `password123`
3. Im Dashboard erscheint die Buchung in der Spalte "Received"
4. Klicke auf die Buchung → Detail-Ansicht
5. **"Receive Vehicle"** → Status: AT_WORKSHOP
6. **"Start Service"** → Status: IN_SERVICE

#### Optional: Auftragserweiterung (Extension)

7. Im Workshop-Detail: Erweiterung erstellen (Beschreibung + Positionen + Preise)
8. Kunde sieht Banner im Dashboard → klickt "Review"
9. Kunde genehmigt Extension → Demo-Payment wird verarbeitet
10. Workshop sieht Extension als "Approved"

#### Service abschließen

11. **"Complete Service"** → Status: READY_FOR_RETURN
12. **"Assign Return"** → Status: RETURN_ASSIGNED (Jockey bekommt Return-Assignment)

### 4. Jockey bringt Fahrzeug zurück (Return)

1. Zurück zum Jockey-Dashboard (oder Seite neu laden)
2. Return-Assignment erscheint
3. **"Start Route"** → EN_ROUTE
4. **"Arrived"** → AT_LOCATION
5. Kilometerstand eingeben
6. **"Complete Return"** → Assignment COMPLETED, Buchung → **RETURNED**

> Kunde sieht im Dashboard den finalen Status **RETURNED**.

## Technische Details

### Status-Flow (FSM)

```
PENDING_PAYMENT → CONFIRMED → PICKUP_ASSIGNED → PICKED_UP → AT_WORKSHOP → IN_SERVICE → READY_FOR_RETURN → RETURN_ASSIGNED → RETURNED
```

### Auto-Refresh

Alle Customer-Seiten (Dashboard, Buchungsliste, Buchungsdetail) pollen alle 15 Sekunden den Backend-Status. Kein manuelles Neuladen nötig.

### Demo-Mode

`DEMO_MODE=true` in der `.env` aktiviert den Demo-Payment-Service (kein Stripe nötig). Zahlungen werden automatisch bestätigt.

### Jockey-Zuweisung

Es gibt nur einen Jockey (`jockey1`). Alle Buchungen werden automatisch diesem Jockey zugewiesen.

### Workshop-Ansicht

Die Workshop-Ansicht zeigt alle Buchungen basierend auf dem Status (kein direkter Workshop-FK). Da es nur eine Werkstatt gibt, sieht `workshop1` automatisch alle relevanten Buchungen.

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Login schlägt fehl | `npx prisma db seed` ausführen |
| Keine Zeitslots verfügbar | Seed erstellt Slots für 7 Tage, danach neu seeden |
| Status aktualisiert sich nicht | 15s warten (Polling-Intervall) oder Seite neu laden |
| Port belegt | `lsof -i :5001` / `lsof -i :3000` → PID killen |
| Backend startet nicht | `.env` prüfen (DATABASE_URL, JWT_SECRET, DEMO_MODE=true) |
