# Technical Architecture - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** APPROVED FOR DEVELOPMENT
**Deployment-Strategie:** Zwei-Phasen-Ansatz (Lokal MVP → Azure Cloud Migration)

---

## Executive Summary

Diese technische Architektur beschreibt den Aufbau der B2C Autowartungs-App mit Fokus auf eine **vollständig lokale MVP-Version** für Testing und Demo-Zwecke, mit späterer Migration zu Azure Cloud für Production.

### Kernentscheidungen

| Kategorie | Lokale Version (MVP) | Azure Cloud (Phase 2) | Begründung |
|-----------|---------------------|----------------------|------------|
| **Frontend** | Next.js 14+ (localhost:3000) | Azure Static Web Apps / App Service | React-basiert, SSR-fähig, moderne DX |
| **Backend** | Node.js + Express (localhost:5000) | Azure App Service (Container) | JavaScript Full-Stack, gute Stripe/Odoo-Support |
| **Datenbank** | PostgreSQL (lokal) | Azure Database for PostgreSQL | Bewährte Relation-DB, Azure-kompatibel |
| **Payment** | Stripe Test Mode (CLI Webhooks) | Stripe Production | PCI-DSS compliant, einfache Integration |
| **Storage** | Lokales Filesystem (./uploads) | Azure Blob Storage | Fotos, Dokumente für Auftragserweiterung |
| **Auth** | JWT (lokale Keys) | JWT + Azure AD (optional) | Multi-Portal (Customer/Jockey/Workshop) |
| **Odoo** | Mock/Stub (JSON-Logs) | Echte API-Integration | Buchhaltung erst bei Production nötig |

### Technologie-Rationale

**Warum diese Kombination optimal ist:**

1. **Next.js 14+**:
   - Server Components für Performance
   - App Router für Multi-Portal-Architektur
   - TypeScript für Type-Safety
   - Tailwind CSS + shadcn/ui für schnelles UI-Development

2. **Node.js + Express**:
   - JavaScript Full-Stack (weniger Context-Switching)
   - Große Community für Stripe/Odoo-Integration
   - Einfaches lokales Deployment
   - Azure-kompatibel (Container oder App Service)

3. **PostgreSQL**:
   - Bewährte Relation-DB für Transaktionen
   - ACID-Garantien für Payment-kritische Daten
   - Nahtlose Migration zu Azure Database for PostgreSQL
   - Prisma ORM für Type-Safe DB-Access

4. **Stripe**:
   - Marktführer in Deutschland
   - PCI-DSS Level 1 Compliance
   - Test Mode mit CLI für lokale Webhooks
   - Keine eigene PCI-Compliance nötig

---

## System-Architektur Übersicht

