import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
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

// Sample properties
const properties = [
  {
    id: '1',
    title: 'Palm Hills Residence',
    location: 'New Cairo, Egypt',
    price: 5500000,
    salePrice: 4950000,
    beds: 4,
    baths: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    status: 'available' as const,
    tag: 'hot' as const,
    constructionProgress: 85,
  },
  {
    id: '2',
    title: 'Marina Bay Penthouse',
    location: 'North Coast, Egypt',
    price: 12000000,
    beds: 5,
    baths: 4,
    area: 450,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    status: 'available' as const,
    tag: 'new' as const,
  },
  {
    id: '3',
    title: 'Garden View Villa',
    location: '6th October City, Egypt',
    price: 8500000,
    beds: 5,
    baths: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    status: 'reserved' as const,
    constructionProgress: 100,
  },
  {
    id: '4',
    title: 'Skyline Apartment',
    location: 'Zamalek, Cairo',
    price: 3200000,
    beds: 3,
    baths: 2,
    area: 180,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    status: 'available' as const,
    tag: 'bestValue' as const,
  },
  {
    id: '5',
    title: 'Nile View Duplex',
    location: 'Maadi, Cairo',
    price: 7800000,
    beds: 4,
    baths: 3,
    area: 320,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    status: 'available' as const,
  },
  {
    id: '6',
    title: 'Beachfront Villa',
    location: 'El Gouna, Red Sea',
    price: 15000000,
    beds: 6,
    baths: 5,
    area: 550,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    status: 'available' as const,
    tag: 'hot' as const,
    constructionProgress: 95,
  },
  {
    id: '7',
    title: 'Modern Studio',
    location: 'Sheikh Zayed, Giza',
    price: 1800000,
    beds: 1,
    baths: 1,
    area: 85,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    status: 'sold' as const,
  },
  {
    id: '8',
    title: 'Luxury Townhouse',
    location: 'New Administrative Capital',
    price: 6500000,
    beds: 4,
    baths: 3,
    area: 290,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    status: 'available' as const,
    tag: 'new' as const,
    constructionProgress: 70,
  },
];

const Properties = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

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
                <PropertyCard {...property} />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-border/50 hover:border-primary/50">
              Load More Properties
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
