# Live-Demo Script — Kompletter Buchungs-Lifecycle

> **Zielgruppe:** Boss-Präsentation
> **Dauer:** ca. 15 Minuten
> **Sprache:** Deutsch (`/de`)
> **Modus:** DEMO_MODE=true (keine echten Zahlungen)

---

## 1. Vorbereitung (Setup-Checkliste)

### Terminal 1 — Backend

```bash
cd "99 Code/backend"
npx prisma migrate reset --force   # DB zurücksetzen + Seed-Daten laden
npm run dev                         # Startet auf Port 5001, DEMO_MODE=true
```

### Terminal 2 — Frontend

```bash
cd "99 Code/frontend"
npm run dev                         # Startet auf Port 3000
```

### Browser vorbereiten — 3 Tabs

| Tab | URL | Zweck |
|-----|-----|-------|
| **Tab 1** | `http://localhost:3000/de` | Kunde (Startseite) |
| **Tab 2** | `http://localhost:3000/de/jockey/login` | Jockey-Portal |
| **Tab 3** | `http://localhost:3000/de/workshop/login` | Werkstatt-Portal |

### Vorab einloggen (Tab 2 + Tab 3)

**Jockey (Tab 2):**
- Benutzername: `jockey1`
- Passwort: `password123`
- → Dashboard mit "Heutige Aufträge" wird angezeigt (noch leer)

**Werkstatt (Tab 3):**
- Benutzername: `werkstatt1`
- Passwort: `password123`
- → Dashboard mit Kanban-Board wird angezeigt (noch leer)

### Checkliste vor Start

- [ ] Backend läuft (Terminal zeigt "Server running on port 5001")
- [ ] Frontend läuft (Terminal zeigt "Ready on http://localhost:3000")
- [ ] Tab 1: Startseite geladen
- [ ] Tab 2: Jockey eingeloggt, Dashboard sichtbar
- [ ] Tab 3: Werkstatt eingeloggt, Dashboard sichtbar
- [ ] Alle Tabs nebeneinander oder schnell erreichbar

---

## 2. Demo-Ablauf (8 Phasen)

---

### Phase 1 — Kunde: Buchung erstellen (~5 Min.)

> **Narrativ:** *"Schauen wir uns an, wie ein Kunde in unter 3 Minuten einen Werkstatt-Termin mit Hol- und Bringservice bucht — komplett online, mit garantiertem Festpreis."*

#### Schritt 1: Startseite (Tab 1)

1. Zeige die Landing Page (`http://localhost:3000/de`)
2. Kurz hinweisen auf:
   - Hero-Text: **"Werkstatt-Termin in 2 Minuten buchen"**
   - Festpreis-Garantie Badge
   - Trust-Bereich: "500+ Werkstätten", "10.000+ Kunden", "4.8/5 Bewertung"
3. Klick auf **"Jetzt Festpreis berechnen"** (grüner CTA-Button im Hero)

> **Narrativ:** *"Der Kunde sieht sofort die Kernversprechen: Festpreis, geprüfte Werkstätten, sofortige Bestätigung. Ein Klick und er ist im Buchungsprozess."*

#### Schritt 2: Fahrzeug auswählen (Schritt 1 von 3)

Stepper oben zeigt: **Fahrzeug** → Service → Termin → Bestätigung

1. **Marke**: Dropdown öffnen → "BMW" auswählen
2. **Modell**: Dropdown öffnen → "3er" auswählen
3. **Baujahr**: Dropdown öffnen → "2020" auswählen
4. **Kilometerstand**: `50000` eingeben
5. Klick auf **"Weiter"**

> **Narrativ:** *"Wir brauchen nur 4 Angaben zum Fahrzeug. Daraus berechnen wir einen präzisen Festpreis — keine Schätzungen, kein Verhandeln."*

#### Schritt 3: Service wählen (Schritt 2 von 3)

