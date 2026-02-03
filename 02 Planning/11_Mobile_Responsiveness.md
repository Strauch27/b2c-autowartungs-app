# Mobile Responsiveness - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Implementation Guidelines

---

## Mobile-First Philosophy

### Strategy

**Core Principle**: Design for mobile first (320px), then progressively enhance for larger screens.

**Rationale**:
- 70% of users expected to book via mobile
- Jockeys use app 100% on smartphones
- Customers research on mobile, may complete on desktop
- Werkstatt uses tablets (landscape orientation)

**Approach**:
1. Start with smallest viewport (320px)
2. Optimize core user flows for mobile
3. Add complexity and features at larger breakpoints
4. Never hide critical functionality on mobile

---

## Breakpoint System

### Tailwind CSS Breakpoints

```css
/* Base: Mobile Portrait (320px - 639px) */
/* Default styles, no prefix */

/* sm: Mobile Landscape / Small Tablet (640px+) */
@media (min-width: 640px) { ... }

/* md: Tablet Portrait (768px+) */
@media (min-width: 768px) { ... }

/* lg: Tablet Landscape / Small Desktop (1024px+) */
@media (min-width: 1024px) { ... }

/* xl: Desktop (1280px+) */
@media (min-width: 1280px) { ... }

/* 2xl: Large Desktop (1536px+) */
@media (min-width: 1536px) { ... }
```

### Target Devices

| Breakpoint | Devices | Primary Users | Layout Strategy |
|------------|---------|---------------|-----------------|
| 320px - 639px | iPhone SE, small Android | Customers, Jockeys | Single column, stacked |
| 640px - 767px | iPhone Pro, Android landscape | Customers | Two columns optional |
| 768px - 1023px | iPad, Android tablets | Werkstatt, Customers | Two-three columns |
| 1024px+ | Desktop, large tablets | Werkstatt, Admin | Multi-column, sidebars |

---

## Component-Level Responsiveness

### 1. Navigation

#### Mobile (< 768px)

```tsx
/* Hamburger Menu */
<nav className="
  fixed top-0 left-0 right-0
  bg-white
  border-b border-neutral-200
  px-4 py-3
  flex items-center justify-between
  z-50
">
  <button className="w-10 h-10">
    <MenuIcon className="w-6 h-6" />
  </button>

  <div className="text-lg font-bold">Logo</div>

  <button className="w-10 h-10">
    <UserIcon className="w-6 h-6" />
  </button>
</nav>

/* Full-Screen Drawer */
<div className="
  fixed inset-0
  bg-white
  z-40
  transform translate-x-full
  transition-transform duration-300
  data-[open=true]:translate-x-0
">
  {/* Menu Content */}
</div>
```

#### Tablet/Desktop (768px+)

```tsx
/* Persistent Top Navigation */
<nav className="
  hidden md:flex
  items-center justify-between
  px-8 py-4
  bg-white
  border-b border-neutral-200
">
  <div className="flex items-center gap-8">
    <div className="text-xl font-bold">Logo</div>
    <div className="flex gap-6">
      <a href="#">Dashboard</a>
      <a href="#">Buchungen</a>
      <a href="#">Profil</a>
    </div>
  </div>

  <div className="flex items-center gap-4">
    <button>Benachrichtigungen</button>
    <button>Profil ▼</button>
  </div>
</nav>
```

---

### 2. Forms

#### Mobile Strategy

```tsx
/* Full-Width Inputs */
<input className="
  w-full
  px-4 py-3
  text-base
  border-2 border-neutral-300
  rounded-lg
" />

/* Stack Form Fields Vertically */
<div className="space-y-4">
  <div>
    <label>Marke</label>
    <input className="w-full" />
  </div>
  <div>
    <label>Modell</label>
    <input className="w-full" />
  </div>
</div>

/* Large Touch-Friendly Buttons */
<button className="
  w-full
  px-6 py-4
  text-base font-semibold
  min-h-[48px]
">
  Weiter →
</button>
```

#### Desktop Enhancement

```tsx
/* Multi-Column Layout */
<div className="
  grid
  grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
">
  <div>
    <label>Marke</label>
    <input />
  </div>
  <div>
    <label>Modell</label>
    <input />
  </div>
</div>

/* Inline Button Groups */
<div className="
  flex flex-col gap-3
  sm:flex-row sm:justify-end
">
  <button className="
    px-6 py-3
    sm:w-auto
  ">
    Abbrechen
  </button>
  <button className="
    px-6 py-3
    sm:w-auto
  ">
    Speichern
  </button>
</div>
```

---

### 3. Cards & Lists

