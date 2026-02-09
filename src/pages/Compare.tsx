import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Calendar,
  Building,
  MessageCircle,
  Eye,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  GitCompare,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCompare } from '@/contexts/CompareContext';
import sourceLogo from '@/assets/logo-b-secondary.svg';

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
  description: string | null;
}

// Spec definitions for comparison table
const specs = [
  { key: 'beds', label: 'Bedrooms', icon: Bed },
  { key: 'baths', label: 'Bathrooms', icon: Bath },
  { key: 'area', label: 'Area (sqm)', icon: Maximize },
  { key: 'status', label: 'Status', icon: Building },
  { key: 'progress_percent', label: 'Construction', icon: Calendar },
];

const Compare = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ids: compareIds, remove, clear, add } = useCompare();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Get IDs from URL params
  const urlIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  // Fetch properties via edge function for comparison (uses URL params)
  useEffect(() => {
    const fetchProperties = async () => {
      // If no URL params, show empty state
      if (urlIds.length === 0) {
        setProperties([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Validate exactly 2 IDs
      if (urlIds.length !== 2) {
        setError('Please select exactly 2 properties to compare');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call the public compare edge function
        const { data, error: invokeError } = await supabase.functions.invoke('compare-properties', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: null,
        });

        // The edge function expects query params, so we need to call it differently
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compare-properties?ids=${urlIds.join(',')}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          if (result.code === 'NOT_FOUND') {
            setError(`Properties not found: ${result.missingIds?.join(', ') || 'unknown'}`);
          } else {
            setError(result.error || 'Failed to load properties');
          }
          setLoading(false);
          return;
        }

        if (result.success && result.properties) {
          setProperties(result.properties);
        } else {
          setError('Failed to load properties for comparison');
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError('Failed to load properties for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  // Fetch all available properties for the selector (public listings)
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        // Fetch from edge function to get public properties
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compare-properties?ids=`,
          { method: 'GET' }
        );
        
        // Since edge function requires 2 IDs, we'll use a different approach
        // For the selector, we'll fetch a sample of properties
        // In production, you'd have a separate endpoint for listing
        setAvailableProperties([]);
      } catch (err) {
        console.error('Failed to fetch available properties:', err);
      }
    };

    fetchAvailable();
  }, []);

  const formatPrice = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSpecValue = (property: Property, key: string) => {
    const value = property[key as keyof Property];
    if (value === null || value === undefined) return '—';
    if (key === 'progress_percent') return `${value}%`;
    if (key === 'status') {
      return t(`property.status.${value}` as const);
    }
    return String(value);
  };

  const valuesAreDifferent = (key: string) => {
    if (properties.length !== 2) return false;
    return getSpecValue(properties[0], key) !== getSpecValue(properties[1], key);
  };

  const handleRemoveProperty = (propertyId: string) => {
    remove(propertyId);
    const newIds = urlIds.filter(id => id !== propertyId);
    if (newIds.length > 0) {
      navigate(`/compare?ids=${newIds.join(',')}`);
    } else {
      navigate('/compare');
    }
  };

  const handleClearAll = () => {
    clear();
    navigate('/compare');
  };

  const canCompare = properties.length === 2;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Unable to Compare
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => navigate('/properties')} className="btn-gold gap-2">
            <ArrowLeft className="w-4 h-4" />
            Browse Properties
          </Button>
        </div>
      </Layout>
    );
  }

  // Empty state - no properties selected
  if (!canCompare) {
    return (
      <Layout>
        {/* Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={sourceLogo}
              alt=""
              className="w-[600px] h-[600px] opacity-[0.02] blur-[2px]"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Compare Properties
              </h1>
              <p className="text-muted-foreground text-lg">
                Select two properties from our listings to compare side-by-side
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 border border-border/30 text-center"
            >
              <GitCompare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                {urlIds.length === 1 ? 'Select One More Property' : 'Select Properties to Compare'}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {urlIds.length === 1 
                  ? 'You have selected 1 property. Add one more from the properties page to start comparing.'
                  : 'Browse our property listings and click the compare icon on any two properties to see a detailed side-by-side comparison.'}
              </p>
              <Button
                onClick={() => navigate('/properties')}
                className="btn-gold gap-2"
              >
                <Plus className="w-4 h-4" />
                Browse Properties
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={sourceLogo}
            alt=""
            className="w-[600px] h-[600px] opacity-[0.02] blur-[2px]"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Back Link */}
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Compare Properties
            </h1>
            <p className="text-muted-foreground text-lg">
              Side-by-side comparison to help you make the right choice
            </p>
          </motion.div>
        </div>
      </section>

      {/* Selection Controls */}
      <section className="pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border border-border/30 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-border/30">
                  <GitCompare className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">
                    {properties.length}/2 selected
                  </span>
                </div>

                {/* Selected Property Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-2 bg-secondary/30 rounded-lg pr-2 border border-border/20"
                    >
                      <div className="w-10 h-10 rounded-l-lg overflow-hidden flex-shrink-0">
                        <img
                          src={property.image_url || '/placeholder.svg'}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                        {property.title}
                      </span>
                      <button
                        onClick={() => handleRemoveProperty(property.id)}
                        className="w-6 h-6 rounded-full hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Content */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          {/* Property Cards - Desktop: side by side, Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card overflow-hidden border border-border/30"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={property.image_url || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`badge-${property.status} text-xs`}>
                      {t(`property.status.${property.status}` as const)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {property.title}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{property.location || 'Location not specified'}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-3xl font-semibold text-gold-gradient">
                      {formatPrice(property.price)} {t('common.currency')}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-semibold text-foreground">{property.beds || '—'}</p>
                      <p className="text-xs text-muted-foreground">{t('property.beds')}</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <Bath className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-semibold text-foreground">{property.baths || '—'}</p>
                      <p className="text-xs text-muted-foreground">{t('property.baths')}</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <Maximize className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-lg font-semibold text-foreground">{property.area || '—'}</p>
                      <p className="text-xs text-muted-foreground">{t('property.sqm')}</p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button className="btn-gold gap-2 h-11">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                    <Link to={`/properties/${property.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 gap-2 border-border/50 hover:border-primary/50"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Specs Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card overflow-hidden border border-border/30"
          >
            <div className="p-6 border-b border-border/30">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Detailed Comparison
              </h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 text-muted-foreground font-medium w-1/3">
                      Specification
                    </th>
                    <th className="text-center p-4 text-foreground font-medium w-1/3">
                      {properties[0]?.title}
                    </th>
                    <th className="text-center p-4 text-foreground font-medium w-1/3">
                      {properties[1]?.title}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => {
                    const isDifferent = valuesAreDifferent(spec.key);
                    const Icon = spec.icon;
                    return (
                      <tr
                        key={spec.key}
                        className={`border-b border-border/20 transition-all ${
                          isDifferent ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-foreground">{spec.label}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-medium ${isDifferent ? 'text-primary' : 'text-foreground'}`}>
                            {getSpecValue(properties[0], spec.key)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-medium ${isDifferent ? 'text-primary' : 'text-foreground'}`}>
                            {getSpecValue(properties[1], spec.key)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Price Row */}
                  <tr
                    className={`border-b border-border/20 transition-all ${
                      properties[0]?.price !== properties[1]?.price ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center text-primary font-bold">$</span>
                        <span className="text-foreground">Price</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-primary">
                        {formatPrice(properties[0]?.price)} {t('common.currency')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-primary">
                        {formatPrice(properties[1]?.price)} {t('common.currency')}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile: Horizontal Scroll Table */}
            <div className="md:hidden overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 text-muted-foreground font-medium">
                      Spec
                    </th>
                    <th className="text-center p-4 text-foreground font-medium text-sm">
                      {properties[0]?.title?.substring(0, 15)}...
                    </th>
                    <th className="text-center p-4 text-foreground font-medium text-sm">
                      {properties[1]?.title?.substring(0, 15)}...
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => {
                    const isDifferent = valuesAreDifferent(spec.key);
                    return (
                      <tr
                        key={spec.key}
                        className={`border-b border-border/20 ${
                          isDifferent ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="p-3 text-sm text-foreground">{spec.label}</td>
                        <td className="p-3 text-center text-sm font-medium text-foreground">
                          {getSpecValue(properties[0], spec.key)}
                        </td>
                        <td className="p-3 text-center text-sm font-medium text-foreground">
                          {getSpecValue(properties[1], spec.key)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Compare;
