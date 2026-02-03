# Product Vision: B2C Autowartungs-App

## Vision Statement
Wir schaffen die einfachste und transparenteste digitale Lösung für Autowartung in Deutschland, die durch Festpreisgarantie, Concierge-Service und vollständige Digitalisierung das Vertrauen der Kunden zurückgewinnt.

## Kernkonzept
- **B2C-Plattform** für Autowartung mit radikaler Preistransparenz
- **Festpreis-Garantie**: Der Kunde zahlt exakt das, was er bucht - keine versteckten Kosten
- **Concierge-Service**: Hol- und Bringservice mit Ronja-Ersatzfahrzeugen als Hauptdifferenzierung
- **Digitale Auftragserweiterung**: Kunde genehmigt zusätzliche Arbeiten digital über die Plattform
- **Start in Witten**, später deutschlandweit skalierbar

## Hauptdifferenzierung zum Markt
1. **USP #1 - Festpreis ohne Überraschungen**: "Du zahlst nur das, was du buchst" - wie bei Amazon
2. **USP #2 - Concierge-Service**: Auto wird abgeholt und zurückgebracht, Kunde erhält Ronja-Ersatzfahrzeug
3. **USP #3 - Digitale Auftragserweiterung**: Transparente, digitale Freigabe zusätzlicher Arbeiten

## Zielgruppe
- **Primär**: Jüngere Generation (unter 30), digital-affin, schätzt Convenience über Preis
- **Sekundär**: Segment 2-4 Fahrzeuge (nicht Neuwagen in Garantie), preisbewusst aber serviceorientiert
- **Geografie Start**: Witten und Umkreis (ca. 2 Millionen Einwohner im Einzugsgebiet)

## Strategische Ziele
1. **Phase 1 (MVP)**: Proof of Concept in Witten mit einer Werkstatt - 100% lokale Version für Testing & Demo
2. **Phase 2**: Azure Cloud Migration - Skalierbare Infrastruktur für Multi-Werkstatt-Betrieb
3. **Phase 3**: Ausbau auf weitere Städte (Dortmund, Essen, Wuppertal)
4. **Phase 4**: Deutschlandweite Skalierung mit Netzwerk von Partnerwerkstätten
5. **Langfristig**: Größter Ersatzmobilitätsdienstleister mit 10.000-20.000 Fahrzeugen

## Go-to-Market Strategie
- **Minimale Marketingkosten** durch produktgetriebenes Wachstum
- **Social Media Marketing** mit Fokus auf die Unique Features
- **Mund-zu-Mund-Propaganda** durch herausragende Service-Qualität
- **Brand**: Neue Marke (nicht Werkstatt, nicht Ronja) für frischen Start

## Business Model
- **Revenue**: Festpreise nach Marke und Modell + Marge aus Partnerwerkstätten
- **Erste Buchung**: Kann Verlustgeschäft sein (Customer Acquisition)
- **Folgebuchungen**: Optimierte Preise basierend auf bekannten Fahrzeugdaten
- **Zusatzumsatz**: Auftragserweiterungen, Premium-Services, Finanzierung

## Hauptprodukt
- **Kernprodukt**: Inspektion/Wartung eines Fahrzeugs als Hauptleistung
- **Umfang**: Service-Planung basiert auf Marke, Modell, Baujahr und Kilometerstand (Pflichtfelder)
- **Preiskalkulation**: Spezifisch nach Marke und Modell - keine pauschalen Fahrzeugklassen
- **Datenerfassung**: Baujahr und Kilometerstand sind Pflichtangaben für präzise Wartungsbedarfsermittlung
- **Differenzierung**: Nicht nach Fahrzeugklassen (Klein/Mittel/Ober/SUV), sondern ausschließlich nach konkretem Fahrzeug

## Deployment-Strategie (Zwei-Phasen-Ansatz)

### Phase 1: Lokale Version (MVP)
- **Ziel**: Schneller Proof of Concept ohne Cloud-Komplexität
- **Deployment**: 100% lokal (Development-Server oder lokales Hosting)
- **Zweck**:
  - Ausführliches Testing aller Features
  - Demo-Fähigkeit für Stakeholder und Investor-Präsentationen
  - Validierung der gesamten Customer Journey
  - Kostenoptimiert für initiale Entwicklung
- **Tech-Stack**: Lokale Datenbank (PostgreSQL), lokaler Server
- **Zugriff**: LAN/VPN oder lokales Netzwerk
- **Demo-Anforderung**: Drei separate Login-Bereiche (Kunde, Jockey, Werkstatt) für vollständige Journey-Demonstration

### Phase 2: Azure Cloud Migration (Post-MVP)
- **Ziel**: Skalierbare, produktionsreife Infrastruktur
- **Deployment**: Azure Cloud Services
- **Vorteile**:
  - Skalierbarkeit für Multi-Werkstatt-Betrieb
  - Hochverfügbarkeit (99.9% SLA)
  - Automatische Backups und Disaster Recovery
  - Globale Verfügbarkeit für deutschlandweite Expansion
  - Azure-native Services (App Service, SQL Database, Storage)
- **Migration**: Refactoring von lokaler Version zu Azure-nativen Services
- **Zeitpunkt**: Nach erfolgreicher MVP-Validierung in Witten (Sprint 6+)