1. Oben steht: **"Wählen Sie Ihren Service"** + Fahrzeuginfo "für Ihren BMW 3er (2020)"
2. Service-Karten werden angezeigt mit **fahrzeugspezifischen Preisen**
3. **"Inspektion"** auswählen → Karte zeigt den berechneten Preis
4. Klick auf **"Weiter zur Terminwahl"**

> **Narrativ:** *"Der Preis wird in Echtzeit für genau dieses Fahrzeug berechnet. Festpreis-Garantie — keine versteckten Kosten. Zusatzarbeiten nur mit digitaler Freigabe des Kunden."*

#### Schritt 4: Termin & Adresse (Schritt 3 von 3)

1. **Abholdatum**: Nächsten verfügbaren Werktag im Kalender auswählen
2. **Abholzeit**: Zeitfenster wählen (z.B. "10:00-12:00")
3. **Rückgabedatum**: Automatisch +1 Tag, oder manuell anpassen
4. **Rückgabezeit**: Zeitfenster wählen
5. **Adresse** ausfüllen:
   - Straße: `Musterstraße 123`
   - PLZ: `58453`
   - Stadt: `Witten`
6. Klick auf **"Weiter zur Zusammenfassung"**

> **Narrativ:** *"Der Kunde wählt wann und wo wir sein Auto abholen. Wir kümmern uns um alles — das ist unser Concierge-Service."*

#### Schritt 5: Zusammenfassung & Buchung (Schritt 4 von 3)

1. Übersicht zeigt: Fahrzeug, Service, Termin, Preis, Concierge-Ablauf
2. **Kontaktdaten** ausfüllen:
   - E-Mail: `demo@ronya.de`
   - Vorname: `Max`
   - Nachname: `Mustermann`
   - Telefon: `+49 170 1234567`
3. **AGB-Checkbox** aktivieren
4. Klick auf **"Jetzt kostenpflichtig buchen"**

#### Schritt 6: Registrierung

1. Registrierungsseite erscheint
2. **Passwort** eingeben: `Password123!`
3. Passwort bestätigen
4. Klick auf **"Konto erstellen"** (oder ähnlicher Button)

#### Schritt 7: Zahlung (Demo-Modus)

1. Zahlungsseite zeigt **"DEMO-MODUS"** Banner
2. Hinweis: "Dies ist eine simulierte Zahlung"
3. Klick auf **"Mit Demo bezahlen (XXX EUR)"**

> **Narrativ:** *"Im Live-Betrieb läuft hier eine echte Stripe-Zahlung mit Kreditkarte. Für die Demo simulieren wir das."*

#### Schritt 8: Bestätigung & Dashboard

1. **Erfolgsseite**: "Buchung bestätigt!" mit Buchungsnummer
2. "Was passiert als nächstes?" — 4 Schritte werden erklärt
3. Klick auf **"Zum Dashboard"**
4. **Kunden-Dashboard** zeigt:
   - Begrüßung "Willkommen zurück, Max!"
   - Aktive Buchung mit Status-Fortschrittsbalken
   - Status: "Bestätigt" oder "Abholung geplant"

> **Narrativ:** *"Der Kunde hat seinen Termin in unter 3 Minuten gebucht. Er sieht jederzeit den aktuellen Status seiner Buchung — wie bei einer Paketlieferung."*

---

### Phase 2 — Jockey: Fahrzeug abholen (~2 Min.)

> **Narrativ:** *"Jetzt wechseln wir die Perspektive. Unser Fahrer — wir nennen ihn Jockey — sieht den neuen Abholauftrag auf seinem mobilen Dashboard."*

#### Wechsel zu Tab 2 (Jockey-Dashboard)

1. **Seite neu laden** (F5), damit der neue Auftrag erscheint
2. Dashboard zeigt unter **"Heutige Aufträge"**:
   - Abholung für "Max Mustermann"
   - BMW 3er, Musterstraße 123, Witten
   - Status: **"Bevorstehend"**
