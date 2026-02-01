import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Grid, List, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/property/PropertyCard';
import SearchFilters from '@/components/property/SearchFilters';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  image_url: string | null;
  status: string;
  progress_percent: number | null;
}

const Properties = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('id, title, location, price, beds, baths, area, image_url, status, progress_percent');

        // Apply sorting
        switch (sortBy) {
          case 'price-low':
            query = query.order('price', { ascending: true, nullsFirst: false });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false, nullsFirst: false });
            break;
          case 'area-large':
            query = query.order('area', { ascending: false, nullsFirst: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching properties:', error);
          return;
        }

        setProperties(data || []);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [sortBy]);

  // Map database status to UI status
  const mapStatus = (status: string): 'available' | 'reserved' | 'sold' => {
    if (status === 'delivered') return 'available';
    if (status === 'under_construction') return 'available';
    return 'available';
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="py-16 bg-gradient-card border-b border-border/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              {t('nav.properties')}
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover our curated collection of premium properties across Egypt's most sought-after locations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {/* Search Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SearchFilters onSearch={(filters) => console.log(filters)} />
          </motion.div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-10 mb-8">
            <div>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">{properties.length}</span> {t('search.results')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] input-luxury">
                  <SelectValue placeholder={t('search.sortBy')} />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="area-large">Area: Largest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'grid' ? 'bg-background' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'list' ? 'bg-background' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No properties found.</p>
            </div>
          ) : (
            <>
              {/* Properties Grid */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-6'
                }
              >
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PropertyCard
                      id={property.id}
                      title={property.title}
                      location={property.location || 'Location not specified'}
                      price={property.price || 0}
                      beds={property.beds || 0}
                      baths={property.baths || 0}
                      area={property.area || 0}
                      image={property.image_url || '/placeholder.svg'}
                      status={mapStatus(property.status)}
                      constructionProgress={property.progress_percent || undefined}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="border-border/50 hover:border-primary/50">
                  Load More Properties
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
