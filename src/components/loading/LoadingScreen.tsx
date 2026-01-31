import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sourceLogo from '@/assets/source-logo.svg';

interface LoadingScreenProps {
  isLoading: boolean;
  minDuration?: number;
}

const LoadingScreen = ({ isLoading, minDuration = 800 }: LoadingScreenProps) => {
  const [showLoader, setShowLoader] = useState(isLoading);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowLoader(true);
    } else {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDuration - elapsed);
      
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDuration]);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          role="progressbar"
          aria-busy="true"
          aria-label="Loading"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121218] to-[#0a0a0a]" />
          
          {/* Subtle gold ambient glow */}
          <motion.div
            animate={{ 
              opacity: prefersReducedMotion ? 0.1 : [0.08, 0.15, 0.08],
              scale: prefersReducedMotion ? 1 : [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]"
          />

          {/* Main logo container */}
          <div className="relative z-10 flex flex-col items-center">
            <div 
              className="relative"
              style={{ 
                width: 'clamp(120px, 25vw, 200px)', 
                height: 'clamp(120px, 25vw, 200px)' 
              }}
            >
              <AnimatedLogo prefersReducedMotion={prefersReducedMotion} />
            </div>

            {/* Subtle loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 w-24 h-[2px] bg-border/30 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  repeatType: 'loop'
                }}
                className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </motion.div>
          </div>

          {/* Subtle particle dust effect */}
          {!prefersReducedMotion && <ParticleDust />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated logo with CSS 3D transforms
const AnimatedLogo = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full h-full flex items-center justify-center"
    style={{ perspective: '1000px' }}
  >
    <motion.img
      src={sourceLogo}
      alt="Source"
      className="w-full h-auto relative z-10"
      animate={prefersReducedMotion ? {} : { 
        rotateY: [0, 15, 0, -15, 0],
        rotateX: [0, 5, 0, -5, 0],
        scale: [1, 1.02, 1]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
      style={{ transformStyle: 'preserve-3d' }}
    />
  </motion.div>
);

// Subtle floating particles
const ParticleDust = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingScreen;
