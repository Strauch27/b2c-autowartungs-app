import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import { ServicesShowcase } from '@/components/landing/services-showcase';
import { TrustSocialProof } from '@/components/landing/trust-social-proof';
import { CTABanner } from '@/components/landing/cta-banner';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'AutoConcierge - Premium Fahrzeugwartung mit Festpreis-Garantie',
  description:
    'Wir holen Ihr Auto ab & bringen es zurück – bequemer geht\'s nicht. Premium Fahrzeugwartung mit Festpreis-Garantie und Concierge-Service.',
  keywords: 'Auto Concierge, Fahrzeugwartung, Festpreis, Hol- und Bringservice, Werkstatt, KFZ Service',
  openGraph: {
    title: 'AutoConcierge - Premium Fahrzeugwartung',
    description: 'Premium Fahrzeugwartung mit Festpreis-Garantie und Concierge-Service.',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ServicesShowcase />
        <TrustSocialProof />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
