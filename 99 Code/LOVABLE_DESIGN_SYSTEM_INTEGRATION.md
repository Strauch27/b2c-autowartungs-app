# Lovable Design System - Integration Plan

## Overview

This document outlines the design system extracted from the Lovable premium-auto-concierge project and provides a comprehensive plan to integrate it into our Next.js application.

---

## Design System Analysis

### Color Palette

The Lovable design uses a professional automotive color scheme with portal-specific accents:

#### Core Colors (HSL)
```css
/* Deep Blue - Trust & Professionalism */
--primary: 224 71% 40%
--primary-foreground: 0 0% 100%

/* Orange CTAs - Action & Energy */
--cta: 25 95% 53%
--cta-foreground: 0 0% 100%

/* Green Success */
--success: 142 76% 36%
--success-foreground: 0 0% 100%
```

#### Portal-Specific Colors
```css
/* Customer Portal - Deep Blue */
--primary: 224 71% 40%

/* Jockey Portal - Green */
--jockey: 142 71% 45%
--jockey-foreground: 0 0% 100%

/* Workshop Portal - Orange */
--workshop: 25 95% 53%
--workshop-foreground: 0 0% 100%
```

#### Neutral Colors
```css
--background: 210 20% 98%
--foreground: 222 47% 11%
--card: 0 0% 100%
--muted: 215 20% 94%
--border: 214 32% 91%
```

### Typography

**Font Family**: Inter (system-ui fallback)
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

**Font Features**:
- `font-feature-settings: "rlig" 1, "calt" 1;`
- Headings: `font-bold tracking-tight`
- Antialiased rendering

### Spacing & Layout

**Container**:
- Centered with 2rem padding
- Max width: 1400px on 2xl screens

**Section Spacing**:
```css
.section-spacing {
  @apply py-16 md:py-24;
}
```

### Shadows (Premium Levels)

```css
--shadow-subtle: 0 1px 3px 0 hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)
--shadow-card: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)
--shadow-elevated: 0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)
--shadow-premium: 0 25px 50px -12px hsl(0 0% 0% / 0.25)
```

### Border Radius

```css
--radius: 0.75rem (12px)
lg: var(--radius)
md: calc(var(--radius) - 2px)
sm: calc(var(--radius) - 4px)
```

### Animations

#### Keyframe Animations
```css
@keyframes fadeIn - Opacity 0 → 1
@keyframes fadeInUp - Opacity 0 → 1 + translateY(20px → 0)
@keyframes slideInRight - Opacity 0 → 1 + translateX(20px → 0)
```

#### Animation Classes
```css
.animate-fade-in - 0.5s ease-out
.animate-fade-in-up - 0.6s ease-out
.animate-slide-in-right - 0.4s ease-out
```

#### Stagger Delays
```css
.animate-delay-100 - 100ms
.animate-delay-200 - 200ms
.animate-delay-300 - 300ms
.animate-delay-400 - 400ms
```

---

## Component Patterns

### Premium Card Pattern

```tsx
<Card className="card-premium border-l-4 border-l-primary animate-fade-in-up">
  {/* Content */}
</Card>
```

**CSS Classes**:
```css
.card-premium {
  @apply bg-card rounded-xl border border-border transition-all duration-300;
  box-shadow: var(--shadow-card);
}

.card-premium:hover {
  box-shadow: var(--shadow-elevated);
  @apply -translate-y-1;
}
```

### Portal Card Variants

```css
.portal-card-customer {
  @apply border-l-4 border-l-primary;
}

.portal-card-jockey {
  @apply border-l-4 border-l-jockey;
}

.portal-card-workshop {
  @apply border-l-4 border-l-cta;
}
```

### Status Badges

```css
.badge-pending {
  @apply bg-primary/10 text-primary;
}

.badge-in-progress {
  @apply bg-cta/10 text-cta;
}

.badge-completed {
  @apply bg-success/10 text-success;
}
```

### Trust Badge

```tsx
<div className="trust-badge">
  <CheckCircle className="h-4 w-4 text-success" />
  <span>Festpreis-Garantie</span>
</div>
```

```css
.trust-badge {
  @apply inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium;
}
```

### Step Indicator

```css
.step-indicator {
  @apply flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg;
}
```

### Premium Button

```css
.btn-premium {
  @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5;
}
```

### Premium Input

```css
.input-premium {
  @apply py-3 px-4 rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-primary transition-all;
}
```

---

## Landing Page Components

### 1. Hero Section

**Features**:
- Gradient background with pattern overlay
- Trust badge with checkmark
- Large heading with underline accent
- Dual CTA buttons
- Star rating social proof
- Wave SVG divider

**Key Elements**:
```tsx
- Background: bg-gradient-to-br from-primary via-primary to-primary/90
- Trust badge: inline-flex with CheckCircle icon
- Heading: 4xl → 6xl with accent underline
- CTAs: Primary "Preis berechnen" + Secondary "Anmelden"
- Social proof: Star rating + review count
- Wave divider: SVG path at bottom
```

