import { useState, useEffect, useCallback } from 'react';

interface UseLoadingScreenOptions {
  /** Minimum display time in ms (default: 1200) */
  minDuration?: number;
  /** Whether to show on initial mount (default: true) */
  showOnMount?: boolean;
}

export const useLoadingScreen = ({
  minDuration = 1200,
  showOnMount = true,
}: UseLoadingScreenOptions = {}) => {
  const [isLoading, setIsLoading] = useState(showOnMount);
  const [canHide, setCanHide] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setCanHide(true), minDuration);
    return () => clearTimeout(timer);
  }, [isLoading, minDuration]);

  useEffect(() => {
    if (!isLoading || !canHide) return;
    // Content is ready and min duration passed
    setIsLoading(false);
    setCanHide(false);
  }, [canHide, isLoading]);

  const show = useCallback(() => {
    setIsLoading(true);
    setCanHide(false);
  }, []);

  const hide = useCallback(() => {
    setCanHide(true);
  }, []);

  return { isLoading, show, hide };
};
