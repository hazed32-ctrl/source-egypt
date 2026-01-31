import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import sourceLogo from '@/assets/source-logo.svg';

interface CompareReplaceModalProps {
  open: boolean;
  onClose: () => void;
  newPropertyId: string;
}

const CompareReplaceModal = ({ open, onClose, newPropertyId }: CompareReplaceModalProps) => {
  const { replaceOldest } = useCompare();

  const handleReplace = () => {
    replaceOldest(newPropertyId);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="relative glass-card border border-border/30 p-8 shadow-2xl overflow-hidden">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={sourceLogo}
                  alt=""
                  className="w-[300px] h-[300px] opacity-[0.03] blur-[1px]"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  Compare Limit Reached
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                  Compare is limited to 2 properties. Would you like to replace the first selection with this property?
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 border-border/50 hover:border-primary/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReplace}
                    className="flex-1 h-12 btn-gold gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replace Oldest
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareReplaceModal;
