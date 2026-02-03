'use client';

import { Car, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLovableTranslation";

const Footer = () => {
  const { t } = useLanguage();
  const params = useParams();
  const locale = params.locale as string || 'de';

  return (
    <footer className="bg-[#1a1f2e] text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoConcierge</span>
            </Link>
            <p className="text-background/70">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/customer/login`} className="text-background/70 transition-colors hover:text-background">
                  Kundenportal
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/jockey/login`} className="text-background/70 transition-colors hover:text-background">
                  Fahrerportal
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/workshop/login`} className="text-background/70 transition-colors hover:text-background">
                  Werkstatt-Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/privacy`} className="text-background/70 transition-colors hover:text-background">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-background/70 transition-colors hover:text-background">
                  AGB
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/imprint`} className="text-background/70 transition-colors hover:text-background">
                  {t.footer.imprint}
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="h-4 w-4" />
                <span>info@autoconcierge.de</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="h-4 w-4" />
                <span>+49 30 123 456 789</span>
              </li>
              <li className="flex items-start gap-2 text-background/70">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Musterstraße 123<br />10115 Berlin</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-background/10 pt-8 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} AutoConcierge. Alle Rechte vorbehalten</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
