# Jockey Portal Wireframes - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Ready for Development

---

## Design Rationale

### User Needs

**Primary Users**: Jockeys/Fahrer die Fahrzeuge abholen und zurückbringen

**Core Tasks**:
1. Heutige Abholungen/Rückgaben sehen
2. Kundeninformationen abrufen (Adresse, Telefon)
3. Übergabeprotokoll digital erfassen
4. Fotos vom Fahrzeugzustand machen
5. Status-Updates an System senden

**Context of Use**:
- Primär mobil genutzt (Smartphone im Auto)
- Eine Hand frei (andere Hand am Lenkrad/beim Kunden)
- Oft outdoor (Sonnenlicht → hoher Kontrast nötig)
- Schneller Zugriff wichtig (keine Zeit für lange Formulare)

### Business Goals

- Effizienz maximieren (mehr Touren pro Tag)
- Dokumentation sicherstellen (Haftungsschutz)
- Kundenzufriedenheit erhöhen (professioneller Auftritt)
- Fehler minimieren (falsche Adresse, vergessene Fotos)

---

## Information Architecture

```
Jockey-Portal
├── Login
├── Dashboard
│   ├── Heutige Touren (Default View)
│   ├── Filter: Abholungen / Rückgaben
│   └── Kalenderansicht (optional)
├── Tour-Details
│   ├── Kundeninformationen
│   ├── Fahrzeugdaten
│   ├── Navigation (Google Maps Link)
│   ├── Checkliste
│   └── Fotos hochladen
├── Übergabeprotokoll
│   ├── Formular
│   ├── Unterschrift (optional Post-MVP)
│   └── Bestätigung
└── Profil
    ├── Persönliche Daten
    └── Logout
```

---

## 1. Login Screen

### Wireframe - Mobile (Primary Device)

```
┌─────────────────────────┐
│                         │
│      [🚗 Logo]          │
│                         │
│    Jockey-Portal        │
│                         │
│                         │
│  Benutzername           │
│  ┌─────────────────────┐│
│  │ fahrer@beispiel.de  ││
│  └─────────────────────┘│
│                         │
│  Passwort               │
│  ┌─────────────────────┐│
│  │ ••••••••            ││
│  └─────────────────────┘│
│                         │
│  [ ] Angemeldet bleiben │
│                         │
│  [Login →]              │
│                         │
│  Passwort vergessen?    │
│                         │
│                         │
│  ─────────────────────  │
│                         │
│  Noch kein Zugang?      │
│  Kontaktieren Sie Ihren │
│  Administrator.         │
│                         │
└─────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState } from 'react'
import { TruckIcon } from '@heroicons/react/24/outline'

export default function JockeyLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Login logic
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="
            w-20 h-20
            mx-auto mb-4
            bg-primary-600
            rounded-full
            flex items-center justify-center
          ">
            <TruckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Jockey-Portal
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Für Fahrer und Concierge-Team
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Benutzername
              </label>
              <input
                type="text"
                id="username"
                required
                className="
                  w-full
                  px-4 py-3
                  text-base
                  border-2 border-neutral-300
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
                placeholder="fahrer@beispiel.de"
                value={credentials.username}
                onChange={(e) => setCredentials({
                  ...credentials,
                  username: e.target.value
                })}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Passwort
              </label>
              <input
                type="password"
                id="password"
                required
                className="
                  w-full
                  px-4 py-3
                  text-base
                  border-2 border-neutral-300
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value
                })}
              />
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="
                  w-5 h-5
                  text-primary-600
                  border-neutral-300
                  rounded
                  focus:ring-2 focus:ring-primary-500
                "
              />
              <span className="text-sm text-neutral-700">
                Angemeldet bleiben
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                px-6 py-3
                text-base font-semibold
                text-white
                bg-primary-600
                rounded-lg
                hover:bg-primary-700
                disabled:opacity-50
                transition-colors duration-200
              "
            >
              {loading ? 'Wird geladen...' : 'Login →'}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-primary-600 hover:underline"
              >
                Passwort vergessen?
              </a>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="
          mt-6
          text-center
          text-sm text-neutral-600
        ">
          <p className="mb-1">Noch kein Zugang?</p>
          <p>Kontaktieren Sie Ihren Administrator.</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 2. Dashboard - Heutige Touren

### Wireframe - Mobile

```
┌─────────────────────────┐
│ [☰]  Heutige Touren  [👤]│
└─────────────────────────┘

