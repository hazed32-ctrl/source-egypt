/**
 * Analytics Provider
 * Wraps app with analytics tracking capabilities
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ConsentBanner from './ConsentBanner';
import PixelLoader from './PixelLoader';
import { analytics } from '@/lib/analytics';
import { persistUTMParams, shouldExcludeRoute } from '@/lib/analytics/utils';
import { supabase } from '@/integrations/supabase/client';

// Routes to exclude from tracking
const EXCLUDED_ROUTES = [
  '/admin/*',
  '/client-portal/*',
  '/agent/*',
  '/auth',
  '/reset-password',
];

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const location = useLocation();

  // Persist UTM params on mount
  useEffect(() => {
    persistUTMParams();
  }, []);

  // Track page views (excluding private routes)
  useEffect(() => {
    const fetchExclusionsAndTrack = async () => {
      // Get exclusions from DB
      const { data: dbExclusions } = await supabase
        .from('heatmap_exclusions')
        .select('route_pattern');
      
      const allExclusions = [
        ...EXCLUDED_ROUTES,
        ...(dbExclusions?.map(e => e.route_pattern) || []),
      ];

      // Only track public pages
      if (!shouldExcludeRoute(location.pathname, allExclusions)) {
        analytics.trackPageView(document.title);
      }
    };

    fetchExclusionsAndTrack();
  }, [location.pathname]);

  // Track scroll depth on public pages
  useEffect(() => {
    if (shouldExcludeRoute(location.pathname, EXCLUDED_ROUTES)) return;

    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track at 25%, 50%, 75%, 100% milestones
      if (scrollPercent > maxScroll && [25, 50, 75, 100].includes(scrollPercent)) {
        maxScroll = scrollPercent;
        analytics.trackScrollDepth(scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <>
      {children}
      <ConsentBanner />
      <PixelLoader />
    </>
  );
};

export default AnalyticsProvider;