3. Klick auf den Auftrag → Auftragsdetails öffnen sich
4. Klick auf **"Route starten"**
   - Status wechselt zu **"Unterwegs"**
5. Klick auf **"Angekommen"**
   - Status wechselt zu **"Angekommen"**
6. Übergabe-Checkliste:
   - "Fahrzeug empfangen" ✓
   - "Zustand dokumentiert" ✓
   - "Schlüssel erhalten" ✓
7. Klick auf **"Abholung abschließen"**
   - Erfolgsmeldung: "Abholung abgeschlossen"

> **Narrativ:** *"Der Jockey hat eine mobile App mit Navigation, Checklisten und Fotodokumentation. Alles digital, alles nachvollziehbar."*

#### Kurz zurück zu Tab 1 (Kunden-Dashboard)

1. **Seite neu laden** (F5)
2. Status hat sich aktualisiert: **"Abgeholt"** oder **"In der Werkstatt"**
3. Fortschrittsbalken ist weiter vorgerückt

> **Narrativ:** *"Der Kunde sieht in Echtzeit, wo sein Fahrzeug gerade ist — vollständige Transparenz."*

---

### Phase 3 — Werkstatt: Eingang & Bearbeitung (~2 Min.)

> **Narrativ:** *"In der Werkstatt erscheint der Auftrag automatisch auf dem digitalen Kanban-Board."*

#### Wechsel zu Tab 3 (Werkstatt-Dashboard)

1. **Seite neu laden** (F5)
2. Kanban-Board zeigt den Auftrag in der Spalte **"Neu"**
   - Karte zeigt: Kunde, Fahrzeug, Service
3. Klick auf **"Details ansehen"** (oder direkt auf die Karte)
4. Auftragsdetails zeigen:
   - Fahrzeuginformationen (BMW 3er, 2020)
   - Kundeninformationen
   - Service: Inspektion
   - Status-Verlauf (Timeline)
5. Klick auf **"Bearbeitung starten"**
   - Status wechselt zu **"In Bearbeitung"**
6. Zurück zum Dashboard: Karte ist in die Spalte **"In Bearbeitung"** gewandert

> **Narrativ:** *"Die Werkstatt arbeitet mit einem digitalen Auftrags-Management. Kein Papier, kein Zettelwirtschaft — alles auf einen Blick."*

---

### Phase 4 — Werkstatt: Erweiterung erstellen (~2 Min.)

> **Narrativ:** *"Bei der Inspektion stellt der Mechaniker fest: Die Bremsen müssen gemacht werden. Statt anzurufen, sendet er digital einen Kostenvoranschlag."*

#### In den Auftragsdetails (Tab 3)

1. Klick auf **"+ Neue Erweiterung"**
2. Modal öffnet sich: **"Auftragserweiterung erstellen"**
3. **Position 1** ausfüllen:
   - Beschreibung: `Bremsscheiben vorne`
   - Preis: `185.50`
4. Klick auf **"+ Position hinzufügen"**
5. **Position 2** ausfüllen:
   - Beschreibung: `Bremsbeläge vorne`
   - Preis: `95.00`
6. Gesamtpreis wird angezeigt: **280,50 EUR**
7. Hinweis unten: "Der Kunde wird benachrichtigt und muss die Erweiterung genehmigen."
8. Klick auf **"An Kunden senden"**
9. Toast-Meldung: **"Erweiterung erfolgreich an Kunden gesendet!"**

> **Narrativ:** *"Das ist der Kern unseres Modells: Zusatzarbeiten nur mit digitaler Freigabe. Kein Anruf, kein 'Wir haben mal gemacht'. Der Kunde entscheidet — transparent und fair."*

---

### Phase 5 — Kunde: Erweiterung genehmigen (~2 Min.)

> **Narrativ:** *"Zurück zum Kunden. Er bekommt eine Benachrichtigung, dass die Werkstatt Zusatzarbeiten empfiehlt."*

#### Wechsel zu Tab 1 (Kunden-Dashboard)

