# API Architektur

## Überblick

Diese Anwendung verwendet eine **klare, einfache Architektur** mit einem einzigen Backend.

## Backend

- **Express Backend**: Port 5001
- Vollständig implementiertes REST API
- Authentifizierung mit JWT
- PostgreSQL Datenbank

## Frontend API-Kommunikation

Das Frontend kommuniziert **direkt** mit dem Express Backend. Es gibt **keine Next.js API Routes**.

### API Client Konfiguration

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
```

Alle API-Calls gehen direkt an:
- **Entwicklung**: `http://localhost:5001`
- **Produktion**: Wird über `NEXT_PUBLIC_API_URL` Environment Variable konfiguriert

### Environment Variablen

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

Backend `.env`:
```env
PORT=5001
DATABASE_URL=postgresql://...
```

## API Endpunkte

Alle API-Endpunkte sind im Express Backend implementiert:

### Bookings
- `POST /api/bookings` - Neue Buchung erstellen
- `GET /api/bookings` - Alle Buchungen abrufen
- `GET /api/bookings/:id` - Einzelne Buchung abrufen
- `PUT /api/bookings/:id` - Buchung aktualisieren
- `DELETE /api/bookings/:id` - Buchung stornieren
- `GET /api/bookings/:id/status` - Buchungsstatus abrufen
- `GET /api/bookings/:id/extensions` - Erweiterungen abrufen
- `POST /api/bookings/:bookingId/extensions/:extensionId/approve` - Erweiterung genehmigen
- `POST /api/bookings/:bookingId/extensions/:extensionId/decline` - Erweiterung ablehnen

### Workshop
- `GET /api/workshops/orders` - Alle Aufträge für Werkstatt abrufen
- `GET /api/workshops/orders/:id` - Einzelnen Auftrag abrufen
- `PUT /api/workshops/orders/:id/status` - Auftragsstatus aktualisieren
- `POST /api/workshops/orders/:bookingId/extensions` - Erweiterung erstellen

### Jockey
- `GET /api/jockeys/assignments` - Alle Zuweisungen für Jockey abrufen
- `GET /api/jockeys/assignments/:id` - Einzelne Zuweisung abrufen
- `PUT /api/jockeys/assignments/:id/status` - Zuweisungsstatus aktualisieren
- `POST /api/jockeys/assignments/:id/handover` - Übergabe dokumentieren

## Entwicklung

### Backend starten

```bash
cd "99 Code/backend"
npm run dev
```

Backend läuft auf: `http://localhost:5001`

### Frontend starten

```bash
cd "99 Code/frontend"
npm run dev
```

Frontend läuft auf: `http://localhost:3000`

### Wichtig

Das Backend **muss** auf Port 5001 laufen, damit das Frontend korrekt funktioniert.

## Architektur-Entscheidungen

### Warum keine Next.js API Routes?

1. **Einfachheit**: Ein einziges Backend ist einfacher zu warten und zu verstehen
2. **Keine Duplizierung**: Vermeidet Code-Duplizierung zwischen Next.js Routes und Express
3. **Klare Verantwortlichkeiten**: Frontend für UI, Express für Backend-Logik
4. **Bessere Skalierbarkeit**: Express Backend kann unabhängig skaliert werden
5. **Konsistenz**: Alle API-Logik an einem Ort

### Deployment

In Produktion:
- Frontend (Next.js): Deployment auf Vercel/Netlify
- Backend (Express): Deployment auf Railway/Render/Fly.io
- Beide kommunizieren über HTTPS mit der konfigurierten `NEXT_PUBLIC_API_URL`
