import { lazy, Suspense, ComponentType } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps } from 'lucide-react';
import {
  Building2,
  Landmark,
  Building,
  MapPin,
  ArrowLeftRight,
  Calculator,
  Home,
  Search,
  Phone,
  User,
  Settings,
  ChevronRight,
  Globe,
  Menu,
  X,
  LogOut,
  ChevronDown,
  DollarSign,
  Star,
  Heart,
  FileText,
} from 'lucide-react';

// Static icon map for fast rendering (common icons)
const staticIcons: Record<string, ComponentType<LucideProps>> = {
  Building2,
  Landmark,
  Building,
  MapPin,
  ArrowLeftRight,
  Calculator,
  Home,
  Search,
  Phone,
  User,
  Settings,
  ChevronRight,
  Globe,
  Menu,
  X,
  LogOut,
  ChevronDown,
  DollarSign,
  Star,
  Heart,
  FileText,
};

// Fallback for dynamic loading
const fallback = <div style={{ width: 16, height: 16 }} />;

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string | null;
}

/**
 * Dynamic icon component that renders Lucide icons by name.
 * Uses static imports for common icons (fast) and lazy loading for others.
 */
export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  if (!name) return null;

  // Check static icons first (most common, no lazy loading needed)
  const StaticIcon = staticIcons[name];
  if (StaticIcon) {
    return <StaticIcon {...props} />;
  }

  // Convert PascalCase to kebab-case for dynamic imports
  const kebabName = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase() as keyof typeof dynamicIconImports;

  // Check if icon exists in dynamic imports
  if (!dynamicIconImports[kebabName]) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  // Lazy load the icon
  const LazyIcon = lazy(dynamicIconImports[kebabName]);

  return (
    <Suspense fallback={fallback}>
      <LazyIcon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;
