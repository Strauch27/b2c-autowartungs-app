/**
 * Customer Components - Public API
 *
 * This file exports all customer-facing components for the booking flow.
 */

// US-004: Price Display Components
export { PriceDisplay } from './PriceDisplay';
export type { PriceDisplayProps } from './PriceDisplay';

export { BookingSummary } from './BookingSummary';
export type { BookingSummaryProps } from './BookingSummary';

export { ServiceCard } from './ServiceCard';

export { BookingStepper } from './BookingStepper';

export { RatingModal } from './RatingModal';

// Redesigned Customer Portal Components
export { ActiveBookingHeroCard } from './ActiveBookingHeroCard';
export { BookingProgressTimeline } from './BookingProgressTimeline';
export { BookingActivityTimeline } from './BookingActivityTimeline';
export { ExtensionAlertBanner } from './ExtensionAlertBanner';
export { QuickStatsRow } from './QuickStatsRow';
export { PastBookingCard } from './PastBookingCard';
export { PillTabs } from './PillTabs';
export { ExtensionList } from './ExtensionList';
export { ExtensionApprovalModal } from './ExtensionApprovalModal';
export { NotificationCenter } from './NotificationCenter';
