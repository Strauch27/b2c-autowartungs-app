# Test Credentials für E2E Tests

**Letzte Aktualisierung**: 2026-02-02

## Übersicht

Alle Test-User wurden aktualisiert und sind in der Datenbank verfügbar. Die Credentials sind in `/frontend/e2e/fixtures/test-data.ts` definiert.

## Test-User

### 1. Workshop User
- **Email**: `werkstatt@test.de`
- **Username**: `werkstatt1`
- **Password**: `password123`
- **Role**: WORKSHOP
- **Name**: Workshop Manager
- **Login URL**: `/de/workshop/login`

### 2. Jockey User
- **Email**: `jockey@test.de`
- **Username**: `jockey1`
- **Password**: `password123`
- **Role**: JOCKEY
- **Name**: Hans Fahrer
- **Login URL**: `/de/jockey/login`

### 3. Customer User
- **Email**: `kunde@test.de`
- **Password**: `password123` (für Tests - in Produktion: Magic Link)
- **Role**: CUSTOMER
- **Name**: Max Mustermann
- **Phone**: +49170123456
- **Login URL**: `/de/customer/login`

## Datenbank seeden

Um die Test-User neu zu erstellen:

```bash
cd backend
npx tsx prisma/seed-users.ts
```

## Auth Helper Functions

Verwende die folgenden Helper in E2E-Tests:

```typescript
import { loginAsWorkshop, loginAsJockey, loginAsCustomer } from './helpers/auth-helpers';

// Login als Workshop
await loginAsWorkshop(page);

// Login als Jockey
await loginAsJockey(page);

// Login als Customer
await loginAsCustomer(page);
```

## Bekannte Probleme

### Auth-Tests (52 Tests fehlschlagen)
- **Problem**: Tests erwarteten alte Credentials
- **Status**: ✅ Behoben - test-data.ts aktualisiert
- **Nächster Schritt**: Tests neu ausführen

### Login-Selektoren
- **Problem**: Generische text= Locators verursachen Timeouts
- **Status**: ⏳ In Arbeit - Robustere Selektoren werden hinzugefügt
- **Nächster Schritt**: data-testid zu Login-Forms hinzufügen

## Migration Guide

Falls Backend-Schema ändert:

1. `backend/prisma/seed-users.ts` aktualisieren
2. `frontend/e2e/fixtures/test-data.ts` aktualisieren
3. Dieses Dokument aktualisieren
4. Tests neu ausführen

## Weitere Test-Daten

- **Fahrzeuge**: Siehe `TEST_VEHICLES` in test-data.ts
- **Services**: Siehe `TEST_SERVICES` in test-data.ts
- **Adressen**: Siehe `TEST_ADDRESSES` in test-data.ts
