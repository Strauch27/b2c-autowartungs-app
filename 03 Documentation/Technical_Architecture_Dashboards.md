# Technical Architecture: Jockey & Customer Dashboards
**B2C Autowartungs-App (AutoConcierge)**

---

**Document Version:** 1.0
**Date:** February 1, 2026
**Author:** Technical Lead Architect
**Status:** Ready for Implementation
**Target Audience:** Engineering Team, Technical Stakeholders

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Component Design](#component-design)
6. [API Design](#api-design)
7. [Database Schema](#database-schema)
8. [Mobile Considerations](#mobile-considerations)
9. [Security & Performance](#security--performance)
10. [Real-time Updates Strategy](#real-time-updates-strategy)
11. [Testing Strategy](#testing-strategy)
12. [Implementation Phases](#implementation-phases)
13. [Technology Stack & Libraries](#technology-stack--libraries)
14. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
15. [Code Examples](#code-examples)

---

## Executive Summary

### Purpose
This document provides comprehensive technical architecture and implementation guidance for two mission-critical dashboards that enable the AutoConcierge business model:

1. **Customer Dashboard** - Extension approval workflow (P0 - Revenue Critical)
2. **Jockey Dashboard** - Pickup/delivery workflows (P0 - Service Differentiator)

### Business Impact
- **Extension Approval**: Without this, workshop cannot charge for additional work (direct revenue loss)
- **Jockey Workflows**: Without this, customers must drop off vehicles (eliminates competitive advantage)
- **E2E Tests**: 248 tests are written and waiting for these implementations

### Technical Scope
- Next.js 14 App Router architecture
- React Server Components + Client Components
- Stripe Payment Integration (manual capture for extensions)
- Real-time status updates (WebSocket/SSE)
- Mobile-first jockey interface
- Desktop + Mobile responsive customer interface

### Key Design Principles
1. **Progressive Enhancement** - Core functionality works without JavaScript
2. **Mobile-First** - Jockey dashboard optimized for 10-12" tablets
3. **Type Safety** - TypeScript strict mode throughout
4. **Error Resilience** - Graceful degradation, retry mechanisms
5. **Payment Security** - PCI compliance via Stripe, no card data on servers
6. **Real-time UX** - Optimistic UI updates with server reconciliation

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Customer Dashboard (Desktop/Mobile)   │  Jockey Dashboard  │
│  - Extension Approval                  │  (Tablet-First)    │
│  - Booking Management                  │  - Pickup Workflow │
│  - Notifications                       │  - Delivery Flow   │
└──────────────────┬──────────────────────┴──────────────────┘
                   │
                   │ HTTPS / WebSocket
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Next.js 14 App Router                       │
├─────────────────────────────────────────────────────────────┤
│  App Routes:                                                 │
│  /[locale]/customer/*  │  /[locale]/jockey/*                │
│  - SSR for SEO         │  - CSR for interactivity           │
│  - API Routes          │  - Real-time updates               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ REST API / tRPC (optional future)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  Backend Services (Node.js)                  │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                                │
│  - BookingController   - ExtensionController                │
│  - JockeyController    - NotificationController             │
│                                                              │
│  Services:                                                   │
│  - PaymentService (Stripe)  - NotificationService (FCM)     │
│  - StorageService (S3)      - EmailService                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────────┬────────────┐
        │                     │                  │            │
┌───────▼────────┐  ┌────────▼─────────┐  ┌────▼─────┐  ┌──▼─────┐
│   PostgreSQL   │  │  Stripe Payment  │  │   FCM    │  │   S3   │
│   (Prisma)     │  │  (PaymentIntent) │  │  (Push)  │  │(Photos)│
└────────────────┘  └──────────────────┘  └──────────┘  └────────┘
```

### Architecture Patterns

**1. Feature-Based Organization**
```
/app/[locale]/customer/
  /dashboard/
  /bookings/[id]/
  /notifications/

/app/[locale]/jockey/
  /dashboard/
  /assignments/[id]/
```

**2. Component Architecture**
- **Smart Containers** - Data fetching, state management
- **Dumb Components** - Pure presentation, no business logic
- **Shared UI** - shadcn/ui component library

**3. Data Flow**
- **Server → Client**: Server Components for initial data
- **Client → Server**: Client Components for mutations
- **Real-time**: WebSocket/SSE for live updates

---

## Frontend Architecture

### Next.js 14 App Router Structure

```
/app
  /[locale]                          # i18n routing
    /customer
      /dashboard
        page.tsx                     # Dashboard page (CSR)
        loading.tsx                  # Loading state
        error.tsx                    # Error boundary
      /bookings
        /[id]
          page.tsx                   # Booking detail (SSR + CSR)
          layout.tsx                 # Tabs layout
      /notifications
        page.tsx                     # Notification center

    /jockey
      /dashboard
        page.tsx                     # Assignment list (CSR)
      /assignments
        /[id]
          page.tsx                   # Assignment detail

/components
  /customer
    ExtensionApprovalModal.tsx       # CRITICAL - Extension approval
    ExtensionCard.tsx                # Extension summary card
    ExtensionList.tsx                # List of extensions
    BookingDetailTabs.tsx            # Tabs: Details, Extensions, Photos
    StatusTimeline.tsx               # Visual status progression
    NotificationCenter.tsx           # ✅ EXISTS - needs enhancement
    BookingSummary.tsx               # ✅ EXISTS

  /jockey
    AssignmentCard.tsx               # NEW - Assignment summary
    AssignmentList.tsx               # NEW - List of assignments
    HandoverModal.tsx                # ✅ EXISTS - needs enhancement
    DeliveryModal.tsx                # NEW - Delivery workflow
    SignaturePad.tsx                 # NEW - Digital signature capture
    PhotoCapture.tsx                 # NEW - Camera integration
    NavigationButton.tsx             # NEW - Deep link to maps

  /shared
    PaymentForm.tsx                  # ✅ EXISTS - Stripe integration
    ImageLightbox.tsx                # NEW - Photo viewer
    VideoPlayer.tsx                  # NEW - Video playback
    StatusBadge.tsx                  # NEW - Consistent status display

  /ui                                # ✅ EXISTS - shadcn/ui components
    button.tsx
    card.tsx
    dialog.tsx
    badge.tsx
    toast.tsx
    etc.
```

### State Management Strategy

**Recommendation: React Query + Zustand**

**Why not Redux?**
- Overhead too high for this use case
- React Query handles server state elegantly
- Zustand for minimal client state

**Implementation:**

```typescript
// /lib/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.getById(id),
    staleTime: 30000, // 30s
    refetchOnWindowFocus: true,
  });
}

export function useExtensionApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, extensionId, paymentMethodId }) =>
      extensionsApi.approve(bookingId, extensionId, paymentMethodId),
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries(['bookings', variables.bookingId]);
      const previous = queryClient.getQueryData(['bookings', variables.bookingId]);

      queryClient.setQueryData(['bookings', variables.bookingId], (old: any) => ({
        ...old,
        extensions: old.extensions.map((ext: any) =>
          ext.id === variables.extensionId
            ? { ...ext, status: 'APPROVED' }
            : ext
        ),
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['bookings', variables.bookingId],
        context?.previous
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['bookings', variables.bookingId]);
      queryClient.invalidateQueries(['notifications']);
    },
  });
}
```

**Client State (Zustand):**

```typescript
// /lib/stores/useNotificationStore.ts
import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
```

### Real-time Update Strategy

**Evaluation:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **WebSockets** | Bidirectional, low latency, efficient | Complex setup, connection management, scaling | ⭐ **RECOMMENDED** for production |
| **Server-Sent Events** | Simple, HTTP-based, auto-reconnect | Unidirectional only | Good fallback |
| **Polling** | Simple, works everywhere | Inefficient, higher latency | Use as last fallback |

**Recommended Architecture: Progressive Enhancement**

```typescript
// /lib/realtime/useRealtimeUpdates.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type UpdateChannel = 'bookings' | 'extensions' | 'assignments';

export function useRealtimeUpdates(channel: UpdateChannel, id?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Try WebSocket first
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/${channel}/${id || ''}`);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      // Invalidate relevant queries
      if (channel === 'bookings' && id) {
        queryClient.invalidateQueries(['bookings', id]);
      } else if (channel === 'extensions') {
        queryClient.invalidateQueries(['bookings']);
        queryClient.invalidateQueries(['notifications']);
      } else if (channel === 'assignments') {
        queryClient.invalidateQueries(['assignments']);
      }

      // Show toast notification
      if (update.type === 'EXTENSION_CREATED') {
        toast.info('New extension requires approval');
      }
    };

    ws.onerror = () => {
      // Fallback to polling
      const interval = setInterval(() => {
        queryClient.invalidateQueries([channel, id]);
      }, 10000); // Poll every 10s

      return () => clearInterval(interval);
    };

    return () => ws.close();
  }, [channel, id, queryClient]);
}
```

---

## Backend Architecture

### API Endpoints Design

**Design Principles:**
1. **RESTful** - Standard HTTP methods (GET, POST, PATCH, DELETE)
2. **Resource-oriented** - URLs represent resources, not actions
3. **Consistent error handling** - Standard error format
4. **Versioning** - API versioning via URL (`/api/v1/...`)
5. **Authentication** - JWT tokens in Authorization header

### Customer APIs

```typescript
// Extension Management
GET    /api/v1/customer/bookings/:bookingId/extensions
POST   /api/v1/customer/bookings/:bookingId/extensions/:extId/approve
POST   /api/v1/customer/bookings/:bookingId/extensions/:extId/decline

// Bookings
GET    /api/v1/customer/bookings
GET    /api/v1/customer/bookings/:id
GET    /api/v1/customer/bookings/:id/timeline
GET    /api/v1/customer/bookings/:id/photos
GET    /api/v1/customer/bookings/:id/documents

// Notifications
GET    /api/v1/customer/notifications
GET    /api/v1/customer/notifications/unread-count
PATCH  /api/v1/customer/notifications/:id/mark-read
PATCH  /api/v1/customer/notifications/mark-all-read

// Documents
GET    /api/v1/customer/bookings/:id/service-report    # Returns PDF
GET    /api/v1/customer/bookings/:id/receipt           # Returns PDF
GET    /api/v1/customer/bookings/:id/photos/download   # Returns ZIP
```

### Jockey APIs

```typescript
// Assignments
GET    /api/v1/jockey/assignments
GET    /api/v1/jockey/assignments/:id
PATCH  /api/v1/jockey/assignments/:id/status
POST   /api/v1/jockey/assignments/:id/start-pickup
POST   /api/v1/jockey/assignments/:id/complete-pickup
POST   /api/v1/jockey/assignments/:id/start-delivery
POST   /api/v1/jockey/assignments/:id/complete-delivery

// Photos & Signatures
POST   /api/v1/jockey/assignments/:id/photos           # Multipart upload
POST   /api/v1/jockey/assignments/:id/signature        # Base64 image

// Vehicle Documentation
POST   /api/v1/jockey/assignments/:id/fahrzeugschein   # VIN capture
```

### Extension Payment APIs

**CRITICAL: Manual Capture Flow**

```typescript
// Create authorization (customer approval)
POST   /api/v1/payment/extension/authorize
Request: {
  bookingId: string;
  extensionId: string;
  paymentMethodId: string;  // From Stripe Elements
  amount: number;            // In cents
}
Response: {
  paymentIntentId: string;
  clientSecret: string;
  status: 'requires_action' | 'succeeded';
}

// Capture payment (after work completed)
POST   /api/v1/payment/extension/capture
Request: {
  paymentIntentId: string;
  extensionId: string;
  amount?: number;  // Optional: capture partial amount
}
Response: {
  status: 'succeeded' | 'failed';
  amountCaptured: number;
}

// Cancel authorization (work cannot be completed)
POST   /api/v1/payment/extension/cancel
Request: {
  paymentIntentId: string;
  reason: string;
}

// Get payment status
GET    /api/v1/payment/extension/:paymentIntentId/status
Response: {
  status: 'authorized' | 'captured' | 'canceled' | 'failed';
  amount: number;
  amountCaptured: number;
  createdAt: string;
  capturedAt?: string;
}
```

### Backend Route Structure

```
/backend/src
  /routes
    bookings.routes.ts           # ✅ EXISTS - needs enhancement
    extensions.routes.ts         # NEW - Extension CRUD
    jockeys.routes.ts            # NEW - Jockey assignments
    payment.routes.ts            # ✅ EXISTS - needs manual capture
    notifications.routes.ts      # ✅ EXISTS - needs enhancement
    upload.routes.ts             # ✅ EXISTS - for photo uploads

  /controllers
    ExtensionController.ts       # NEW - Extension logic
    JockeyController.ts          # NEW - Assignment logic
    PaymentController.ts         # ENHANCE - Manual capture
    NotificationController.ts    # ENHANCE - Real-time delivery

  /services
    ExtensionService.ts          # NEW - Business logic
    JockeyService.ts             # NEW - Assignment management
    PaymentService.ts            # ENHANCE - Stripe manual capture
    NotificationService.ts       # ENHANCE - FCM integration
    StorageService.ts            # ✅ EXISTS - S3 uploads

  /middleware
    auth.middleware.ts           # ✅ EXISTS - JWT validation
    rbac.middleware.ts           # ENHANCE - Role-based access
    upload.middleware.ts         # ✅ EXISTS - File validation
    rateLimit.middleware.ts      # NEW - API rate limiting
```

### API Implementation Example: Extension Approval

```typescript
// /backend/src/controllers/ExtensionController.ts
import { Request, Response } from 'express';
import { ExtensionService } from '../services/ExtensionService';
import { PaymentService } from '../services/PaymentService';
import { NotificationService } from '../services/NotificationService';
import { z } from 'zod';

const ApprovalSchema = z.object({
  paymentMethodId: z.string(),
  customerNote: z.string().optional(),
});

export class ExtensionController {
  constructor(
    private extensionService: ExtensionService,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  async approveExtension(req: Request, res: Response) {
    try {
      const { bookingId, extensionId } = req.params;
      const customerId = req.user.id; // From auth middleware

      // 1. Validate input
      const { paymentMethodId, customerNote } = ApprovalSchema.parse(req.body);

      // 2. Verify extension exists and belongs to this customer
      const extension = await this.extensionService.getById(extensionId);
      if (!extension) {
        return res.status(404).json({ error: 'Extension not found' });
      }
      if (extension.booking.customerId !== customerId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      if (extension.status !== 'PENDING') {
        return res.status(400).json({ error: 'Extension already processed' });
      }

      // 3. Create payment authorization (MANUAL CAPTURE)
      const paymentIntent = await this.paymentService.createExtensionAuthorization({
        amount: extension.totalAmount,
        paymentMethodId,
        customerId: extension.booking.customer.stripeCustomerId,
        metadata: {
          bookingId,
          extensionId,
          type: 'EXTENSION',
        },
      });

      // 4. Handle 3D Secure if required
      if (paymentIntent.status === 'requires_action') {
        return res.json({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      }

      // 5. Update extension status
      const updatedExtension = await this.extensionService.approve({
        extensionId,
        paymentIntentId: paymentIntent.id,
        approvedAt: new Date(),
        customerNote,
      });

      // 6. Update booking total
      await this.extensionService.updateBookingTotal(bookingId);

      // 7. Send notifications
      await this.notificationService.sendExtensionApproved({
        customerId,
        workshopId: extension.booking.workshopId,
        extension: updatedExtension,
      });

      // 8. Emit real-time event
      req.io.to(`booking:${bookingId}`).emit('extension:approved', {
        extensionId,
        status: 'APPROVED',
      });

      return res.json({
        success: true,
        extension: updatedExtension,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
        },
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      if (error.type === 'StripeCardError') {
        return res.status(402).json({ error: error.message });
      }

      console.error('Extension approval failed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

---

## Component Design

### Customer Dashboard Components

#### 1. ExtensionApprovalModal (CRITICAL)

**Purpose:** Allow customer to review and approve/decline extensions with payment.

**File:** `/components/customer/ExtensionApprovalModal.tsx`

**Props:**
```typescript
interface ExtensionApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extension: Extension;
  bookingId: string;
  onApprove: (paymentMethodId: string) => Promise<void>;
  onDecline: (reason?: string) => Promise<void>;
}
```

**Features:**
- View extension description (scrollable)
- Itemized cost breakdown table
- Photo/video gallery with lightbox
- Total amount prominently displayed
- Approve button triggers Stripe payment flow
- Decline button with optional reason textarea
- Loading states during payment processing
- Error handling with user-friendly messages

**Complexity:** **XL** (Stripe integration, multiple states, photo viewer)

**Dependencies:**
- Stripe Elements (@stripe/react-stripe-js)
- ImageLightbox component
- PaymentForm component
- React Hook Form + Zod validation

**Implementation Notes:**
```typescript
// Key sections:
// 1. Extension details display
// 2. Items table with calculations
// 3. Media gallery (photos/videos)
// 4. Payment form (Stripe Elements)
// 5. Decline reason form
// 6. Loading and error states

// State management:
const [step, setStep] = useState<'review' | 'payment' | 'decline'>('review');
const [isProcessing, setIsProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

#### 2. BookingDetailTabs

**Purpose:** Tabbed interface for booking details, extensions, photos, documents.

**File:** `/components/customer/BookingDetailTabs.tsx`

**Props:**
```typescript
interface BookingDetailTabsProps {
  booking: BookingWithExtensions;
  defaultTab?: 'details' | 'extensions' | 'photos' | 'documents';
}
```

**Features:**
- Details tab: Vehicle info, services, pricing, status timeline
- Extensions tab: List of extensions with pending badge count
- Photos tab: Before/after photo gallery
- Documents tab: Downloadable PDFs and ZIP

**Complexity:** **M**

**Implementation:**
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function BookingDetailTabs({ booking, defaultTab = 'details' }) {
  const pendingExtensions = booking.extensions.filter(e => e.status === 'PENDING').length;

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="extensions">
          Extensions {pendingExtensions > 0 && <Badge>{pendingExtensions}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <StatusTimeline booking={booking} />
        <BookingSummary booking={booking} />
      </TabsContent>

      <TabsContent value="extensions">
        <ExtensionList extensions={booking.extensions} bookingId={booking.id} />
      </TabsContent>

      <TabsContent value="photos">
        <PhotoGallery photos={booking.photos} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentList bookingId={booking.id} />
      </TabsContent>
    </Tabs>
  );
}
```

---

#### 3. StatusTimeline

**Purpose:** Visual representation of booking status progression.

**File:** `/components/customer/StatusTimeline.tsx`

**Props:**
```typescript
interface StatusTimelineProps {
  booking: Booking;
}
```

**Features:**
- Horizontal timeline with checkpoints
- Green checkmark for completed steps
- Blue highlight for current step
- Gray for future steps
- Timestamps for each completed step

**Complexity:** **S**

**Visual Design:**
```
○──────●──────●──────◐──────○──────○
│      │      │      │      │      │
Confirmed  Pickup  Workshop  Service  Delivery
```

---

### Jockey Dashboard Components

#### 1. AssignmentCard

**Purpose:** Display assignment summary with action buttons.

**File:** `/components/jockey/AssignmentCard.tsx`

**Props:**
```typescript
interface AssignmentCardProps {
  assignment: JockeyAssignment;
  onNavigate: () => void;
  onCall: () => void;
  onStartPickup: () => void;
  onDocumentHandover: () => void;
}
```

**Features:**
- Status badge (Pending/On Route/Completed)
- Customer name and vehicle details
- Pickup/delivery time window
- Address with MapPin icon
- Navigation button (deep link to maps app)
- Call button (deep link to phone dialer)
- Action button (changes based on status)
- Pickup vs Delivery indicator

**Complexity:** **M**

**Implementation Highlights:**
```typescript
// Deep link to navigation
const handleNavigate = () => {
  const address = encodeURIComponent(`${assignment.pickupAddress}, ${assignment.pickupPostalCode} ${assignment.pickupCity}`);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    window.open(`maps://maps.apple.com/?q=${address}`);
  } else {
    window.open(`geo:0,0?q=${address}`);
  }
};

// Deep link to phone
const handleCall = () => {
  if (assignment.customer?.phone) {
    window.location.href = `tel:${assignment.customer.phone}`;
  }
};
```

---

#### 2. HandoverModal (ENHANCE EXISTING)

**Purpose:** Multi-step workflow for vehicle pickup documentation.

**File:** `/components/jockey/HandoverModal.tsx` (EXISTS - needs enhancement)

**Current State:** Basic structure exists
**Enhancements Needed:**
1. Step-by-step wizard (4 steps)
2. Photo capture for 4 vehicle angles
3. Fahrzeugschein (vehicle registration) capture
4. Customer signature pad
5. Ronja handover with signature
6. Upload progress indicator
7. Offline support (cache photos locally)

**Steps:**
```
Step 1: Vehicle Photos
├─ Front (required)
├─ Back (required)
├─ Left side (required)
├─ Right side (required)
└─ Dashboard/Damage (optional)

Step 2: Fahrzeugschein
├─ Take photo of registration document
└─ OR manually enter VIN + registration number

Step 3: Customer Signature
└─ Customer signs to confirm vehicle handover

Step 4: Ronja Handover
├─ Show Ronja details
├─ Customer signs to confirm Ronja receipt
└─ Optional: Photo of Ronja handover
```

**Complexity:** **XL** (Multi-step, photo capture, signatures, upload)

**Photo Capture Implementation:**
```typescript
// HTML5 camera access
<input
  type="file"
  accept="image/*"
  capture="environment"  // Use rear camera
  onChange={handlePhotoCapture}
  ref={fileInputRef}
/>

const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Compress image before upload
  const compressedFile = await compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  // Create preview
  const preview = URL.createObjectURL(compressedFile);
  setPhotos((prev) => [...prev, { file: compressedFile, preview, type }]);
};
```

**Signature Pad Implementation:**
```typescript
import SignatureCanvas from 'react-signature-canvas';

<SignatureCanvas
  ref={signatureRef}
  canvasProps={{
    width: 600,
    height: 200,
    className: 'border rounded-lg',
  }}
  onEnd={() => setHasSignature(true)}
/>

const getSignatureData = () => {
  if (!signatureRef.current) return null;
  return signatureRef.current.toDataURL('image/png');
};
```

---

#### 3. DeliveryModal (NEW)

**Purpose:** Multi-step workflow for vehicle return to customer.

**File:** `/components/jockey/DeliveryModal.tsx`

**Similar to HandoverModal but with differences:**

**Steps:**
```
Step 1: Service Photos Review
├─ Display before/after photos from workshop
└─ Show to customer

Step 2: Vehicle Return Photos
├─ Front (required)
├─ Back (required)
├─ Left side (required)
└─ Right side (required)

Step 3: Customer Signature
└─ Customer signs to confirm vehicle receipt

Step 4: Ronja Return
├─ Customer returns Ronja keys
├─ Jockey inspects Ronja condition
├─ Damage report (if any)
└─ Customer signs Ronja return

Step 5: Complete Delivery
└─ Confirm all items complete
```

**Complexity:** **XL**

---

#### 4. SignaturePad (NEW)

**Purpose:** Reusable signature capture component.

**File:** `/components/jockey/SignaturePad.tsx`

**Props:**
```typescript
interface SignaturePadProps {
  onSave: (signature: string) => void;
  label?: string;
  required?: boolean;
}
```

**Features:**
- Canvas for finger/stylus drawing
- Clear button
- Confirm button
- Touch-optimized for tablets
- Export as PNG base64

**Complexity:** **S**

**Recommended Library:** `react-signature-canvas`

---

## Database Schema

### Current Schema Analysis

**Existing Models (Prisma):**
- ✅ User (with roles: CUSTOMER, JOCKEY, WORKSHOP)
- ✅ Booking (with status enum)
- ✅ Extension (with status enum)
- ✅ NotificationLog
- ✅ Vehicle

**Schema Gaps & Recommendations:**

### 1. JockeyAssignment Model (NEW)

**Problem:** Currently, jockey assignments are inferred from Booking.jockeyId field. This lacks:
- Separate pickup vs delivery tracking
- Photo/signature storage
- Status granularity

**Recommendation: Create dedicated JockeyAssignment model**

```prisma
model JockeyAssignment {
  id        String @id @default(cuid())
  bookingId String
  booking   Booking @relation(fields: [bookingId], references: [id])
  jockeyId  String
  jockey    User @relation("JockeyAssignments", fields: [jockeyId], references: [id])

  // Assignment details
  type      AssignmentType // PICKUP or DELIVERY
  status    AssignmentStatus @default(PENDING)

  // Scheduling
  scheduledDate DateTime
  scheduledTime String // e.g., "09:00-11:00"

  // Documentation
  photos        Json? // [{type: 'FRONT'|'BACK'|'LEFT'|'RIGHT', url: string}]
  customerSignature String? // Base64 PNG
  ronjaSignature    String? // Base64 PNG
  fahrzeugscheinUrl String? // S3 URL
  vin               String? // Vehicle Identification Number

  // Completion tracking
  startedAt    DateTime?
  completedAt  DateTime?
  notes        String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([jockeyId, status])
  @@index([bookingId])
  @@index([scheduledDate])
}

enum AssignmentType {
  PICKUP
  DELIVERY
}

enum AssignmentStatus {
  PENDING
  ASSIGNED
  EN_ROUTE
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**Migration Strategy:**
```bash
# Create migration
npx prisma migrate dev --name add_jockey_assignments

# Create migration script to populate existing assignments
# from Booking.jockeyId
```

---

### 2. Extension Model Enhancements

**Current Schema:**
```prisma
model Extension {
  id        String  @id @default(cuid())
  bookingId String

  description String   @db.Text
  items       Json     // [{name, price, quantity}]
  totalAmount Int      // In cents
  images      String[] // S3 URLs
  videos      String[] // S3 URLs

  status ExtensionStatus @default(PENDING)

  paymentIntentId String?
  paidAt          DateTime?

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  approvedAt DateTime?
  declinedAt DateTime?
}
```

**Recommendations:**

**Add Payment Status Tracking:**
```prisma
model Extension {
  // ... existing fields ...

  // ENHANCED: Payment tracking
  paymentIntentId String?
  paymentStatus   PaymentStatus? // Track authorization vs capture
  authorizedAt    DateTime?      // When funds held
  capturedAt      DateTime?      // When funds charged
  canceledAt      DateTime?      // If authorization canceled

  // ENHANCED: Decline tracking
  declinedAt     DateTime?
  declineReason  String? @db.Text

  // ENHANCED: Approval tracking
  approvedAt     DateTime?
  approvedBy     String? // Customer user ID
}

enum PaymentStatus {
  PENDING
  AUTHORIZED    // Funds held, not charged
  CAPTURED      // Funds charged
  FAILED
  CANCELED
}
```

---

### 3. NotificationLog Enhancements

**Current Schema:**
```prisma
model NotificationLog {
  id     String @id @default(cuid())
  userId String

  bookingId String?

  type   NotificationType
  status NotificationStatus @default(PENDING)

  title String
  body  String @db.Text
  data  Json?

  fcmMessageId String?
  errorMessage String? @db.Text

  sentAt      DateTime?
  deliveredAt DateTime?
  readAt      DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Recommendations:**

**Add Extension Reference:**
```prisma
model NotificationLog {
  // ... existing fields ...

  bookingId   String?
  extensionId String? // NEW: Direct reference to extension

  // Add to NotificationType enum:
  // EXTENSION_CREATED
  // EXTENSION_APPROVED
  // EXTENSION_DECLINED
  // EXTENSION_COMPLETED
}
```

**Add indexes for performance:**
```prisma
@@index([userId, readAt])
@@index([extensionId])
@@index([type, status])
```

---

### 4. Booking Model Enhancements

**Add Extension Summary Fields:**
```prisma
model Booking {
  // ... existing fields ...

  // ENHANCED: Extension tracking
  hasExtensions       Boolean @default(false)
  pendingExtensions   Int     @default(0)
  approvedExtensions  Int     @default(0)
  extensionTotalAmount Int    @default(0) // Sum of approved extensions

  // ENHANCED: Photo tracking
  pickupPhotos    Json? // URLs from jockey pickup
  deliveryPhotos  Json? // URLs from jockey delivery
  servicePhotos   Json? // URLs from workshop

  // Keep existing relations
  extensions Extension[]
}
```

**Update logic:** These fields should be updated via Prisma middleware or service layer logic when extensions change.

---

## Mobile Considerations

### Jockey Dashboard (Mobile-First)

**Target Devices:**
- 10-12 inch tablets (iPad, Android tablets)
- Secondary: 6-7 inch phones

**Design Decisions:**

**1. Touch Targets:**
```css
/* Minimum 44x44px touch targets (iOS HIG) */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}
```

**2. Camera Integration:**
```typescript
// Trigger native camera
<input
  type="file"
  accept="image/*"
  capture="environment"  // Rear camera
  onChange={handleCapture}
/>
```

**3. Signature Capture:**
```typescript
// Touch-optimized signature pad
<SignatureCanvas
  canvasProps={{
    width: Math.min(600, window.innerWidth - 40),
    height: 200,
  }}
  minWidth={2}
  maxWidth={3}
/>
```

**4. Deep Links:**

**Navigation (Maps):**
```typescript
const openNavigation = (address: string) => {
  const encoded = encodeURIComponent(address);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isIOS) {
    window.open(`maps://maps.apple.com/?q=${encoded}`);
  } else if (isAndroid) {
    window.open(`geo:0,0?q=${encoded}`);
  } else {
    // Fallback to Google Maps web
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  }
};
```

**Phone Call:**
```typescript
const callCustomer = (phone: string) => {
  window.location.href = `tel:${phone}`;
};
```

**5. Offline Support:**

**Strategy:** Service Worker + IndexedDB

```typescript
// /lib/offline/cachePhotos.ts
import { openDB } from 'idb';

const db = await openDB('jockey-cache', 1, {
  upgrade(db) {
    db.createObjectStore('photos');
    db.createObjectStore('signatures');
  },
});

// Cache photo offline
export async function cachePhoto(assignmentId: string, photo: File) {
  await db.put('photos', photo, `${assignmentId}-${Date.now()}`);
}

// Upload when online
export async function syncPhotos() {
  if (!navigator.onLine) return;

  const photos = await db.getAll('photos');

  for (const [key, photo] of Object.entries(photos)) {
    try {
      await uploadPhoto(photo);
      await db.delete('photos', key);
    } catch (error) {
      console.error('Failed to sync photo:', error);
    }
  }
}

// Listen for online event
window.addEventListener('online', syncPhotos);
```

**6. Battery Optimization:**

```typescript
// Reduce polling frequency when tab inactive
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause real-time updates or reduce frequency
    setPollingInterval(60000); // 1 minute
  } else {
    setPollingInterval(10000); // 10 seconds
  }
});
```

---

### Customer Dashboard (Responsive)

**Target Devices:**
- Desktop (primary)
- Mobile (secondary)

**Design Decisions:**

**1. Responsive Breakpoints:**
```css
/* Tailwind breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

**2. Mobile Navigation:**
```typescript
// Hamburger menu for mobile
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Menu className="h-6 w-6" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <CustomerNav />
  </SheetContent>
</Sheet>
```

**3. Responsive Tables:**
```typescript
// Stack cards on mobile instead of table
<div className="hidden md:block">
  <Table>...</Table>
</div>
<div className="md:hidden space-y-4">
  {items.map((item) => (
    <Card key={item.id}>
      {/* Card layout */}
    </Card>
  ))}
</div>
```

**4. Payment UX (Stripe Mobile):**

Stripe Elements are automatically mobile-optimized:
```typescript
<PaymentElement
  options={{
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
    },
  }}
