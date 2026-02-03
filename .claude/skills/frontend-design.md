# Frontend Design Skill

## Purpose
Production-grade frontend implementation with modern best practices, accessibility, and performance optimization.

## When to Use
- **Auto-invoked** when working with:
  - UI component creation
  - Page/layout implementation
  - Form design
  - Responsive design
  - User interactions

## Design Principles

### 1. Component Architecture
```typescript
// ✅ GOOD: Atomic design with clear separation
// atoms/button.tsx
export function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    >
      {children}
    </button>
  );
}

// molecules/form-field.tsx
export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      {children}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

// organisms/contact-form.tsx
export function ContactForm() {
  return (
    <form>
      <FormField label="E-Mail" error={errors.email}>
        <Input name="email" type="email" />
      </FormField>
      {/* ... */}
      <Button type="submit">Weiter</Button>
    </form>
  );
}
```

**Architecture Levels:**
- **Atoms**: Button, Input, Label, Badge, Spinner
- **Molecules**: FormField, WorkshopCard, SlotCard
- **Organisms**: ContactForm, SlotCalendar, Header
- **Templates**: BookingLayout, AdminLayout
- **Pages**: ContactPage, ConfirmationPage

**Check:**
- [ ] Components follow atomic design
- [ ] Clear separation of concerns
- [ ] Reusable atoms/molecules
- [ ] Props typed with TypeScript

### 2. Accessibility (WCAG 2.1 AA)
```typescript
// ✅ GOOD: Accessible button
<button
  type="button"
  aria-label="Schließen"
  aria-pressed={isOpen}
  onClick={handleClose}
  className="..."
>
  <X className="h-4 w-4" />
  <span className="sr-only">Schließen</span>
</button>

// ✅ GOOD: Form with proper labels and error messages
<form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="email">E-Mail-Adresse *</label>
    <input
      id="email"
      type="email"
      aria-required="true"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'email-error' : undefined}
      {...register('email')}
    />
    {errors.email && (
      <span id="email-error" role="alert" className="error">
        {errors.email.message}
      </span>
    )}
  </div>
</form>

// ✅ GOOD: Focus management in modal
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

**Accessibility Checklist:**
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space, Arrows, Escape)
- [ ] Semantic HTML (nav, main, section, article)
- [ ] ARIA labels for icon-only buttons
- [ ] Form labels associated with inputs (htmlFor + id)
- [ ] Error messages announced (role="alert")
- [ ] Focus visible (focus:ring-2)
- [ ] Color contrast 4.5:1 for text, 3:1 for UI elements
- [ ] Touch targets min 44x44px
- [ ] Skip to main content link

### 3. Responsive Design (Mobile-First)
```typescript
// ✅ GOOD: Mobile-first responsive classes
<div className="
  grid
  grid-cols-1        // Mobile: 1 column
  md:grid-cols-2     // Tablet: 2 columns
  lg:grid-cols-3     // Desktop: 3 columns
  gap-4              // Gap scales with screen
">
  <WorkshopCard />
  <WorkshopCard />
  <WorkshopCard />
</div>

// ✅ GOOD: Responsive typography
<h1 className="
  text-2xl           // Mobile: 24px
  md:text-3xl        // Tablet: 30px
  lg:text-4xl        // Desktop: 36px
  font-bold
">
  Werkstatt finden
</h1>

// ✅ GOOD: Conditional rendering for mobile
{isMobile ? <MobileNav /> : <DesktopNav />}
```

**Breakpoints:**
- **Mobile**: < 640px (sm) - Single column, bottom nav, larger touch targets
- **Tablet**: 640px - 1023px (md) - 2-column grids, side nav optional
- **Desktop**: ≥ 1024px (lg) - 3-column grids, hover states, mouse interactions

**Check:**
- [ ] Mobile-first CSS (base styles for mobile, then add md: and lg:)
- [ ] Touch-friendly interactions (min 44x44px tap targets)
- [ ] No horizontal scroll on mobile
- [ ] Images responsive (object-fit, srcset)
- [ ] Navigation adapts (mobile: bottom nav, desktop: header nav)

### 4. Form UX Best Practices
```typescript
// ✅ GOOD: Progressive form validation
const {
  register,
  formState: { errors, isSubmitting, isValid },
  watch,
} = useForm({
  mode: 'onBlur', // Validate on blur, not every keystroke
});

// ✅ GOOD: Loading states
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner className="mr-2" />
      Wird gespeichert...
    </>
  ) : (
    'Weiter'
  )}
</Button>

// ✅ GOOD: Helpful error messages
{errors.email?.type === 'required' && (
  <span>Bitte geben Sie Ihre E-Mail-Adresse ein</span>
)}
{errors.email?.type === 'pattern' && (
  <span>Bitte geben Sie eine gültige E-Mail-Adresse ein</span>
)}

// ✅ GOOD: Auto-format inputs
<PhoneInput
  value={phone}
  onChange={(value) => {
    // Auto-format: 0151 → +49 151, +49151 → +49 151
    setPhone(formatPhoneNumber(value));
  }}
/>
```

**Form UX Checklist:**
- [ ] Required fields marked with * and aria-required
- [ ] Validation on blur (not on every keystroke)
- [ ] Clear, actionable error messages
- [ ] Loading states for async operations
- [ ] Disabled submit when invalid or submitting
- [ ] Auto-format inputs (phone, license plate)
- [ ] Confirmation before destructive actions
- [ ] Preserve form data on navigation (Zustand store)

### 5. Performance Optimization
```typescript
// ✅ GOOD: Code splitting
const SlotCalendar = dynamic(() => import('@/components/booking/slot-calendar'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // Don't SSR heavy components
});