#### Mobile: Stacked Cards

```tsx
<div className="
  flex flex-col
  gap-4
  p-4
">
  {items.map(item => (
    <div key={item.id} className="
      bg-white
      border border-neutral-200
      rounded-xl
      p-4
    ">
      {/* Vertical Content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {item.title}
        </h3>
        <p className="text-sm text-neutral-600">
          {item.description}
        </p>
        <button className="w-full mt-3">
          Details →
        </button>
      </div>
    </div>
  ))}
</div>
```

#### Tablet/Desktop: Grid Layout

```tsx
<div className="
  grid
  grid-cols-1 gap-4
  md:grid-cols-2
  lg:grid-cols-3
  p-6
">
  {items.map(item => (
    <div key={item.id} className="
      bg-white
      border border-neutral-200
      rounded-xl
      p-6
      flex flex-col
    ">
      {/* Content with Flex Grow */}
      <div className="flex-grow">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      {/* Button at Bottom */}
      <button className="mt-4">
        Details →
      </button>
    </div>
  ))}
</div>
```

---

### 4. Modals & Overlays

#### Mobile: Full-Screen

```tsx
<div className="
  fixed inset-0
  bg-white
  z-50
  overflow-auto
  md:relative md:bg-transparent
">
  {/* Header with Close */}
  <div className="
    sticky top-0
    bg-white
    border-b border-neutral-200
    px-4 py-3
    flex items-center justify-between
    md:hidden
  ">
    <h2 className="text-lg font-semibold">
      {title}
    </h2>
    <button onClick={onClose}>
      <XMarkIcon className="w-6 h-6" />
    </button>
  </div>

  {/* Content */}
  <div className="p-4 md:p-0">
    {children}
  </div>
</div>
```

#### Desktop: Centered Dialog

```tsx
<div className="
  fixed inset-0
  bg-black/50
  z-50
  flex items-center justify-center
  p-4
  hidden md:flex
">
  <div className="
    bg-white
    rounded-xl
    shadow-xl
    max-w-2xl
    w-full
    max-h-[90vh]
    overflow-auto
  ">
    {/* Dialog Content */}
  </div>
</div>
```

---

### 5. Tables

#### Mobile: Card View

```tsx
/* Transform table into cards */
<div className="
  space-y-4
  md:hidden
">
  {data.map(row => (
    <div key={row.id} className="
      bg-white
      border border-neutral-200
      rounded-lg
      p-4
    ">
      <div className="space-y-2">
        <div>
          <span className="text-xs text-neutral-500">
            Buchungsnr.
          </span>
          <p className="text-base font-medium">
            {row.bookingNumber}
          </p>
        </div>
        <div>
          <span className="text-xs text-neutral-500">
            Fahrzeug
          </span>
          <p className="text-base">
            {row.vehicle}
          </p>
        </div>
        {/* ... more fields */}
      </div>
    </div>
  ))}
</div>
```

#### Desktop: Standard Table

```tsx
<div className="
  hidden md:block
  overflow-x-auto
">
  <table className="
    w-full
    border border-neutral-200
  ">
    <thead className="bg-neutral-50">
      <tr>
        <th>Buchungsnr.</th>
        <th>Fahrzeug</th>
        <th>Status</th>
        <th>Aktion</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id}>
          <td>{row.bookingNumber}</td>
          <td>{row.vehicle}</td>
          <td>{row.status}</td>
          <td>
            <button>Details</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Typography Responsiveness

### Heading Scales

```tsx
/* Mobile-First Approach */
<h1 className="
  text-3xl
  md:text-4xl
  lg:text-5xl
  font-bold
  leading-tight
">
  Headline
</h1>

<h2 className="
  text-2xl
  md:text-3xl
  lg:text-4xl
  font-bold
">
  Subheadline
</h2>

<p className="
  text-base
  md:text-lg
  leading-relaxed
">
  Body text
</p>
```

### Line Length Optimization

```tsx
/* Optimal reading width: 50-75 characters */
<div className="
  max-w-full
  md:max-w-2xl
  lg:max-w-4xl
  mx-auto
  px-4
">
  <p className="text-base leading-relaxed">
    Long-form content here...
  </p>
</div>
```

---

## Spacing & Layout

### Container System

```tsx
/* Full-Width on Mobile, Constrained on Desktop */
<div className="
  w-full
  max-w-7xl
  mx-auto
  px-4
  md:px-6
  lg:px-8
">
  {/* Content */}
</div>

/* Section Spacing */
<section className="
  py-8
  md:py-12
  lg:py-16
">
  {/* Section Content */}
</section>

