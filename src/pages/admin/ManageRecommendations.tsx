import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  User,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  userName?: string;
}

interface UserOption {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const ManageRecommendations = () => {
  const { user } = useApiAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    description: '',
    image_url: '',
    link: '',
    sort_order: '0',
  });

  const fetchData = async () => {
    try {
      const [{ data: recsData }, { data: usersData }] = await Promise.all([
        supabase
          .from('recommendations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('user_id, full_name, email'),
      ]);

      const userMap = new Map((usersData || []).map(u => [u.user_id, u.full_name || u.email || 'Unknown']));

      setRecommendations(
        (recsData || []).map(r => ({
          ...r,
          userName: userMap.get(r.user_id) || r.user_id,
        }))
      );
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({ user_id: '', title: '', description: '', image_url: '', link: '', sort_order: '0' });
    setEditingRec(null);
  };

  const handleOpenEdit = (rec: Recommendation) => {
    setEditingRec(rec);
    setFormData({
      user_id: rec.user_id,
      title: rec.title,
      description: rec.description || '',
      image_url: rec.image_url || '',
      link: rec.link || '',
      sort_order: rec.sort_order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.user_id) {
      toast.error('Title and user are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        user_id: formData.user_id,
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        link: formData.link || null,
        sort_order: parseInt(formData.sort_order) || 0,
        created_by: user?.id || null,
      };

      if (editingRec) {
        const { error } = await supabase.from('recommendations').update(payload).eq('id', editingRec.id);
        if (error) throw error;
        toast.success('Recommendation updated');
      } else {
        const { error } = await supabase.from('recommendations').insert(payload);
        if (error) throw error;
        toast.success('Recommendation created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save recommendation');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (rec: Recommendation) => {
    const { error } = await supabase
      .from('recommendations')
      .update({ is_active: !rec.is_active })
      .eq('id', rec.id);
    if (error) {
      toast.error('Failed to toggle');
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('recommendations').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted');
      fetchData();
    }
  };

  const filtered = recommendations.filter(r => {
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.userName?.toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <PortalLayout title="Manage Recommendations" subtitle="Create personalized recommendations for clients">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Manage Recommendations" subtitle="Create personalized recommendations for clients">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="input-luxury pl-12"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-gold gap-2">
              <Plus className="w-5 h-5" />
              Add Recommendation
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/30 sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingRec ? 'Edit Recommendation' : 'New Recommendation'}
              </DialogTitle>
              <DialogDescription>
                {editingRec ? 'Update recommendation details' : 'Create a personalized recommendation for a client'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              <div>
                <Label>Client *</Label>
                <Select
                  value={formData.user_id || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, user_id: v === 'none' ? '' : v })}
                >
                  <SelectTrigger className="input-luxury mt-1">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>Select client...</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.full_name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. New Phase Launch"
                  className="input-luxury mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  className="input-luxury mt-1 min-h-16"
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
                <Label>Link / Action URL</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/properties or https://..."
                  className="input-luxury mt-1"
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  className="input-luxury mt-1"
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full btn-gold">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingRec ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 border border-border/20 text-center"
        >
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">No Recommendations</h3>
          <p className="text-muted-foreground">Create your first recommendation to get started</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card border border-border/20 p-4 flex items-center gap-4"
            >
              {rec.image_url ? (
                <img src={rec.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{rec.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {rec.userName}
                </p>
                {rec.link && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <ExternalLink className="w-3 h-3" />
                    {rec.link}
                  </p>
                )}
              </div>
              <Badge className={rec.is_active
                ? 'bg-success/20 text-success border-success/30'
                : 'bg-secondary text-muted-foreground border-border/30'
              }>
                {rec.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleActive(rec)} className="text-muted-foreground hover:text-foreground">
                  {rec.is_active ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(rec)} className="text-muted-foreground hover:text-foreground">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(rec.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
};

export default ManageRecommendations;
