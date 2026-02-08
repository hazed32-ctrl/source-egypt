import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sourceLogo from '@/assets/source-logo.svg';

interface LoadingScreenProps {
  isVisible: boolean;
}

// Deterministic particle config
const PARTICLE_COUNT = 12;

const LoadingScreen = ({ isVisible }: LoadingScreenProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Generate particles once
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.25,
      })),
    []
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          role="status"
          aria-busy="true"
          aria-label="Loading"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-loading-gradient" />

          {/* Ambient gold glow orbs */}
          {!prefersReducedMotion && (
            <>
              <div className="loading-orb loading-orb-1" />
              <div className="loading-orb loading-orb-2" />
            </>
          )}

          {/* Watermark logo (blurred, behind) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={sourceLogo}
              alt=""
              aria-hidden="true"
              className="w-[60vmin] h-[60vmin] max-w-[500px] max-h-[500px] object-contain opacity-[0.03] blur-[30px]"
            />
          </div>

          {/* Floating particles */}
          {!prefersReducedMotion &&
            particles.map((p) => (
              <div
                key={p.id}
                className="loading-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}

          {/* Center content */}
          <div className="relative flex flex-col items-center gap-8">
            {/* 3D Logo Container */}
            <div
              className={`loading-logo-stage ${prefersReducedMotion ? '' : 'loading-logo-animated'}`}
              style={{ perspective: '800px' }}
            >
              <div className={`loading-logo-wrapper ${prefersReducedMotion ? '' : 'loading-3d-rotate'}`}>
                {/* Gold rim glow */}
                <div className="loading-logo-glow" />

                {/* Logo */}
                <img
                  src={sourceLogo}
                  alt="Source EG"
                  className="loading-logo-img"
                />
              </div>
            </div>

            {/* Animated progress line */}
            {!prefersReducedMotion && (
              <div className="loading-progress-track">
                <div className="loading-progress-fill" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
