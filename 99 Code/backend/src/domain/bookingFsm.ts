/**
 * Booking Finite State Machine (FSM)
 *
 * This module defines the state machine for booking status transitions.
 * It ensures that bookings can only move through valid states and prevents
 * invalid transitions that could corrupt the booking lifecycle.
 *
 * FSM Flow:
 * 1. PENDING_PAYMENT → CONFIRMED (after payment)
 * 2. CONFIRMED → PICKUP_ASSIGNED (jockey assigned for pickup)
 * 3. PICKUP_ASSIGNED → PICKED_UP (vehicle picked up from customer)
 * 4. PICKED_UP → AT_WORKSHOP (vehicle arrived at workshop)
 * 5. AT_WORKSHOP → IN_SERVICE (workshop starts work)
 * 6. IN_SERVICE → READY_FOR_RETURN (service completed)
 * 7. READY_FOR_RETURN → RETURN_ASSIGNED (jockey assigned for return)
 * 8. RETURN_ASSIGNED → RETURNED (vehicle returned to customer)
 *
 * Cancellation can happen from: PENDING_PAYMENT, CONFIRMED, PICKUP_ASSIGNED
 */

import { BookingStatus } from '@prisma/client';
import { ApiError } from '../middleware/errorHandler';

/**
 * Actor types that can trigger status transitions
 */
export enum Actor {
  SYSTEM = 'SYSTEM',       // Automated system actions
  CUSTOMER = 'CUSTOMER',   // Customer actions
  JOCKEY = 'JOCKEY',       // Jockey actions
  WORKSHOP = 'WORKSHOP',   // Workshop actions
  ADMIN = 'ADMIN'          // Admin override actions
}

/**
 * Defines the allowed next states for each current state
 * Key: Current status
 * Value: Array of allowed next statuses
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  // Initial state - can only move to confirmed or cancelled
  PENDING_PAYMENT: [
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED
  ],

  // After payment - assign jockey or cancel
  CONFIRMED: [
    BookingStatus.PICKUP_ASSIGNED,
    BookingStatus.CANCELLED,
    // Backward compatibility
    BookingStatus.JOCKEY_ASSIGNED
  ],

  // Jockey assigned for pickup
  PICKUP_ASSIGNED: [
    BookingStatus.PICKED_UP,
    BookingStatus.CANCELLED,
    // Backward compatibility
    BookingStatus.IN_TRANSIT_TO_WORKSHOP
  ],

  // Vehicle picked up, in transit to workshop
  PICKED_UP: [
    BookingStatus.AT_WORKSHOP
  ],

  // Vehicle arrived at workshop
  AT_WORKSHOP: [
    BookingStatus.IN_SERVICE,
    // Backward compatibility - can go directly to old IN_WORKSHOP
    BookingStatus.IN_WORKSHOP
  ],

  // Workshop actively working on vehicle
  IN_SERVICE: [
    BookingStatus.READY_FOR_RETURN
  ],

  // Service completed, ready for return
  READY_FOR_RETURN: [
    BookingStatus.RETURN_ASSIGNED,
    // Backward compatibility
    BookingStatus.COMPLETED
  ],

  // Jockey assigned for return
  RETURN_ASSIGNED: [
    BookingStatus.RETURNED,
    BookingStatus.DELIVERED,
    // Backward compatibility
    BookingStatus.IN_TRANSIT_TO_CUSTOMER
  ],

  // Vehicle returned to customer (final state)
  RETURNED: [],

  // Legacy status - for backward compatibility
  JOCKEY_ASSIGNED: [
    BookingStatus.PICKUP_ASSIGNED,
    BookingStatus.IN_TRANSIT_TO_WORKSHOP,
    BookingStatus.PICKED_UP,
    BookingStatus.CANCELLED
  ],

  // Legacy status
  IN_TRANSIT_TO_WORKSHOP: [
    BookingStatus.PICKED_UP,
    BookingStatus.IN_WORKSHOP,
    BookingStatus.AT_WORKSHOP
  ],

  // Legacy status - workshop is working
  IN_WORKSHOP: [
    BookingStatus.IN_SERVICE,
    BookingStatus.AT_WORKSHOP,
    BookingStatus.COMPLETED,
    BookingStatus.READY_FOR_RETURN
  ],

  // Legacy status - service done
  COMPLETED: [
    BookingStatus.READY_FOR_RETURN,
    BookingStatus.IN_TRANSIT_TO_CUSTOMER,
    BookingStatus.RETURN_ASSIGNED,
    BookingStatus.DELIVERED,
    BookingStatus.RETURNED
  ],

  // Legacy status
  IN_TRANSIT_TO_CUSTOMER: [
    BookingStatus.RETURN_ASSIGNED,
    BookingStatus.DELIVERED,
    BookingStatus.RETURNED
  ],

  // Final successful state (alias for RETURNED)
  DELIVERED: [],

  // Final cancelled state - no further transitions
  CANCELLED: []
};

/**
 * Defines which actors can perform which transitions
 * This provides an extra layer of security by ensuring only authorized
 * actors can trigger specific state changes
 */
