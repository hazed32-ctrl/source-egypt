import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'compare_properties';
const MAX_COMPARE_ITEMS = 2;

export interface CompareStore {
  ids: string[];
  add: (id: string) => 'added' | 'duplicate' | 'limit_reached';
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  replaceOldest: (newId: string) => void;
  isFull: boolean;
}

export const useCompareStore = (): CompareStore => {
  const [ids, setIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      console.warn('Failed to persist compare selection');
    }
  }, [ids]);

  const add = useCallback((id: string): 'added' | 'duplicate' | 'limit_reached' => {
    if (ids.includes(id)) {
      return 'duplicate';
    }
    if (ids.length >= MAX_COMPARE_ITEMS) {
      return 'limit_reached';
    }
    setIds(prev => [...prev, id]);
    return 'added';
  }, [ids]);

  const remove = useCallback((id: string) => {
    setIds(prev => prev.filter(existingId => existingId !== id));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return ids.includes(id);
  }, [ids]);

  const replaceOldest = useCallback((newId: string) => {
    if (ids.includes(newId)) return;
    setIds(prev => {
      const [, ...rest] = prev;
      return [...rest, newId];
    });
  }, [ids]);

  return {
    ids,
    add,
    remove,
    clear,
    isSelected,
    replaceOldest,
    isFull: ids.length >= MAX_COMPARE_ITEMS,
  };
};

export { MAX_COMPARE_ITEMS };
