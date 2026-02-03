import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always include locale prefix in URL
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files (images, fonts, etc.)
  // - _next internal files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
