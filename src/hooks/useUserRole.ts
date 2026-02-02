import { useApiAuth } from '@/contexts/ApiAuthContext';

// Extended role types including sales roles
type AppRole = 'super_admin' | 'admin' | 'agent' | 'sales_agent' | 'sales_manager' | 'marketer' | 'client' | null;

export const useUserRole = () => {
  const { user, isLoading } = useApiAuth();

  const role = ((user as unknown as { role?: AppRole })?.role ?? null) as AppRole;

  return {
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSalesAgent: role === 'sales_agent',
    isSalesManager: role === 'sales_manager',
    isMarketer: role === 'marketer',
    isClient: role === 'client',
    canViewLeads: role === 'admin' || role === 'super_admin' || role === 'sales_agent' || role === 'sales_manager' || role === 'marketer',
    canAssignLeads: role === 'admin' || role === 'super_admin' || role === 'sales_manager',
    isLoading,
  };
};
