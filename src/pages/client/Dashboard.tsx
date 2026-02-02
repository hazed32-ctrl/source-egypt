import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, RefreshCw, Phone } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactAgentButton } from '@/components/client/ContactAgentButton';
import { cn } from '@/lib/utils';

const dashboardActions = [
  {
    id: 'assets',
    title: 'My Assets',
    description: 'View and manage your property portfolio',
    icon: Building2,
    path: '/client-portal/assets',
    enabled: true,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Access contracts and legal documents',
    icon: FileText,
    path: '/client-portal/documents',
    enabled: true,
  },
  {
    id: 'resale',
    title: 'Resale Request',
    description: 'Submit a resale request for your property',
    icon: RefreshCw,
    path: '/client-portal/resale',
    enabled: true,
  },
];

const CircleAction = ({ 
  action, 
  index 
}: { 
  action: typeof dashboardActions[0]; 
  index: number;
}) => {
  const Icon = action.icon;
  
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="flex flex-col items-center gap-4"
    >
      {/* Circular Icon Container */}
      <div
        className={cn(
          // Base circle styles
          "relative w-28 h-28 md:w-32 md:h-32 rounded-full",
          "flex items-center justify-center",
          // Glass effect
          "bg-gradient-to-br from-secondary/60 to-secondary/30",
          "backdrop-blur-md",
          "border border-border/30",
          // Shadow and glow
          "shadow-lg shadow-black/20",
          // Transitions
          "transition-all duration-300 ease-out",
          // Hover effects (desktop)
          action.enabled && [
            "group-hover:scale-110",
            "group-hover:border-primary/50",
            "group-hover:shadow-gold",
          ],
          // Focus styles
          "group-focus-visible:outline-none",
          "group-focus-visible:ring-2 group-focus-visible:ring-primary",
          "group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
          // Disabled state
          !action.enabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Inner glow effect */}
        <div 
          className={cn(
            "absolute inset-2 rounded-full",
            "bg-gradient-to-br from-primary/10 to-transparent",
            "opacity-0 transition-opacity duration-300",
            action.enabled && "group-hover:opacity-100"
          )}
        />
        
        {/* Icon */}
        <Icon 
          className={cn(
            "relative z-10 w-10 h-10 md:w-12 md:h-12",
            "text-primary transition-all duration-300",
            action.enabled && "group-hover:scale-110 group-hover:text-primary"
          )} 
          strokeWidth={1.5}
        />
      </div>

      {/* Label */}
      <span 
        className={cn(
          "text-sm md:text-base font-medium text-foreground",
          "transition-colors duration-300",
          action.enabled && "group-hover:text-primary"
        )}
      >
        {action.title}
      </span>
    </motion.div>
  );

  if (!action.enabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group cursor-not-allowed" aria-disabled="true">
              {content}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is currently unavailable</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={action.path}
            className="group focus:outline-none"
            aria-label={`${action.title}: ${action.description}`}
          >
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent className="glass-card border-border/50">
          <p>{action.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ClientDashboard = () => {
  const { user } = useApiAuth();

  return (
    <PortalLayout
      title="Welcome Back"
      subtitle="Here's an overview of your property portfolio"
    >
      {/* Circular Actions Grid */}
      <div 
        className={cn(
          "flex items-center justify-center gap-8 md:gap-12 lg:gap-16",
          "flex-row",
          "max-lg:flex-col",
          "py-8 md:py-12"
        )}
        role="navigation"
        aria-label="Dashboard actions"
      >
        {dashboardActions.map((action, index) => (
          <CircleAction key={action.id} action={action} index={index} />
        ))}
        
        {/* Contact Agent Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: dashboardActions.length * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <ContactAgentButton variant="circle" />
        </motion.div>
      </div>

      {/* Quick Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-8"
      >
        <div className="glass-card p-6 border border-border/20 rounded-xl">
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">
            Quick Overview
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Navigate through the options above to access your assets, documents, and resale options.
            For any assistance, please contact your account manager.
          </p>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default ClientDashboard;
