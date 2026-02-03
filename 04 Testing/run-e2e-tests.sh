#!/bin/bash

###############################################################################
# E2E Test Runner für B2C Autowartungs-App
#
# Startet Backend, Frontend und führt Playwright E2E Tests aus
#
# Usage:
#   ./run-e2e-tests.sh              # Standard-Modus (headless)
#   ./run-e2e-tests.sh ui           # UI-Modus (Playwright Test UI)
#   ./run-e2e-tests.sh headed       # Headed-Modus (Browser sichtbar)
#   ./run-e2e-tests.sh debug        # Debug-Modus
#   ./run-e2e-tests.sh quick        # Nur Smoke Tests
#   ./run-e2e-tests.sh demo         # Nur kompletter E2E Journey Test
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Test mode
TEST_MODE="${1:-standard}"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_step() {
    echo -e "${BLUE}→ $1${NC}"
}

# Cleanup function
cleanup() {
    print_header "Cleaning up..."

    if [ ! -z "$BACKEND_PID" ]; then
        print_step "Stopping Backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        print_step "Stopping Frontend (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Kill any remaining node processes on ports
    print_step "Cleaning up ports 5001 and 3000"
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true

    print_success "Cleanup complete"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=60
    local attempt=0

    print_step "Waiting for $name to be ready at $url..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f -o /dev/null "$url"; then
            print_success "$name is ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done

    print_error "$name failed to start after $max_attempts seconds"
    return 1
}

###############################################################################
# Main Script
###############################################################################

print_header "E2E Test Runner - B2C Autowartungs-App"

# Check if directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Check if node_modules exist
print_step "Checking dependencies..."

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    print_info "Backend dependencies not installed. Installing..."
    cd "$BACKEND_DIR"
    npm install
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_info "Frontend dependencies not installed. Installing..."
    cd "$FRONTEND_DIR"
    npm install
fi

print_success "Dependencies checked"

###############################################################################
# Start Backend
###############################################################################

print_header "Starting Backend"

cd "$BACKEND_DIR"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found in backend directory"
    print_info "Please create .env file with required configuration"
    exit 1
fi

# Start backend in background
print_step "Starting Backend server on port 5001..."
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

print_info "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
if ! wait_for_service "http://localhost:5001/health" "Backend"; then
    print_error "Backend logs:"
    tail -20 /tmp/backend.log
    exit 1
fi

###############################################################################
# Start Frontend
###############################################################################

print_header "Starting Frontend"

cd "$FRONTEND_DIR"

# Start frontend in background
print_step "Starting Frontend server on port 3000..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

print_info "Frontend PID: $FRONTEND_PID"

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:3000" "Frontend"; then
    print_error "Frontend logs:"
    tail -20 /tmp/frontend.log
    exit 1
fi

###############################################################################
# Run Tests
###############################################################################

print_header "Running E2E Tests"

cd "$FRONTEND_DIR"

# Determine test command based on mode
case "$TEST_MODE" in
    ui)
        print_step "Running tests in UI mode..."
        npm run test:e2e:ui
        ;;
    headed)
        print_step "Running tests in headed mode (browser visible)..."
        npm run test:e2e:headed
        ;;
    debug)
        print_step "Running tests in debug mode..."
        npm run test:e2e:debug
        ;;
    quick)
        print_step "Running quick smoke tests..."
        npx playwright test e2e/00-quick-smoke-test.spec.ts
        ;;
    demo)
        print_step "Running complete E2E journey test..."
        npx playwright test e2e/09-complete-e2e-journey.spec.ts --headed
        ;;
    auth)
        print_step "Running authentication tests..."
        npm run test:e2e:auth
        ;;
    *)
        print_step "Running all tests in headless mode..."
        npm run test:e2e
        ;;
esac

TEST_EXIT_CODE=$?

###############################################################################
# Results
###############################################################################

print_header "Test Results"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed! 🎉"

    # Show test report
    if [ -f "playwright-report/index.html" ]; then
        print_info "Test report available at: playwright-report/index.html"
        print_step "To view report: npm run test:e2e:report"
    fi
else
    print_error "Tests failed with exit code: $TEST_EXIT_CODE"

    # Show last few lines of test output
    if [ -f "test-results/.last-run.log" ]; then
        print_info "Last test run logs:"
        tail -30 test-results/.last-run.log
    fi

    exit $TEST_EXIT_CODE
fi

###############################################################################
# Summary
###############################################################################

print_header "Summary"

echo -e "${GREEN}✓ Backend${NC}   http://localhost:5001"
echo -e "${GREEN}✓ Frontend${NC}  http://localhost:3000"
echo -e "${GREEN}✓ Tests${NC}     Completed successfully"

if [ "$TEST_MODE" != "ui" ]; then
    print_info "Servers will shut down automatically"
    print_info "To keep servers running, press Ctrl+C now"
    sleep 3
fi

print_success "E2E Test Run Complete!"
