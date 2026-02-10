/**
 * Agent - My Properties
 * Agent property management with submit for approval
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Send,
  Eye,
  Filter,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AgentPropertyItem {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  image_url: string | null;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-secondary/50 text-foreground border-border/50' },
  pending_approval: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  under_construction: { label: 'Under Construction', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  archived: { label: 'Archived', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const AgentProperties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<AgentPropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<AgentPropertyItem | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price, beds, baths, area, image_url, status')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!selectedProperty) return;

    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: 'pending_approval' })
        .eq('id', selectedProperty.id);

      if (error) throw error;

      setProperties(
        properties.map((p) =>
          p.id === selectedProperty.id ? { ...p, status: 'pending_approval' } : p
        )
      );
      setSubmitDialogOpen(false);
      setSelectedProperty(null);
      toast({
        title: 'Success',
        description: 'Property submitted for approval',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit property',
        variant: 'destructive',
      });
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.draft;

  return (
    <PortalLayout role="agent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              My Properties
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your property listings and submissions
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Property
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass-card border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-luxury"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-[180px] input-luxury">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredProperties.length === 0 ? (
          <Card className="glass-card border-border/30">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No properties found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => {
              const sc = getStatusConfig(property.status);
              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card border-border/30 overflow-hidden group">
                    <div className="relative aspect-[4/3]">
                      <img
                        src={property.image_url || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        className={`absolute top-3 right-3 ${sc.color}`}
                      >
                        {sc.label}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{property.location || 'No location'}</p>
                      <p className="text-primary font-semibold mb-4">
                        {property.price ? formatPrice(property.price) : 'Price TBD'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <span>{property.beds ?? 0} beds</span>
                        <span>•</span>
                        <span>{property.baths ?? 0} baths</span>
                        <span>•</span>
                        <span>{property.area ?? 0} sqm</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-border/50">
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {property.status === 'draft' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedProperty(property);
                              setSubmitDialogOpen(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                        {property.status === 'published' && (
                          <Button size="sm" variant="outline" className="flex-1 border-border/50">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Submit for Approval Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>Submit for Approval</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit "{selectedProperty?.title}" for admin approval?
                Once submitted, you won't be able to edit until it's reviewed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitForApproval}>Submit for Approval</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default AgentProperties;
