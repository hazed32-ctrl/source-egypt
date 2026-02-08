import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bed, Bath, Maximize, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  salePrice?: number;
  beds: number;
  baths: number;
  area: number;
  image: string;
  status: 'available' | 'reserved' | 'sold';
  tag?: 'hot' | 'new' | 'bestValue';
  constructionProgress?: number;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  salePrice,
  beds,
  baths,
  area,
  image,
  status,
  tag,
  constructionProgress,
}: PropertyCardProps) => {
  const { t } = useTranslation();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = () => {
    const statusClasses = {
      available: 'badge-available',
      reserved: 'badge-reserved',
      sold: 'badge-sold',
    };
    return (
      <Badge className={`${statusClasses[status]} text-xs`}>
        {t(`property.status.${status}`)}
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
            src={image}
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

          {/* Favorite Button */}
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background/80 transition-all duration-200">
            <Heart className="w-5 h-5" />
          </button>

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
              <span>{beds} {t('property.beds')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-primary" />
              <span>{baths} {t('property.baths')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-primary" />
              <span>{area} {t('property.sqm')}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              {salePrice ? (
                <>
                  <p className="text-muted-foreground line-through text-sm">
                    {formatPrice(price)} {t('common.currency')}
                  </p>
                  <p className="text-gold font-semibold text-xl">
                    {formatPrice(salePrice)} {t('common.currency')}
                  </p>
                </>
              ) : (
                <p className="text-gold font-semibold text-xl">
                  {formatPrice(price)} {t('common.currency')}
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
