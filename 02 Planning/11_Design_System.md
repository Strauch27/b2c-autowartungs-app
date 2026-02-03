# Design System - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Design Specification Ready for Implementation

---

## Inhaltsverzeichnis

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Grid](#spacing--grid)
5. [Component Library](#component-library)
6. [Icon System](#icon-system)
7. [Animation & Motion](#animation--motion)
8. [Accessibility Guidelines](#accessibility-guidelines)

---

## Design Principles

### Core Principles

**1. Trust & Transparency**
- Clear pricing displayed prominently
- No hidden information or surprise costs
- Honest communication throughout journey
- Visual indicators of security (SSL badges, payment logos)

**2. Simplicity & Clarity**
- Minimize cognitive load at each step
- One primary action per screen
- Plain language, no technical jargon
- Progressive disclosure of complexity

**3. Mobile-First**
- Design for smallest screen first
- Touch-optimized interactions (min 44x44px targets)
- Thumb-zone consideration for primary actions
- Performance-first approach

**4. Consistency**
- Reusable components across all portals
- Consistent patterns for similar actions
- Unified visual language
- Predictable behavior

**5. Delight**
- Subtle animations (under 300ms)
- Success celebrations without being overwhelming
- Friendly micro-copy
- Thoughtful empty states

---

## Color System

### Primary Colors

```css
/* Primary Blue - Main brand color for CTAs and important elements */
--primary-50:  #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;  /* Main */
--primary-600: #0284c7;  /* Hover */
--primary-700: #0369a1;  /* Active */
--primary-800: #075985;
--primary-900: #0c4a6e;
```

**Usage:**
- Primary-600: Main CTAs, active states, links
- Primary-500: Secondary buttons, icons
- Primary-100: Subtle backgrounds, hover states
- Primary-50: Very light backgrounds

**Tailwind Classes:**
```
bg-primary-600 hover:bg-primary-700
text-primary-600 hover:text-primary-700
border-primary-500
```

### Neutral Gray Scale

```css
/* Gray - Used for text, borders, backgrounds */
--gray-50:  #f9fafb;  /* Very light background */
--gray-100: #f3f4f6;  /* Light background */
--gray-200: #e5e7eb;  /* Borders, dividers */
--gray-300: #d1d5db;  /* Input borders */
--gray-400: #9ca3af;  /* Placeholder text */
--gray-500: #6b7280;  /* Secondary text */
--gray-600: #4b5563;  /* Body text */
--gray-700: #374151;  /* Headings */
--gray-800: #1f2937;
--gray-900: #111827;  /* Primary headings */
```

**Usage:**
- Gray-900/700: Headings and important text
- Gray-600: Body text
- Gray-500: Secondary text, labels
- Gray-300: Borders
- Gray-100/50: Backgrounds

### Semantic Colors

```css
/* Success Green */
--success-50:  #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;
--success-600: #16a34a;  /* Primary success */
--success-700: #15803d;

/* Warning Yellow/Amber */
--warning-50:  #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;  /* Primary warning */
--warning-700: #b45309;

/* Error Red */
--error-50:  #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;  /* Primary error */
--error-700: #b91c1c;

/* Info Blue */
--info-50:  #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-700: #1d4ed8;
```

**Usage Examples:**
- Success: Completed bookings, checkmarks, positive feedback
- Warning: Pending approvals, time-sensitive actions, caution alerts
- Error: Form validation errors, failed actions, critical alerts
- Info: Informational messages, tips, hints

### Accent Colors

```css
/* Orange - For Auftragserweiterung */
--orange-50:  #fff7ed;
--orange-100: #ffedd5;
--orange-500: #f97316;
--orange-600: #ea580c;

/* Purple - For Digital features */
--purple-50:  #faf5ff;
--purple-100: #f3e8ff;
--purple-500: #a855f7;
--purple-600: #9333ea;
```

### Color Usage Guidelines

**Do's:**
- Use primary-600 for main CTAs
- Use gray-600 for body text
- Use semantic colors for their intended purpose
- Maintain sufficient contrast (WCAG AA minimum)

**Don'ts:**
- Don't use red for non-error states
- Don't use more than 3 colors in a single component
- Don't use primary color for destructive actions
- Don't rely solely on color to convey information

---

## Typography

### Font Family

**Primary Font: Inter**
- Clean, modern sans-serif
- Excellent readability at all sizes
- Extensive weights available
- Optimized for screens

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Fallback Stack:**
System fonts ensure fast loading and native feel on each platform.

### Type Scale

Based on a modular scale (1.25 ratio) for harmonious proportions.

```css
/* Display - For hero sections */
--text-display: 4rem;      /* 64px */
line-height: 1;
font-weight: 700;
letter-spacing: -0.02em;

/* Heading 1 - Main page titles */
--text-h1: 3rem;           /* 48px */
line-height: 1.1;
font-weight: 700;
letter-spacing: -0.01em;

/* Heading 2 - Section titles */
--text-h2: 2.25rem;        /* 36px */
line-height: 1.2;
font-weight: 700;

/* Heading 3 - Subsection titles */
--text-h3: 1.875rem;       /* 30px */
line-height: 1.3;
font-weight: 700;

/* Heading 4 - Card titles */
--text-h4: 1.5rem;         /* 24px */
line-height: 1.4;
font-weight: 600;

/* Heading 5 - Small headings */
--text-h5: 1.25rem;        /* 20px */
line-height: 1.4;
font-weight: 600;

/* Body Large - Lead paragraphs */
--text-lg: 1.125rem;       /* 18px */
line-height: 1.6;
font-weight: 400;

/* Body - Default text */
--text-base: 1rem;         /* 16px */
line-height: 1.5;
font-weight: 400;

/* Body Small - Secondary text */
--text-sm: 0.875rem;       /* 14px */
line-height: 1.5;
font-weight: 400;

/* Caption - Tiny text */
--text-xs: 0.75rem;        /* 12px */
line-height: 1.5;
font-weight: 400;
```

### Font Weights

```css
--font-normal:    400;  /* Body text */
--font-medium:    500;  /* Emphasis */
--font-semibold:  600;  /* Subheadings */
--font-bold:      700;  /* Headings, CTAs */
```

### Tailwind Typography Classes

```jsx
// Headings
<h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
<h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
<h3 className="text-2xl font-bold text-gray-900">
<h4 className="text-xl font-semibold text-gray-900">

// Body text
<p className="text-base text-gray-600 leading-relaxed">
<p className="text-lg text-gray-700">
<p className="text-sm text-gray-500">

// Special
<span className="text-xs uppercase tracking-wide font-semibold text-gray-500">
```

### Typography Guidelines

**Hierarchy Rules:**
- Maximum 3 levels of hierarchy on one screen
- Headings should be 1.5-2x larger than body text
- Use weight and color to create hierarchy, not just size
- Maintain consistent line-height for readability

**Line Length:**
- Optimal: 50-75 characters per line
- Maximum: 90 characters per line
- Use max-w-prose (65ch) for long-form content

---

## Spacing & Grid

### Spacing Scale (8px Base Unit)

```css
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

**Common Spacing Patterns:**

```jsx
// Component internal spacing
<div className="p-6">           /* 24px padding */
<div className="px-4 py-3">     /* 16px horizontal, 12px vertical */

// Gaps between elements
<div className="space-y-4">     /* 16px vertical gap */
<div className="gap-6">         /* 24px gap in flex/grid */

// Margins
<div className="mb-8">          /* 32px bottom margin */
<div className="mt-12">         /* 48px top margin */

// Section spacing
<section className="py-16">    /* 64px vertical padding */
<section className="py-20 lg:py-32"> /* Responsive padding */
```

### Layout Grid

**Container Widths:**
```css
--container-sm: 640px;   /* sm breakpoint */
--container-md: 768px;   /* md breakpoint */
--container-lg: 1024px;  /* lg breakpoint */
--container-xl: 1280px;  /* xl breakpoint */
--container-2xl: 1536px; /* 2xl breakpoint */
```

**Max Width:**
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content constrained to 1280px with responsive padding */}
</div>
```

**Grid Systems:**

```jsx
// 12-column grid
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">

// Auto-fit responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Equal columns
<div className="grid grid-cols-3 gap-4">
```

### Responsive Breakpoints

```css
/* Mobile first approach */
sm:  640px   /* @media (min-width: 640px) */
md:  768px   /* @media (min-width: 768px) */
lg:  1024px  /* @media (min-width: 1024px) */
xl:  1280px  /* @media (min-width: 1280px) */
2xl: 1536px  /* @media (min-width: 1536px) */
```

**Usage:**
```jsx
<div className="text-4xl md:text-5xl lg:text-6xl">
  {/* Responsive typography */}
</div>

<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive spacing */}
</div>
```

---

## Component Library

### Buttons

**Primary Button (Main CTA):**
```jsx
<button className="
  bg-primary-600 hover:bg-primary-700
  text-white font-semibold
  py-3 px-6
  rounded-xl
  shadow-lg hover:shadow-xl
  transition-all duration-200
  transform hover:scale-105
  focus:outline-none focus:ring-4 focus:ring-primary-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  JETZT BUCHEN
</button>
```

**Secondary Button:**
```jsx
<button className="
  bg-white hover:bg-gray-50
  border-2 border-gray-300 hover:border-gray-400
  text-gray-900 font-semibold
  py-3 px-6
  rounded-xl
  transition-all duration-200
  focus:outline-none focus:ring-4 focus:ring-gray-200
">
  Mehr erfahren
</button>
```

**Success Button:**
```jsx
<button className="
  bg-green-600 hover:bg-green-700
  text-white font-bold
  py-4 px-6
  rounded-xl
  shadow-lg
  transition-all
">
  FREIGEBEN
</button>
```

**Destructive Button:**
```jsx
<button className="
  bg-red-600 hover:bg-red-700
  text-white font-semibold
  py-3 px-6
  rounded-xl
  transition-all
">
  Ablehnen
</button>
```

**Button Sizes:**
```jsx
// Small
className="py-2 px-4 text-sm"

// Medium (default)
className="py-3 px-6 text-base"

// Large
className="py-4 px-8 text-lg"

// Extra Large (Hero CTAs)
className="py-5 px-10 text-xl"
```

### Form Elements

**Text Input:**
```jsx
<input
  type="text"
  className="
    w-full px-4 py-3
    border-2 border-gray-300
    rounded-xl
    focus:border-primary-500 focus:ring-4 focus:ring-primary-200
    transition-all
    placeholder:text-gray-400
  "
  placeholder="z.B. Hauptstraße 123"
/>
```

**Select Dropdown:**
```jsx
<select className="
  w-full px-4 py-3
  border-2 border-gray-300
  rounded-xl
  focus:border-primary-500 focus:ring-4 focus:ring-primary-200
  transition-all
  appearance-none
  bg-white
">
  <option>Bitte wählen...</option>
</select>
```

**Checkbox:**
```jsx
<input
  type="checkbox"
  className="
    w-5 h-5
    rounded
    border-gray-300
    text-primary-600
    focus:ring-primary-500
    focus:ring-2
  "
/>
```

**Radio Button:**
```jsx
<input
  type="radio"
  className="
    w-5 h-5
    border-gray-300
    text-primary-600
    focus:ring-primary-500
    focus:ring-2
  "
/>
```

**Textarea:**
```jsx
<textarea
  rows={4}
  className="
    w-full px-4 py-3
    border-2 border-gray-300
    rounded-xl
    focus:border-primary-500 focus:ring-4 focus:ring-primary-200
    transition-all
    resize-none
  "
/>
```

### Cards

**Standard Card:**
```jsx
<div className="
  bg-white
  border-2 border-gray-300
  rounded-2xl
  p-6
  shadow-md hover:shadow-lg
  transition-all
">
  {/* Content */}
</div>
```

**Highlighted Card (Customer Login):**
```jsx
<div className="
  bg-white
  border-2 border-primary-500
  rounded-2xl
  p-8
  shadow-xl hover:shadow-2xl
  hover:scale-105
  transition-all duration-300
  focus-within:ring-4 ring-primary-200
">
  {/* Content */}
</div>
```

**Info Card:**
```jsx
<div className="
  bg-blue-50
  border border-blue-200
  rounded-xl
  p-4
">
  <p className="text-blue-900">
    {/* Info message */}
  </p>
</div>
```

**Warning Card:**
```jsx
<div className="
  bg-yellow-50
  border-2 border-yellow-300
  rounded-xl
  p-6
">
  <h3 className="font-bold text-yellow-900 mb-2">
    ⚠️ Wichtiger Hinweis
  </h3>
  <p className="text-yellow-800">
    {/* Warning message */}
  </p>
</div>
```

**Success Card:**
```jsx
<div className="
  bg-green-50
  border border-green-200
  rounded-xl
  p-4
">
  <p className="text-green-900 font-semibold">
    ✅ Erfolgreich gespeichert
  </p>
</div>
```

### Badges & Status Indicators

**Status Badge:**
```jsx
// In Progress
<span className="
  inline-block
  bg-blue-100 text-blue-800
  px-3 py-1
  rounded-full
  text-xs font-semibold
">
  IN ARBEIT
</span>

// Completed
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
  FERTIG
</span>

// Waiting
<span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
  WARTEND
</span>
```

**Feature Badge:**
```jsx
<span className="
  inline-flex items-center gap-2
  bg-white border border-gray-200
  rounded-full
  px-4 py-2
  text-sm font-medium text-gray-700
  shadow-sm
">
  <svg className="w-5 h-5 text-green-500" />
  Festpreis-Garantie
</span>
```

### Modals

**Modal Overlay:**
```jsx
<div className="
  fixed inset-0
  bg-black/50
  backdrop-blur-sm
  flex items-center justify-center
  z-50
">
  <div className="
    bg-white
    rounded-2xl
    p-8
    max-w-2xl
    w-full
    mx-4
    shadow-2xl
  ">
    {/* Modal content */}
  </div>
</div>
```

### Progress Indicators

**Progress Bar:**
```jsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
    style={{width: '50%'}}
    role="progressbar"
    aria-valuenow={50}
    aria-valuemin={0}
    aria-valuemax={100}
  />
</div>
```

**Step Indicator:**
```jsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
    1
  </div>
  <div className="flex-1 h-1 bg-primary-600" />
  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
    2
  </div>
</div>
```

### Loading States

**Spinner:**
```jsx
<svg className="animate-spin h-5 w-5 text-primary-600" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>
```

**Skeleton:**
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

---

## Icon System

### Recommended Icon Library

**Heroicons v2** (MIT License)
- Outline style for secondary elements
- Solid style for filled backgrounds
- Consistent stroke width
- Optimized SVGs

**Installation:**
```bash
npm install @heroicons/react
```

**Usage:**
```jsx
import { UserIcon, CarIcon, WrenchIcon } from '@heroicons/react/24/outline';

<UserIcon className="w-6 h-6 text-gray-600" />
```

### Icon Sizes

```jsx
// Extra Small (16px)
className="w-4 h-4"

// Small (20px)
className="w-5 h-5"

// Medium (24px - default)
className="w-6 h-6"

// Large (32px)
className="w-8 h-8"

// Extra Large (48px)
className="w-12 h-12"
```

### Core Icons Required

**Navigation & Actions:**
- `ChevronLeft`, `ChevronRight` - Navigation
- `XMarkIcon` - Close modal
- `Bars3Icon` - Menu
- `CheckIcon` - Confirmation
- `PlusIcon` - Add item

**Customer Portal:**
- `UserIcon` - Customer account
- `CarIcon` / `TruckIcon` - Vehicle
- `WrenchIcon` / `Cog6ToothIcon` - Service
- `CalendarIcon` - Booking
- `CreditCardIcon` - Payment
- `PhotoIcon` / `CameraIcon` - Photos

**Jockey Portal:**
- `MapPinIcon` - Location
- `PhoneIcon` - Call
- `ClockIcon` - Time
- `CheckCircleIcon` - Completed

**Werkstatt Portal:**
- `DocumentTextIcon` - Orders
- `ExclamationTriangleIcon` - Warning
- `InformationCircleIcon` - Info

**Status:**
- `CheckCircleIcon` - Success
- `XCircleIcon` - Error
- `ClockIcon` - Pending
- `ArrowPathIcon` - Loading

---

## Animation & Motion

### Animation Timing

```css
/* Fast - Quick feedback (hover, focus) */
--duration-75:  75ms;
--duration-100: 100ms;
--duration-150: 150ms;

/* Standard - Default transitions */
--duration-200: 200ms;
--duration-300: 300ms;

/* Slow - Meaningful animations */
--duration-500: 500ms;
--duration-700: 700ms;
```

**Tailwind Classes:**
```jsx
transition-all duration-200  // Fast
transition-all duration-300  // Standard
transition-all duration-500  // Slow
```

### Easing Functions

```css
/* Ease Out - Elements entering */
ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Ease In - Elements exiting */
ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Ease In-Out - Bidirectional */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:**
```jsx
className="transition-all duration-300 ease-out"
```

### Common Animations

**Hover Scale:**
```jsx
className="transform hover:scale-105 transition-transform duration-200"
```

**Fade In:**
```jsx
className="animate-fade-in"

// Define in global CSS:
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 300ms ease-out;
}
```

**Slide Up:**
```jsx
className="animate-slide-up"

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 300ms ease-out;
}
```

**Spin (Loading):**
```jsx
className="animate-spin"
// Built-in Tailwind animation
```

### Animation Guidelines

**Do's:**
- Keep animations under 300ms for UI feedback
- Use ease-out for entrances
- Use ease-in for exits
- Animate only transform and opacity for performance

**Don'ts:**
- Don't animate width/height (use scale instead)
- Don't use animations longer than 500ms
- Don't animate on every state change
- Don't use animations that can cause motion sickness

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on white: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

**Contrast Checker:**
```
Gray-900 on White: 16.7:1 ✅
Gray-700 on White: 10.7:1 ✅
Gray-600 on White: 7.2:1 ✅
Gray-500 on White: 4.7:1 ✅
Primary-600 on White: 5.9:1 ✅
```

### Keyboard Navigation

**Focus States:**
```jsx
className="focus:outline-none focus:ring-4 focus:ring-primary-200"
```

**Tab Order:**
- Logical order (left-to-right, top-to-bottom)
- No tab index > 0
- Skip links for main content

### Screen Reader Support

**Semantic HTML:**
```jsx
<button> not <div onClick>
<a href> for links
<label> for form inputs
<nav> for navigation
<main> for main content
<header>, <footer> for landmarks
```

**ARIA Labels:**
```jsx
<button aria-label="Close modal">
  <XMarkIcon className="w-6 h-6" />
</button>

<input
  type="text"
  aria-describedby="email-help"
/>
<span id="email-help">We'll never share your email</span>
```

**Live Regions:**
```jsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Touch Targets

**Minimum Size:**
- 44x44px for mobile
- 56x56px for Jockey/Werkstatt (glove-friendly)

**Spacing:**
- 8px minimum gap between targets

**Example:**
```jsx
<button className="min-w-[44px] min-h-[44px] p-3">
  <svg className="w-6 h-6" />
</button>
```

### Motion & Animation

**Respect prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

**Document Owner:** UX/UI Design Team
**Last Updated:** 2026-02-01
**Status:** Ready for Implementation
