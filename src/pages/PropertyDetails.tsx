/**
 * Property Details Page
 * Production-grade with Supabase integration, similar listings, mortgage calculator
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
  Heart,
  Share2,
  Phone,
  MessageCircle,
  Download,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CompareToggle from '@/components/compare/CompareToggle';
import SimilarListings from '@/components/property/SimilarListings';
import MortgageCalculator from '@/components/property/MortgageCalculator';
import CompareBar from '@/components/compare/CompareBar';
import { supabase } from '@/integrations/supabase/client';
import { PropertyListItem } from '@/lib/api/types';

interface DBProperty {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  image_url: string | null;
  status: string;
  progress_status: string | null;
  progress_percent: number | null;
  price_delta_percent: number | null;
  created_at: string;
  updated_at: string;
}

const PropertyDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);

  const [property, setProperty] = useState<DBProperty | null>(null);
  const [similarProperties, setSimilarProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch property by UUID
        const { data, error: queryError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (queryError) throw queryError;

        if (!data) {
          setError('Property not found');
          setLoading(false);
          return;
        }

        setProperty(data);

        // Fetch similar properties (same location, exclude current)
        let similarQuery = supabase
          .from('properties')
          .select('id, title, location, price, beds, baths, area, image_url, status')
          .neq('id', id)
          .limit(4);

        if (data.location) {
          // Try to match by location keyword
          const locationKeyword = data.location.split(',')[0]?.trim();
          if (locationKeyword) {
            similarQuery = similarQuery.ilike('location', `%${locationKeyword}%`);
          }
        }

        const { data: similarData } = await similarQuery;

        const mapped: PropertyListItem[] = (similarData || []).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.id,
          price: p.price || 0,
          currency: 'EGP',
          location: p.location || '',
          bedrooms: p.beds || 0,
          bathrooms: p.baths || 0,
          area: p.area || 0,
          imageUrl: p.image_url || '/placeholder.svg',
          status: 'published' as const,
          tags: [],
        }));

        setSimilarProperties(mapped);
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

  const getWhatsAppLink = () => {
    if (!property) return '#';
    const message = encodeURIComponent(`Hi, I'm interested in ${property.title}. Please provide more details.`);
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

  const image = property.image_url || '/placeholder.svg';

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-primary">{t('nav.properties')}</Link>
          <span>/</span>
          <span className="text-foreground">{property.title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <section className="container mx-auto px-6 pb-8">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-[60vh] object-cover"
          />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="badge-available text-sm px-4 py-1">
              {property.status}
            </Badge>
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                isFavorite ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-foreground hover:bg-background/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/80 transition-all">
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
                {property.title}
              </h1>
              {property.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{property.location}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.beds != null && (
                <div className="glass-card p-4 text-center">
                  <Bed className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-semibold text-foreground">{property.beds}</p>
                  <p className="text-sm text-muted-foreground">{t('property.beds')}</p>
                </div>
              )}
              {property.baths != null && (
                <div className="glass-card p-4 text-center">
                  <Bath className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-semibold text-foreground">{property.baths}</p>
                  <p className="text-sm text-muted-foreground">{t('property.baths')}</p>
                </div>
              )}
              {property.area != null && (
                <div className="glass-card p-4 text-center">
                  <Maximize className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-semibold text-foreground">{property.area}</p>
                  <p className="text-sm text-muted-foreground">{t('property.sqm')}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="glass-card p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {/* Mortgage Calculator */}
            {property.price && (
              <MortgageCalculator
                price={property.price}
                currency="EGP"
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="glass-card p-6 sticky top-28">
              <div className="mb-6">
                {property.price ? (
                  <p className="text-gold font-display text-3xl font-semibold">
                    {formatPrice(property.price)} {t('common.currency')}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-lg">Price on request</p>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full btn-gold h-12 text-base gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {t('property.whatsapp')}
                  </Button>
                </a>
                <CompareToggle propertyId={property.id} variant="details" />
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50">
                  <Phone className="w-5 h-5" />
                  {t('property.call')}
                </Button>
                <Button variant="outline" className="w-full h-12 text-base gap-2 border-border/50 hover:border-primary/50">
                  <Download className="w-5 h-5" />
                  {t('property.brochure')}
                </Button>
              </div>
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