// ✅ GOOD: Image optimization
import Image from 'next/image';

<Image
  src={workshop.imageUrl}
  alt={workshop.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// ✅ GOOD: Memoization for expensive renders
const slotsByDay = useMemo(() => {
  return groupSlotsByDay(slots);
}, [slots]);

const MemoizedWorkshopCard = memo(WorkshopCard);
```

**Performance Checklist:**
- [ ] Images use Next.js Image component (automatic optimization)
- [ ] Heavy components lazy loaded (dynamic import)
- [ ] Lists virtualized if > 100 items (react-window)
- [ ] Expensive computations memoized (useMemo, useCallback)
- [ ] No unnecessary re-renders (React.memo, keys)
- [ ] API calls debounced (search inputs)
- [ ] Skeleton loaders for loading states

### 6. State Management
```typescript
// ✅ GOOD: Zustand for global state
// lib/store/booking-store.ts
export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      workshop: null,
      service: null,
      slot: null,
      contact: null,
      vehicle: null,

      setWorkshop: (workshop) => set({ workshop }),
      setService: (service) => set({ service }),
      setSlot: (slot) => set({ slot }),
      setContact: (contact) => set({ contact }),
      setVehicle: (vehicle) => set({ vehicle }),

      reset: () => set({
        workshop: null,
        service: null,
        slot: null,
        contact: null,
        vehicle: null,
      }),
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ✅ GOOD: Local state for UI-only state
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

**State Management Rules:**
- [ ] Global state (booking flow data) → Zustand with localStorage
- [ ] Server state (API data) → SWR with caching
- [ ] UI state (modals, dropdowns) → useState
- [ ] Form state → React Hook Form
- [ ] No prop drilling (use Zustand or Context)

### 7. Error Handling & Edge Cases
```typescript
// ✅ GOOD: Error boundaries
export default function Page() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error('Page error:', error);
        // Send to error tracking (Sentry)
      }}
    >
      <SlotCalendar />
    </ErrorBoundary>
  );
}

// ✅ GOOD: Empty states
{workshops.length === 0 ? (
  <EmptyState
    icon={<SearchX />}
    title="Keine Werkstätten gefunden"
    description="Versuchen Sie eine andere PLZ oder erweitern Sie den Suchradius."
    action={<Button onClick={handleReset}>Suche zurücksetzen</Button>}
  />
) : (
  <WorkshopList workshops={workshops} />
)}

// ✅ GOOD: Loading states
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <Skeleton className="h-48" />
    <Skeleton className="h-48" />
    <Skeleton className="h-48" />
  </div>
) : (
  <WorkshopGrid workshops={workshops} />
)}
```

**Edge Cases Checklist:**
- [ ] Empty states (no results, no data)
- [ ] Loading states (skeletons, spinners)
- [ ] Error states (API errors, network errors)
- [ ] Error boundaries (catch React errors)
- [ ] Offline mode (show message, retry button)
- [ ] Slow connections (show loading indicators)

### 8. Design System Consistency
```typescript
// ✅ GOOD: Use design tokens
import { cn } from '@/lib/utils';

// Colors
const colors = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  error: 'bg-error text-error-foreground',
};

// Typography
const typography = {
  h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
  body: 'text-base leading-relaxed',
  small: 'text-sm text-muted-foreground',
};

// Spacing
const spacing = {
  section: 'py-8 md:py-12 lg:py-16',
  card: 'p-4 md:p-6',
  gap: 'gap-4 md:gap-6',
};
```

**Design System Checklist:**
- [ ] All colors from design tokens (no hardcoded colors)
- [ ] Typography classes reused (h1, h2, body, small)
- [ ] Spacing consistent (4px grid: 4, 8, 12, 16, 24, 32)
- [ ] Border radius consistent (md: 6px, lg: 8px)
- [ ] Shadows consistent (elevation system)
- [ ] Animations consistent (duration: 150ms, 200ms, 300ms)

## Validation Process

When this skill is invoked:

1. **Review component structure** (atomic design, props, types)
2. **Test accessibility** (keyboard navigation, ARIA, screen reader)
3. **Check responsiveness** (mobile, tablet, desktop)
4. **Validate form UX** (validation, errors, loading states)
5. **Measure performance** (bundle size, render time)
6. **Verify design system** (colors, typography, spacing)

## Example Output

```markdown
## Frontend Design Review

### ✅ PASSED: Component Architecture
- Clear atomic design structure
- Props properly typed with TypeScript
- Reusable atoms (Button, Input, Label)

### 🟡 HIGH: Accessibility Issues
**Issue**: Button has no aria-label for icon-only state
**Fix**: Add aria-label="Schließen" and sr-only text

### ✅ PASSED: Responsive Design
- Mobile-first approach used
- Breakpoints correctly applied (sm, md, lg)
- Touch targets meet 44x44px minimum

### 🟢 MEDIUM: Performance Optimization
**Suggestion**: Lazy load SlotCalendar component with dynamic import
**Impact**: Reduces initial bundle by ~15KB
```

## References
- Next.js Best Practices: https://nextjs.org/docs/app/building-your-application
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI: https://www.radix-ui.com/primitives
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
