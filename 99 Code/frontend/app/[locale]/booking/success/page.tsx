'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';

import { Suspense } from 'react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [bookingNumber, setBookingNumber] = useState<string>('');

  useEffect(() => {
    const number = searchParams.get('bookingNumber');
    if (!number) {
      // No booking number, redirect to home
      router.push(`/${language}`);
      return;
    }
    setBookingNumber(number);
  }, [searchParams, router, language]);

  if (!bookingNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {language === 'de' ? 'Buchung erfolgreich!' : 'Booking Successful!'}
            </h1>
            <p className="text-lg text-gray-600">
              {language === 'de'
                ? 'Ihre Buchung wurde erfolgreich erstellt.'
                : 'Your booking has been successfully created.'}
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {language === 'de' ? 'Buchungsnummer' : 'Booking Number'}
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {bookingNumber}
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {language === 'de' ? 'E-Mail-Bestätigung' : 'Email Confirmation'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'de'
                      ? 'Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.'
                      : 'You will receive a confirmation email with all details shortly.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {language === 'de' ? 'Nächste Schritte' : 'Next Steps'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'de'
                      ? 'Wir melden uns bei Ihnen, um die Abholung zu koordinieren.'
                      : 'We will contact you to coordinate the pickup.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              {language === 'de' ? 'Wichtige Hinweise' : 'Important Information'}
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  {language === 'de'
                    ? 'Notieren Sie sich Ihre Buchungsnummer für Rückfragen'
                    : 'Note your booking number for inquiries'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  {language === 'de'
                    ? 'Halten Sie Ihr Fahrzeug zum vereinbarten Zeitpunkt bereit'
                    : 'Have your vehicle ready at the agreed time'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>
                  {language === 'de'
                    ? 'Sie werden über den Status Ihrer Buchung informiert'
                    : 'You will be informed about the status of your booking'}
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${language}`} className="flex-1">
              <Button variant="default" className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
                <Home className="w-5 h-5 mr-2" />
                {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
              </Button>
            </Link>
            <Link href={`/${language}/customer/login`} className="flex-1">
              <Button variant="outline" className="w-full h-14 text-base font-semibold border-2 hover:bg-gray-50">
                {language === 'de' ? 'Zum Kundenportal' : 'Customer Portal'}
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-2">
              {language === 'de' ? 'Fragen? Kontaktieren Sie uns unter' : 'Questions? Contact us at'}
            </p>
            <a
              href="mailto:b2c@centhree.com"
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline"
            >
              b2c@centhree.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessContent />
    </Suspense>
  );
}
