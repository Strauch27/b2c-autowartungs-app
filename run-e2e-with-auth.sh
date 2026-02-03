#!/bin/bash

###############################################################################
# E2E Test Runner with Auth Fixtures
#
# This script:
# 1. Starts Backend and Frontend
# 2. Runs global-setup to create authenticated sessions
# 3. Executes E2E tests with pre-authenticated contexts
# 4. Cleans up processes on exit
#
# Usage:
#   ./run-e2e-with-auth.sh              # Run auth-based tests
#   ./run-e2e-with-auth.sh ui           # Run with UI mode
#   ./run-e2e-with-auth.sh headed       # Run in headed mode
#   ./run-e2e-with-auth.sh debug        # Run in debug mode
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print helpers
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Cleanup function
cleanup() {
    print_header "Cleaning up..."

    if [ ! -z "$BACKEND_PID" ]; then
        print_info "Stopping Backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        print_info "Stopping Frontend (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Kill any remaining processes on ports
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true

    print_success "Cleanup complete"
}

# Set up trap to cleanup on exit
trap cleanup EXIT INT TERM

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=60
    local attempt=0

    print_info "Waiting for $name to be ready..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f -o /dev/null "$url"; then
            print_success "$name is ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        sleep 1

        if [ $((attempt % 10)) -eq 0 ]; then
            print_info "Still waiting for $name... ($attempt/$max_attempts)"
        fi
    done

    print_error "$name failed to start after $max_attempts seconds"
    return 1
}

print_header "E2E Tests with Auth Fixtures"

# Parse test mode
TEST_MODE=${1:-standard}
print_info "Test mode: $TEST_MODE"

print_header "Step 1: Starting Backend"

cd "/Users/stenrauch/Documents/B2C App v2/99 Code/backend"

# Check if Backend is already running
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Backend already running on port 5001"
    print_info "Killing existing process..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Backend
print_info "Starting Backend server..."
npm start > /tmp/backend-test.log 2>&1 &
BACKEND_PID=$!
print_info "Backend PID: $BACKEND_PID"

# Wait for Backend
if ! wait_for_service "http://localhost:5001/health" "Backend"; then
    print_error "Backend health check failed"
    cat /tmp/backend-test.log
    exit 1
fi

print_header "Step 2: Starting Frontend"

cd "/Users/stenrauch/Documents/B2C App v2/99 Code/frontend"

# Check if Frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Frontend already running on port 3000"
    print_info "Killing existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start Frontend
print_info "Starting Frontend server..."
npm run dev > /tmp/frontend-test.log 2>&1 &
FRONTEND_PID=$!
print_info "Frontend PID: $FRONTEND_PID"

# Wait for Frontend
if ! wait_for_service "http://localhost:3000" "Frontend"; then
    print_error "Frontend health check failed"
    cat /tmp/frontend-test.log
    exit 1
fi

print_header "Step 3: Seeding Test Users"

cd "/Users/stenrauch/Documents/B2C App v2/99 Code/backend"

print_info "Seeding test users in database..."
npx tsx prisma/seed-test-users.ts

if [ $? -eq 0 ]; then
    print_success "Test users seeded successfully"
else
    print_error "Failed to seed test users"
    exit 1
fi

cd "/Users/stenrauch/Documents/B2C App v2/99 Code/frontend"

print_header "Step 4: Running Global Setup"

print_info "Creating authenticated sessions for all user roles..."

# Run global setup manually
npx tsx e2e/global-setup.ts

if [ $? -eq 0 ]; then
    print_success "Global setup completed - auth states created"
else
    print_error "Global setup failed"
    exit 1
fi

print_header "Step 5: Running E2E Tests with Auth"

# Run tests based on mode
case $TEST_MODE in
    ui)
        print_info "Running tests in UI mode"
        npx playwright test e2e/10-complete-e2e-with-auth.spec.ts --ui
        ;;
    headed)
        print_info "Running tests in headed mode"
        npx playwright test e2e/10-complete-e2e-with-auth.spec.ts --headed
        ;;
    debug)
        print_info "Running tests in debug mode"
        npx playwright test e2e/10-complete-e2e-with-auth.spec.ts --debug
        ;;
    *)
        print_info "Running tests in standard mode"
        npx playwright test e2e/10-complete-e2e-with-auth.spec.ts
        ;;
esac

TEST_EXIT_CODE=$?

print_header "Test Results"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed! 🎉"
else
    print_error "Some tests failed"
    print_info "View detailed report: npx playwright show-report"
fi

print_header "Test Logs"
print_info "Backend log: /tmp/backend-test.log"
print_info "Frontend log: /tmp/frontend-test.log"
print_info "Playwright report: frontend/playwright-report/index.html"

exit $TEST_EXIT_CODE
