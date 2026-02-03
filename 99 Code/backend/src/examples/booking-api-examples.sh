#!/bin/bash

# Booking API Examples
# Demonstrates all available booking endpoints with curl commands
#
# Prerequisites:
# - Backend server running on http://localhost:5000
# - Valid JWT token (get from login endpoint)
# - Test data created (customer, vehicle)
#
# Usage: ./booking-api-examples.sh

# Configuration
API_BASE_URL="http://localhost:5000/api"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}\n"
}

# Function to print request info
print_request() {
    echo -e "${YELLOW}Request:${NC} $1"
}

# Function to print response
print_response() {
    echo -e "${GREEN}Response:${NC}"
    echo "$1" | jq '.'
}

# Function to print error
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# ============================================================================
# 1. CREATE BOOKING
# ============================================================================
print_section "1. CREATE BOOKING"
print_request "POST /api/bookings"

CREATE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "YOUR_VEHICLE_ID",
    "serviceType": "INSPECTION",
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "09:00-11:00",
    "pickupAddress": "Hauptstraße 1",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115",
    "customerNotes": "Bitte vorsichtig fahren"
  }')

print_response "$CREATE_RESPONSE"

# Extract booking ID for subsequent requests
BOOKING_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo -e "\n${GREEN}Created Booking ID:${NC} $BOOKING_ID"

# ============================================================================
# 2. GET ALL BOOKINGS (WITH PAGINATION)
# ============================================================================
print_section "2. GET ALL BOOKINGS"
print_request "GET /api/bookings?page=1&limit=10"

LIST_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/bookings?page=1&limit=10" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

print_response "$LIST_RESPONSE"

# ============================================================================
# 3. GET ALL BOOKINGS (WITH STATUS FILTER)
# ============================================================================
print_section "3. GET BOOKINGS BY STATUS"
print_request "GET /api/bookings?status=PENDING_PAYMENT"

FILTERED_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/bookings?status=PENDING_PAYMENT" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

print_response "$FILTERED_RESPONSE"

# ============================================================================
# 4. GET SINGLE BOOKING
# ============================================================================
print_section "4. GET SINGLE BOOKING"
print_request "GET /api/bookings/${BOOKING_ID}"