### 2. Portal Cards

**Features**:
- 3-column grid (Customer, Jockey, Workshop)
- Portal-specific accent colors
- Icons with colored backgrounds
- Hover animations
- Staggered fade-in

**Pattern**:
```tsx
{portals.map((portal, index) => (
  <Card
    className={`card-premium border-l-4 ${portal.accentClass}`}
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <CardHeader>
      <div className={`icon-wrapper ${portal.iconClass}`}>
        <portal.icon />
      </div>
      <CardTitle>{portal.title}</CardTitle>
      <CardDescription>{portal.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant={portal.buttonVariant}>
        Zum Portal
        <ArrowRight className="group-hover:translate-x-1" />
      </Button>
    </CardContent>
  </Card>
))}
```

### 3. Value Props Section

Grid of value propositions with icons and descriptions.

### 4. How It Works

Step-by-step process visualization with numbered indicators.

### 5. FAQ

Accordion-style frequently asked questions.

### 6. Header & Footer

Navigation and footer with links.

---

## Integration Strategy

### Phase 1: Core Design Tokens ✅ (To Do)

**Files to Update**:

1. **`frontend/app/globals.css`** - Add CSS variables and utility classes
2. **`frontend/tailwind.config.ts`** - Extend theme with Lovable tokens
3. **Install Inter font** - Add to Next.js font optimization

**Actions**:
```bash
# 1. Update globals.css with Lovable CSS variables
# 2. Extend tailwind.config.ts with custom colors, shadows, animations
# 3. Add Inter font to Next.js layout
```

### Phase 2: Component Classes ✅ (To Do)

**Files to Create/Update**:

1. **`frontend/lib/utils.ts`** - Add utility functions for variant classes
2. **`frontend/app/globals.css`** - Add component utility classes

**New Utility Classes**:
```css
.card-premium
.portal-card-customer / jockey / workshop
.badge-pending / in-progress / completed
.trust-badge
.step-indicator
.btn-premium
.input-premium
.section-spacing
```

### Phase 3: Update Existing Components 📝 (To Do)

**Components to Refactor**:

1. **Landing Page Hero** (`frontend/app/[locale]/page.tsx`)
   - Apply gradient background
   - Add trust badge
   - Update heading styles
   - Add wave divider SVG

2. **Portal Cards** (`frontend/components/landing/portal-cards.tsx`)
   - Apply portal-specific colors
   - Add staggered animations
   - Update card styling

3. **Button Variants** (`frontend/components/ui/button.tsx`)
   - Add `hero` variant (orange CTA)
   - Add `jockey` variant (green)
   - Add `workshop` variant (orange)
   - Add `outline-light` variant

4. **Card Component** (`frontend/components/ui/card.tsx`)
   - Add hover animations
   - Support portal-specific borders

### Phase 4: New Components from Lovable 🆕 (Optional)

**Components to Port**:

1. **ValueProps.tsx** - Value proposition grid
2. **HowItWorks.tsx** - Process steps visualization
3. **FAQ.tsx** - Accordion FAQ
4. **Header.tsx** - Navigation header
5. **Footer.tsx** - Site footer

---

## File-by-File Changes

### 1. `frontend/app/globals.css`

**Add after existing Tailwind directives**:

```css
/* Premium Automotive Design System - HSL Colors Only */

@layer base {
  :root {
    /* Update existing colors */
    --primary: 224 71% 40%;
    --primary-foreground: 0 0% 100%;

    /* Add new colors */
    --cta: 25 95% 53%;
    --cta-foreground: 0 0% 100%;

    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;

    --jockey: 142 71% 45%;
    --jockey-foreground: 0 0% 100%;

    --workshop: 25 95% 53%;
    --workshop-foreground: 0 0% 100%;

    /* Shadows */
    --shadow-subtle: 0 1px 3px 0 hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
    --shadow-card: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1);
    --shadow-elevated: 0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1);
    --shadow-premium: 0 25px 50px -12px hsl(0 0% 0% / 0.25);
  }

  body {
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
  }
}

@layer components {
  /* Premium Card Styles */
  .card-premium {
    @apply bg-card rounded-xl border border-border transition-all duration-300;
    box-shadow: var(--shadow-card);
  }

  .card-premium:hover {
    box-shadow: var(--shadow-elevated);
    @apply -translate-y-1;
  }

  /* Portal Card Variants */
  .portal-card-customer {
    @apply border-l-4 border-l-primary;
  }

  .portal-card-jockey {
    @apply border-l-4 border-l-jockey;
  }

  .portal-card-workshop {
    @apply border-l-4 border-l-cta;
  }

  /* Status Badges */
  .badge-pending {
    @apply bg-primary/10 text-primary;
  }

  .badge-in-progress {
    @apply bg-cta/10 text-cta;
  }

  .badge-completed {
    @apply bg-success/10 text-success;
  }

  /* Section Spacing */
  .section-spacing {
    @apply py-16 md:py-24;
  }

  /* Premium Button Hover */
  .btn-premium {
    @apply transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5;
  }

  /* Trust Badge */
  .trust-badge {
    @apply inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium;
  }

  /* Step Indicator */
  .step-indicator {
    @apply flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg;
  }

  /* Form Input Premium */
  .input-premium {
    @apply py-3 px-4 rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-primary transition-all;
  }
}

@layer utilities {
  /* Fade In Animation */
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.4s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Stagger Animation Delays */
  .animate-delay-100 {
    animation-delay: 100ms;
  }
  .animate-delay-200 {
    animation-delay: 200ms;
  }
  .animate-delay-300 {
    animation-delay: 300ms;
  }
  .animate-delay-400 {
    animation-delay: 400ms;
  }
}
```

