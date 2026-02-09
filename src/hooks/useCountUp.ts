import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration = 1500, start = 0, enabled = true) {
  const [value, setValue] = useState(start);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, start, enabled]);

  return value;
}
