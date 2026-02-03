# Werkstatt-Portal Wireframes - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready for Development

---

## Design Rationale

### User Needs

**Primary Users**: Werkstatt-Mitarbeiter (Mechaniker, Meister, Service-Berater)

**Core Tasks**:
1. Aktuelle Aufträge einsehen
2. Fahrzeugdaten und Serviceumfang verstehen
3. Auftragserweiterungen erstellen (Mangelbeschreibung + Fotos + Preis)
4. Status-Updates senden
5. Freigegebene/Abgelehnte Angebote tracken

**Context of Use**:
- Primär Tablet/Desktop in der Werkstatt
- Touch-optimiert (ölige/schmutzige Hände)
- Schneller Workflow (zwischen Fahrzeugen wechseln)
- Foto-Upload vom Smartphone oder Tablet

### Business Goals

- Effizienz steigern (weniger Telefonate mit Kunden)
- Transparenz schaffen (digitale Angebote statt mündlich)
- Upselling ermöglichen (strukturierte Auftragserweiterungen)
- Kundenzufriedenheit erhöhen (klare Kommunikation mit Fotos)

---

## Information Architecture

```
Werkstatt-Portal
├── Login
├── Dashboard
│   ├── Offene Aufträge (Default)
│   ├── Filter: Status, Service-Typ
│   └── Suche: Kennzeichen, Buchungsnummer
├── Auftrags-Details
│   ├── Fahrzeugdaten
│   ├── Gebuchter Service
│   ├── Kundeninformationen
│   ├── Übergabeprotokoll vom Jockey
│   └── Fotos vom Jockey
├── Auftragserweiterung erstellen
│   ├── Mangelbeschreibung
│   ├── Fotos hochladen
│   ├── Festpreis kalkulieren
│   └── An Kunde senden
├── Angebots-Tracking
│   ├── Offene Angebote
│   ├── Freigegebene Angebote
│   └── Abgelehnte Angebote
└── Profil
    ├── Werkstatt-Einstellungen
    └── Logout
```

---

## 1. Login Screen

### Wireframe - Desktop (1024px+)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│                        [🔧 Logo]                              │
│                                                               │
│                   Werkstatt-Portal                            │
│                                                               │
│                                                               │
│              ┌────────────────────────────┐                  │
│              │                            │                  │
│              │  Benutzername              │                  │
│              │  ┌──────────────────────┐  │                  │
│              │  │ werkstatt@witten.de  │  │                  │
│              │  └──────────────────────┘  │                  │
│              │                            │                  │
│              │  Passwort                  │                  │
│              │  ┌──────────────────────┐  │                  │
│              │  │ ••••••••             │  │                  │
│              │  └──────────────────────┘  │                  │
│              │                            │                  │
│              │  [ ] Angemeldet bleiben    │                  │
│              │                            │                  │
│              │  [Login →]                 │                  │
│              │                            │                  │
│              │  Passwort vergessen?       │                  │
│              │                            │                  │
│              └────────────────────────────┘                  │
│                                                               │
│                   © 2026 B2C Auto                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard - Offene Aufträge

### Wireframe - Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Werkstatt-Portal        Witten  [👤 Admin ▼] [Logout]│
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║                    Offene Aufträge                           ║
╚══════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│ [Alle Aufträge ▼]  [Suche: Kennzeichen/Nr...]  [Filter]     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  STATUS-ÜBERSICHT                                            │
├──────────────┬──────────────┬──────────────┬────────────────┤
│              │              │              │                │
│  🟡 Wartend  │  🔵 Arbeit   │  🟢 Fertig   │  📋 Angebote   │
│     3        │     2        │     1        │     2 offen    │
│              │              │              │                │
└──────────────┴──────────────┴──────────────┴────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  AUFTRAGS-LISTE                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🟡] Annahme ausstehend        #B2C-2026-0001         │ │
│  │                                                         │ │
│  │  VW Golf 7, 2015 | 75.000 km           Heute, 08:00   │ │
│  │  Inspektion / Wartung                                  │ │
│  │                                                         │ │
│  │  Kunde: Max Mustermann                                 │ │
│  │  Jockey: Noch nicht abgeholt                           │ │
│  │                                                         │ │
│  │  [Details ansehen]  [Annahme bestätigen]               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🔵] In Arbeit                 #B2C-2026-0002         │ │
│  │                                                         │ │
│  │  VW Passat, 2018 | 120.000 km          Gestern        │ │
│  │  Inspektion / Wartung + TÜV                            │ │
│  │                                                         │ │
│  │  Kunde: Anna Schmidt                                   │ │
│  │  Zusätzliche Arbeiten: 1 Angebot offen                │ │
│  │                                                         │ │
│  │  [Details ansehen]  [Status aktualisieren]             │ │
│  │  [Auftragserweiterung erstellen]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [🟢] Fertiggestellt            #B2C-2026-0003         │ │
│  │                                                         │ │
│  │  BMW 3er, 2020 | 45.000 km              Gestern       │ │
│  │  Bremsservice                                          │ │
│  │                                                         │ │
│  │  Kunde: Peter Müller                                   │ │
│  │  Rückgabe: Heute, 16:00-18:00                          │ │
│  │                                                         │ │
│  │  [Details ansehen]  [Auftrag abschließen]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe - Tablet (768px)

