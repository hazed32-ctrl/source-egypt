import { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { NavigationItem } from '@/hooks/useNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import DynamicIcon from './DynamicIcon';

interface MegaMenuProps {
  item: NavigationItem;
  isOpen: boolean;
  onClose: () => void;
  getLabel: (item: { label_en: string; label_ar: string }) => string;
}

export const MegaMenu = ({ item, isOpen, onClose, getLabel }: MegaMenuProps) => {
  const { isRTL } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const children = item.children || [];

  if (!children.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[72px] z-40"
            onClick={onClose}
          />
          
          {/* Menu Content */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 z-50 glass-card rounded-xl shadow-xl p-4 min-w-[280px]",
              isRTL ? "right-0" : "left-0"
            )}
            role="menu"
            aria-label={getLabel(item)}
          >
            {/* Menu Header */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border/30">
              <DynamicIcon name={item.icon} className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{getLabel(item)}</span>
            </div>

            {/* Menu Items */}
            <div className="grid gap-1">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={child.url || '#'}
                  target={child.open_in_new_tab ? '_blank' : undefined}
                  rel={child.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    "transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                  role="menuitem"
                >
                  <DynamicIcon name={child.icon} className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="flex-1 text-sm">{getLabel(child)}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-all",
                    isRTL ? "rotate-180" : ""
                  )} />
                </Link>
              ))}
            </div>

            {/* View All Link */}
            {item.url && (
              <div className="pt-3 mt-3 border-t border-border/30">
                <Link
                  to={item.url}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                >
                  <span>
                    {isRTL ? `عرض جميع ${getLabel(item)}` : `View All ${getLabel(item)}`}
                  </span>
                  <ChevronRight className={cn("w-4 h-4", isRTL ? "rotate-180" : "")} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