/* Component Spacing */
<div className="
  space-y-4
  md:space-y-6
  lg:space-y-8
">
  {/* Stacked Components */}
</div>
```

---

## Touch Target Optimization

### WCAG 2.1 AA Compliance

**Minimum Touch Targets**: 44x44px (iOS Human Interface Guidelines)
**Recommended**: 48x48px for primary actions

```tsx
/* Button Sizing */
<button className="
  min-w-[44px]
  min-h-[44px]
  px-6 py-3
  text-base font-semibold
">
  Action
</button>

/* Icon Button */
<button className="
  w-12 h-12
  flex items-center justify-center
  rounded-full
  hover:bg-neutral-100
">
  <Icon className="w-6 h-6" />
</button>

/* List Items */
<button className="
  w-full
  min-h-[56px]
  px-4 py-3
  text-left
  hover:bg-neutral-50
">
  List Item
</button>
```

### Thumb Zones

**Thumb-Friendly Zones on Mobile**:

```
┌─────────────────────┐
│                     │ ← Hard to reach
│                     │
│                     │
│    Easy Zone        │ ← One-handed reach
│                     │
│                     │
│  [Primary Action]   │ ← Bottom: Easiest
└─────────────────────┘
```

```tsx
/* Fixed Bottom CTA */
<div className="
  fixed bottom-0 left-0 right-0
  bg-white
  border-t border-neutral-200
  p-4
  safe-area-inset-bottom
  md:relative md:border-0 md:p-0
">
  <button className="
    w-full
    px-6 py-4
    text-base font-semibold
    bg-primary-600
    text-white
    rounded-lg
  ">
    Primary Action
  </button>
</div>
```

---

## Image & Media Responsiveness

### Responsive Images

```tsx
import Image from 'next/image'

<div className="
  relative
  w-full
  h-48
  md:h-64
  lg:h-80
">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover rounded-lg"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

### Video Embeds

```tsx
/* Responsive Aspect Ratio */
<div className="
  relative
  w-full
  aspect-video
  bg-neutral-900
  rounded-lg
  overflow-hidden
">
  <iframe
    src="..."
    className="absolute inset-0 w-full h-full"
    allowFullScreen
  />
</div>
```

---

## Performance Optimization

### Mobile-Specific Optimizations

1. **Lazy Loading**

```tsx
/* Images below fold */
<Image
  src="/image.jpg"
  alt="..."
  loading="lazy"
/>

/* Components */
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

2. **Code Splitting by Route**

```tsx
// app/customer/page.tsx (auto code-split by Next.js)
// app/jockey/page.tsx
// app/workshop/page.tsx
```

3. **Reduce Bundle Size**

```tsx
/* Import only what you need */
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline'

/* Not: */
import * as Icons from '@heroicons/react/24/outline'
```

4. **Optimize Web Fonts**

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap; /* Prevent FOIT */
  src: url('/fonts/inter.woff2') format('woff2');
}
```

---

