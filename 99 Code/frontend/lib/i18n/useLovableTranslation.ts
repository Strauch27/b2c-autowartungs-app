'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Hook adapter that provides Lovable-style translation interface
 * while using next-intl under the hood.
 *
 * This allows Lovable components to work seamlessly with our next-intl setup.
 */
export function useLovableTranslation() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Get all translation namespaces used by Lovable components
  const header = useTranslations('header');
  const hero = useTranslations('hero');
  const portals = useTranslations('portals');
  const values = useTranslations('values');
  const howItWorks = useTranslations('howItWorks');
  const faq = useTranslations('faq');
  const footer = useTranslations('lovableFooter');
  const booking = useTranslations('lovableBooking');
  const login = useTranslations('login');
  const customerDashboard = useTranslations('customerDashboard');
  const jockeyDashboard = useTranslations('jockeyDashboard');
  const workshopDashboard = useTranslations('workshopDashboard');
  const dashboard = useTranslations('dashboard');

  // Create a translation object that matches Lovable's structure
  const t = {
    header: {
      home: header('home'),
      howItWorks: header('howItWorks'),
      faq: header('faq'),
      login: header('login'),
      bookNow: header('bookNow'),
    },
    hero: {
      badge: hero('badge'),
      title: hero('title'),
      titleHighlight: hero('titleHighlight'),
      subtitle: hero('subtitle'),
      cta: hero('cta'),
      login: hero('login'),
      rating: hero('rating'),
      reviews: hero('reviews'),
    },
    portals: {
      title: portals('title'),
      subtitle: portals('subtitle'),
      customer: {
        title: portals('customer.title'),
        description: portals('customer.description'),
        button: portals('customer.button'),
      },
      jockey: {
        title: portals('jockey.title'),
        description: portals('jockey.description'),
        button: portals('jockey.button'),
      },
      workshop: {
        title: portals('workshop.title'),
        description: portals('workshop.description'),
        button: portals('workshop.button'),
      },
    },
    values: {
      title: values('title'),
      subtitle: values('subtitle'),
      items: {
        price: {
          title: values('items.price.title'),
          description: values('items.price.description'),
        },
        certified: {
          title: values('items.certified.title'),
          description: values('items.certified.description'),
        },
        pickup: {
          title: values('items.pickup.title'),
          description: values('items.pickup.description'),
        },
        instant: {
          title: values('items.instant.title'),
          description: values('items.instant.description'),
        },
      },
    },
    howItWorks: {
      title: howItWorks('title'),
      subtitle: howItWorks('subtitle'),
      steps: {
        vehicle: {
          title: howItWorks('steps.vehicle.title'),
          description: howItWorks('steps.vehicle.description'),
        },
        service: {
          title: howItWorks('steps.service.title'),
          description: howItWorks('steps.service.description'),
        },
        booking: {
          title: howItWorks('steps.booking.title'),
          description: howItWorks('steps.booking.description'),
        },
      },
    },
    faq: {
      title: faq('title'),
      subtitle: faq('subtitle'),
      items: [
        {
          question: faq('items.0.question'),
          answer: faq('items.0.answer'),
        },
        {
          question: faq('items.1.question'),
          answer: faq('items.1.answer'),
        },
        {
          question: faq('items.2.question'),
          answer: faq('items.2.answer'),
        },
        {
          question: faq('items.3.question'),
          answer: faq('items.3.answer'),
        },
        {
          question: faq('items.4.question'),
          answer: faq('items.4.answer'),
        },
        {
          question: faq('items.5.question'),
          answer: faq('items.5.answer'),
        },
      ],
    },
    footer: {
      tagline: footer('tagline'),
      services: footer('services'),
      oilChange: footer('oilChange'),
      inspection: footer('inspection'),
      brakeService: footer('brakeService'),
      acService: footer('acService'),
      company: footer('company'),
      about: footer('about'),
      careers: footer('careers'),
      partner: footer('partner'),
      legal: footer('legal'),
      imprint: footer('imprint'),
      privacy: footer('privacy'),
      terms: footer('terms'),
      rights: footer('rights'),
    },
    booking: {
      conciergeBanner: {
        title: booking('conciergeBanner.title'),
        subtitle: booking('conciergeBanner.subtitle'),
      },
      steps: {
        vehicle: booking('steps.vehicle'),
        service: booking('steps.service'),
        pickup: booking('steps.pickup'),
        confirm: booking('steps.confirm'),
      },
      step1: {
        title: booking('step1.title'),
        brand: booking('step1.brand'),
        selectBrand: booking('step1.selectBrand'),
        model: booking('step1.model'),
        selectModel: booking('step1.selectModel'),
        year: booking('step1.year'),
        selectYear: booking('step1.selectYear'),
        mileage: booking('step1.mileage'),
        mileagePlaceholder: booking('step1.mileagePlaceholder'),
        saveVehicle: booking('step1.saveVehicle'),
        next: booking('step1.next'),
      },
      step2: {
        title: booking('step2.title'),
        services: {
          oil: {
            name: booking('step2.services.oil.name'),
            description: booking('step2.services.oil.description'),
          },
          inspection: {
            name: booking('step2.services.inspection.name'),
            description: booking('step2.services.inspection.description'),
          },
          brakes: {
            name: booking('step2.services.brakes.name'),
            description: booking('step2.services.brakes.description'),
          },
          ac: {
            name: booking('step2.services.ac.name'),
            description: booking('step2.services.ac.description'),
          },
        },
        from: booking('step2.from'),
        next: booking('step2.next'),
      },
      step3: {
        title: booking('step3.title'),
        concierge: {
          title: booking('step3.concierge.title'),
          step1: booking('step3.concierge.step1'),
          step2: booking('step3.concierge.step2'),
          step3: booking('step3.concierge.step3'),
        },
        pickup: {
          title: booking('step3.pickup.title'),
          subtitle: booking('step3.pickup.subtitle'),
          date: booking('step3.pickup.date'),
          time: booking('step3.pickup.time'),
        },
        return: {
          title: booking('step3.return.title'),
          subtitle: booking('step3.return.subtitle'),
          date: booking('step3.return.date'),
          time: booking('step3.return.time'),
          note: booking('step3.return.note'),
        },
        address: {
          title: booking('step3.address.title'),
          street: booking('step3.address.street'),
          streetPlaceholder: booking('step3.address.streetPlaceholder'),
          zip: booking('step3.address.zip'),
          zipPlaceholder: booking('step3.address.zipPlaceholder'),
          city: booking('step3.address.city'),
          cityPlaceholder: booking('step3.address.cityPlaceholder'),
        },
        next: booking('step3.next'),
      },
      step4: {
        title: booking('step4.title'),
        vehicle: booking('step4.vehicle'),
        service: booking('step4.service'),
        timeline: {
          title: booking('step4.timeline.title'),
          pickup: booking('step4.timeline.pickup'),
          return: booking('step4.timeline.return'),
          address: booking('step4.timeline.address'),
        },
        conciergeIncluded: booking('step4.conciergeIncluded'),
        conciergeDescription: booking('step4.conciergeDescription'),
        total: booking('step4.total'),
        contact: {
          title: booking('step4.contact.title'),
          email: booking('step4.contact.email'),
          emailPlaceholder: booking('step4.contact.emailPlaceholder'),
          firstName: booking('step4.contact.firstName'),
          firstNamePlaceholder: booking('step4.contact.firstNamePlaceholder'),
          lastName: booking('step4.contact.lastName'),
          lastNamePlaceholder: booking('step4.contact.lastNamePlaceholder'),
          phone: booking('step4.contact.phone'),
          phonePlaceholder: booking('step4.contact.phonePlaceholder'),
          note: booking('step4.contact.note'),
        },
        terms: booking('step4.terms'),
        submit: booking('step4.submit'),
      },
    },
    login: {
      title: login('title'),
      subtitle: login('subtitle'),
      email: login('email'),
      emailPlaceholder: login('emailPlaceholder'),
      password: login('password'),
      passwordPlaceholder: login('passwordPlaceholder'),
      forgot: login('forgot'),
      submit: login('submit'),
      noAccount: login('noAccount'),
      register: login('register'),
      portalTitles: {
        customer: login('portalTitles.customer'),
        jockey: login('portalTitles.jockey'),
        workshop: login('portalTitles.workshop'),
      },
      portalDescriptions: {
        customer: login('portalDescriptions.customer'),
        jockey: login('portalDescriptions.jockey'),
        workshop: login('portalDescriptions.workshop'),
      },
    },
    dashboard: {
      welcome: dashboard('welcome'),
      logout: dashboard('logout'),
    },
    customerDashboard: {
      nav: {
        dashboard: customerDashboard('nav.dashboard'),
        newBooking: customerDashboard('nav.newBooking'),
        myBookings: customerDashboard('nav.myBookings'),
        vehicles: customerDashboard('nav.vehicles'),
        profile: customerDashboard('nav.profile'),
      },
      stats: {
        activeBookings: customerDashboard('stats.activeBookings'),
        savedVehicles: customerDashboard('stats.savedVehicles'),
        lastBooking: customerDashboard('stats.lastBooking'),
      },
      recentBookings: customerDashboard('recentBookings'),
      noBookings: customerDashboard('noBookings'),
      viewDetails: customerDashboard('viewDetails'),
      status: {
        planned: customerDashboard('status.planned'),
        inProgress: customerDashboard('status.inProgress'),
        completed: customerDashboard('status.completed'),
      },
    },
    jockeyDashboard: {
      today: jockeyDashboard('today'),
      stats: {
        todayTrips: jockeyDashboard('stats.todayTrips'),
        completed: jockeyDashboard('stats.completed'),
        pending: jockeyDashboard('stats.pending'),
      },
      assignments: jockeyDashboard('assignments'),
      noAssignments: jockeyDashboard('noAssignments'),
      status: {
        upcoming: jockeyDashboard('status.upcoming'),
        onRoute: jockeyDashboard('status.onRoute'),
        completed: jockeyDashboard('status.completed'),
      },
      pickup: jockeyDashboard('pickup'),
      navigate: jockeyDashboard('navigate'),
      startPickup: jockeyDashboard('startPickup'),
      documentHandover: jockeyDashboard('documentHandover'),
      complete: jockeyDashboard('complete'),
    },
    workshopDashboard: {
      stats: {
        ordersToday: workshopDashboard('stats.ordersToday'),
        inProgress: workshopDashboard('stats.inProgress'),
        completed: workshopDashboard('stats.completed'),
      },
      orders: workshopDashboard('orders'),
      noOrders: workshopDashboard('noOrders'),
      table: {
        orderId: workshopDashboard('table.orderId'),
        customer: workshopDashboard('table.customer'),
        vehicle: workshopDashboard('table.vehicle'),
        service: workshopDashboard('table.service'),
        status: workshopDashboard('table.status'),
        actions: workshopDashboard('table.actions'),
      },
      status: {
        received: workshopDashboard('status.received'),
        inProgress: workshopDashboard('status.inProgress'),
        waitingApproval: workshopDashboard('status.waitingApproval'),
        completed: workshopDashboard('status.completed'),
      },
      viewDetails: workshopDashboard('viewDetails'),
      createExtension: workshopDashboard('createExtension'),
    },
  };

  // Language switcher function that works with Next.js routing
  const setLanguage = (newLocale: 'de' | 'en') => {
    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean);

    // Remove the first segment if it's a locale (de or en)
    if (segments[0] === 'de' || segments[0] === 'en') {
      segments.shift();
    }

    // Build new path with new locale
    const newPath = segments.length > 0 ? `/${newLocale}/${segments.join('/')}` : `/${newLocale}`;

    // Preserve query parameters and hash from current URL
    const search = window.location.search;
    const hash = window.location.hash;
    const fullPath = `${newPath}${search}${hash}`;

    // Navigate to the new path
    router.push(fullPath);
  };

  return {
    t,
    language: locale as 'de' | 'en',
    setLanguage,
  };
}

/**
 * Alias for useLovableTranslation to match Lovable's naming convention
 */
export const useLanguage = useLovableTranslation;
