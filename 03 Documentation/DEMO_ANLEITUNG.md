# E2E Demo Anleitung - B2C Autowartungs-App

## 🚀 Schnellstart (5 Minuten Setup)

### 1. Backend starten

```bash
cd "/Users/stenrauch/Documents/B2C App v2/99 Code/backend"

# Terminal 1: Backend
npm run dev
```

✅ Backend läuft auf: **http://localhost:5001**

### 2. Frontend starten

```bash
cd "/Users/stenrauch/Documents/B2C App v2/99 Code/frontend"

# Terminal 2: Frontend
npm run dev
```

✅ Frontend läuft auf: **http://localhost:3000**

---

## 👥 Test-Accounts

### Customer Account
- **Email:** `customer@test.com`
- **Password:** `Test123!`
- **Role:** CUSTOMER

### Jockey Account
- **Email:** `jockey@test.com`
- **Password:** `Test123!`
- **Role:** JOCKEY

### Workshop Account
- **Email:** `workshop@test.com`
- **Password:** `Test123!`
- **Role:** WORKSHOP

---

## 🎯 Demo-Flow (10 Minuten)

### Phase 1: Customer bucht Service (2 Min)

**URL:** http://localhost:3000/de/booking

**Schritte:**
1. ✅ Login als Customer (`customer@test.com` / `Test123!`)
2. ✅ Service auswählen: **Ölwechsel**
3. ✅ Fahrzeugklasse: **Mittelklasse**
4. ✅ Concierge Service: **Aktiviert** ✓
5. ✅ Termin wählen: z.B. Morgen, 10:00 Uhr
6. ✅ Adresse eingeben: Musterstraße 123, 58453 Witten
7. ✅ Fahrzeugdaten eingeben:
   - Marke: VW
   - Modell: Golf
   - Kennzeichen: DO-AB 123
8. ✅ Zahlung mit Test-Karte:
   - **Karte:** `4242 4242 4242 4242`
   - **Datum:** 12/25
   - **CVC:** 123

**Ergebnis:**
- Buchung erfolgreich ✓
- Booking Status: `CONFIRMED`
- Pickup Assignment automatisch erstellt ✓

---

### Phase 2: Jockey sieht Auftrag & startet Abholung (1 Min)

**URL:** http://localhost:3000/de/jockey/dashboard

**Schritte:**
1. ✅ Logout Customer (oben rechts)
2. ✅ Login als Jockey (`jockey@test.com` / `Test123!`)
3. ✅ Dashboard zeigt neue Abholung
4. ✅ Klick auf **"Abholung starten"**
   - Status wechselt zu `EN_ROUTE`
5. ✅ Klick auf **"Übergabe dokumentieren"**
6. ✅ Fotos hochladen (Platzhalter für Demo)
7. ✅ Unterschrift erfassen (Platzhalter für Demo)
8. ✅ Klick auf **"Abholung abschließen"**

**Ergebnis:**
- Assignment Status: `COMPLETED`
- Booking Status: `IN_TRANSIT_TO_WORKSHOP`

---

### Phase 3: Workshop bearbeitet Fahrzeug (1 Min)

**URL:** http://localhost:3000/de/workshop/orders

**Schritte:**
1. ✅ Logout Jockey
2. ✅ Login als Workshop (`workshop@test.com` / `Test123!`)
3. ✅ Buchung in Liste finden
4. ✅ Status ändern zu: **"In Werkstatt"** (`IN_WORKSHOP`)
5. ✅ Fahrzeug wird bearbeitet...

---

### Phase 4: Workshop erstellt Auftragserweiterung (2 Min)

**URL:** http://localhost:3000/de/workshop/orders/[booking-id]

**Schritte:**
1. ✅ Bei der Buchung: **"Erweiterung erstellen"** klicken
2. ✅ Erweiterung eingeben:
   - **Beschreibung:** "Bremsbeläge vorne stark abgenutzt"
   - **Positionen:**
     - Bremsbeläge vorne: 2x 89,00€
     - Einbau: 1x 120,00€
   - **Gesamt:** 298,00€
3. ✅ Fotos hinzufügen (Platzhalter: abgenutzte Bremsbeläge)
4. ✅ **"Erweiterung senden"**

**Ergebnis:**
- Extension Status: `PENDING`
- Kunde erhält Benachrichtigung ✓

---

