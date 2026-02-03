# Mobile Responsiveness Specifications - B2C Autowartungs-App

**Version:** 1.0
**Datum:** 2026-02-01
**Status:** Design Specification Ready for Implementation

---

## Inhaltsverzeichnis

1. [Mobile-First Strategy](#mobile-first-strategy)
2. [Breakpoint System](#breakpoint-system)
3. [Touch Optimization](#touch-optimization)
4. [Responsive Patterns](#responsive-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Progressive Web App (PWA)](#progressive-web-app-pwa)
7. [Device-Specific Considerations](#device-specific-considerations)

---

## Mobile-First Strategy

### Why Mobile-First?

**User Behavior:**
- 70%+ of bookings expected on mobile devices
- Jockeys work exclusively on smartphones
- Werkstatt uses tablets primarily
- Customers book during commute/downtime

**Technical Benefits:**
- Faster initial load (smaller CSS/JS bundle)
- Forces prioritization of content
- Easier to enhance than strip down
- Better performance on low-end devices

### Design Process

```
1. Design for 375px (iPhone SE, most common mobile)
2. Expand to 768px (tablets)
3. Optimize for 1024px+ (desktop)
```

**Example Workflow:**
```jsx
// Start with mobile
<h1 className="text-3xl">Headline</h1>

// Add tablet
<h1 className="text-3xl md:text-4xl">Headline</h1>

// Add desktop
<h1 className="text-3xl md:text-4xl lg:text-5xl">Headline</h1>
```

---

## Breakpoint System

### Breakpoint Definitions

```css
/* Tailwind CSS default breakpoints (mobile-first) */
sm:  640px   /* Small tablets, large phones (landscape) */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops, large tablets (landscape) */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Target Devices

**Mobile (320px - 767px):**
- iPhone SE (375x667)
- iPhone 12/13/14 (390x844)
- iPhone 14 Pro Max (430x932)
- Samsung Galaxy S21 (360x800)
- Google Pixel 5 (393x851)

**Tablet (768px - 1023px):**
- iPad Mini (768x1024)
- iPad Air (820x1180)
- iPad Pro 11" (834x1194)

**Desktop (1024px+):**
- MacBook Air 13" (1440x900)
- Standard monitors (1920x1080)

### Breakpoint Usage Guidelines

**Content Reflow:**
```jsx
// Stack on mobile, side-by-side on tablet+
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Typography:**
```jsx
// Smaller on mobile, larger on desktop
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
```

**Spacing:**
```jsx
// Less padding on mobile, more on desktop
<div className="px-4 md:px-6 lg:px-8">
<section className="py-8 md:py-12 lg:py-16">
```

**Show/Hide Elements:**
```jsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop nav</div>

// Show on mobile, hide on desktop
<button className="lg:hidden">Mobile menu</button>
```

---

## Touch Optimization

### Touch Target Sizes

**Minimum Sizes:**
```css
/* Standard touch target */
min-width: 44px;
min-height: 44px;

/* Jockey/Werkstatt (glove-friendly) */
min-width: 56px;
min-height: 56px;
```

**Implementation:**
```jsx
// Standard button
<button className="min-w-[44px] min-h-[44px] py-3 px-6">
  Click me
</button>

// Large touch target for critical actions
<button className="min-w-[56px] min-h-[56px] py-4 px-8 text-lg">
  JETZT BUCHEN
</button>
```

### Touch Target Spacing

**Minimum Gap:**
```css
gap: 8px;  /* Minimum between interactive elements */
gap: 12px; /* Comfortable for most users */
gap: 16px; /* Optimal for accessibility */
```

**Example:**
```jsx
<div className="flex gap-4">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Thumb Zone Optimization

**Mobile Screen Zones:**
```
+---------------------------+
|    Hard to Reach          |
+---------------------------+
|                           |
|    Easy to Reach          |
|    (Natural Thumb)        |
|                           |
+---------------------------+
|    Easy to Reach          |
|    (Primary Actions)      |
+---------------------------+
```

**Guidelines:**
- Primary CTAs: Bottom third of screen
- Navigation: Bottom of screen (iOS style) or top
- Secondary actions: Middle or top
- Dangerous actions: Top (harder to reach accidentally)

**Example:**
```jsx
<div className="min-h-screen flex flex-col">
  {/* Content */}
  <main className="flex-1">
    {/* ... */}
  </main>

  {/* Primary CTA in bottom thumb zone */}
  <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
    <button className="w-full bg-primary-600 py-4 rounded-xl">
      WEITER
    </button>
  </div>
</div>
```

### Touch Gestures

**Supported Gestures:**
- Tap: Primary action
- Long press: Show contextual menu (optional)
- Swipe: Navigate between screens (native mobile)
- Pinch/Zoom: Photo galleries

**Avoid:**
- Hover-dependent interactions
- Double-tap (conflicts with zoom)
- Complex multi-finger gestures

---

## Responsive Patterns

### Pattern 1: Stack to Row

**Mobile:** Stacked vertically
**Desktop:** Horizontal row

```jsx
// Three login zones on landing page
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>Kunde</div>
  <div>Jockey</div>
  <div>Werkstatt</div>
</div>
```

### Pattern 2: Hamburger Menu

**Mobile:** Collapse to hamburger
**Desktop:** Full navigation

```jsx
// Navigation
<nav>
  {/* Mobile menu button */}
  <button className="md:hidden">
    <Bars3Icon className="w-6 h-6" />
  </button>

  {/* Desktop navigation */}
  <div className="hidden md:flex gap-8">
    <a href="/services">Services</a>
    <a href="/pricing">Preise</a>
  </div>
</nav>
```

### Pattern 3: Sidebar to Stack

**Mobile:** Content stacked
**Desktop:** Sidebar + main content

```jsx
<div className="lg:flex gap-8">
  {/* Sidebar */}
  <aside className="lg:w-64 mb-8 lg:mb-0">
    {/* Filters, navigation */}
  </aside>

  {/* Main content */}
  <main className="lg:flex-1">
    {/* Content */}
  </main>
</div>
```

### Pattern 4: Grid Responsive

**Mobile:** 1 column
**Tablet:** 2 columns
**Desktop:** 3-4 columns

```jsx
// Service cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {services.map(service => (
    <ServiceCard key={service.id} service={service} />
  ))}
</div>
```

### Pattern 5: Form Layout

**Mobile:** Full-width inputs, stacked
**Desktop:** Multi-column layout

```jsx
<form>
  {/* Full-width on mobile, 2-column on tablet+ */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label>Vorname</label>
      <input type="text" />
    </div>
    <div>
      <label>Nachname</label>
      <input type="text" />
    </div>
  </div>

  {/* Always full-width */}
  <div>
    <label>E-Mail</label>
    <input type="email" />
  </div>
</form>
```

### Pattern 6: Modal Sizing

**Mobile:** Full-screen
**Desktop:** Centered, max-width

```jsx
<div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center">
  <div className="
    bg-white
    w-full md:max-w-2xl md:rounded-2xl
    h-[90vh] md:h-auto
    overflow-y-auto
  ">
    {/* Modal content */}
  </div>
</div>
```

### Pattern 7: Image Responsive

**Responsive Image Sizing:**
```jsx
<img
  src="/hero-image.jpg"
  alt="Description"
  className="w-full h-64 md:h-96 lg:h-[500px] object-cover"
/>
```

**Responsive Aspect Ratios:**
```jsx
// Square on mobile, 16:9 on desktop
<div className="aspect-square md:aspect-video">
  <img src="..." className="w-full h-full object-cover" />
</div>
```

---

## Performance Optimization

### Critical Rendering Path

**1. Above-the-Fold Optimization:**
```jsx
// Prioritize hero section loading
<Image
  src="/hero-bg.jpg"
  priority
  quality={85}
  placeholder="blur"
/>
```

**2. Lazy Loading:**
```jsx
// Lazy load below-the-fold content
<Image
  src="/section-image.jpg"
  loading="lazy"
/>

<div className="hidden md:block">
  {/* Load heavy desktop content only when visible */}
  <LazyComponent />
</div>
```

### Bundle Size Management

**Code Splitting:**
```javascript
// Dynamic imports for routes
const CustomerPortal = dynamic(() => import('./CustomerPortal'));
const JockeyPortal = dynamic(() => import('./JockeyPortal'));
const WorkshopPortal = dynamic(() => import('./WorkshopPortal'));
```

**Conditional Loading:**
```jsx
// Load desktop-only features conditionally
{isDesktop && <DesktopFeatures />}
```

### Image Optimization

**Responsive Images:**
```jsx
<picture>
  <source
    media="(min-width: 1024px)"
    srcSet="/hero-desktop.jpg"
  />
  <source
    media="(min-width: 768px)"
    srcSet="/hero-tablet.jpg"
  />
  <img
    src="/hero-mobile.jpg"
    alt="Hero"
    className="w-full"
  />
</picture>
```

**Next.js Image Component:**
```jsx
<Image
  src="/car.jpg"
  alt="Car"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={85}
/>
```

### Font Loading

**Font Display Strategy:**
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  font-weight: 400;
}
```

**Subset Fonts:**
```
// Load only Latin characters
Inter-Regular.woff2 (Latin) - 25KB
Inter-Bold.woff2 (Latin) - 27KB
```

### Network Optimization

**Prefetch Critical Resources:**
```jsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://api.stripe.com" />
<link rel="prefetch" href="/booking-flow-step-2" />
```

**Service Worker Caching:**
```javascript
// Cache static assets
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new workbox.strategies.CacheFirst()
);
```

---

## Progressive Web App (PWA)

### PWA Requirements

**Manifest.json:**
```json
{
  "name": "AutoCare - Autowartung",
  "short_name": "AutoCare",
  "description": "Festpreis-Wartung mit Hol- & Bringservice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker:**
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**Install Prompt:**
```jsx
const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  });
}, []);

const installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
  }
};
```

### Offline Capabilities

**Offline Page:**
```jsx
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">
      Keine Internetverbindung
    </h1>
    <p className="text-gray-600 mb-6">
      Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="bg-primary-600 text-white py-3 px-6 rounded-xl"
    >
      Erneut versuchen
    </button>
  </div>
</div>
```

**Offline Form Storage:**
```javascript
// Save form data to localStorage when offline
const saveFormOffline = (formData) => {
  const offlineData = JSON.parse(localStorage.getItem('offline_forms') || '[]');
  offlineData.push({
    ...formData,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('offline_forms', JSON.stringify(offlineData));
};

// Sync when online
window.addEventListener('online', () => {
  const offlineData = JSON.parse(localStorage.getItem('offline_forms') || '[]');
  offlineData.forEach(form => {
    syncFormToServer(form);
  });
  localStorage.removeItem('offline_forms');
});
```

### Push Notifications

**Request Permission:**
```javascript
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Subscribe to push notifications
      subscribeToPush();
    }
  }
};
```

**Use Cases:**
- Auftragserweiterung erhalten (Customer)
- Neue Abholung zugewiesen (Jockey)
- Kunde hat freigegeben (Werkstatt)

---

## Device-Specific Considerations

### iOS Safari

**Viewport Height Fix:**
```css
/* Fix for iOS Safari bottom bar */
.min-h-screen {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

html {
  height: -webkit-fill-available;
}
```

**Input Zoom Prevention:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

**Safe Area Insets:**
```css
/* Account for notch/home indicator */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Android

**Address Bar Handling:**
```javascript
// Detect address bar show/hide
let lastHeight = window.innerHeight;
window.addEventListener('resize', () => {
  const currentHeight = window.innerHeight;
  if (currentHeight > lastHeight) {
    // Address bar hidden
  }
  lastHeight = currentHeight;
});
```

**Material Design Integration:**
```jsx
// Use native Android patterns where appropriate
<button className="ripple-effect">
  {/* Ripple animation on tap */}
</button>
```

### Tablets (iPad)

**Landscape Optimization:**
```jsx
// Split-screen on tablets
<div className="lg:grid lg:grid-cols-2 gap-8">
  <div>Main content</div>
  <div>Sidebar</div>
</div>
```

**Hover States:**
```jsx
// Enable hover on tablets with pointer
<button className="hover:bg-primary-700 active:bg-primary-800">
```

### Desktop

**Keyboard Shortcuts:**
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Mouse Interactions:**
```jsx
// Desktop-specific interactions
<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  className="group"
>
  <div className="group-hover:opacity-100 opacity-0 transition-opacity">
    {/* Show on hover */}
  </div>
</div>
```

---

## Testing Checklist

### Device Testing

**Mobile Devices:**
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] Samsung Galaxy S21 (360px)
- [ ] Google Pixel 5 (393px)

