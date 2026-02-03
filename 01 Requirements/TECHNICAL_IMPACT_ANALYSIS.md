# Technical Impact Analysis: Produktstrategie-Änderungen

**Datum:** 2026-02-01
**Für:** Tech Lead, Development Team
**Von:** Product Owner
**Priorität:** HOCH - Vor Sprint 1 Kick-off lesen

---

## Executive Summary für Entwickler

Die strategischen Änderungen haben direkte Auswirkungen auf Datenmodell, Preiskalkulation und Validierung. Die Komplexität steigt um ca. 7%, hauptsächlich durch:

1. **Erweiterte Pflichtfelder:** Baujahr + Kilometerstand (Validierung erforderlich)
2. **Marke/Modell-Preisdatenbank:** Statt 5 Fahrzeugklassen jetzt Tausende Fahrzeugmodelle
3. **Inspektion-Logik:** Kilometerstand-basierte Wartungsbedarfsermittlung

**Story Points Impact:** +6 SP (von 85 auf 91)

---

## 1. Datenmodell-Änderungen

### Vehicle Entity - ÄNDERUNGEN ERFORDERLICH

**VORHER:**
```typescript
interface Vehicle {
  id: UUID;
  customer_id: UUID;
  brand: string;
  model: string;
  year?: number;              // OPTIONAL
  class: VehicleClass;        // Enum: Klein, Kompakt, Mittel, Ober, SUV
  license_plate?: string;
  vin?: string;
  created_at: DateTime;
}
```

**NACHHER:**
```typescript
interface Vehicle {
  id: UUID;
  customer_id: UUID;
  brand: string;              // PFLICHT (wie vorher)
  model: string;              // PFLICHT (wie vorher)
  year: number;               // PFLICHT (war optional) ⚠️
  mileage: number;            // NEU: PFLICHT ⚠️
  license_plate?: string;     // Optional (wie vorher)
  vin?: string;               // Optional (wie vorher)
  // class: VehicleClass;     // ENTFERNT ⚠️
  created_at: DateTime;
}
```

**Migration-Tasks:**
1. ❌ Feld `class` entfernen (DROP COLUMN)
2. ✅ Feld `year` von nullable zu NOT NULL ändern
3. ✅ Feld `mileage` hinzufügen (INT, NOT NULL)
4. ✅ Check Constraint: `mileage BETWEEN 0 AND 500000`
5. ✅ Check Constraint: `year BETWEEN 1994 AND CURRENT_YEAR`

### Booking Entity - ÄNDERUNGEN ERFORDERLICH

**NACHHER:**
```typescript
interface Booking {
  id: UUID;
  customer_id: UUID;
  vehicle_id: UUID;
  service_type: ServiceType;
  mileage_at_booking: number;  // NEU: Kilometerstand bei Buchung ⚠️
  price: Decimal;              // Berechnung ändert sich ⚠️
  status: BookingStatus;
  pickup_slot: Slot;
  delivery_slot: Slot;
  jockey_id?: UUID;
  workshop_id: UUID;
  stripe_payment_id: string;
  odoo_order_id?: number;
  created_at: DateTime;
}
```

**Migration-Tasks:**
1. ✅ Feld `mileage_at_booking` hinzufügen (INT, NOT NULL)
2. ⚠️ Preis-Kalkulation-Logik überarbeiten (siehe Sektion 3)

---

## 2. Neue Datenbank-Tabelle: PriceMatrix

### Problem
Statt 5 Fahrzeugklassen-Preisen brauchen wir jetzt Preise für Tausende Marke/Modell-Kombinationen.

### Lösung: PriceMatrix-Tabelle

```sql
CREATE TABLE price_matrix (
  id UUID PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_from INT NOT NULL,
  year_to INT NOT NULL,

  -- Service-Preise nach Kilometerstand
  inspection_30k DECIMAL(10,2),
  inspection_60k DECIMAL(10,2),
  inspection_90k DECIMAL(10,2),
  inspection_120k DECIMAL(10,2),

  oil_service DECIMAL(10,2),
  brake_service_front DECIMAL(10,2),
  brake_service_rear DECIMAL(10,2),
  tuv DECIMAL(10,2),
  climate_service DECIMAL(10,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (brand, model, year_from, year_to)
);

-- Index für schnelle Lookup
CREATE INDEX idx_price_brand_model ON price_matrix(brand, model);
```