### Phase 1: Lokale MVP-Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOKALES ENTWICKLUNGS-SYSTEM                  │
│                         (localhost)                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND LAYER                        │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Landing Page (localhost:3000)                   │   │   │
│  │  │  - Next.js 14+ (App Router)                      │   │   │
│  │  │  - TypeScript + Tailwind CSS                     │   │   │
│  │  │  - shadcn/ui Components                          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Customer  │  │   Jockey    │  │  Workshop   │     │   │
│  │  │   Portal    │  │   Portal    │  │   Portal    │     │   │
│  │  │ (/customer) │  │  (/jockey)  │  │ (/workshop) │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼ (REST API)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     BACKEND LAYER                        │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  API Server (localhost:5000)                     │   │   │
│  │  │  - Node.js + Express                             │   │   │
│  │  │  - TypeScript                                    │   │   │
│  │  │  - JWT Authentication                            │   │   │
│  │  │  - Prisma ORM                                    │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Booking   │  │  Payment   │  │   Auth     │        │   │
│  │  │  Service   │  │  Service   │  │  Service   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Slot     │  │  Vehicle   │  │  Workshop  │        │   │
│  │  │ Management │  │  Service   │  │  Service   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   PERSISTENCE LAYER                      │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  PostgreSQL (localhost:5432)                     │   │   │
│  │  │  - Customers, Vehicles, Bookings                 │   │   │
│  │  │  - Slots, AdditionalWorks, Payments              │   │   │
│  │  │  - Users (Jockeys, Workshop-Staff)               │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  File Storage (./uploads)                        │   │   │
│  │  │  - Fahrzeugfotos                                 │   │   │
│  │  │  - Auftragserweiterung-Fotos                     │   │   │
│  │  │  - Fahrzeugschein-Scans                          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  EXTERNAL INTEGRATIONS                   │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Stripe    │  │    Odoo     │  │   E-Mail    │     │   │
│  │  │  (Test Mode)│  │   (Mock)    │  │  (Nodemailer│     │   │
│  │  │             │  │             │  │   /SMTP)    │     │   │
│  │  │  Webhooks   │  │  JSON-Logs  │  │             │     │   │
│  │  │  via CLI    │  │             │  │             │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Azure Cloud-Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure Static Web Apps / App Service (Frontend)         │   │
│  │  - Next.js Production Build                             │   │
│  │  - CDN für statische Assets                             │   │
│  │  - Auto-Scaling                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure App Service (Backend)                            │   │
│  │  - Node.js Container                                    │   │
│  │  - Auto-Scaling (B1-B3)                                 │   │
│  │  - Application Insights                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure Database for PostgreSQL (Flexible Server)       │   │
│  │  - Burstable: B1ms (1 vCore, 2 GiB RAM)                │   │
│  │  - Auto-Backup (7 Tage)                                │   │
│  │  - Geo-Redundant Storage                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure Blob Storage (Hot Tier)                         │   │
│  │  - Fotos, Dokumente                                    │   │
│  │  - CDN für Bildauslieferung                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure Key Vault                                       │   │
│  │  - Stripe API Keys                                     │   │
│  │  - Odoo API Credentials                                │   │
│  │  - JWT Secrets                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Azure Monitor + Application Insights                  │   │
│  │  - Logging, Metrics, Alerts                            │   │
│  │  - Performance Monitoring                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  External Services                                     │   │
│  │  - Stripe (Production)                                 │   │
│  │  - Odoo (echte API)                                    │   │
│  │  - SendGrid (E-Mail)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  CI/CD Pipeline (GitHub Actions)                            │
│                                                              │
│  Code Push → Tests → Build → Deploy Staging → E2E Tests →  │
│  → Manual Approval → Deploy Production                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Komponentendetails

### 1. Frontend-Architektur (Next.js 14+)

#### 1.1 Ordnerstruktur

```
/app
  ├── (landing)
  │   ├── page.tsx              # Landing Page mit 3 Login-Bereichen
  │   └── layout.tsx            # Root Layout
  │
  ├── (customer)                # Customer Portal
  │   ├── booking/
  │   │   ├── page.tsx          # Buchungsformular
  │   │   ├── [id]/page.tsx     # Buchungsdetails
  │   │   └── confirm/page.tsx  # Zahlungsbestätigung
  │   ├── my-bookings/
  │   │   └── page.tsx          # Buchungshistorie
  │   └── layout.tsx            # Customer Layout
  │
  ├── (jockey)                  # Jockey Portal
  │   ├── dashboard/
  │   │   └── page.tsx          # Heutige Abholungen
  │   ├── pickup/
  │   │   └── [id]/page.tsx     # Abholungs-Details
  │   └── layout.tsx            # Jockey Layout
  │
  ├── (workshop)                # Workshop Portal
  │   ├── dashboard/
  │   │   └── page.tsx          # Auftragsübersicht
  │   ├── orders/
  │   │   └── [id]/page.tsx     # Auftragsdetails
  │   ├── additional-work/
  │   │   └── create/page.tsx   # Auftragserweiterung erstellen
  │   └── layout.tsx            # Workshop Layout
  │
  └── api/                      # API Routes (Next.js Route Handlers)
      ├── auth/
      ├── bookings/
      └── webhooks/

/components
  ├── customer/
  │   ├── VehicleSelectionForm.tsx
  │   ├── ServiceSelection.tsx
  │   └── SlotPicker.tsx
  ├── jockey/
  │   ├── PickupList.tsx
  │   └── VehicleHandoverForm.tsx
  ├── workshop/
  │   ├── OrderList.tsx
  │   └── AdditionalWorkForm.tsx
  └── shared/
      ├── Button.tsx
      ├── Card.tsx
      └── Modal.tsx

/lib
  ├── api-client.ts             # Axios-basierter API-Client
  ├── auth.ts                   # Auth-Helper (JWT-Handling)
  ├── stripe.ts                 # Stripe Client
  └── validations/
      ├── booking-schema.ts     # Zod-Schemas
      └── vehicle-schema.ts
```

