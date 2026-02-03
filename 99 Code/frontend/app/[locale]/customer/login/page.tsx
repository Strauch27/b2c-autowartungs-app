'use client';

import LoginForm from "@/components/auth/LoginForm";
import { Car } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-hooks";
import { useState } from "react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await login('customer', {
        username: email, // Customer uses email as username
        password,
      });
      // Redirect happens in the auth context
      toast.success("Erfolgreich angemeldet!");
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-20">
        <Link href={`/${locale}`} className="mb-12 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">AutoConcierge</span>
        </Link>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <LoginForm
          onSubmit={handleLogin}
          portalType="customer"
          registerLink={`/${locale}/customer/register`}
          isLoading={isLoading}
        />
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden bg-gradient-to-br from-primary via-primary to-primary/80 lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card/10 backdrop-blur-sm">
              <Car className="h-12 w-12" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold">Premium Service für Ihr Auto</h2>
          <p className="text-primary-foreground/80">
            Buchen Sie Ihren nächsten Wartungstermin bequem online und genießen Sie unseren
            exklusiven Hol- und Bringservice.
          </p>
        </div>
      </div>
    </div>
  );
}
