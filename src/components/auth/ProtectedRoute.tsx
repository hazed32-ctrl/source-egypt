import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { UserRole } from '@/lib/api/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth'
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated, hasRole } = useApiAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    // Determine where to redirect based on user's role
    const fallbackPath = user.role === 'client' 
      ? '/client-portal/dashboard'
      : user.role === 'sales_agent'
      ? '/agent/dashboard'
      : '/';
    
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
