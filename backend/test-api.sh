#!/bin/bash

# API Test Suite for B2C Autowartungs-App Backend
# Tests all critical endpoints

set -e

API_URL="http://localhost:5001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Starting API Test Suite..."
echo "================================"
echo ""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to run test
run_test() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local token=$6

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing: $name... "

    if [ -n "$token" ]; then
        HEADERS="-H 'Authorization: Bearer $token' -H 'Content-Type: application/json'"
    else
        HEADERS="-H 'Content-Type: application/json'"
    fi

    if [ "$method" = "GET" ]; then
        RESPONSE=$(eval curl -s -w "\n%{http_code}" $HEADERS "$API_URL$endpoint")
    else
        RESPONSE=$(eval curl -s -w "\n%{http_code}" -X $method $HEADERS -d "'$data'" "$API_URL$endpoint")
    fi

    STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$STATUS_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $STATUS_CODE)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $STATUS_CODE)"
        echo "  Response: $BODY"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "📋 1. Authentication Tests"
echo "----------------------------"

# Test workshop login
WORKSHOP_LOGIN=$(curl -s -X POST "$API_URL/auth/workshop/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"werkstatt-witten","password":"werkstatt123"}')

WORKSHOP_TOKEN=$(echo $WORKSHOP_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$WORKSHOP_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Workshop login successful"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} Workshop login failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📦 2. Booking API Tests"
echo "----------------------------"

# Test guest checkout booking creation
BOOKING_DATA='{
  "customer": {
    "email": "test-api@example.com",
    "firstName": "API",
    "lastName": "Test",
    "phone": "+49 123 456789"
  },
  "vehicle": {
    "brand": "BMW",
    "model": "3er",
    "year": 2019,
    "mileage": 35000
  },
  "services": ["inspection"],
  "pickup": {
    "date": "2026-02-20",
    "timeSlot": "10:00",
    "street": "Teststraße 1",
    "city": "Dortmund",
    "postalCode": "44135"
  },
  "delivery": {
    "date": "2026-02-20",
    "timeSlot": "18:00"
  }
}'

run_test "Create booking (guest checkout)" "POST" "/bookings" "$BOOKING_DATA" "201"

echo ""
echo "🔧 3. Workshop API Tests"
echo "----------------------------"

# Test get workshop orders
run_test "Get workshop orders" "GET" "/workshops/orders?limit=10" "" "200" "$WORKSHOP_TOKEN"

echo ""
echo "🚗 4. Services API Tests"
echo "----------------------------"

run_test "Get available services" "GET" "/services" "" "200"

echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
