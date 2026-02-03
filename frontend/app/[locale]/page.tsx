import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import PortalCards from '@/components/landing/PortalCards';
import ValueProps from '@/components/landing/ValueProps';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PortalCards />
        <ValueProps />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="faq">
          <FAQ />
        </section>
      </main>
      <Footer />
    </div>
  );
}
