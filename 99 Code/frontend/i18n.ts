import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Define supported locales
export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale for the application
export const defaultLocale: Locale = 'de';

export default getRequestConfig(async ({locale: requestLocale}) => {
  // next-intl sends locale from [locale] route parameter
  // If undefined, we need to extract it ourselves
  const locale = requestLocale || defaultLocale;

  console.log('[i18n.ts] Received locale:', locale);

  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as Locale)) {
    console.error('[i18n.ts] Invalid locale:', locale);
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default,
      timeZone: 'Europe/Berlin',
      now: new Date(),
    };
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Berlin',
    now: new Date(),
  };
});
