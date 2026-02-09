/**
 * API Auth Context
 * Supabase-based authentication with role support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/api/types';

// Extended user type with role info
interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  role: UserRole;
}

interface ApiAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role from user_roles table
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.warn('No role found for user, defaulting to client');
        return 'client';
      }

      return data.role as UserRole;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'client';
    }
  };

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string): Promise<Partial<User>> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone, email')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return {};
      }

      return {
        fullName: data.full_name || undefined,
        avatarUrl: data.avatar_url || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {};
    }
  };

  // Build user object from Supabase user
  const buildUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    const [role, profile] = await Promise.all([
      fetchUserRole(supabaseUser.id),
      fetchUserProfile(supabaseUser.id),
    ]);

    return {
      id: supabaseUser.id,
      email: profile.email || supabaseUser.email || '',
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      phone: profile.phone,
      role,
    };
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer data fetch to avoid Supabase deadlock
          setTimeout(async () => {
            const builtUser = await buildUser(newSession.user);
            setUser(builtUser);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        const builtUser = await buildUser(existingSession.user);
        setUser(builtUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Update profile
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        phone: data.phone,
      })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    setUser({ ...user, ...data });
  };

  // Role checking
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return roles.includes(user.role);
  };

  const value: ApiAuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role || null,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'sales_agent',
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
