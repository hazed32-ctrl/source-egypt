import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, Trash2 } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PropertyPreview {
  id: string;
  title: string;
  image_url: string | null;
}

const CompareBar = () => {
  const { ids, remove, clear, isFull } = useCompare();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyPreview[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch property previews when ids change
  useEffect(() => {
    const fetchProperties = async () => {
      if (ids.length === 0) {
        setProperties([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, image_url')
          .in('id', ids);

        if (error) throw error;

        // Validate that all ids still exist
        const validIds = data?.map(p => p.id) || [];
        const invalidIds = ids.filter(id => !validIds.includes(id));
        
        // Remove invalid ids silently
        invalidIds.forEach(id => remove(id));

        setProperties(data || []);
      } catch (error) {
        console.error('Failed to fetch compare properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [ids, remove]);

  const handleCompare = () => {
    if (ids.length === 2) {
      navigate(`/compare?ids=${ids.join(',')}`);
    }
  };

  if (ids.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        {/* Gradient overlay for smooth transition */}
        <div className="absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        
        <div className="glass-card border-t border-border/30 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Counter & Properties */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Counter */}
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-border/30">
                  <GitCompare className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium whitespace-nowrap">
                    {ids.length}/2 selected
                  </span>
                </div>

                {/* Property Thumbnails */}
                <div className="hidden sm:flex items-center gap-3 overflow-x-auto scrollbar-hide">
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2 bg-secondary/30 rounded-lg pr-2 border border-border/20 flex-shrink-0"
                    >
                      <div className="w-12 h-12 rounded-l-lg overflow-hidden flex-shrink-0">
                        <img
                          src={property.image_url || '/placeholder.svg'}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                        {property.title}
                      </span>
                      <button
                        onClick={() => remove(property.id)}
                        className="w-6 h-6 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {/* Clear All */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>

                {/* Compare Button */}
                <Button
                  onClick={handleCompare}
                  disabled={!isFull}
                  className={`btn-gold gap-2 ${!isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span>Compare Now</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareBar;
