# Authentication System

Complete authentication integration for the B2C App with support for three user roles: Customer, Jockey, and Workshop.

## Architecture

### Core Files

- **`types.ts`**: TypeScript types and interfaces for auth
- **`token-storage.ts`**: JWT token storage in localStorage
- **`auth-api.ts`**: API service layer for authentication endpoints
- **`auth-context.tsx`**: React Context provider for auth state
- **`auth-hooks.ts`**: Custom hooks for accessing auth state

### Components

- **`ProtectedRoute.tsx`**: Route protection with role-based access control
- **`LogoutButton.tsx`**: Reusable logout button component

## Usage

### 1. Setup (Already Done)

The `AuthProvider` is wrapped around the app in `app/layout.tsx`:

```tsx
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Using Auth Hooks

#### Access auth state and methods:

```tsx
import { useAuth } from '@/lib/auth-hooks';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

#### Get current user (throws if not authenticated):

```tsx
import { useUser } from '@/lib/auth-hooks';

function DashboardContent() {
  const user = useUser(); // Throws error if not authenticated

  return <div>Hello, {user.name}!</div>;
}
```

#### Check user role:

```tsx
import { useRole } from '@/lib/auth-hooks';

function AdminFeature() {
  const isWorkshop = useRole('workshop');

  if (!isWorkshop) return null;

  return <div>Workshop-only feature</div>;
}
```

### 3. Protecting Routes

Wrap your page component with `ProtectedRoute`:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### 4. Login Pages

Each role has its own login page:

- **Customer**: `/customer/login` - Magic link (passwordless)
- **Jockey**: `/jockey/login` - Username + password
- **Workshop**: `/workshop/login` - Username + password

### 5. Logout

Add the logout button to any authenticated page:

```tsx
import { LogoutButton } from '@/components/auth/LogoutButton';

function Header() {
  return (
    <header>
      <h1>Dashboard</h1>
      <LogoutButton />
    </header>
  );
}
```

## API Endpoints

The auth system connects to these backend endpoints:

### Customer (Magic Link)
- `POST /api/auth/customer/magic-link` - Request magic link
  - Body: `{ email: string }`
  - Response: `{ message: string, success: boolean }`

- `GET /api/auth/customer/verify?token=...` - Verify magic link
  - Query: `token` (string)
  - Response: `{ token: string, user: User }`

### Jockey
- `POST /api/auth/jockey/login` - Login with credentials
  - Body: `{ username: string, password: string }`
  - Response: `{ token: string, user: User }`

### Workshop
- `POST /api/auth/workshop/login` - Login with credentials
  - Body: `{ username: string, password: string }`
  - Response: `{ token: string, user: User }`

### Current User
- `GET /api/auth/me` - Get current authenticated user
  - Headers: `Authorization: Bearer <token>`
  - Response: `User`

## Token Management

- Tokens are stored in `localStorage` under the key `auth_token`
- Tokens are automatically included in all API requests via the `ApiClient`
- Token expiry is handled by redirecting to login when API returns 401

## User Object Structure

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'jockey' | 'workshop';
}
```

## Flow Examples

### Customer Login (Magic Link)

1. User enters email on `/customer/login`
2. System sends magic link to email via `POST /api/auth/customer/magic-link`
3. User clicks link in email → redirects to `/customer/verify?token=...`
4. Token is verified via `GET /api/auth/customer/verify?token=...`
5. JWT token is stored in localStorage
6. User is redirected to `/customer/dashboard`

### Jockey/Workshop Login

1. User enters username + password
2. Credentials are sent to `POST /api/auth/{role}/login`
3. JWT token is received and stored in localStorage
4. User is redirected to `/{role}/dashboard`

### Protected Route Access

1. User navigates to protected page
2. `ProtectedRoute` checks if user is authenticated
3. If not authenticated → redirect to login
4. If wrong role → redirect to their own dashboard
5. If authorized → render page content

## Error Handling

All API errors are caught and displayed to the user:

- Invalid credentials → "Anmeldung fehlgeschlagen"
- Expired magic link → "Verifizierung fehlgeschlagen"
- Network errors → Error message from API

## Security Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All API requests include `Authorization: Bearer <token>` header
- Protected routes redirect unauthorized users to login
- Role-based access control prevents cross-role access