### Beispiel-Daten

```sql
INSERT INTO price_matrix (brand, model, year_from, year_to, inspection_30k, inspection_60k, inspection_90k, oil_service, brake_service_front)
VALUES
  ('VW', 'Golf 7', 2012, 2019, 189, 219, 289, 159, 349),
  ('VW', 'Golf 8', 2019, 2026, 199, 229, 299, 169, 359),
  ('VW', 'Passat B8', 2014, 2023, 219, 259, 329, 179, 399),
  ('Audi', 'A4 B9', 2015, 2023, 249, 289, 359, 199, 449),
  ('BMW', '3er G20', 2019, 2026, 269, 309, 379, 219, 479),
  ('Mercedes', 'C-Klasse W206', 2021, 2026, 289, 329, 399, 229, 499);
```

### Fallback-Strategie bei fehlendem Modell

```typescript
async function getPrice(brand: string, model: string, year: number, mileage: number, service: ServiceType): Promise<number> {
  // 1. Versuche exakte Marke/Modell-Match
  const exactMatch = await db.query(
    'SELECT * FROM price_matrix WHERE brand = $1 AND model = $2 AND year BETWEEN year_from AND year_to',
    [brand, model, year]
  );

  if (exactMatch.rows.length > 0) {
    return calculatePriceByMileage(exactMatch.rows[0], mileage, service);
  }

  // 2. Fallback: Durchschnittspreis für Marke
  const brandAverage = await db.query(
    'SELECT AVG(inspection_60k) as avg_price FROM price_matrix WHERE brand = $1',
    [brand]
  );

  if (brandAverage.rows.length > 0) {
    return brandAverage.rows[0].avg_price * getMileageMultiplier(mileage);
  }

  // 3. Fallback: Generischer Preis (sollte nicht passieren)
  return 249; // Default-Preis
}

function getMileageMultiplier(mileage: number): number {
  if (mileage < 40000) return 0.85;      // -15% (weniger Verschleiß)
  if (mileage < 70000) return 1.00;      // Basis
  if (mileage < 100000) return 1.15;     // +15% (mehr Verschleiß)
  return 1.30;                            // +30% (hoher Verschleiß)
}
```

---

## 3. Preiskalkulation-Logik - VOLLSTÄNDIGE ÜBERARBEITUNG

### ALTE Logik (Fahrzeugklassen)

```typescript
// VERALTET - NICHT MEHR VERWENDEN
function calculatePrice(vehicleClass: VehicleClass, service: ServiceType): number {
  const priceMatrix = {
    'Kleinwagen': { oil_service: 179, brake: 299 },
    'Kompakt': { oil_service: 199, brake: 329 },
    'Mittel': { oil_service: 249, brake: 379 },
    'Ober': { oil_service: 349, brake: 479 },
    'SUV': { oil_service: 269, brake: 399 }
  };

  return priceMatrix[vehicleClass][service];
}
```

### NEUE Logik (Marke/Modell + Kilometerstand)

```typescript
interface PriceCalculationInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  service: ServiceType;
}

async function calculatePrice(input: PriceCalculationInput): Promise<number> {
  // 1. Hole Basis-Preis aus PriceMatrix
  const basePriceRow = await getPriceMatrixEntry(input.brand, input.model, input.year);

  if (!basePriceRow) {
    throw new Error(`Preis für ${input.brand} ${input.model} nicht gefunden`);
  }

  // 2. Wähle richtigen Preis basierend auf Kilometerstand
  let basePrice: number;

  if (input.service === 'inspection') {
    if (input.mileage < 40000) {
      basePrice = basePriceRow.inspection_30k;
    } else if (input.mileage < 70000) {
      basePrice = basePriceRow.inspection_60k;
    } else if (input.mileage < 100000) {
      basePrice = basePriceRow.inspection_90k;
    } else {
      basePrice = basePriceRow.inspection_120k;
    }
  } else if (input.service === 'oil_service') {
    basePrice = basePriceRow.oil_service;
  } else if (input.service === 'brake_service') {
    basePrice = basePriceRow.brake_service_front;
  } // ... weitere Services

  // 3. Anpassungen für Baujahr (ältere Fahrzeuge = mehr Verschleiß)
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.year;

  let ageMultiplier = 1.0;
  if (age > 10) ageMultiplier = 1.1;  // +10% für Fahrzeuge > 10 Jahre
  if (age > 15) ageMultiplier = 1.2;  // +20% für Fahrzeuge > 15 Jahre

  return Math.round(basePrice * ageMultiplier);
}
```

