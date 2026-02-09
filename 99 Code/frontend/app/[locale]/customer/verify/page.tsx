'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { tokenStorage } from '@/lib/auth/token-storage';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('Kein Verifizierungstoken gefunden');
      return;
    }

    const verify = async () => {
      try {
        const response = await apiClient.post<{ token: string }>('/api/auth/customer/verify', { token });
        tokenStorage.setToken(response.token);
        setStatus('success');
        router.push(`/${locale}/customer/dashboard`);
      } catch (err) {
        setStatus('error');
        setError(
          err instanceof Error
            ? err.message
            : 'Fehler bei der Verifizierung'
        );
      }
    };

    verify();
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verifizierung läuft...
          </h2>
          <p className="text-slate-600">
            Bitte warten Sie, während wir Ihren Magic Link überprüfen.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Verifizierung fehlgeschlagen
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push(`/${locale}/customer/login`)}
              className="w-full"
            >
              Zurück zum Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - should redirect automatically
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Erfolgreich angemeldet!
        </h2>
        <p className="text-slate-600">Sie werden weitergeleitet...</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
