import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  RefreshCw, 
  LogOut,
  Settings,
  Users,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import sourceLogo from '@/assets/source-logo.svg';

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
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
  { path: '/admin/documents', label: 'Documents', icon: FileText },
  { path: '/admin/resale', label: 'Resale Requests', icon: RefreshCw },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const PortalLayout = ({ children, title, subtitle }: PortalLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth', { replace: true });
  };

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
          className="w-[600px] h-[600px] opacity-[0.015] blur-[1px]"
        />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card border-0 border-b border-border/20 rounded-none">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src={sourceLogo} alt="Source" className="h-10 w-auto" />
              </Link>

              <div className="flex items-center gap-6">
                {/* Role Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {isAdmin ? 'Administrator' : 'Client'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 flex">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 p-4 z-40">
          <nav className="glass-card h-full p-4 border border-border/20">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          {(title || subtitle) && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title && (
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
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
