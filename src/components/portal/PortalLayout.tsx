import { ReactNode, useState } from 'react';
import NotificationBell from '@/components/portal/NotificationBell';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  RefreshCw, 
  LogOut,
  Settings,
  Users,
  ChevronRight,
  Package,
  MessageSquare,
  Layers,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { UserRole } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import sourceLogo from '@/assets/source-logo.svg';

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  role?: 'admin' | 'client' | 'agent';
}

const clientNavItems = [
  { path: '/client-portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/client-portal/assets', label: 'My Assets', icon: Building2 },
  { path: '/client-portal/documents', label: 'Documents', icon: FileText },
  { path: '/client-portal/resale', label: 'Resale Request', icon: RefreshCw },
];

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Manage Users', icon: Users },
  { path: '/admin/properties', label: 'Properties', icon: Building2 },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { path: '/admin/documents', label: 'Documents', icon: FileText },
  { path: '/admin/resale', label: 'Resale Requests', icon: RefreshCw },
  { path: '/admin/cms', label: 'CMS', icon: Layers },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const agentNavItems = [
  { path: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agent/properties', label: 'My Listings', icon: Building2 },
  { path: '/client-portal/assets', label: 'Profile', icon: UserCircle },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  agent: 'Agent',
  sales_agent: 'Sales Agent',
  client: 'Client',
};

const PortalLayout = ({ children, title, subtitle, role }: PortalLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, isAdmin, isAgent } = useApiAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine nav items based on role prop or user's actual role
  const getNavItems = () => {
    if (role === 'admin' || (!role && isAdmin)) return adminNavItems;
    if (role === 'agent' || (!role && isAgent)) return agentNavItems;
    return clientNavItems;
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth', { replace: true });
  };

  const displayRole = user?.role ? roleLabels[user.role] : 'User';

  const NavContent = () => (
    <ul className="space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-primary" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[200px]"
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[150px]"
        />
      </div>

      {/* Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={sourceLogo}
          alt=""
          className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-[0.015] blur-[1px]"
        />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card border-0 border-b border-border/20 rounded-none">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link to="/" className="flex items-center gap-3">
                <img src={sourceLogo} alt="Source" className="h-8 md:h-10 w-auto" />
              </Link>

              <div className="flex items-center gap-2 md:gap-6">
                {/* Notification Bell (all authenticated users) */}
                {user && <NotificationBell />}
                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-foreground">
                        {user.fullName || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {/* Role Badge */}
                    <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {displayRole}
                    </span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 p-4 pt-20 z-50 lg:hidden"
            >
              <nav className="glass-card h-full p-4 border border-border/20 overflow-y-auto">
                <NavContent />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="pt-16 md:pt-20 flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 p-4 z-40 hidden lg:block">
          <nav className="glass-card h-full p-4 border border-border/20 overflow-y-auto">
            <NavContent />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-6">
          {(title || subtitle) && (
            <motion.div 
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title && (
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>
              )}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