**Entwicklungs-Tasks:**
1. ✅ `calculatePrice()` Funktion neu schreiben
2. ✅ PriceMatrix-Tabelle anlegen
3. ✅ Top 50 Fahrzeugmodelle in DB eintragen (Pricing-Workshop)
4. ✅ Fallback-Logik implementieren
5. ✅ Unit-Tests schreiben (siehe Sektion 5)

---

## 4. Frontend-Validierung - NEUE ANFORDERUNGEN

### US-001: Fahrzeugauswahl-Formular

**Neue Validierungsregeln:**

```typescript
const vehicleFormSchema = z.object({
  brand: z.string().min(1, 'Marke ist erforderlich'),
  model: z.string().min(1, 'Modell ist erforderlich'),

  year: z.number()
    .min(1994, 'Baujahr darf nicht vor 1994 liegen')
    .max(new Date().getFullYear(), 'Baujahr darf nicht in der Zukunft liegen')
    .required('Baujahr ist ein Pflichtfeld'), // ⚠️ NEU: Pflicht

  mileage: z.number()
    .min(0, 'Kilometerstand darf nicht negativ sein')
    .max(500000, 'Bitte Kilometerstand prüfen (max. 500.000 km)')
    .required('Kilometerstand ist ein Pflichtfeld'), // ⚠️ NEU: Pflicht
});
```

**Plausibilitätsprüfung:**

```typescript
function validateVehiclePlausibility(year: number, mileage: number): string | null {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Durchschnitt: 15.000 km/Jahr in Deutschland
  const expectedMileage = age * 15000;

  // Wenn Kilometerstand viel zu niedrig oder hoch
  if (mileage < expectedMileage * 0.2) {
    return 'Hinweis: Sehr niedriger Kilometerstand für das Baujahr. Bitte prüfen.';
  }

  if (mileage > expectedMileage * 2) {
    return 'Hinweis: Sehr hoher Kilometerstand für das Baujahr. Bitte prüfen.';
  }

  return null; // Plausibel
}
```

**UI-Komponente (Beispiel mit React):**

```tsx
function VehicleSelectionForm() {
  const [year, setYear] = useState<number | null>(null);
  const [mileage, setMileage] = useState<number | null>(null);
  const [plausibilityWarning, setPlausibilityWarning] = useState<string | null>(null);

  useEffect(() => {
    if (year && mileage) {
      const warning = validateVehiclePlausibility(year, mileage);
      setPlausibilityWarning(warning);
    }
  }, [year, mileage]);

  return (
    <form>
      {/* Marke Dropdown */}
      <Select name="brand" required>
        <option value="">Marke wählen</option>
        <option value="VW">VW</option>
        <option value="Audi">Audi</option>
        {/* ... */}
      </Select>

      {/* Modell Dropdown (abhängig von Marke) */}
      <Select name="model" required>
        <option value="">Modell wählen</option>
        {/* Dynamisch geladen basierend auf Marke */}
      </Select>

      {/* Baujahr Dropdown - PFLICHTFELD */}
      <Select name="year" required onChange={e => setYear(parseInt(e.target.value))}>
        <option value="">Baujahr wählen</option>
        {Array.from({length: 32}, (_, i) => new Date().getFullYear() - i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>

      {/* Kilometerstand Input - PFLICHTFELD */}
      <Input
        type="number"
        name="mileage"
        placeholder="z.B. 85000"
        min={0}
        max={500000}
        required
        onChange={e => setMileage(parseInt(e.target.value))}
      />

      {/* Plausibilitäts-Warnung */}
      {plausibilityWarning && (
        <Alert variant="warning">
          {plausibilityWarning}
        </Alert>
      )}

      <Button type="submit">Preis berechnen</Button>
    </form>
  );
}
```

