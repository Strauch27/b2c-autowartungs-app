'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Lock, Mail, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { tokenStorage } from '@/lib/auth/token-storage';

export default function BookingRegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [bookingNumber, setBookingNumber] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get booking details from query params
    const number = searchParams.get('bookingNumber');
    const id = searchParams.get('bookingId');
    const emailParam = searchParams.get('email');
    const firstNameParam = searchParams.get('firstName');
    const lastNameParam = searchParams.get('lastName');
    const phoneParam = searchParams.get('phone');

    if (!number || !id) {
      // Missing required params, redirect to home
      router.push(`/${language}`);
      return;
    }

    setBookingNumber(number);
    setBookingId(id);
    setEmail(emailParam || '');
    setFirstName(firstNameParam || '');
    setLastName(lastNameParam || '');
    setPhone(phoneParam || '');
  }, [searchParams, router, language]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 8) {
      toast.error(
        language === 'de'
          ? 'Passwort muss mindestens 8 Zeichen lang sein'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        language === 'de'
          ? 'Passwörter stimmen nicht überein'
          : 'Passwords do not match'
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.post<{
        success: boolean;
        token: string;
        user: any;
        message: string;
      }>('/api/auth/customer/register', {
        email,
        password,
        firstName,
        lastName,
        phone,
        bookingId
      });

      // Store auth token
      tokenStorage.setToken(response.token);

      toast.success(
        language === 'de'
          ? 'Konto erfolgreich erstellt!'
          : 'Account created successfully!',
        {
          description: language === 'de'
            ? 'Sie sind jetzt angemeldet und können Ihre Buchungen verwalten.'
            : 'You are now logged in and can manage your bookings.'
        }
      );

      // Redirect to success page
      setTimeout(() => {
        router.push(`/${language}/booking/success?bookingNumber=${bookingNumber}`);
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        language === 'de'
          ? 'Registrierung fehlgeschlagen'
          : 'Registration failed',
        {
          description: error instanceof Error
            ? error.message
            : (language === 'de'
              ? 'Bitte versuchen Sie es später erneut'
              : 'Please try again later')
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingNumber || !bookingId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'de' ? 'Fast geschafft!' : 'Almost there!'}
            </h1>
            <p className="text-gray-600">
              {language === 'de'
                ? 'Erstellen Sie jetzt Ihr Konto, um Ihre Buchung zu verwalten'
                : 'Create your account now to manage your booking'}
            </p>
          </div>

          {/* Booking Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              {language === 'de' ? 'Ihre Buchungsnummer' : 'Your booking number'}
            </p>
            <p className="text-xl font-bold text-blue-600">{bookingNumber}</p>
          </div>

          {/* Registration Form */}
          <Card className="shadow-xl border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {language === 'de' ? 'Konto erstellen' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Mit einem Konto können Sie Ihre Buchungen jederzeit einsehen und verwalten.'
                  : 'With an account you can view and manage your bookings at any time.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email (pre-filled) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {language === 'de' ? 'E-Mail' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                {/* Name (pre-filled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {language === 'de' ? 'Vorname' : 'First Name'}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {language === 'de' ? 'Nachname' : 'Last Name'}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Phone (pre-filled) */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {language === 'de' ? 'Telefon' : 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {language === 'de' ? 'Passwort' : 'Password'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'de' ? 'Mindestens 8 Zeichen' : 'At least 8 characters'}
                    required
                    minLength={8}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {language === 'de' ? 'Passwort bestätigen' : 'Confirm Password'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'de' ? 'Passwort wiederholen' : 'Repeat password'}
                    required
                    minLength={8}
                  />
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm text-gray-900">
                    {language === 'de' ? 'Ihre Vorteile:' : 'Your benefits:'}
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {language === 'de'
                          ? 'Alle Buchungen auf einen Blick'
                          : 'All bookings at a glance'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {language === 'de'
                          ? 'Status-Updates in Echtzeit'
                          : 'Real-time status updates'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {language === 'de'
                          ? 'Schnellere zukünftige Buchungen'
                          : 'Faster future bookings'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    language === 'de' ? 'Wird erstellt...' : 'Creating...'
                  ) : (
                    <>
                      {language === 'de' ? 'Konto erstellen' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {language === 'de'
                ? 'Möchten Sie das Konto später erstellen?'
                : 'Want to create the account later?'}
            </p>
            <Link
              href={`/${language}/booking/success?bookingNumber=${bookingNumber}`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
            >
              {language === 'de' ? 'Später registrieren' : 'Register later'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
