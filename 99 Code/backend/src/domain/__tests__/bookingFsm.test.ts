/**
 * Unit tests for Booking FSM (Finite State Machine)
 *
 * These tests ensure that:
 * 1. Valid transitions are allowed
 * 2. Invalid transitions throw errors
 * 3. Actor permissions are enforced
 * 4. Complete booking journeys work correctly
 */

import { BookingStatus } from '@prisma/client';
import {
  Actor,
  assertTransition,
  isTransitionAllowed,
  getNextPossibleStates,
  isFinalState,
  isCancellable,
  mapLegacyToNewStatus,
  getStatusDescription
} from '../bookingFsm';

describe('Booking FSM', () => {
  describe('isTransitionAllowed', () => {
    it('should allow PENDING_PAYMENT → CONFIRMED', () => {
      expect(isTransitionAllowed(BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED)).toBe(true);
    });

    it('should allow CONFIRMED → PICKUP_ASSIGNED', () => {
      expect(isTransitionAllowed(BookingStatus.CONFIRMED, BookingStatus.PICKUP_ASSIGNED)).toBe(true);
    });

    it('should allow PICKUP_ASSIGNED → PICKED_UP', () => {
      expect(isTransitionAllowed(BookingStatus.PICKUP_ASSIGNED, BookingStatus.PICKED_UP)).toBe(true);
    });

    it('should allow PICKED_UP → AT_WORKSHOP', () => {
      expect(isTransitionAllowed(BookingStatus.PICKED_UP, BookingStatus.AT_WORKSHOP)).toBe(true);
    });

    it('should allow AT_WORKSHOP → IN_SERVICE', () => {
      expect(isTransitionAllowed(BookingStatus.AT_WORKSHOP, BookingStatus.IN_SERVICE)).toBe(true);
    });

    it('should allow IN_SERVICE → READY_FOR_RETURN', () => {
      expect(isTransitionAllowed(BookingStatus.IN_SERVICE, BookingStatus.READY_FOR_RETURN)).toBe(true);
    });

    it('should allow READY_FOR_RETURN → RETURN_ASSIGNED', () => {
      expect(isTransitionAllowed(BookingStatus.READY_FOR_RETURN, BookingStatus.RETURN_ASSIGNED)).toBe(true);
    });

    it('should allow RETURN_ASSIGNED → RETURNED', () => {
      expect(isTransitionAllowed(BookingStatus.RETURN_ASSIGNED, BookingStatus.RETURNED)).toBe(true);
    });

    it('should NOT allow PENDING_PAYMENT → IN_SERVICE', () => {
      expect(isTransitionAllowed(BookingStatus.PENDING_PAYMENT, BookingStatus.IN_SERVICE)).toBe(false);
    });

    it('should NOT allow RETURNED → CONFIRMED (final state)', () => {
      expect(isTransitionAllowed(BookingStatus.RETURNED, BookingStatus.CONFIRMED)).toBe(false);
    });

    it('should NOT allow CANCELLED → CONFIRMED (final state)', () => {
      expect(isTransitionAllowed(BookingStatus.CANCELLED, BookingStatus.CONFIRMED)).toBe(false);
    });
  });

  describe('assertTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() => {
        assertTransition(BookingStatus.CONFIRMED, BookingStatus.PICKUP_ASSIGNED);
      }).not.toThrow();
    });

    it('should throw for invalid transition', () => {
      expect(() => {
        assertTransition(BookingStatus.PENDING_PAYMENT, BookingStatus.IN_SERVICE);
      }).toThrow('Invalid status transition');
    });

    it('should throw for invalid actor permission', () => {
      expect(() => {
        assertTransition(BookingStatus.AT_WORKSHOP, BookingStatus.IN_SERVICE, Actor.CUSTOMER);
      }).toThrow('not authorized');
    });

    it('should allow WORKSHOP actor to transition AT_WORKSHOP → IN_SERVICE', () => {
      expect(() => {
        assertTransition(BookingStatus.AT_WORKSHOP, BookingStatus.IN_SERVICE, Actor.WORKSHOP);
      }).not.toThrow();
    });

    it('should allow JOCKEY actor to transition PICKUP_ASSIGNED → PICKED_UP', () => {
      expect(() => {
        assertTransition(BookingStatus.PICKUP_ASSIGNED, BookingStatus.PICKED_UP, Actor.JOCKEY);
      }).not.toThrow();
    });

    it('should allow SYSTEM actor to transition PENDING_PAYMENT → CONFIRMED', () => {
      expect(() => {
        assertTransition(BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, Actor.SYSTEM);
      }).not.toThrow();
    });

    it('should allow ADMIN actor to perform any transition', () => {
      expect(() => {
        assertTransition(BookingStatus.AT_WORKSHOP, BookingStatus.IN_SERVICE, Actor.ADMIN);
      }).not.toThrow();

      expect(() => {
        assertTransition(BookingStatus.PICKUP_ASSIGNED, BookingStatus.PICKED_UP, Actor.ADMIN);
      }).not.toThrow();
    });

    it('should NOT allow CUSTOMER to transition IN_SERVICE → READY_FOR_RETURN', () => {
      expect(() => {
        assertTransition(BookingStatus.IN_SERVICE, BookingStatus.READY_FOR_RETURN, Actor.CUSTOMER);
      }).toThrow('not authorized');
    });
  });

  describe('getNextPossibleStates', () => {
    it('should return correct next states for PENDING_PAYMENT', () => {
      const nextStates = getNextPossibleStates(BookingStatus.PENDING_PAYMENT);
      expect(nextStates).toContain(BookingStatus.CONFIRMED);
      expect(nextStates).toContain(BookingStatus.CANCELLED);
      expect(nextStates.length).toBe(2);
    });

    it('should return correct next states for CONFIRMED', () => {
      const nextStates = getNextPossibleStates(BookingStatus.CONFIRMED);
      expect(nextStates).toContain(BookingStatus.PICKUP_ASSIGNED);
      expect(nextStates).toContain(BookingStatus.CANCELLED);
    });

    it('should return empty array for RETURNED (final state)', () => {
      const nextStates = getNextPossibleStates(BookingStatus.RETURNED);
      expect(nextStates).toEqual([]);
    });

    it('should return empty array for CANCELLED (final state)', () => {
      const nextStates = getNextPossibleStates(BookingStatus.CANCELLED);
      expect(nextStates).toEqual([]);
    });
  });

  describe('isFinalState', () => {
    it('should return true for RETURNED', () => {
      expect(isFinalState(BookingStatus.RETURNED)).toBe(true);
    });

    it('should return true for CANCELLED', () => {
      expect(isFinalState(BookingStatus.CANCELLED)).toBe(true);
    });

    it('should return true for DELIVERED', () => {
      expect(isFinalState(BookingStatus.DELIVERED)).toBe(true);
    });

    it('should return false for PENDING_PAYMENT', () => {
      expect(isFinalState(BookingStatus.PENDING_PAYMENT)).toBe(false);
    });

    it('should return false for IN_SERVICE', () => {
      expect(isFinalState(BookingStatus.IN_SERVICE)).toBe(false);
    });
  });

  describe('isCancellable', () => {
    it('should return true for PENDING_PAYMENT', () => {
      expect(isCancellable(BookingStatus.PENDING_PAYMENT)).toBe(true);
    });

    it('should return true for CONFIRMED', () => {
      expect(isCancellable(BookingStatus.CONFIRMED)).toBe(true);
    });

    it('should return true for PICKUP_ASSIGNED', () => {
      expect(isCancellable(BookingStatus.PICKUP_ASSIGNED)).toBe(true);
    });

    it('should return false for IN_SERVICE', () => {
      expect(isCancellable(BookingStatus.IN_SERVICE)).toBe(false);
    });

    it('should return false for RETURNED', () => {
      expect(isCancellable(BookingStatus.RETURNED)).toBe(false);
    });
  });

  describe('mapLegacyToNewStatus', () => {
    it('should map JOCKEY_ASSIGNED to PICKUP_ASSIGNED', () => {
      expect(mapLegacyToNewStatus(BookingStatus.JOCKEY_ASSIGNED)).toBe(BookingStatus.PICKUP_ASSIGNED);
    });

    it('should map IN_TRANSIT_TO_WORKSHOP to PICKED_UP', () => {
      expect(mapLegacyToNewStatus(BookingStatus.IN_TRANSIT_TO_WORKSHOP)).toBe(BookingStatus.PICKED_UP);
    });

    it('should map IN_WORKSHOP to AT_WORKSHOP', () => {
      expect(mapLegacyToNewStatus(BookingStatus.IN_WORKSHOP)).toBe(BookingStatus.AT_WORKSHOP);
    });

    it('should map COMPLETED to READY_FOR_RETURN', () => {
      expect(mapLegacyToNewStatus(BookingStatus.COMPLETED)).toBe(BookingStatus.READY_FOR_RETURN);
    });

    it('should map IN_TRANSIT_TO_CUSTOMER to RETURN_ASSIGNED', () => {
      expect(mapLegacyToNewStatus(BookingStatus.IN_TRANSIT_TO_CUSTOMER)).toBe(BookingStatus.RETURN_ASSIGNED);
    });

    it('should map DELIVERED to RETURNED', () => {
      expect(mapLegacyToNewStatus(BookingStatus.DELIVERED)).toBe(BookingStatus.RETURNED);
    });

    it('should return same status for non-legacy statuses', () => {
      expect(mapLegacyToNewStatus(BookingStatus.CONFIRMED)).toBe(BookingStatus.CONFIRMED);
      expect(mapLegacyToNewStatus(BookingStatus.CANCELLED)).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('getStatusDescription', () => {
    it('should return descriptions for all statuses', () => {
      expect(getStatusDescription(BookingStatus.PENDING_PAYMENT)).toContain('payment');
      expect(getStatusDescription(BookingStatus.CONFIRMED)).toContain('confirmed');
      expect(getStatusDescription(BookingStatus.PICKUP_ASSIGNED)).toContain('pickup');
      expect(getStatusDescription(BookingStatus.RETURNED)).toContain('returned');
    });

    it('should mark legacy statuses as deprecated', () => {
      expect(getStatusDescription(BookingStatus.JOCKEY_ASSIGNED)).toContain('DEPRECATED');
      expect(getStatusDescription(BookingStatus.IN_TRANSIT_TO_WORKSHOP)).toContain('DEPRECATED');
      expect(getStatusDescription(BookingStatus.COMPLETED)).toContain('DEPRECATED');
    });
  });

  describe('Complete Booking Journey', () => {
    it('should allow complete happy path journey', () => {
      // Start with payment pending
      let currentStatus: BookingStatus = BookingStatus.PENDING_PAYMENT;

      // Payment confirmed
      assertTransition(currentStatus, BookingStatus.CONFIRMED, Actor.SYSTEM);
      currentStatus = BookingStatus.CONFIRMED;

      // Jockey assigned for pickup
      assertTransition(currentStatus, BookingStatus.PICKUP_ASSIGNED, Actor.SYSTEM);
      currentStatus = BookingStatus.PICKUP_ASSIGNED;

      // Vehicle picked up
      assertTransition(currentStatus, BookingStatus.PICKED_UP, Actor.JOCKEY);
      currentStatus = BookingStatus.PICKED_UP;

      // Vehicle arrived at workshop
      assertTransition(currentStatus, BookingStatus.AT_WORKSHOP, Actor.WORKSHOP);
      currentStatus = BookingStatus.AT_WORKSHOP;

      // Workshop starts service
      assertTransition(currentStatus, BookingStatus.IN_SERVICE, Actor.WORKSHOP);
      currentStatus = BookingStatus.IN_SERVICE;

      // Service completed
      assertTransition(currentStatus, BookingStatus.READY_FOR_RETURN, Actor.WORKSHOP);
      currentStatus = BookingStatus.READY_FOR_RETURN;

      // Jockey assigned for return
      assertTransition(currentStatus, BookingStatus.RETURN_ASSIGNED, Actor.SYSTEM);
      currentStatus = BookingStatus.RETURN_ASSIGNED;

      // Vehicle returned to customer
      assertTransition(currentStatus, BookingStatus.RETURNED, Actor.JOCKEY);
      currentStatus = BookingStatus.RETURNED;

      // Should be in final state
      expect(isFinalState(currentStatus)).toBe(true);
    });

    it('should allow cancellation at early stages', () => {
      // Can cancel from PENDING_PAYMENT
      expect(() => {
        assertTransition(BookingStatus.PENDING_PAYMENT, BookingStatus.CANCELLED, Actor.CUSTOMER);
      }).not.toThrow();

      // Can cancel from CONFIRMED
      expect(() => {
        assertTransition(BookingStatus.CONFIRMED, BookingStatus.CANCELLED, Actor.CUSTOMER);
      }).not.toThrow();

      // Can cancel from PICKUP_ASSIGNED
      expect(() => {
        assertTransition(BookingStatus.PICKUP_ASSIGNED, BookingStatus.CANCELLED, Actor.CUSTOMER);
      }).not.toThrow();

      // Cannot cancel from IN_SERVICE
      expect(() => {
        assertTransition(BookingStatus.IN_SERVICE, BookingStatus.CANCELLED, Actor.CUSTOMER);
      }).toThrow('Invalid status transition');
    });

    it('should support backward compatible legacy flow', () => {
      let currentStatus: BookingStatus = BookingStatus.CONFIRMED;

      // Using legacy JOCKEY_ASSIGNED status
      assertTransition(currentStatus, BookingStatus.JOCKEY_ASSIGNED, Actor.SYSTEM);
      currentStatus = BookingStatus.JOCKEY_ASSIGNED;

      // Can transition to new status
      assertTransition(currentStatus, BookingStatus.PICKED_UP, Actor.JOCKEY);
      currentStatus = BookingStatus.PICKED_UP;

      // Continue with new statuses
      assertTransition(currentStatus, BookingStatus.AT_WORKSHOP, Actor.WORKSHOP);
      currentStatus = BookingStatus.AT_WORKSHOP;

      expect(isFinalState(currentStatus)).toBe(false);
    });

    it('should prevent skipping states in journey', () => {
      // Cannot go directly from CONFIRMED to IN_SERVICE
      expect(() => {
        assertTransition(BookingStatus.CONFIRMED, BookingStatus.IN_SERVICE, Actor.WORKSHOP);
      }).toThrow('Invalid status transition');

      // Cannot go directly from PICKED_UP to READY_FOR_RETURN
      expect(() => {
        assertTransition(BookingStatus.PICKED_UP, BookingStatus.READY_FOR_RETURN, Actor.WORKSHOP);
      }).toThrow('Invalid status transition');

      // Cannot go backwards from IN_SERVICE to CONFIRMED
      expect(() => {
        assertTransition(BookingStatus.IN_SERVICE, BookingStatus.CONFIRMED, Actor.SYSTEM);
      }).toThrow('Invalid status transition');
    });
  });

  describe('Edge Cases', () => {
    it('should handle transitions from final states', () => {
      // RETURNED is final - no transitions allowed
      const nextStates = getNextPossibleStates(BookingStatus.RETURNED);
      expect(nextStates).toEqual([]);

      // CANCELLED is final - no transitions allowed
      const cancelledNext = getNextPossibleStates(BookingStatus.CANCELLED);
      expect(cancelledNext).toEqual([]);
    });

    it('should handle multiple valid next states', () => {
      // READY_FOR_RETURN can go to RETURN_ASSIGNED or legacy COMPLETED
      const nextStates = getNextPossibleStates(BookingStatus.READY_FOR_RETURN);
      expect(nextStates.length).toBeGreaterThan(1);
      expect(nextStates).toContain(BookingStatus.RETURN_ASSIGNED);
    });

    it('should validate actor permissions strictly', () => {
      // Customer cannot mark service as ready for return
      expect(() => {
        assertTransition(BookingStatus.IN_SERVICE, BookingStatus.READY_FOR_RETURN, Actor.CUSTOMER);
      }).toThrow('not authorized');

      // Jockey cannot start service
      expect(() => {
        assertTransition(BookingStatus.AT_WORKSHOP, BookingStatus.IN_SERVICE, Actor.JOCKEY);
      }).toThrow('not authorized');
    });
  });
});
