import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDeltaIndicatorProps {
  percent: number | null | undefined;
  className?: string;
}

const PriceDeltaIndicator = ({ percent, className }: PriceDeltaIndicatorProps) => {
  if (percent === null || percent === undefined || percent === 0) {
    return null;
  }

  const isPositive = percent > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium',
        isPositive ? 'text-success' : 'text-destructive',
        className
      )}
    >
      {isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      {isPositive ? '+' : ''}{percent}%
    </span>
  );
};

export default PriceDeltaIndicator;
