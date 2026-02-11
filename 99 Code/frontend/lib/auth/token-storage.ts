const TOKEN_PREFIX = 'auth_token';
const VALID_ROLES = ['customer', 'jockey', 'workshop'];

/**
 * Detect the portal role from the current URL path.
 * URL pattern: /[locale]/[role]/...
 * e.g. /en/jockey/dashboard → 'jockey'
 */
function getRoleFromPath(): string | null {
  if (typeof window === 'undefined') return null;
  const parts = window.location.pathname.split('/');
  // parts[0]='', parts[1]=locale, parts[2]=role
  const role = parts[2]?.toLowerCase();
  return role && VALID_ROLES.includes(role) ? role : null;
}

function getTokenKey(role?: string): string {
  const resolvedRole = role || getRoleFromPath();
  return resolvedRole ? `${TOKEN_PREFIX}_${resolvedRole}` : TOKEN_PREFIX;
}

export const tokenStorage = {
  getToken: (role?: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getTokenKey(role));
  },

  setToken: (token: string, role?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getTokenKey(role), token);
  },

  removeToken: (role?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getTokenKey(role));
  },

  hasToken: (role?: string): boolean => {
    return !!tokenStorage.getToken(role);
  },
};
