/**
 * Rate Limiting Utility
 * Prevents brute force attacks on authentication endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoints
 * Max 5 requests per 15 minutes per IP in production
 * Max 100 requests per 15 minutes in development/test
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // Higher limit for dev/test
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for magic link requests
 * Max 5 requests per hour per IP
 */
export const magicLinkRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many magic link requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for general API endpoints
 * Max 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Create a custom rate limiter with specified options
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}
