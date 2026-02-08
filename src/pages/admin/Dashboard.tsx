import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  FileText, 
  RefreshCw, 
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalDocuments: number;
  pendingResales: number;
  newLeads: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalDocuments: 0,
    pendingResales: 0,
    newLeads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: usersCount },
          { count: propertiesCount },
          { count: documentsCount },
          { count: resalesCount },
          { count: leadsCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('documents').select('*', { count: 'exact', head: true }),
          supabase.from('resale_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalProperties: propertiesCount || 0,
          totalDocuments: documentsCount || 0,
          pendingResales: resalesCount || 0,
          newLeads: leadsCount || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
    { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'primary' },
    { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'primary' },
    { label: 'Pending Resales', value: stats.pendingResales, icon: RefreshCw, color: 'warning' },
    { label: 'New Leads', value: stats.newLeads, icon: TrendingUp, color: 'success' },
  ];

  if (isLoading) {
    return (
      <PortalLayout title="Admin Dashboard" subtitle="Overview of your platform">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Admin Dashboard" subtitle="Overview of your platform">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-card p-6 border border-border/20 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 border border-${stat.color}/20 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-display font-semibold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 border border-border/20"
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <p className="text-muted-foreground">
          Use the sidebar navigation to manage users, properties, documents, and resale requests.
        </p>
      </motion.div>
    </PortalLayout>
  );
};

export default AdminDashboard;
