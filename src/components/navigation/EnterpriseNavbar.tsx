import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Menu,
  Globe,
  User,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigation, NavigationItem } from '@/hooks/useNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import sourceLogo from '@/assets/logo-a-navbar.svg';
import MegaMenu from './MegaMenu';
import MobileDrawer from './MobileDrawer';
import QuickSearch from './QuickSearch';
import DynamicIcon from './DynamicIcon';

export const EnterpriseNavbar = () => {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, signOut, isLoading: authLoading, isAuthenticated } = useApiAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { ids: compareIds } = useCompare();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { navigation, getLabel, isLoading: navLoading } = useNavigation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenMegaMenu(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = useCallback((itemId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenMegaMenu(itemId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenMegaMenu(null);
    }, 150);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const portalPath = isAdmin ? '/admin/dashboard' : '/client-portal/dashboard';
  const isAuthBusy = authLoading || roleLoading;

  // Fixed navigation items (not CMS-driven)
  const fixedNavItems = [
    { id: 'home', label: t('nav.home'), url: '/' },
    { id: 'properties', label: t('nav.properties'), url: '/properties' },
    { id: 'search', label: t('nav.search'), url: '/find-property' },
    { id: 'contact', label: t('nav.contact'), url: '/contact' },
    { id: 'about', label: t('nav.about'), url: '/about' },
  ];

  const cta = navigation?.cta;

  return (
    <>
      {/* Fixed height placeholder to prevent CLS */}
      <div className="h-[72px] md:h-[88px]" aria-hidden="true" />
      
      <nav
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "py-2"
            : "py-3"
        )}
      >
        <div className={cn(
          "mx-3 md:mx-4 rounded-2xl transition-all duration-300",
          isScrolled
            ? "glass-card shadow-lg"
            : "glass-card"
        )}>
        <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-[56px] md:h-[72px]">
              {/* Left: Logo */}
              <Link to="/" className="flex-shrink-0 py-2 px-3.5">
                <motion.img
                  src={sourceLogo}
                  alt="Source"
                  className="w-auto h-[clamp(38px,5vw,54px)]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>

              {/* Center: Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {fixedNavItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === item.url
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">

                {/* Language Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:flex">
                      <Globe className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="glass-card border-border/50">
                    <DropdownMenuItem
                      onClick={() => setLanguage('en')}
                      className={language === 'en' ? 'text-primary' : ''}
                    >
                      🇺🇸 English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLanguage('ar')}
                      className={language === 'ar' ? 'text-primary' : ''}
                    >
                      🇸🇦 العربية
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hidden sm:flex"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                {/* User Menu */}
                {isAuthBusy ? (
                  <Button variant="ghost" className="gap-2 text-muted-foreground hidden sm:flex" disabled>
                    <User className="w-4 h-4" />
                  </Button>
                ) : isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex">
                        <User className="w-4 h-4" />
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="glass-card border-border/50">
                      <DropdownMenuItem asChild>
                        <Link to={portalPath}>
                          {isAdmin ? t('nav.adminDashboard') : t('nav.myPortal')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <User className="w-4 h-4 mr-2" />
                      {t('nav.login')}
                    </Button>
                  </Link>
                )}


                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-muted-foreground"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={fixedNavItems.map(i => ({ id: i.id, menu_id: '', parent_id: null, label_en: i.label, label_ar: i.label, url: i.url, icon: null, sort_order: 0, is_visible: true, is_mega_menu: false, roles_allowed: [], open_in_new_tab: false } as NavigationItem))}
        cta={cta}
        getLabel={getLabel}
      />
    </>
  );
};

export default EnterpriseNavbar;
