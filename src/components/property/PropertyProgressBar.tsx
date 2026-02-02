import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export type PropertyProgressStatus = 'off_plan' | 'ready_to_deliver' | 'ready_to_live';

interface PropertyProgressBarProps {
  status: PropertyProgressStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<PropertyProgressStatus, {
  progress: number;
  labelEn: string;
  labelAr: string;
  color: string;
}> = {
  off_plan: {
    progress: 30,
    labelEn: 'Off Plan',
    labelAr: 'خارج الخطة',
    color: 'from-amber-500 to-yellow-400',
  },
  ready_to_deliver: {
    progress: 70,
    labelEn: 'Ready To Deliver',
    labelAr: 'جاهز للتسليم',
    color: 'from-blue-500 to-cyan-400',
  },
  ready_to_live: {
    progress: 100,
    labelEn: 'Ready To Live',
    labelAr: 'جاهز للسكن',
    color: 'from-emerald-500 to-green-400',
  },
};

export const PropertyProgressBar = ({ 
  status, 
  showLabel = true, 
  size = 'md',
  className 
}: PropertyProgressBarProps) => {
  const { language } = useLanguage();
  const config = statusConfig[status] || statusConfig.off_plan;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Label and Percentage */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "font-medium text-foreground",
            labelSizeClasses[size]
          )}>
            {language === 'ar' ? config.labelAr : config.labelEn}
          </span>
          <span className={cn(
            "text-muted-foreground",
            labelSizeClasses[size]
          )}>
            {config.progress}%
          </span>
        </div>
      )}

      {/* Progress Bar Track */}
      <div className={cn(
        "w-full rounded-full bg-secondary/50 overflow-hidden",
        sizeClasses[size]
      )}>
        {/* Progress Bar Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${config.progress}%` }}
          transition={{ 
            duration: 1, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2 
          }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            config.color
          )}
        />
      </div>

      {/* Progress Markers */}
      {size !== 'sm' && (
        <div className="flex justify-between mt-1 px-0.5">
          {[30, 70, 100].map((marker) => (
            <div
              key={marker}
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                config.progress >= marker ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyProgressBar;
