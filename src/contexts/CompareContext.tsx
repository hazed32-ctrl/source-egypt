import React, { createContext, useContext, ReactNode } from 'react';
import { useCompareStore, CompareStore } from '@/hooks/useCompareStore';

const CompareContext = createContext<CompareStore | null>(null);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const store = useCompareStore();

  return (
    <CompareContext.Provider value={store}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = (): CompareStore => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