#### 1.2 State Management

**Lokaler State:**
- React Server Components wo möglich (kein Client-State nötig)
- React Context für globale UI-States (Modals, Toasts)

**Server State:**
- TanStack Query (React Query) für API-Calls
- Automatic Caching, Refetching, Error-Handling

**Form State:**
- React Hook Form + Zod für Validierung
- Type-Safe Forms mit TypeScript

#### 1.3 UI-Komponenten

**shadcn/ui als Basis:**
- Button, Card, Input, Select, Dialog, Toast
- Tailwind CSS für Custom-Styling
- Responsive Design (Mobile-First)

**Custom Components:**
- VehicleSelectionForm (Marke/Modell/Baujahr/KM)
- SlotPicker (Kalender mit verfügbaren Slots)
- AdditionalWorkCard (Auftragserweiterung mit Fotos)

---

### 2. Backend-Architektur (Node.js + Express)

#### 2.1 Ordnerstruktur

```
/src
  ├── app.ts                    # Express App Setup
  ├── server.ts                 # Server Entry Point
  │
  ├── config/
  │   ├── database.ts           # Prisma Client Setup
  │   ├── stripe.ts             # Stripe Config
  │   └── environment.ts        # Env Variables
  │
  ├── middleware/
  │   ├── auth.ts               # JWT Verification
  │   ├── rbac.ts               # Role-based Access Control
  │   ├── error-handler.ts      # Global Error Handler
  │   └── rate-limiter.ts       # Rate Limiting
  │
  ├── routes/
  │   ├── auth.routes.ts        # POST /auth/login, /auth/magic-link
  │   ├── bookings.routes.ts    # CRUD für Bookings
  │   ├── vehicles.routes.ts    # CRUD für Vehicles
  │   ├── slots.routes.ts       # GET /slots?date=...
  │   ├── payments.routes.ts    # Stripe Payments
  │   ├── additional-work.routes.ts
  │   └── webhooks.routes.ts    # POST /webhooks/stripe
  │
  ├── controllers/
  │   ├── booking.controller.ts
  │   ├── payment.controller.ts
  │   ├── auth.controller.ts
  │   └── ...
  │
  ├── services/
  │   ├── booking.service.ts    # Business Logic
  │   ├── pricing.service.ts    # Preiskalkulation
  │   ├── slot.service.ts       # Slot-Management
  │   ├── payment.service.ts    # Stripe-Logik
  │   ├── odoo.service.ts       # Odoo-Integration
  │   └── notification.service.ts # E-Mail/Push
  │
  ├── repositories/
  │   ├── booking.repository.ts # DB-Access (Prisma)
  │   ├── vehicle.repository.ts
  │   └── ...
  │
  ├── models/                   # TypeScript Interfaces
  │   ├── booking.model.ts
  │   ├── vehicle.model.ts
  │   └── ...
  │
  ├── validations/
  │   ├── booking.validation.ts # Zod-Schemas
  │   └── ...
  │
  └── utils/
      ├── jwt.ts                # JWT Helper
      ├── logger.ts             # Winston Logger
      └── errors.ts             # Custom Error Classes
```

#### 2.2 API-Endpoints (RESTful)

**Siehe separate Datei: 03_API_Specification.md**

#### 2.3 Service Layer Design

**Preiskalkulation-Service (pricing.service.ts):**

