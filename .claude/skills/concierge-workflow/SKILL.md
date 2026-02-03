---
name: concierge-workflow
description: Business logic and workflows for the concierge service (Hol- und Bringservice). Reference when implementing concierge features.
user-invocable: false
---

# Concierge Service Workflow

Complete workflow for the Hol- und Bringservice with Ronja vehicles.

## Service Overview

**Concierge Service** = Fahrzeug wird abgeholt + Ersatzfahrzeug gestellt + Rückbringung

### Key Benefits
- Kunde muss nicht zur Werkstatt fahren
- Ronja-Ersatzwagen als "rollende Werbung"
- Höhere Kundenbindung
- Differenzierung vom Wettbewerb

### Pricing Strategy

From transcript discussions:
- Concierge **nicht** separat bepreisen (wird im Paket inkludiert)
- Attraktives Gesamtangebot (z.B. 199€ inkl. Concierge statt 149€ + 50€ Concierge)
- Preis so gestalten, dass Kunde den Mehrwert sieht

## Booking Flow

### 1. Service Selection

```typescript
interface BookingRequest {
  service: 'oil-service' | 'inspection' | 'brake-service' | 'climate-service';
  vehicleClass: 'compact' | 'midsize' | 'suv' | 'luxury';
  postalCode: string;
  includeConcierge: boolean; // Default: true
}
```

### 2. Location Validation

```typescript
async function validateServiceArea(postalCode: string): Promise<boolean> {
  // Check if postal code is within service radius
  const workshop = await getWorkshop('witten'); // Start location
  const distance = calculateDistance(workshop.location, postalCode);

  // Max 60km radius for Witten
  const MAX_RADIUS = 60;

  if (distance > MAX_RADIUS) {
    throw new ServiceAreaError(
      'Außerhalb des Servicegebiets',
      'POSTAL_CODE_OUT_OF_RANGE',
      { maxRadius: MAX_RADIUS, actualDistance: distance }
    );
  }

  return true;
}
```

Einzugsgebiet Witten:
- Dortmund ✓
- Essen ✓
- Wuppertal ✓
- Bochum ✓
- Ca. 2 Millionen Einwohner im Radius

### 3. Slot Management

```typescript
interface TimeSlot {
  id: string;
  pickupTime: Date;
  estimatedReturnTime: Date;
  availableJockeys: number;
  availableVehicles: number;
  workshop: string;
}

async function getAvailableSlots(
  date: Date,
  service: string
): Promise<TimeSlot[]> {
  const serviceDuration = getServiceDuration(service);

  // Get workshop capacity
  const capacity = await getWorkshopCapacity('witten', date);

  // Get available jockeys
  const jockeys = await getAvailableJockeys(date);

  // Get available Ronja vehicles
  const vehicles = await getAvailableVehicles(date);

  // Generate slots (08:00 - 17:00, every hour)
  const slots = generateTimeSlots(date, {
    startHour: 8,
    endHour: 17,
    intervalMinutes: 60
  });

  // Filter by availability
  return slots.filter(slot => {
    const overlappingBookings = getOverlappingBookings(slot);
    return (
      overlappingBookings < capacity.max &&
      jockeys.length > overlappingBookings &&
      vehicles.length > overlappingBookings
    );
  });
}
```

### 4. Jockey Assignment

```typescript
interface Jockey {
  id: string;
  name: string;
  phone: string;
  location: Location;
  status: 'available' | 'busy' | 'off-duty';
  assignedVehicle?: string;
}

async function assignJockey(booking: Booking): Promise<Assignment> {
  // Find available jockey closest to pickup location
  const jockeys = await getAvailableJockeys(booking.pickupTime);

  const closest = jockeys
    .map(jockey => ({
      jockey,
      distance: calculateDistance(jockey.location, booking.pickupAddress)
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  // Assign Ronja vehicle
  const vehicle = await assignVehicle(booking);

  // Create assignment
  const assignment = await prisma.jockeyAssignment.create({
    data: {
      bookingId: booking.id,
      jockeyId: closest.jockey.id,
      vehicleId: vehicle.id,
      pickupTime: booking.pickupTime,
      pickupAddress: booking.pickupAddress,
      status: 'assigned'
    }
  });

  // Notify jockey
  await notifyJockey(closest.jockey, assignment);

  return assignment;
}
```

