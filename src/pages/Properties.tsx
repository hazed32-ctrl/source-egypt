/**
 * Properties Listing Page
 * Production-grade with infinite scroll, URL-synced filters, and API integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Map, Loader2, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFiltersDrawer from '@/components/property/PropertyFiltersDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPropertiesApi } from '@/lib/api';
import { PropertyListItem, PropertyFilters } from '@/lib/api/types';
import { useFilters } from '@/hooks/useFilters';
import { Search } from 'lucide-react';
import CompareBar from '@/components/compare/CompareBar';

const ITEMS_PER_PAGE = 12;

const Properties = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Data states
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  
  // Parse filters from URL
  const getFiltersFromURL = useCallback((): PropertyFilters => {
    return {
      search: searchParams.get('search') || undefined,
      city: searchParams.get('city') || undefined,
      area: searchParams.get('area') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      minArea: searchParams.get('minArea') ? Number(searchParams.get('minArea')) : undefined,
      maxArea: searchParams.get('maxArea') ? Number(searchParams.get('maxArea')) : undefined,
      finishing: searchParams.get('finishing') as PropertyFilters['finishing'] || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sortBy: (searchParams.get('sortBy') as PropertyFilters['sortBy']) || 'newest',
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<PropertyFilters>(getFiltersFromURL);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Sync filters to URL
  const syncFiltersToURL = useCallback((newFilters: PropertyFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.area) params.set('area', newFilters.area);
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.bedrooms) params.set('bedrooms', String(newFilters.bedrooms));
    if (newFilters.bathrooms) params.set('bathrooms', String(newFilters.bathrooms));
    if (newFilters.minArea) params.set('minArea', String(newFilters.minArea));
    if (newFilters.maxArea) params.set('maxArea', String(newFilters.maxArea));
    if (newFilters.finishing) params.set('finishing', newFilters.finishing);
    if (newFilters.tags?.length) params.set('tags', newFilters.tags.join(','));
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);
    
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch properties from API
  const fetchProperties = useCallback(async (pageNum: number, currentFilters: PropertyFilters, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await mockPropertiesApi.getProperties({
        ...currentFilters,
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });

      if (append) {
        setProperties(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const newProperties = response.data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProperties];
        });
      } else {
        setProperties(response.data);
      }

      setTotalCount(response.total);
      setHasNextPage(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  // Initial load and filter changes
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
    setSearchInput(urlFilters.search || '');
    setPage(1);
    fetchProperties(1, urlFilters, false);
  }, [searchParams, fetchProperties, getFiltersFromURL]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !loadingMore && !loadingRef.current) {
          fetchProperties(page + 1, filters, true);
        }
      },
      {
        root: null,
        rootMargin: '200px', // Pre-fetch before reaching bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, page, filters, fetchProperties, loading]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PropertyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    syncFiltersToURL(updatedFilters);
  }, [filters, syncFiltersToURL]);

  // Handle search submit
  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    handleFilterChange({ search: searchInput || undefined });
  }, [searchInput, handleFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string) => {
    handleFilterChange({ sortBy: sortBy as PropertyFilters['sortBy'] });
  }, [handleFilterChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchInput('');
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.city) count++;
    if (filters.area) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.finishing) count++;
    if (filters.tags?.length) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Map database status to UI status
  const mapStatus = (status: string): 'available' | 'reserved' | 'sold' => {
    if (status === 'published' || status === 'available') return 'available';
    if (status === 'reserved' || status === 'pending') return 'reserved';
    if (status === 'sold' || status === 'archived') return 'sold';
    return 'available';
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="py-12 md:py-16 bg-gradient-card border-b border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              {t('nav.properties')}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Discover our curated collection of premium properties across Egypt's most sought-after locations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 md:p-6 rounded-2xl mb-6"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input-luxury pl-12 h-12"
                />
              </div>
              
              {/* Mobile Filters Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFiltersOpen(true)}
                className="h-12 px-4 border-border/50 hover:border-primary/50 lg:hidden relative"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              
              <Button type="submit" className="btn-gold h-12 px-8">
                {t('common.search')}
              </Button>
            </form>
          </motion.div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{totalCount}</span> {t('search.results')}
              </p>
              
              {/* Active Filter Badges */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.search && (
                    <Badge variant="secondary" className="gap-1">
                      "{filters.search}"
                      <button onClick={() => handleFilterChange({ search: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.city && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.city}
                      <button onClick={() => handleFilterChange({ city: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.bedrooms && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.bedrooms} beds
                      <button onClick={() => handleFilterChange({ bedrooms: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {activeFilterCount > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-destructive h-6 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Sort */}
              <Select value={filters.sortBy || 'newest'} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[180px] input-luxury">
                  <SelectValue placeholder={t('search.sortBy')} />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="area_asc">Area: Smallest First</SelectItem>
                  <SelectItem value="area_desc">Area: Largest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'grid' ? 'bg-background' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'list' ? 'bg-background' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'map' ? 'bg-background' : ''}
                  onClick={() => setViewMode('map')}
                  aria-label="Map view"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Desktop Filters Button */}
              <Button
                variant="outline"
                onClick={() => setIsFiltersOpen(true)}
                className="hidden lg:flex h-10 px-4 border-border/50 hover:border-primary/50 gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 text-center mb-8"
            >
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchProperties(1, filters, false)} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && !error ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="glass-card overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 && !error ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No Properties Found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your criteria. Try adjusting your filters or search terms.
              </p>
              {activeFilterCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Properties Grid/List */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : viewMode === 'list'
                    ? 'space-y-4'
                    : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                }
              >
                <AnimatePresence mode="popLayout">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    >
                      <PropertyCard
                        id={property.id}
                        title={property.title}
                        location={property.location || 'Location not specified'}
                        price={property.price || 0}
                        beds={property.bedrooms || 0}
                        baths={property.bathrooms || 0}
                        area={property.area || 0}
                        image={property.imageUrl || '/placeholder.svg'}
                        status={mapStatus(property.status)}
                        salePrice={property.salePrice}
                        tags={property.tags}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Infinite Scroll Sentinel */}
              <div ref={sentinelRef} className="py-8">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Loading more properties...</span>
                  </div>
                )}
                
                {!hasNextPage && properties.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground text-sm"
                  >
                    You've reached the end of the listings
                  </motion.p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Filters Drawer */}
      <PropertyFiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
      />

      {/* Compare Bar */}
      <CompareBar />
    </Layout>
  );
};

export default Properties;
