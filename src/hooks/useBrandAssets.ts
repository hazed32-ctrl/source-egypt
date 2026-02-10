import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Static imports as fallbacks
import navLogoFallback from '@/assets/logo-a-navbar.png';
import brandLogoFallback from '@/assets/logo-b-secondary.png';

interface BrandAssets {
  navLogoUrl: string;
  brandLogoUrl: string;
  faviconUrl: string;
  navLogoHeightDesktop: number;
  navLogoHeightMobile: number;
  navLogoMaxWidth: number;
  isLoading: boolean;
}

// Module-level cache so all consumers share the same data
let cachedAssets: Omit<BrandAssets, 'isLoading'> | null = null;
let fetchPromise: Promise<Omit<BrandAssets, 'isLoading'>> | null = null;

const CMS_KEYS = [
  'cms_nav_logo_url',
  'cms_brand_logo_url',
  'cms_favicon_url',
  'cms_nav_logo_height_desktop',
  'cms_nav_logo_height_mobile',
  'cms_nav_logo_max_width',
] as const;

const fetchBrandAssets = async (): Promise<Omit<BrandAssets, 'isLoading'>> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [...CMS_KEYS]);

    if (error) throw error;

    const map = new Map<string, string>();
    for (const row of data || []) {
      if (row.value) map.set(row.key, row.value);
    }

    return {
      navLogoUrl: map.get('cms_nav_logo_url') || navLogoFallback,
      brandLogoUrl: map.get('cms_brand_logo_url') || brandLogoFallback,
      faviconUrl: map.get('cms_favicon_url') || '/favicon.ico',
      navLogoHeightDesktop: parseInt(map.get('cms_nav_logo_height_desktop') || '52', 10),
      navLogoHeightMobile: parseInt(map.get('cms_nav_logo_height_mobile') || '42', 10),
      navLogoMaxWidth: parseInt(map.get('cms_nav_logo_max_width') || '210', 10),
    };
  } catch (err) {
    console.error('Failed to fetch brand assets:', err);
    return {
      navLogoUrl: navLogoFallback,
      brandLogoUrl: brandLogoFallback,
      faviconUrl: '/favicon.ico',
      navLogoHeightDesktop: 52,
      navLogoHeightMobile: 42,
      navLogoMaxWidth: 210,
    };
  }
};

export const useBrandAssets = (): BrandAssets => {
  const [assets, setAssets] = useState<Omit<BrandAssets, 'isLoading'> | null>(cachedAssets);
  const [isLoading, setIsLoading] = useState(!cachedAssets);

  useEffect(() => {
    if (cachedAssets) {
      setAssets(cachedAssets);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchBrandAssets();
    }

    fetchPromise.then((result) => {
      cachedAssets = result;
      setAssets(result);
      setIsLoading(false);

      // Update favicon dynamically
      updateFavicon(result.faviconUrl);
    });
  }, []);

  return {
    navLogoUrl: assets?.navLogoUrl || navLogoFallback,
    brandLogoUrl: assets?.brandLogoUrl || brandLogoFallback,
    faviconUrl: assets?.faviconUrl || '/favicon.ico',
    navLogoHeightDesktop: assets?.navLogoHeightDesktop || 52,
    navLogoHeightMobile: assets?.navLogoHeightMobile || 42,
    navLogoMaxWidth: assets?.navLogoMaxWidth || 210,
    isLoading,
  };
};

function updateFavicon(url: string) {
  if (!url || url === '/favicon.ico') return;
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
