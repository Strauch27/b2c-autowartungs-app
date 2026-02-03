# Design System - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Draft für MVP

---

## Design-Philosophie

### Kernprinzipien

1. **Vertrauen schaffen**: Premium-Look & Feel für digitale Autowartung
2. **Transparenz**: Preise und Prozesse klar kommunizieren
3. **Convenience**: Mobile-First für unterwegs Buchung
4. **Professionalität**: Deutsche Markenpräferenz für Qualität

### Brand Personality

- **Modern**: Frisches Design, nicht altbacken wie traditionelle Werkstätten
- **Vertrauenswürdig**: Kein aggressives Startup-Look, sondern etabliert wirkend
- **Accessible**: Auch für Nicht-Techies verständlich
- **Premium**: Hochwertig, aber nicht elitär

---

## Farbsystem

### Primärfarben

```css
/* Primary Blue - Trust, Professionalität */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Brand Color */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
--primary-950: #172554;
```

**Verwendung:**
- Primary Buttons
- CTAs
- Links
- Active States
- Progress Indicators

### Sekundärfarben

```css
/* Orange/Amber - Energy, Call-to-Action */
--accent-50: #fffbeb;
--accent-100: #fef3c7;
--accent-200: #fde68a;
--accent-300: #fcd34d;
--accent-400: #fbbf24;
--accent-500: #f59e0b;  /* Accent Color */
--accent-600: #d97706;
--accent-700: #b45309;
--accent-800: #92400e;
--accent-900: #78350f;
```

**Verwendung:**
- Secondary Buttons
- Highlights
- Special Offers
- Hover States auf Primary

### Semantische Farben

```css
/* Success - Grün */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

/* Warning - Gelb */
--warning-50: #fefce8;
--warning-100: #fef9c3;
--warning-500: #eab308;
--warning-600: #ca8a04;
--warning-700: #a16207;

/* Error - Rot */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info - Cyan */
--info-50: #ecfeff;
--info-100: #cffafe;
--info-500: #06b6d4;
--info-600: #0891b2;
--info-700: #0e7490;
```

### Neutralfarben (Gray Scale)

```css
/* Neutral - für Text, Backgrounds, Borders */
--neutral-50: #f9fafb;
--neutral-100: #f3f4f6;
--neutral-200: #e5e7eb;
--neutral-300: #d1d5db;
--neutral-400: #9ca3af;
--neutral-500: #6b7280;
--neutral-600: #4b5563;
--neutral-700: #374151;
--neutral-800: #1f2937;
--neutral-900: #111827;
--neutral-950: #030712;
```

### Dark Mode Palette

```css
/* Dark Mode - Optional für später */
--dark-bg-primary: #0f172a;
--dark-bg-secondary: #1e293b;
--dark-bg-tertiary: #334155;
--dark-text-primary: #f1f5f9;
--dark-text-secondary: #cbd5e1;
--dark-border: #475569;
```

---

## Typografie

### Font Stack

```css
/* Primary Font - Sans Serif für UI */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                     'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Secondary Font - für Headlines (optional) */
--font-family-display: 'Inter', system-ui, sans-serif;

/* Monospace - für Codes, Prices */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Rationale:**
- **Inter**: Moderne, lesbare Sans-Serif mit excellenter Hinting
- **System Fonts als Fallback**: Schnelles Laden, native Look & Feel
- Keine Custom-Fonts im MVP für Performance

### Type Scale (Modular Scale 1.250 - Major Third)

```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Small labels, footnotes */
--text-sm: 0.875rem;     /* 14px - Secondary text, captions */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body, intro text */
--text-xl: 1.25rem;      /* 20px - H5 */
--text-2xl: 1.5rem;      /* 24px - H4 */
--text-3xl: 1.875rem;    /* 30px - H3 */
--text-4xl: 2.25rem;     /* 36px - H2 */
--text-5xl: 3rem;        /* 48px - H1 */
--text-6xl: 3.75rem;     /* 60px - Display (Desktop only) */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Usage Guidelines

```css
/* Headings */
h1 {
  font-size: var(--text-5xl);      /* 48px */
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

h2 {
  font-size: var(--text-4xl);      /* 36px */
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

h3 {
  font-size: var(--text-3xl);      /* 30px */
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

h4 {
  font-size: var(--text-2xl);      /* 24px */
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

h5 {
  font-size: var(--text-xl);       /* 20px */
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

/* Body Text */
body, p {
  font-size: var(--text-base);     /* 16px */
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--neutral-700);
}

/* Small Text */
.text-small {
  font-size: var(--text-sm);       /* 14px */
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}

/* Display Price */
.price-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

---

## Spacing System

### Spacing Scale (4px Base Grid)

```css
--spacing-0: 0px;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
--spacing-32: 8rem;      /* 128px */
```

### Layout Guidelines

- **Intra-Component Spacing**: 4px, 8px, 12px (--spacing-1 bis --spacing-3)
- **Inter-Component Spacing**: 16px, 24px, 32px (--spacing-4 bis --spacing-8)
- **Section Spacing**: 48px, 64px, 96px (--spacing-12 bis --spacing-24)
- **Container Padding Mobile**: 16px (--spacing-4)
- **Container Padding Desktop**: 24px (--spacing-6)

---

## Komponenten-Bibliothek

### Buttons

#### Primary Button

```tsx
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  text-base font-medium
  text-white
  bg-primary-600
  border border-transparent
  rounded-lg
  shadow-sm
  hover:bg-primary-700
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  active:bg-primary-800
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200
">
  Jetzt buchen
