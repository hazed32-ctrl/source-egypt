import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

const RouteLoadingHandler = () => {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();
  const isFirstLoad = useRef(true);
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    // Handle initial page load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      
      // Wait for page to fully load
      const handleLoad = () => {
        setTimeout(() => {
          stopLoading();
        }, 500);
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, [stopLoading]);

  useEffect(() => {
    // Handle route changes (not initial load)
    if (prevPathname.current !== location.pathname && !isFirstLoad.current) {
      startLoading();
      
      // Stop loading after content renders
      const timer = setTimeout(() => {
        stopLoading();
      }, 400);

      prevPathname.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname, startLoading, stopLoading]);

  return null;
};

export default RouteLoadingHandler;
