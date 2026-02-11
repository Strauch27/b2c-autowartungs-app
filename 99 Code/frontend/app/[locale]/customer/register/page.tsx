"use client";

import { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Loader2, UserPlus, Car } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'de';
  const tLogin = useTranslations("login");
  const tContact = useTranslations("lovableBooking.step4.contact");
  const tAccount = useTranslations("booking.accountDialog");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(locale === "de" ? "Passwörter stimmen nicht überein" : "Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError(locale === "de" ? "Passwort muss mindestens 8 Zeichen lang sein" : "Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed");
      }

      // Store auth token with customer role prefix
      if (data.data?.token) {
        const { tokenStorage } = await import("@/lib/auth/token-storage");
        tokenStorage.setToken(data.data.token, 'customer');
      }

      // Redirect to booking page after successful registration
      router.push(`/${locale}/customer/booking`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">
            {locale === "de" ? "Jetzt registrieren" : "Register Now"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {locale === "de"
              ? "Erstellen Sie ein Konto, um zu buchen"
              : "Create an account to book"}
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {locale === "de" ? "Neues Konto" : "New Account"}
            </CardTitle>
            <CardDescription>
              {locale === "de"
                ? "Bitte füllen Sie alle Felder aus"
                : "Please fill in all fields"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {tLogin("email")} *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={tLogin("emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {tContact("firstName")} *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={tContact("firstNamePlaceholder")}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {tContact("lastName")} *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={tContact("lastNamePlaceholder")}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {tContact("phone")} *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+49 123 456789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {tLogin("password")} *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={tAccount("passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {locale === "de" ? "Passwort bestätigen" : "Confirm Password"} *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={locale === "de" ? "Passwort wiederholen" : "Repeat password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <p className="text-sm">{error}</p>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {locale === "de" ? "Registriere..." : "Registering..."}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    {locale === "de" ? "Konto erstellen" : "Create Account"}
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {locale === "de" ? "Haben Sie bereits ein Konto?" : "Already have an account?"}{" "}
                <Link
                  href={`/${locale}/customer/login`}
                  className="font-medium text-primary hover:underline"
                >
                  {locale === "de" ? "Jetzt anmelden" : "Sign in"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {locale === "de"
              ? "Mit der Registrierung akzeptieren Sie unsere"
              : "By registering, you accept our"}{" "}
            <Link href={`/${locale}/privacy`} className="underline hover:text-primary">
              {locale === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