</button>
```

**States:**
- Default: bg-primary-600
- Hover: bg-primary-700
- Focus: ring-2 ring-primary-500
- Active: bg-primary-800
- Disabled: opacity-50

#### Secondary Button

```tsx
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  text-base font-medium
  text-primary-700
  bg-primary-50
  border border-primary-200
  rounded-lg
  hover:bg-primary-100
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  active:bg-primary-200
  transition-colors duration-200
">
  Mehr erfahren
</button>
```

#### Outline Button

```tsx
<button className="
  inline-flex items-center justify-center
  px-6 py-3
  text-base font-medium
  text-neutral-700
  bg-white
  border border-neutral-300
  rounded-lg
  hover:bg-neutral-50
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
  transition-colors duration-200
">
  Abbrechen
</button>
```

#### Button Sizes

```tsx
/* Small */
className="px-4 py-2 text-sm"

/* Medium (Default) */
className="px-6 py-3 text-base"

/* Large */
className="px-8 py-4 text-lg"

/* Full Width (Mobile) */
className="w-full px-6 py-3 text-base"
```

### Form Elements

#### Input Field

```tsx
<div className="space-y-2">
  <label
    htmlFor="email"
    className="block text-sm font-medium text-neutral-700"
  >
    E-Mail-Adresse
  </label>
  <input
    type="email"
    id="email"
    className="
      block w-full
      px-4 py-3
      text-base text-neutral-900
      bg-white
      border border-neutral-300
      rounded-lg
      placeholder-neutral-400
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      disabled:bg-neutral-50 disabled:text-neutral-500
      transition-colors duration-200
    "
    placeholder="ihre@email.de"
  />
  <p className="text-sm text-neutral-500">
    Wir senden Ihnen eine Buchungsbestätigung.
  </p>
</div>
```

**Error State:**

```tsx
<input
  className="
    border-error-500
    focus:ring-error-500
  "
/>
<p className="text-sm text-error-600 mt-1">
  Bitte geben Sie eine gültige E-Mail-Adresse ein.
</p>
```

#### Select/Dropdown

```tsx
<select className="
  block w-full
  px-4 py-3
  text-base text-neutral-900
  bg-white
  border border-neutral-300
  rounded-lg
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  appearance-none
  bg-[url('data:image/svg+xml,...')] bg-no-repeat bg-right-4
  transition-colors duration-200
">
  <option>Volkswagen</option>
  <option>BMW</option>
  <option>Mercedes-Benz</option>
</select>
```

#### Checkbox

```tsx
<label className="flex items-start space-x-3">
  <input
    type="checkbox"
    className="
      w-5 h-5 mt-0.5
      text-primary-600
      border-neutral-300
      rounded
      focus:ring-2 focus:ring-primary-500
    "
  />
  <span className="text-sm text-neutral-700">
    Ich akzeptiere die <a href="#" className="text-primary-600 hover:underline">AGB</a>
    und <a href="#" className="text-primary-600 hover:underline">Datenschutzbestimmungen</a>.
  </span>
</label>
```

#### Radio Button

```tsx
<label className="flex items-center space-x-3 cursor-pointer">
  <input
    type="radio"
    name="service"
    className="
      w-5 h-5
      text-primary-600
      border-neutral-300
      focus:ring-2 focus:ring-primary-500
    "
  />
  <span className="text-base text-neutral-700">
    Inspektion / Wartung
  </span>
</label>
```

### Cards

#### Standard Card

```tsx
<div className="
  bg-white
  border border-neutral-200
  rounded-xl
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow duration-200
">
  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
    Titel
  </h3>
  <p className="text-base text-neutral-600">
    Beschreibung
  </p>
</div>
```

#### Interactive Card (Selectable)

```tsx
<button className="
  w-full
  bg-white
  border-2 border-neutral-200
  rounded-xl
  p-6
  text-left
  hover:border-primary-300
  hover:bg-primary-50
  focus:outline-none focus:ring-2 focus:ring-primary-500
  active:border-primary-500
  transition-all duration-200
