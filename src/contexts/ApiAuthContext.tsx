/**
 * API Auth Context
 * JWT-based authentication with external backend support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  UserRole,
  JWTPayload,
  IS_MOCK_MODE,
  tokenManager,
  mockAuth,
  decodeMockToken,
} from '@/lib/api';
import { post, get } from '@/lib/api/client';

interface ApiAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isClient: boolean;
}

const ApiAuthContext = createContext<ApiAuthContextType | undefined>(undefined);

export const ApiAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decode JWT and extract claims
  const decodeToken = useCallback((token: string): JWTPayload | null => {
    if (IS_MOCK_MODE) {
      return decodeMockToken(token);
    }
    
    try {
      // Decode JWT (assuming standard JWT format)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload as JWTPayload;
    } catch {
      return null;
    }
  }, []);

  // Check token expiration
  const isTokenExpired = useCallback((token: string): boolean => {
    const payload = decodeToken(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
  }, [decodeToken]);

  // Fetch current user from API or token
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = tokenManager.getAccessToken();
    if (!token || isTokenExpired(token)) {
      tokenManager.clearTokens();
      return null;
    }

    try {
      if (IS_MOCK_MODE) {
        const result = await mockAuth.getCurrentUser();
        return result;
      }
      
      const user = await get<User>('/auth/me');
      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      tokenManager.clearTokens();
      return null;
    }
  }, [isTokenExpired]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  // Sign in
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      if (IS_MOCK_MODE) {
        const response = await mockAuth.login(email, password);
        tokenManager.setTokens(response.tokens);
        setUser(response.user);
        return { error: null };
      }

      const response = await post<{ user: User; tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>(
        '/auth/login',
        { email, password }
      );
      tokenManager.setTokens(response.tokens);
      setUser(response.user);
      return { error: null };
    } catch (err: unknown) {
      const error = err as { error?: { message?: string } };
      return { error: new Error(error?.error?.message || 'Login failed') };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      if (IS_MOCK_MODE) {
        await mockAuth.logout();
      } else {
        await post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    // In a real app, this would call the API
    // For now, just update local state
    setUser({ ...user, ...data });
  };

  // Role checking
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Admin has most permissions except super_admin
    if (user.role === 'admin' && !roles.includes('super_admin')) return true;
    
    return roles.includes(user.role);
  };

  const value: ApiAuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role || null,
    signIn,
    signOut,
    updateProfile,
    hasRole,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isAgent: user?.role === 'agent',
    isClient: user?.role === 'client',
  };

  return (
    <ApiAuthContext.Provider value={value}>
      {children}
    </ApiAuthContext.Provider>
  );
};

export const useApiAuth = (): ApiAuthContextType => {
  const context = useContext(ApiAuthContext);
  if (!context) {
    throw new Error('useApiAuth must be used within an ApiAuthProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useAuth = useApiAuth;
