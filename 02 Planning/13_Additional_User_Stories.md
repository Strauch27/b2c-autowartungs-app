# Additional User Stories: Login-Bereiche & Portale

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready for Sprint Planning

---

## Inhaltsverzeichnis

1. [Landing Page & Authentication](#landing-page--authentication)
2. [Jockey-Portal](#jockey-portal)
3. [Werkstatt-Portal](#werkstatt-portal)

---

## Landing Page & Authentication

### US-020: Landing Page mit drei Login-Bereichen

**Als** Stakeholder (Kunde, Jockey oder Werkstatt-Mitarbeiter)
**möchte ich** auf der Landing Page sofort meinen Zugangsbereich finden
**damit** ich schnell zu meinem Portal gelange und die Customer Journey für Demos klar erkennbar ist

**Akzeptanzkriterien:**

**Given** ich öffne die Anwendung (localhost:3000)
**When** die Landing Page lädt
**Then** sehe ich drei klar getrennte Bereiche:
- Kundenbereich: Große Card mit "Jetzt Service buchen" Button
- Jockey-Bereich: Card mit "Fahrer-Login" Button
- Werkstatt-Bereich: Card mit "Werkstatt-Login" Button

**Given** ich bin ein neuer Kunde
**When** ich auf "Jetzt Service buchen" klicke
**Then** gelange ich direkt zur Fahrzeugauswahl (US-001)

**Given** ich bin ein registrierter Kunde
**When** ich auf "Login" im Kundenbereich klicke
**Then** werde ich zum Magic Link Login weitergeleitet

**Given** ich bin ein Jockey
**When** ich auf "Fahrer-Login" klicke
**Then** gelange ich zum Jockey-Login mit Username/Passwort

**Given** ich bin ein Werkstatt-Mitarbeiter
**When** ich auf "Werkstatt-Login" klicke
**Then** gelange ich zum Werkstatt-Login mit Username/Passwort

**Geschäftsregeln:**
- Drei separate Authentifizierungs-Flows
- Klare visuelle Trennung (drei Spalten oder Cards)
- Responsive Design (Mobile-First)
- Demo-Zweck: Alle Stakeholder können ihre Journey nachvollziehen

**UX-Anforderungen:**
- Große, klickbare Bereiche für jeden User-Typ
- Icons zur Unterscheidung (Kunde: Person-Icon, Jockey: Car-Icon, Werkstatt: Wrench-Icon)
- Kurze Beschreibung unter jedem Login-Bereich
- Call-to-Action Buttons in unterschiedlichen Farben
- Hero-Section mit Produktvision

**Technische Details:**
- Next.js App Router
- Three-Column Layout (Desktop) / Stacked (Mobile)
- Routing zu separaten Login-Flows
- Session-Management getrennt nach User-Typ

**Story Points:** 5

---

### US-021: Kunden-Login (Magic Link / OTP)

**Als** Endkunde
**möchte ich** mich ohne Passwort anmelden können
**damit** ich schnell auf meine Buchungen zugreifen kann ohne Passwort zu merken

**Akzeptanzkriterien:**

**Given** ich klicke auf "Login" im Kundenbereich
**When** die Login-Seite lädt
**Then** sehe ich ein Eingabefeld für meine E-Mail-Adresse

**Given** ich gebe meine E-Mail ein
**When** ich auf "Login-Link senden" klicke
**Then** erhalte ich:
- Bestätigung: "Link wurde an max@example.com gesendet"
- E-Mail mit Magic Link (gültig 15 Minuten)

**Given** ich klicke auf den Magic Link
**When** der Link noch gültig ist
**Then** werde ich:
- Automatisch eingeloggt
- Zu "Meine Buchungen" weitergeleitet
- Session wird erstellt (7 Tage gültig)

**Given** der Magic Link ist abgelaufen
**When** ich darauf klicke
**Then** erhalte ich:
- Fehlermeldung: "Link abgelaufen"
- Möglichkeit, neuen Link anzufordern

**Geschäftsregeln:**
- Kein Passwort erforderlich (passwordless authentication)
- Magic Link gültig: 15 Minuten
- Session gültig: 7 Tage
- Rate Limiting: Max. 5 Login-Versuche pro Stunde pro E-Mail

**Technische Details:**
- JWT Token im Magic Link
- Token-Validierung bei Klick
- E-Mail-Service (SendGrid / AWS SES / lokales SMTP)
- Session-Cookie (httpOnly, secure)

**Story Points:** 5

---

### US-022: Jockey-Login (Username/Password)

**Als** Jockey
**möchte ich** mich mit meinen Zugangsdaten anmelden
**damit** ich meine Abholungen und Rückgaben sehen kann

**Akzeptanzkriterien:**

**Given** ich bin auf der Jockey-Login-Seite
**When** die Seite lädt
**Then** sehe ich:
- Eingabefeld: Username
- Eingabefeld: Passwort
- Button: "Anmelden"
- Link: "Passwort vergessen?"

**Given** ich gebe korrekte Zugangsdaten ein
**When** ich auf "Anmelden" klicke
**Then** werde ich:
- Zum Jockey-Dashboard weitergeleitet
- Session wird erstellt (8 Stunden gültig)
- Kann meine heutigen Touren sehen

**Given** ich gebe falsche Zugangsdaten ein
**When** ich auf "Anmelden" klicke
**Then** erhalte ich:
- Fehlermeldung: "Username oder Passwort falsch"
- Nach 5 Fehlversuchen: Temporärer Lock (15 Minuten)

**Given** ich klicke auf "Passwort vergessen"
**When** ich meine E-Mail eingebe
**Then** erhalte ich:
- Reset-Link per E-Mail
- Kann neues Passwort setzen

**Geschäftsregeln:**
- Username wird vom Admin vergeben
- Starkes Passwort erforderlich (min. 8 Zeichen)
- Session gültig: 8 Stunden (Arbeitsschicht)
- Rate Limiting: Max. 5 Login-Versuche, dann 15 Min Lock

**Technische Details:**
- Passwort-Hashing: bcrypt oder Argon2
- Session-Management via JWT oder Session-Cookie
- Role: JOCKEY in User-Objekt

**Story Points:** 3

---

### US-023: Werkstatt-Login (Username/Password)

**Als** Werkstatt-Mitarbeiter
**möchte ich** mich mit meinen Zugangsdaten anmelden
**damit** ich Aufträge und Auftragserweiterungen verwalten kann

**Akzeptanzkriterien:**

**Given** ich bin auf der Werkstatt-Login-Seite
**When** die Seite lädt
**Then** sehe ich:
- Eingabefeld: Username
- Eingabefeld: Passwort
- Button: "Anmelden"
- Link: "Passwort vergessen?"

**Given** ich gebe korrekte Zugangsdaten ein
**When** ich auf "Anmelden" klicke
**Then** werde ich:
- Zum Werkstatt-Dashboard weitergeleitet
- Session wird erstellt (12 Stunden gültig)
- Kann heutige Aufträge sehen

**Given** ich gebe falsche Zugangsdaten ein
**When** ich auf "Anmelden" klicke
**Then** erhalte ich:
- Fehlermeldung: "Username oder Passwort falsch"
- Nach 5 Fehlversuchen: Temporärer Lock (15 Minuten)

**Geschäftsregeln:**
- Username wird vom Admin vergeben
- Starkes Passwort erforderlich (min. 8 Zeichen)
- Session gültig: 12 Stunden (Werkstatt-Schicht)
- Multi-User: Mehrere Mitarbeiter können gleichzeitig eingeloggt sein

**Technische Details:**
- Passwort-Hashing: bcrypt oder Argon2
- Session-Management via JWT oder Session-Cookie
- Role: WORKSHOP in User-Objekt

**Story Points:** 3

---

### US-024: Session Management & Logout

**Als** System
**möchte ich** Sitzungen sicher verwalten
**damit** Sicherheit gewährleistet ist und User sich ausloggen können

**Akzeptanzkriterien:**

**Given** ich bin eingeloggt (als Kunde, Jockey oder Werkstatt)
**When** ich auf "Logout" klicke
**Then** wird:
- Session invalidiert
- Ich zur Landing Page weitergeleitet
- Logout-Bestätigung angezeigt

**Given** meine Session ist abgelaufen
**When** ich eine geschützte Seite aufrufe
**Then** werde ich:
- Zum Login weitergeleitet
- Erhalte Hinweis: "Sitzung abgelaufen - bitte neu anmelden"

**Given** ich bin auf mehreren Geräten eingeloggt
**When** ich mich auf einem Gerät auslogge
**Then** bleibe ich auf anderen Geräten eingeloggt (kein globaler Logout im MVP)

**Geschäftsregeln:**
- Session-Längen: Kunde 7 Tage, Jockey 8h, Werkstatt 12h
- Auto-Logout bei Inaktivität (optional, Post-MVP)
- Logout-Button in Header/Navigation jederzeit sichtbar

**Technische Details:**
- JWT Token Invalidierung oder Session-Cookie löschen
- Redirect nach Logout zur Landing Page
- Secure Cookies (httpOnly, sameSite=strict)

**Story Points:** 2

---

## Jockey-Portal

### US-025: Jockey-Dashboard (Heutige Aufträge)

**Als** Jockey
**möchte ich** auf einen Blick sehen, welche Abholungen und Rückgaben ich heute habe
**damit** ich meinen Tag effizient planen kann

**Akzeptanzkriterien:**

**Given** ich bin als Jockey eingeloggt
**When** ich mein Dashboard öffne
**Then** sehe ich:
- Überschrift: "Meine Touren - [Heutiges Datum]"
- Liste aller zugewiesenen Abholungen (sortiert nach Zeit)
- Liste aller zugewiesenen Rückgaben (sortiert nach Zeit)
- Status-Anzeige je Tour (Offen, Unterwegs, Abgeschlossen)

**Given** ich habe 3 Abholungen heute
**When** ich die Liste ansehe
**Then** sehe ich pro Abholung:
- Zeitfenster (z.B. "10:00 - 12:00 Uhr")
- Kundenname (z.B. "Max Mustermann")
- Adresse (Straße, PLZ, Ort)
- Fahrzeugdaten (z.B. "VW Golf, Silber")
- Button: "Details anzeigen"
- Button: "Navigation starten"

**Given** ich habe heute keine Touren
**When** ich das Dashboard öffne
**Then** sehe ich:
- Hinweis: "Keine Touren für heute geplant"
- Kontakt-Info: "Bei Fragen: [Werkstatt-Telefon]"

**Geschäftsregeln:**
- Nur heutige Touren anzeigen (keine vergangenen)
- Automatische Aktualisierung alle 5 Minuten
- Push-Benachrichtigung bei neuer Tour-Zuweisung

**UX-Anforderungen:**
- Mobile-First Design (Jockey nutzt Smartphone)
- Große, touch-freundliche Buttons
- Klare Status-Farbcodierung (Grau=Offen, Blau=Unterwegs, Grün=Erledigt)

**Technische Details:**
- Echtzeit-Updates via Polling oder WebSocket
- GPS-Integration für Navigation
- Offline-Fähigkeit (optional, Post-MVP)

**Story Points:** 5

---

### US-026: Auftrags-Details einsehen

**Als** Jockey
**möchte ich** alle relevanten Details zu einer Abholung sehen
**damit** ich vorbereitet zum Kunden fahren kann

**Akzeptanzkriterien:**

**Given** ich bin auf dem Jockey-Dashboard
**When** ich auf "Details anzeigen" bei einer Abholung klicke
**Then** sehe ich:
- Kundendaten: Name, Telefonnummer (klickbar für Anruf)
- Adresse: Vollständige Adresse mit Zusatz (z.B. "3. Stock, Hinterhof")
- Fahrzeugdaten: Marke, Modell, Farbe, Kennzeichen (falls bekannt)
- Service-Art: z.B. "Inspektion 60.000 km"
- Zeitfenster: "10:00 - 12:00 Uhr"
- Besondere Hinweise: z.B. "Kunde möchte Steinschlag prüfen lassen"

**Given** ich bin auf der Detail-Seite
**When** ich auf die Telefonnummer klicke
**Then** wird:
- Telefon-App geöffnet (auf Smartphone)
- Nummer vorausgefüllt für Anruf

**Given** ich bin auf der Detail-Seite
**When** ich auf "Navigation starten" klicke
**Then** wird:
- Google Maps (oder Standard-Navi-App) geöffnet
- Zieladresse vorausgefüllt

**Geschäftsregeln:**
- Alle Infos offline verfügbar (nach erstem Laden)
- Kunde kann während Tour kontaktiert werden

**Technische Details:**
- Deep-Links zu Telefon-App (tel: Protokoll)
- Deep-Links zu Maps-App (geo: oder maps: Protokoll)
- Responsive Layout für Tablet/Smartphone

**Story Points:** 3

---

### US-027: Navigation zur Abholadresse

**Als** Jockey
**möchte ich** mit einem Klick zur Abholadresse navigieren
**damit** ich den Kunden schnell finde

**Akzeptanzkriterien:**

**Given** ich bin auf der Auftrags-Detail-Seite
**When** ich auf "Navigation starten" klicke
**Then** öffnet sich:
- Google Maps (Android) oder Apple Maps (iOS)
- Zieladresse ist vorausgefüllt
- Navigation kann gestartet werden

**Given** ich nutze ein Android-Gerät
**When** Navigation startet
**Then** wird Google Maps geöffnet

**Given** ich nutze ein iOS-Gerät
**When** Navigation startet
**Then** wird Apple Maps geöffnet

**Geschäftsregeln:**
- Nutzung Standard-Navi-App des Geräts
- Alternative: Waze-Integration (Post-MVP)

**Technische Details:**
- Deep-Linking: `geo:` oder `maps:` URL-Schema
- Fallback: Webbasierte Google Maps

**Story Points:** 2

---

### US-028: Übergabeprotokoll erstellen (digital)

**Als** Jockey
**möchte ich** bei Fahrzeugübergabe ein digitales Protokoll erstellen
**damit** Fahrzeugzustand dokumentiert ist und Haftung geklärt ist

**Akzeptanzkriterien:**

**Given** ich bin beim Kunden vor Ort
**When** ich auf "Übergabe starten" klicke
**Then** öffnet sich das Übergabeprotokoll mit:
- Checklist: Fahrzeugzustand prüfen
- Foto-Upload: Fahrzeug von allen Seiten
- Kilometerstand eingeben (Pflichtfeld)
- Tankanzeige dokumentieren (Foto oder Dropdown)
- Unterschrift des Kunden (digital auf Touch-Screen)

**Given** ich habe alle Pflichtfelder ausgefüllt
**When** ich auf "Übergabe abschließen" klicke
**Then** wird:
- Protokoll gespeichert
- Status auf "Abgeholt" gesetzt
- Kunde erhält Bestätigung per E-Mail
- Werkstatt wird informiert: "Fahrzeug unterwegs"

**Given** ich vergesse ein Pflichtfeld
**When** ich auf "Übergabe abschließen" klicke
**Then** erhalte ich:
- Fehlermeldung: "Bitte alle Pflichtfelder ausfüllen"
- Fehlende Felder werden markiert

**Geschäftsregeln:**
- Pflichtfelder: Fotos (min. 4 Seiten), Kilometerstand, Unterschrift
- Protokoll ist rechtsgültig (AGB)
- Keine Übergabe ohne Protokoll möglich

**Technische Details:**
- Foto-Upload direkt von Smartphone-Kamera
- Canvas für digitale Unterschrift
- Offline-Fähigkeit: Protokoll wird lokal gespeichert, später synchronisiert

**Story Points:** 8

---

### US-029: Fahrzeugschein fotografieren

**Als** Jockey
**möchte ich** den Fahrzeugschein fotografieren
**damit** Fahrzeugdaten für zukünftige Buchungen gespeichert werden

**Akzeptanzkriterien:**

**Given** ich bin im Übergabeprotokoll
**When** ich auf "Fahrzeugschein fotografieren" klicke
**Then** öffnet sich die Kamera

**Given** ich mache ein Foto vom Fahrzeugschein
**When** das Foto gespeichert ist
**Then** wird:
- Foto im System hochgeladen
- Optional: OCR erkennt Daten (VIN, Schlüsselnummer) - Post-MVP
- Hinweis: "Fahrzeugdaten gespeichert für nächste Buchung"

**Given** der Kunde möchte Fahrzeugschein nicht fotografieren lassen
**When** ich "Überspringen" klicke
**Then** wird:
- Übergabe ohne Fahrzeugschein-Foto abgeschlossen
- Hinweis: "Kunde hat Fahrzeugschein-Foto abgelehnt"

**Geschäftsregeln:**
- Fahrzeugschein-Foto ist optional (DSGVO-Consent erforderlich)
- Kunde kann ablehnen
- Daten werden sicher gespeichert (Verschlüsselung)

**Technische Details:**
- Kamera-API (HTML5 oder native)
- Bild-Komprimierung vor Upload
- OCR-Integration optional (Post-MVP)

**Story Points:** 3

---

### US-030: Fahrzeugzustand dokumentieren (Fotos)

**Als** Jockey
**möchte ich** den Fahrzeugzustand mit Fotos dokumentieren
**damit** vorhandene Schäden nachweisbar sind

**Akzeptanzkriterien:**

**Given** ich bin im Übergabeprotokoll
**When** ich zur Foto-Dokumentation komme
**Then** sehe ich Anweisungen:
- "Bitte fotografieren Sie das Fahrzeug von allen 4 Seiten"
- Icons: Vorne, Hinten, Links, Rechts
- Optional: Nahaufnahmen von Schäden

**Given** ich mache ein Foto
**When** das Foto gespeichert ist
**Then** wird:
- Vorschau angezeigt
- Icon für diese Seite grün markiert
- Upload-Status: "Foto hochgeladen"

**Given** ich habe alle 4 Seiten fotografiert
**When** ich zur nächsten Sektion gehe
**Then** ist dieser Schritt als "Erledigt" markiert

**Given** es gibt sichtbare Schäden (Kratzer, Dellen)
**When** ich diese fotografiere
**Then** kann ich:
- Kommentar hinzufügen (z.B. "Kratzer hinten rechts")
- Mehrere Nahaufnahmen machen

**Geschäftsregeln:**
- Mindestens 4 Fotos erforderlich (alle Seiten)
- Maximale Dateigröße: 5 MB pro Foto
- Automatische Komprimierung bei Upload

**Technische Details:**
- Kamera-API mit Preview
- Bild-Komprimierung (max. 1920x1080)
- Upload zu Blob Storage (lokal: File System, später: Azure Blob)

**Story Points:** 5

---

### US-031: Status-Updates senden

**Als** Jockey
**möchte ich** den Status meiner Tour aktualisieren
**damit** Kunde und Werkstatt informiert sind

**Akzeptanzkriterien:**

**Given** ich habe eine Tour gestartet
**When** ich auf "Status aktualisieren" klicke
**Then** kann ich wählen:
- "Unterwegs zum Kunden"
- "Fahrzeug abgeholt"
- "Unterwegs zur Werkstatt"
- "Fahrzeug in Werkstatt abgegeben"

**Given** ich setze Status auf "Unterwegs zum Kunden"
**When** der Status aktualisiert wird
**Then** erhält der Kunde:
- Push-Benachrichtigung: "Ihr Fahrer ist unterwegs"
- Optional: Link zu Live-Tracking (Post-MVP)

**Given** ich setze Status auf "Fahrzeug abgeholt"
**When** der Status aktualisiert wird
**Then** erhält der Kunde:
- E-Mail: "Ihr Fahrzeug wurde abgeholt und ist auf dem Weg zur Werkstatt"
- Werkstatt erhält Info: "Fahrzeug unterwegs"

**Given** ich setze Status auf "Fahrzeug in Werkstatt abgegeben"
**When** der Status aktualisiert wird
**Then** erhält der Kunde:
- E-Mail: "Ihr Fahrzeug ist in der Werkstatt angekommen"
- Werkstatt erhält Info: "Fahrzeug kann bearbeitet werden"

**Geschäftsregeln:**
- Status-Updates sind Pflicht (keine Silent Completion)
- Kunde erhält bei jedem wichtigen Schritt eine Benachrichtigung
- Werkstatt sieht Status in Echtzeit

**Technische Details:**
- WebSocket oder Server-Sent Events für Echtzeit-Updates
- E-Mail-Service für Benachrichtigungen
- Push-Notifications (optional, Post-MVP)

**Story Points:** 5

---

### US-032: Rückgabe-Prozess durchführen

**Als** Jockey
**möchte ich** die Fahrzeugrückgabe dokumentieren
**damit** der Service vollständig abgeschlossen ist

**Akzeptanzkriterien:**

**Given** die Werkstatt hat den Service abgeschlossen
**When** ich die Rückgabe-Tour starte
**Then** sehe ich:
- Kundendaten und Rückgabe-Adresse
- Hinweis: "Fahrzeug ist gewaschen"
- Hinweis: "Screen Cleaner liegt im Auto"
- Serviceheft mit Stempel prüfen

**Given** ich bin beim Kunden angekommen
**When** ich auf "Rückgabe starten" klicke
**Then** öffnet sich das Rückgabe-Protokoll:
- Fahrzeugzustand nach Service fotografieren
- Kunde über durchgeführte Arbeiten informieren
- Unterschrift des Kunden (Bestätigung Erhalt)
- Optional: Google-Bewertung erfragen

**Given** der Kunde ist zufrieden
**When** ich frage: "Würden Sie uns mit einer Google-Bewertung unterstützen?"
**Then** kann ich:
- QR-Code anzeigen (Link zu Google Reviews)
- Oder: Link per SMS senden

**Given** die Rückgabe ist abgeschlossen
**When** ich auf "Rückgabe abschließen" klicke
**Then** wird:
- Status auf "Abgeschlossen" gesetzt
- Kunde erhält Abschluss-E-Mail mit Rechnung
- Jockey erhält Bestätigung: "Tour abgeschlossen"

**Geschäftsregeln:**
- Rückgabe-Protokoll analog zu Abholung
- Kunde muss Rückgabe unterschreiben
- Fotos nach Rückgabe dokumentieren Zustand

**Technische Details:**
- QR-Code-Generierung für Google Reviews
- SMS-Versand (optional, via Twilio)
- Digitale Unterschrift

**Story Points:** 5

---

## Werkstatt-Portal

### US-033: Werkstatt-Dashboard (Offene Aufträge)

**Als** Werkstatt-Mitarbeiter
**möchte ich** alle aktuellen Aufträge auf einen Blick sehen
**damit** ich meine Arbeit priorisieren kann

**Akzeptanzkriterien:**

**Given** ich bin als Werkstatt-Mitarbeiter eingeloggt
**When** ich mein Dashboard öffne
**Then** sehe ich:
- Überschrift: "Heutige Aufträge - [Datum]"
- Liste aller Aufträge mit Status
- Filter: "Alle", "Annahme ausstehend", "In Arbeit", "Fertig"
- Button: "Neuen Auftrag anlegen" (manuell)

**Given** ich sehe die Auftragsliste
**When** ich einen Auftrag betrachte
**Then** sehe ich:
- Kundenname (z.B. "Max Mustermann")
- Fahrzeugdaten (z.B. "VW Golf, 2015, 85.000 km")
- Service-Art (z.B. "Inspektion 60.000 km")
- Status (z.B. "In Arbeit")
- Uhrzeit Ankunft (z.B. "10:30 Uhr - Jockey unterwegs")
- Button: "Details anzeigen"
- Button: "Auftragserweiterung erstellen"

**Given** ein Fahrzeug ist gerade angekommen
**When** ich die Liste aktualisiere
**Then** sehe ich:
- Neuer Auftrag oben in der Liste
- Status: "Fahrzeug angekommen"
- Hinweis: "Bereit für Bearbeitung"

**Geschäftsregeln:**
- Aufträge sortiert nach Priorität (zeitlich, SLA)
- Automatische Aktualisierung alle 2 Minuten
- Farbcodierung: Rot=Dringend, Gelb=Normal, Grün=Abgeschlossen

**UX-Anforderungen:**
- Tablet-optimiert (Werkstatt nutzt Tablets)
- Große Buttons (Touch-freundlich)
- Deutschsprachig (keine englischen Fachbegriffe)

**Technische Details:**
- Real-Time Updates via Polling oder WebSocket
- Responsive Layout (Tablet und Desktop)
- Filter-Logik clientseitig

**Story Points:** 5

---

### US-034: Auftrags-Details mit Fahrzeugdaten

**Als** Werkstatt-Mitarbeiter
**möchte ich** alle Details zu einem Auftrag sehen
**damit** ich die Arbeiten korrekt durchführen kann

**Akzeptanzkriterien:**

**Given** ich bin auf dem Werkstatt-Dashboard
**When** ich auf "Details anzeigen" bei einem Auftrag klicke
**Then** sehe ich:
- Kundendaten: Name, Telefon, E-Mail
- Fahrzeugdaten: Marke, Modell, Baujahr, Kilometerstand, Kennzeichen
- Service-Buchung: Art (z.B. "Inspektion 60.000 km"), Preis
- Fotos: Fahrzeugzustand bei Abholung (von Jockey)
- Besondere Wünsche: z.B. "Kunde möchte Steinschlag prüfen"
- Serviceheft-Info: "Eintrag erforderlich"

**Given** ich bin auf der Detail-Seite
**When** ich nach unten scrolle
**Then** sehe ich:
- Historie: Bisherige Services (falls Bestandskunde)
- Buttons: "Auftragserweiterung erstellen", "Auftrag abschließen"

**Geschäftsregeln:**
- Alle relevanten Infos für Werkstatt-Arbeit
- Fotos vom Jockey (Fahrzeugzustand) einsehbar
- Historie nur bei Bestandskunden

**Technische Details:**
- Foto-Galerie mit Zoom-Funktion
- PDF-Export möglich (für Ausdruck)

**Story Points:** 3

---

### US-035: Auftragserweiterung erstellen (Text + Fotos + Preis)

**Als** Werkstatt-Mitarbeiter
**möchte ich** zusätzliche Arbeiten dem Kunden digital anbieten
**damit** Transparenz gewährleistet ist und keine Telefonanrufe nötig sind

**Akzeptanzkriterien:**

**Given** ich habe einen Mangel festgestellt
**When** ich auf "Auftragserweiterung erstellen" klicke
**Then** öffnet sich ein Formular:
- Dropdown: Art der Arbeit (Bremse, Luftfilter, Steinschlag, etc.)
- Textfeld: Beschreibung (z.B. "Bremsbeläge vorne abgefahren, Wechsel empfohlen")
- Foto-Upload: Bilder hochladen (Drag & Drop oder Kamera)
- Preis-Kalkulation: Festpreis eingeben (z.B. 349 EUR)
- Button: "An Kunde senden"

**Given** ich fülle alle Pflichtfelder aus
**When** ich auf "An Kunde senden" klicke
**Then** wird:
- Angebot gespeichert (Status: "Offen")
- Kunde erhält Push-Benachrichtigung + E-Mail
- Angebot erscheint in Kundenliste als "Ausstehend"

**Given** ich vergesse ein Pflichtfeld
**When** ich auf "An Kunde senden" klicke
**Then** erhalte ich:
- Fehlermeldung: "Bitte alle Pflichtfelder ausfüllen"
- Fehlende Felder werden rot markiert

**Geschäftsregeln:**
- Pflichtfelder: Beschreibung, Preis, mindestens 1 Foto
- Festpreis (kein "ca." oder "ab")
- Mehrere Angebote pro Auftrag möglich
- Werkstatt darf NICHT ohne Freigabe arbeiten

**UX-Anforderungen:**
- Einfache, intuitive Bedienung (für Mechaniker ohne Tech-Affinität)
- Vorlagen für häufige Arbeiten (z.B. "Bremse vorne", "Luftfilter")
- Auto-Save (Entwurf speichern bei Unterbrechung)

**Technische Details:**
- Foto-Upload: Drag & Drop oder Mobile-Kamera
- Bild-Komprimierung vor Upload
- Preiskalkulation: Freitext oder Dropdown aus Teilekatalog

**Story Points:** 8

---

### US-036: Fotos hochladen (Drag & Drop)

**Als** Werkstatt-Mitarbeiter
**möchte ich** Fotos einfach hochladen können
**damit** der Kunde den Mangel sehen kann

**Akzeptanzkriterien:**

**Given** ich bin im Formular "Auftragserweiterung"
**When** ich zur Foto-Upload-Sektion komme
**Then** sehe ich:
- Upload-Box: "Fotos hier ablegen oder klicken"
- Hinweis: "Max. 5 MB pro Bild, max. 10 Bilder"

**Given** ich ziehe ein Foto in die Upload-Box
**When** das Foto abgelegt wird
**Then** wird:
- Foto hochgeladen
- Vorschau angezeigt
- Upload-Status: "Hochgeladen" (grünes Häkchen)

**Given** ich nutze ein Tablet/Smartphone
**When** ich auf die Upload-Box klicke
**Then** öffnet sich:
- Kamera-App oder Foto-Auswahl
- Ich kann direkt ein Foto machen oder aus Galerie wählen

**Given** ich habe 3 Fotos hochgeladen
**When** ich ein Foto löschen möchte
**Then** kann ich:
- X-Icon auf Vorschau klicken
- Foto wird entfernt

**Geschäftsregeln:**
- Max. 10 Fotos pro Angebot
- Max. 5 MB pro Foto
- Erlaubte Formate: JPG, PNG
- Automatische Komprimierung bei großen Dateien

**Technische Details:**
- HTML5 Drag & Drop API
- File Input für Kamera-Zugriff (Mobile)
- Bild-Komprimierung clientseitig (vor Upload)
- Progress Bar während Upload

**Story Points:** 5

---

### US-037: Kunde über Auftragserweiterung benachrichtigen

**Als** System
**möchte ich** den Kunden automatisch benachrichtigen
**damit** er das Angebot prüfen und freigeben kann

**Akzeptanzkriterien:**

**Given** die Werkstatt hat ein Angebot erstellt
**When** das Angebot gespeichert wird
**Then** erhält der Kunde:
- E-Mail: "Zusätzliche Arbeiten vorgeschlagen"
- Push-Benachrichtigung (optional, Post-MVP)
- SMS (optional, Post-MVP)

**Given** der Kunde öffnet die E-Mail
**When** er auf "Angebot ansehen" klickt
**Then** wird er:
- Zum Kunden-Portal weitergeleitet
- Kann Angebot prüfen (Beschreibung, Fotos, Preis)
- Kann "Freigeben" oder "Ablehnen"

**Given** der Kunde reagiert nicht
**When** 2 Stunden vergangen sind
**Then** erhält er:
- Erinnerungs-E-Mail: "Bitte prüfen Sie das Angebot"
- Hinweis: "Werkstatt wartet auf Ihre Rückmeldung"

**Geschäftsregeln:**
- Sofortige Benachrichtigung nach Angebot-Erstellung
- Erinnerung nach 2 Stunden (optional)
- Max. 1 Erinnerung (kein Spam)

**Technische Details:**
- E-Mail-Service (SendGrid / AWS SES)
- Push-Notifications (optional, Post-MVP)
- SMS via Twilio (optional, Post-MVP)
- Delayed Job für Erinnerung (Background Worker)

**Story Points:** 3

---

### US-038: Status von Auftragserweiterung tracken

**Als** Werkstatt-Mitarbeiter
**möchte ich** den Status meiner Angebote sehen
**damit** ich weiß, ob ich mit der Arbeit beginnen kann

**Akzeptanzkriterien:**

**Given** ich habe ein Angebot erstellt
**When** ich das Dashboard öffne
**Then** sehe ich:
- Liste aller Angebote mit Status
- Status-Optionen: "Offen", "Freigegeben", "Abgelehnt"
- Farbcodierung: Gelb=Offen, Grün=Freigegeben, Rot=Abgelehnt

**Given** der Kunde gibt ein Angebot frei
**When** die Freigabe erfolgt
**Then** wird:
- Status auf "Freigegeben" gesetzt (grün)
- Benachrichtigung: "Kunde hat Angebot freigegeben - kann durchgeführt werden"
- Zahlung ist bestätigt

**Given** der Kunde lehnt ein Angebot ab
**When** die Ablehnung erfolgt
**Then** wird:
- Status auf "Abgelehnt" gesetzt (rot)
- Optional: Ablehnungsgrund angezeigt
- Hinweis: "Nicht durchführen - nur gebuchten Service"

**Geschäftsregeln:**
- Status wird in Echtzeit aktualisiert
- Werkstatt darf nur freigegebene Arbeiten durchführen
- Bei Ablehnung: Nur gebuchten Service durchführen

**Technische Details:**
- Real-Time Updates via WebSocket oder Polling
- Push-Benachrichtigung an Werkstatt-Tablet

**Story Points:** 3

---

### US-039: Auftrag als abgeschlossen markieren

**Als** Werkstatt-Mitarbeiter
**möchte ich** einen Auftrag als abgeschlossen markieren
**damit** der Jockey das Fahrzeug zurückbringen kann

**Akzeptanzkriterien:**

**Given** ich habe alle Arbeiten durchgeführt
**When** ich auf "Auftrag abschließen" klicke
**Then** öffnet sich ein Abschluss-Formular:
- Checklist: "Serviceheft eingetragen", "Fahrzeug gewaschen", "Screen Cleaner eingelegt"
- Textfeld: Abschlussbemerkungen (optional)
- Button: "Auftrag abschließen"

**Given** ich schließe den Auftrag ab
**When** ich auf "Auftrag abschließen" klicke
**Then** wird:
- Status auf "Fertig" gesetzt
- Jockey erhält Benachrichtigung: "Fahrzeug bereit für Rückgabe"
- Kunde erhält Info: "Service abgeschlossen - Rückgabe wird geplant"
- Odoo wird aktualisiert (Rechnung finalisiert)

**Geschäftsregeln:**
- Auftrag kann nur abgeschlossen werden, wenn alle Services durchgeführt wurden
- Bei offenen Auftragserweiterungen: Warnung anzeigen
- Fahrzeug muss gewaschen sein (Checklist)

**Technische Details:**
- Status-Update in Datenbank
- Benachrichtigungen an Jockey und Kunde
- Odoo-Sync für finale Rechnung

**Story Points:** 5

---

### US-040: Kommunikation mit Jockey (falls nötig)

**Als** Werkstatt-Mitarbeiter
**möchte ich** bei Problemen den Jockey kontaktieren können
**damit** Rückfragen geklärt werden (z.B. fehlender Schlüssel)

**Akzeptanzkriterien:**

**Given** ich habe eine Rückfrage zum Fahrzeug
**When** ich auf "Jockey kontaktieren" klicke
**Then** öffnet sich ein Chat/Nachricht-Formular:
- Textfeld: Nachricht
- Button: "Nachricht senden"
- Alternative: Telefonnummer des Jockeys (klickbar)

**Given** ich sende eine Nachricht
**When** die Nachricht abgeschickt wird
**Then** erhält der Jockey:
- Push-Benachrichtigung (in Driver-App)
- Kann antworten

**Given** der Fall ist dringend
**When** ich auf die Telefonnummer klicke
**Then** wird:
- Telefon-App geöffnet
- Jockey kann direkt angerufen werden

**Geschäftsregeln:**
- Nur für Rückfragen zum aktuellen Auftrag
- Kein allgemeiner Chat (Post-MVP)
- Nachrichtenhistorie pro Auftrag

**Technische Details:**
- Simple Messaging-Funktion (kein vollwertiger Chat)
- Push-Notifications an Jockey
- Telefon-Link (tel: Protokoll)

**Story Points:** 5

---

## Story Points Übersicht

| Story ID | Beschreibung | Story Points |
|----------|-------------|--------------|
| US-020 | Landing Page mit drei Login-Bereichen | 5 |
| US-021 | Kunden-Login (Magic Link) | 5 |
| US-022 | Jockey-Login (Username/Password) | 3 |
| US-023 | Werkstatt-Login (Username/Password) | 3 |
| US-024 | Session Management & Logout | 2 |
| US-025 | Jockey-Dashboard | 5 |
| US-026 | Auftrags-Details einsehen | 3 |
| US-027 | Navigation zur Abholadresse | 2 |
| US-028 | Übergabeprotokoll erstellen | 8 |
| US-029 | Fahrzeugschein fotografieren | 3 |
| US-030 | Fahrzeugzustand dokumentieren | 5 |
| US-031 | Status-Updates senden | 5 |
| US-032 | Rückgabe-Prozess | 5 |
| US-033 | Werkstatt-Dashboard | 5 |
| US-034 | Auftrags-Details | 3 |
| US-035 | Auftragserweiterung erstellen | 8 |
| US-036 | Fotos hochladen | 5 |
| US-037 | Kunde benachrichtigen | 3 |
| US-038 | Status tracken | 3 |
| US-039 | Auftrag abschließen | 5 |
| US-040 | Kommunikation mit Jockey | 5 |

**Summe:** 91 Story Points

---

## Abhängigkeiten

```
US-020 → US-021, US-022, US-023 (Landing Page muss vor Login-Flows existieren)
US-022 → US-025 (Jockey-Login benötigt für Dashboard)
US-023 → US-033 (Werkstatt-Login benötigt für Dashboard)
US-025 → US-026, US-027, US-028 (Dashboard ist Einstieg für Jockey-Funktionen)
US-028 → US-029, US-030 (Übergabeprotokoll beinhaltet Fotos)
US-033 → US-034, US-035 (Werkstatt-Dashboard ist Einstieg)
US-035 → US-036, US-037, US-038 (Auftragserweiterung-Flow)
```

---

## Offene Fragen

1. **Magic Link vs. OTP:** Soll Kunden-Login via Magic Link (E-Mail) oder OTP (SMS) erfolgen?
2. **Jockey Live-Tracking:** Wollen wir GPS-Tracking im MVP oder erst Post-MVP?
3. **Offline-Modus:** Braucht Jockey-App Offline-Funktionalität (z.B. in Tiefgaragen)?
4. **Werkstatt-System:** Welches System nutzt Witten aktuell? Integration möglich?
5. **Video-Upload:** Sollen Werkstätten auch Videos hochladen können (neben Fotos)?

---

**Nächste Schritte:**

1. Product Backlog Refinement: Stories schätzen mit Team
2. Sprint Planning: Stories in Sprints aufteilen
3. UI/UX Wireframes: Landing Page, Jockey-Dashboard, Werkstatt-Dashboard
4. Technical Spike: Authentication-System testen (Magic Link, JWT)
