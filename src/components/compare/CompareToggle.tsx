import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Check } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { cn } from '@/lib/utils';
import CompareReplaceModal from './CompareReplaceModal';

interface CompareToggleProps {
  propertyId: string;
  className?: string;
  variant?: 'card' | 'details';
}

const CompareToggle = ({ propertyId, className, variant = 'card' }: CompareToggleProps) => {
  const { isSelected, add, remove, isFull } = useCompare();
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const selected = isSelected(propertyId);

  const handleToggle = () => {
    if (selected) {
      remove(propertyId);
      return;
    }

    const result = add(propertyId);
    if (result === 'limit_reached') {
      setShowReplaceModal(true);
    }
  };

  if (variant === 'details') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-center gap-2 w-full h-12 rounded-lg font-medium transition-all duration-200',
            selected
              ? 'bg-primary/20 text-primary border border-primary/50'
              : 'bg-secondary/50 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground',
            className
          )}
        >
          {selected ? (
            <>
              <Check className="w-5 h-5" />
              <span>Added to Compare</span>
            </>
          ) : (
            <>
              <GitCompare className="w-5 h-5" />
              <span>Add to Compare</span>
            </>
          )}
        </motion.button>

        <CompareReplaceModal
          open={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          newPropertyId={propertyId}
        />
      </>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          'w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/50 text-muted-foreground hover:text-primary hover:bg-background/80',
          className
        )}
        title={selected ? 'Remove from compare' : 'Add to compare'}
      >
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="compare"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GitCompare className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <CompareReplaceModal
        open={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        newPropertyId={propertyId}
      />
    </>
  );
};

export default CompareToggle;