```typescript
interface PriceCalculationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  service: ServiceType;
}

class PricingService {
  async calculatePrice(input: PriceCalculationInput): Promise<number> {
    // 1. Lookup in PriceMatrix
    const priceEntry = await this.findPriceMatrixEntry(
      input.brand,
      input.model,
      input.year
    );

    if (!priceEntry) {
      // Fallback: Durchschnittspreis für Marke
      return this.getFallbackPrice(input.brand, input.service);
    }

    // 2. Wähle Preis basierend auf Kilometerstand
    let basePrice = this.getPriceByMileage(priceEntry, input.mileage, input.service);

    // 3. Alters-Multiplikator
    const ageMultiplier = this.getAgeMultiplier(input.year);

    return Math.round(basePrice * ageMultiplier);
  }

  private getAgeMultiplier(year: number): number {
    const age = new Date().getFullYear() - year;
    if (age > 15) return 1.2;  // +20%
    if (age > 10) return 1.1;  // +10%
    return 1.0;
  }

  private getPriceByMileage(
    priceEntry: PriceMatrixEntry,
    mileage: number,
    service: ServiceType
  ): number {
    if (service === 'inspection') {
      if (mileage < 40000) return priceEntry.inspection_30k;
      if (mileage < 70000) return priceEntry.inspection_60k;
      if (mileage < 100000) return priceEntry.inspection_90k;
      return priceEntry.inspection_120k;
    }
    // Weitere Services...
    return priceEntry.oil_service;
  }
}
```

**Slot-Management-Service (slot.service.ts):**

```typescript
class SlotService {
  async getAvailableSlots(
    workshopId: string,
    date: Date
  ): Promise<Slot[]> {
    const slots = await this.slotRepository.findByDateAndWorkshop(
      workshopId,
      date
    );

    return slots.map(slot => ({
      ...slot,
      available: slot.currentBookings < slot.maxCapacity
    }));
  }

  async reserveSlot(slotId: string): Promise<void> {
    // Pessimistic Locking
    await this.slotRepository.incrementBookingCount(slotId);
  }
}
```

---

### 3. Datenbank-Architektur (PostgreSQL)

**Siehe separate Datei: 04_Database_Schema.md**

Wichtigste Entities:
- **Customer**: Kundendaten
- **Vehicle**: Fahrzeugdaten (Marke, Modell, Baujahr, KM)
- **Booking**: Buchungen
- **Slot**: Zeitslots für Abholung/Rückgabe
- **AdditionalWork**: Auftragserweiterungen
- **PriceMatrix**: Marke/Modell-spezifische Preise
- **User**: Jockeys, Workshop-Mitarbeiter

---

### 4. Integration-Architektur

#### 4.1 Stripe-Integration

**Setup:**
- Stripe SDK: `stripe` (Node.js)
- Test Mode Keys in `.env.local`
- Webhooks via Stripe CLI: `stripe listen --forward-to localhost:5000/webhooks/stripe`

**Payment Flow:**
1. Customer bucht Service → Backend erstellt Stripe Payment Intent
2. Frontend zeigt Stripe Checkout (embedded oder redirect)
3. Customer zahlt → Stripe sendet Webhook `payment_intent.succeeded`
4. Backend verarbeitet Webhook → Booking-Status auf `confirmed`
5. Rechnung generiert → E-Mail an Customer

