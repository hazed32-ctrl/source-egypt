import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompareStore, MAX_COMPARE_ITEMS } from './useCompareStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCompareStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useCompareStore());
    expect(result.current.ids).toEqual([]);
  });

  it('should add a property id', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      const status = result.current.add('property-1');
      expect(status).toBe('added');
    });
    
    expect(result.current.ids).toEqual(['property-1']);
  });

  it('should prevent duplicate selection', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
    });
    
    act(() => {
      const status = result.current.add('property-1');
      expect(status).toBe('duplicate');
    });
    
    expect(result.current.ids).toEqual(['property-1']);
  });

  it('should limit to MAX_COMPARE_ITEMS (2)', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
      result.current.add('property-2');
    });
    
    act(() => {
      const status = result.current.add('property-3');
      expect(status).toBe('limit_reached');
    });
    
    expect(result.current.ids).toEqual(['property-1', 'property-2']);
    expect(result.current.ids.length).toBe(MAX_COMPARE_ITEMS);
  });

  it('should remove a property id', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
      result.current.add('property-2');
    });
    
    act(() => {
      result.current.remove('property-1');
    });
    
    expect(result.current.ids).toEqual(['property-2']);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
      result.current.add('property-2');
    });
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.ids).toEqual([]);
  });

  it('should correctly check if property is selected', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
    });
    
    expect(result.current.isSelected('property-1')).toBe(true);
    expect(result.current.isSelected('property-2')).toBe(false);
  });

  it('should replace oldest selection', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
      result.current.add('property-2');
    });
    
    act(() => {
      result.current.replaceOldest('property-3');
    });
    
    expect(result.current.ids).toEqual(['property-2', 'property-3']);
    expect(result.current.ids).not.toContain('property-1');
  });

  it('should report isFull correctly', () => {
    const { result } = renderHook(() => useCompareStore());
    
    expect(result.current.isFull).toBe(false);
    
    act(() => {
      result.current.add('property-1');
    });
    expect(result.current.isFull).toBe(false);
    
    act(() => {
      result.current.add('property-2');
    });
    expect(result.current.isFull).toBe(true);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'compare_properties',
      JSON.stringify(['property-1'])
    );
  });

  it('should not add duplicate via replaceOldest', () => {
    const { result } = renderHook(() => useCompareStore());
    
    act(() => {
      result.current.add('property-1');
      result.current.add('property-2');
    });
    
    act(() => {
      result.current.replaceOldest('property-2');
    });
    
    // Should remain unchanged since property-2 already exists
    expect(result.current.ids).toEqual(['property-1', 'property-2']);
  });
});
