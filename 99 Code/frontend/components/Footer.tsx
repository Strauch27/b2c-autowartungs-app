import { Car, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AutoConcierge</span>
            </Link>
            <p className="text-background/70">
              Premium Fahrzeugwartung mit Festpreis-Garantie und Hol- und Bringservice.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/booking" className="text-background/70 transition-colors hover:text-background">
                  Termin buchen
                </Link>
              </li>
              <li>
                <Link href="/customer/login" className="text-background/70 transition-colors hover:text-background">
                  Kundenportal
                </Link>
              </li>
              <li>
                <Link href="/jockey/login" className="text-background/70 transition-colors hover:text-background">
                  Fahrer-Portal
                </Link>
              </li>
              <li>
                <Link href="/workshop/login" className="text-background/70 transition-colors hover:text-background">
                  Werkstatt-Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/impressum" className="text-background/70 transition-colors hover:text-background">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-background/70 transition-colors hover:text-background">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-background/70 transition-colors hover:text-background">
                  AGB
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-semibold">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-cta" />
                <a href="mailto:b2c@centhree.com" className="text-background/70 transition-colors hover:text-background">
                  b2c@centhree.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-cta" />
                <a href="tel:+4930123456789" className="text-background/70 transition-colors hover:text-background">
                  +49 30 123 456 789
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-cta" />
                <span className="text-background/70">
                  Musterstraße 123<br />
                  10115 Berlin
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-background/10 pt-8 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} AutoConcierge. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