1. **Seite neu laden** (F5)
2. Dashboard zeigt Alert-Banner: **"1 Erweiterung wartet auf Genehmigung"**
   - Mit Betrag und **"Jetzt prüfen"** Button
3. Klick auf **"Jetzt prüfen"** oder auf **"Details ansehen"** bei der Buchung
4. In den Buchungsdetails → Tab **"Erweiterungen"**
5. Erweiterung wird angezeigt:
   - Position 1: Bremsscheiben vorne — 185,50 EUR
   - Position 2: Bremsbeläge vorne — 95,00 EUR
   - Gesamtbetrag: 280,50 EUR
   - Status: **"Ausstehend"**
6. Klick auf **"Genehmigen & Bezahlen"**
7. Zahlungsseite (Demo-Modus): Klick auf **"Mit Demo bezahlen (280,50 EUR)"**
8. Bestätigung: **"Erweiterung wurde genehmigt und Zahlung autorisiert!"**

> **Narrativ:** *"Der Kunde sieht genau, was gemacht werden soll und was es kostet. Er genehmigt mit einem Klick — oder lehnt ab. Volle Kontrolle, kein Vertrauensproblem."*

---

### Phase 6 — Werkstatt: Abschluss (~30 Sek.)

> **Narrativ:** *"Die Werkstatt sieht sofort, dass der Kunde genehmigt hat, und kann weiterarbeiten."*

#### Wechsel zu Tab 3 (Werkstatt-Dashboard)

1. **Seite neu laden** (F5)
2. In den Auftragsdetails: Erweiterung zeigt **"Genehmigt"**
3. Klick auf **"Als abgeschlossen markieren"**
   - Status wechselt zu **"Abgeschlossen"**
4. Zurück zum Kanban-Board: Karte ist in **"Abgeschlossen"** Spalte

> **Narrativ:** *"Service abgeschlossen. Die Werkstatt meldet digital fertig — der Rückgabe-Prozess startet automatisch."*

---

### Phase 7 — Jockey: Rückgabe (~1 Min.)

> **Narrativ:** *"Unser Jockey bekommt jetzt automatisch den Rückgabe-Auftrag."*

#### Wechsel zu Tab 2 (Jockey-Dashboard)

1. **Seite neu laden** (F5)
2. Neuer Auftrag sichtbar: **"Rückgabe"** für Max Mustermann
3. Klick auf den Rückgabe-Auftrag
4. Klick auf **"Route starten"** → Status: "Unterwegs"
5. Klick auf **"Angekommen"** → Status: "Angekommen"
6. Checkliste durchgehen + **"Rückgabe abschließen"**
7. Erfolgsmeldung: **"Rückgabe abgeschlossen"**

> **Narrativ:** *"Gleicher Prozess wie bei der Abholung — standardisiert, dokumentiert, nachvollziehbar."*

---

### Phase 8 — Kunde: Abschluss (~30 Sek.)

> **Narrativ:** *"Der Kreis schließt sich. Der Kunde sieht den kompletten Service-Verlauf."*

#### Wechsel zu Tab 1 (Kunden-Dashboard)

1. **Seite neu laden** (F5)
2. Buchung zeigt Status: **"Abgeschlossen"**
3. Fortschrittsbalken: alle Schritte grün (Gebucht → Abgeholt → Werkstatt → Fertig → Zurückgegeben)
4. Klick auf **"Details ansehen"**:
   - Kompletter Status-Verlauf (Timeline)
   - Alle Erweiterungen mit Genehmigungsstatus
   - Gesamtkosten (Inspektion + Erweiterung)

> **Narrativ:** *"Das war der komplette Lifecycle: Buchung, Abholung, Service, Erweiterung, Genehmigung, Rückgabe. Alles digital, alles transparent, alles auf einer Plattform. DAS ist Ronya."*

---

## 3. Narrative Notizen (Was dem Boss sagen)

### Kernbotschaften pro Phase