┌─────────────────────────┐
│ Guten Morgen, Max! 👋   │
│                         │
│ Heute: 6 Touren         │
│ 3 Abholungen | 3 Rück. │
└─────────────────────────┘

┌─────────────────────────┐
│ [Abholungen] [Rückgaben]│
└─────────────────────────┘

╔═════════════════════════╗
║   NÄCHSTE TOUR          ║
╠═════════════════════════╣
║ ┌─────────────────────┐ ║
║ │ 🟢 Offen            │ ║
║ │                     │ ║
║ │ #B2C-2026-0001      │ ║
║ │                     │ ║
║ │ 📅 08:00 - 10:00    │ ║
║ │ 🚗 VW Golf 7        │ ║
║ │ 👤 Max Mustermann   │ ║
║ │ 📍 Musterstr. 123   │ ║
║ │    58453 Witten     │ ║
║ │                     │ ║
║ │ [Details →]         │ ║
║ └─────────────────────┘ ║
╚═════════════════════════╝

┌─────────────────────────┐
│  WEITERE TOUREN         │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🟡 In Bearbeitung   │ │
│ │ #B2C-2026-0002      │ │
│ │ 10:00-12:00         │ │
│ │ VW Passat           │ │
│ │ Anna Schmidt        │ │
│ │ [Details →]         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 🟢 Offen            │ │
│ │ #B2C-2026-0003      │ │
│ │ 14:00-16:00         │ │
│ │ BMW 3er             │ │
│ │ Peter Müller        │ │
│ │ [Details →]         │ │
│ └─────────────────────┘ │
└─────────────────────────┘

