'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/useLovableTranslation';
import dynamic from 'next/dynamic';

const LanguageSwitcher = dynamic(() => import('@/components/LanguageSwitcher'), {
  ssr: false,
});

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const params = useParams();
  const locale = (params.locale as string) || 'de';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.header.howItWorks, href: '#how-it-works' },
    { label: locale === 'de' ? 'Services' : 'Services', href: '#services' },
    { label: locale === 'de' ? 'Bewertungen' : 'Reviews', href: '#trust' },
  ];

  return (
    <nav
      className={`glass-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 ${scrolled ? 'glass-nav-scrolled' : ''}`}
      data-testid="landing-navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7h8m-8 4h4m-2 4v4m-4-4h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AutoConcierge</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white transition font-medium text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/customer/login`}
            className="text-gray-300 hover:text-white transition text-sm font-medium px-4 py-2"
          >
            {t.header.login}
          </Link>
          <Link
            href={`/${locale}/booking`}
            className="btn-primary-landing px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            {t.header.bookNow}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-gray-300 hover:text-white py-2 text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href={`/${locale}/customer/login`}
            className="block text-gray-300 hover:text-white py-2 text-sm"
            onClick={() => setMobileOpen(false)}
          >
            {t.header.login}
          </Link>
          <Link
            href={`/${locale}/booking`}
            className="block mt-2 btn-primary-landing px-5 py-2.5 rounded-xl font-semibold text-sm text-center"
            onClick={() => setMobileOpen(false)}
          >
            {t.header.bookNow}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
