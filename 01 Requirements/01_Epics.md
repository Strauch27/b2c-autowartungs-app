# Epics: B2C Autowartungs-App

## Epic 1: Festpreis-Buchungssystem

**Als** Autofahrer **möchte ich** in maximal 3 Klicks einen Service zu einem garantierten Festpreis buchen können, **damit** ich Transparenz habe und keine bösen Überraschungen beim Preis erlebe.

### Business Value
- **Hauptdifferenzierung** zum Markt (kein Portal bietet echte Festpreisgarantie mit digitaler Auftragserweiterung)
- **Conversion-Optimierung** durch minimale Eingabehürden
- **Vertrauensaufbau** bei preissensitiven Kunden

### Scope
- Marke/Modell-basierte Bepreisung (spezifisch nach Fahrzeug, KEINE pauschalen Fahrzeugklassen)
- **Hauptprodukt**: Inspektion/Wartung eines Fahrzeugs (nicht nur Ölservice)
- Weitere Services: Bremsen, Klimaservice, TÜV/HU, Fahrzeugaufbereitung
- Pflicht-Buchungsdaten: Marke + Modell + Baujahr + Kilometerstand (alle erforderlich)
- Online-Vorauszahlung (Stripe Integration)
- Light-Registrierung (minimale Kundendaten)

### Abhängigkeiten
- Payment-Integration (Stripe)
- Odoo-Integration für Accounting
- Fahrzeugdaten-Logik (Marke/Modell-spezifische Preiskalkulation)
- Kilometerstand-basierte Wartungsbedarfsermittlung

---

## Epic 2: Concierge-Service mit Ronja-Ersatzfahrzeugen

**Als** Autofahrer **möchte ich** mein Auto zu einem vereinbarten Zeitpunkt abholen und zurückbringen lassen sowie ein Ersatzfahrzeug erhalten, **damit** ich mich nicht um Logistik kümmern muss und mobil bleibe.

### Business Value
- **Hauptdifferenzierung** - macht Service einzigartig am Markt
- **Marketing-Multiplikator** - Ronja-Fahrzeuge als fahrende Werbung
- **Premium-Positioning** - rechtfertigt höhere Preise
- **Kundenbindung** - höhere Wiederbuchungsrate

### Scope
- Hol- und Bringtermin-Buchung (Slot-Management)
- Jockey-Assignment und -Routing
- Fahrzeugübergabe-Prozess (digital dokumentiert)
- Ersatzfahrzeug-Management (Ronja-Flotte)
- Driver-App-Integration für Übergabeprotokoll

### Abhängigkeiten
- Slot-Management-System
- Driver-App (existiert bereits, muss integriert werden)
- Fahrzeugflotten-Management
- Jockey-Verfügbarkeit in Witten

---

## Epic 3: Digitale Auftragserweiterung

**Als** Autofahrer **möchte ich** während der Service-Durchführung digital über zusätzliche erforderliche Arbeiten informiert werden und diese freigeben oder ablehnen können, **damit** ich volle Kostenkontrolle habe und keine unerwarteten Rechnungen bekomme.

### Business Value
- **Vertrauensaufbau** - Kunde behält volle Kontrolle
- **Zusatzumsatz** - transparente Upselling-Möglichkeit
- **Differenzierung** - kein anderer Anbieter hat vollständig digitale Auftragserweiterung
- **Kundenzufriedenheit** - keine negativen Überraschungen

### Scope
- Werkstatt meldet zusätzliche Arbeiten über System
- Kunde erhält Push/E-Mail mit Beschreibung, Bildern, Preis
- Digitale Freigabe/Ablehnung durch Kunde
- Automatische Payment-Erweiterung bei Freigabe
- Nachvollziehbare Historie aller Auftragserweiterungen

### Abhängigkeiten
- Werkstatt-Integration (vermutlich manuelle Erfassung für MVP)
- Notification-System (Push, E-Mail, SMS)
- Payment-Erweiterung (Stripe)
- Bild-Upload-Funktion

---

## Epic 4: Slot-Management & Kapazitätsplanung

**Als** Betreiber **möchte ich** die verfügbaren Hol-/Bring-Slots und Werkstattkapazitäten zentral steuern können, **damit** keine Doppelbuchungen entstehen und die Auslastung optimiert wird.

### Business Value
- **Operational Excellence** - verhindert Chaos bei Buchungen
- **Skalierbarkeit** - Grundlage für Multi-Werkstatt-Betrieb
- **Kundenzufriedenheit** - zuverlässige Terminzusagen

### Scope
- Slot-Definition pro Werkstatt (Zeiten, Kapazitäten)
- Echtzeit-Verfügbarkeitscheck bei Buchung
- Jockey-Kapazität berücksichtigen
- Automatische Slot-Blockierung bei Buchung
- Admin-Interface für Slot-Management

### Abhängigkeiten
- Werkstatt-Stammdaten
- Jockey-Verfügbarkeit
- Kalender-Logik

---

## Epic 5: Kundendatenerfassung & -anreicherung

**Als** Betreiber **möchte ich** sukzessive Kundendaten erfassen und anreichern, **damit** ich personalisierte Services anbieten und die Customer Lifetime Value steigern kann.