```
┌─────────────────────────────────────────┐
│ [☰] Werkstatt-Portal      [👤▼] [Logout]│
└─────────────────────────────────────────┘

╔═════════════════════════════════════════╗
║         Offene Aufträge                 ║
╚═════════════════════════════════════════╝

┌─────────────────────────────────────────┐
│ [Alle ▼]  [🔍 Suche...]      [Filter]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  STATUS-ÜBERSICHT                       │
├──────────┬──────────┬──────────┬────────┤
│ 🟡       │ 🔵       │ 🟢       │ 📋     │
│ Wartend  │ Arbeit   │ Fertig   │ Ange.  │
│    3     │    2     │    1     │   2    │
└──────────┴──────────┴──────────┴────────┘

┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ 🟡 Annahme   #B2C-2026-0001       │ │
│  │                                   │ │
│  │ VW Golf 7, 2015                   │ │
│  │ Inspektion/Wartung                │ │
│  │                                   │ │
│  │ Max Mustermann                    │ │
│  │ Heute, 08:00                      │ │
│  │                                   │ │
│  │ [Details] [Annehmen]              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔵 In Arbeit  #B2C-2026-0002      │ │
│  │                                   │ │
│  │ VW Passat, 2018                   │ │
│  │ Inspektion + TÜV                  │ │
│  │                                   │ │
│  │ Anna Schmidt                      │ │
│  │ 1 Angebot offen                   │ │
│  │                                   │ │
│  │ [Details] [Angebot +]             │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TruckIcon,
  WrenchIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  bookingNumber: string
  status: 'pending' | 'in_progress' | 'completed'
  vehicle: {
    brand: string
    model: string
    year: number
    mileage: number
    licensePlate?: string
  }
  service: string
  customer: {
    name: string
  }
  jockeyStatus: string
  scheduledDate: string
  additionalOffers?: number
}

export default function WorkshopDashboard() {
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const orders: Order[] = [
    {
      id: '1',
      bookingNumber: 'B2C-2026-0001',
      status: 'pending',
      vehicle: {
        brand: 'VW',
        model: 'Golf 7',
        year: 2015,
        mileage: 75000
      },
      service: 'Inspektion / Wartung',
      customer: {
        name: 'Max Mustermann'
      },
      jockeyStatus: 'Noch nicht abgeholt',
      scheduledDate: 'Heute, 08:00'
    },
    {
      id: '2',
      bookingNumber: 'B2C-2026-0002',
      status: 'in_progress',
      vehicle: {
        brand: 'VW',
        model: 'Passat',
        year: 2018,
        mileage: 120000
      },
      service: 'Inspektion / Wartung + TÜV',
      customer: {
        name: 'Anna Schmidt'
      },
      jockeyStatus: 'Abgeholt',
      scheduledDate: 'Gestern',
      additionalOffers: 1
    },
    // ... more orders
  ]

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: {
        bg: 'bg-warning-100',
        text: 'text-warning-700',
        icon: '🟡',
        label: 'Annahme ausstehend'
      },
      in_progress: {
        bg: 'bg-primary-100',
        text: 'text-primary-700',
        icon: '🔵',
        label: 'In Arbeit'
      },
      completed: {
        bg: 'bg-success-100',
        text: 'text-success-700',
        icon: '🟢',
        label: 'Fertiggestellt'
      }
    }

    const config = styles[status]

    return (
      <span className={`
        inline-flex items-center gap-2
        px-3 py-1
        text-sm font-medium
        rounded-full
        ${config.bg} ${config.text}
      `}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length,
    offers: orders.reduce((sum, o) => sum + (o.additionalOffers || 0), 0)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="
        bg-white
        border-b border-neutral-200
        px-6 py-4
        flex items-center justify-between
      ">
        <div className="flex items-center gap-4">
          <div className="
            w-10 h-10
            bg-primary-600
            rounded-lg
            flex items-center justify-center
          ">
            <WrenchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Werkstatt-Portal
            </h1>
            <p className="text-sm text-neutral-600">
              Werkstatt Witten
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="
            px-4 py-2
            text-sm font-medium
            text-neutral-700
            hover:bg-neutral-100
            rounded-lg
          ">
            👤 Admin ▼
          </button>
          <button className="
            px-4 py-2
            text-sm font-medium
            text-neutral-700
            hover:bg-neutral-100
            rounded-lg
          ">
            Logout
          </button>
        </div>
      </header>

      {/* Page Header */}
      <div className="px-6 py-6">
        <h2 className="text-3xl font-bold text-neutral-900">
          Offene Aufträge
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="px-6 mb-6">
        <div className="
          flex flex-col md:flex-row gap-4
        ">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="
              absolute left-4 top-1/2 -translate-y-1/2
              w-5 h-5 text-neutral-400
            "/>
            <input
              type="text"
              placeholder="Suche: Kennzeichen, Buchungsnummer, Kunde..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                pl-12 pr-4 py-3
                text-base
                border-2 border-neutral-300
                rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>

          <button className="
            flex items-center justify-center gap-2
            px-6 py-3
            text-base font-medium
            text-neutral-700
            bg-white
            border-2 border-neutral-300
            rounded-lg
            hover:bg-neutral-50
          ">
            <FunnelIcon className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="px-6 mb-6">
        <div className="
          grid
          grid-cols-2 gap-4
          md:grid-cols-4
        ">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`
              bg-white
              border-2
              rounded-xl
              p-4
              text-center
              transition-all duration-200
              ${statusFilter === 'pending'
                ? 'border-warning-400 bg-warning-50'
                : 'border-neutral-200 hover:border-neutral-300'
              }
            `}
          >
            <div className="text-3xl mb-2">🟡</div>
            <div className="text-sm text-neutral-600 mb-1">Wartend</div>
            <div className="text-2xl font-bold text-neutral-900">
              {statusCounts.pending}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`
              bg-white
              border-2
              rounded-xl
              p-4
              text-center
              transition-all duration-200
              ${statusFilter === 'in_progress'
                ? 'border-primary-400 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
              }
            `}
          >
            <div className="text-3xl mb-2">🔵</div>
            <div className="text-sm text-neutral-600 mb-1">In Arbeit</div>
            <div className="text-2xl font-bold text-neutral-900">
              {statusCounts.in_progress}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`
              bg-white
              border-2
              rounded-xl
              p-4
              text-center
              transition-all duration-200
              ${statusFilter === 'completed'
                ? 'border-success-400 bg-success-50'
                : 'border-neutral-200 hover:border-neutral-300'
              }
            `}
          >
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-sm text-neutral-600 mb-1">Fertig</div>
            <div className="text-2xl font-bold text-neutral-900">
              {statusCounts.completed}
            </div>
          </button>

          <button className="
            bg-white
            border-2 border-neutral-200
            rounded-xl
            p-4
            text-center
            hover:border-neutral-300
          ">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm text-neutral-600 mb-1">Angebote</div>
            <div className="text-2xl font-bold text-neutral-900">
              {statusCounts.offers} offen
            </div>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 pb-6 space-y-4">
        {orders
          .filter(order => statusFilter === 'all' || order.status === statusFilter)
          .map(order => (
            <div
              key={order.id}
              className="
                bg-white
                border-2 border-neutral-200
                rounded-xl
                p-6
                hover:shadow-md
                transition-shadow duration-200
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(order.status)}
                <span className="text-sm text-neutral-500">
                  {order.bookingNumber}
                </span>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xl font-bold text-neutral-900">
                      {order.vehicle.brand} {order.vehicle.model}, {order.vehicle.year}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {order.vehicle.mileage.toLocaleString('de-DE')} km
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Service:</p>
                    <p className="text-base font-medium text-neutral-900">
                      {order.service}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Kunde:</p>
                    <p className="text-base font-medium text-neutral-900">
                      {order.customer.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Jockey-Status:</p>
                    <p className="text-base text-neutral-700">
                      {order.jockeyStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Termin:</p>
                    <p className="text-base text-neutral-700">
                      {order.scheduledDate}
                    </p>
                  </div>

                  {order.additionalOffers && (
                    <div className="
                      inline-flex items-center gap-2
                      px-3 py-1
                      bg-accent-100
                      text-accent-800
                      text-sm font-medium
                      rounded-full
                    ">
                      📋 {order.additionalOffers} Angebot offen
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="
                flex flex-wrap gap-3
                mt-6
                pt-6
                border-t border-neutral-200
              ">
                <button className="
                  px-4 py-2
                  text-sm font-medium
                  text-primary-700
                  bg-primary-50
                  border border-primary-200
                  rounded-lg
                  hover:bg-primary-100
                ">
                  Details ansehen
                </button>

                {order.status === 'pending' && (
                  <button className="
                    px-4 py-2
                    text-sm font-semibold
                    text-white
                    bg-primary-600
                    rounded-lg
                    hover:bg-primary-700
                  ">
                    Annahme bestätigen
                  </button>
                )}

                {order.status === 'in_progress' && (
                  <>
                    <button className="
                      px-4 py-2
                      text-sm font-medium
                      text-neutral-700
                      bg-neutral-100
                      border border-neutral-300
                      rounded-lg
                      hover:bg-neutral-200
                    ">
                      Status aktualisieren
                    </button>

                    <button className="
                      px-4 py-2
                      text-sm font-semibold
                      text-accent-700
                      bg-accent-100
                      border border-accent-200
                      rounded-lg
                      hover:bg-accent-200
                    ">
                      + Auftragserweiterung erstellen
                    </button>
                  </>
                )}

                {order.status === 'completed' && (
                  <button className="
                    px-4 py-2
                    text-sm font-semibold
                    text-success-700
                    bg-success-100
                    border border-success-200
                    rounded-lg
                    hover:bg-success-200
                  ">
                    Auftrag abschließen
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
```

