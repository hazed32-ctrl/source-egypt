import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronRight,
  Globe,
  User,
  LogOut,
  ArrowLeftRight,
  Phone,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { NavigationItem, NavigationCTA } from '@/hooks/useNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import sourceLogo from '@/assets/logo-b-secondary.svg';
import DynamicIcon from './DynamicIcon';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  cta: NavigationCTA | null;
  getLabel: (item: { label_en: string; label_ar: string }) => string;
}

export const MobileDrawer = ({ isOpen, onClose, items, cta, getLabel }: MobileDrawerProps) => {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, signOut, isAuthenticated } = useApiAuth();
  const { isAdmin } = useUserRole();
  const { ids: compareIds } = useCompare();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
      onClose();
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const portalPath = isAdmin ? '/admin/dashboard' : '/client-portal/dashboard';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 bottom-0 w-[85%] max-w-[360px] bg-background z-50 overflow-y-auto",
              isRTL ? "left-0" : "right-0"
            )}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/30 bg-background">
              <img src={sourceLogo} alt="Source" className="h-8 w-auto" />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-3 border-b border-border/30">

              {/* Auth Button */}
              {isAuthenticated && user ? (
                <Link to={portalPath} onClick={onClose}>
                  <Button variant="outline" className="w-full border-border/50">
                    <User className="w-4 h-4 mr-2" />
                    {isAdmin ? 'Admin Dashboard' : 'My Portal'}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={onClose}>
                  <Button variant="outline" className="w-full border-border/50">
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.login')}
                  </Button>
                </Link>
              )}

              {/* Compare Button */}
              <Link to="/compare" onClick={onClose}>
                <Button variant="outline" className="w-full border-border/50 relative">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {t('property.compare')}
                  {compareIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {compareIds.length}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              <ul className="space-y-1">
                {items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems.has(item.id);

                  return (
                    <li key={item.id}>
                      {hasChildren ? (
                        <>
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 rounded-lg",
                              "text-foreground hover:bg-secondary/50 transition-colors",
                              "focus:outline-none focus:ring-2 focus:ring-primary/50"
                            )}
                            aria-expanded={isExpanded}
                          >
                            <span className="flex items-center gap-3">
                              <DynamicIcon name={item.icon} className="w-5 h-5 text-muted-foreground" />
                              <span className="font-medium">{getLabel(item)}</span>
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-muted-foreground transition-transform duration-200",
                                isExpanded ? "rotate-180" : ""
                              )}
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className={cn("py-2 space-y-1", isRTL ? "pr-8" : "pl-8")}>
                                  {item.children?.map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        to={child.url || '#'}
                                        onClick={onClose}
                                        className={cn(
                                          "flex items-center gap-3 px-4 py-2.5 rounded-lg",
                                          "text-muted-foreground hover:text-foreground hover:bg-secondary/30",
                                          "transition-colors"
                                        )}
                                      >
                                        <ChevronRight className={cn("w-4 h-4", isRTL ? "rotate-180" : "")} />
                                        <span>{getLabel(child)}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </div>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={item.url || '#'}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg",
                            "text-foreground hover:bg-secondary/50 transition-colors"
                          )}
                        >
                          <DynamicIcon name={item.icon} className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{getLabel(item)}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="sticky bottom-0 p-4 border-t border-border/30 bg-background space-y-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className={cn("flex-1", language === 'en' ? 'btn-gold' : 'border-border/50')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  English
                </Button>
                <Button
                  variant={language === 'ar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('ar')}
                  className={cn("flex-1", language === 'ar' ? 'btn-gold' : 'border-border/50')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  العربية
                </Button>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full border-border/50 gap-2"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Button>

              {/* Sign Out */}
              {isAuthenticated && user && (
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
