import { redirect } from 'next/navigation';

/**
 * Root page - Redirects to default locale (German)
 * This is required because all pages are now under /[locale]/
 */
export default function RootPage() {
  redirect('/de');
}