GET_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/bookings/${BOOKING_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

print_response "$GET_RESPONSE"

# ============================================================================
# 5. UPDATE BOOKING (CUSTOMER NOTES)
# ============================================================================
print_section "5. UPDATE BOOKING NOTES"
print_request "PUT /api/bookings/${BOOKING_ID}"

UPDATE_RESPONSE=$(curl -s -X PUT "${API_BASE_URL}/bookings/${BOOKING_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerNotes": "Aktualisierte Notiz: Bitte besonders vorsichtig fahren"
  }')

print_response "$UPDATE_RESPONSE"

# ============================================================================
# 6. GET BOOKING STATUS
# ============================================================================
print_section "6. GET BOOKING STATUS"
print_request "GET /api/bookings/${BOOKING_ID}/status"

STATUS_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/bookings/${BOOKING_ID}/status" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

print_response "$STATUS_RESPONSE"

# ============================================================================
# 7. GET BOOKING EXTENSIONS
# ============================================================================
print_section "7. GET BOOKING EXTENSIONS"
print_request "GET /api/bookings/${BOOKING_ID}/extensions"

EXTENSIONS_RESPONSE=$(curl -s -X GET "${API_BASE_URL}/bookings/${BOOKING_ID}/extensions" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

print_response "$EXTENSIONS_RESPONSE"

# ============================================================================
# 8. APPROVE EXTENSION (requires extension ID)
# ============================================================================
print_section "8. APPROVE EXTENSION"
print_request "POST /api/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/approve"

echo -e "${YELLOW}Note: Replace EXTENSION_ID with actual extension ID${NC}"
echo -e "${YELLOW}Example command:${NC}"
echo "curl -X POST \"${API_BASE_URL}/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/approve\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\""

# APPROVE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/approve" \
#   -H "Authorization: Bearer ${JWT_TOKEN}")
# print_response "$APPROVE_RESPONSE"

# ============================================================================
# 9. DECLINE EXTENSION (requires extension ID)
# ============================================================================
print_section "9. DECLINE EXTENSION"
print_request "POST /api/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/decline"

echo -e "${YELLOW}Note: Replace EXTENSION_ID with actual extension ID${NC}"
echo -e "${YELLOW}Example command:${NC}"
echo "curl -X POST \"${API_BASE_URL}/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/decline\" \\"
echo "  -H \"Authorization: Bearer ${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"reason\": \"Zu teuer\"}'"

# DECLINE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings/${BOOKING_ID}/extensions/EXTENSION_ID/decline" \
#   -H "Authorization: Bearer ${JWT_TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"reason": "Zu teuer"}')
# print_response "$DECLINE_RESPONSE"

# ============================================================================
# 10. CANCEL BOOKING
# ============================================================================
print_section "10. CANCEL BOOKING"
print_request "DELETE /api/bookings/${BOOKING_ID}"

read -p "Do you want to cancel the booking? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    CANCEL_RESPONSE=$(curl -s -X DELETE "${API_BASE_URL}/bookings/${BOOKING_ID}" \
      -H "Authorization: Bearer ${JWT_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "reason": "Termin passt nicht mehr"
      }')

    print_response "$CANCEL_RESPONSE"
else
    echo -e "${YELLOW}Skipped booking cancellation${NC}"
fi

# ============================================================================
# EXAMPLES WITH DIFFERENT SERVICE TYPES
# ============================================================================
print_section "BONUS: Examples for Different Service Types"

echo -e "${YELLOW}Oil Service Booking:${NC}"
echo "curl -X POST \"${API_BASE_URL}/bookings\" \\"
echo "  -H \"Authorization: Bearer \${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"vehicleId\": \"YOUR_VEHICLE_ID\","
echo "    \"serviceType\": \"OIL_SERVICE\","
echo "    \"pickupDate\": \"2026-03-20T00:00:00Z\","
echo "    \"pickupTimeSlot\": \"14:00-16:00\","
echo "    \"pickupAddress\": \"Beispielstraße 10\","
echo "    \"pickupCity\": \"München\","
echo "    \"pickupPostalCode\": \"80331\""
echo "  }'"

echo -e "\n${YELLOW}TÜV Booking:${NC}"
echo "curl -X POST \"${API_BASE_URL}/bookings\" \\"
echo "  -H \"Authorization: Bearer \${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"vehicleId\": \"YOUR_VEHICLE_ID\","
echo "    \"serviceType\": \"TUV\","
echo "    \"pickupDate\": \"2026-04-10T00:00:00Z\","
echo "    \"pickupTimeSlot\": \"10:00-12:00\","
echo "    \"pickupAddress\": \"Testweg 5\","
echo "    \"pickupCity\": \"Hamburg\","
echo "    \"pickupPostalCode\": \"20095\""
echo "  }'"

echo -e "\n${YELLOW}Brake Service Booking:${NC}"
echo "curl -X POST \"${API_BASE_URL}/bookings\" \\"
echo "  -H \"Authorization: Bearer \${JWT_TOKEN}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"vehicleId\": \"YOUR_VEHICLE_ID\","
echo "    \"serviceType\": \"BRAKE_SERVICE\","
echo "    \"pickupDate\": \"2026-03-25T00:00:00Z\","
echo "    \"pickupTimeSlot\": \"08:00-10:00\","
echo "    \"pickupAddress\": \"Musterallee 3\","
echo "    \"pickupCity\": \"Frankfurt\","
echo "    \"pickupPostalCode\": \"60311\","
echo "    \"customerNotes\": \"Bremsgeräusche beim Bremsen\""
echo "  }'"

# ============================================================================
# ERROR HANDLING EXAMPLES
# ============================================================================
print_section "ERROR HANDLING EXAMPLES"

echo -e "${YELLOW}1. Invalid Vehicle ID:${NC}"
INVALID_VEHICLE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "invalid_vehicle_id",
    "serviceType": "INSPECTION",
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "09:00-11:00",
    "pickupAddress": "Test Street",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }')
print_response "$INVALID_VEHICLE_RESPONSE"

echo -e "\n${YELLOW}2. Past Date (should fail):${NC}"
PAST_DATE_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "YOUR_VEHICLE_ID",
    "serviceType": "INSPECTION",
    "pickupDate": "2020-01-01T00:00:00Z",
    "pickupTimeSlot": "09:00-11:00",
    "pickupAddress": "Test Street",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }')
print_response "$PAST_DATE_RESPONSE"

echo -e "\n${YELLOW}3. Invalid Time Slot Format:${NC}"
INVALID_TIMESLOT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/bookings" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "YOUR_VEHICLE_ID",
    "serviceType": "INSPECTION",
    "pickupDate": "2026-03-15T00:00:00Z",
    "pickupTimeSlot": "invalid-format",
    "pickupAddress": "Test Street",
    "pickupCity": "Berlin",
    "pickupPostalCode": "10115"
  }')
print_response "$INVALID_TIMESLOT_RESPONSE"

# ============================================================================
# SUMMARY
# ============================================================================
print_section "SUMMARY"

echo -e "${GREEN}Available Service Types:${NC}"
echo "  - INSPECTION"
echo "  - OIL_SERVICE"
echo "  - BRAKE_SERVICE"
echo "  - TUV"
echo "  - CLIMATE_SERVICE"
echo "  - CUSTOM"

echo -e "\n${GREEN}Booking Statuses:${NC}"
echo "  - PENDING_PAYMENT"
echo "  - CONFIRMED"
echo "  - JOCKEY_ASSIGNED"
echo "  - IN_TRANSIT_TO_WORKSHOP"
echo "  - IN_WORKSHOP"
echo "  - COMPLETED"
echo "  - IN_TRANSIT_TO_CUSTOMER"
echo "  - DELIVERED"
echo "  - CANCELLED"

echo -e "\n${GREEN}Extension Statuses:${NC}"
echo "  - PENDING"
echo "  - APPROVED"
echo "  - DECLINED"
echo "  - CANCELLED"

echo -e "\n${BLUE}===========================================${NC}"
echo -e "${GREEN}Booking API Examples Completed!${NC}"
echo -e "${BLUE}===========================================${NC}\n"
