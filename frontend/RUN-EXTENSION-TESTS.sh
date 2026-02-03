#!/bin/bash

##############################################################################
# Extension E2E Test Runner Script
# Führt Playwright E2E Tests für Extension Approval Flow aus
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧪 Extension Approval Flow E2E Test Runner"
echo "============================================"
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

# Check if backend dev server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend dev server läuft auf Port 3001"
    BACKEND_RUNNING=true
else
    echo "⚠️  Backend dev server läuft NICHT auf Port 3001"
    echo "   (ERFORDERLICH für Extension Integration Tests!)"
    echo ""
    echo "Bitte starten Sie den Backend dev server:"
    echo "  cd backend && npm run dev"
    echo ""
    read -p "Trotzdem fortfahren? (nur UI-Tests laufen) [y/N]: " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        exit 1
    fi
    BACKEND_RUNNING=false
fi

echo ""
echo "Test-Optionen:"
echo "  1) Nur UI-Tests (Extension Approval Flow)"
echo "  2) Nur Integration-Tests (erfordert Backend)"
echo "  3) Alle Extension-Tests"
echo "  4) Extension-Tests mit UI (interaktiv)"
echo "  5) Extension-Tests im headed mode"
echo ""

read -p "Auswahl (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Führe Extension UI Tests aus..."
        npx playwright test e2e/07-extension-approval-flow.spec.ts
        ;;
    2)
        if [ "$BACKEND_RUNNING" = false ]; then
            echo "❌ Backend wird für Integration-Tests benötigt!"
            exit 1
        fi
        echo ""
        echo "🚀 Führe Extension Integration Tests aus..."
        npx playwright test e2e/08-extension-integration.spec.ts
        ;;
    3)
        if [ "$BACKEND_RUNNING" = false ]; then
            echo "⚠️  Backend läuft nicht - Integration-Tests werden übersprungen"
            echo ""
            echo "🚀 Führe nur UI Tests aus..."
            npx playwright test e2e/07-extension-approval-flow.spec.ts
        else
            echo ""
            echo "🚀 Führe alle Extension Tests aus..."
            npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts
        fi
        ;;
    4)
        echo ""
        echo "🚀 Öffne Playwright UI für Extension Tests..."
        npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts --ui
        ;;
    5)
        echo ""
        echo "🚀 Führe Extension Tests im headed mode aus..."
        npx playwright test e2e/07-extension-approval-flow.spec.ts e2e/08-extension-integration.spec.ts --headed
        ;;
    *)
        echo "❌ Ungültige Auswahl"
        exit 1
        ;;
esac

echo ""
echo "✅ Extension Tests abgeschlossen!"
echo ""
echo "📊 HTML-Report anzeigen:"
echo "  npx playwright show-report"
echo ""
echo "💡 Hinweis:"
echo "  - Integration-Tests erstellen echte Extensions im Backend"
echo "  - Führen Sie 'npm run seed:minimal' aus um Test-Daten zurückzusetzen"
echo ""