### Phase 5: Kunde genehmigt Erweiterung (2 Min)

**URL:** http://localhost:3000/de/bookings/[booking-id]

**Schritte:**
1. ✅ Logout Workshop
2. ✅ Login als Customer (`customer@test.com` / `Test123!`)
3. ✅ **"Meine Buchungen"** aufrufen
4. ✅ Aktuelle Buchung öffnen
5. ✅ Im Bereich "Auftragserweiterungen": **"Details anzeigen"**
6. ✅ Modal öffnet sich mit:
   - Beschreibung
   - Positionen (2x Bremsbeläge, 1x Einbau)
   - Fotos
   - Gesamtbetrag: 298,00€
7. ✅ Klick auf **"Genehmigen & Bezahlen"**
8. ✅ Stripe Payment Modal öffnet sich
9. ✅ Zahlungsmethode eingeben:
   - **Karte:** `4242 4242 4242 4242`
   - **Datum:** 12/25
   - **CVC:** 123
10. ✅ Klick auf **"Zahlung autorisieren"**

**Ergebnis:**
- Extension Status: `APPROVED`
- Payment Status: `Autorisiert` (noch nicht eingezogen!)
- Badge zeigt: "Autorisiert" (gelb)

---

### Phase 6: Workshop schließt Service ab (1 Min)

**URL:** http://localhost:3000/de/workshop/orders/[booking-id]

**Schritte:**
1. ✅ Logout Customer
2. ✅ Login als Workshop (`workshop@test.com` / `Test123!`)
3. ✅ Buchung öffnen
4. ✅ Status ändern zu: **"Abgeschlossen"** (`COMPLETED`)

**Ergebnis:**
- ✅ **Auto-Capture:** Zahlung für Extension wird automatisch eingezogen!
- Extension Status: `COMPLETED`
- Extension paidAt: [aktuelles Datum]
- Badge wechselt zu: "Bezahlt" (grün)
- ✅ **Return Assignment:** Automatisch erstellt für Rückgabe
- Booking Status: `READY_FOR_RETURN`

---

### Phase 7: Jockey liefert Fahrzeug zurück (1 Min)

**URL:** http://localhost:3000/de/jockey/dashboard

**Schritte:**
1. ✅ Logout Workshop
2. ✅ Login als Jockey (`jockey@test.com` / `Test123!`)
3. ✅ Dashboard zeigt neue **Rückgabe** (Return Assignment)
4. ✅ Klick auf **"Rückgabe starten"**
5. ✅ Klick auf **"Übergabe dokumentieren"**
6. ✅ Fotos & Unterschrift (Platzhalter)
7. ✅ Klick auf **"Rückgabe abschließen"**

**Ergebnis:**
- Assignment Status: `COMPLETED`
- Booking Status: `DELIVERED` ✓
- **E2E Flow komplett!** 🎉

---

## 📊 Was wurde demonstriert?

### ✅ Customer Journey
- [x] Service buchen mit Stripe Zahlung
- [x] Fahrzeug wird automatisch zur Abholung eingeplant
- [x] Extension in App sehen
- [x] Extension mit Stripe genehmigen (Autorisierung)
- [x] Zahlung wird erst bei Completion eingezogen

### ✅ Jockey Journey
- [x] Assignments in Dashboard sehen
- [x] Pickup starten & abschließen
- [x] Booking Status wird automatisch aktualisiert
- [x] Return Assignment automatisch erhalten
- [x] Return durchführen & abschließen

### ✅ Workshop Journey
- [x] Bookings verwalten
- [x] Extensions erstellen mit Fotos
- [x] Service auf COMPLETED setzen
- [x] Auto-Capture bei Completion
- [x] Return Assignment wird automatisch erstellt

### ✅ Payment Flow (kritisch!)
- [x] **Authorize on Approval:** Zahlung wird autorisiert, NICHT eingezogen
- [x] **Capture on Completion:** Zahlung wird erst bei Service-Abschluss eingezogen
- [x] Kunde sieht Status: "Autorisiert" → "Bezahlt"
- [x] Schutz für beide Seiten (Kunde & Werkstatt)

---

## 🔍 Wichtige Details zum Testen

### Stripe Test-Karten

**Erfolgreiche Zahlung:**
```
Karte:  4242 4242 4242 4242
Datum:  12/25
CVC:    123
```

