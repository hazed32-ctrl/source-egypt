import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  sort_order: number;
}

const RecommendationsWidget = () => {
  const { user } = useApiAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('recommendations')
        .select('id, title, description, image_url, link, sort_order')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setRecommendations(data || []);
      setIsLoading(false);
    };
    fetch();
  }, [user]);

  // Auto-rotate
  useEffect(() => {
    if (recommendations.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % recommendations.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recommendations.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % recommendations.length);
    }, 4000);
  };

  const prev = () => goTo(activeIndex > 0 ? activeIndex - 1 : recommendations.length - 1);
  const next = () => goTo((activeIndex + 1) % recommendations.length);

  const handleClick = (rec: Recommendation) => {
    if (!rec.link) return;
    if (rec.link.startsWith('http')) {
      window.open(rec.link, '_blank', 'noopener');
    } else {
      navigate(rec.link);
    }
  };

  if (isLoading || recommendations.length === 0) return null;

  const activeRec = recommendations[activeIndex];

  // Calculate orbit positions for the indicator dots
  const totalDots = recommendations.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="mt-6"
    >
      <div className="glass-card p-6 border border-border/20 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recommendations
            </h2>
          </div>
          {recommendations.length > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground" onClick={prev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground" onClick={next}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Orbital Card Area */}
        <div className="relative min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRec.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className={cn(
                "flex gap-4 p-4 rounded-xl cursor-pointer",
                "bg-gradient-to-br from-secondary/50 to-secondary/20",
                "border border-border/20 hover:border-primary/30",
                "transition-colors duration-200",
              )}
              onClick={() => handleClick(activeRec)}
            >
              {activeRec.image_url ? (
                <img
                  src={activeRec.image_url}
                  alt=""
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-2">
                  {activeRec.title}
                </h3>
                {activeRec.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {activeRec.description}
                  </p>
                )}
                {activeRec.link && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                    <ExternalLink className="w-3 h-3" />
                    View Details
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Orbit-style dots */}
        {recommendations.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {recommendations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  idx === activeIndex
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to recommendation ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecommendationsWidget;