---

## 5. Testing-Strategie - ERWEITERT

### Unit-Tests für Preiskalkulation

```typescript
describe('Price Calculation', () => {
  test('VW Golf 60k km sollte korrekten Preis zurückgeben', async () => {
    const price = await calculatePrice({
      brand: 'VW',
      model: 'Golf 7',
      year: 2015,
      mileage: 60000,
      service: 'inspection'
    });

    expect(price).toBe(219); // 60k Inspektionspreis
  });

  test('VW Golf 90k km sollte höheren Preis zurückgeben', async () => {
    const price = await calculatePrice({
      brand: 'VW',
      model: 'Golf 7',
      year: 2015,
      mileage: 90000,
      service: 'inspection'
    });

    expect(price).toBe(289); // 90k Inspektionspreis
  });

  test('Altes Fahrzeug (15 Jahre) sollte Alters-Aufschlag haben', async () => {
    const price = await calculatePrice({
      brand: 'VW',
      model: 'Golf 7',
      year: 2011, // 15 Jahre alt
      mileage: 150000,
      service: 'inspection'
    });

    expect(price).toBeGreaterThan(289); // Aufschlag wegen Alter
  });

  test('Fehlendes Modell sollte Fallback-Preis nutzen', async () => {
    const price = await calculatePrice({
      brand: 'VW',
      model: 'Unbekanntes Modell',
      year: 2015,
      mileage: 60000,
      service: 'inspection'
    });

    expect(price).toBeGreaterThan(0); // Fallback funktioniert
  });
});
```

### Integration-Tests

```typescript
describe('Booking Flow mit Pflichtfeldern', () => {
  test('Buchung ohne Kilometerstand sollte fehlschlagen', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        brand: 'VW',
        model: 'Golf',
        year: 2015,
        // mileage: FEHLT
        service: 'inspection'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Kilometerstand');
  });

  test('Buchung ohne Baujahr sollte fehlschlagen', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        brand: 'VW',
        model: 'Golf',
        // year: FEHLT
        mileage: 60000,
        service: 'inspection'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Baujahr');
  });

  test('Unrealistischer Kilometerstand sollte Warnung zurückgeben', async () => {
    const response = await request(app)
      .post('/api/bookings/validate')
      .send({
        year: 2023,
        mileage: 200000 // Unrealistisch für 1-jähriges Auto
      });

    expect(response.body.warning).toBeTruthy();
  });
});
```

---

## 6. API-Änderungen

### POST /api/bookings - REQUEST BODY GEÄNDERT

**VORHER:**
```json
{
  "brand": "VW",
  "model": "Golf",
  "year": 2015,  // Optional
  "service": "oil_service"
}
```

**NACHHER:**
```json
{
  "brand": "VW",
  "model": "Golf",
  "year": 2015,       // PFLICHT ⚠️
  "mileage": 85000,   // NEU: PFLICHT ⚠️
  "service": "inspection"
}
```

### GET /api/prices - NEUE PARAMETER

```
GET /api/prices?brand=VW&model=Golf&year=2015&mileage=85000&service=inspection

Response:
{
  "price": 289,
  "currency": "EUR",
  "breakdown": {
    "base_price": 289,
    "mileage_category": "90k",
    "age_multiplier": 1.0,
    "final_price": 289
  }
}
```

---

## 7. Sprint-Planung: Task-Breakdown

### Sprint 1 - Woche 1

| Task | Story | Aufwand | Assignee |
|------|-------|---------|----------|
| **DB-Migration: Vehicle-Tabelle erweitern** | US-001 | 2h | Backend |
| - year von nullable zu NOT NULL | | | |
| - mileage Feld hinzufügen | | | |
| - Check Constraints | | | |
| **DB-Migration: Booking-Tabelle erweitern** | US-001 | 1h | Backend |
| - mileage_at_booking hinzufügen | | | |
| **PriceMatrix-Tabelle erstellen** | US-004 | 3h | Backend |
| - SQL Schema schreiben | | | |
| - Indizes anlegen | | | |
| - Seed-Daten (Top 10 Modelle) | | | |

