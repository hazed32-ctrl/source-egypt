import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  MapPin,
  Edit,
  User,
  Percent
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Property {
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
  progress_percent: number | null;
  assigned_user_id: string | null;
  created_at: string;
  assignedUser?: { full_name: string | null; email: string | null } | null;
}

interface UserOption {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const ManageProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    beds: '',
    baths: '',
    area: '',
    image_url: '',
    status: 'under_construction' as 'under_construction' | 'delivered',
    progress_percent: 0,
    assigned_user_id: '',
  });

  const fetchData = async () => {
    try {
      const [{ data: propertiesData }, { data: usersData }] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('user_id, full_name, email'),
      ]);

      // Fetch assigned user info for each property
      const propertiesWithUsers = await Promise.all(
        (propertiesData || []).map(async (prop) => {
          if (prop.assigned_user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', prop.assigned_user_id)
              .maybeSingle();
            return { ...prop, assignedUser: userData };
          }
          return { ...prop, assignedUser: null };
        })
      );

      setProperties(propertiesWithUsers);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: '',
      beds: '',
      baths: '',
      area: '',
      image_url: '',
      status: 'under_construction',
      progress_percent: 0,
      assigned_user_id: '',
    });
    setEditingProperty(null);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description || '',
      location: property.location || '',
      price: property.price?.toString() || '',
      beds: property.beds?.toString() || '',
      baths: property.baths?.toString() || '',
      area: property.area?.toString() || '',
      image_url: property.image_url || '',
      status: property.status as 'under_construction' | 'delivered',
      progress_percent: property.progress_percent || 0,
      assigned_user_id: property.assigned_user_id || '',
    });
    setIsDialogOpen(true);
  };

  const handleSaveProperty = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsCreating(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        price: formData.price ? parseFloat(formData.price) : null,
        beds: formData.beds ? parseInt(formData.beds) : null,
        baths: formData.baths ? parseInt(formData.baths) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        image_url: formData.image_url || null,
        status: formData.status,
        progress_percent: formData.progress_percent,
        assigned_user_id: formData.assigned_user_id || null,
        created_by: user?.id || null,
      };

      if (editingProperty) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editingProperty.id);
        if (error) throw error;
        toast.success('Property updated successfully');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert(propertyData);
        if (error) throw error;
        toast.success('Property created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving property:', err);
      toast.error('Failed to save property');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const query = searchQuery.toLowerCase();
    return (
      prop.title.toLowerCase().includes(query) ||
      prop.location?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    return status === 'delivered' ? (
      <Badge className="bg-success/20 text-success border-success/30">Delivered</Badge>
    ) : (
      <Badge className="bg-warning/20 text-warning border-warning/30">Under Construction</Badge>
    );
  };

  if (isLoading) {
    return (
      <PortalLayout title="Manage Properties" subtitle="Add and manage property listings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Manage Properties" subtitle="Add and manage property listings">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties..."
            className="input-luxury pl-12"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-gold gap-2">
              <Plus className="w-5 h-5" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </DialogTitle>
              <DialogDescription>
                {editingProperty ? 'Update property details' : 'Add a new property to the platform'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Property title"
                  className="input-luxury mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Property description"
                  className="input-luxury mt-1 min-h-20"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New Cairo, Egypt"
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Price (EGP)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  placeholder="0"
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  placeholder="0"
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Area (m²)</Label>
                <Input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="0"
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="input-luxury mt-1"
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'under_construction' | 'delivered') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="input-luxury mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign to User</Label>
                <Select
                  value={formData.assigned_user_id}
                  onValueChange={(value) => setFormData({ ...formData, assigned_user_id: value })}
                >
                  <SelectTrigger className="input-luxury mt-1">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.full_name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Construction Progress: {formData.progress_percent}%</Label>
                <Slider
                  value={[formData.progress_percent]}
                  onValueChange={(value) => setFormData({ ...formData, progress_percent: value[0] })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={handleSaveProperty}
                  disabled={isCreating}
                  className="w-full btn-gold"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingProperty ? 'Update Property' : 'Create Property'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 border border-border/20 text-center"
        >
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No Properties Found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try a different search term' : 'Add your first property to get started'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card border border-border/20 overflow-hidden hover:border-primary/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(property.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {property.title}
                    </h3>
                    {property.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(property)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                {/* Assigned User */}
                {property.assignedUser && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="w-3 h-3" />
                    <span>Assigned to: {property.assignedUser.full_name || property.assignedUser.email}</span>
                  </div>
                )}

                {/* Progress */}
                {property.status === 'under_construction' && property.progress_percent !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">{property.progress_percent}%</span>
                    </div>
                    <Progress value={property.progress_percent} className="h-2" />
                  </div>
                )}

                {/* Price */}
                {property.price && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <span className="text-xl font-display font-semibold text-gold-gradient">
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

export default ManageProperties;
