/**
 * Analytics Event Tracker
 * Central tracking service with debouncing and consent awareness
 */

import { supabase } from '@/integrations/supabase/client';
import type { AnalyticsEventName, EventPayload } from './types';
import {
  getSessionId,
  getDeviceType,
  getPersistedUTMParams,
  isTrackingAllowed,
  debounce,
} from './utils';

// Track event to Supabase
async function trackToDatabase(
  eventName: AnalyticsEventName,
  eventData: EventPayload = {}
): Promise<void> {
  const utmParams = getPersistedUTMParams();
  
  const { error } = await supabase.from('analytics_events').insert({
    event_name: eventName,
    event_data: eventData,
    session_id: getSessionId(),
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer || null,
    device_type: getDeviceType(),
    language: document.documentElement.lang || 'en',
    ...utmParams,
  });

  if (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Track to external pixels (GA4, Meta, etc.)
function trackToPixels(eventName: string, eventData: EventPayload = {}): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, eventData);
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
    (window as unknown as { fbq: (...args: unknown[]) => void }).fbq('trackCustom', eventName, eventData);
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as unknown as { ttq?: { track: (...args: unknown[]) => void } }).ttq) {
    (window as unknown as { ttq: { track: (...args: unknown[]) => void } }).ttq.track(eventName, eventData);
  }
}

// Main tracking function with consent check
export async function trackEvent(
  eventName: AnalyticsEventName,
  eventData: EventPayload = {}
): Promise<void> {
  // Always track to database (first-party data)
  await trackToDatabase(eventName, eventData);

  // Only track to third-party pixels if consent given
  if (isTrackingAllowed()) {
    trackToPixels(eventName, eventData);
  }
}

// Debounced version for high-frequency events
export const trackEventDebounced = debounce(trackEvent, 300);

// Convenience methods for common events
export const analytics = {
  trackPageView: (pageTitle?: string) =>
    trackEvent('page_view', { page_title: pageTitle || document.title }),

  trackPropertyView: (propertyId: string, propertyTitle?: string, price?: number) =>
    trackEvent('view_property', { property_id: propertyId, property_title: propertyTitle, property_price: price }),

  trackSearch: (query: string, filters?: Record<string, unknown>, resultsCount?: number) =>
    trackEvent('search', { query, filters, results_count: resultsCount }),

  trackFilterApply: (filters: Record<string, unknown>) =>
    trackEvent('filter_apply', { filters }),

  trackCompareAdd: (propertyId: string, propertyTitle?: string) =>
    trackEvent('compare_add', { property_id: propertyId, property_title: propertyTitle }),

  trackCompareRemove: (propertyId: string) =>
    trackEvent('compare_remove', { property_id: propertyId }),

  trackLeadSubmit: (source: string, propertyId?: string, formType?: string) =>
    trackEvent('lead_submit', { lead_source: source, property_id: propertyId, form_type: formType }),

  trackWhatsAppClick: (destination?: string, context?: string) =>
    trackEvent('whatsapp_click', { destination, button_location: context }),

  trackPhoneClick: (destination?: string, context?: string) =>
    trackEvent('phone_click', { destination, button_location: context }),

  trackCTAClick: (buttonText: string, buttonLocation: string) =>
    trackEvent('cta_book_consultation_click', { button_text: buttonText, button_location: buttonLocation }),

  trackScrollDepth: (depthPercent: number) =>
    trackEventDebounced('scroll_depth', { depth_percent: depthPercent }),

  trackPropertyFinderStart: () =>
    trackEvent('property_finder_start', {}),

  trackPropertyFinderStep: (step: number, stepName: string) =>
    trackEvent('property_finder_step', { step, step_name: stepName } as unknown as EventPayload),

  trackPropertyFinderComplete: (preferences: Record<string, unknown>) =>
    trackEvent('property_finder_complete', { preferences } as unknown as EventPayload),
};

export default analytics;