### Business Value
- **Daten als Asset** - "Daten sind das neue Gold"
- **Personalisierung** - bessere Services für Wiederkunden
- **Preisoptimierung** - genaue Preise ab 2. Buchung
- **Marketing** - gezielte Kampagnen möglich

### Scope
- Light-Registrierung bei Erstbuchung (E-Mail, Telefon, Adresse)
- Fahrzeugdaten-Erfassung durch Jockey (Fahrzeugschein fotografieren)
- QR-Code ins Auto für schnelle Wiederbuchung
- Multi-Fahrzeug-Erfassung
- Schrittweise Datenanreicherung entlang Customer Journey

### Abhängigkeiten
- Einmalcode-Login (passwordless)
- QR-Code-Generierung
- Fahrzeugschein-OCR (nice-to-have für später)

---

## Epic 6: Payment & Accounting Integration

**Als** Betreiber **möchte ich** alle Zahlungen automatisiert abwickeln und im Accounting-System erfassen, **damit** keine manuellen Buchungen nötig sind und Reporting möglich ist.

### Business Value
- **Automatisierung** - keine manuelle Buchhaltung
- **Compliance** - korrekte Rechnungsstellung
- **Reporting** - Revenue-Tracking und KPIs

### Scope
- Stripe-Integration für Online-Zahlung
- Automatische Rechnungserstellung
- Odoo-Integration für Accounting
- Auftragserweiterungs-Payment
- Stornierungen und Refunds

### Abhängigkeiten
- Stripe-Account
- Odoo-API-Zugang
- Rechnungstemplate

---

## Epic 7: Multi-Portal-Architektur & Demo-Fähigkeit

**Als** Produktteam **möchte ich** drei separate Portale für Kunden, Jockeys und Werkstätten haben, **damit** die Customer Journey vollständig demonstriert und getestet werden kann.

### Business Value
- **Demo-Fähigkeit** - Stakeholder können kompletten Prozess nachvollziehen
- **Proof of Concept** - Alle User Journeys sind ausführbar testbar
- **Operational Excellence** - Jeder Stakeholder hat optimiertes Interface
- **Skalierbarkeit** - Basis für Multi-Werkstatt-Betrieb

### Scope
- Landing Page mit drei klar getrennten Login-Bereichen (Kunde, Jockey, Werkstatt)
- Kunden-Portal: Buchung, Buchungsverwaltung, Auftragserweiterung freigeben
- Jockey-Portal: Abholungen/Rückgaben, Fahrzeugübergabe-Protokoll, Foto-Upload
- Werkstatt-Portal: Auftragsübersicht, Auftragserweiterungen erstellen
- Role-based Access Control (RBAC)
- Lokale Deployment-Strategie (100% lokal ausführbar für PoC)

### Abhängigkeiten
- Authentication-System (Magic Link für Kunden, Username/Passwort für Jockey/Werkstatt)
- Datenbank mit User Roles (Customer, Jockey, Workshop)
- Responsive Design für alle drei Portale
- Lokaler Server-Setup (localhost)

---

## Epic 8: Lokale Deployment-Strategie

**Als** Entwicklungsteam **möchte ich** eine 100% lokal lauffähige Version bauen, **damit** wir ausführlich testen und demonstrieren können, bevor wir in die Cloud migrieren.

### Business Value
- **Schneller PoC** - Kein Cloud-Setup erforderlich im MVP
- **Kosteneffizienz** - Keine Cloud-Kosten während Entwicklung/Testing
- **Flexibilität** - Einfaches Testing auf jedem Entwickler-Rechner
- **Azure-Migration** - Spätere Cloud-Migration geplant

### Scope
- Vollständig lokal ausführbares System (localhost)
- PostgreSQL oder SQLite (lokal)
- Stripe Test Mode (Webhooks via Stripe CLI)
- Odoo Mock-Integration (später: echte API)
- Alle drei Portale lokal verfügbar
- Docker-Setup optional (für einfache Verteilung)

### Abhängigkeiten
- Entwicklungsumgebung (Node.js/Python)
- Lokale Datenbank
- Stripe CLI für lokale Webhook-Tests
- Dokumentation für lokales Setup

### Post-MVP: Azure Cloud Migration
- Phase 2: Refactoring für Azure
- Azure App Service, Azure SQL, Azure Blob Storage
- CI/CD Pipeline (GitHub Actions → Azure)
- Production-ready Deployment

---

## Epic 9: Marketing & Brand Launch

**Als** Betreiber **möchte ich** eine neue Marke mit starker Positionierung launchen, **damit** die App erfolgreich am Markt positioniert wird.

### Business Value
- **Brand Equity** - unabhängige Marke aufbauen
- **Customer Acquisition** - erste Nutzer gewinnen
- **Market Testing** - Produkt-Markt-Fit validieren

### Scope
- Markenname und Corporate Design
- Landing Page / Marketing Website
- Social Media Präsenz
- Launch-Kampagne (organisch + minimal paid)
- Trust-Building (Partnerlogos, Testimonials)

### Abhängigkeiten
- Produktfertigstellung
- Operativer Setup in Witten
