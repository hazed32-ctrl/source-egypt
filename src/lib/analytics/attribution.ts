/**
 * Lead Attribution Tracker
 * Collects privacy-safe session data for lead attribution
 */

import { supabase } from '@/integrations/supabase/client';
import { getSessionId, getDeviceType, getPersistedUTMParams, getConsentState } from './utils';

// Event types for the session event log
export const SESSION_EVENT_TYPES = {
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  PROPERTY_VIEWED: 'property_viewed',
  COMPARE_USED: 'compare_used',
  WHATSAPP_CLICK: 'whatsapp_click',
  PHONE_CLICK: 'phone_click',
  CALCULATOR_USED: 'calculator_used',
  LEAD_POPUP_SHOWN: 'lead_popup_shown',
  PROJECT_VIEWED: 'project_viewed',
} as const;

export type SessionEventType = typeof SESSION_EVENT_TYPES[keyof typeof SESSION_EVENT_TYPES];

// Session event structure (minimal, privacy-safe)
interface SessionEvent {
  event_name: string;
  page_path: string;
  entity_id?: string;
  meta?: Record<string, unknown>;
  ts: number;
}

// In-memory event buffer (last 10 events)
let eventBuffer: SessionEvent[] = [];
let landingPage: string | null = null;
let lastPage: string | null = null;

// Track landing page on first load
export function initAttribution() {
  if (!landingPage) {
    landingPage = window.location.pathname;
  }
}

// Update last page before submit
export function updateLastPage(path: string) {
  lastPage = path;
}

// Log a session event (privacy-safe, no PII)
export async function logSessionEvent(
  eventName: SessionEventType,
  entityId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const sessionId = getSessionId();
  const pagePath = window.location.pathname;
  
  // Add to in-memory buffer
  const event: SessionEvent = {
    event_name: eventName,
    page_path: pagePath,
    entity_id: entityId,
    meta: meta ? sanitizeMeta(meta) : undefined,
    ts: Date.now(),
  };
  
  eventBuffer.push(event);
  
  // Keep only last 10 events
  if (eventBuffer.length > 10) {
    eventBuffer = eventBuffer.slice(-10);
  }

  // Only persist to DB if consent is given
  const consent = getConsentState();
  if (consent.analytics) {
    try {
      await supabase.from('session_events').insert([{
        session_id: sessionId,
        event_name: eventName,
        page_path: pagePath,
        entity_id: entityId,
        meta: meta ? JSON.parse(JSON.stringify(sanitizeMeta(meta))) : {},
      }]);
    } catch (err) {
      console.error('Failed to log session event:', err);
    }
  }
}

// Sanitize meta to remove any potential PII
function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const allowedKeys = ['filter_type', 'bedrooms', 'price_range', 'area', 'sort_by', 'view_type'];
  
  for (const key of allowedKeys) {
    if (key in meta) {
      sanitized[key] = meta[key];
    }
  }
  
  return sanitized;
}

// Extract domain from referrer (privacy-safe)
function extractReferrerDomain(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    // Don't store full URL, just domain
    return url.hostname;
  } catch {
    return null;
  }
}

// Get attribution data for lead submission
export function getLeadAttribution(): {
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_domain: string | null;
  landing_page: string | null;
  last_page_before_submit: string | null;
  lead_device_type: string;
  browser_language: string;
  last_events_summary: SessionEvent[];
} {
  const consent = getConsentState();
  const utmParams = getPersistedUTMParams();
  
  // Base attribution (always collected - technical data for lead handling)
  const baseAttribution = {
    session_id: getSessionId(),
    landing_page: landingPage || window.location.pathname,
    last_page_before_submit: lastPage || window.location.pathname,
    lead_device_type: getDeviceType(),
    browser_language: document.documentElement.lang || navigator.language?.split('-')[0] || 'en',
  };

  // Extended attribution (only with consent)
  if (consent.analytics) {
    return {
      ...baseAttribution,
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_term: utmParams.utm_term || null,
      utm_content: utmParams.utm_content || null,
      referrer_domain: extractReferrerDomain(document.referrer),
      last_events_summary: eventBuffer.slice(-5), // Last 5 events
    };
  }

  // Minimal attribution (no consent)
  return {
    ...baseAttribution,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer_domain: null,
    last_events_summary: [],
  };
}

// Get last viewed properties (for sales context)
export function getLastViewedProperties(): string[] {
  return eventBuffer
    .filter(e => e.event_name === SESSION_EVENT_TYPES.PROPERTY_VIEWED && e.entity_id)
    .map(e => e.entity_id!)
    .slice(-5);
}

// Check if user has interacted with WhatsApp/Phone
export function getConversionTriggers(): { whatsapp: boolean; phone: boolean } {
  return {
    whatsapp: eventBuffer.some(e => e.event_name === SESSION_EVENT_TYPES.WHATSAPP_CLICK),
    phone: eventBuffer.some(e => e.event_name === SESSION_EVENT_TYPES.PHONE_CLICK),
  };
}

export default {
  initAttribution,
  updateLastPage,
  logSessionEvent,
  getLeadAttribution,
  getLastViewedProperties,
  getConversionTriggers,
  SESSION_EVENT_TYPES,
};