**3D Secure (optional testen):**
```
Karte:  4000 0027 6000 3184
```

**Abgelehnte Zahlung:**
```
Karte:  4000 0000 0000 0002
```

### Status-Übergänge überprüfen

**Booking Status Flow:**
```
PENDING_PAYMENT
  → CONFIRMED (nach Zahlung)
  → JOCKEY_ASSIGNED (Pickup Assignment erstellt)
  → IN_TRANSIT_TO_WORKSHOP (Pickup completed)
  → IN_WORKSHOP (Workshop Checkin)
  → COMPLETED (Service fertig)
  → IN_TRANSIT_TO_CUSTOMER (Return started)
  → DELIVERED (Return completed)
```

**Extension Status Flow:**
```
PENDING (Workshop erstellt)
  → APPROVED (Customer genehmigt, Payment autorisiert)
  → COMPLETED (Workshop schließt Service ab, Payment captured)
```

### API Endpunkte (für manuelles Testen)

**Backend Base URL:** http://localhost:5001

**Wichtige Endpunkte:**
- `GET /api/jockeys/assignments` - Jockey Aufträge
- `POST /api/jockeys/assignments/:id/complete` - Assignment abschließen
- `POST /api/payment/authorize-extension` - Extension Payment autorisieren
- `POST /api/extensions/:id/approve` - Extension genehmigen
- `PATCH /api/workshops/bookings/:id/status` - Workshop Status ändern
- `POST /api/workshops/bookings/:bookingId/extensions` - Extension erstellen

---

## 🐛 Troubleshooting

### Problem: "Backend nicht erreichbar"
```bash
# Backend URL prüfen
echo $NEXT_PUBLIC_API_URL
# Sollte sein: http://localhost:5001

# Backend neu starten
cd backend
npm run dev
```

### Problem: "Zahlung schlägt fehl"
- Stripe Test-Karte verwenden: `4242 4242 4242 4242`
- Datum muss in der Zukunft liegen: `12/25`
- CVC: beliebige 3 Ziffern

### Problem: "Assignment nicht sichtbar"
- Warten 30 Sekunden (Auto-Refresh)
- Oder Seite manuell neu laden
- Prüfen ob Jockey eingeloggt ist

### Problem: "Extension Payment wird nicht captured"
- Prüfen ob Extension Status `APPROVED` ist
- Prüfen ob `stripePaymentIntentId` gesetzt ist
- Backend Logs prüfen für Stripe Errors

---

## 📝 Demo-Checkliste

Vor der Demo:
- [ ] Backend gestartet (Port 5001)
- [ ] Frontend gestartet (Port 3000)
- [ ] Datenbank läuft (PostgreSQL)
- [ ] Test-Accounts angelegt
- [ ] Stripe Test-Keys konfiguriert

Während der Demo:
- [ ] Customer Journey durchlaufen
- [ ] Jockey Pickup zeigen
- [ ] Workshop Extension erstellen
- [ ] Customer Extension genehmigen
- [ ] Workshop Service abschließen
- [ ] **Auto-Capture zeigen** (Badge wechselt zu "Bezahlt")
- [ ] Jockey Return zeigen
- [ ] Status "DELIVERED" zeigen

Nach der Demo:
- [ ] Alle Status-Übergänge waren korrekt
- [ ] Zahlung wurde bei richtiger Zeit eingezogen
- [ ] Assignments wurden automatisch erstellt

---

## 🎬 Präsentations-Tipps

**Story erzählen:**
1. "Kunde hat keine Zeit zur Werkstatt zu fahren..."
2. "Ronja holt das Auto ab und bringt Ersatzwagen"
3. "Werkstatt findet zusätzlichen Reparaturbedarf"
4. "Kunde genehmigt digital mit Fotos als Beweis"
5. "Zahlung wird erst nach Fertigstellung eingezogen"
6. "Ronja bringt das Auto zurück"
7. "Kunde war nie in der Werkstatt!" ✨

**Highlights betonen:**
- ⚡ Komplett digitaler Prozess
- 💳 Sichere Zahlung mit Autorisierung (kein Risiko)
- 📸 Foto-Dokumentation für Transparenz
- 🚗 Concierge Service als Differenzierungsmerkmal
- 🔄 Automatische Status-Updates
- 📱 Mobile-first für Jockeys

---

**Viel Erfolg bei der Demo! 🚀**
