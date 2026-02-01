/**
 * Similar Listings Component
 * Smart matching based on project, area, tags, price, type
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyCard from './PropertyCard';
import { Property, PropertyListItem, mockPropertiesApi } from '@/lib/api';

interface SimilarListingsProps {
  currentProperty: Property;
  limit?: number;
}

const SimilarListings = ({ currentProperty, limit = 4 }: SimilarListingsProps) => {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setIsLoading(true);
      try {
        // Fetch all published properties
        const response = await mockPropertiesApi.listPublic({ limit: 20 });
        
        // Filter out current property and calculate similarity scores
        const scored = response.data
          .filter((p) => p.id !== currentProperty.id)
          .map((property) => {
            let score = 0;

            // Same area (highest priority)
            if (property.location.includes(currentProperty.location.area)) {
              score += 40;
            }

            // Same city
            if (property.location.includes(currentProperty.location.city)) {
              score += 20;
            }

            // Shared tags
            const sharedTags = property.tags.filter((tag) =>
              currentProperty.tags.includes(tag)
            );
            score += sharedTags.length * 10;

            // Similar price (within 20%)
            const priceDiff = Math.abs(property.price - currentProperty.price) / currentProperty.price;
            if (priceDiff <= 0.2) {
              score += 15 * (1 - priceDiff);
            }

            // Similar bedrooms
            if (property.bedrooms === currentProperty.specs.bedrooms) {
              score += 10;
            }

            // Similar area (sqm)
            const areaDiff = Math.abs(property.area - currentProperty.specs.area) / currentProperty.specs.area;
            if (areaDiff <= 0.3) {
              score += 5 * (1 - areaDiff);
            }

            return { ...property, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        setProperties(scored);
      } catch (error) {
        console.error('Error fetching similar listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [currentProperty, limit]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Similar Properties
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Similar Properties
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on location, features, and price range
            </p>
          </div>
        </div>
        <Link to="/properties">
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PropertyCard
              id={property.id}
              title={property.title}
              location={property.location}
              price={property.price}
              originalPrice={property.salePrice ? property.price : undefined}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              imageUrl={property.imageUrl}
              status={property.status === 'published' ? 'under_construction' : 'delivered'}
              currency={property.currency}
              featured={false}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SimilarListings;