**Webhook-Handling:**
```typescript
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

#### 4.2 Odoo-Integration

**MVP (Lokale Version):**
- Mock-Implementation (keine echten API-Calls)
- JSON-Logs statt Odoo-Requests
- Dateien in `./logs/odoo-mock.json`

```typescript
class OdooMockService {
  async createOrder(booking: Booking): Promise<void> {
    const log = {
      timestamp: new Date(),
      action: 'create_order',
      data: {
        customer: booking.customer,
        vehicle: booking.vehicle,
        service: booking.serviceType,
        price: booking.price
      }
    };

    fs.appendFileSync('./logs/odoo-mock.json', JSON.stringify(log) + '\n');
  }
}
```

**Phase 2 (Azure):**
- Echte Odoo XML-RPC oder REST API
- Authentication via API Key
- Real-Time Sync für Orders, Invoices, Payments

#### 4.3 E-Mail-Notifications

**Lokale Version:**
- Nodemailer mit SMTP (z.B. Ethereal für Testing)
- Oder SendGrid Free Tier (100 E-Mails/Tag)

**Templates:**
- Buchungsbestätigung
- Magic Link für Login
- Auftragserweiterung verfügbar
- Service abgeschlossen

---

## Security-Architektur

### Authentication & Authorization

#### Multi-Portal-Authentifizierung

**Customer:**
- Magic Link (passwordless)
- E-Mail → Code per E-Mail → verifizieren → JWT-Token

**Jockey / Workshop:**
- Username + Passwort
- bcrypt-gehashed
- JWT-Token nach Login

**JWT-Struktur:**
```json
{
  "sub": "user-id",
  "role": "customer|jockey|workshop|admin",
  "exp": 1672531200
}
```

**Middleware:**
```typescript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const rbacMiddleware = (allowedRoles: UserRole[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage:
router.get('/workshop/orders',
  authMiddleware,
  rbacMiddleware(['workshop', 'admin']),
  getOrders
);
```

### DSGVO-Compliance

**Datensparsamkeit:**
- Nur nötige Daten erfassen
- VIN/Schlüsselnummer optional

**Einwilligungen:**
- Kartenspeicherung (Checkbox bei Payment)
- Marketing-E-Mails (Opt-In)

**Recht auf Löschung:**
- API-Endpoint: `DELETE /api/customers/:id`
- Soft-Delete (anonymisiert, Buchungshistorie bleibt für Buchhaltung)

**Recht auf Datenexport:**
- API-Endpoint: `GET /api/customers/:id/export`
- JSON-Export aller Kundendaten

---

## Deployment-Architektur

### Lokale Entwicklungsumgebung

**Voraussetzungen:**
- Node.js 20+
- PostgreSQL 15+ (oder SQLite)
- Stripe CLI
- Git

**Setup-Schritte:**

1. **Repository klonen:**
   ```bash
   git clone <repo-url>
   cd b2c-autowartungs-app
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **Datenbank setup:**
   ```bash
   # PostgreSQL
   createdb b2c_app_dev

   # Migrations ausführen
   npx prisma migrate dev

   # Seed-Daten laden
   npx prisma db seed
   ```

4. **Environment Variables:**
   ```bash
   cp .env.example .env.local
   # Variablen anpassen (siehe unten)
   ```

5. **Stripe CLI starten:**
   ```bash
   stripe login
   stripe listen --forward-to localhost:5000/webhooks/stripe
   ```

6. **Development-Server starten:**
   ```bash
   # Terminal 1: Backend
   npm run dev:backend

   # Terminal 2: Frontend
   npm run dev:frontend
   ```

7. **Testen:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API-Docs (Swagger): http://localhost:5000/api-docs

**Environment Variables (.env.local):**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/b2c_app_dev

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (aus Stripe CLI)

# Odoo (Mock)
ODOO_ENABLED=false
ODOO_API_URL=http://localhost:8069
ODOO_API_KEY=mock_key

# E-Mail
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# App
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Netzwerk-Zugriff für Demo

**Lokales Netzwerk (LAN):**
- Backend: `http://<your-ip>:5000`
- Frontend: `http://<your-ip>:3000`
- IP ermitteln: `ipconfig` (Windows) oder `ifconfig` (Mac/Linux)

**Für externe Demo (VPN/ngrok):**
```bash
# Option 1: ngrok
ngrok http 3000

# Option 2: Tailscale (VPN)
# Alle Demo-Teilnehmer im selben VPN
```

### Docker-Setup (optional)

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: b2c_app
      POSTGRES_PASSWORD: password
      POSTGRES_DB: b2c_app_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://b2c_app:password@db:5432/b2c_app_dev
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000

volumes:
  postgres_data:
```

**Starten:**
```bash
docker-compose up -d
```

---

## Technische Entscheidungen & Rationale

### Warum Node.js + Express statt Python FastAPI?

| Kriterium | Node.js + Express | Python FastAPI | Entscheidung |
|-----------|------------------|----------------|--------------|
| **Full-Stack JS** | ✅ Gleiche Sprache Frontend/Backend | ❌ Context-Switch | Node.js |
| **Stripe-Support** | ✅ Offizielle SDK | ✅ Offizielle SDK | Gleichstand |
| **Odoo-Integration** | ✅ XML-RPC-Libs vorhanden | ✅ XML-RPC-Libs vorhanden | Gleichstand |
| **Community** | ✅ Sehr groß für Web-Apps | ✅ Groß für APIs | Gleichstand |
| **Type-Safety** | ✅ TypeScript | ✅ Type Hints | Gleichstand |
| **Azure-Support** | ✅ App Service (Node.js) | ✅ App Service (Python) | Gleichstand |
| **Entwicklungsgeschwindigkeit** | ✅ Schneller Prototyping | ⚖️ Ähnlich | Node.js |
| **Team-Skills** | ✅ JS-Entwickler leichter zu finden | ❌ Weniger verbreitet | Node.js |

**Fazit:** Node.js + Express für Full-Stack JavaScript-Konsistenz und schnellere Entwicklung.

### Warum PostgreSQL statt MySQL/SQLite?

| Kriterium | PostgreSQL | MySQL | SQLite | Entscheidung |
|-----------|-----------|-------|--------|--------------|
| **Azure-Migration** | ✅ Native Support | ✅ Native Support | ❌ Nicht produktionsreif | PostgreSQL |
| **ACID-Garantien** | ✅ Voll | ✅ Voll | ⚠️ Eingeschränkt | PostgreSQL/MySQL |
| **JSON-Support** | ✅ Nativ | ⚠️ Eingeschränkt | ❌ Kein JSON | PostgreSQL |
| **Lokales Setup** | ✅ Einfach | ✅ Einfach | ✅ Keine Installation | Gleichstand |
| **Prisma-Support** | ✅ Exzellent | ✅ Gut | ✅ Gut | PostgreSQL |
| **Skalierbarkeit** | ✅ Exzellent | ✅ Gut | ❌ Nicht für Production | PostgreSQL |

**Fazit:** PostgreSQL für nahtlose Azure-Migration und moderne Features.

### Warum Next.js 14+ statt React SPA (Vite)?

| Kriterium | Next.js 14+ | React SPA (Vite) | Entscheidung |
|-----------|------------|-----------------|--------------|
| **SSR/SSG** | ✅ Built-in | ❌ Manuell | Next.js |
| **Routing** | ✅ File-based | ❌ React Router | Next.js |
| **API-Routes** | ✅ Built-in | ❌ Separater Server | Next.js |
| **Performance** | ✅ Server Components | ⚠️ Client-only | Next.js |
| **SEO** | ✅ Exzellent | ⚠️ CSR-Problem | Next.js |
| **Deployment** | ✅ Vercel (einfach) | ⚖️ Netlify/Vercel | Gleichstand |
| **Azure-Migration** | ✅ Static Web Apps | ✅ Static Web Apps | Gleichstand |

**Fazit:** Next.js für bessere DX, Performance und SEO.

---

## Performance-Anforderungen

### Response-Zeit-Ziele

| Endpoint | Target | Max |
|----------|--------|-----|
| Landing Page | < 1s | 2s |
| Buchungsformular | < 2s | 3s |
| Payment-Checkout | < 2s | 4s |
| API-Calls (CRUD) | < 500ms | 1s |
| Slot-Lookup | < 300ms | 500ms |

### Skalierbarkeits-Ziele

**MVP (Lokal):**
- 10-20 gleichzeitige User
- 100 Bookings/Monat

**Phase 2 (Azure):**
- 100-500 gleichzeitige User
- 5.000 Bookings/Monat
- Auto-Scaling (Azure App Service)

---

## Monitoring & Logging

### Lokale Version (MVP)

**Logging:**
- Winston Logger (Console + File)
- Log-Levels: ERROR, WARN, INFO, DEBUG
- Rotation: täglich, max 7 Tage

**Error-Tracking:**
- Console-Logs ausreichend für MVP
- Später: Sentry-Integration

### Azure Version (Phase 2)

**Azure Application Insights:**
- Performance Monitoring
- Exception Tracking
- User Analytics
- Custom Metrics (Conversion-Rate, Payment-Success-Rate)

**Alerts:**
- Server-Error-Rate > 5%
- Response-Time > 2s
- Payment-Failure-Rate > 10%

---

## Testingstrategie

### Test-Pyramide

```
         E2E Tests (10%)
    ┌──────────────────────┐
    │  Playwright / Cypress │
    │  - Full Booking Flow  │
    │  - Payment Flow       │
    └──────────────────────┘

       Integration Tests (30%)
  ┌──────────────────────────────┐
  │  Supertest (API-Tests)        │
  │  - API-Endpoints              │
  │  - Stripe Webhooks            │
  └──────────────────────────────┘

         Unit Tests (60%)
┌────────────────────────────────────┐
│  Jest / Vitest                     │
│  - Services (Pricing, Slots)       │
│  - Validators                      │
│  - Helper-Functions                │
└────────────────────────────────────┘
```

### Kritische Test-Szenarien

1. **Preiskalkulation:**
   - VW Golf 60k km → 219 EUR
   - Mercedes S-Klasse 90k km → höherer Preis
   - Altes Fahrzeug (15 Jahre) → Aufschlag

2. **Slot-Management:**
   - Concurrent Bookings (Race Conditions)
   - Slot-Überbuchung verhindern

3. **Payment:**
   - Erfolgreiche Zahlung → Booking confirmed
   - Fehlgeschlagene Zahlung → Retry-Option
   - Webhook-Replay-Attack verhindern

4. **Auftragserweiterung:**
   - Werkstatt erstellt Angebot → Customer erhält Notification
   - Customer gibt frei → Zahlung ausgelöst
   - Customer lehnt ab → Werkstatt informiert

---

## Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|-----------|-----------|
| **Stripe-Webhook-Ausfall** | Niedrig | Hoch | Retry-Queue, Manual-Review-Interface |
| **PostgreSQL-Ausfall** | Niedrig | Kritisch | Auto-Backup (täglich), Point-in-Time-Recovery |
| **Concurrent Slot-Bookings** | Mittel | Mittel | Pessimistic Locking, Transaction-Isolation |
| **Odoo-Integration schlägt fehl** | Mittel | Mittel | Mock für MVP, Manual-Export als Fallback |
| **DSGVO-Verstöße** | Niedrig | Kritisch | Legal-Review, DSGVO-Audit vor Launch |
| **Performance-Probleme bei Skalierung** | Mittel | Hoch | Load-Testing, Azure Auto-Scaling, Caching |

---

## Nächste Schritte

### Vor Sprint 1 Start

1. ✅ Repository Setup (Git, Monorepo-Struktur)
2. ✅ Database-Schema finalisieren (Prisma Schema)
3. ✅ Stripe Test-Account einrichten
4. ✅ Wireframes für US-001 bis US-004 (UX-Team)
5. ✅ Lokales Setup-Skript schreiben

### Sprint 1 (Woche 1-2)

- Frontend: Landing Page, Customer-Portal (Fahrzeugauswahl)
- Backend: Booking-API, Pricing-Service
- Database: Migrations, Seed-Daten

### Sprint 2 (Woche 3-4)

- Payment-Integration (Stripe)
- Slot-Management
- Jockey-Portal (MVP)

### Sprint 3 (Woche 5-6)

- Auftragserweiterung
- Werkstatt-Portal
- Odoo-Mock-Integration

---

## Anhang

### Glossar

| Begriff | Definition |
|---------|-----------|
| **MVP** | Minimum Viable Product - Lokale Version für Testing/Demo |
| **SSR** | Server-Side Rendering - Next.js rendert HTML auf Server |
| **JWT** | JSON Web Token - Für Authentication |
| **RBAC** | Role-Based Access Control - Customer/Jockey/Workshop-Rollen |
| **Pessimistic Locking** | DB-Lock verhindert Race Conditions bei Slot-Buchung |
| **Idempotency** | Mehrfach-Ausführung ohne Seiteneffekte (wichtig für Webhooks) |

### Referenzen

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)

---

**Dokumentstatus:** APPROVED FOR DEVELOPMENT
**Nächstes Review:** Nach Sprint 1
**Verantwortlich:** Tech Lead + PO
