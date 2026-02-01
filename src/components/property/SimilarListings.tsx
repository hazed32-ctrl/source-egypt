/**
 * Similar Listings Component
 * Displays related properties with smart matching
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';
import { PropertyListItem } from '@/lib/api/types';

interface SimilarListingsProps {
  properties: PropertyListItem[];
  currentPropertyId: string;
}

const SimilarListings = ({ properties, currentPropertyId }: SimilarListingsProps) => {
  const { t } = useTranslation();
  
  // Filter out current property and limit to 4
  const filteredProperties = properties
    .filter(p => p.id !== currentPropertyId)
    .slice(0, 4);

  if (filteredProperties.length === 0) {
    return null;
  }

  // Map status for PropertyCard
  const mapStatus = (status: string): 'available' | 'reserved' | 'sold' => {
    if (status === 'published' || status === 'available') return 'available';
    if (status === 'reserved' || status === 'pending') return 'reserved';
    if (status === 'sold' || status === 'archived') return 'sold';
    return 'available';
  };

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
            Similar Properties
          </h2>
          <p className="text-muted-foreground">
            Explore more properties that might interest you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProperties.map((property, index) => (
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
                beds={property.bedrooms}
                baths={property.bathrooms}
                area={property.area}
                image={property.imageUrl || '/placeholder.svg'}
                status={mapStatus(property.status)}
                salePrice={property.salePrice}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SimilarListings;
