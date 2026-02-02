/**
 * Analytics Utility Functions
 */

import type { DeviceType, UTMParams } from './types';

// Generate or retrieve session ID
export function getSessionId(): string {
  const key = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

// Detect device type
export function getDeviceType(): DeviceType {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Extract UTM parameters from URL
export function extractUTMParams(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  
  const utmParams: UTMParams = {};
  
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const utm_term = params.get('utm_term');
  const utm_content = params.get('utm_content');
  
  if (utm_source) utmParams.utm_source = utm_source;
  if (utm_medium) utmParams.utm_medium = utm_medium;
  if (utm_campaign) utmParams.utm_campaign = utm_campaign;
  if (utm_term) utmParams.utm_term = utm_term;
  if (utm_content) utmParams.utm_content = utm_content;
  
  return utmParams;
}

// Persist UTM params for the session
export function persistUTMParams(): void {
  const key = 'analytics_utm_params';
  const existingParams = sessionStorage.getItem(key);
  
  // Only set if not already present (first touch attribution)
  if (!existingParams) {
    const utmParams = extractUTMParams();
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem(key, JSON.stringify(utmParams));
    }
  }
}

// Get persisted UTM params
export function getPersistedUTMParams(): UTMParams {
  const key = 'analytics_utm_params';
  const params = sessionStorage.getItem(key);
  return params ? JSON.parse(params) : {};
}

// Check if route should be excluded from tracking
export function shouldExcludeRoute(pathname: string, exclusions: string[]): boolean {
  return exclusions.some(pattern => {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
    );
    return regex.test(pathname);
  });
}

// Debounce function for event tracking
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Get consent state from localStorage
export function getConsentState(): { analytics: boolean; marketing: boolean } {
  const consent = localStorage.getItem('cookie_consent');
  if (!consent) return { analytics: false, marketing: false };
  
  try {
    const parsed = JSON.parse(consent);
    return {
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
    };
  } catch {
    // Simple boolean consent (react-cookie-consent default)
    return { analytics: consent === 'true', marketing: consent === 'true' };
  }
}

// Check if tracking is allowed
export function isTrackingAllowed(): boolean {
  const consent = getConsentState();
  return consent.analytics;
}
