'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  portalType: "customer" | "jockey" | "workshop";
  registerLink?: string;
}

const LoginForm = ({
  onSubmit,
  isLoading = false,
  portalType,
  registerLink,
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t.login.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.login.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t.login.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
            data-testid={`${portalType}-email-input`}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.login.password}</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t.login.forgot}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium pr-10"
              data-testid={`${portalType}-password-input`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant={portalType === "jockey" ? "jockey" : portalType === "workshop" ? "workshop" : "default"}
          className="w-full"
          size="lg"
          disabled={isLoading}
          data-testid={`${portalType}-login-button`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.login.submit}...
            </>
          ) : (
            t.login.submit
          )}
        </Button>
      </form>

      {registerLink && (
        <p className="text-center text-sm text-muted-foreground">
          {t.login.noAccount}{" "}
          <Link href={registerLink} className="font-medium text-primary hover:underline">
            {t.login.register}
          </Link>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
