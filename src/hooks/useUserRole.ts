import { useApiAuth } from '@/contexts/ApiAuthContext';

// Kept intentionally permissive to align with the API/JWT auth system.
// (We avoid coupling to the legacy DB role table to prevent auth-context mismatches.)
type AppRole = 'super_admin' | 'admin' | 'agent' | 'sales_agent' | 'client' | null;

export const useUserRole = () => {
  const { user, isLoading } = useApiAuth();

  const role = ((user as unknown as { role?: AppRole })?.role ?? null) as AppRole;

  return {
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
    isClient: role === 'client',
    isLoading,
  };
};