---

## 3. Auftragserweiterung erstellen

### Wireframe - Desktop/Tablet

```
┌─────────────────────────────────────────────────────────────┐
│ [< Zurück]          Auftragserweiterung erstellen           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Auftrag: #B2C-2026-0002                                     │
│ VW Passat, 2018 | Anna Schmidt                              │
└─────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║               MANGELBESCHREIBUNG                            ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ Was haben Sie festgestellt?                                 ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ Art der Arbeit (Dropdown)                               │ ║
║ │ [ ] Bremsbeläge vorne/hinten                           │ ║
║ │ [ ] Bremsscheiben                                       │ ║
║ │ [ ] Luftfilter                                          │ ║
║ │ [ ] Innenraumfilter                                     │ ║
║ │ [ ] Zündkerzen                                          │ ║
║ │ [ ] Andere (Freitext)                                   │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ Detaillierte Beschreibung *                                 ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ Bremsbeläge vorne stark abgenutzt (2mm Restbelag).     │ ║
║ │ Bremsscheiben ebenfalls verschlissen. Empfehlung:      │ ║
║ │ Kompletter Wechsel Vorderachse.                         │ ║
║ │                                                         │ ║
║ │                                                         │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ Sicherheitshinweis (optional)                               ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ Bei weniger als 3mm Restbelag besteht Unfallgefahr.    │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════╗
║               FOTO-DOKUMENTATION                            ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ Bitte laden Sie Fotos hoch, die den Mangel zeigen:         ║
║                                                             ║
║ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          ║
║ │Foto 1│  │Foto 2│  │Foto 3│  │Foto 4│  │ [+]  │          ║
║ │[Zoom]│  │[Zoom]│  │[Zoom]│  │[Zoom]│  │Foto  │          ║
║ │ [X]  │  │ [X]  │  │ [X]  │  │ [X]  │  │hinzu.│          ║
║ └──────┘  └──────┘  └──────┘  └──────┘  └──────┘          ║
║                                                             ║
║ [📷 Fotos hochladen]  [📱 Vom Smartphone aufnehmen]        ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════╗
║               FESTPREIS KALKULIEREN                         ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║ Materialkosten                                              ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ 180,00 EUR                                              │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ Arbeitszeit (Stunden)                                       ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ 2,5                                                     │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ Stundensatz                                                 ║
║ ┌─────────────────────────────────────────────────────────┐ ║
║ │ 80,00 EUR                                               │ ║
║ └─────────────────────────────────────────────────────────┘ ║
║                                                             ║
║ ─────────────────────────────────────────────────────────  ║
║                                                             ║
║ Zwischensumme (netto): 380,00 EUR                           ║
║ MwSt. (19%):            72,20 EUR                           ║
║                                                             ║
║ ╔═══════════════════════════════════════════════════════╗  ║
║ ║ FESTPREIS (brutto): 452,20 EUR                        ║  ║
║ ╚═══════════════════════════════════════════════════════╝  ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ [ ] Kunde wurde telefonisch vorabinformiert                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          [Entwurf speichern]  [An Kunde senden →]           │
└─────────────────────────────────────────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState } from 'react'
import {
  CameraIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface Photo {
  id: string
  url: string
  file: File
}

export default function CreateAdditionalWork() {
  const [workType, setWorkType] = useState('')
  const [description, setDescription] = useState('')
  const [safetyNote, setSafetyNote] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])

  const [pricing, setPricing] = useState({
    materialCost: '',
    laborHours: '',
    hourlyRate: '80.00'
  })

  const calculateTotal = () => {
    const material = parseFloat(pricing.materialCost) || 0
    const hours = parseFloat(pricing.laborHours) || 0
    const rate = parseFloat(pricing.hourlyRate) || 0

    const subtotal = material + (hours * rate)
    const vat = subtotal * 0.19
    const total = subtotal + vat

    return {
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    }
  }

  const totals = calculateTotal()

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="
        bg-white
        border-b border-neutral-200
        px-6 py-4
        flex items-center
      ">
        <button className="
          text-primary-600
          hover:underline
          mr-4
        ">
          ← Zurück
        </button>
        <h1 className="text-xl font-bold text-neutral-900">
          Auftragserweiterung erstellen
        </h1>
      </header>

      {/* Order Info Bar */}
      <div className="
        bg-primary-50
        border-b border-primary-100
        px-6 py-3
      ">
        <p className="text-sm text-neutral-600">Auftrag: #B2C-2026-0002</p>
        <p className="text-base font-medium text-neutral-900">
          VW Passat, 2018 | Anna Schmidt
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Description Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Mangelbeschreibung
          </h2>

          {/* Work Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Was haben Sie festgestellt?
            </label>
            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="
                w-full
                px-4 py-3
                text-base
                border-2 border-neutral-300
                rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            >
              <option value="">Bitte auswählen...</option>
              <option value="brakes_front">Bremsbeläge vorne</option>
              <option value="brakes_rear">Bremsbeläge hinten</option>
              <option value="brake_discs">Bremsscheiben</option>
              <option value="air_filter">Luftfilter</option>
              <option value="cabin_filter">Innenraumfilter</option>
              <option value="spark_plugs">Zündkerzen</option>
              <option value="other">Andere</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Detaillierte Beschreibung *
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie den Mangel und die empfohlene Arbeit..."
              className="
                w-full
                px-4 py-3
                text-base
                border-2 border-neutral-300
                rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
            />
          </div>

          {/* Safety Note */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sicherheitshinweis (optional)
            </label>
            <textarea
              rows={3}
              value={safetyNote}
              onChange={(e) => setSafetyNote(e.target.value)}
              placeholder="z.B. Sicherheitsrisiko, dringend empfohlen..."
              className="
                w-full
                px-4 py-3
                text-base
                border-2 border-warning-300
                bg-warning-50
                rounded-lg
                focus:outline-none focus:ring-2 focus:ring-warning-500
              "
            />
            <p className="text-xs text-warning-700 mt-1">
              ⚠️ Wird dem Kunden hervorgehoben angezeigt
            </p>
          </div>
        </div>

        {/* Photo Documentation */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Foto-Dokumentation
          </h2>

          <p className="text-sm text-neutral-600 mb-6">
            Bitte laden Sie Fotos hoch, die den Mangel zeigen:
          </p>

          {/* Photo Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.url}
                  alt="Mangel"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(photo.url)
                    setPhotos(prev => prev.filter(p => p.id !== photo.id))
                  }}
                  className="
                    absolute top-1 right-1
                    w-6 h-6
                    bg-error-600
                    text-white
                    rounded-full
                    flex items-center justify-center
                  "
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Photo Button */}
            <button className="
              aspect-square
              border-2 border-dashed border-neutral-300
              rounded-lg
              flex flex-col items-center justify-center
              gap-2
              hover:border-primary-400
              hover:bg-primary-50
            ">
              <CameraIcon className="w-8 h-8 text-neutral-400" />
              <span className="text-xs text-neutral-600">+</span>
            </button>
          </div>

          {/* Upload Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="
              flex-1
              flex items-center justify-center gap-2
              px-6 py-3
              text-base font-medium
              text-primary-700
              bg-primary-50
              border border-primary-200
              rounded-lg
              hover:bg-primary-100
            ">
              <PhotoIcon className="w-5 h-5" />
              Fotos hochladen
            </button>

            <button className="
              flex-1
              flex items-center justify-center gap-2
              px-6 py-3
              text-base font-medium
              text-neutral-700
              bg-neutral-100
              border border-neutral-300
              rounded-lg
              hover:bg-neutral-200
            ">
              <CameraIcon className="w-5 h-5" />
              Vom Smartphone aufnehmen
            </button>
          </div>
        </div>

        {/* Pricing Calculation */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Festpreis kalkulieren
          </h2>

          <div className="space-y-6">
            {/* Material Cost */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Materialkosten (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricing.materialCost}
                onChange={(e) => setPricing({
                  ...pricing,
                  materialCost: e.target.value
                })}
                placeholder="0.00"
                className="
                  w-full
                  px-4 py-3
                  text-base
                  border-2 border-neutral-300
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
              />
            </div>

            {/* Labor Hours */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Arbeitszeit (Stunden)
              </label>
              <input
                type="number"
                step="0.5"
                value={pricing.laborHours}
                onChange={(e) => setPricing({
                  ...pricing,
                  laborHours: e.target.value
                })}
                placeholder="0.0"
                className="
                  w-full
                  px-4 py-3
                  text-base
                  border-2 border-neutral-300
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Stundensatz (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricing.hourlyRate}
                onChange={(e) => setPricing({
                  ...pricing,
                  hourlyRate: e.target.value
                })}
                className="
                  w-full
                  px-4 py-3
                  text-base
                  border-2 border-neutral-300
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
              />
            </div>

            {/* Calculation Summary */}
            <div className="
              border-t border-neutral-200
              pt-6
              space-y-3
            ">
              <div className="flex justify-between text-base text-neutral-700">
                <span>Zwischensumme (netto):</span>
                <span>{totals.subtotal} EUR</span>
              </div>

              <div className="flex justify-between text-base text-neutral-700">
                <span>MwSt. (19%):</span>
                <span>{totals.vat} EUR</span>
              </div>

              <div className="
                border-t-2 border-primary-200
                pt-3
                flex justify-between
                text-2xl font-bold
                text-primary-900
              ">
                <span>FESTPREIS (brutto):</span>
                <span>{totals.total} EUR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notification Checkbox */}
        <label className="
          flex items-start gap-3
          cursor-pointer
          bg-info-50
          border border-info-200
          rounded-lg
          p-4
        ">
          <input
            type="checkbox"
            className="
              w-5 h-5 mt-0.5
              text-primary-600
              border-neutral-300
              rounded
              focus:ring-2 focus:ring-primary-500
            "
          />
          <span className="text-sm text-info-800">
            Kunde wurde telefonisch vorabinformiert
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="
            flex-1
            px-6 py-4
            text-base font-medium
            text-neutral-700
            bg-neutral-100
            border border-neutral-300
            rounded-lg
            hover:bg-neutral-200
          ">
            Entwurf speichern
          </button>

          <button className="
            flex-1
            px-6 py-4
            text-base font-semibold
            text-white
            bg-primary-600
            rounded-lg
            hover:bg-primary-700
          ">
            An Kunde senden →
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Key Features Summary

### Tablet-Optimized Design

1. **Large Touch Targets**: 48x48px minimum for workshop environment
2. **High Contrast**: Readable in bright workshop lighting
3. **Simple Navigation**: Minimal clicks to core functions
4. **Photo Management**: Drag-and-drop, bulk upload
5. **Autosave**: Draft states for interrupted workflows

### Workflow Efficiency

- **Quick Status Updates**: One-click status changes
- **Template Pricing**: Pre-fill common repairs
- **Batch Operations**: Mark multiple orders
- **Search & Filter**: Fast order lookup

---

**Version History:**

- 1.0 (2026-02-01): Complete Werkstatt Portal Wireframes
