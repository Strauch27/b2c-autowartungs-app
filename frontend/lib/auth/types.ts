export type UserRole = 'customer' | 'jockey' | 'workshop';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType extends AuthState {
  login: (role: UserRole, credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