## Customer Journey

### Phase 1: Booking Confirmation

After payment successful:

```typescript
async function confirmBooking(booking: Booking) {
  // 1. Assign jockey and vehicle
  const assignment = await assignJockey(booking);

  // 2. Send confirmation email
  await sendEmail({
    to: booking.user.email,
    template: 'booking-confirmed',
    data: {
      booking,
      assignment,
      pickupTime: formatDateTime(booking.pickupTime),
      estimatedReturn: formatDateTime(booking.estimatedReturnTime),
      jockey: assignment.jockey,
      vehicle: {
        make: assignment.vehicle.make,
        model: assignment.vehicle.model,
        licensePlate: assignment.vehicle.licensePlate,
        color: assignment.vehicle.color
      }
    }
  });

  // 3. Send SMS reminder 24h before
  await scheduleReminder({
    bookingId: booking.id,
    scheduledFor: subHours(booking.pickupTime, 24),
    type: 'sms',
    message: `Erinnerung: Morgen um ${format(booking.pickupTime, 'HH:mm')} holen wir Ihr Fahrzeug ab.`
  });
}
```

### Phase 2: Pre-Pickup (24h before)

```typescript
async function sendPrePickupReminder(booking: Booking) {
  await sendEmail({
    to: booking.user.email,
    template: 'pre-pickup-reminder',
    data: {
      pickupTime: formatDateTime(booking.pickupTime),
      checklist: [
        'Fahrzeugschlüssel bereithalten',
        'Fahrzeugschein griffbereit haben',
        'Persönliche Gegenstände aus dem Auto nehmen',
        'Tankfüllung notieren (optional)'
      ]
    }
  });
}
```

### Phase 3: Pickup

```typescript
async function executePickup(assignment: JockeyAssignment) {
  // 1. Jockey arrives
  await updateAssignment(assignment.id, {
    status: 'at-pickup-location',
    arrivedAt: new Date()
  });

  // 2. Customer handover
  const handover = await createHandover({
    assignmentId: assignment.id,
    customerPresent: true,
    vehicleCondition: 'good',
    fuelLevel: 0.75,
    mileage: 45230,
    // Photos taken with driver app
    photos: [
      'front.jpg',
      'rear.jpg',
      'left.jpg',
      'right.jpg',
      'dashboard.jpg'
    ],
    // Capture Fahrzeugschein data
    vehicleRegistration: {
      vin: 'WVWZZZ1KZBW123456',
      make: 'Volkswagen',
      model: 'Golf',
      firstRegistration: '2018-03-15',
      licensePlate: 'DO AB 1234'
    },
    // Customer signature
    customerSignature: 'base64_signature_data',
    notes: 'Kunde erwähnt Wischerblätter prüfen'
  });

  // 3. Provide replacement vehicle
  await handoverReplacementVehicle({
    assignmentId: assignment.id,
    vehicleId: assignment.vehicleId,
    customerSignature: 'base64_signature_data'
  });

  // 4. Drive to workshop
  await updateAssignment(assignment.id, {
    status: 'in-transit-to-workshop',
    departedPickupAt: new Date()
  });

  // 5. Notify customer
  await sendPushNotification({
    userId: booking.userId,
    title: 'Fahrzeug abgeholt',
    body: 'Ihr Fahrzeug ist auf dem Weg zur Werkstatt.',
    data: { bookingId: booking.id }
  });
}
```

### Phase 4: Workshop Delivery

```typescript
async function deliverToWorkshop(assignment: JockeyAssignment) {
  // 1. Arrive at workshop
  await updateAssignment(assignment.id, {
    status: 'at-workshop',
    arrivedWorkshopAt: new Date()
  });

  // 2. Workshop handover
  await createWorkshopHandover({
    assignmentId: assignment.id,
    workshopStaff: 'mechanic_id',
    vehicleCondition: 'good',
    specialInstructions: handover.notes,
    photos: handover.photos
  });

  // 3. Update booking status
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'in-workshop',
      workshopCheckinAt: new Date()
    }
  });

  // 4. Notify customer
  await sendPushNotification({
    userId: booking.userId,
    title: 'Werkstatt erreicht',
    body: 'Ihr Fahrzeug ist in der Werkstatt angekommen. Wir beginnen mit der Arbeit.',
    data: { bookingId: booking.id }
  });
}
```