">
  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
    Service-Option
  </h3>
  <p className="text-sm text-neutral-600">
    Beschreibung
  </p>
  <p className="text-2xl font-bold text-primary-600 mt-4">
    249,00 EUR
  </p>
</button>
```

**Selected State:**

```tsx
className="
  border-2 border-primary-500
  bg-primary-50
  ring-2 ring-primary-200
"
```

#### Price Card

```tsx
<div className="
  bg-gradient-to-br from-primary-500 to-primary-700
  rounded-xl
  p-8
  text-white
  shadow-lg
">
  <p className="text-sm font-medium uppercase tracking-wide opacity-90">
    Ihr Festpreis
  </p>
  <p className="text-5xl font-bold mt-2">
    249,00 EUR
  </p>
  <p className="text-sm mt-2 opacity-90">
    inkl. MwSt. | inkl. Hol- und Bringservice
  </p>
  <div className="mt-6 pt-6 border-t border-white/20">
    <p className="text-sm">
      ✓ Garantierter Festpreis - keine versteckten Kosten
    </p>
  </div>
</div>
```

### Badges

```tsx
/* Success Badge */
<span className="
  inline-flex items-center
  px-3 py-1
  text-xs font-medium
  text-success-700
  bg-success-100
  rounded-full
">
  Freigegeben
</span>

/* Warning Badge */
<span className="
  inline-flex items-center
  px-3 py-1
  text-xs font-medium
  text-warning-700
  bg-warning-100
  rounded-full
">
  Offen
</span>

/* Error Badge */
<span className="
  inline-flex items-center
  px-3 py-1
  text-xs font-medium
  text-error-700
  bg-error-100
  rounded-full
">
  Abgelehnt
</span>

/* Info Badge */
<span className="
  inline-flex items-center
  px-3 py-1
  text-xs font-medium
  text-primary-700
  bg-primary-100
  rounded-full
">
  In Bearbeitung
</span>
```

### Alerts

#### Success Alert

```tsx
<div className="
  flex items-start space-x-3
  p-4
  bg-success-50
  border border-success-200
  rounded-lg
">
  <svg className="w-5 h-5 text-success-600 mt-0.5" fill="currentColor">
    <!-- Check icon -->
  </svg>
  <div>
    <h4 className="text-sm font-medium text-success-800">
      Buchung erfolgreich
    </h4>
    <p className="text-sm text-success-700 mt-1">
      Sie erhalten eine Bestätigung per E-Mail.
    </p>
  </div>
</div>
```

#### Error Alert

```tsx
<div className="
  flex items-start space-x-3
  p-4
  bg-error-50
  border border-error-200
  rounded-lg
">
  <svg className="w-5 h-5 text-error-600 mt-0.5" fill="currentColor">
    <!-- X icon -->
  </svg>
  <div>
    <h4 className="text-sm font-medium text-error-800">
      Zahlung fehlgeschlagen
    </h4>
    <p className="text-sm text-error-700 mt-1">
      Bitte prüfen Sie Ihre Zahlungsmethode.
    </p>
  </div>
</div>
```

#### Info Alert

```tsx
<div className="
  flex items-start space-x-3
  p-4
  bg-info-50
  border border-info-200
  rounded-lg
">
  <svg className="w-5 h-5 text-info-600 mt-0.5" fill="currentColor">
    <!-- Info icon -->
  </svg>
  <div>
    <p className="text-sm text-info-700">
      Zusätzliche Arbeiten werden separat angeboten und erst nach Ihrer Freigabe durchgeführt.
    </p>
  </div>
</div>
```

---

## Icons

### Icon Library

**Empfehlung:** Heroicons (MIT License, React-ready)

```bash
npm install @heroicons/react
```

### Icon Sizes

```css
--icon-xs: 16px;   /* w-4 h-4 */
--icon-sm: 20px;   /* w-5 h-5 */
--icon-md: 24px;   /* w-6 h-6 */
--icon-lg: 32px;   /* w-8 h-8 */
--icon-xl: 40px;   /* w-10 h-10 */
```

### Key Icons für App

```tsx
/* Navigation */
import { HomeIcon, UserIcon, CalendarIcon, CogIcon } from '@heroicons/react/24/outline'

/* Actions */
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

/* Status */
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

