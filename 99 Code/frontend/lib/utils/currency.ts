/**
 * Currency formatting utilities for German locale (EUR)
 */

/**
 * Format Euro amount to string with German formatting
 * @param amount - Amount in EUR
 * @returns Formatted string like "249,00 €"
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert euro amount to cents
 * @param euro - Amount in euros
 * @returns Amount in cents
 */
export function formatCents(euro: number): number {
  return Math.round(euro * 100);
}

/**
 * Format number with German thousand separator
 * @param value - Number to format
 * @returns Formatted string like "90.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}