**Tablets:**
- [ ] iPad Mini (768px)
- [ ] iPad Air (820px)
- [ ] iPad Pro 11" (834px)

**Desktop:**
- [ ] 1024px (small laptop)
- [ ] 1280px (standard desktop)
- [ ] 1920px (full HD)

### Responsive Testing Tools

**Browser DevTools:**
```
Chrome: Cmd+Opt+I → Device Toolbar
Firefox: Cmd+Opt+M
Safari: Develop → Enter Responsive Design Mode
```

**Online Tools:**
- BrowserStack (real devices)
- LambdaTest (cross-browser)
- Responsively App (local testing)

### Performance Testing

**Lighthouse Metrics:**
```
Target Scores (Mobile):
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

Key Metrics:
- FCP (First Contentful Paint): <1.8s
- LCP (Largest Contentful Paint): <2.5s
- TBT (Total Blocking Time): <200ms
- CLS (Cumulative Layout Shift): <0.1
```

**Performance Budget:**
```
Initial Load (3G):
- HTML: <30KB
- CSS: <50KB
- JavaScript: <100KB
- Images: <200KB
- Total: <400KB

Time to Interactive: <5s (3G)
```

### Functionality Testing

**Touch Interactions:**
- [ ] All buttons are tappable (min 44x44px)
- [ ] Swipe gestures work smoothly
- [ ] No accidental taps (adequate spacing)
- [ ] Form inputs are keyboard-accessible

**Orientation:**
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] No content cut off in either orientation

**Network Conditions:**
- [ ] App works on 3G
- [ ] Graceful degradation on slow networks
- [ ] Offline functionality (where applicable)

---

## Best Practices Summary

### Do's

✅ Design mobile-first, then enhance for desktop
✅ Use responsive units (rem, %, vw/vh)
✅ Test on real devices, not just simulators
✅ Optimize images for different screen sizes
✅ Use touch-friendly target sizes (44x44px+)
✅ Implement progressive enhancement
✅ Cache static assets for offline use
✅ Provide visual feedback for all interactions

### Don'ts

❌ Don't rely on hover for critical interactions
❌ Don't use fixed pixel widths
❌ Don't forget about landscape orientation
❌ Don't ignore iOS Safari quirks
❌ Don't make touch targets too small
❌ Don't use device-specific features without fallbacks
❌ Don't forget to test on slow networks
❌ Don't disable zoom (unless for specific inputs)

---

**Document Owner:** UX/UI Design Team
**Last Updated:** 2026-02-01
**Status:** Ready for Implementation
