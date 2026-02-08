/**
 * Property Details Page
 * Production-grade with API integration, similar listings, mortgage calculator
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  Compass,
  Paintbrush,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import CompareToggle from '@/components/compare/CompareToggle';
import SimilarListings from '@/components/property/SimilarListings';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import CompareBar from '@/components/compare/CompareBar';
import { mockPropertiesApi } from '@/lib/api';
import { Property, PropertyListItem } from '@/lib/api/types';
import { analytics } from '@/lib/analytics';
import { logSessionEvent, SESSION_EVENT_TYPES } from '@/lib/analytics/attribution';

const PropertyDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Data states
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isArabic = i18n.language === 'ar';

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await mockPropertiesApi.getById(id);
        if (!data) {
          setError('Property not found');
          return;
        }
        setProperty(data);
        
        // Track property view
        const viewTitle = data.translations?.en?.title || 'Unknown';
        analytics.trackPropertyView(data.id, viewTitle, data.price);
        logSessionEvent(SESSION_EVENT_TYPES.PROPERTY_VIEWED, data.id);
        
        // Fetch similar properties
        // In a real implementation, this would be a separate API call
        const allProperties = await mockPropertiesApi.list({ limit: 10 });
        const similar = allProperties.data
          .filter(p => p.id !== id)
          .slice(0, 4);
        setSimilarProperties(similar);
      } catch (err) {
        console.error('Failed to fetch property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const nextImage = () => {
    if (!property?.media.length) return;
    setCurrentImage((prev) => (prev + 1) % property.media.length);
  };

  const prevImage = () => {
    if (!property?.media.length) return;
    setCurrentImage((prev) => (prev - 1 + property.media.length) % property.media.length);
  };

  const getWhatsAppLink = () => {
    if (!property) return '#';
    const title = isArabic ? property.translations.ar.title : property.translations.en.title;
    const message = encodeURIComponent(`Hi, I'm interested in ${title}. Please provide more details.`);
    return `https://wa.me/201234567890?text=${message}`;
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Property Not Found
            </h2>
            <p className="text-muted-foreground">{error || 'The property you are looking for does not exist.'}</p>
          </div>
          <Link to="/properties">
            <Button className="btn-gold gap-2">
              <ChevronLeft className="w-4 h-4" />
              Browse Properties
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = isArabic ? property.translations.ar.title : property.translations.en.title;
  const description = isArabic ? property.translations.ar.description : property.translations.en.description;
  const images = property.media.filter(m => m.type === 'image').map(m => m.url);

  const finishingLabels: Record<string, string> = {
    core_shell: 'Core & Shell',
    semi_finished: 'Semi Finished',
    fully_finished: 'Fully Finished',
    furnished: 'Furnished',
  };

  const viewLabels: Record<string, string> = {
    garden: 'Garden View',
    pool: 'Pool View',
    sea: 'Sea View',
    city: 'City View',
    landmark: 'Landmark View',
    street: 'Street View',
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-primary">{t('nav.properties')}</Link>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <section className="container mx-auto px-6 pb-8">
        <div className="relative rounded-2xl overflow-hidden">
          {images.length > 0 ? (
            <>
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[currentImage]}
                alt={title}
                className="w-full h-[60vh] object-cover"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentImage === index ? 'bg-primary w-8' : 'bg-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-[60vh] bg-secondary/30 flex items-center justify-center">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="badge-available text-sm px-4 py-1">
              {t(`property.status.${property.status}`)}
            </Badge>
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                const next = !isFavorite;
                setIsFavorite(next);
                analytics.trackFavoriteClick(property.id, next);
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                isFavorite ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground hover:bg-background/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => analytics.trackShareClick(property.id, 'share_button')}
              className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{property.location.area}, {property.location.city}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <Bed className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.specs.bedrooms}</p>
                <p className="text-sm text-muted-foreground">{t('property.beds')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Bath className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.specs.bathrooms}</p>
                <p className="text-sm text-muted-foreground">{t('property.baths')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Maximize className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">{property.specs.area}</p>
                <p className="text-sm text-muted-foreground">{t('property.sqm')}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-semibold text-foreground">
                  {property.publishedAt ? new Date(property.publishedAt).getFullYear() : 'TBD'}
                </p>
                <p className="text-sm text-muted-foreground">{t('property.delivery')}</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="glass-card p-6">
              <TabsList className="grid grid-cols-3 w-full bg-secondary/50 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">Property</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Paintbrush className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('property.finishing')}</p>
                      <p className="font-medium text-foreground">
                        {finishingLabels[property.specs.finishing] || property.specs.finishing}
                      </p>
                    </div>
                  </div>
                  {property.specs.view && (
                    <div className="flex items-center gap-3">
                      <Compass className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('property.view')}</p>
                        <p className="font-medium text-foreground">
                          {viewLabels[property.specs.view] || property.specs.view}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </TabsContent>

              <TabsContent value="features">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="aspect-video rounded-xl bg-secondary/30 flex items-center justify-center">
                  <p className="text-muted-foreground">Map integration coming soon</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Mortgage Calculator */}
            <MortgageCalculator 
              price={property.salePrice || property.price} 
              currency={property.currency}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="glass-card p-6 sticky top-28">
              <div className="mb-6">
                {property.salePrice ? (
                  <>
                    <p className="text-muted-foreground line-through text-lg">
                      {formatPrice(property.price)} {t('common.currency')}
                    </p>
                    <p className="text-gold font-display text-3xl font-semibold">
                      {formatPrice(property.salePrice)} {t('common.currency')}
                    </p>
                  </>
                ) : (
                  <p className="text-gold font-display text-3xl font-semibold">
                    {formatPrice(property.price)} {t('common.currency')}
                  </p>
                )}
              </div>

              {/* Payment Plan */}
              {property.paymentPlan && (
                <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-foreground mb-3">{t('property.paymentPlan')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Down Payment</span>
                      <span className="text-foreground">{property.paymentPlan.downPayment}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installment Period</span>
                      <span className="text-foreground">{property.paymentPlan.installmentYears} Years</span>
                    </div>
                    {property.paymentPlan.monthlyPayment && (
                      <div className="flex justify-between border-t border-border/30 pt-2 mt-2">
                        <span className="text-muted-foreground">Monthly</span>
                        <span className="text-primary font-medium">
                          {formatPrice(property.paymentPlan.monthlyPayment)} {t('common.currency')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" onClick={() => analytics.trackWhatsAppClick(undefined, 'property_details')}>
                  <Button className="w-full btn-gold h-12 text-base gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {t('property.whatsapp')}
                  </Button>
                </a>
                <CompareToggle propertyId={property.id} variant="details" />
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50" onClick={() => analytics.trackPhoneClick(undefined, 'property_details')}>
                  <Phone className="w-5 h-5" />
                  {t('property.call')}
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50" onClick={() => analytics.trackBrochureClick(property.id)}>
                  <Download className="w-5 h-5" />
                  {t('property.brochure')}
                </Button>
              </div>

              {/* Tags */}
              {property.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/30">
                  <h4 className="font-medium text-foreground mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <SimilarListings 
              properties={similarProperties}
              currentPropertyId={property.id}
            />
          </div>
        )}
      </section>

      {/* Compare Bar */}
      <CompareBar />
    </Layout>
  );
};

export default PropertyDetails;
