# Quick Authentication Reference

## Common Tasks

### 1. Protect a Page

```tsx
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### 2. Get Current User

```tsx
'use client';

import { useUser } from '@/lib/auth-hooks';

function MyComponent() {
  const user = useUser(); // { id, email, name, role }

  return <p>Hello, {user.name}!</p>;
}
```

### 3. Check Authentication

```tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Authenticated content</div>;
}
```

### 4. Add Logout Button

```tsx
import { LogoutButton } from '@/components/auth/LogoutButton';

<LogoutButton />
<LogoutButton variant="outline" />
<LogoutButton variant="ghost" size="sm" />
```

### 5. Check User Role

```tsx
'use client';

import { useRole } from '@/lib/auth-hooks';

function AdminFeature() {
  const isWorkshop = useRole('workshop');

  if (!isWorkshop) return null;

  return <div>Workshop-only feature</div>;
}
```

### 6. Manual Login (Form)

```tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login('jockey', {
        username: 'jockey1',
        password: 'password'
      });
      // Redirects automatically
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 7. Request Magic Link

```tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';

function MagicLinkForm() {
  const { requestMagicLink } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await requestMagicLink('user@example.com');
      console.log(response.message); // "Magic link sent"
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 8. Make Authenticated API Call

```tsx
import { apiClient } from '@/lib/api/client';

// Token is automatically included in headers
const data = await apiClient.get('/api/bookings');
const booking = await apiClient.post('/api/bookings', { ... });
```

### 9. Conditional Rendering by Role

```tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'customer' && <CustomerView />}
      {user?.role === 'jockey' && <JockeyView />}
      {user?.role === 'workshop' && <WorkshopView />}
    </div>
  );
}
```

### 10. Handle Loading States

```tsx
'use client';

import { useAuth } from '@/lib/auth-hooks';

function MyPage() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <div className="animate-spin">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome {user.name}!</div>;
}
```

## Routes

- Customer Login: `/customer/login`
- Customer Verify: `/customer/verify?token=...`
- Jockey Login: `/jockey/login`
- Workshop Login: `/workshop/login`
- Customer Dashboard: `/customer/dashboard`
- Jockey Dashboard: `/jockey/dashboard`
- Workshop Dashboard: `/workshop/dashboard`

## Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useAuth()` | Full auth state and methods | `{ user, isAuthenticated, isLoading, login, logout, requestMagicLink, verifyMagicLink }` |
| `useUser()` | Get current user (throws if not auth) | `User` |
| `useRole(role)` | Check if user has specific role | `boolean` |
| `useRequireAuth(role?)` | Check auth with optional role | `{ isLoading, user, isAuthorized }` |

## Types

```typescript
type UserRole = 'customer' | 'jockey' | 'workshop';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginCredentials {
  username: string;
  password: string;
}
```

## Components

- `<ProtectedRoute requiredRole="customer">` - Protect routes
- `<LogoutButton variant="outline" size="sm" />` - Logout button

## API Endpoints

- `POST /api/auth/customer/magic-link` - Request magic link
- `GET /api/auth/customer/verify?token=...` - Verify magic link
- `POST /api/auth/jockey/login` - Jockey login
- `POST /api/auth/workshop/login` - Workshop login
- `GET /api/auth/me` - Get current user

## Token Storage

Tokens are stored in `localStorage` under key `auth_token`:

```typescript
import { tokenStorage } from '@/lib/auth/token-storage';

tokenStorage.getToken();
tokenStorage.setToken('token');
tokenStorage.removeToken();
tokenStorage.hasToken();
```
