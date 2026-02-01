import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bed, Bath, Maximize, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CompareToggle from '@/components/compare/CompareToggle';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  salePrice?: number;
  originalPrice?: number; // Alias for backwards compatibility
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  baths?: number;
  area: number;
  imageUrl?: string;
  image?: string;
  status: 'available' | 'reserved' | 'sold' | 'under_construction' | 'delivered';
  tag?: 'hot' | 'new' | 'bestValue';
  constructionProgress?: number;
  currency?: string;
  featured?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  salePrice,
  originalPrice,
  beds,
  bedrooms,
  baths,
  bathrooms,
  area,
  image,
  imageUrl,
  status,
  tag,
  constructionProgress,
  currency = 'EGP',
  featured,
}: PropertyCardProps) => {
  // Normalize props for backwards compatibility
  const displayBeds = beds ?? bedrooms ?? 0;
  const displayBaths = baths ?? bathrooms ?? 0;
  const displayImage = image ?? imageUrl ?? '/placeholder.svg';
  const displayOriginalPrice = originalPrice ?? salePrice;
  
  // Map status for display
  const displayStatus = status === 'under_construction' || status === 'delivered' 
    ? 'available' 
    : status;
  const { t } = useTranslation();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = () => {
    const statusClasses: Record<string, string> = {
      available: 'badge-available',
      reserved: 'badge-reserved',
      sold: 'badge-sold',
      under_construction: 'bg-warning/20 text-warning border-warning/30',
      delivered: 'bg-success/20 text-success border-success/30',
    };
    const statusLabels: Record<string, string> = {
      under_construction: 'Under Construction',
      delivered: 'Ready to Move',
    };
    return (
      <Badge className={`${statusClasses[status] || statusClasses.available} text-xs`}>
        {statusLabels[status] || t(`property.status.${displayStatus}`)}
      </Badge>
    );
  };

  const getTagBadge = () => {
    if (!tag) return null;
    const tagColors = {
      hot: 'bg-destructive/90 text-destructive-foreground',
      new: 'bg-primary text-primary-foreground',
      bestValue: 'bg-success text-success-foreground',
    };
    return (
      <Badge className={`${tagColors[tag]} text-xs`}>
        {t(`property.tags.${tag}`)}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="glass-card overflow-hidden hover:shadow-gold transition-all duration-500">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          
          {/* Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            {getStatusBadge()}
            {getTagBadge()}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <CompareToggle propertyId={id} />
            <button className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-all duration-200">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Construction Progress */}
          {constructionProgress !== undefined && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between text-xs text-foreground mb-1">
                <span>{t('property.construction')}</span>
                <span>{constructionProgress}%</span>
              </div>
              <div className="progress-gold h-1.5">
                <div
                  className="progress-gold-fill"
                  style={{ width: `${constructionProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Location */}
          <h3 className="font-display text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">{location}</p>

          {/* Specs */}
          <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-primary" />
              <span>{displayBeds} {t('property.beds')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-primary" />
              <span>{displayBaths} {t('property.baths')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-primary" />
              <span>{area} {t('property.sqm')}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              {displayOriginalPrice ? (
                <>
                  <p className="text-muted-foreground line-through text-sm">
                    {formatPrice(displayOriginalPrice)} {currency}
                  </p>
                  <p className="text-gold font-semibold text-xl">
                    {formatPrice(price)} {currency}
                  </p>
                </>
              ) : (
                <p className="text-gold font-semibold text-xl">
                  {formatPrice(price)} {currency}
                </p>
              )}
            </div>
            <Link to={`/properties/${id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
              >
                {t('property.details')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