### Phase 5: Service in Progress

During service, workshop may find additional work needed:

```typescript
async function requestExtension(booking: Booking, extension: ExtensionRequest) {
  // Create extension with photos/videos
  const ext = await prisma.extension.create({
    data: {
      bookingId: booking.id,
      description: extension.description,
      items: extension.items,
      totalAmount: extension.totalAmount,
      images: extension.images,
      videos: extension.videos,
      status: 'pending'
    }
  });

  // Create payment intent (authorize, don't capture)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: extension.totalAmount,
    currency: 'eur',
    capture_method: 'manual',
    metadata: {
      bookingId: booking.id,
      extensionId: ext.id
    }
  });

  // Send notification with rich media
  await sendPushNotification({
    userId: booking.userId,
    title: 'Zusätzliche Arbeiten vorgeschlagen',
    body: `${formatPrice(extension.totalAmount)} - ${extension.description}`,
    data: {
      extensionId: ext.id,
      bookingId: booking.id,
      images: extension.images,
      clientSecret: paymentIntent.client_secret
    }
  });
}
```

### Phase 6: Return Preparation

```typescript
async function prepareReturn(booking: Booking) {
  // 1. Service completed
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'ready-for-return',
      serviceCompletedAt: new Date()
    }
  });

  // 2. Car wash (included in service)
  await scheduleCarWash({
    bookingId: booking.id,
    workshopId: 'witten'
  });

  // 3. Assign jockey for return
  const returnAssignment = await assignJockey({
    ...booking,
    type: 'return-trip'
  });

  // 4. Notify customer
  await sendPushNotification({
    userId: booking.userId,
    title: 'Service abgeschlossen',
    body: `Ihr Fahrzeug ist fertig und wird um ${format(booking.estimatedReturnTime, 'HH:mm')} zurückgebracht.`,
    data: { bookingId: booking.id }
  });
}
```

### Phase 7: Return Delivery

```typescript
async function executeReturn(assignment: JockeyAssignment) {
  // 1. Leave workshop
  await updateAssignment(assignment.id, {
    status: 'in-transit-to-customer',
    departedWorkshopAt: new Date()
  });

  // 2. Send ETA updates
  await sendETAUpdate({
    userId: booking.userId,
    estimatedArrival: calculateETA(assignment),
    jockeyLocation: assignment.currentLocation
  });

  // 3. Arrive at customer
  await updateAssignment(assignment.id, {
    status: 'at-return-location',
    arrivedAt: new Date()
  });

  // 4. Customer handover
  const returnHandover = await createReturnHandover({
    assignmentId: assignment.id,
    customerPresent: true,
    vehicleCondition: 'excellent',
    fuelLevel: 0.75, // Same as pickup
    mileage: 45235, // Only workshop mileage added
    carWashed: true,
    photos: [
      'front_after.jpg',
      'rear_after.jpg',
      'interior_clean.jpg'
    ],
    // Ronja Screen Cleaner left in car
    merchandiseProvided: ['screen-cleaner'],
    customerSignature: 'base64_signature_data'
  });

  // 5. Retrieve replacement vehicle
  await retrieveReplacementVehicle({
    assignmentId: assignment.id,
    vehicleId: assignment.vehicleId
  });

  // 6. Complete booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  });

  // 7. Request review
  await scheduleReviewRequest({
    bookingId: booking.id,
    scheduledFor: addHours(new Date(), 2) // 2 hours after completion
  });
}
```

### Phase 8: Post-Service

