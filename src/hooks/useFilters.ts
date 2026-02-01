/**
 * URL-synced Filters Hook
 * Manages filter state with URL search params
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyFilters } from '@/lib/api/types';

type FilterValue = string | number | string[] | undefined;

interface UseFiltersReturn {
  filters: PropertyFilters;
  setFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  setFilters: (newFilters: Partial<PropertyFilters>) => void;
  removeFilter: (key: keyof PropertyFilters) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

const FILTER_KEYS: (keyof PropertyFilters)[] = [
  'search',
  'city',
  'area',
  'minPrice',
  'maxPrice',
  'bedrooms',
  'bathrooms',
  'minArea',
  'maxArea',
  'finishing',
  'tags',
  'status',
  'sortBy',
  'page',
  'limit',
];

const DEFAULT_LIMIT = 12;

export function useFilters(): UseFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const parseFilters = useCallback((): PropertyFilters => {
    const filters: PropertyFilters = {};

    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value === null) return;

      switch (key) {
        case 'minPrice':
        case 'maxPrice':
        case 'bedrooms':
        case 'bathrooms':
        case 'minArea':
        case 'maxArea':
        case 'page':
        case 'limit':
          const num = parseInt(value, 10);
          if (!isNaN(num)) {
            (filters as any)[key] = num;
          }
          break;
        case 'tags':
          filters.tags = value.split(',').filter(Boolean);
          break;
        case 'sortBy':
          if (['price_asc', 'price_desc', 'newest', 'area_asc', 'area_desc'].includes(value)) {
            filters.sortBy = value as PropertyFilters['sortBy'];
          }
          break;
        case 'finishing':
          if (['core_shell', 'semi_finished', 'fully_finished', 'furnished'].includes(value)) {
            filters.finishing = value as PropertyFilters['finishing'];
          }
          break;
        case 'status':
          if (['draft', 'pending_approval', 'published', 'archived'].includes(value)) {
            filters.status = value as PropertyFilters['status'];
          }
          break;
        default:
          (filters as any)[key] = value;
      }
    });

    // Ensure defaults
    if (!filters.page) filters.page = 1;
    if (!filters.limit) filters.limit = DEFAULT_LIMIT;

    return filters;
  }, [searchParams]);

  const filters = useMemo(() => parseFilters(), [parseFilters]);

  // Set a single filter
  const setFilter = useCallback(<K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K]
  ) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      if (value === undefined || value === null || value === '') {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          newParams.set(key, value.join(','));
        } else {
          newParams.delete(key);
        }
      } else {
        newParams.set(key, String(value));
      }

      // Reset page when changing other filters
      if (key !== 'page') {
        newParams.set('page', '1');
      }

      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Set multiple filters
  const setFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            newParams.set(key, value.join(','));
          } else {
            newParams.delete(key);
          }
        } else {
          newParams.set(key, String(value));
        }
      });

      // Reset page when changing filters (unless page is being set)
      if (!('page' in newFilters)) {
        newParams.set('page', '1');
      }

      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Remove a filter
  const removeFilter = useCallback((key: keyof PropertyFilters) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(key);
      newParams.set('page', '1');
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Count active filters (excluding pagination and sorting)
  const activeFilterCount = useMemo(() => {
    const excludedKeys: (keyof PropertyFilters)[] = ['page', 'limit', 'sortBy'];
    return Object.entries(filters).filter(([key, value]) => {
      if (excludedKeys.includes(key as keyof PropertyFilters)) return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}

export default useFilters;
