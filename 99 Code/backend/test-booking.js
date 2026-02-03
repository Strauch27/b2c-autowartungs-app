#!/usr/bin/env node

/**
 * Test script to create a booking via API
 * Run with: node test-booking.js
 */

const API_URL = 'http://localhost:5001/api/bookings';

const testBooking = {
  customer: {
    email: 'test@example.com',
    firstName: 'Max',
    lastName: 'Mustermann',
    phone: '+49 123 456789'
  },
  vehicle: {
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2020,
    mileage: 45000,
    saveVehicle: true
  },
  services: ['inspection', 'oil'],
  pickup: {
    date: '2026-02-15',
    timeSlot: '10:00',
    street: 'Hauptstraße 123',
    city: 'Dortmund',
    postalCode: '44135'
  },
  delivery: {
    date: '2026-02-15',
    timeSlot: '18:00'
  },
  customerNotes: 'Automated test booking'
};

async function testCreateBooking() {
  console.log('🧪 Testing booking creation...\n');
  console.log('📤 Sending request to:', API_URL);
  console.log('📦 Payload:', JSON.stringify(testBooking, null, 2));
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📨 Response Body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Booking created successfully');
      if (data.data) {
        console.log('📋 Booking Number:', data.data.bookingNumber);
        console.log('🆔 Booking ID:', data.data.id);
        console.log('💰 Total Price:', data.data.totalPrice);
      }
    } else {
      console.log('\n❌ FAILED! Server returned error');
      if (data.error) {
        console.log('🔴 Error Code:', data.error.code);
        console.log('🔴 Error Message:', data.error.message);
        if (data.error.details) {
          console.log('🔴 Error Details:', JSON.stringify(data.error.details, null, 2));
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    process.exit(response.ok ? 0 : 1);

  } catch (error) {
    console.log('\n❌ REQUEST FAILED!');
    console.log('🔴 Error:', error.message);
    console.log('🔴 Stack:', error.stack);
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

testCreateBooking();
