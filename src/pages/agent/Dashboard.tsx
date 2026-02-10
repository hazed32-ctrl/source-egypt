/**
 * Agent Dashboard
 * Overview for agents with their submissions
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AgentProperty {
  id: string;
  title: string;
  location: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-secondary/50 text-foreground border-border/50', icon: Building2 },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
  under_construction: { label: 'Under Construction', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Building2 },
  archived: { label: 'Archived', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApiAuth();
  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, image_url, status, created_at')
        .eq('created_by', authUser.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: properties.length,
    drafts: properties.filter((p) => p.status === 'draft').length,
    pending: properties.filter((p) => p.status === 'pending_approval').length,
    published: properties.filter((p) => p.status === 'published').length,
  };

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.draft;

  return (
    <PortalLayout role="agent">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Agent'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your property submissions and track approvals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.drafts}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.published}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => navigate('/agent/properties')}>
                <Plus className="w-4 h-4" />
                New Property Listing
              </Button>
              <Button variant="outline" className="gap-2 border-border/50">
                <Eye className="w-4 h-4" />
                View My Listings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any properties yet.
                </p>
                <Button onClick={() => navigate('/agent/properties')}>
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 5).map((property) => {
                  const status = getStatusConfig(property.status);
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                          <img
                            src={property.image_url || '/placeholder.svg'}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {property.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {property.location || 'No location'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        {property.status === 'draft' && (
                          <Button size="sm" className="gap-2">
                            <Send className="w-3 h-3" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AgentDashboard;