```typescript
async function requestReview(booking: Booking) {
  await sendEmail({
    to: booking.user.email,
    template: 'review-request',
    data: {
      booking,
      reviewLink: `${process.env.APP_URL}/bookings/${booking.id}/review`,
      googleReviewLink: process.env.GOOGLE_REVIEW_URL
    }
  });

  // Incentive for review
  await createPromoCode({
    userId: booking.userId,
    code: `REVIEW${booking.id.slice(0, 8).toUpperCase()}`,
    discount: 1000, // 10€
    expiresAt: addMonths(new Date(), 3),
    conditions: 'Für nächste Buchung'
  });
}
```

## Vehicle Management

### Fleet Tracking

```typescript
interface RonjaVehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'benzin' | 'diesel' | 'electric';
  status: 'available' | 'in-use' | 'maintenance' | 'charging';
  location: Location;
  lastServiceDate: Date;
  nextServiceDue: Date;
  mileage: number;
}

async function getAvailableVehicles(date: Date): Promise<RonjaVehicle[]> {
  return prisma.vehicle.findMany({
    where: {
      status: 'available',
      nextServiceDue: { gt: date },
      NOT: {
        assignments: {
          some: {
            pickupTime: {
              lte: addHours(date, 8),
              gte: subHours(date, 8)
            }
          }
        }
      }
    }
  });
}
```

### Maintenance Scheduling

```typescript
async function scheduleVehicleMaintenance(vehicle: RonjaVehicle) {
  if (vehicle.mileage >= vehicle.nextServiceDue) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        status: 'maintenance'
      }
    });

    // Book maintenance slot
    await createMaintenanceBooking({
      vehicleId: vehicle.id,
      scheduledFor: getNextAvailableMaintenanceSlot(),
      type: 'routine-service'
    });
  }
}
```

## Driver App Features

Jockey needs mobile app with:

- [ ] Daily assignment list
- [ ] Navigation to pickup/return addresses
- [ ] Photo capture for handovers
- [ ] Digital signature collection
- [ ] Fahrzeugschein scanner (OCR)
- [ ] Vehicle condition checklist
- [ ] Direct communication with workshop
- [ ] Customer contact (call/message)
- [ ] Real-time status updates

## Capacity Planning

### Initial Witten Setup

- **Jockeys needed**: 3-5 for start
- **Ronja vehicles**: 7-8 at Witten
- **Max daily capacity**: 15-20 bookings
- **Service radius**: 60km

### Scaling Considerations

When expanding to other cities:
- Each location needs 3+ jockeys
- 5-10 Ronja vehicles per location
- Separate slot management per workshop
- Regional pricing possible

## Error Handling

### No-Show Prevention

```typescript
// Require upfront payment (already paid at booking)
// Send multiple reminders
// Call customer 1h before if not confirmed
```

### Jockey Unavailability

```typescript
async function handleJockeyUnavailable(assignment: JockeyAssignment) {
  // Try to reassign
  const alternateJockey = await findAlternateJockey(assignment.pickupTime);

  if (alternateJockey) {
    await reassignJockey(assignment, alternateJockey);
  } else {
    // Reschedule booking
    await requestReschedule(assignment.booking);
  }
}
```

### Vehicle Breakdown

```typescript
async function handleVehicleIssue(vehicle: RonjaVehicle) {
  // Mark as maintenance
  await prisma.vehicle.update({
    where: { id: vehicle.id },
    data: { status: 'maintenance' }
  });

  // Reassign all bookings with this vehicle
  const affectedAssignments = await getAssignmentsWithVehicle(vehicle.id);

  for (const assignment of affectedAssignments) {
    const alternateVehicle = await findAlternateVehicle();
    await reassignVehicle(assignment, alternateVehicle);
  }
}
```

## Key Success Metrics

Track:
- On-time pickup rate (target: >95%)
- On-time return rate (target: >95%)
- Customer satisfaction (target: >4.5/5)
- Vehicle utilization (target: 60-80%)
- Average trip duration
- Fuel costs per trip
- Jockey productivity

## Ronja Branding

Wichtig aus Transcript:
- Ronja-Fahrzeuge als "rollende Werbung"
- Nachbarn sehen das Auto und fragen nach
- Mundpropaganda-Effekt
- Kunde erzählt über den Service
- Screen Cleaner als Merchandise ins Auto legen
