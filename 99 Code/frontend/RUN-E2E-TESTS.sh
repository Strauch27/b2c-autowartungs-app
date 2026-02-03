#!/bin/bash

##############################################################################
# E2E Test Runner Script
# Führt Playwright E2E Tests für die AutoConcierge B2C App aus
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧪 AutoConcierge E2E Test Runner"
echo "=================================="
echo ""

# Check if frontend dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend dev server läuft auf Port 3000"
else
    echo "⚠️  Frontend dev server läuft NICHT auf Port 3000"
    echo ""
    echo "Bitte starten Sie den Frontend dev server:"
    echo "  cd frontend && npm run dev"
    echo ""
    exit 1
fi

# Check if backend dev server is running (optional but recommended)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend dev server läuft auf Port 3001"
    BACKEND_RUNNING=true
else
    echo "⚠️  Backend dev server läuft NICHT auf Port 3001"
    echo "   (Optional, aber empfohlen für vollständige Tests)"
    BACKEND_RUNNING=false
fi

echo ""
echo "Test-Optionen:"
echo "  1) Alle Tests ausführen"
echo "  2) Nur Landing Page Tests"
echo "  3) Nur Booking Flow Tests"
echo "  4) Nur Customer Portal Tests"
echo "  5) Nur Jockey Portal Tests"
echo "  6) Nur Workshop Portal Tests"
echo "  7) Nur Multi-Language Tests"
echo "  8) Nur Extension Tests (UI + Integration)"
echo "  9) Tests mit UI (interaktiv)"
echo "  10) Tests im headed mode (Browser sichtbar)"
echo ""

read -p "Auswahl (1-10): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Führe alle E2E Tests aus..."
        npm run test:e2e
        ;;
    2)
        echo ""
        echo "🚀 Führe Landing Page Tests aus..."
        npx playwright test e2e/01-landing-page.spec.ts
        ;;
    3)
        echo ""
        echo "🚀 Führe Booking Flow Tests aus..."
        npx playwright test e2e/02-booking-flow.spec.ts
        ;;
    4)
        echo ""
        echo "🚀 Führe Customer Portal Tests aus..."
        npx playwright test e2e/03-customer-portal.spec.ts
        ;;
    5)
        echo ""
        echo "🚀 Führe Jockey Portal Tests aus..."
        npx playwright test e2e/04-jockey-portal.spec.ts
        ;;
    6)
        echo ""
        echo "🚀 Führe Workshop Portal Tests aus..."
        npx playwright test e2e/05-workshop-portal.spec.ts
        ;;
    7)
        echo ""
        echo "🚀 Führe Multi-Language Tests aus..."
        npx playwright test e2e/06-multi-language.spec.ts
        ;;
    8)
        echo ""
        echo "🚀 Führe Extension Tests aus..."
        npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts
        ;;
    9)
        echo ""
        echo "🚀 Öffne Playwright UI..."
        npm run test:e2e:ui
        ;;
    10)
        echo ""
        echo "🚀 Führe Tests im headed mode aus..."
        npm run test:e2e:headed
        ;;
    *)
        echo "❌ Ungültige Auswahl"
        exit 1
        ;;
esac

echo ""
echo "✅ Tests abgeschlossen!"
echo ""
echo "📊 HTML-Report anzeigen:"
echo "  npx playwright show-report"
echo ""