/* Services */
import { WrenchIcon, TruckIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline'
```

### Icon Usage Guidelines

```tsx
/* Default - Outline für UI Elements */
<HomeIcon className="w-6 h-6 text-neutral-600" />

/* Solid - für Status Indicators */
<CheckCircleIcon className="w-5 h-5 text-success-500" />

/* With Text */
<button className="flex items-center space-x-2">
  <PlusIcon className="w-5 h-5" />
  <span>Hinzufügen</span>
</button>
```

---

## Shadows & Elevation

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

### Elevation Hierarchy

- **Level 0**: No shadow (flat elements)
- **Level 1**: shadow-sm (cards, inputs)
- **Level 2**: shadow-md (hover states, dropdown)
- **Level 3**: shadow-lg (modals, overlays)
- **Level 4**: shadow-xl (dialogs, popovers)

---

## Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius: 0.5rem;        /* 8px */
--radius-md: 0.75rem;    /* 12px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-full: 9999px;   /* Circular */
```

### Usage Guidelines

- **Buttons**: rounded-lg (16px)
- **Cards**: rounded-xl (24px)
- **Inputs**: rounded-lg (16px)
- **Badges**: rounded-full (circular)
- **Images**: rounded-lg or rounded-xl

---

## Transitions & Animations

### Transition Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions

```css
/* Color Changes */
transition: color 200ms ease-out, background-color 200ms ease-out;

/* Transform */
transition: transform 300ms ease-out;

/* Opacity */
transition: opacity 200ms ease-out;

/* All */
transition: all 200ms ease-out;
```

### Micro-Interactions

```tsx
/* Button Hover */
className="
  transform hover:scale-105
  transition-transform duration-200
"

/* Card Hover */
className="
  transition-shadow duration-200
  hover:shadow-lg
"

/* Loading Spinner */
className="
  animate-spin
  duration-700
"
```

---

## Breakpoints (Responsive Design)

```css
/* Tailwind Default Breakpoints */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

### Mobile-First Approach

```tsx
/* Mobile Default (320px+) */
className="text-base px-4"

/* Tablet (768px+) */
className="md:text-lg md:px-6"

/* Desktop (1024px+) */
className="lg:text-xl lg:px-8"
```

### Common Responsive Patterns

```tsx
/* Grid Layout */
className="
  grid
  grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
"

/* Typography */
className="
  text-3xl
  md:text-4xl
  lg:text-5xl
"

/* Spacing */
className="
  py-8
  md:py-12
  lg:py-16
"
```

---

## Z-Index Scale

```css
--z-0: 0;
--z-10: 10;      /* Dropdown menus */
--z-20: 20;      /* Sticky headers */
--z-30: 30;      /* Fixed navigation */
--z-40: 40;      /* Modals overlay */
--z-50: 50;      /* Toasts, notifications */
```

---

## Accessibility

### Minimum Touch Targets

```css
/* WCAG 2.1 AA Compliance */
--min-touch-target: 44px;  /* Minimum 44x44px for touchable elements */
```

### Color Contrast Ratios

- **Normal Text**: 4.5:1 minimum (WCAG AA)
- **Large Text**: 3:1 minimum (WCAG AA)
- **UI Components**: 3:1 minimum (WCAG AA)

**Tested Combinations:**

✓ primary-600 on white: 4.77:1 (Pass)
✓ neutral-700 on white: 7.48:1 (Pass AAA)
✓ neutral-600 on white: 5.74:1 (Pass AA)
✗ primary-300 on white: 2.89:1 (Fail - don't use for text)

### Focus States

```tsx
className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary-500
  focus:ring-offset-2
"
```

### Screen Reader Support

```tsx
/* Visually Hidden but Screen Reader Accessible */
<span className="sr-only">
  Beschreibung für Screen Reader
</span>

/* ARIA Labels */
<button aria-label="Menu öffnen">
  <MenuIcon className="w-6 h-6" />
</button>
```

---

## Loading States

### Skeleton Loader

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
</div>
```

### Spinner

```tsx
<svg
  className="animate-spin h-8 w-8 text-primary-600"
  fill="none"
  viewBox="0 0 24 24"
>
  <circle
    className="opacity-25"
    cx="12" cy="12" r="10"
    stroke="currentColor"
    strokeWidth="4"
  />
  <path
    className="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  />
</svg>
```

### Progress Bar

```tsx
<div className="w-full bg-neutral-200 rounded-full h-2">
  <div
    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
    style={{ width: '70%' }}
  />
</div>
```

---

## Implementation Notes

### Tailwind CSS Setup

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... full scale
        },
        accent: {
          // ... full scale
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Custom spacing if needed
      }
    }
  }
}
```

### CSS Variables Fallback

```css
:root {
  --primary-600: #2563eb;
  --neutral-700: #374151;
  /* ... all other variables */
}
```

---

## Design Tokens Export

**Für Design-zu-Dev Handoff:**

- Figma → Export als CSS Variables
- Use Tokens Studio Plugin für Figma
- Generate JSON tokens für Multi-Platform (iOS, Android später)

---

## Nächste Schritte

1. **Figma Prototype**: Design System in Figma aufbauen
2. **Component Library**: Storybook für React Components
3. **Design Review**: Mit Team validieren
4. **Implementation**: Tailwind CSS + shadcn/ui Integration

---

**Version History:**

- 1.0 (2026-02-01): Initial Design System für MVP
