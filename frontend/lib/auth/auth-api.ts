import { apiClient } from '../api/client';
import type {
  AuthResponse,
  LoginCredentials,
  User,
  UserRole,
} from './types';

// Normalize user role from backend (UPPERCASE) to frontend (lowercase)
function normalizeUser(user: any): User {
  return {
    ...user,
    role: user.role?.toLowerCase() as UserRole
  };
}

// Normalize auth response from backend format to frontend format
// Backend returns: { success: true, token: "...", user: {...} }
// Frontend expects: { token: "...", user: {...} }
function normalizeAuthResponse(backendResponse: any): AuthResponse {
  // Backend wraps in a success object
  const response = backendResponse.success ? backendResponse : { user: backendResponse.user, token: backendResponse.token };

  return {
    token: response.token,
    user: normalizeUser(response.user)
  };
}

export const authApi = {
  // Customer Login
  loginCustomer: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/api/auth/customer/login', {
      email: credentials.username,
      password: credentials.password,
    });
    return normalizeAuthResponse(response);
  },

  // Jockey Login
  loginJockey: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/api/auth/jockey/login', credentials);
    return normalizeAuthResponse(response);
  },

  // Workshop Login
  loginWorkshop: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/api/auth/workshop/login', credentials);
    return normalizeAuthResponse(response);
  },

  // Get Current User
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<any>('/api/auth/me');
    // Backend returns: { success: true, user: {...} }
    // Extract the nested user object before normalizing
    const user = response.success ? response.user : response;
    return normalizeUser(user);
  },

  // Generic login for any role
  login: async (
    role: UserRole,
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    switch (role) {
      case 'customer':
        return authApi.loginCustomer(credentials);
      case 'jockey':
        return authApi.loginJockey(credentials);
      case 'workshop':
        return authApi.loginWorkshop(credentials);
      default:
        throw new Error('Invalid role');
    }
  },
};
