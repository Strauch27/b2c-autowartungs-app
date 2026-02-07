#!/bin/bash

# B2C Autowartungs-App - E2E Test Environment Startup Script
# This script starts the E2E test environment using Docker Compose

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Starting E2E Test Environment...${NC}"
echo ""

# Navigate to the 99 Code directory
cd "$(dirname "$0")"

# 1. Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# 2. Build and start E2E services
echo -e "${YELLOW}Building and starting E2E containers...${NC}"
docker compose -f docker-compose.e2e.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start E2E containers${NC}"
    exit 1
fi

# 3. Wait for backend health
echo -e "${YELLOW}Waiting for E2E backend to be ready...${NC}"
MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5002/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ E2E Backend is ready${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo ""
    echo -e "${RED}❌ E2E Backend failed to start within timeout${NC}"
    echo -e "${YELLOW}Check logs: docker compose -f docker-compose.e2e.yml logs backend_e2e${NC}"
    exit 1
fi

# 4. Reset database via test endpoint
echo -e "${YELLOW}Resetting E2E database...${NC}"
RESET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5002/api/test/reset)

if [ "$RESET_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Database reset and seeded${NC}"
else
    echo -e "${YELLOW}⚠ Database reset returned status $RESET_RESPONSE (E2E_TEST may not be enabled)${NC}"
fi

# 5. Print summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🧪 E2E Test Environment Ready!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Backend API:${NC}  http://localhost:5002"
echo -e "  ${BLUE}Database:${NC}     localhost:5433"
echo -e "  ${BLUE}Frontend:${NC}     Start separately: cd frontend && npm run dev"
echo ""
echo -e "  ${YELLOW}To run E2E tests:${NC}"
echo -e "    cd frontend && npx playwright test"
echo ""
echo -e "  ${YELLOW}To stop E2E environment:${NC}"
echo -e "    docker compose -f docker-compose.e2e.yml down -v"
echo ""
echo -e "  ${YELLOW}View logs:${NC}"
echo -e "    docker compose -f docker-compose.e2e.yml logs -f backend_e2e"
echo ""
