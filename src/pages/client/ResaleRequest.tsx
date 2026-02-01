import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Building2, 
  MessageCircle, 
  Send, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  location: string | null;
}

interface ResaleRequest {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  property: Property | null;
}

const ResaleRequest = () => {
  const { user } = useApiAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<ResaleRequest[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user's properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('id, title, location')
          .eq('assigned_user_id', user.id);

        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);

        // Fetch existing resale requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('resale_requests')
          .select(`
            id,
            status,
            notes,
            created_at,
            property:properties(id, title, location)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;
        setRequests(requestsData || []);

        // Fetch WhatsApp number from settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'whatsapp_number')
          .maybeSingle();

        if (!settingsError && settingsData) {
          setWhatsappNumber(settingsData.value || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmitRequest = async () => {
    if (!selectedProperty || !user) {
      toast.error('Please select a property');
      return;
    }

    const property = properties.find((p) => p.id === selectedProperty);
    if (!property) return;

    setIsSubmitting(true);
    try {
      // Create resale request in database
      const { error } = await supabase
        .from('resale_requests')
        .insert({
          property_id: selectedProperty,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      // Open WhatsApp with prefilled message
      const message = encodeURIComponent(
        `Hello, I would like to request a resale for my property:\n\n` +
        `Property: ${property.title}\n` +
        `Location: ${property.location || 'N/A'}\n\n` +
        `Please contact me to proceed with the resale process.`
      );

      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');

      toast.success('Resale request submitted. Opening WhatsApp...');

      // Refresh requests
      const { data: newRequests } = await supabase
        .from('resale_requests')
        .select(`
          id,
          status,
          notes,
          created_at,
          property:properties(id, title, location)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(newRequests || []);
      setSelectedProperty('');
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/20 text-success border-success/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejected</Badge>;
      case 'in_review':
        return <Badge className="bg-primary/20 text-primary border-primary/30">In Review</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Completed</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Request a Resale" subtitle="Submit a resale request for your property">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Request a Resale" subtitle="Submit a resale request for your property">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Request Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border border-border/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                New Resale Request
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a property to request resale
              </p>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No properties available for resale
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Property
                </label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="input-luxury h-12">
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span>{property.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSubmitRequest}
                disabled={!selectedProperty || isSubmitting}
                className="w-full btn-gold h-12 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Submit & Contact via WhatsApp
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to WhatsApp to continue the conversation
              </p>
            </div>
          )}
        </motion.div>

        {/* Request History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border border-border/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Request History
              </h2>
              <p className="text-sm text-muted-foreground">
                Track your resale requests
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No resale requests yet
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {request.property?.title || 'Unknown Property'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.notes && (
                    <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/20">
                      {request.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default ResaleRequest;
