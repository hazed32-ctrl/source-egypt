import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Loader2, AlertCircle } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  image_url: string | null;
  status: string;
  progress_percent: number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
}

const MyAssets = () => {
  const { user } = useApiAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('assigned_user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load your properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
            Delivered
          </Badge>
        );
      case 'under_construction':
      default:
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">
            Under Construction
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="My Assets" subtitle="View your property portfolio">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="My Assets" subtitle="View your property portfolio">
      {error && (
        <div className="glass-card p-4 border border-destructive/30 mb-6 flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 border border-border/20 text-center"
        >
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No Properties Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You don't have any properties assigned to your account yet.
            Contact your administrator to get started.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card border border-border/20 overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {/* Property Image */}
              <div className="relative h-48 overflow-hidden">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(property.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {property.title}
                </h3>

                {property.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                )}

                {/* Property Details */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  {property.beds && <span>{property.beds} Beds</span>}
                  {property.baths && <span>{property.baths} Baths</span>}
                  {property.area && <span>{property.area} m²</span>}
                </div>

                {/* Progress */}
                {property.status === 'under_construction' && property.progress_percent !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Construction Progress</span>
                      <span className="text-primary font-medium">{property.progress_percent}%</span>
                    </div>
                    <Progress value={property.progress_percent} className="h-2" />
                  </div>
                )}

                {property.status === 'delivered' && (
                  <div className="flex items-center gap-2 text-success">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium">Property Delivered</span>
                  </div>
                )}

                {/* Price */}
                {property.price && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <span className="text-2xl font-display font-semibold text-gold-gradient">
                      EGP {property.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default MyAssets;
