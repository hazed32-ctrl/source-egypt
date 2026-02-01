/**
 * Infinite Scroll Hook
 * Uses IntersectionObserver for performant loading
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{
    data: T[];
    hasNextPage: boolean;
    total: number;
  }>;
  initialPage?: number;
  enabled?: boolean;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  total: number;
  sentinelRef: (node: HTMLElement | null) => void;
  reset: () => void;
  loadMore: () => void;
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialPage = 1,
  enabled = true,
  rootMargin = '200px',
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<HTMLElement | null>(null);
  const isFetchingRef = useRef(false);
  const fetchIdRef = useRef(0);

  // Fetch data for a specific page
  const fetchPage = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    const currentFetchId = ++fetchIdRef.current;
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingNextPage(true);
    }
    
    setError(null);

    try {
      const result = await fetchFn(pageNum);
      
      // Prevent race conditions
      if (currentFetchId !== fetchIdRef.current) return;

      setData((prev) => isInitial ? result.data : [...prev, ...result.data]);
      setHasNextPage(result.hasNextPage);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      if (currentFetchId !== fetchIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
        setIsFetchingNextPage(false);
        isFetchingRef.current = false;
      }
    }
  }, [fetchFn]);

  // Reset and refetch
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasNextPage(true);
    setError(null);
    isFetchingRef.current = false;
    fetchIdRef.current++;
    fetchPage(initialPage, true);
  }, [initialPage, fetchPage]);

  // Manual load more
  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingRef.current) return;
    fetchPage(page + 1, false);
  }, [hasNextPage, page, fetchPage]);

  // Sentinel ref callback
  const sentinelRef = useCallback((node: HTMLElement | null) => {
    sentinelNodeRef.current = node;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node || !enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingRef.current) {
          fetchPage(page + 1, false);
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observerRef.current.observe(node);
  }, [enabled, hasNextPage, page, rootMargin, fetchPage]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchPage(initialPage, true);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    total,
    sentinelRef,
    reset,
    loadMore,
  };
}

export default useInfiniteScroll;
