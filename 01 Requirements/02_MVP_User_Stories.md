# MVP User Stories - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Priorität:** MVP = Must-Have für ersten Launch

---

## Inhaltsverzeichnis

1. [Buchungsprozess](#buchungsprozess)
2. [Festpreis-Kalkulation](#festpreis-kalkulation)
3. [Concierge-Service](#concierge-service)
4. [Digitale Auftragserweiterung](#digitale-auftragserweiterung)
5. [Payment & Registrierung](#payment--registrierung)
6. [Service-Angebot](#service-angebot)

---

## Buchungsprozess

### US-001: Fahrzeugauswahl mit Pflichtfeldern

**Als** Endkunde
**möchte ich** mein Fahrzeug mit allen relevanten Daten auswählen
**damit** ich eine präzise Inspektion/Wartung zu einem fairen Preis erhalte

**Akzeptanzkriterien:**

**Given** ich bin auf der Startseite
**When** ich eine Service-Buchung starte
**Then** muss ich folgende Pflichtdaten eingeben:
- Fahrzeugmarke (Dropdown mit Autocomplete)
- Fahrzeugmodell (Dropdown, abhängig von Marke)
- Baujahr (Pflichtfeld, Dropdown: aktuelle Jahr bis 30 Jahre zurück)
- Kilometerstand (Pflichtfeld, numerische Eingabe)

**Given** ich habe alle Pflichtdaten eingegeben
**When** das System die fahrzeugspezifischen Daten verarbeitet hat
**Then** wird mir ein marke/modell-spezifischer Festpreis angezeigt

**Given** ich gebe einen unrealistischen Kilometerstand ein (z.B. > 500.000 km)
**When** ich das Formular absende
**Then** erhalte ich eine Validierungsmeldung zur Prüfung der Eingabe

**Geschäftsregeln:**
- KEINE Abfrage von VIN oder Schlüsselnummer im ersten Schritt
- KEINE pauschalen Fahrzeugklassen (Klein/Mittel/Ober/SUV) - nur Marke/Modell
- Baujahr und Kilometerstand sind Pflichtfelder für präzise Wartungsbedarfsermittlung
- Preiskalkulation erfolgt ausschließlich nach Marke und Modell
- Ausnahme: E-Autos werden separat kategorisiert (kein Ölservice)

**Technische Details:**
- Autocomplete für Marke/Modell-Suche
- Validierung: Kilometerstand 0-500.000 km, Baujahr 1994-2026
- Mobile-First Design
- Ladezeit < 2 Sekunden

---

### US-002: Service-Auswahl mit klarer Differenzierung

**Als** Endkunde ohne Autowissen
**möchte ich** verstehen, welchen Service ich benötige
**damit** ich die richtige Leistung buche

**Akzeptanzkriterien:**

**Given** ich habe mein Fahrzeug mit allen Pflichtdaten (Marke, Modell, Baujahr, Kilometerstand) ausgewählt
**When** ich die Service-Auswahl sehe
**Then** werden mir folgende Optionen angeboten:
- Inspektion/Wartung (Hauptprodukt, mit Erklärung basierend auf Kilometerstand)
- Ölservice (als separate Option)
- Bremsservice (Beläge/Scheiben)
- TÜV/HU
- Klimaservice
- Fahrzeugaufbereitung

**Given** mein Auto hat 90.000 km (großes Inspektionsintervall)
**When** das System meinen Kilometerstand auswertet
**Then** wird mir die passende Inspektion empfohlen (z.B. "90.000 km Inspektion fällig")

**Given** ich bin unsicher, welchen Service ich brauche
**When** ich auf "Was benötige ich?" klicke
**Then** wird mir ein Guide angezeigt basierend auf:
- Kilometerstand (Inspektionsintervall)
- Baujahr (Verschleißteile)
- Fahrzeugtyp (Marke/Modell-spezifische Empfehlungen)

**Geschäftsregeln:**
- Fokus auf Inspektion/Wartung als Hauptprodukt (nicht nur Ölservice)
- Kilometerstand-basierte Empfehlung: z.B. 30.000 km, 60.000 km, 90.000 km Inspektion
- Baujahr-basierte Hinweise: z.B. ältere Fahrzeuge brauchen mehr Verschleißteil-Checks
- Kommunikation: "Zusätzliche Arbeiten werden separat angeboten"
- Preise basieren auf Marke/Modell, NICHT auf pauschalen Fahrzeugklassen

**Inhalt Inspektion/Wartung-Paket:**
- Motoröl ablassen (nicht absaugen)
- Ölfilter wechseln
- Service-Intervall zurücksetzen
- Eintrag ins Serviceheft
- Fahrzeugprüfung nach Kilometerstand
- NICHT enthalten: Große Reparaturen (Zahnriemen etc.) - werden als Auftragserweiterung angeboten

---

### US-003: Hol- und Bringzeitpunkt buchen

**Als** Endkunde
**möchte ich** bequem einen Zeitpunkt für Abholung und Rückgabe wählen
**damit** ich mein Auto nicht selbst zur Werkstatt fahren muss

**Akzeptanzkriterien:**

**Given** ich habe Service und Fahrzeug ausgewählt
**When** ich zur Terminauswahl komme
**Then** sehe ich verfügbare Zeitslots für:
- Abholzeitpunkt (z.B. 8-10 Uhr, 10-12 Uhr, 14-16 Uhr)
- Wunsch-Rückgabezeitpunkt

**Given** ich wähle einen Zeitslot
**When** dieser bereits ausgebucht ist
**Then** wird er ausgegraut und nicht anklickbar

**Given** ich habe einen Zeitslot gewählt
**When** ich zur Adresseingabe komme
**Then** muss ich eingeben:
- Abholadresse (Straße, PLZ, Ort)
- Rückgabeadresse (vorausgefüllt mit Abholadresse, änderbar)
- Telefonnummer (für Jockey-Kontakt)

**Given** ich buche für Witten-Umgebung
**When** meine PLZ außerhalb des Serviceradius liegt
**Then** erhalte ich eine Fehlermeldung: "Noch nicht in Ihrer Region verfügbar"

**Geschäftsregeln:**
- Concierge-Service ist inklusive (kein Aufpreis im MVP)
- Serviceradius Witten: 50-60 km (Dortmund, Essen, Wuppertal-Umgebung)
- Slots basieren auf Werkstatt-Kapazität (1:1 Mapping zu Witten)
- Keine Overnight-Service-Garantie im MVP (kommt später)

**Technische Details:**
- Integration Slot-Management-System
- PLZ-Radius-Check
- Kalender-Widget mit verfügbaren Slots

---

### US-004: Festpreis-Anzeige nach Marke und Modell

**Als** Endkunde
**möchte ich** sofort einen garantierten, fahrzeugspezifischen Festpreis sehen
**damit** ich keine bösen Überraschungen bei der Rechnung erlebe

**Akzeptanzkriterien:**

**Given** ich habe Fahrzeug (Marke, Modell, Baujahr, Kilometerstand) und Service ausgewählt
**When** das System die marke/modell-spezifische Preiskalkulation durchgeführt hat
**Then** wird mir ein Festpreis angezeigt mit:
- Preis in EUR (z.B. "249,00 EUR für VW Golf 7, Baujahr 2015")
- Hinweis: "Garantierter Festpreis - inkl. Hol- und Bringservice"
- Info: "Zusätzliche Arbeiten werden digital angeboten und erst nach Ihrer Freigabe durchgeführt"

**Given** ich buche eine Inspektion für einen VW Golf (60.000 km)
**When** der Preis angezeigt wird
**Then** wird der marke/modell-spezifische Preis berechnet basierend auf:
- Marke: VW
- Modell: Golf
- Kilometerstand: 60.000 km (mittleres Inspektionsintervall)

**Given** ich buche eine Inspektion für einen Mercedes S-Klasse (90.000 km)
**When** der Preis angezeigt wird
**Then** wird ein höherer Preis angezeigt basierend auf:
- Marke: Mercedes
- Modell: S-Klasse
- Kilometerstand: 90.000 km (großes Inspektionsintervall)

**Given** mein Fahrzeug hat eine extreme Motorisierung (z.B. AMG, M-Modell)
**When** ich die Fahrzeugdaten eingebe
**Then** erscheint ein Hinweis: "Für Hochleistungsmotoren kann ein Aufschlag anfallen - finaler Preis wird nach Fahrzeugprüfung kommuniziert"

**Geschäftsregeln:**
- KEINE pauschalen Fahrzeugklassen (Klein/Mittel/Ober/SUV)
- Preiskalkulation ausschließlich nach Marke und Modell
- Kilometerstand beeinflusst Wartungsumfang und damit Preis
- Baujahr wird berücksichtigt (ältere Fahrzeuge können mehr Verschleißteile benötigen)
- Erste Buchung kann Verlustgeschäft sein (Kundenakquise)
- Fahrzeugschein-Upload erst beim Concierge (nicht online)

**Preis-Beispiele (Inspektion/Wartung):**
- VW Polo (30.000 km): ca. 179 EUR
- VW Golf (60.000 km): ca. 219 EUR
- VW Passat (90.000 km): ca. 289 EUR
- Mercedes E-Klasse (60.000 km): ca. 319 EUR
- BMW 5er (90.000 km): ca. 359 EUR
- Audi Q5 (60.000 km): ca. 279 EUR

HINWEIS: Preise sind marke/modell-spezifisch, NICHT klassenbasiert

---

## Concierge-Service

### US-005: Ersatzfahrzeug durch Ronja-Fleet

**Als** Endkunde
**möchte ich** während des Services ein Ersatzfahrzeug gestellt bekommen
**damit** ich mobil bleibe und keine Einschränkungen habe

**Akzeptanzkriterien:**

**Given** ich habe eine Buchung abgeschlossen
**When** der Jockey mein Auto abholt
**Then** bringt er ein Ronja-Ersatzfahrzeug mit (gebrandetes Fahrzeug)

**Given** ich fahre mit dem Ronja-Auto
**When** Nachbarn/Bekannte fragen, woher das Auto kommt
**Then** kann ich von dem Service erzählen (viraler Marketing-Effekt)

**Given** mein Service ist abgeschlossen
**When** der Jockey mein Auto zurückbringt
**Then** nimmt er das Ronja-Ersatzfahrzeug wieder mit

**Geschäftsregeln:**
- Ersatzfahrzeug ist Standard-PKW (keine Luxus-Variante im MVP)
- Fahrzeug ist versichert und getankt
- Keine Kilometerbegrenzung für Ersatzfahrzeug
- Führerscheinkontrolle NICHT im MVP (kommt später bei Skalierung)

**Marketing-Effekt:**
- Ronja-Branding auf Ersatzfahrzeugen
- Erwartung: 7-8 Fahrzeuge in Witten als rollende Werbung
- Langfristig: 10.000-20.000 Fahrzeuge deutschlandweit

---

### US-006: Fahrzeugübergabe durch Jockey

**Als** Endkunde
**möchte ich** bei der Fahrzeugübergabe professionell betreut werden
**damit** alle Details geklärt sind und ich Vertrauen aufbaue

**Akzeptanzkriterien:**

**Given** der Jockey kommt zur Abholung
**When** er vor Ort ist
**Then** führt er folgende Schritte durch:
- Übergabeprotokoll mit Kunde (bestehender Driver-App-Prozess)
- Fotodokumentation des Fahrzeugzustands
- Abfrage: "Gibt es zusätzliche Anliegen?" (z.B. Wischblätter, Steinschlag)
- Optional: Fahrzeugschein fotografieren (für spätere Buchungen)

**Given** der Kunde hat zusätzliche Wünsche (z.B. Wischblatt defekt)
**When** der Jockey dies aufnimmt
**Then** wird dies als potenzielle Auftragserweiterung im System vermerkt

**Given** die Übergabe ist abgeschlossen
**When** der Jockey das Auto zur Werkstatt fährt
**Then** erhält der Kunde eine Bestätigung: "Ihr Auto ist auf dem Weg zur Werkstatt"

**Geschäftsregeln:**
- Bestehende Driver-Applikation wird genutzt
- Keine Jockey-Live-Tracking im MVP (kommt später)
- Professioneller Auftritt: Ronja-Arbeitskleidung, freundlich, zuverlässig

**Nice-to-Have (nicht MVP):**
- QR-Code-Aufkleber fürs Auto bei Rückgabe ("Für nächste Buchung")
- "Danke für Ihre Buchung"-Karte mit Google-Bewertungs-Link

---

### US-007: Fahrzeugrückgabe mit Zusatzservice

**Als** Endkunde
**möchte ich** mein Auto sauber und mit kleinen Extras zurückbekommen
**damit** ich den Premium-Service spüre und begeistert bin

**Akzeptanzkriterien:**

**Given** mein Service ist abgeschlossen
**When** der Jockey mein Auto zurückbringt
**Then** hat er folgendes gemacht:
- Auto gewaschen (Waschstraße)
- Ronja Screen Cleaner ins Auto gelegt (Giveaway)
- Serviceheft mit Stempel/Eintrag

**Given** ich bin zufrieden mit dem Service
**When** der Jockey bei der Rückgabe fragt
**Then** sagt er: "Würden Sie uns mit einer Google-Bewertung unterstützen?" (Google-Sterne sammeln)

**Geschäftsregeln:**
- Autowäsche ist inklusive (keine Extra-Kosten)
- Giveaways: Screen Cleaner, ggf. Duftbaum
- Google-Bewertungen aktiv erfragen (5-Sterne-Strategie)

---

## Digitale Auftragserweiterung

### US-008: Werkstatt erstellt digitales Angebot

**Als** Werkstatt-Mitarbeiter
**möchte ich** zusätzliche Reparaturen digital dem Kunden anbieten
**damit** der Kunde transparent entscheiden kann und keine Telefonschleifen entstehen

**Akzeptanzkriterien:**

**Given** ich habe das Fahrzeug in der Werkstatt
**When** ich zusätzliche Mängel feststelle (z.B. abgefahrene Bremsen, Steinschlag)
**Then** kann ich im System folgendes erfassen:
- Mangelbeschreibung (Text)
- Fotos hochladen (z.B. Bremsscheibe, Steinschlag)
- Optional: Kurzes Video
- Festpreis für die Reparatur

**Given** ich habe das Angebot erstellt
**When** ich es absende
**Then** erhält der Kunde eine Push-Benachrichtigung/E-Mail: "Zusätzliche Arbeiten vorgeschlagen"

**Geschäftsregeln:**
- Integration in bestehendes Werkstatt-System (wie bei Ronja B2B)
- Werkstatt kann NICHT ohne Kundenfreigabe arbeiten
- Bei Nichtfreigabe: nur gebuchter Service wird durchgeführt
- Angebot mit Festpreis (kein "ungefähr")

**Technische Details:**
- Foto-Upload direkt aus Werkstatt-System
- Möglichkeit für mehrere Angebote pro Auftrag
- Status-Tracking: "Offen", "Freigegeben", "Abgelehnt"

---

### US-009: Kunde gibt Auftragserweiterung digital frei

**Als** Endkunde
**möchte ich** zusätzliche Reparaturen digital prüfen und freigeben
**damit** ich volle Transparenz habe und selbst entscheide

**Akzeptanzkriterien:**

**Given** die Werkstatt hat ein Angebot erstellt
**When** ich die Benachrichtigung erhalte
**Then** kann ich das Angebot öffnen mit:
- Beschreibung des Mangels
- Fotos/Videos
- Festpreis
- Buttons: "Freigeben" oder "Ablehnen"

**Given** ich gebe das Angebot frei
**When** ich auf "Freigeben" klicke
**Then** wird die Zahlung über meine hinterlegte Zahlungsmethode ausgelöst (sofort oder bei Abschluss)

**Given** ich lehne das Angebot ab
**When** ich auf "Ablehnen" klicke
**Then** wird die Werkstatt informiert und führt NUR den ursprünglich gebuchten Service durch

**Given** ich möchte Zeit zum Nachdenken
**When** ich das Angebot nicht sofort entscheide
**Then** bleibt es "Offen" und die Werkstatt wartet auf Rückmeldung (z.B. max. 2 Stunden)

**Geschäftsregeln:**
- Keine Telefon-Anrufe der Werkstatt nötig
- Kunde hat finale Entscheidungsgewalt
- Bei Nicht-Freigabe: Auto wird wie gebucht zurückgegeben
- Optional: Kunde kann Kommentar hinzufügen ("Mache ich beim nächsten Mal")

**UX-Anforderungen:**
- Mobile-First Design (Kunde ist unterwegs)
- One-Click Freigabe
- Klare Preisdarstellung
- Foto-Galerie mit Zoom-Funktion

---

### US-010: Zahlungsabwicklung bei Auftragserweiterung

**Als** System
**möchte ich** bei freigegebenen Auftragserweiterungen automatisch die Zahlung verarbeiten
**damit** keine manuellen Prozesse nötig sind

**Akzeptanzkriterien:**

**Given** der Kunde hat eine Auftragserweiterung freigegeben
**When** er auf "Freigeben" klickt
**Then** wird seine hinterlegte Zahlungsmethode (Stripe) belastet

**Given** die Zahlung war erfolgreich
**When** die Transaktion bestätigt ist
**Then** erhält die Werkstatt die Info: "Freigegeben und bezahlt - kann durchgeführt werden"

**Given** die Zahlung schlägt fehl
**When** die Karte abgelehnt wird
**Then** erhält der Kunde eine Meldung: "Zahlung fehlgeschlagen - bitte Zahlungsmethode prüfen"

**Geschäftsregeln:**
- Payment-Gateway: Stripe
- Sofort-Zahlung bei Freigabe (nicht erst bei Abholung)
- Rechnung wird automatisch erstellt
- Buchhaltung: Integration in Odoo

---

## Landing Page & Multi-Portal-Zugang

### US-020: Landing Page mit drei Login-Bereichen

**Als** Stakeholder (Kunde, Jockey oder Werkstatt-Mitarbeiter)
**möchte ich** mich in meinem spezifischen Portal anmelden können
**damit** ich meine Aufgaben effizient erledigen kann und die Customer Journey demonstriert werden kann

**Akzeptanzkriterien:**

**Given** ich bin auf der Landing Page (localhost:3000)
**When** ich die Seite öffne
**Then** sehe ich drei klar getrennte Bereiche:
- "Kunde" - Jetzt buchen / Login
- "Jockey" - Fahrer-Login
- "Werkstatt" - Werkstatt-Login

**Given** ich bin ein Endkunde
**When** ich auf "Jetzt buchen" klicke
**Then** gelange ich zum Buchungsprozess (US-001: Fahrzeugauswahl)

**Given** ich bin ein Jockey
**When** ich auf "Fahrer-Login" klicke
**Then** gelange ich zum Jockey-Portal mit:
- Liste meiner zugewiesenen Abholungen
- Details zu Kunden (Name, Adresse, Telefon, Zeitfenster)
- Fahrzeugübergabe-Checkliste
- Foto-Upload-Funktion

**Given** ich bin ein Werkstatt-Mitarbeiter
**When** ich auf "Werkstatt-Login" klicke
**Then** gelange ich zum Werkstatt-Portal mit:
- Liste der aktuellen Aufträge (In Arbeit, Wartend, Abgeschlossen)
- Funktion "Auftragserweiterung erstellen" (US-008)
- Übersicht freigegebener/abgelehnter Angebote

**Geschäftsregeln:**
- Drei separate Authentifizierungs-Flows (Kunde: Magic Link, Jockey/Werkstatt: Username/Passwort)
- Klare visuelle Trennung auf Landing Page (z.B. drei Spalten oder Cards)
- Responsive Design (Mobile-First)
- Demo-Zweck: Alle Stakeholder können ihre Customer Journey nachvollziehen

**UX-Anforderungen:**
- Landing Page als zentraler Einstiegspunkt
- Große, klickbare Bereiche für jeden User-Typ
- Icons zur Unterscheidung (Kunde: Person, Jockey: Auto, Werkstatt: Werkzeug)
- Kurze Beschreibung unter jedem Login-Bereich

**Technische Details:**
- Next.js App Router (multi-page oder single-page mit Routing)
- Drei separate Layouts für Dashboards
- Role-based Access Control (RBAC) im Backend
- Session-Management getrennt nach User-Typ

**Story Points:** 8

---

### US-021: Jockey-Portal Dashboard

**Als** Jockey
**möchte ich** alle meine Abholungen und Rückgaben an einem Ort sehen
**damit** ich meinen Tag effizient planen kann

**Akzeptanzkriterien:**

**Given** ich bin als Jockey eingeloggt
**When** ich mein Dashboard öffne
**Then** sehe ich:
- Heutige Abholungen (Liste mit Zeitfenster, Adresse, Kundenname)
- Heutige Rückgaben (Liste)
- Status jeder Tour (Offen, Unterwegs, Abgeschlossen)

**Given** ich öffne eine Abholung
**When** ich auf Details klicke
**Then** sehe ich:
- Kundenadresse (mit Google Maps Link)
- Telefonnummer des Kunden
- Fahrzeugdaten (Marke, Modell, Kennzeichen falls bekannt)
- Service-Art (Inspektion, Ölservice, etc.)
- Checkliste: Fahrzeugübergabe-Protokoll

**Given** ich führe die Abholung durch
**When** ich vor Ort bin
**Then** kann ich:
- Fotos vom Fahrzeugzustand machen
- Kilometerstand erfassen
- Zusätzliche Anmerkungen eingeben
- Status auf "Abgeholt" setzen

**Geschäftsregeln:**
- Integration mit bestehendem Driver-App-Prozess
- Offline-Fähigkeit optional (Post-MVP)
- Foto-Upload direkt vom Smartphone

**Story Points:** 5

---

### US-022: Werkstatt-Portal Dashboard

**Als** Werkstatt-Mitarbeiter
**möchte ich** alle aktuellen Aufträge und deren Status sehen
**damit** ich effizient arbeiten kann

**Akzeptanzkriterien:**

**Given** ich bin als Werkstatt-Mitarbeiter eingeloggt
**When** ich mein Dashboard öffne
**Then** sehe ich:
- Liste aller Aufträge mit Status (Annahme ausstehend, In Arbeit, Fertig)
- Fahrzeugdaten (Marke, Modell, Baujahr, Kilometerstand)
- Service-Art (Inspektion, Ölservice, etc.)
- Kundenname und Kontaktdaten

**Given** ich arbeite an einem Fahrzeug
**When** ich zusätzliche Mängel feststelle
**Then** kann ich:
- "Auftragserweiterung erstellen" klicken (US-008)
- Mangelbeschreibung eingeben
- Fotos hochladen
- Festpreis kalkulieren
- Angebot an Kunde senden

**Given** der Kunde hat ein Angebot freigegeben
**When** ich die Benachrichtigung erhalte
**Then** sehe ich:
- "Freigegeben" (grün markiert)
- Zahlung bestätigt
- Kann mit Arbeit beginnen

**Geschäftsregeln:**
- Tablet-optimiert (Werkstatt nutzt Tablets)
- Große Buttons für Touch-Bedienung
- Deutschsprachig
- Foto-Upload direkt vom Tablet/Smartphone

**Story Points:** 8

---

## Payment & Registrierung

### US-011: Online-Bezahlung vor Service

**Als** Endkunde
**möchte ich** den Service online vorab bezahlen
**damit** ich bei der Rückgabe nicht mehr zahlen muss

**Akzeptanzkriterien:**

**Given** ich habe Service, Fahrzeug und Termin ausgewählt
**When** ich zum Payment komme
**Then** sehe ich:
- Festpreis-Zusammenfassung
- Zahlungsmethoden: Kreditkarte (Stripe), PayPal, Google Pay, Apple Pay
- Info: "Sie zahlen jetzt - keine Nachzahlung bei Abholung"

**Given** ich zahle mit Kreditkarte
**When** die Zahlung erfolgreich ist
**Then** erhalte ich:
- Bestätigung per E-Mail (Rechnung als PDF)
- Buchungsbestätigung mit Abhol-Termin
- Zugang zu "Mein Buchungsportal" (Einmalcode)

**Given** die Zahlung schlägt fehl
**When** Karte abgelehnt wird
**Then** kann ich eine andere Zahlungsmethode wählen

**Geschäftsregeln:**
- 100% Vorkasse (kein Zahlen bei Abholung)
- Rechnung sofort nach Zahlung
- Storno-Regelung: bis 24h vor Termin kostenlos
- Payment-Provider: Stripe

---

### US-012: Light-Registrierung ohne Passwort

**Als** Endkunde
**möchte ich** mich ohne aufwendige Registrierung anmelden
**damit** ich schnell buchen kann

**Akzeptanzkriterien:**

**Given** ich habe gebucht und bezahlt
**When** ich meine Buchung verwalten möchte
**Then** kann ich mich mit Einmalcode anmelden:
- E-Mail eingeben
- Code per E-Mail erhalten
- Einloggen ohne Passwort

**Given** ich bin eingeloggt
**When** ich in "Mein Bereich" bin
**Then** sehe ich:
- Aktuelle Buchungen
- Buchungshistorie
- Fahrzeugdaten (nach erstem Service automatisch gespeichert)
- Gespeicherte Zahlungsmethoden

**Given** ich buche das zweite Mal
**When** ich mich anmelde
**Then** sind meine Daten vorausgefüllt (Fahrzeug, Adresse)

**Geschäftsregeln:**
- Kein Passwort nötig im MVP (Magic Link / OTP)
- Daten-Speicherung nach DSGVO
- Fahrzeugdaten werden beim ersten Service erfasst (Fahrzeugschein-Foto durch Jockey)
- Optional: QR-Code fürs Auto (Schnellbuchung ohne Login)

---

## Service-Angebot

### US-013: Inspektion/Wartung als Hauptprodukt

**Als** Endkunde
**möchte ich** eine umfassende Inspektion/Wartung buchen
**damit** mein Auto professionell gewartet wird und sicher bleibt

**Akzeptanzkriterien:**

**Given** ich buche eine Inspektion/Wartung
**When** ich die Leistungsbeschreibung lese
**Then** sehe ich:
- "Motoröl ablassen (nicht absaugen)"
- "Ölfilter wechseln"
- "Service-Intervall zurücksetzen"
- "Eintrag ins Serviceheft"
- "Fahrzeugprüfung nach Kilometerstand und Herstellervorgaben"
- "Sichtprüfung Verschleißteile (Bremsen, Reifen, Beleuchtung)"
- "NICHT enthalten: Große Reparaturen (Zahnriemen, Kupplung) - werden separat angeboten"

**Given** ich habe eine Inspektion gebucht und mein Fahrzeug hat 90.000 km
**When** die Werkstatt feststellt, dass Luftfilter/Zündkerzen fällig sind
**Then** erhalte ich ein separates Angebot (Auftragserweiterung)

**Given** mein Kilometerstand liegt bei 30.000 km
**When** ich die Inspektion buche
**Then** ist der Wartungsumfang geringer als bei 90.000 km und der Preis entsprechend angepasst

**Geschäftsregeln:**
- Hauptprodukt ist Inspektion/Wartung (nicht nur Ölservice)
- Wartungsumfang richtet sich nach Kilometerstand und Baujahr
- Motoröl wird abgelassen (bessere Qualität als Absaugen)
- Fokus: Segment 2-4 Fahrzeuge (nicht Neufahrzeuge in Garantie)
- Preise basieren auf Marke und Modell, NICHT auf Fahrzeugklassen

**Pricing-Orientierung:**
- Preiskalkulation erfolgt marke/modell-spezifisch
- Kilometerstand beeinflusst Wartungsumfang
- KEINE pauschalen Fahrzeugklassen-Preise

---

### US-014: Weitere Service-Angebote (TÜV, Bremse, Klima)

**Als** Endkunde
**möchte ich** auch andere Services buchen können
**damit** ich alle Autowartungs-Bedürfnisse abdecken kann

**Akzeptanzkriterien:**

**Given** ich bin auf der Service-Auswahl
**When** ich scrolle
**Then** sehe ich folgende Services mit Icons:
- TÜV/HU (Hauptuntersuchung)
- Bremsservice (Beläge/Scheiben nach Marke/Modell)
- Klimaservice (nach Baujahr: altes/neues Kältemittel)
- Fahrzeugaufbereitung (Innenreinigung)
- Ölservice (als separate Option neben Inspektion)

**Given** ich wähle "Bremsservice"
**When** ich mein Fahrzeug angebe (Marke, Modell, Baujahr, Kilometerstand)
**Then** erhalte ich Festpreis basierend auf Marke/Modell (NICHT Fahrzeugklasse)

**Given** ich wähle "Klimaservice"
**When** ich das Baujahr eingebe
**Then** wird unterschieden:
- Vor 2017: altes Kältemittel (günstiger)
- Ab 2017: neues Kältemittel (teurer)

**Geschäftsregeln:**
- TÜV: Nur Prüfung, keine Reparatur im Festpreis
- Bremsservice: Komplettpreis Vorder- oder Hinterachse, marke/modell-spezifisch
- Klimaservice: Anlagen-Desinfektion + Kältemittel auffüllen
- Fahrzeugaufbereitung: Innenreinigung, kein Polieren
- ALLE Preise sind marke/modell-spezifisch, KEINE Fahrzeugklassen-Pauschalen

**NICHT im MVP:**
- Reifenwechsel (Logistik zu komplex)
- Glasreparatur (später als Kooperation)
- Wischblätter (später als Low-Price-Add-On)

---

## Technische Integration

### US-015: Slot-Management für Witten

**Als** System
**möchte ich** verfügbare Zeitslots verwalten
**damit** keine Doppelbuchungen entstehen

**Akzeptanzkriterien:**

**Given** ein Admin konfiguriert Slots für Witten
**When** er die Werkstatt-Kapazität einträgt
**Then** kann er definieren:
- Slots pro Tag (z.B. 8-10, 10-12, 14-16, 16-18 Uhr)
- Max. Buchungen pro Slot
- Geschlossene Tage (Feiertage, Urlaub)

**Given** ein Kunde bucht einen Slot
**When** dieser belegt wird
**Then** wird die Verfügbarkeit reduziert (Echtzeit-Update)

**Given** ein Slot ist voll
**When** ein Kunde diesen Tag ansieht
**Then** ist der Slot ausgegraut

**Geschäftsregeln:**
- MVP: 1:1 Mapping Witten Werkstatt (keine Multi-Werkstatt-Logik)
- Später: Routing zu mehreren Werkstätten
- Puffer zwischen Slots (z.B. 30 Min für Jockey-Fahrt)

---

### US-016: Odoo-Integration für Buchhaltung

**Als** Finance-Team
**möchte ich** alle Buchungen automatisch in Odoo erfasst haben
**damit** Buchhaltung und Reporting funktionieren

**Akzeptanzkriterien:**

**Given** ein Kunde hat bezahlt
**When** die Zahlung bestätigt ist
**Then** wird in Odoo angelegt:
- Kundenstammdaten
- Rechnung
- Zahlungseingang
- Auftrag für Werkstatt

**Given** eine Auftragserweiterung wurde freigegeben
**When** die Zahlung erfolgt ist
**Then** wird in Odoo eine Ergänzungsrechnung erstellt

**Geschäftsregeln:**
- Real-Time Sync (nicht Batch)
- Odoo als Single Source of Truth für Finanzdaten
- Revenue-Tracking nach Service-Typ
- Kostenstellenzuordnung: B2C vs. B2B

---

### US-017: Jockey-Assignment (später)

**Als** Dispatcher
**möchte ich** Jockeys zu Buchungen zuweisen
**damit** Abholungen koordiniert werden

**Akzeptanzkriterien:**

**Given** eine Buchung ist bestätigt
**When** der Abhol-Termin in 24h ist
**Then** wird automatisch ein verfügbarer Jockey zugewiesen

**Given** ein Jockey ist zugewiesen
**When** er die Tour startet
**Then** erhält der Kunde eine Info: "Unser Fahrer ist unterwegs"

**Geschäftsregeln:**
- MVP: Manuelles Assignment durch Witten-Team
- Später: Automatisches Routing nach Verfügbarkeit
- Nutzung bestehender Driver-App

---

## Zusätzliche Stories (Post-MVP)

### US-018: QR-Code für Schnellbuchung (Nice-to-Have)

**Als** Bestandskunde
**möchte ich** via QR-Code im Auto direkt buchen
**damit** ich nicht die Website aufrufen muss

**Akzeptanzkriterien:**

**Given** ich habe einen QR-Code-Aufkleber im Auto
**When** ich diesen scanne
**Then** lande ich direkt auf meiner vorausgefüllten Buchungsseite

---

### US-019: Kilometerstand als Pflichtfeld (MVP - IN SPRINT 1)

**Als** System
**möchte ich** Kilometerstand als Pflichtfeld erfassen
**damit** ich den Wartungsumfang korrekt einschätzen und präzise Preise kalkulieren kann

**Akzeptanzkriterien:**

**Given** ich habe Marke, Modell und Baujahr ausgewählt
**When** ich zur Kilometerstand-Eingabe komme
**Then** ist dies ein PFLICHTFELD (nicht optional)

**Given** ich gebe Kilometerstand ein
**When** das System den Wert verarbeitet
**Then** kann es prüfen:
- 30.000 km Inspektion? (kleiner Umfang)
- 60.000 km Inspektion? (mittlerer Umfang)
- 90.000 km Inspektion? (großer Umfang mit mehr Verschleißteilen)
- 120.000+ km? (erhöhter Wartungsbedarf)

**Geschäftsregeln:**
- Kilometerstand ist PFLICHTFELD (keine optionale Angabe)
- Wird für ALLE Services abgefragt (Inspektion, Ölservice, Bremse etc.)
- Ermöglicht präzise Wartungsbedarfsermittlung
- Validierung: 0-500.000 km (Plausibilitätsprüfung)

---

## Story Points Übersicht (Planning Poker Empfehlung)

| Story | Beschreibung | Geschätzte SP |
|-------|-------------|---------------|
| US-001 | Fahrzeugauswahl mit Pflichtfeldern (Marke, Modell, Baujahr, KM) | 8 |
| US-002 | Service-Auswahl (Inspektion als Hauptprodukt) | 5 |
| US-003 | Hol-/Bring-Buchung | 8 |
| US-004 | Festpreis-Kalkulation nach Marke/Modell | 8 |
| US-005 | Ersatzfahrzeug-Prozess | 2 |
| US-006 | Fahrzeugübergabe | 3 |
| US-007 | Fahrzeugrückgabe | 2 |
| US-008 | Werkstatt-Angebot erstellen | 8 |
| US-009 | Kunde gibt Angebot frei | 5 |
| US-010 | Zahlung Auftragserweiterung | 5 |
| US-011 | Online-Bezahlung | 8 |
| US-012 | Light-Registrierung | 5 |
| US-013 | Ölservice-Paket | 2 |
| US-014 | Weitere Services | 3 |
| US-015 | Slot-Management | 8 |
| US-016 | Odoo-Integration | 13 |
| US-017 | Jockey-Assignment | 8 |
| US-020 | Landing Page mit 3 Login-Bereichen | 8 |
| US-021 | Jockey-Portal Dashboard | 5 |
| US-022 | Werkstatt-Portal Dashboard | 8 |

**Summe MVP:** ~112 Story Points (ca. 6-7 Sprints à 15-20 SP)

HINWEISE:
- Story Points erhöht durch marke/modell-spezifische Preiskalkulation und Pflichtfelder
- Zusätzliche Komplexität durch Multi-Portal-Architektur (3 separate Dashboards)
- Lokale Deployment-Strategie vereinfacht Infrastruktur, erhöht aber Integrations-Aufwand

---

## Abhängigkeiten

```
US-001 → US-002 → US-003 → US-004 → US-011 (Buchungs-Flow)
US-003 → US-015 (Slot-Management nötig für Terminbuchung)
US-008 → US-009 → US-010 (Auftragserweiterung-Flow)
US-011 → US-016 (Payment → Odoo Buchhaltung)
US-006 → US-017 (Jockey-Assignment für Abholung)
```

---

## Offene Fragen (für Product Backlog Refinement)

1. **Storno-Logik:** Wie gehen wir mit Stornierungen um? (Erstattung via Stripe?)
2. **No-Show:** Was passiert, wenn Kunde bei Abholung nicht da ist?
3. **Werkstatt-Anbindung:** Welches System nutzt Witten aktuell? (GMS Integration?)
4. **Ersatzfahrzeug-Versicherung:** Wie ist die Haftung geregelt?
5. **Multi-Fahrzeug-Haushalt:** Datenmodell für Kunden mit mehreren Autos?
6. **Finanzierung:** Soll Ratenzahlung angeboten werden? (Post-MVP)
7. **Branding:** Finaler Name statt "Ronja B2C"?

---

**Nächste Schritte:**
1. Product Backlog Refinement mit Team (Stories schätzen)
2. Sprint Planning für MVP Sprint 1
3. UI/UX Wireframes für US-001 bis US-004
4. Technische Architektur für Payment + Odoo
