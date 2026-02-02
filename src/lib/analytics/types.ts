/**
 * Analytics Event Taxonomy
 * Stable event names and payload schemas for the analytics system
 */

// Core event names - keep stable for long-term tracking
export const ANALYTICS_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',
  
  // Property interactions
  VIEW_PROPERTY: 'view_property',
  SEARCH: 'search',
  FILTER_APPLY: 'filter_apply',
  
  // Compare features
  COMPARE_ADD: 'compare_add',
  COMPARE_REMOVE: 'compare_remove',
  COMPARE_VIEW: 'compare_view',
  
  // Lead & conversion events
  LEAD_SUBMIT: 'lead_submit',
  WHATSAPP_CLICK: 'whatsapp_click',
  PHONE_CLICK: 'phone_click',
  CTA_BOOK_CONSULTATION: 'cta_book_consultation_click',
  
  // Property finder
  PROPERTY_FINDER_START: 'property_finder_start',
  PROPERTY_FINDER_STEP: 'property_finder_step',
  PROPERTY_FINDER_COMPLETE: 'property_finder_complete',
  
  // User engagement
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Event payload schemas
export interface BaseEventPayload {
  timestamp?: number;
  page_url?: string;
  page_title?: string;
}

export interface PropertyEventPayload extends BaseEventPayload {
  property_id?: string;
  property_title?: string;
  property_price?: number;
  property_location?: string;
}

export interface SearchEventPayload extends BaseEventPayload {
  query?: string;
  filters?: Record<string, unknown>;
  results_count?: number;
}

export interface LeadEventPayload extends BaseEventPayload {
  lead_source?: string;
  property_id?: string;
  form_type?: string;
}

export interface ScrollEventPayload extends BaseEventPayload {
  depth_percent: number;
}

export interface CTAEventPayload extends BaseEventPayload {
  button_text?: string;
  button_location?: string;
  destination?: string;
}

export type EventPayload = 
  | BaseEventPayload 
  | PropertyEventPayload 
  | SearchEventPayload 
  | LeadEventPayload 
  | ScrollEventPayload
  | CTAEventPayload;

// UTM parameters
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Analytics settings from DB
export interface AnalyticsSetting {
  id: string;
  key: string;
  value: string | null;
  enabled: boolean;
}

// Consent state
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
}
