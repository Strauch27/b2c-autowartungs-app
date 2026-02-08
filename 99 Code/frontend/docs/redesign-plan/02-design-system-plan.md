# Design System Foundation -- Implementation Plan

**Date:** 2026-02-08
**Author:** design-planner agent
**Scope:** CSS variables, typography, spacing, animations, component styles, shared layouts
**Key constraint:** Tailwind CSS v4 with NO `tailwind.config.ts` -- all theming via CSS variables in `globals.css`

---

## Table of Contents

1. [CSS Variable Changes](#1-css-variable-changes)
2. [Typography System](#2-typography-system)
3. [Spacing & Layout](#3-spacing--layout)
4. [Animation & Transition Library](#4-animation--transition-library)
5. [Component Style Guide](#5-component-style-guide)
6. [Shared Layout Components](#6-shared-layout-components)
7. [Migration Strategy](#7-migration-strategy)

---

## 1. CSS Variable Changes

### 1.1 Current State (`globals.css`, 363 lines)

The current `:root` block defines HSL variables in the shadcn convention (space-separated H S% L% without `hsl()` wrapper). The `@theme inline` block maps each to `--color-*` for Tailwind v4.

**Problems identified:**
- `--cta` (25 95% 53%) and `--workshop` (25 95% 53%) are **identical** -- brand confusion
- No neutral scale variables (pages use raw Tailwind slate classes)
- No semantic warning/info colors
- No amber CTA palette (current CTA is orange, mockup uses amber `#F59E0B`)
- `--primary` (224 88% 55%) is a medium blue, not the deep navy from the mockup

### 1.2 New `:root` Variable Map

Below, "Current" shows the existing value and "New" shows the replacement. Values use the HSL space-separated format expected by the shadcn/Tailwind v4 convention.

#### Core Brand Colors

| Variable | Current | New | Hex Equiv. | Reason |
|----------|---------|-----|-----------|--------|
| `--background` | `210 20% 98%` | `210 40% 98%` | `#F8FAFC` | Align with Slate-50 from mockup |
| `--foreground` | `222 47% 11%` | `222 47% 11%` | `#0F172A` | **Keep** -- matches mockup |
| `--card` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |
| `--card-foreground` | `222 47% 11%` | `222 47% 11%` | `#0F172A` | **Keep** |
| `--popover` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |
| `--popover-foreground` | `222 47% 11%` | `222 47% 11%` | `#0F172A` | **Keep** |
| `--primary` | `224 88% 55%` | `217 91% 60%` | `#3B82F6` | Bright Blue (Primary Light from proposals) -- matches mockup accent |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |
| `--secondary` | `215 20% 95%` | `214 32% 91%` | `#E2E8F0` | Slate-200 for secondary surfaces |
| `--secondary-foreground` | `222 47% 11%` | `215 25% 27%` | `#334155` | Slate-700 |
| `--muted` | `215 20% 94%` | `210 40% 96%` | `#F1F5F9` | Slate-100 |
| `--muted-foreground` | `215 16% 47%` | `215 16% 47%` | `#64748B` | **Keep** -- Slate-500 |
| `--accent` | `215 20% 94%` | `210 40% 96%` | `#F1F5F9` | Match muted (shadcn convention) |
| `--accent-foreground` | `222 47% 11%` | `222 47% 11%` | `#0F172A` | **Keep** |

#### CTA Palette (CHANGED from orange to amber)

| Variable | Current | New | Hex Equiv. | Reason |
|----------|---------|-----|-----------|--------|
| `--cta` | `25 95% 53%` | `45 93% 47%` | `#F59E0B` | Amber from mockup `btn-primary` gradient |
| `--cta-foreground` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |

#### NEW Variables to Add

| Variable | Value | Hex Equiv. | Usage |
|----------|-------|-----------|-------|
| `--cta-hover` | `32 95% 44%` | `#D97706` | CTA hover state |
| `--cta-light` | `48 96% 89%` | `#FEF3C7` | CTA tint backgrounds |
| `--primary-dark` | `222 47% 11%` | `#0F172A` | Deep navy for headers, hero bg |
| `--primary-navy` | `212 52% 25%` | `#1E3A5F` | Hero gradient start, sidebar bg |
| `--success` | *exists* `142 76% 36%` | `160 84% 39%` | `#10B981` | Emerald (align with mockup) |
| `--success-light` | `152 81% 90%` | `#D1FAE5` | Success tint backgrounds |
| `--warning` | `45 93% 47%` | `#F59E0B` | Warning states (same as CTA amber) |
| `--warning-light` | `48 96% 89%` | `#FEF3C7` | Warning tint backgrounds |
| `--error` | `0 84% 60%` | `#EF4444` | Alias for destructive |
| `--error-light` | `0 93% 94%` | `#FEE2E2` | Error tint backgrounds |
| `--info` | `199 89% 48%` | `#0EA5E9` | Informational notices |
| `--info-light` | `204 94% 94%` | `#E0F2FE` | Info tint backgrounds |
| `--neutral-50` | `210 40% 98%` | `#F8FAFC` | Lightest neutral |
| `--neutral-100` | `210 40% 96%` | `#F1F5F9` | Card bg, subtle fills |
| `--neutral-200` | `214 32% 91%` | `#E2E8F0` | Borders, dividers |
| `--neutral-300` | `213 27% 84%` | `#CBD5E1` | Disabled, placeholder |
| `--neutral-400` | `215 20% 65%` | `#94A3B8` | Secondary text, icons |
| `--neutral-500` | `215 16% 47%` | `#64748B` | Body text |
| `--neutral-600` | `215 19% 35%` | `#475569` | Subheadings |
| `--neutral-700` | `215 25% 27%` | `#334155` | Headings |
| `--neutral-800` | `217 33% 17%` | `#1E293B` | Primary text |
| `--neutral-900` | `222 47% 11%` | `#0F172A` | Strongest text |

#### Portal Accent Colors (CHANGED)

| Variable | Current | New | Hex Equiv. | Reason |
|----------|---------|-----|-----------|--------|
| `--jockey` | `142 71% 45%` | `142 71% 45%` | `#22C55E` | **Keep** |
| `--jockey-foreground` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |
| `--workshop` | `25 95% 53%` | `24 95% 53%` | `#F97316` | Change to distinct Orange-500 (was identical to CTA) |
| `--workshop-foreground` | `0 0% 100%` | `0 0% 100%` | `#FFFFFF` | **Keep** |

#### Destructive (keep as-is, alias to --error)

| Variable | Current | New | Reason |
|----------|---------|-----|--------|
| `--destructive` | `0 84% 60%` | `0 84% 60%` | **Keep** |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` | **Keep** |

#### Border / Input / Ring

| Variable | Current | New | Reason |
|----------|---------|-----|--------|
| `--border` | `214 32% 91%` | `214 32% 91%` | **Keep** (Slate-200) |
| `--input` | `214 32% 91%` | `214 32% 91%` | **Keep** |
| `--ring` | `224 88% 55%` | `217 91% 60%` | Match new `--primary` |

#### Radius

| Variable | Current | New | Reason |
|----------|---------|-----|--------|
| `--radius` | `0.75rem` | `0.75rem` | **Keep** (12px, matches mockup `rounded-xl`) |

#### Shadows (keep existing, add elevation tokens)

| Variable | Current | New | Reason |
|----------|---------|-----|--------|
| `--shadow-subtle` | *(keep)* | *(keep)* | Maps to `elevation-low` |
| `--shadow-card` | *(keep)* | *(keep)* | Maps to `elevation-low` |
| `--shadow-elevated` | *(keep)* | *(keep)* | Maps to `elevation-mid` |
| `--shadow-premium` | *(keep)* | *(keep)* | Maps to `elevation-high` |
| **NEW** `--elevation-flat` | -- | `none` | Flush surfaces |
| **NEW** `--elevation-low` | -- | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest |
| **NEW** `--elevation-mid` | -- | `0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Hover, dropdowns |
| **NEW** `--elevation-high` | -- | `0 12px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)` | Modals, sticky |
| **NEW** `--elevation-overlay` | -- | `0 24px 48px rgba(0,0,0,0.16)` | Full overlays |

#### Sidebar (update to match new primary)

| Variable | Current | New |
|----------|---------|-----|
| `--sidebar-primary` | `224 88% 55%` | `217 91% 60%` |
| `--sidebar-ring` | `224 71% 40%` | `217 91% 50%` |

*All other sidebar variables remain unchanged.*

### 1.3 Variables to Remove

None removed -- all existing variables are retained for backwards compatibility. Deprecated variables (like the old `--primary` value) are simply updated in place.

### 1.4 Dark Mode Updates

Apply symmetric changes to `.dark` block:

| Variable | Current Dark | New Dark |
|----------|-------------|----------|
| `--primary` | `224 88% 60%` | `217 91% 60%` |
| `--cta` | `25 95% 53%` | `45 93% 52%` |
| `--success` | `142 76% 36%` | `160 84% 44%` |
| `--workshop` | `25 95% 53%` | `24 95% 58%` |
| `--ring` | `224 88% 60%` | `217 91% 60%` |

New dark-mode variables to add: same semantic colors as `:root` with slightly adjusted lightness (5-10% brighter for light tints, 5% dimmer for base colors).

### 1.5 `@theme inline` Block Updates

Add mappings for every new variable:

```css
--color-cta-hover: hsl(var(--cta-hover));
--color-cta-light: hsl(var(--cta-light));
--color-primary-dark: hsl(var(--primary-dark));
--color-primary-navy: hsl(var(--primary-navy));
--color-success-light: hsl(var(--success-light));
--color-warning: hsl(var(--warning));
--color-warning-light: hsl(var(--warning-light));
--color-error: hsl(var(--destructive));  /* alias */
--color-error-light: hsl(var(--error-light));
--color-info: hsl(var(--info));
--color-info-light: hsl(var(--info-light));
--color-neutral-50: hsl(var(--neutral-50));
--color-neutral-100: hsl(var(--neutral-100));
--color-neutral-200: hsl(var(--neutral-200));
--color-neutral-300: hsl(var(--neutral-300));
--color-neutral-400: hsl(var(--neutral-400));
--color-neutral-500: hsl(var(--neutral-500));
--color-neutral-600: hsl(var(--neutral-600));
--color-neutral-700: hsl(var(--neutral-700));
--color-neutral-800: hsl(var(--neutral-800));
--color-neutral-900: hsl(var(--neutral-900));
```

This enables Tailwind classes like `bg-cta-hover`, `text-neutral-700`, `border-warning-light`, etc.

---

## 2. Typography System

### 2.1 Font Family

**Inter is already loaded** via `next/font/google` in `app/layout.tsx` (line 10-14) with CSS variable `--font-inter`. The body element applies `inter.variable` and `inter.className`. No change needed for the font itself.

The font stack in `globals.css` body rule is correct:
```css
font-family: var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 2.2 Typography Scale

Add CSS utility classes to `globals.css` (after the body rule). These use the modular scale from the proposals doc (ratio ~1.25).

| Class | Font Size | Weight | Line Height | Letter Spacing | Tailwind Equivalent |
|-------|-----------|--------|-------------|----------------|---------------------|
| `.text-display-lg` | 48px / 3rem | 800 | 1.1 | -0.025em | `text-5xl font-extrabold` |
| `.text-display-sm` | 36px / 2.25rem | 700 | 1.15 | -0.025em | `text-4xl font-bold` |
| `.text-heading-1` | 30px / 1.875rem | 700 | 1.2 | -0.02em | `text-3xl font-bold` |
| `.text-heading-2` | 24px / 1.5rem | 600 | 1.3 | -0.015em | `text-2xl font-semibold` |
| `.text-heading-3` | 20px / 1.25rem | 600 | 1.4 | -0.01em | `text-xl font-semibold` |
| `.text-heading-4` | 16px / 1rem | 600 | 1.5 | 0 | `text-base font-semibold` |
| `.text-body-lg` | 18px / 1.125rem | 400 | 1.6 | 0 | `text-lg` |
| `.text-body` | 16px / 1rem | 400 | 1.6 | 0 | `text-base` |
| `.text-body-sm` | 14px / 0.875rem | 400 | 1.5 | 0 | `text-sm` |
| `.text-caption` | 12px / 0.75rem | 500 | 1.4 | 0.02em | `text-xs font-medium` |
| `.text-overline` | 11px / 0.6875rem | 600 | 1.3 | 0.08em | `text-[11px] font-semibold uppercase tracking-widest` |

### 2.3 Heading Base Styles

Update the existing heading rule in `globals.css`:

```css
/* Current */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* New -- more granular */
h1, h2 { font-weight: 700; letter-spacing: -0.025em; }
h3, h4 { font-weight: 600; letter-spacing: -0.01em; }
h5, h6 { font-weight: 600; letter-spacing: 0; }
```

### 2.4 Usage Guidelines

- **Hero headline (landing):** `.text-display-lg` on desktop, `.text-display-sm` on mobile (via responsive prefix)
- **Section headings (landing):** `.text-display-sm` on desktop, `.text-heading-1` on mobile
- **Page titles (dashboard):** `.text-heading-1`
- **Card titles:** `.text-heading-3`
- **Body copy:** `.text-body` (default, no class needed)
- **Secondary descriptions:** `.text-body-sm text-neutral-500`
- **Badges, timestamps:** `.text-caption`
- **Section labels:** `.text-overline text-primary` (e.g., "So einfach geht's", "Unsere Services")

---

## 3. Spacing & Layout

### 3.1 Spacing Scale

The project uses Tailwind's built-in spacing scale (4px increments). No custom spacing tokens needed -- Tailwind v4's default scale covers all values in the proposals:

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| space-1 | `gap-1`, `p-1` | 4px |
| space-2 | `gap-2`, `p-2` | 8px |
| space-3 | `gap-3`, `p-3` | 12px |
| space-4 | `gap-4`, `p-4` | 16px |
| space-5 | `gap-5`, `p-5` | 20px |
| space-6 | `gap-6`, `p-6` | 24px |
| space-8 | `gap-8`, `p-8` | 32px |
| space-10 | `gap-10`, `p-10` | 40px |
| space-12 | `gap-12`, `p-12` | 48px |
| space-16 | `gap-16`, `p-16` | 64px |
| space-20 | `gap-20`, `p-20` | 80px |
| space-24 | `gap-24`, `p-24` | 96px |

**No new CSS variables needed** -- use Tailwind utility classes directly.

### 3.2 Border Radius System

Add radius token variables to `:root`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | `6px` | Badges, chips, tooltips |
| `--radius-md` | `8px` | Buttons, inputs, selects |
| `--radius-lg` | `12px` | Cards, modals, panels (current `--radius`) |
| `--radius-xl` | `16px` | Hero elements, large feature cards |
| `--radius-full` | `9999px` | Avatars, pills, toggles |

Map in `@theme inline`:
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: var(--radius);  /* 0.75rem = 12px */
--radius-xl: 16px;
--radius-full: 9999px;
```

In practice, pages will use Tailwind classes: `rounded-md` (8px), `rounded-lg` (12px), `rounded-xl` (16px), `rounded-full`. The CSS variables serve as documentation and for custom component styles.

### 3.3 Container Max-Widths

**Convention (not new variables, just documented rules):**

| Context | Tailwind Class | Width |
|---------|---------------|-------|
| Landing page content | `max-w-5xl mx-auto` | 1024px |
| Portal dashboards | `max-w-7xl mx-auto` | 1280px |
| Modals / dialogs | `max-w-2xl` | 672px |
| Booking flow | `max-w-4xl mx-auto` | 896px (from mockup) |

### 3.4 Section Spacing Convention

Update the existing `.section-spacing` rule and add a landing-specific variant:

```css
/* Standard portal section spacing */
.section-spacing {
  padding-top: 2rem;     /* 32px mobile */
  padding-bottom: 2rem;
}
@media (min-width: 768px) {
  .section-spacing {
    padding-top: 3rem;   /* 48px tablet */
    padding-bottom: 3rem;
  }
}

/* Landing page sections -- more generous */
.section-spacing-landing {
  padding-top: 5rem;     /* 80px mobile */
  padding-bottom: 5rem;
}
@media (min-width: 768px) {
  .section-spacing-landing {
    padding-top: 7rem;   /* 112px desktop */
    padding-bottom: 7rem;
  }
}
```

---

## 4. Animation & Transition Library

### 4.1 Existing Animations (keep)

The current `globals.css` defines three `@keyframes` and stagger delays. **Keep all of these.**

| Keyframe | Class | Duration |
|----------|-------|----------|
| `fadeIn` | `.animate-fade-in` | 0.5s |
| `fadeInUp` | `.animate-fade-in-up` | 0.6s |
| `slideInRight` | `.animate-slide-in-right` | 0.4s |
| *stagger delays* | `.animate-delay-100` to `.animate-delay-400` | 100ms increments |

### 4.2 New Keyframes to Add

```css
/* Pulse dot for status badges */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

/* Amber glow for CTA buttons */
@keyframes glow-amber {
  0%, 100% { box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6); }
}

/* Timeline pulse for active status node */
@keyframes timeline-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

/* Floating shapes for hero background */
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(10px, -10px) scale(1.02); }
}

/* Slide in from left (for back navigation) */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Scale in (for badges, toasts) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Slide up for bottom sheets / toasts */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 4.3 New Utility Classes

```css
/* Hover lift effect for interactive cards */
.hover-lift {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--elevation-mid);
}

/* Button hover with subtle lift */
.btn-hover {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-hover:hover {
  transform: translateY(-2px);
}
.btn-hover:active {
  transform: translateY(0);
}

/* Animated card entrance */
.animate-card {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

/* Pulsing status dot */
.animate-pulse-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}

/* CTA glow */
.animate-glow-amber {
  animation: glow-amber 3s ease-in-out infinite;
}

/* Timeline active pulse */
.animate-timeline-pulse {
  animation: timeline-pulse 2s ease-in-out infinite;
}

/* Hero floating shapes */
.animate-float {
  animation: float 20s infinite ease-in-out;
}

/* Slide animations */
.animate-slide-in-left {
  animation: slideInLeft 0.4s ease-out forwards;
}
.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

/* Additional stagger delays */
.animate-delay-500 {
  animation-delay: 500ms;
}
.animate-delay-600 {
  animation-delay: 600ms;
}
```

### 4.4 Glassmorphism Utilities

```css
/* Glass navbar (from mockup) */
.glass-nav {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 300ms ease;
}
.glass-nav-scrolled {
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

/* Modal backdrop */
.modal-backdrop {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
```

### 4.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Component Style Guide

### 5.1 Button Variants

**Current state:** `components/ui/button.tsx` defines 11 variants via `cva()`: default, destructive, outline, secondary, ghost, link, hero, cta, outline-light, jockey, workshop.

**Changes to button.tsx:**

| Variant | Current Classes | New Classes | Notes |
|---------|----------------|-------------|-------|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` | `bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 btn-hover` | Add btn-hover |
| `cta` | `bg-cta text-cta-foreground hover:bg-cta/90 btn-premium shadow-lg` | `bg-cta text-cta-foreground hover:bg-cta-hover btn-hover shadow-lg` | Use cta-hover color |
| `hero` | *(same as cta)* | **Remove** -- merge into `cta` | Redundant |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` | `bg-error-light text-destructive hover:bg-destructive hover:text-white` | Softer default, bold on hover |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground` | `border border-neutral-200 bg-background shadow-sm hover:bg-neutral-100 hover:text-foreground` | Use neutral scale |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` | `bg-neutral-100 text-neutral-700 shadow-sm hover:bg-neutral-200` | Use neutral scale |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | `text-primary hover:bg-primary/10` | Clearer ghost style |
| `link` | `text-primary underline-offset-4 hover:underline` | *(keep as-is)* | Works fine |
| `outline-light` | `border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10` | *(keep as-is)* | Used on dark hero bg |
| `jockey` | `bg-jockey text-jockey-foreground hover:bg-jockey/90` | `bg-jockey text-jockey-foreground hover:bg-jockey/90 btn-hover` | Add btn-hover |
| `workshop` | `bg-workshop text-workshop-foreground hover:bg-workshop/90` | `bg-workshop text-workshop-foreground hover:bg-workshop/90 btn-hover` | Add btn-hover |

**Sizes -- update:**

| Size | Current | New |
|------|---------|-----|
| `default` | `h-9 px-4 py-2` | `h-10 px-4 py-2 rounded-md` | 40px height (from proposals) |
| `sm` | `h-8 rounded-md px-3 text-xs` | `h-8 rounded-md px-3 text-xs` | **Keep** (32px) |
| `lg` | `h-10 rounded-md px-8` | `h-12 rounded-lg px-8` | 48px height |
| `xl` | `h-14 px-8 text-lg` | `h-14 rounded-xl px-8 text-lg font-bold` | 56px height (hero only) |
| `icon` | `h-9 w-9` | `h-10 w-10` | Match default height |

### 5.2 Card Variants

**Current state:** `components/ui/card.tsx` has a single `Card` component with `rounded-xl border bg-card text-card-foreground shadow`.

**No changes to card.tsx itself** -- keep the base component generic. Instead, add CSS utility classes in `globals.css` for variant styling:

```css
/* Card variants (applied via className on <Card>) */
.card-default {
  box-shadow: var(--elevation-low);
  border: 1px solid hsl(var(--neutral-200));
}

.card-interactive {
  box-shadow: var(--elevation-low);
  border: 1px solid hsl(var(--neutral-200));
  transition: transform 200ms ease, box-shadow 200ms ease;
  cursor: pointer;
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--elevation-mid);
}

.card-highlight {
  box-shadow: var(--elevation-low);
  border: 1px solid hsl(var(--neutral-200));
  border-left: 3px solid hsl(var(--primary));
}
.card-highlight-jockey {
  border-left-color: hsl(var(--jockey));
}
.card-highlight-workshop {
  border-left-color: hsl(var(--workshop));
}
.card-highlight-amber {
  border-left-color: hsl(var(--cta));
}
.card-highlight-success {
  border-left-color: hsl(var(--success));
}

.card-stat {
  box-shadow: var(--elevation-low);
  text-align: center;
}
```

**Update existing `.card-premium`:** Replace with `.card-interactive` (same behavior but uses new elevation tokens). Keep `.card-premium` as an alias during migration.

### 5.3 Badge Variants

**Current state:** `components/ui/badge.tsx` has 5 variants: default, secondary, destructive, outline, success.

**Add new variants to `badge.tsx`:**

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `info` | `bg-info-light text-info` | `#0EA5E9` on `#E0F2FE` | Informational |
| `success` | *(update)* `bg-success-light text-success` | `#10B981` on `#D1FAE5` | Completed, approved |
| `warning` | `bg-warning-light text-cta-hover` | `#D97706` on `#FEF3C7` | Pending, needs attention |
| `error` | `bg-error-light text-destructive` | `#EF4444` on `#FEE2E2` | Cancelled, failed |
| `neutral` | `bg-neutral-100 text-neutral-500` | `#64748B` on `#F1F5F9` | Disabled, archived |

**Also update badge base styles:** Change from `rounded-md` to `rounded-full` for pill shape.

**Keep existing CSS status badge classes** (`.badge-pending`, `.badge-pickup`, etc.) for backwards compatibility. They will be gradually replaced by the component variants.

### 5.4 Input Styling

**Current state:** `components/ui/input.tsx` uses `h-9 rounded-md border border-input` -- standard shadcn.

**Changes to input.tsx base classes:**

```
Current: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ..."
New:     "flex h-10 w-full rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm ..."
```

Key changes:
- `h-9` (36px) -> `h-10` (40px) for better touch targets
- `rounded-md` -> `rounded-lg` for rounder look (matching mockup)
- `border-input` -> `border-neutral-200` (same value, more explicit)
- Focus ring: `focus-visible:ring-1 focus-visible:ring-ring` -> `focus-visible:ring-2 focus-visible:ring-primary`

Mobile: Use `h-11` (44px) on mobile screens for touch target compliance.

### 5.5 Tab / Pill Navigation

Add a CSS utility for pill-style tabs (used in booking flow, portal dashboards):

```css
/* Pill navigation tabs */
.tab-pills {
  display: flex;
  gap: 4px;
  background: hsl(var(--neutral-100));
  padding: 4px;
  border-radius: var(--radius-lg);
}
.tab-pill {
  padding: 8px 16px;
  border-radius: calc(var(--radius-lg) - 4px);
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--neutral-500));
  cursor: pointer;
  transition: all 200ms ease;
}
.tab-pill:hover {
  color: hsl(var(--foreground));
}
.tab-pill-active {
  background: white;
  color: hsl(var(--foreground));
  box-shadow: var(--elevation-low);
  font-weight: 600;
}
```

---

## 6. Shared Layout Components

### 6.1 `components/layout/MobileFrame.tsx`

**Purpose:** Phone-frame wrapper for mobile portal views. Provides consistent viewport framing in screenshots/demos and safe-area padding on real devices.

**Props:**
```typescript
interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}
```

**Implementation notes:**
- Renders a `<div>` with `max-w-md mx-auto min-h-screen` (448px max on desktop, full-width on mobile)
- Applies `pb-20` to account for bottom nav height (80px safe area)
- Applies `env(safe-area-inset-bottom)` for notched phones
- On desktop screens (>= 768px), optionally renders a phone bezel border for demo purposes (controlled by a `showFrame` prop)

### 6.2 `components/layout/BottomNav.tsx`

**Purpose:** Fixed bottom navigation bar for Customer, Jockey, and Workshop mobile portals.

**Props:**
```typescript
interface BottomNavProps {
  portal: 'customer' | 'jockey' | 'workshop';
  locale: string;
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  isAccent?: boolean;  // for the center "+" button
}
```

**Nav items per portal:**

| Portal | Items (icon + label) |
|--------|---------------------|
| Customer | Dashboard (Home), Buchungen (ClipboardList), + Neue Buchung (Plus, accent), Fahrzeuge (Car), Profil (User) |
| Jockey | Aufgaben (ClipboardList), Statistiken (BarChart3), Verfugbarkeit (CalendarDays), Profil (User) |
| Workshop | Auftrage (ClipboardList), Kalender (CalendarDays), Statistiken (BarChart3), Team (Users) |

**Styling:**
- Fixed bottom: `fixed bottom-0 left-0 right-0 z-40`
- Height: `h-16` (64px) + `pb-[env(safe-area-inset-bottom)]`
- Background: `bg-white border-t border-neutral-200`
- Shadow: `shadow-[0_-4px_12px_rgba(0,0,0,0.05)]`
- Active item: `text-cta` (amber icon + label)
- Inactive: `text-neutral-400`
- Label: `text-[10px] font-medium`
- Accent button (customer "+"): `bg-cta text-white rounded-full w-12 h-12 -mt-4 shadow-lg`
- Hidden on desktop: `md:hidden`
- Uses `usePathname()` from `next/navigation` to determine active item

### 6.3 `components/layout/TopBar.tsx`

**Purpose:** Compact mobile header for portal pages.

**Props:**
```typescript
interface TopBarProps {
  title: string;
  portal: 'customer' | 'jockey' | 'workshop';
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;  // notification bell, language switcher, etc.
}
```

**Styling:**
- Sticky top: `sticky top-0 z-30`
- Height: `h-14` (56px)
- Background by portal:
  - Customer: `bg-white border-b border-neutral-200`
  - Jockey: `bg-jockey text-white`
  - Workshop: `bg-workshop text-white`
- Title: `text-heading-4` (16px semibold), centered
- Back button (left): `w-10 h-10` tap target
- Right slot: Aligned right, typically `NotificationCenter` + `LanguageSwitcher`

### 6.4 `components/layout/PortalLayout.tsx`

**Purpose:** Per-portal wrapper that combines TopBar + content area + BottomNav + safe area padding.

**Props:**
```typescript
interface PortalLayoutProps {
  children: React.ReactNode;
  portal: 'customer' | 'jockey' | 'workshop';
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}
```

**Structure:**
```tsx
<div className="min-h-screen bg-background">
  <TopBar portal={portal} title={title} ... />
  <main className="pb-20 md:pb-0">  {/* space for BottomNav on mobile */}
    {children}
  </main>
  <BottomNav portal={portal} locale={locale} />  {/* only renders on mobile */}
</div>
```

**Desktop behavior:** On `md:` and above, BottomNav is hidden. The TopBar becomes a full-width header. Customer portal additionally renders a sidebar (existing inline sidebar code will be extracted here in Phase 2).

---

## 7. Migration Strategy

### 7.1 Principle: Additive First, Then Replace

All changes follow this order:
1. **Add** new variables/classes alongside existing ones
2. **Verify** no regressions via E2E tests (435 passing tests as baseline)
3. **Update** components to use new tokens
4. **Remove** deprecated tokens once all references are gone

### 7.2 Implementation Phases

#### Phase A: Foundation (globals.css only, no component changes)

**Files changed:** `globals.css` only

1. Add all new CSS variables to `:root` (neutral scale, semantic light variants, elevation tokens, cta-hover, primary-navy, primary-dark)
2. Add all new `@theme inline` mappings
3. Update `--primary` from `224 88% 55%` to `217 91% 60%`
4. Update `--cta` from `25 95% 53%` to `45 93% 47%`
5. Update `--workshop` from `25 95% 53%` to `24 95% 53%` (slight shift to differentiate from CTA)
6. Update `--success` from `142 76% 36%` to `160 84% 39%`
7. Add new keyframes (pulse-dot, glow-amber, timeline-pulse, float, slideInLeft, scaleIn, slideUp)
8. Add new utility classes (hover-lift, btn-hover, card variants, tab-pills, glass-nav)
9. Add typography utility classes (.text-display-lg through .text-overline)
10. Add reduced-motion media query
11. Apply same changes to `.dark` block

**Risk:** Low. Adding variables/classes does not affect existing pages (nothing references the new tokens yet). The `--primary`, `--cta`, `--workshop`, and `--success` changes will affect existing pages that reference these, but the color shifts are intentional and relatively minor.

**Verification:** Run `npm run test:e2e:smoke` to confirm no layout breaks.

#### Phase B: Component Updates (shadcn primitives)

**Files changed:** `button.tsx`, `badge.tsx`, `input.tsx`, `card.tsx`

1. Update `button.tsx` variants (remove `hero`, update class strings)
2. Update `badge.tsx` (add info, warning, error, neutral variants; change to `rounded-full`)
3. Update `input.tsx` (h-10, rounded-lg, focus ring)
4. Card.tsx: No changes needed (variants handled by CSS classes)

**Risk:** Medium. Button and badge changes affect all portals. Test each portal after changes.

**Verification:** Run `npm run test:e2e:portals` to check all portal smoke tests.

#### Phase C: Layout Components (new files)

**Files created:** `components/layout/MobileFrame.tsx`, `BottomNav.tsx`, `TopBar.tsx`, `PortalLayout.tsx`

1. Create all four layout components
2. Integrate `BottomNav` into customer dashboard as first adoption
3. Verify mobile navigation works
4. Roll out to jockey and workshop dashboards

**Risk:** Low. New components, existing pages unchanged until integration.

**Verification:** Manual testing on mobile viewport + `npm run test:e2e:journey`.

#### Phase D: Portal Integration (per portal)

Integrate layout components into each portal, one at a time:

1. **Customer portal** -- Wrap dashboard with `PortalLayout`, add `BottomNav`
2. **Jockey portal** -- Replace inline green header with `TopBar`, add `BottomNav`
3. **Workshop portal** -- Replace inline orange header with `TopBar`, add `BottomNav`

Each portal integration runs its own E2E suite before moving to the next.

### 7.3 Backwards Compatibility Notes

- The `.card-premium` class is **kept as-is** alongside new `.card-interactive`. Pages can migrate at their own pace.
- The `hero` button variant is deprecated but still functional (maps to same styles as `cta`). Existing references will work until removed.
- Status badge CSS classes (`.badge-pending`, `.badge-pickup`, etc.) remain in `globals.css`. They will coexist with the new Badge component variants.
- The existing shadow variables (`--shadow-subtle`, `--shadow-card`, `--shadow-elevated`, `--shadow-premium`) remain alongside new elevation tokens.

### 7.4 Files Touched Summary

| Phase | Files Modified | Files Created |
|-------|---------------|---------------|
| A | `globals.css` | -- |
| B | `button.tsx`, `badge.tsx`, `input.tsx` | -- |
| C | -- | `MobileFrame.tsx`, `BottomNav.tsx`, `TopBar.tsx`, `PortalLayout.tsx` |
| D | `customer/dashboard/page.tsx`, `jockey/dashboard/page.tsx`, `workshop/dashboard/page.tsx` | -- |

---

*End of Design System Foundation Plan*
