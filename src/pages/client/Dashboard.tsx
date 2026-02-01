import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, RefreshCw, ArrowRight } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useApiAuth } from '@/contexts/ApiAuthContext';

const dashboardTiles = [
  {
    id: 'assets',
    title: 'My Assets',
    description: 'View and manage your property portfolio',
    icon: Building2,
    path: '/client-portal/assets',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    id: 'documents',
    title: 'Property Documents',
    description: 'Access contracts and legal documents',
    icon: FileText,
    path: '/client-portal/documents',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  {
    id: 'resale',
    title: 'Request a Resale',
    description: 'Submit a resale request for your property',
    icon: RefreshCw,
    path: '/client-portal/resale',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
];

const ClientDashboard = () => {
  const { user } = useApiAuth();

  return (
    <PortalLayout
      title="Welcome Back"
      subtitle={`Here's an overview of your property portfolio`}
    >
      {/* Dashboard Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardTiles.map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              to={tile.path}
              className="group block"
            >
              <div className={`
                glass-card p-8 border border-border/20 
                hover:border-primary/30 transition-all duration-300
                hover:shadow-gold relative overflow-hidden
              `}>
                {/* Gradient Background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${tile.gradient} 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Circular Icon Container */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 
                    border border-primary/20 flex items-center justify-center mb-6
                    group-hover:scale-110 group-hover:shadow-gold transition-all duration-300">
                    <tile.icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 
                    group-hover:text-primary transition-colors">
                    {tile.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {tile.description}
                  </p>

                  <div className="flex items-center gap-2 text-primary opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-10"
      >
        <div className="glass-card p-6 border border-border/20">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Quick Overview
          </h2>
          <p className="text-muted-foreground">
            Navigate through the menu to access your assets, documents, and resale options.
            For any assistance, please contact your account manager.
          </p>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default ClientDashboard;