### 2. `frontend/tailwind.config.ts`

**Add to theme.extend**:

```typescript
colors: {
  // ... existing colors ...
  cta: {
    DEFAULT: "hsl(var(--cta))",
    foreground: "hsl(var(--cta-foreground))",
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  jockey: {
    DEFAULT: "hsl(var(--jockey))",
    foreground: "hsl(var(--jockey-foreground))",
  },
  workshop: {
    DEFAULT: "hsl(var(--workshop))",
    foreground: "hsl(var(--workshop-foreground))",
  },
},
fontFamily: {
  sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
},
boxShadow: {
  'subtle': 'var(--shadow-subtle)',
  'card': 'var(--shadow-card)',
  'elevated': 'var(--shadow-elevated)',
  'premium': 'var(--shadow-premium)',
},
animation: {
  'fade-in': 'fadeIn 0.5s ease-out forwards',
  'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
  'slide-in-right': 'slideInRight 0.4s ease-out forwards',
},
keyframes: {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeInUp: {
    from: { opacity: '0', transform: 'translateY(20px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  slideInRight: {
    from: { opacity: '0', transform: 'translateX(20px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
},
```

### 3. `frontend/app/[locale]/layout.tsx`

**Add Inter font**:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children, params }: Props) {
  return (
    <html lang={params.locale} className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### 4. Update Button Component

**Add to `frontend/components/ui/button.tsx`**:

```typescript
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // ... existing variants ...
        hero: "bg-cta text-cta-foreground hover:bg-cta/90 btn-premium shadow-lg",
        "outline-light": "border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10",
        jockey: "bg-jockey text-jockey-foreground hover:bg-jockey/90",
        workshop: "bg-workshop text-workshop-foreground hover:bg-workshop/90",
      },
      size: {
        // ... existing sizes ...
        xl: "h-14 px-8 text-lg",
      },
    },
  }
)
```

---

## Implementation Checklist

### Core Integration (Phase 1 & 2)

- [ ] Update `frontend/app/globals.css` with CSS variables and utility classes
- [ ] Update `frontend/tailwind.config.ts` with custom tokens
- [ ] Add Inter font to `layout.tsx`
- [ ] Update Button component with new variants

### Landing Page Enhancement (Phase 3)

- [ ] Refactor Hero section with gradient and wave divider
- [ ] Update Portal Cards with animations and portal colors
- [ ] Add trust badge to hero
- [ ] Update card hover effects

### Optional Enhancements (Phase 4)

- [ ] Port ValueProps component
- [ ] Port HowItWorks component
- [ ] Port FAQ component
- [ ] Create Header component
- [ ] Create Footer component

---

## Design Principles from Lovable

1. **Premium Feel**: Elevated shadows, smooth animations, professional colors
2. **Portal Differentiation**: Color-coded portals (Blue/Green/Orange)
3. **Trust Signals**: Trust badges, ratings, social proof
4. **User-Friendly**: Large CTAs, clear hierarchy, readable typography
5. **Performance**: CSS animations (not JS), optimized fonts
6. **Responsive**: Mobile-first, flexible grid layouts
7. **Accessibility**: Sufficient contrast, semantic HTML, keyboard navigation

---

## Next Steps

1. **Review & Approve**: Review this document and approve integration approach
2. **Phase 1 Implementation**: Apply core design tokens
3. **Phase 2 Implementation**: Add component utility classes
4. **Phase 3 Implementation**: Update existing components
5. **Testing**: Visual regression testing, responsive testing
6. **Documentation**: Update component library docs

---

## Notes

- Lovable project uses **Vite + React Router**, we use **Next.js App Router**
- All components need to be adapted to Next.js conventions (use Link from next/link, etc.)
- Animations are CSS-based, no JavaScript required
- Design system is fully compatible with our existing shadcn/ui setup
- Color scheme aligns perfectly with B2C automotive industry (trust, professionalism, action)

---

**Document Version**: 1.0
**Created**: 2026-02-01
**Status**: Ready for Implementation