┌─────────────────────────┐
│ ℹ️ Tipp: Tippen Sie auf │
│ "Details" für Navigation│
│ und Checkliste.         │
└─────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState } from 'react'
import { MapPinIcon, UserIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Tour {
  id: string
  bookingNumber: string
  status: 'open' | 'in_progress' | 'completed'
  type: 'pickup' | 'return'
  timeSlot: string
  customer: {
    name: string
    phone: string
    address: {
      street: string
      zip: string
      city: string
    }
  }
  vehicle: {
    brand: string
    model: string
    licensePlate?: string
  }
}

export default function JockeyDashboard() {
  const [activeTab, setActiveTab] = useState<'pickup' | 'return'>('pickup')

  const tours: Tour[] = [
    {
      id: '1',
      bookingNumber: 'B2C-2026-0001',
      status: 'open',
      type: 'pickup',
      timeSlot: '08:00 - 10:00',
      customer: {
        name: 'Max Mustermann',
        phone: '+49 123 456789',
        address: {
          street: 'Musterstraße 123',
          zip: '58453',
          city: 'Witten'
        }
      },
      vehicle: {
        brand: 'VW',
        model: 'Golf 7'
      }
    },
    // ... more tours
  ]

  const filteredTours = tours.filter(tour => tour.type === activeTab)

  const getStatusBadge = (status: Tour['status']) => {
    const styles = {
      open: 'bg-success-100 text-success-700',
      in_progress: 'bg-warning-100 text-warning-700',
      completed: 'bg-neutral-100 text-neutral-700'
    }

    const labels = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen'
    }

    const icons = {
      open: '🟢',
      in_progress: '🟡',
      completed: '✅'
    }

    return (
      <span className={`
        inline-flex items-center gap-1
        px-3 py-1
        text-xs font-medium
        rounded-full
        ${styles[status]}
      `}>
        <span>{icons[status]}</span>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="
        bg-white
        border-b border-neutral-200
        px-4 py-3
        flex items-center justify-between
        sticky top-0 z-10
      ">
        <button className="w-10 h-10">
          {/* Menu icon */}
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">
          Heutige Touren
        </h1>
        <button className="w-10 h-10">
          {/* Profile icon */}
        </button>
      </header>

      {/* Welcome Card */}
      <div className="bg-primary-600 text-white px-4 py-6">
        <h2 className="text-2xl font-bold mb-2">
          Guten Morgen, Max! 👋
        </h2>
        <p className="text-primary-100 mb-4">
          Heute: {tours.length} Touren
        </p>
        <div className="flex gap-4 text-sm">
          <div>
            {tours.filter(t => t.type === 'pickup').length} Abholungen
          </div>
          <div>|</div>
          <div>
            {tours.filter(t => t.type === 'return').length} Rückgaben
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="
        bg-white
        border-b border-neutral-200
        px-4
        flex gap-2
      ">
        <button
          onClick={() => setActiveTab('pickup')}
          className={`
            flex-1
            py-3
            text-sm font-medium
            border-b-2
            transition-colors duration-200
            ${activeTab === 'pickup'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600'
            }
          `}
        >
          Abholungen ({tours.filter(t => t.type === 'pickup').length})
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`
            flex-1
            py-3
            text-sm font-medium
            border-b-2
            transition-colors duration-200
            ${activeTab === 'return'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600'
            }
          `}
        >
          Rückgaben ({tours.filter(t => t.type === 'return').length})
        </button>
      </div>

      {/* Tours List */}
      <div className="p-4 space-y-4">
        {filteredTours.length > 0 ? (
          <>
            {/* Next Tour - Highlighted */}
            <div className="
              bg-gradient-to-br from-primary-50 to-primary-100
              border-2 border-primary-300
              rounded-xl
              p-4
              shadow-sm
            ">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary-800 uppercase">
                  Nächste Tour
                </span>
                {getStatusBadge(filteredTours[0].status)}
              </div>

              <p className="text-sm text-neutral-600 mb-3">
                {filteredTours[0].bookingNumber}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-neutral-900">
                  <ClockIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{filteredTours[0].timeSlot}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-900">
                  <TruckIcon className="w-5 h-5 text-primary-600" />
                  <span>{filteredTours[0].vehicle.brand} {filteredTours[0].vehicle.model}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-900">
                  <UserIcon className="w-5 h-5 text-primary-600" />
                  <span>{filteredTours[0].customer.name}</span>
                </div>

                <div className="flex items-start gap-2 text-neutral-900">
                  <MapPinIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div>{filteredTours[0].customer.address.street}</div>
                    <div>{filteredTours[0].customer.address.zip} {filteredTours[0].customer.address.city}</div>
                  </div>
                </div>
              </div>

              <button className="
                w-full
                px-4 py-3
                text-base font-semibold
                text-white
                bg-primary-600
                rounded-lg
                hover:bg-primary-700
                transition-colors duration-200
              ">
                Details ansehen →
              </button>
            </div>

            {/* Other Tours */}
            {filteredTours.slice(1).map(tour => (
              <div
                key={tour.id}
                className="
                  bg-white
                  border border-neutral-200
                  rounded-xl
                  p-4
                  hover:shadow-md
                  transition-shadow duration-200
                "
              >
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(tour.status)}
                  <span className="text-xs text-neutral-500">
                    {tour.bookingNumber}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-900 font-medium">{tour.timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TruckIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">{tour.vehicle.brand} {tour.vehicle.model}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">{tour.customer.name}</span>
                  </div>
                </div>

                <button className="
                  w-full
                  px-4 py-2
                  text-sm font-medium
                  text-primary-700
                  bg-primary-50
                  border border-primary-200
                  rounded-lg
                  hover:bg-primary-100
                  transition-colors duration-200
                ">
                  Details ansehen →
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="
            text-center
            py-12
            text-neutral-500
          ">
            <p>Keine {activeTab === 'pickup' ? 'Abholungen' : 'Rückgaben'} für heute</p>
          </div>
        )}
      </div>

      {/* Info Tip */}
      <div className="
        mx-4 mb-4
        bg-info-50
        border border-info-200
        rounded-lg
        p-4
      ">
        <p className="text-sm text-info-700">
          <strong>ℹ️ Tipp:</strong> Tippen Sie auf "Details" für Navigation und Checkliste.
        </p>
      </div>
    </div>
  )
}
```

---

## 3. Tour-Details & Checkliste

### Wireframe - Mobile

```
┌─────────────────────────┐
│ [<] Tour-Details    [📱]│
└─────────────────────────┘

┌─────────────────────────┐
│ #B2C-2026-0001          │
│ 🟢 Offen                │
└─────────────────────────┘

╔═════════════════════════╗
║   KUNDENINFORMATIONEN   ║
╠═════════════════════════╣
║ 👤 Max Mustermann       ║
║                         ║
║ 📍 Musterstraße 123     ║
║    58453 Witten         ║
║                         ║
║ [📍 In Google Maps      ║
║     öffnen]             ║
║                         ║
║ 📞 +49 123 456789       ║
║ [📞 Anrufen]            ║
╚═════════════════════════╝

╔═════════════════════════╗
║   FAHRZEUG              ║
╠═════════════════════════╣
║ 🚗 VW Golf 7            ║
║ Baujahr: 2015           ║
║ Kilometerstand: 75.000  ║
║                         ║
║ Service: Inspektion     ║
╚═════════════════════════╝

╔═════════════════════════╗
║   ZEITFENSTER           ║
╠═════════════════════════╣
║ 📅 Do, 06.02.2026       ║
║ 🕐 08:00 - 10:00 Uhr    ║
╚═════════════════════════╝

┌─────────────────────────┐
│   ÜBERGABE-CHECKLISTE   │
├─────────────────────────┤
│ [ ] Fahrzeug begutachtet│
│ [ ] Fotos gemacht       │
│ [ ] Fahrzeugschein      │
│     fotografiert        │
│ [ ] Kilometerstand      │
│     notiert             │
│ [ ] Zusätzliche         │
│     Anmerkungen erfasst │
│ [ ] Ersatzfahrzeug      │
│     übergeben           │
└─────────────────────────┘

┌─────────────────────────┐
│ [Status: Tour gestartet]│
│ [Fotos hochladen]       │
│ [Übergabe abschließen]  │
└─────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState } from 'react'
import {
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  CameraIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export default function TourDetails() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Fahrzeug begutachtet', completed: false },
    { id: '2', label: 'Fotos gemacht', completed: false },
    { id: '3', label: 'Fahrzeugschein fotografiert', completed: false },
    { id: '4', label: 'Kilometerstand notiert', completed: false },
    { id: '5', label: 'Zusätzliche Anmerkungen erfasst', completed: false },
    { id: '6', label: 'Ersatzfahrzeug übergeben', completed: false }
  ])

  const [status, setStatus] = useState<'open' | 'in_progress' | 'completed'>('open')

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completionPercentage = Math.round(
    (checklist.filter(item => item.completed).length / checklist.length) * 100
  )

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="
        bg-white
        border-b border-neutral-200
        px-4 py-3
        flex items-center justify-between
        sticky top-0 z-10
      ">
        <button className="text-primary-600">
          ← Zurück
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">
          Tour-Details
        </h1>
        <button>
          📱
        </button>
      </header>

      {/* Booking Info */}
      <div className="bg-primary-50 px-4 py-4 border-b border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">#B2C-2026-0001</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="
                inline-flex items-center gap-1
                px-2 py-1
                text-xs font-medium
                text-success-700
                bg-success-100
                rounded-full
              ">
                🟢 Offen
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-600">Fortschritt</p>
            <p className="text-2xl font-bold text-primary-600">
              {completionPercentage}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Kundeninformationen
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-neutral-400" />
              <span className="text-neutral-900">Max Mustermann</span>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div className="text-neutral-900">
                <div>Musterstraße 123</div>
                <div>58453 Witten</div>
              </div>
            </div>

            <button className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-3
              text-base font-medium
              text-white
              bg-primary-600
              rounded-lg
              hover:bg-primary-700
            ">
              <MapPinIcon className="w-5 h-5" />
              In Google Maps öffnen
            </button>

            <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
              <PhoneIcon className="w-5 h-5 text-neutral-400" />
              <span className="text-neutral-900">+49 123 456789</span>
            </div>

            <a
              href="tel:+49123456789"
              className="
                w-full
                flex items-center justify-center gap-2
                px-4 py-3
                text-base font-medium
                text-primary-700
                bg-primary-50
                border border-primary-200
                rounded-lg
                hover:bg-primary-100
              "
            >
              <PhoneIcon className="w-5 h-5" />
              Anrufen
            </a>
          </div>
        </div>

        {/* Vehicle Info Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Fahrzeug
          </h2>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TruckIcon className="w-5 h-5 text-neutral-400" />
              <span className="font-medium text-neutral-900">
                VW Golf 7
              </span>
            </div>

            <div className="text-sm text-neutral-600 ml-8">
              <div>Baujahr: 2015</div>
              <div>Kilometerstand: 75.000 km</div>
              <div className="mt-2 pt-2 border-t border-neutral-100">
                Service: Inspektion / Wartung
              </div>
            </div>
          </div>
        </div>

        {/* Timeslot Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Zeitfenster
          </h2>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <span className="text-neutral-900">Do, 06.02.2026</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <span className="font-medium text-neutral-900">
                08:00 - 10:00 Uhr
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Übergabe-Checkliste
          </h2>

          <div className="space-y-3">
            {checklist.map(item => (
              <label
                key={item.id}
                className="
                  flex items-start gap-3
                  cursor-pointer
                  group
                "
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="
                    w-6 h-6 mt-0.5
                    text-success-600
                    border-2 border-neutral-300
                    rounded
                    focus:ring-2 focus:ring-primary-500
                  "
                />
                <span className={`
                  text-base
                  ${item.completed
                    ? 'text-neutral-500 line-through'
                    : 'text-neutral-900 group-hover:text-neutral-600'
                  }
                `}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="
        fixed bottom-0 left-0 right-0
        bg-white
        border-t border-neutral-200
        p-4
        space-y-3
        shadow-lg
      ">
        {status === 'open' && (
          <button
            onClick={() => setStatus('in_progress')}
            className="
              w-full
              px-6 py-3
              text-base font-semibold
              text-white
              bg-primary-600
              rounded-lg
              hover:bg-primary-700
            "
          >
            Tour starten
          </button>
        )}

        {status === 'in_progress' && (
          <>
            <button className="
              w-full
              flex items-center justify-center gap-2
              px-6 py-3
              text-base font-semibold
              text-primary-700
              bg-primary-50
              border border-primary-200
              rounded-lg
              hover:bg-primary-100
            ">
              <CameraIcon className="w-5 h-5" />
              Fotos hochladen
            </button>

            <button
              disabled={completionPercentage < 100}
              className="
                w-full
                px-6 py-3
                text-base font-semibold
                text-white
                bg-success-600
                rounded-lg
                hover:bg-success-700
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {completionPercentage < 100
                ? `Checkliste vervollständigen (${completionPercentage}%)`
                : 'Übergabe abschließen ✓'
              }
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 4. Foto-Upload

### Wireframe

```
┌─────────────────────────┐
│ [<] Fotos hochladen     │
└─────────────────────────┘

┌─────────────────────────┐
│ Tour: #B2C-2026-0001    │
│ VW Golf 7               │
└─────────────────────────┘

╔═════════════════════════╗
║   FAHRZEUGZUSTAND       ║
║   DOKUMENTIEREN         ║
╠═════════════════════════╣
║                         ║
║ Bitte fotografieren Sie:║
║                         ║
║ ✓ Vorne                 ║
║ ✓ Hinten                ║
║ ✓ Links                 ║
║ ✓ Rechts                ║
║ ✓ Innenraum             ║
║ ✓ Kilometerstand        ║
║ ✓ Besondere Schäden     ║
║                         ║
╚═════════════════════════╝

┌─────────────────────────┐
│   HOCHGELADENE FOTOS    │
├─────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐  │
│ │Foto│ │Foto│ │Foto│  │
│ │ 1  │ │ 2  │ │ 3  │  │
│ │[X] │ │[X] │ │[X] │  │
│ └────┘ └────┘ └────┘  │
│                         │
│ ┌────┐ ┌────┐ ┌────┐  │
│ │Foto│ │Foto│ │    │  │
│ │ 4  │ │ 5  │ │    │  │
│ │[X] │ │[X] │ │    │  │
│ └────┘ └────┘ └────┘  │
│                         │
│ [📷 Weitere Fotos      │
│     aufnehmen]          │
└─────────────────────────┘

┌─────────────────────────┐
│ Besondere Anmerkungen:  │
│ ┌─────────────────────┐ │
│ │ Steinschlag vorne    │ │
│ │ links, Kratzer      │ │
│ │ Beifahrertür        │ │
│ └─────────────────────┘ │
└─────────────────────────┘

┌─────────────────────────┐
│ [Fotos speichern]       │
└─────────────────────────┘
```

### Component Specification

```tsx
'use client'

import { useState, useRef } from 'react'
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  file: File
}

export default function PhotoUpload() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPhotos: Photo[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file
    }))

    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) URL.revokeObjectURL(photo.url)
      return prev.filter(p => p.id !== id)
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="
        bg-white
        border-b border-neutral-200
        px-4 py-3
        flex items-center
        sticky top-0 z-10
      ">
        <button className="text-primary-600 mr-4">
          ← Zurück
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">
          Fotos hochladen
        </h1>
      </header>

      {/* Tour Info */}
      <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
        <p className="text-sm text-neutral-600">#B2C-2026-0001</p>
        <p className="text-base font-medium text-neutral-900">VW Golf 7</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Instructions */}
        <div className="bg-info-50 border border-info-200 rounded-xl p-4">
          <h2 className="text-base font-semibold text-info-900 mb-3">
            Fahrzeugzustand dokumentieren
          </h2>

          <p className="text-sm text-info-800 mb-3">
            Bitte fotografieren Sie:
          </p>

          <ul className="space-y-1 text-sm text-info-700">
            <li>✓ Vorne</li>
            <li>✓ Hinten</li>
            <li>✓ Links</li>
            <li>✓ Rechts</li>
            <li>✓ Innenraum</li>
            <li>✓ Kilometerstand</li>
            <li>✓ Besondere Schäden (falls vorhanden)</li>
          </ul>
        </div>

        {/* Photo Grid */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Hochgeladene Fotos ({photos.length})
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt="Fahrzeugfoto"
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="
                    absolute top-1 right-1
                    w-6 h-6
                    bg-error-600
                    text-white
                    rounded-full
                    flex items-center justify-center
                    hover:bg-error-700
                  "
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="
                aspect-square
                border-2 border-dashed border-neutral-300
                rounded-lg
                flex flex-col items-center justify-center
                gap-2
                hover:border-primary-400
                hover:bg-primary-50
                transition-colors duration-200
              "
            >
              <CameraIcon className="w-8 h-8 text-neutral-400" />
              <span className="text-xs text-neutral-600">
                Foto aufnehmen
              </span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handlePhotoCapture}
            className="hidden"
          />

          {/* Large Add Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="
              w-full
              flex items-center justify-center gap-2
              px-6 py-4
              text-base font-medium
              text-primary-700
              bg-primary-50
              border-2 border-primary-200 border-dashed
              rounded-lg
              hover:bg-primary-100
            "
          >
            <CameraIcon className="w-6 h-6" />
            Weitere Fotos aufnehmen
          </button>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Besondere Anmerkungen (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="z.B. Steinschlag vorne links, Kratzer Beifahrertür..."
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
      </div>

      {/* Fixed Bottom Button */}
      <div className="
        fixed bottom-0 left-0 right-0
        bg-white
        border-t border-neutral-200
        p-4
        shadow-lg
      ">
        <button
          disabled={photos.length === 0}
          className="
            w-full
            px-6 py-4
            text-base font-semibold
            text-white
            bg-primary-600
            rounded-lg
            hover:bg-primary-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {photos.length === 0
            ? 'Bitte Fotos aufnehmen'
            : `${photos.length} ${photos.length === 1 ? 'Foto' : 'Fotos'} speichern`
          }
        </button>
      </div>
    </div>
  )
}
```

---

## Key Features Summary

### Mobile-Optimized Design

1. **Large Touch Targets**: All buttons minimum 44x44px
2. **One-Handed Use**: Bottom navigation, sticky headers
3. **Camera Integration**: Native camera access for photos
4. **Phone Integration**: Direct call links to customers
5. **Maps Integration**: Google Maps deep-linking

### Offline Capability (Future)

- Cache tour data locally
- Queue photo uploads
- Sync when online again

### Performance

- Lazy load images
- Optimize photo uploads (compress before upload)
- Progressive Web App (PWA) for installation

---

**Version History:**

- 1.0 (2026-02-01): Complete Jockey Portal Wireframes