/>
```

---

## Security & Performance

### Security

#### 1. Authentication & Authorization

**JWT Token Strategy:**
```typescript
// Middleware: /backend/src/middleware/auth.middleware.ts
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**Role-Based Access Control:**
```typescript
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage:
router.get('/assignments', requireAuth, requireRole('JOCKEY'), getAssignments);
```

**Resource Ownership Verification:**
```typescript
// Example: Customer can only access their own bookings
async function verifyBookingOwnership(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.customerId !== userId) {
    throw new ForbiddenError('You do not have access to this booking');
  }

  return booking;
}
```

---

#### 2. File Upload Security

**Validation:**
```typescript
// Middleware: /backend/src/middleware/upload.middleware.ts
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 10, // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }

    // Reject potentially dangerous files
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  },
});
```

**Virus Scanning (Production):**
```typescript
import clamav from 'clamav.js';

async function scanFile(filePath: string) {
  const isInfected = await clamav.scanFile(filePath);
  if (isInfected) {
    throw new Error('File contains malware');
  }
}
```

**S3 Upload with Signed URLs:**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function generateUploadUrl(filename: string, contentType: string) {
  const key = `jockey-photos/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min

  return { url, key };
}
```

---

#### 3. Payment Security (PCI Compliance)

**Critical: Never store card data**

```typescript
// WRONG: Never do this
const cardNumber = req.body.cardNumber; // ❌ NEVER

// CORRECT: Use Stripe Elements on frontend
// Card data goes directly to Stripe, never touches our servers
const { paymentMethodId } = req.body; // ✅ Only token/ID
```

**Stripe Manual Capture Security:**
```typescript
// 1. Create authorization (hold funds)
const paymentIntent = await stripe.paymentIntents.create({
  amount: extensionAmount,
  currency: 'eur',
  customer: customer.stripeCustomerId,
  payment_method: paymentMethodId,
  capture_method: 'manual', // ✅ Don't charge yet
  confirm: true,
  metadata: {
    bookingId,
    extensionId,
    customerId,
  },
});

// 2. Later: Capture (actually charge)
await stripe.paymentIntents.capture(paymentIntent.id);

// 3. Or cancel if work cannot be done
await stripe.paymentIntents.cancel(paymentIntent.id);
```

**Webhook Signature Verification:**
```typescript
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update extension status
  }

  res.json({ received: true });
});
```

---

### Performance

#### 1. Database Query Optimization

**N+1 Problem Prevention:**
```typescript
// BAD: N+1 queries
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const customer = await prisma.user.findUnique({ where: { id: booking.customerId } }); // ❌ N queries
}

// GOOD: Eager loading
const bookings = await prisma.booking.findMany({
  include: {
    customer: true,
    vehicle: true,
    extensions: true,
  },
});
```

**Pagination:**
```typescript
// GET /api/bookings?page=2&limit=10
async function getBookings(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, vehicle: true },
    }),
    prisma.booking.count(),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

**Indexing:**
```prisma
// Ensure indexes exist for frequently queried fields
model Booking {
  @@index([customerId, status])
  @@index([pickupDate])
  @@index([bookingNumber])
}

model Extension {
  @@index([bookingId, status])
  @@index([createdAt])
}
```

---

#### 2. Image Optimization

**Frontend Compression:**
```typescript
import imageCompression from 'browser-image-compression';

async function compressImage(file: File) {
  const options = {
    maxSizeMB: 0.5,          // Max 500KB
    maxWidthOrHeight: 1920,  // Max 1920px
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file; // Fallback to original
  }
}
```

**Backend Optimization (Sharp):**
```typescript
import sharp from 'sharp';

async function optimizeImage(buffer: Buffer) {
  return sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}
```

**Lazy Loading:**
```typescript
<img
  src={photo.thumbnail}
  loading="lazy"
  onClick={() => openLightbox(photo.fullsize)}
/>
```

---

#### 3. Caching Strategy

**React Query Cache:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,      // 30s - data considered fresh
      cacheTime: 300000,     // 5min - keep in cache
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});
```

**Backend Redis Cache:**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedBooking(id: string) {
  const cached = await redis.get(`booking:${id}`);
  if (cached) return JSON.parse(cached);

  const booking = await prisma.booking.findUnique({ where: { id } });
  await redis.set(`booking:${id}`, JSON.stringify(booking), 'EX', 300); // 5min TTL

  return booking;
}

// Invalidate cache on update
async function updateBooking(id: string, data: any) {
  await prisma.booking.update({ where: { id }, data });
  await redis.del(`booking:${id}`);
}
```

**CDN for Static Assets:**
```typescript
// Next.js Image Optimization
import Image from 'next/image';

<Image
  src="/photos/vehicle-front.jpg"
  alt="Vehicle front"
  width={800}
  height={600}
  priority={false}  // Lazy load
/>
```

---

#### 4. API Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter limit for sensitive endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
});

app.use('/api/payment/', paymentLimiter);
```

---

## Real-time Updates Strategy

### Recommended Approach: Progressive Enhancement

**Tier 1: WebSocket (Primary)**
- Low latency (<100ms)
- Bidirectional communication
- Efficient for high-frequency updates

**Tier 2: Server-Sent Events (Fallback)**
- HTTP-based (easier firewall traversal)
- Automatic reconnection
- Unidirectional (server → client)

**Tier 3: Long Polling (Last Resort)**
- Works everywhere
- Higher latency and overhead

### Implementation

#### Backend: WebSocket Server (Socket.io)

```typescript
// /backend/src/services/RealtimeService.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class RealtimeService {
  private io: Server;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate user
      const token = socket.handshake.auth.token;
      const user = this.verifyToken(token);
      if (!user) {
        socket.disconnect();
        return;
      }

      // Join user-specific room
      socket.join(`user:${user.id}`);

      // Customer: Join booking rooms
      if (user.role === 'CUSTOMER') {
        this.joinCustomerRooms(socket, user.id);
      }

      // Jockey: Join assignment rooms
      if (user.role === 'JOCKEY') {
        this.joinJockeyRooms(socket, user.id);
      }

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Emit extension created event
  emitExtensionCreated(bookingId: string, extension: Extension) {
    this.io.to(`booking:${bookingId}`).emit('extension:created', extension);
  }

  // Emit status update
  emitBookingStatusUpdate(bookingId: string, status: string) {
    this.io.to(`booking:${bookingId}`).emit('booking:status-updated', { status });
  }

  // Emit new assignment to jockey
  emitNewAssignment(jockeyId: string, assignment: JockeyAssignment) {
    this.io.to(`user:${jockeyId}`).emit('assignment:new', assignment);
  }
}
```

#### Frontend: WebSocket Client

```typescript
// /lib/realtime/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('extension:created', (extension) => {
      // Invalidate bookings query
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['notifications']);

      // Show toast
      toast.info('New extension requires approval');
    });

    socket.on('booking:status-updated', ({ status }) => {
      queryClient.invalidateQueries(['bookings']);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return socketRef.current;
}
```

#### Fallback: Long Polling

```typescript
// /lib/realtime/useLongPolling.ts
export function useLongPolling(bookingId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries(['bookings', bookingId]);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [bookingId, enabled, queryClient]);
}
```

#### Combined Hook with Progressive Enhancement

```typescript
// /lib/realtime/useRealtimeUpdates.ts
export function useRealtimeUpdates(bookingId?: string) {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    setIsWebSocketConnected(socket.connected);

    socket.on('connect', () => setIsWebSocketConnected(true));
    socket.on('disconnect', () => setIsWebSocketConnected(false));
  }, [socket]);

  // Fallback to polling if WebSocket fails
  useLongPolling(bookingId, !isWebSocketConnected && !!bookingId);
}
```

---

## Testing Strategy

### Testing Pyramid

```
        ╱╲
       ╱E2E╲         10% - End-to-End (Playwright) - 248 tests ✅
      ╱────╲
     ╱ Integ╲        20% - Integration (API tests)
    ╱────────╲
   ╱   Unit   ╲      70% - Unit (Component + Logic)
  ╱────────────╲
```

### 1. Unit Tests (Component Testing)

**Tool:** Vitest + React Testing Library

**Example: ExtensionApprovalModal**

```typescript
// /components/customer/__tests__/ExtensionApprovalModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExtensionApprovalModal } from '../ExtensionApprovalModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockExtension = {
  id: 'ext-123',
  description: 'Brake replacement needed',
  items: [
    { name: 'Brake pads', quantity: 1, price: 189.99 },
  ],
  totalAmount: 18999,
  images: ['https://example.com/brake.jpg'],
  status: 'PENDING',
};

describe('ExtensionApprovalModal', () => {
  it('renders extension details correctly', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ExtensionApprovalModal
          open={true}
          onOpenChange={() => {}}
          extension={mockExtension}
          bookingId="booking-123"
          onApprove={jest.fn()}
          onDecline={jest.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('Brake replacement needed')).toBeInTheDocument();
    expect(screen.getByText('189.99 EUR')).toBeInTheDocument();
  });

  it('calls onApprove when approve button clicked', async () => {
    const onApprove = jest.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ExtensionApprovalModal
          open={true}
          onOpenChange={() => {}}
          extension={mockExtension}
          bookingId="booking-123"
          onApprove={onApprove}
          onDecline={jest.fn()}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Approve & Pay'));

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalled();
    });
  });

  it('displays decline reason input when decline clicked', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ExtensionApprovalModal
          open={true}
          onOpenChange={() => {}}
          extension={mockExtension}
          bookingId="booking-123"
          onApprove={jest.fn()}
          onDecline={jest.fn()}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Decline'));

    expect(screen.getByPlaceholderText(/reason/i)).toBeInTheDocument();
  });
});
```

---

### 2. Integration Tests (API Testing)

**Tool:** Supertest + Vitest

**Example: Extension Approval API**

```typescript
// /backend/src/tests/integration/extension.test.ts
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../config/database';

describe('Extension Approval API', () => {
  let customerToken: string;
  let bookingId: string;
  let extensionId: string;

  beforeAll(async () => {
    // Setup test data
    const customer = await prisma.user.create({
      data: {
        email: 'test@example.com',
        role: 'CUSTOMER',
      },
    });

    customerToken = generateToken(customer.id);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        // ... booking data
      },
    });

    bookingId = booking.id;

    const extension = await prisma.extension.create({
      data: {
        bookingId,
        description: 'Test extension',
        items: [{ name: 'Test', price: 100 }],
        totalAmount: 10000,
      },
    });

    extensionId = extension.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should approve extension with valid payment', async () => {
    const response = await request(app)
      .post(`/api/v1/customer/bookings/${bookingId}/extensions/${extensionId}/approve`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethodId: 'pm_test_123',
      });

    expect(response.status).toBe(200);
    expect(response.body.extension.status).toBe('APPROVED');
    expect(response.body.paymentIntent).toBeDefined();
  });

  it('should reject unauthorized access', async () => {
    const response = await request(app)
      .post(`/api/v1/customer/bookings/${bookingId}/extensions/${extensionId}/approve`)
      .send({
        paymentMethodId: 'pm_test_123',
      });

    expect(response.status).toBe(401);
  });

  it('should validate payment method ID', async () => {
    const response = await request(app)
      .post(`/api/v1/customer/bookings/${bookingId}/extensions/${extensionId}/approve`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        // Missing paymentMethodId
      });

    expect(response.status).toBe(400);
  });
});
```

---

### 3. E2E Tests (Playwright)

**Status:** ✅ 248 tests already written and waiting for implementation

**Test Coverage:**
```
e2e/
  07-extension-approval-flow.spec.ts    # Extension approval user flow
  04-jockey-portal.spec.ts              # Jockey dashboard and workflows
  03-customer-portal.spec.ts            # Customer dashboard
  05-payment-integration.spec.ts        # Payment flows
  06-notification-system.spec.ts        # Real-time notifications
```

**Example: Extension Approval E2E Test**

```typescript
// e2e/07-extension-approval-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Extension Approval Flow', () => {
  test('customer approves extension with payment', async ({ page }) => {
    // 1. Login as customer
    await page.goto('/de/customer/login');
    await page.fill('input[name="email"]', 'kunde@kunde.de');
    await page.fill('input[name="password"]', 'kunde');
    await page.click('button[type="submit"]');

    // 2. Navigate to booking with pending extension
    await page.goto('/de/customer/bookings/booking-123');

    // 3. Click Extensions tab
    await page.click('button:has-text("Extensions")');

    // 4. Verify extension is pending
    await expect(page.locator('text=AUSSTEHEND')).toBeVisible();

    // 5. Open extension details
    await page.click('button:has-text("Details anzeigen")');

    // 6. Verify extension details
    await expect(page.locator('text=Brake replacement needed')).toBeVisible();
    await expect(page.locator('text=189.99 EUR')).toBeVisible();

    // 7. Click approve
    await page.click('button:has-text("Genehmigen & Bezahlen")');

    // 8. Fill payment details (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
    await stripeFrame.locator('input[name="exp-date"]').fill('12/34');
    await stripeFrame.locator('input[name="cvc"]').fill('123');

    // 9. Confirm payment
    await page.click('button:has-text("Confirm Payment")');

    // 10. Verify success
    await expect(page.locator('text=Erweiterung genehmigt')).toBeVisible();
    await expect(page.locator('text=GENEHMIGT')).toBeVisible();
  });

  test('customer declines extension with reason', async ({ page }) => {
    await page.goto('/de/customer/login');
    // ... login ...

    await page.goto('/de/customer/bookings/booking-123');
    await page.click('button:has-text("Extensions")');
    await page.click('button:has-text("Details anzeigen")');

    // Click decline
    await page.click('button:has-text("Ablehnen")');

    // Enter reason
    await page.fill('textarea[name="declineReason"]', 'Too expensive');

    // Confirm decline
    await page.click('button:has-text("Ablehnung bestätigen")');

    // Verify
    await expect(page.locator('text=Erweiterung abgelehnt')).toBeVisible();
    await expect(page.locator('text=ABGELEHNT')).toBeVisible();
  });
});
```

---

### 4. Stripe Testing (Test Mode)

**Test Cards:**
```typescript
const TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  requires3DS: '4000002500003155',
  insufficientFunds: '4000000000009995',
};
```

**Mock Stripe in Tests:**
```typescript
// /tests/mocks/stripe.ts
export const mockStripe = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 10000,
    }),
    capture: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
    }),
    cancel: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'canceled',
    }),
  },
};
```

---

## Implementation Phases

### Phase 1: Customer Extension Approval (Weeks 1-2) - P0

**Goal:** Enable extension approval workflow with Stripe payment

**User Stories:**
- 1.1: Receive Extension Notification
- 1.2: View Extension Details
- 1.3: Approve Extension with Payment Authorization
- 1.4: Decline Extension with Reason
- 1.5: Track Extension Payment Status

**Deliverables:**
1. Backend APIs:
   - `POST /api/v1/customer/bookings/:id/extensions/:extId/approve`
   - `POST /api/v1/customer/bookings/:id/extensions/:extId/decline`
   - `GET /api/v1/customer/bookings/:id/extensions`
   - `GET /api/v1/payment/extension/:paymentIntentId/status`

2. Frontend Components:
   - ExtensionApprovalModal.tsx (NEW)
   - ExtensionCard.tsx (NEW)
   - ExtensionList.tsx (ENHANCE EXISTING)
   - NotificationCenter.tsx (ENHANCE EXISTING)

3. Database:
   - Enhance Extension model (add payment status fields)
   - Add Extension notification types

4. Payment Integration:
   - Stripe manual capture implementation
   - 3D Secure authentication support
   - Payment status tracking

**Complexity Estimate:** **L** (2 weeks with 1 developer)

**Acceptance Criteria:**
- [ ] Customer receives notification when extension created
- [ ] Customer can view extension details with photos
- [ ] Customer can approve with payment (manual capture)
- [ ] Customer can decline with optional reason
- [ ] Payment status tracked (authorized → captured)
- [ ] E2E tests pass (07-extension-approval-flow.spec.ts)

**Risks:**
- Stripe manual capture complexity (Mitigation: Test thoroughly with Stripe test mode)
- 3D Secure flow interruption (Mitigation: Handle requires_action status)

---

### Phase 2: Jockey Pickup/Delivery Workflows (Weeks 3-4) - P0

**Goal:** Enable jockey to execute pickup and delivery workflows with documentation

**User Stories:**
- 2.1: View Assigned Tasks
- 2.2: Navigate to Customer
- 2.3: Contact Customer
- 2.4: Complete Pickup Workflow
- 2.5: Complete Delivery Workflow
- 2.6: Update Task Status

**Deliverables:**
1. Backend APIs:
   - `GET /api/v1/jockey/assignments`
   - `POST /api/v1/jockey/assignments/:id/start-pickup`
   - `POST /api/v1/jockey/assignments/:id/complete-pickup`
   - `POST /api/v1/jockey/assignments/:id/photos` (multipart upload)
   - `POST /api/v1/jockey/assignments/:id/signature`
   - `POST /api/v1/jockey/assignments/:id/complete-delivery`

2. Frontend Components:
   - AssignmentCard.tsx (NEW)
   - AssignmentList.tsx (NEW)
   - HandoverModal.tsx (ENHANCE EXISTING)
   - DeliveryModal.tsx (NEW)
   - SignaturePad.tsx (NEW)
   - PhotoCapture.tsx (NEW)
   - NavigationButton.tsx (NEW)

3. Database:
   - Create JockeyAssignment model
   - Migration script to populate from existing bookings

4. Mobile Features:
   - Camera integration (HTML5 capture)
   - Signature pad (react-signature-canvas)
   - Deep links (maps, phone)
   - Offline photo caching (IndexedDB)

**Complexity Estimate:** **XL** (2 weeks with 1 developer)

**Acceptance Criteria:**
- [ ] Jockey sees assigned tasks on dashboard
- [ ] Jockey can navigate to customer (deep link to maps)
- [ ] Jockey can call customer (deep link to phone)
- [ ] Jockey can capture 4 vehicle photos (front, back, left, right)
- [ ] Jockey can capture signatures (customer + Ronja)
- [ ] Jockey can capture Fahrzeugschein photo
- [ ] Photos compressed before upload (<500KB)
- [ ] Offline mode caches photos locally
- [ ] E2E tests pass (04-jockey-portal.spec.ts)

**Risks:**
- Browser camera compatibility (Mitigation: Test on iOS/Android)
- Photo upload failures on poor connection (Mitigation: Offline caching)
- Signature pad touch responsiveness (Mitigation: Use battle-tested library)

---

### Phase 3: Customer Booking Management (Week 5) - P1

**Goal:** Complete customer self-service capabilities

**User Stories:**
- 3.1: View Booking List
- 3.2: View Booking Details
- 3.3: Download Service Report and Receipts

**Deliverables:**
1. Backend APIs:
   - `GET /api/v1/customer/bookings`
   - `GET /api/v1/customer/bookings/:id`
   - `GET /api/v1/customer/bookings/:id/timeline`
   - `GET /api/v1/customer/bookings/:id/service-report` (PDF)
   - `GET /api/v1/customer/bookings/:id/receipt` (PDF)
   - `GET /api/v1/customer/bookings/:id/photos/download` (ZIP)

2. Frontend Components:
   - BookingList.tsx (ENHANCE)
   - BookingDetailTabs.tsx (NEW)
   - StatusTimeline.tsx (NEW)
   - DocumentList.tsx (NEW)

3. PDF Generation:
   - Service report template
   - Receipt template (German tax compliance)

4. Photo Download:
   - ZIP archive creation

**Complexity Estimate:** **M** (1 week with 1 developer)

**Acceptance Criteria:**
- [ ] Customer sees list of all bookings (paginated)
- [ ] Customer can view booking details with tabs
- [ ] Status timeline displays correctly
- [ ] Service report PDF downloads
- [ ] Receipt PDF downloads (German tax format)
- [ ] Photos ZIP downloads
- [ ] E2E tests pass (03-customer-portal.spec.ts)

**Risks:**
- PDF generation performance (Mitigation: Cache generated PDFs)
- ZIP file size limits (Mitigation: Compress images before zipping)

---

### Phase 4: Real-time Updates (Week 6) - P2

**Goal:** Add real-time status updates for enhanced UX

**User Stories:**
- 4.1: Real-time Booking Status Updates (Customer)
- 4.2: Real-time Assignment Updates (Jockey)

**Deliverables:**
1. Backend:
   - WebSocket server (Socket.io)
   - Event emitters in services
   - Room management (user, booking, assignment)

2. Frontend:
   - useWebSocket hook
   - useLongPolling fallback
   - Optimistic UI updates

3. Infrastructure:
   - Redis for pub/sub (multi-server scaling)

**Complexity Estimate:** **L** (1 week with 1 developer)

**Acceptance Criteria:**
- [ ] Customer sees booking status updates in real-time (<5s)
- [ ] Jockey sees new assignments in real-time (<5s)
- [ ] Toast notifications for important events
- [ ] Fallback to polling if WebSocket fails
- [ ] Reconnection logic works
- [ ] Battery optimized (reduced frequency when tab inactive)

**Risks:**
- WebSocket connection stability (Mitigation: Implement robust reconnection)
- Scaling across multiple servers (Mitigation: Use Redis pub/sub)
- Battery drain on mobile (Mitigation: Reduce frequency when inactive)

---

## Technology Stack & Libraries

### Core Stack

```json
{
  "frontend": {
    "framework": "Next.js 14.2",
    "language": "TypeScript 5.x",
    "styling": "Tailwind CSS 4.x",
    "ui": "shadcn/ui (Radix UI)",
    "state": "React Query + Zustand",
    "forms": "React Hook Form + Zod",
    "i18n": "next-intl"
  },
  "backend": {
    "runtime": "Node.js 20.x",
    "framework": "Express.js",
    "database": "PostgreSQL 16 + Prisma",
    "auth": "JWT",
    "realtime": "Socket.io",
    "cache": "Redis (optional)"
  }
}
```

### Recommended Libraries

#### Frontend Dependencies

```bash
# State Management
npm install @tanstack/react-query zustand

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Payment
npm install @stripe/stripe-js @stripe/react-stripe-js

# Photo Handling
npm install browser-image-compression react-webcam

# Signature Capture
npm install react-signature-canvas @types/react-signature-canvas

# Image Viewer
npm install yet-another-react-lightbox

# Real-time
npm install socket.io-client

# Offline Storage
npm install idb

# Date Handling (already installed)
# date-fns

# Icons (already installed)
# lucide-react
```

#### Backend Dependencies

```bash
# Real-time
npm install socket.io

# File Upload
npm install multer @types/multer

# Image Processing
npm install sharp

# PDF Generation
npm install puppeteer
# OR
npm install pdfkit

# ZIP Creation
npm install archiver @types/archiver

# Email (if not using existing)
npm install nodemailer @types/nodemailer

# Cache
npm install ioredis @types/ioredis

# Rate Limiting
npm install express-rate-limit
```

### Library Justifications

| Library | Purpose | Why Chosen | Alternatives Considered |
|---------|---------|------------|-------------------------|
| **React Query** | Server state management | Industry standard, excellent caching, optimistic updates | SWR (less features), Redux RTK Query (overhead) |
| **Zustand** | Client state management | Minimal API, no boilerplate | Redux (too complex), Context API (performance issues) |
| **react-signature-canvas** | Digital signatures | Battle-tested, touch-optimized | signature_pad (vanilla JS), custom canvas |
| **browser-image-compression** | Client-side image compression | Fast, web worker support | sharp (server-only), custom canvas |
| **Socket.io** | Real-time updates | Reliable, fallback support | Native WebSocket (no fallbacks), Pusher (cost) |
| **yet-another-react-lightbox** | Photo viewer | Modern, accessible | react-image-lightbox (unmaintained), Photoswipe |
| **Puppeteer** | PDF generation | Full HTML/CSS support | pdfkit (manual layout), jsPDF (limited) |

---

## Risk Assessment & Mitigation

### Critical Risks (P0)

#### Risk 1: Stripe Payment Authorization Complexity

**Impact:** High (revenue blocking)
**Likelihood:** Medium

**Description:**
- Manual capture flow more complex than auto-capture
- 3D Secure authentication can interrupt flow
- Payment failures during capture (card expired, insufficient funds)

**Mitigation:**
1. **Extensive Testing:**
   - Use Stripe test cards for all scenarios
   - Test 3D Secure flow thoroughly
   - Test capture failures and retries

2. **Clear Error Messaging:**
   ```typescript
   const errorMessages = {
     'card_declined': 'Your card was declined. Please try another payment method.',
     'insufficient_funds': 'Insufficient funds. Please use another card.',
     'card_expired': 'Your card has expired. Please update your payment method.',
     'generic_decline': 'Payment failed. Please contact your bank.',
   };
   ```

3. **Retry Mechanism:**
   ```typescript
   async function captureWithRetry(paymentIntentId: string, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await stripe.paymentIntents.capture(paymentIntentId);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await sleep(1000 * (i + 1)); // Exponential backoff
       }
     }
   }
   ```

4. **Monitoring:**
   - Log all payment attempts
   - Alert on high failure rates
   - Track capture success rate

**Contingency Plan:**
- If manual capture fails, fall back to invoice generation
- Customer can pay via bank transfer
- Workshop proceeds with work at their discretion

---

#### Risk 2: Mobile Photo/Signature Capture Browser Compatibility

**Impact:** High (blocks jockey workflow)
**Likelihood:** Medium

**Description:**
- HTML5 camera API not supported on old browsers
- Touch events behave differently on iOS vs Android
- Photo upload fails on poor network connection

**Mitigation:**
1. **Feature Detection:**
   ```typescript
   const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

   if (!hasCamera) {
     // Fallback to file upload
     return <input type="file" accept="image/*" />;
   }
   ```

2. **Browser Testing Matrix:**
   - iOS Safari (iPad) - Latest 2 versions
   - Chrome Android (Tablet) - Latest 2 versions
   - Chrome Desktop (fallback)

3. **Offline Support:**
   - Cache photos in IndexedDB
   - Upload when connection restored
   - Show upload progress

4. **Signature Pad Testing:**
   - Test on physical devices (not just emulators)
   - Ensure touch events work smoothly
   - Optimize canvas size for performance

**Contingency Plan:**
- Provide admin panel for workshop to upload photos manually
- Jockey can email photos as backup
- Phone-based photo capture as last resort

---

#### Risk 3: Real-time Update Infrastructure Complexity

**Impact:** Medium (nice-to-have feature)
**Likelihood:** Medium

**Description:**
- WebSocket connections can be flaky
- Reconnection logic is complex
- Scaling across multiple servers requires Redis pub/sub

**Mitigation:**
1. **Progressive Enhancement:**
   - Core functionality works without real-time
   - WebSocket is an enhancement, not a requirement
   - Polling fallback always available

2. **Robust Reconnection:**
   ```typescript
   const socket = io(url, {
     reconnection: true,
     reconnectionDelay: 1000,
     reconnectionDelayMax: 5000,
     reconnectionAttempts: Infinity,
   });

   socket.on('reconnect_attempt', (attemptNumber) => {
     console.log(`Reconnection attempt ${attemptNumber}`);
   });
   ```

3. **Monitoring:**
   - Track WebSocket connection uptime
   - Alert on high disconnection rates
   - Monitor message delivery latency

4. **Simplified MVP:**
   - Phase 4 is P2 (not P0)
   - Can launch without real-time
   - Add real-time in v1.1 if needed

**Contingency Plan:**
- Launch with polling only (10s interval)
- Add WebSocket in future release
- Optimize polling frequency based on user activity

---

### Medium Risks (P1)

#### Risk 4: PDF Generation Performance

**Impact:** Medium (affects UX, not core flow)
**Likelihood:** Low

**Description:**
- Puppeteer PDF generation can be slow (2-5 seconds)
- Memory usage high for complex PDFs

**Mitigation:**
1. **Caching Strategy:**
   ```typescript
   async function getServiceReportPdf(bookingId: string) {
     const cacheKey = `pdf:service-report:${bookingId}`;
     const cached = await redis.get(cacheKey);

     if (cached) return Buffer.from(cached, 'base64');

     const pdf = await generateServiceReportPdf(bookingId);
     await redis.set(cacheKey, pdf.toString('base64'), 'EX', 86400); // 24h

     return pdf;
   }
   ```

2. **Async Generation:**
   - Queue PDF generation jobs
   - Email PDF when ready
   - Show "Generating..." UI

3. **Alternative: HTML to PDF Service:**
   - Use external service (PDF.co, DocRaptor)
   - Offload processing
   - Faster generation

**Contingency Plan:**
- Provide HTML view of report
- "Print to PDF" via browser
- Email PDF asynchronously

---

#### Risk 5: Photo Upload Bandwidth on Mobile

**Impact:** Medium (affects jockey UX)
**Likelihood:** Medium

**Description:**
- Jockeys may have limited mobile data
- Poor signal in some areas
- Large photo uploads (4 photos per pickup)

**Mitigation:**
1. **Aggressive Compression:**
   ```typescript
   const options = {
     maxSizeMB: 0.3,          // 300KB max
     maxWidthOrHeight: 1280,  // HD ready
     useWebWorker: true,
   };
   ```

2. **Progress Indicator:**
   ```typescript
   <UploadProgress>
     <ProgressBar value={uploadProgress} />
     <span>{uploadedCount}/4 photos uploaded</span>
   </UploadProgress>
   ```

3. **Offline Queue:**
   - Cache photos locally
   - Upload when WiFi available
   - Notification when sync complete

4. **Resumable Uploads:**
   - Use chunked upload (multipart)
   - Resume if connection drops

**Contingency Plan:**
- Allow upload later (not blocking)
- Workshop can request photos if missing
- Admin panel to flag missing photos

---

## Code Examples

### 1. Extension Approval Modal (Complete Implementation)

```typescript
// /components/customer/ExtensionApprovalModal.tsx
'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { extensionsApi } from '@/lib/api/extensions';
import { formatCurrency } from '@/lib/utils';

interface Extension {
  id: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  images: string[];
  videos: string[];
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
}

interface ExtensionApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extension: Extension;
  bookingId: string;
}

type Step = 'review' | 'payment' | 'decline' | 'processing' | 'success' | 'error';

export function ExtensionApprovalModal({
  open,
  onOpenChange,
  extension,
  bookingId,
}: ExtensionApprovalModalProps) {
  const [step, setStep] = useState<Step>('review');
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const handleApproveClick = () => {
    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements) return;

    setStep('processing');
    setError(null);

    try {
      // 1. Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 2. Call backend to approve extension
      await extensionsApi.approve(bookingId, extension.id);

      // 3. Success
      setStep('success');

      setTimeout(() => {
        onOpenChange(false);
        toast.success('Extension approved! Payment authorized.');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  const handleDeclineClick = () => {
    setStep('decline');
  };

  const handleDeclineSubmit = async () => {
    setStep('processing');

    try {
      await extensionsApi.decline(bookingId, extension.id, declineReason || undefined);

      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        toast.info('Extension declined');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to decline extension');
      setStep('error');
    }
  };

  const totalAmount = formatCurrency(extension.totalAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extension Review</DialogTitle>
        </DialogHeader>

        {step === 'review' && (
          <>
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {extension.description}
                </p>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Unit Price</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extension.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="text-right p-2">{item.quantity}</td>
                        <td className="text-right p-2">{formatCurrency(item.price)}</td>
                        <td className="text-right p-2">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 font-bold">
                    <tr>
                      <td colSpan={3} className="text-right p-2">TOTAL:</td>
                      <td className="text-right p-2">{totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Photos */}
              {extension.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {extension.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => {/* Open lightbox */}}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-900">
                  Payment will be authorized now but charged only after work is completed.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleDeclineClick}>
                Decline
              </Button>
              <Button onClick={handleApproveClick}>
                Approve & Pay
              </Button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Amount to authorize</p>
                <p className="text-2xl font-bold">{totalAmount}</p>
              </div>

              <PaymentElement />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button onClick={handlePaymentSubmit}>
                Confirm Payment
              </Button>
            </div>
          </>
        )}

        {step === 'decline' && (
          <>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for declining (optional)
              </p>

              <Textarea
                placeholder="Reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                maxLength={500}
                rows={4}
              />

              <p className="text-xs text-muted-foreground text-right">
                {declineReason.length}/500
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button variant="destructive" onClick={handleDeclineSubmit}>
                Confirm Decline
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <p className="font-semibold">Success!</p>
          </div>
        )}

        {step === 'error' && (
          <>
            <div className="flex flex-col items-center justify-center py-12">
              <X className="h-12 w-12 text-destructive mb-4" />
              <p className="font-semibold text-destructive mb-2">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setStep('review')}>
                Try Again
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

### 2. Jockey Photo Capture Component

```typescript
// /components/jockey/PhotoCapture.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

type PhotoType = 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'DASHBOARD' | 'DAMAGE';

interface Photo {
  type: PhotoType;
  file: File;
  preview: string;
}

interface PhotoCaptureProps {
  requiredPhotos: PhotoType[];
  onPhotosComplete: (photos: Photo[]) => void;
}

export function PhotoCapture({ requiredPhotos, onPhotosComplete }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRefs = useRef<Record<PhotoType, HTMLInputElement | null>>({} as any);

  const handlePhotoCapture = async (type: PhotoType, file: File) => {
    setIsCompressing(true);

    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      // Create preview
      const preview = URL.createObjectURL(compressedFile);

      // Update photos
      setPhotos((prev) => {
        const filtered = prev.filter((p) => p.type !== type);
        return [...filtered, { type, file: compressedFile, preview }];
      });

    } catch (error) {
      console.error('Image compression failed:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDeletePhoto = (type: PhotoType) => {
    setPhotos((prev) => prev.filter((p) => p.type !== type));
  };

  const isComplete = requiredPhotos.every((type) =>
    photos.some((p) => p.type === type)
  );

  const photoLabels: Record<PhotoType, string> = {
    FRONT: 'Front View',
    BACK: 'Back View',
    LEFT: 'Left Side',
    RIGHT: 'Right Side',
    DASHBOARD: 'Dashboard',
    DAMAGE: 'Damage',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {requiredPhotos.map((type) => {
          const photo = photos.find((p) => p.type === type);

          return (
            <div key={type} className="relative">
              <input
                ref={(el) => (fileInputRefs.current[type] = el)}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoCapture(type, file);
                }}
              />

              {photo ? (
                <div className="relative">
                  <img
                    src={photo.preview}
                    alt={photoLabels[type]}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeletePhoto(type)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {photoLabels[type]}
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-40 flex flex-col gap-2"
                  onClick={() => fileInputRefs.current[type]?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-sm">{photoLabels[type]}</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {isCompressing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Compressing image...
        </div>
      )}

      <Button
        onClick={() => onPhotosComplete(photos)}
        disabled={!isComplete || isCompressing}
        className="w-full"
      >
        Continue ({photos.length}/{requiredPhotos.length} photos)
      </Button>
    </div>
  );
}
```

---

## Appendix: Quick Reference

### API Endpoints Cheat Sheet

```
CUSTOMER EXTENSION APIS
├─ GET    /api/v1/customer/bookings/:bookingId/extensions
├─ POST   /api/v1/customer/bookings/:bookingId/extensions/:id/approve
└─ POST   /api/v1/customer/bookings/:bookingId/extensions/:id/decline

JOCKEY APIS
├─ GET    /api/v1/jockey/assignments
├─ POST   /api/v1/jockey/assignments/:id/start-pickup
├─ POST   /api/v1/jockey/assignments/:id/complete-pickup
├─ POST   /api/v1/jockey/assignments/:id/photos
└─ POST   /api/v1/jockey/assignments/:id/signature

PAYMENT APIS
├─ POST   /api/v1/payment/extension/authorize
├─ POST   /api/v1/payment/extension/capture
└─ GET    /api/v1/payment/extension/:paymentIntentId/status
```

### Component Size Estimates

| Component | Size | Complexity | Est. Time |
|-----------|------|------------|-----------|
| ExtensionApprovalModal | 400 LOC | XL | 3-4 days |
| HandoverModal (enhance) | 600 LOC | XL | 3-4 days |
| DeliveryModal | 500 LOC | XL | 2-3 days |
| AssignmentCard | 150 LOC | M | 1 day |
| SignaturePad | 100 LOC | S | 0.5 day |
| PhotoCapture | 200 LOC | M | 1-2 days |
| StatusTimeline | 150 LOC | S | 1 day |
| BookingDetailTabs | 200 LOC | M | 1 day |

### Stripe Test Cards

```typescript
const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  requires3DS: '4000002500003155',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
};
```

---

## Document Control

**Version:** 1.0
**Created:** February 1, 2026
**Author:** Technical Lead Architect (Claude Sonnet 4.5)
**Status:** Approved for Implementation
**Next Review:** After Phase 1 completion

**Stakeholder Approval:**
- [ ] Engineering Lead
- [ ] Product Owner
- [ ] QA Lead
- [ ] DevOps Lead

**Change Log:**
- v1.0 (2026-02-01): Initial technical architecture document created

---

**END OF DOCUMENT**