## Viewport Meta Tag

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=5"
/>
```

**Notes**:
- `width=device-width`: Use device width, not fixed width
- `initial-scale=1`: Start at 100% zoom
- `maximum-scale=5`: Allow zoom (accessibility requirement)

---

## Testing Strategy

### Device Testing Matrix

| Device Category | Devices to Test | Priority | Orientation |
|-----------------|-----------------|----------|-------------|
| Mobile Small | iPhone SE (375x667) | High | Portrait |
| Mobile Large | iPhone 14 Pro (393x852) | High | Portrait |
| Mobile Landscape | Galaxy S21 (915x412) | Medium | Landscape |
| Tablet Portrait | iPad (768x1024) | High | Portrait |
| Tablet Landscape | iPad (1024x768) | Medium | Landscape |
| Desktop Small | 1280x720 | Medium | Landscape |
| Desktop Large | 1920x1080 | Low | Landscape |

### Testing Checklist

#### Visual Testing

- [ ] All text is readable without horizontal scrolling
- [ ] Images don't overflow containers
- [ ] Buttons are fully visible and accessible
- [ ] Forms don't clip input fields
- [ ] Modals/overlays don't exceed viewport

#### Interaction Testing

- [ ] All interactive elements are tappable (min 44x44px)
- [ ] Forms can be filled without keyboard overlap
- [ ] Dropdowns/selects work on mobile browsers
- [ ] Swipe gestures don't conflict with browser gestures
- [ ] Fixed elements don't cover content

#### Performance Testing

- [ ] Page loads in < 3 seconds on 3G
- [ ] Images lazy load correctly
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth scrolling (60fps)
- [ ] No console errors on any device

---

## Browser Support

### Target Browsers

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | Last 2 versions | Full |
| Firefox | Last 2 versions | Full |
| Safari | Last 2 versions | Full |
| Edge | Last 2 versions | Full |
| Safari iOS | iOS 14+ | Full |
| Chrome Android | Last version | Full |

### Progressive Enhancement Strategy

```tsx
/* Feature Detection */
const supportsWebP = () => {
  const elem = document.createElement('canvas')
  return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

/* Use Modern Features with Fallbacks */
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="..." />
</picture>
```

---

## Accessibility on Mobile

### Touch Gestures

- **Avoid gesture-only interactions** (provide button alternatives)
- **No swipe-only navigation** (add visible nav buttons)
- **Support pinch-to-zoom** for images and text

### Form Accessibility

```tsx
/* Proper Input Types for Mobile Keyboards */
<input type="email" inputMode="email" />
<input type="tel" inputMode="tel" />
<input type="number" inputMode="numeric" pattern="[0-9]*" />
<input type="text" inputMode="text" />

/* Autocomplete Attributes */
<input
  type="text"
  autoComplete="name"
/>
<input
  type="email"
  autoComplete="email"
/>
<input
  type="tel"
  autoComplete="tel"
/>
```

### Screen Reader Support

```tsx
/* Skip to Content Link */
<a
  href="#main-content"
  className="
    sr-only
    focus:not-sr-only
    focus:absolute focus:top-4 focus:left-4
    px-4 py-2
    bg-primary-600 text-white
    rounded-lg
  "
>
  Skip to main content
</a>

/* Hidden Labels for Icon Buttons */
<button aria-label="Open menu">
  <MenuIcon className="w-6 h-6" />
</button>
```

---

## Progressive Web App (PWA)

### Manifest Configuration

```json
// public/manifest.json
{
  "name": "B2C Autowartungs-App",
  "short_name": "B2C Auto",
  "description": "Autowartung mit Festpreis & Concierge-Service",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Next.js)

```tsx
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // Next.js config
})
```

---

## Common Responsive Patterns

### 1. Sidebar to Drawer

```tsx
/* Desktop: Fixed Sidebar */
<div className="
  hidden lg:flex
  fixed left-0 top-0 bottom-0
  w-64
  bg-white
  border-r border-neutral-200
">
  {/* Sidebar Content */}
</div>

/* Mobile: Hidden, shown as drawer when toggled */
<div className={`
  lg:hidden
  fixed inset-0
  bg-white
  z-50
  transform transition-transform
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  {/* Drawer Content */}
</div>
```

### 2. Tabs to Accordion

```tsx
/* Desktop: Horizontal Tabs */
<div className="
  hidden md:flex
  border-b border-neutral-200
  gap-4
">
  {tabs.map(tab => (
    <button key={tab.id} className="px-4 py-3">
      {tab.label}
    </button>
  ))}
</div>

/* Mobile: Accordion */
<div className="md:hidden space-y-2">
  {tabs.map(tab => (
    <details key={tab.id} className="
      bg-white
      border border-neutral-200
      rounded-lg
    ">
      <summary className="px-4 py-3">
        {tab.label}
      </summary>
      <div className="px-4 pb-4">
        {tab.content}
      </div>
    </details>
  ))}
</div>
```

### 3. Multi-Column to Single Column

```tsx
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
  md:gap-6
  lg:gap-8
">
  {items.map(item => (
    <div key={item.id}>
      {/* Item Content */}
    </div>
  ))}
</div>
```

---

## Development Workflow

### Testing in Browser DevTools

1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test at:
   - 320px (iPhone SE)
   - 375px (iPhone 12/13)
   - 768px (iPad)
   - 1024px (Desktop)

### Real Device Testing

- **BrowserStack**: Cross-browser/device testing
- **Local Network**: `npm run dev -- --host`
- **ngrok**: Public URL for testing on external devices

---

## Implementation Checklist

### Pre-Launch

- [ ] All pages render correctly at 320px, 375px, 768px, 1024px, 1920px
- [ ] Touch targets minimum 44x44px
- [ ] Forms usable on mobile keyboards
- [ ] Images optimized and responsive
- [ ] PWA manifest configured
- [ ] Lighthouse Mobile score > 90

### Post-Launch

- [ ] Monitor real user data (Core Web Vitals)
- [ ] A/B test mobile vs. desktop conversion rates
- [ ] Gather user feedback on mobile UX
- [ ] Iterate based on analytics

---

**Version History:**

- 1.0 (2026-02-01): Complete Mobile Responsiveness Guidelines