| Phase | Business-Message |
|-------|-----------------|
| **1 — Buchung** | "3-Minuten-Buchung mit Festpreis-Garantie. Wie Amazon für Werkstatt-Termine. Keine Anrufe, keine Wartezeiten." |
| **2 — Abholung** | "Hol- und Bringservice als USP. Der Kunde muss nicht in die Werkstatt — wir kommen zu ihm. Alles digital dokumentiert." |
| **3 — Werkstatt** | "Digitales Auftrags-Management für die Werkstatt. Kein Papier, keine Missverständnisse. Effizienzgewinn für den Partnerbetrieb." |
| **4 — Erweiterung** | "Das ist unser Alleinstellungsmerkmal: Digitale Freigabe für Zusatzarbeiten. Schluss mit dem Vertrauensproblem zwischen Werkstatt und Kunde." |
| **5 — Genehmigung** | "Der Kunde behält die volle Kontrolle. Er entscheidet transparent über Zusatzkosten — keine unangenehmen Überraschungen bei der Abholung." |
| **6 — Abschluss** | "Nahtlose Übergabe zwischen Werkstatt und Logistik. Alles automatisiert." |
| **7 — Rückgabe** | "Same-Day-Rückgabe mit standardisiertem Prozess. Skalierbar und qualitätsgesichert." |
| **8 — Ergebnis** | "Komplette Transparenz für den Kunden. Vertrauen aufbauen durch Nachvollziehbarkeit — wie bei einem Premium-Lieferdienst." |

### Drei Sätze für den Elevator Pitch

> "Ronya digitalisiert den Werkstattbesuch end-to-end: Festpreis-Buchung, Hol- und Bringservice, und digitale Freigabe für Zusatzarbeiten. Wir lösen das Vertrauensproblem zwischen Autofahrern und Werkstätten. Der Kunde bucht wie bei Amazon — und behält immer die volle Kontrolle über sein Auto und seine Kosten."

---

## 4. Testdaten-Referenz (Quick Reference)

### Zugangsdaten

| Rolle | Login-URL | Benutzer | Passwort |
|-------|-----------|----------|----------|
| **Kunde** (vorhandener) | `/de/customer/login` | `kunde@test.de` | `password123` |
| **Kunde** (neu in Demo) | — | `demo@ronya.de` | `Password123!` |
| **Jockey** | `/de/jockey/login` | `jockey1` | `password123` |
| **Werkstatt** | `/de/workshop/login` | `werkstatt1` | `password123` |

### Fahrzeugdaten (für Buchung)

| Feld | Wert |
|------|------|
| Marke | BMW |
| Modell | 3er |
| Baujahr | 2020 |
| Kilometerstand | 50000 |

### Adressdaten (für Buchung)

| Feld | Wert |
|------|------|
| Straße | Musterstraße 123 |
| PLZ | 58453 |
| Stadt | Witten |

### Kontaktdaten (für Buchung)

| Feld | Wert |
|------|------|
| E-Mail | demo@ronya.de |
| Vorname | Max |
| Nachname | Mustermann |
| Telefon | +49 170 1234567 |

### Erweiterungsdaten

| Position | Beschreibung | Preis |
|----------|-------------|-------|
| 1 | Bremsscheiben vorne | 185,50 EUR |
| 2 | Bremsbeläge vorne | 95,00 EUR |
| **Gesamt** | | **280,50 EUR** |

### Seed-Daten (bereits in DB nach Reset)

- **Werkstatt**: Werkstatt Witten, Hauptstraße 1, 58452 Witten
- **Jockey**: Hans Fahrer, VW Golf, Führerschein DL123456
- **Testkunde**: Max Mustermann, Musterstraße 42, 58452 Witten
- **Testfahrzeug**: VW Golf 7, 2016, 75.000 km, EN-MW-1234
- **Zeitfenster**: Nächste 7 Tage (Mo-Sa), je 4 Slots (08-10, 10-12, 13-15, 15-17 Uhr)
- **Preismatrix**: 10 Fahrzeugmodelle (VW Golf 7/8, Passat, Polo, Audi A3/A4, BMW 3er F30/G20, Mercedes C-Klasse, Opel Astra)

