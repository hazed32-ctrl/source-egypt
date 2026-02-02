/**
 * useAnalytics Hook
 * Easy access to analytics tracking in components
 */

import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export const useAnalytics = () => {
  const trackPropertyView = useCallback((
    propertyId: string,
    propertyTitle?: string,
    price?: number
  ) => {
    analytics.trackPropertyView(propertyId, propertyTitle, price);
  }, []);

  const trackSearch = useCallback((
    query: string,
    filters?: Record<string, unknown>,
    resultsCount?: number
  ) => {
    analytics.trackSearch(query, filters, resultsCount);
  }, []);

  const trackFilterApply = useCallback((filters: Record<string, unknown>) => {
    analytics.trackFilterApply(filters);
  }, []);

  const trackCompareAdd = useCallback((propertyId: string, propertyTitle?: string) => {
    analytics.trackCompareAdd(propertyId, propertyTitle);
  }, []);

  const trackCompareRemove = useCallback((propertyId: string) => {
    analytics.trackCompareRemove(propertyId);
  }, []);

  const trackLeadSubmit = useCallback((
    source: string,
    propertyId?: string,
    formType?: string
  ) => {
    analytics.trackLeadSubmit(source, propertyId, formType);
  }, []);

  const trackWhatsAppClick = useCallback((destination?: string, context?: string) => {
    analytics.trackWhatsAppClick(destination, context);
  }, []);

  const trackPhoneClick = useCallback((destination?: string, context?: string) => {
    analytics.trackPhoneClick(destination, context);
  }, []);

  const trackCTAClick = useCallback((buttonText: string, buttonLocation: string) => {
    analytics.trackCTAClick(buttonText, buttonLocation);
  }, []);

  const trackPropertyFinderStart = useCallback(() => {
    analytics.trackPropertyFinderStart();
  }, []);

  const trackPropertyFinderStep = useCallback((step: number, stepName: string) => {
    analytics.trackPropertyFinderStep(step, stepName);
  }, []);

  const trackPropertyFinderComplete = useCallback((preferences: Record<string, unknown>) => {
    analytics.trackPropertyFinderComplete(preferences);
  }, []);

  return {
    trackPropertyView,
    trackSearch,
    trackFilterApply,
    trackCompareAdd,
    trackCompareRemove,
    trackLeadSubmit,
    trackWhatsAppClick,
    trackPhoneClick,
    trackCTAClick,
    trackPropertyFinderStart,
    trackPropertyFinderStep,
    trackPropertyFinderComplete,
  };
};

export default useAnalytics;
