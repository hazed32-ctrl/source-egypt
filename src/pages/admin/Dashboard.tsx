/**
 * Admin Dashboard
 * KPI overview with mock API data
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileText, 
  RefreshCw, 
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Package,
  MessageSquare,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import {
  mockUsersApi,
  mockPropertiesApi,
  mockInventoryApi,
  mockLeadsApi,
  mockResaleApi,
  PropertyListItem,
  Lead,
} from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  publishedProperties: number;
  pendingApproval: number;
  totalInventory: number;
  newLeads: number;
  pendingResales: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useApiAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    publishedProperties: 0,
    pendingApproval: 0,
    totalInventory: 0,
    newLeads: 0,
    pendingResales: 0,
  });
  const [recentProperties, setRecentProperties] = useState<PropertyListItem[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, properties, inventory, leads, resales] = await Promise.all([
          mockUsersApi.list(),
          mockPropertiesApi.list({ limit: 100 }),
          mockInventoryApi.list(),
          mockLeadsApi.list(),
          mockResaleApi.list(),
        ]);

        setStats({
          totalUsers: users.length,
          totalProperties: properties.total,
          publishedProperties: properties.data.filter((p) => p.status === 'published').length,
          pendingApproval: properties.data.filter((p) => p.status === 'pending_approval').length,
          totalInventory: inventory.reduce((sum, i) => sum + i.totalUnits, 0),
          newLeads: leads.filter((l) => l.status === 'new').length,
          pendingResales: resales.filter((r) => r.status === 'pending').length,
        });

        setRecentProperties(properties.data.slice(0, 5));
        setRecentLeads(leads.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, path: '/admin/users', color: 'primary' },
    { label: 'Properties', value: stats.totalProperties, icon: Building2, path: '/admin/properties', color: 'primary' },
    { label: 'Pending Approval', value: stats.pendingApproval, icon: Clock, path: '/admin/properties', color: 'warning' },
    { label: 'Inventory Units', value: stats.totalInventory, icon: Package, path: '/admin/inventory', color: 'primary' },
    { label: 'New Leads', value: stats.newLeads, icon: MessageSquare, path: '/admin/leads', color: 'success' },
    { label: 'Pending Resales', value: stats.pendingResales, icon: RefreshCw, path: '/admin/resale', color: 'warning' },
  ];

  if (isLoading) {
    return (
      <PortalLayout role="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => navigate(stat.path)}
              className="cursor-pointer"
            >
              <Card className="glass-card border-border/20 hover:border-primary/30 transition-all duration-300 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-${stat.color}/10 border border-${stat.color}/20 flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-display font-semibold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card className="glass-card border-border/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Recent Properties
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/properties')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentProperties.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No properties yet</p>
              ) : (
                <div className="space-y-3">
                  {recentProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <img
                        src={property.imageUrl || '/placeholder.svg'}
                        alt={property.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{property.title}</p>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      <Badge
                        className={
                          property.status === 'published'
                            ? 'bg-success/20 text-success border-success/30'
                            : property.status === 'pending_approval'
                            ? 'bg-warning/20 text-warning border-warning/30'
                            : 'bg-secondary text-muted-foreground border-border/30'
                        }
                      >
                        {property.status === 'pending_approval' ? 'Pending' : property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card className="glass-card border-border/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Recent Leads
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/leads')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No leads yet</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                      </div>
                      <Badge
                        className={
                          lead.status === 'new'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 border-green-500/30'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-border/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => navigate('/admin/users')}>
                <Plus className="w-4 h-4" />
                Add User
              </Button>
              <Button variant="outline" className="gap-2 border-border/50" onClick={() => navigate('/admin/properties')}>
                <Building2 className="w-4 h-4" />
                Manage Properties
              </Button>
              <Button variant="outline" className="gap-2 border-border/50" onClick={() => navigate('/admin/inventory')}>
                <Package className="w-4 h-4" />
                Update Inventory
              </Button>
              <Button variant="outline" className="gap-2 border-border/50" onClick={() => navigate('/admin/cms')}>
                <FileText className="w-4 h-4" />
                Edit CMS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;
