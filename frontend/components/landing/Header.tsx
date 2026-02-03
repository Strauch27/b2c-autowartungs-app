'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Car, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";
import dynamic from "next/dynamic";

// Load LanguageSwitcher without SSR to avoid hydration mismatch
const LanguageSwitcher = dynamic(() => import("@/components/LanguageSwitcher"), {
  ssr: false,
});

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const params = useParams();
  const locale = params.locale as string || 'de';

  const navLinks = [
    { label: t.header.home, href: `/${locale}` },
    { label: t.header.howItWorks, href: "#how-it-works" },
    { label: t.header.faq, href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AutoConcierge</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link href={`/${locale}/customer/login`}>
            <Button variant="ghost" size="sm">
              {t.header.login}
            </Button>
          </Link>
          <Link href={`/${locale}/booking`}>
            <Button variant="cta" size="sm">
              {t.header.bookNow}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-lg font-medium text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <hr className="my-4" />
                <Link href={`/${locale}/customer/login`} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.header.login}
                  </Button>
                </Link>
                <Link href={`/${locale}/booking`} onClick={() => setIsOpen(false)}>
                  <Button variant="cta" className="w-full">
                    {t.header.bookNow}
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