### Sprint 1 - Woche 2

| Task | Story | Aufwand | Assignee |
|------|-------|---------|----------|
| **Preiskalkulation-Logik neu schreiben** | US-004 | 8h | Backend |
| - calculatePrice() Funktion | | | |
| - Kilometerstand-Multiplikator | | | |
| - Alters-Multiplikator | | | |
| - Fallback-Logik | | | |
| **Frontend: Formular erweitern** | US-001 | 5h | Frontend |
| - Baujahr-Dropdown (Pflicht) | | | |
| - Kilometerstand-Input (Pflicht) | | | |
| - Validierung | | | |
| - Plausibilitäts-Warnung | | | |

### Sprint 1 - Woche 3

| Task | Story | Aufwand | Assignee |
|------|-------|---------|----------|
| **Unit-Tests schreiben** | US-001, US-004 | 4h | Backend |
| **Integration-Tests schreiben** | US-001, US-004 | 3h | Backend |
| **Pricing-Workshop durchführen** | US-004 | 4h | PO + Business |
| - Top 50 Modelle priorisieren | | | |
| - Preise festlegen | | | |
| - In DB eintragen | | | |

**Gesamt Sprint 1:** ~30 Stunden (ca. 1 Woche Full-Stack-Dev)

---

## 8. Risiken & Mitigation (Technisch)

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|-----------|-------------------|-----------|
| **PriceMatrix zu groß (tausende Modelle)** | Performance-Issues | MITTEL | Indizes, Caching, Start mit Top 50 |
| **Fallback-Logik liefert falsche Preise** | Kundenfrust | NIEDRIG | Umfangreiches Testing, Manual Review |
| **Validierung zu strikt (echte Daten abgelehnt)** | Conversion-Verlust | MITTEL | A/B-Testing, Logs analysieren |
| **Marke/Modell-Daten inkonsistent** | Lookup schlägt fehl | MITTEL | Normalisierung (z.B. "VW" = "Volkswagen") |

---

## 9. Nächste Schritte für Development Team

### Vor Sprint 1 Start (DIESE WOCHE)

- [ ] Dieses Dokument lesen und verstehen
- [ ] Fragen klären mit PO (bei Stand-up oder direkt)
- [ ] DB-Migrations-Scripts schreiben (Review mit Tech Lead)
- [ ] Frontend-Wireframes für neue Pflichtfelder (mit UX)

### Sprint 1 Kick-off

- [ ] Tasks aufteilen (siehe Sektion 7)
- [ ] Pricing-Workshop teilnehmen (Top 50 Modelle)
- [ ] Test-Strategie finalisieren

### Während Sprint 1

- [ ] Daily Stand-ups: Blocker sofort eskalieren
- [ ] Code Reviews: Preiskalkulation besonders kritisch prüfen
- [ ] Testing: Edge Cases abdecken (sehr alte Autos, sehr hohe KM)

---

## 10. Fragen & Antworten

### Q: Müssen wir ALLE Fahrzeugmodelle in die DB eintragen?
**A:** Nein. MVP: Top 50 Modelle. Rest: Fallback-Logik (Durchschnittspreis für Marke).

### Q: Was, wenn Kunde falschen Kilometerstand eingibt?
**A:** Plausibilitäts-Warnung zeigen, aber nicht blockieren. Jockey prüft bei Abholung.

### Q: Wie halten wir Preise aktuell?
**A:** Admin-Interface für Preis-Pflege (Post-MVP). Initiale Preise aus Pricing-Workshop.

### Q: Ist marke/modell-Lookup case-sensitive?
**A:** Nein. `LOWER(brand)` und `LOWER(model)` für Vergleiche nutzen.

### Q: Was passiert mit bestehenden Test-Daten (haben kein year/mileage)?
**A:** Migration-Script füllt Dummy-Werte (year: 2015, mileage: 60000).

---

## Kontakt

**Tech Lead:** [Name]
**Product Owner:** Sten Rauch

Bei Fragen: Slack-Channel #b2c-app oder direkt ansprechen.

---

**STATUS: ✅ READY FOR SPRINT 1**