---

## 5. Fallback-Plan

### Wenn etwas schiefgeht

| Problem | Sofort-Lösung |
|---------|---------------|
| **Buchung klappt nicht** | DB Reset: `cd "99 Code/backend" && npx prisma migrate reset --force`, Backend neu starten, Phase 1 nochmal |
| **Seite lädt nicht / Spinner** | Browser-Tab neu laden (F5). State bleibt in der DB erhalten |
| **Jockey/Workshop sieht Auftrag nicht** | F5 drücken — Dashboard lädt Daten per API-Call |
| **Zahlung schlägt fehl** | Prüfen: Läuft Backend? `DEMO_MODE=true` in `.env`? |
| **Komplett kaputt** | Backup: `walkthrough-presentation.html` im selben Ordner öffnen |

### HTML-Präsentation als Fallback

```bash
open "99 Code/frontend/docs/presentation/walkthrough-presentation.html"
```

Die statische HTML-Präsentation zeigt den kompletten Flow mit Screenshots und kann ohne laufendes Backend/Frontend gezeigt werden.

---

## 6. Troubleshooting

### Port belegt

```bash
# Backend-Port 5001 freigeben
lsof -ti:5001 | xargs kill -9

# Frontend-Port 3000 freigeben
lsof -ti:3000 | xargs kill -9
```

### DB nicht erreichbar

```bash
# PostgreSQL-Status prüfen (macOS mit Homebrew)
brew services list | grep postgresql

# PostgreSQL starten
brew services start postgresql@16
# oder
brew services start postgresql
```

### Prisma-Fehler nach DB-Reset

```bash
cd "99 Code/backend"
npx prisma generate          # Client neu generieren
npx prisma migrate reset --force   # Nochmal resetten
npm run dev                  # Backend starten
```

### Frontend baut nicht / Fehler

```bash
cd "99 Code/frontend"
rm -rf .next                 # Build-Cache löschen
npm run dev                  # Neu starten
```

### DEMO_MODE nicht aktiv (echte Stripe-Zahlung statt Demo)

Prüfe die `.env` im Backend:

```bash
# In 99 Code/backend/.env muss stehen:
DEMO_MODE=true
```

### Keine Zeitfenster verfügbar

Die Seed-Daten erstellen Zeitfenster für die nächsten 7 Tage (Mo-Sa). Wenn alle 7 Tage verstrichen sind:

```bash
cd "99 Code/backend"
npx prisma migrate reset --force   # Seed erstellt neue Slots ab heute
```

### Login schlägt fehl

- Werkstatt/Jockey: Login mit **Benutzername** (`werkstatt1` / `jockey1`), nicht mit E-Mail
- Kunde: Login mit **E-Mail** (`kunde@test.de`)
- Passwort ist immer: `password123`

---

## Timing-Übersicht

| Phase | Beschreibung | Zeit |
|-------|-------------|------|
| Setup | DB Reset, Server starten, Tabs vorbereiten | 3-5 Min. (vorher!) |
| **Phase 1** | Kunde bucht | ~5 Min. |
| **Phase 2** | Jockey holt ab | ~2 Min. |
| **Phase 3** | Werkstatt nimmt an | ~2 Min. |
| **Phase 4** | Werkstatt: Erweiterung | ~2 Min. |
| **Phase 5** | Kunde genehmigt | ~2 Min. |
| **Phase 6** | Werkstatt: Fertig | ~30 Sek. |
| **Phase 7** | Jockey: Rückgabe | ~1 Min. |
| **Phase 8** | Kunde: Abschluss | ~30 Sek. |
| **Gesamt** | | **~15 Min.** |

---

> **Tipp:** Vor der Demo einmal komplett durchspielen! Beim zweiten Mal geht es deutlich schneller und flüssiger.
