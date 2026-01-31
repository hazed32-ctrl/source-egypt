import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const useRouteLoading = () => {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    // Start loading on route change
    startLoading();

    // Stop loading after a brief delay to allow content to render
    const timer = setTimeout(() => {
      stopLoading();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, startLoading, stopLoading]);
};

// Hook for data fetching with loading state
export const useDataLoading = () => {
  const { startLoading, stopLoading, setLoading } = useLoading();

  const withLoading = async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return { withLoading, startLoading, stopLoading, setLoading };
};