const ACTOR_PERMISSIONS: Record<BookingStatus, Partial<Record<BookingStatus, Actor[]>>> = {
  PENDING_PAYMENT: {
    [BookingStatus.CONFIRMED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.CANCELLED]: [Actor.CUSTOMER, Actor.ADMIN]
  },

  CONFIRMED: {
    [BookingStatus.PICKUP_ASSIGNED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.JOCKEY_ASSIGNED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.CANCELLED]: [Actor.CUSTOMER, Actor.ADMIN]
  },

  PICKUP_ASSIGNED: {
    [BookingStatus.PICKED_UP]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.IN_TRANSIT_TO_WORKSHOP]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.CANCELLED]: [Actor.CUSTOMER, Actor.ADMIN]
  },

  PICKED_UP: {
    [BookingStatus.AT_WORKSHOP]: [Actor.JOCKEY, Actor.WORKSHOP, Actor.ADMIN]
  },

  AT_WORKSHOP: {
    [BookingStatus.IN_SERVICE]: [Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.IN_WORKSHOP]: [Actor.WORKSHOP, Actor.ADMIN]
  },

  IN_SERVICE: {
    [BookingStatus.READY_FOR_RETURN]: [Actor.WORKSHOP, Actor.ADMIN]
  },

  READY_FOR_RETURN: {
    [BookingStatus.RETURN_ASSIGNED]: [Actor.SYSTEM, Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.COMPLETED]: [Actor.WORKSHOP, Actor.ADMIN]
  },

  RETURN_ASSIGNED: {
    [BookingStatus.RETURNED]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.DELIVERED]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.IN_TRANSIT_TO_CUSTOMER]: [Actor.JOCKEY, Actor.ADMIN]
  },

  RETURNED: {},
  DELIVERED: {},
  CANCELLED: {},

  // Legacy permissions
  JOCKEY_ASSIGNED: {
    [BookingStatus.PICKUP_ASSIGNED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.IN_TRANSIT_TO_WORKSHOP]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.PICKED_UP]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.CANCELLED]: [Actor.CUSTOMER, Actor.ADMIN]
  },

  IN_TRANSIT_TO_WORKSHOP: {
    [BookingStatus.PICKED_UP]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.IN_WORKSHOP]: [Actor.JOCKEY, Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.AT_WORKSHOP]: [Actor.JOCKEY, Actor.WORKSHOP, Actor.ADMIN]
  },

  IN_WORKSHOP: {
    [BookingStatus.IN_SERVICE]: [Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.AT_WORKSHOP]: [Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.COMPLETED]: [Actor.WORKSHOP, Actor.ADMIN],
    [BookingStatus.READY_FOR_RETURN]: [Actor.WORKSHOP, Actor.ADMIN]
  },

  COMPLETED: {
    [BookingStatus.READY_FOR_RETURN]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.IN_TRANSIT_TO_CUSTOMER]: [Actor.SYSTEM, Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.RETURN_ASSIGNED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.DELIVERED]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.RETURNED]: [Actor.JOCKEY, Actor.ADMIN]
  },

  IN_TRANSIT_TO_CUSTOMER: {
    [BookingStatus.RETURN_ASSIGNED]: [Actor.SYSTEM, Actor.ADMIN],
    [BookingStatus.DELIVERED]: [Actor.JOCKEY, Actor.ADMIN],
    [BookingStatus.RETURNED]: [Actor.JOCKEY, Actor.ADMIN]
  }
};

