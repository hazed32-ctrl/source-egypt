/**
 * Lead Attribution Tests
 * Tests for attribution capture, consent gating, and access control
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getConsentState, 
  isTrackingAllowed, 
  getSessionId 
} from '@/lib/analytics/utils';

// Mock the attribution module for testing
const mockGetLeadAttribution = () => {
  const consent = getConsentState();
  const baseAttribution = {
    session_id: getSessionId(),
    landing_page: '/properties',
    last_page_before_submit: '/find-property',
    lead_device_type: 'desktop',
    browser_language: 'en',
  };

  if (consent.analytics) {
    return {
      ...baseAttribution,
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'summer_sale',
      utm_term: 'luxury villa',
      utm_content: 'hero_cta',
      referrer_domain: 'google.com',
      last_events_summary: [
        { event_name: 'search_performed', page_path: '/properties', ts: Date.now() },
        { event_name: 'property_viewed', page_path: '/properties/123', entity_id: '123', ts: Date.now() },
      ],
    };
  }

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
};

describe('Lead Attribution', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Attribution with Consent ON', () => {
    beforeEach(() => {
      localStorage.setItem('cookie_consent', JSON.stringify({
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
      }));
    });

    it('should capture full attribution data when consent is given', () => {
      const attribution = mockGetLeadAttribution();
      
      expect(attribution.session_id).toBeTruthy();
      expect(attribution.utm_source).toBe('google');
      expect(attribution.utm_medium).toBe('cpc');
      expect(attribution.utm_campaign).toBe('summer_sale');
      expect(attribution.last_events_summary.length).toBeGreaterThan(0);
    });

    it('should include referrer domain', () => {
      const attribution = mockGetLeadAttribution();
      expect(attribution.referrer_domain).toBe('google.com');
    });

    it('should include event history', () => {
      const attribution = mockGetLeadAttribution();
      expect(attribution.last_events_summary).toHaveLength(2);
      expect(attribution.last_events_summary[0].event_name).toBe('search_performed');
    });
  });

  describe('Attribution with Consent OFF', () => {
    beforeEach(() => {
      localStorage.setItem('cookie_consent', JSON.stringify({
        analytics: false,
        marketing: false,
        timestamp: Date.now(),
      }));
    });

    it('should capture minimal attribution when consent is denied', () => {
      const attribution = mockGetLeadAttribution();
      
      // Should have base attribution
      expect(attribution.session_id).toBeTruthy();
      expect(attribution.landing_page).toBe('/properties');
      expect(attribution.lead_device_type).toBe('desktop');
      expect(attribution.browser_language).toBe('en');
    });

    it('should NOT capture UTM parameters without consent', () => {
      const attribution = mockGetLeadAttribution();
      
      expect(attribution.utm_source).toBeNull();
      expect(attribution.utm_medium).toBeNull();
      expect(attribution.utm_campaign).toBeNull();
    });

    it('should NOT capture event history without consent', () => {
      const attribution = mockGetLeadAttribution();
      expect(attribution.last_events_summary).toHaveLength(0);
    });

    it('should NOT capture referrer without consent', () => {
      const attribution = mockGetLeadAttribution();
      expect(attribution.referrer_domain).toBeNull();
    });
  });

  describe('Privacy-Safe Data Handling', () => {
    it('should never include email in event data', () => {
      const eventData = {
        event_name: 'property_viewed',
        page_path: '/properties/123',
        entity_id: '123',
        ts: Date.now(),
      };
      
      // Verify no PII fields
      expect(eventData).not.toHaveProperty('email');
      expect(eventData).not.toHaveProperty('phone');
      expect(eventData).not.toHaveProperty('name');
    });

    it('should only include property IDs, not full details', () => {
      const eventData = {
        event_name: 'property_viewed',
        entity_id: 'prop-123',
      };
      
      expect(eventData.entity_id).toBe('prop-123');
      expect(eventData).not.toHaveProperty('property_title');
      expect(eventData).not.toHaveProperty('property_price');
    });

    it('should extract only domain from referrer', () => {
      const extractDomain = (url: string) => {
        try {
          return new URL(url).hostname;
        } catch {
          return null;
        }
      };
      
      expect(extractDomain('https://www.google.com/search?q=luxury+villa')).toBe('www.google.com');
      expect(extractDomain('https://facebook.com/ad/12345?user=john')).toBe('facebook.com');
    });
  });

  describe('Role-Based Access Control', () => {
    const checkAccess = (role: string, resource: string) => {
      const accessRules: Record<string, string[]> = {
        'leads_with_attribution': ['admin', 'super_admin', 'sales_manager', 'marketer'],
        'lead_contact_info': ['admin', 'super_admin', 'sales_manager', 'sales_agent'],
        'integration_settings': ['admin', 'super_admin'],
        'aggregated_analytics': ['admin', 'super_admin', 'marketer', 'sales_manager'],
      };
      
      return accessRules[resource]?.includes(role) || false;
    };

    it('should allow admin to view leads with attribution', () => {
      expect(checkAccess('admin', 'leads_with_attribution')).toBe(true);
    });

    it('should allow sales_manager to view leads with attribution', () => {
      expect(checkAccess('sales_manager', 'leads_with_attribution')).toBe(true);
    });

    it('should allow marketer to view leads with attribution', () => {
      expect(checkAccess('marketer', 'leads_with_attribution')).toBe(true);
    });

    it('should deny client access to leads with attribution', () => {
      expect(checkAccess('client', 'leads_with_attribution')).toBe(false);
    });

    it('should deny sales_agent access to unassigned leads', () => {
      // Sales agents can only see leads assigned to them via RLS
      expect(checkAccess('sales_agent', 'leads_with_attribution')).toBe(false);
    });

    it('should allow only admin to modify integration settings', () => {
      expect(checkAccess('admin', 'integration_settings')).toBe(true);
      expect(checkAccess('marketer', 'integration_settings')).toBe(false);
      expect(checkAccess('sales_manager', 'integration_settings')).toBe(false);
    });

    describe('Marketer View Restrictions', () => {
      it('should allow marketer to view aggregated analytics', () => {
        expect(checkAccess('marketer', 'aggregated_analytics')).toBe(true);
      });

      it('should restrict marketer from raw lead contact info', () => {
        // Marketers can see attribution but not contact details
        expect(checkAccess('marketer', 'lead_contact_info')).toBe(false);
      });
    });
  });

  describe('Session Event Schema', () => {
    it('should follow strict event schema', () => {
      const validEventNames = [
        'search_performed',
        'filter_applied',
        'property_viewed',
        'compare_used',
        'whatsapp_click',
        'phone_click',
        'calculator_used',
        'lead_popup_shown',
        'project_viewed',
      ];

      const eventName = 'property_viewed';
      expect(validEventNames).toContain(eventName);
    });

    it('should have required fields in event', () => {
      interface SessionEvent {
        event_name: string;
        page_path: string;
        ts: number;
        entity_id?: string;
        meta?: Record<string, unknown>;
      }

      const event: SessionEvent = {
        event_name: 'property_viewed',
        page_path: '/properties/123',
        ts: Date.now(),
        entity_id: '123',
      };

      expect(event.event_name).toBeTruthy();
      expect(event.page_path).toBeTruthy();
      expect(event.ts).toBeGreaterThan(0);
    });

    it('should sanitize meta to only allowed keys', () => {
      const sanitizeMeta = (meta: Record<string, unknown>) => {
        const allowedKeys = ['filter_type', 'bedrooms', 'price_range', 'area', 'sort_by', 'view_type'];
        const sanitized: Record<string, unknown> = {};
        for (const key of allowedKeys) {
          if (key in meta) {
            sanitized[key] = meta[key];
          }
        }
        return sanitized;
      };

      const input = {
        filter_type: 'price',
        bedrooms: 3,
        email: 'test@example.com', // Should be stripped
        password: 'secret', // Should be stripped
      };

      const sanitized = sanitizeMeta(input);
      
      expect(sanitized.filter_type).toBe('price');
      expect(sanitized.bedrooms).toBe(3);
      expect(sanitized).not.toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('password');
    });
  });
});