/**
 * Check if a transition from one status to another is allowed
 */
export function isTransitionAllowed(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

/**
 * Get all possible next states from the current state
 */
export function getNextPossibleStates(currentStatus: BookingStatus): BookingStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

/**
 * Assert that a transition is valid and throw an error if not
 *
 * @param currentStatus - The current booking status
 * @param newStatus - The desired new status
 * @param actor - The actor attempting the transition (optional, for permission check)
 * @throws ApiError if transition is not allowed
 */
export function assertTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus,
  actor?: Actor
): void {
  // Check if transition is allowed
  if (!isTransitionAllowed(currentStatus, newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
      `Allowed transitions: ${getNextPossibleStates(currentStatus).join(', ')}`
    );
  }

  // Check actor permissions if actor is provided
  if (actor) {
    const permissions = ACTOR_PERMISSIONS[currentStatus]?.[newStatus];

    // If permissions are defined and actor is not in the list, deny
    if (permissions && !permissions.includes(actor)) {
      throw new ApiError(
        403,
        `Actor ${actor} is not authorized to transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed actors: ${permissions.join(', ')}`
      );
    }
  }
}

/**
 * Check if a status is a final state (no further transitions possible)
 */
export function isFinalState(status: BookingStatus): boolean {
  const nextStates = getNextPossibleStates(status);
  return nextStates.length === 0;
}

/**
 * Check if a status is cancellable
 */
export function isCancellable(status: BookingStatus): boolean {
  return getNextPossibleStates(status).includes(BookingStatus.CANCELLED);
}

/**
 * Map legacy status to new status (for migration)
 */
export function mapLegacyToNewStatus(legacyStatus: BookingStatus): BookingStatus {
  const mapping: Partial<Record<BookingStatus, BookingStatus>> = {
    [BookingStatus.JOCKEY_ASSIGNED]: BookingStatus.PICKUP_ASSIGNED,
    [BookingStatus.IN_TRANSIT_TO_WORKSHOP]: BookingStatus.PICKED_UP,
    [BookingStatus.IN_WORKSHOP]: BookingStatus.AT_WORKSHOP,
    [BookingStatus.COMPLETED]: BookingStatus.READY_FOR_RETURN,
    [BookingStatus.IN_TRANSIT_TO_CUSTOMER]: BookingStatus.RETURN_ASSIGNED,
    [BookingStatus.DELIVERED]: BookingStatus.RETURNED
  };

  return mapping[legacyStatus] || legacyStatus;
}

/**
 * Get human-readable status description
 */
export function getStatusDescription(status: BookingStatus): string {
  const descriptions: Record<BookingStatus, string> = {
    PENDING_PAYMENT: 'Waiting for payment',
    CONFIRMED: 'Payment confirmed, preparing for pickup',
    PICKUP_ASSIGNED: 'Jockey assigned for vehicle pickup',
    PICKED_UP: 'Vehicle picked up, in transit to workshop',
    AT_WORKSHOP: 'Vehicle arrived at workshop',
    IN_SERVICE: 'Workshop actively servicing vehicle',
    READY_FOR_RETURN: 'Service completed, ready for return',
    RETURN_ASSIGNED: 'Jockey assigned for vehicle return',
    RETURNED: 'Vehicle returned to customer',
    DELIVERED: 'Vehicle delivered to customer',
    CANCELLED: 'Booking cancelled',

    // Legacy descriptions
    JOCKEY_ASSIGNED: '[DEPRECATED] Jockey assigned',
    IN_TRANSIT_TO_WORKSHOP: '[DEPRECATED] In transit to workshop',
    IN_WORKSHOP: '[DEPRECATED] In workshop',
    COMPLETED: '[DEPRECATED] Service completed',
    IN_TRANSIT_TO_CUSTOMER: '[DEPRECATED] In transit to customer'
  };

  return descriptions[status] || status;
}
