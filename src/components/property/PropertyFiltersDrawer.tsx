/**
 * Property Filters Drawer
 * Mobile-first filters with desktop sidebar support
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Bed,
  Bath,
  Paintbrush,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PropertyFilters, FinishingType } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface PropertyFiltersDrawerProps {
  filters: PropertyFilters;
  onFilterChange: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

// Mock data - would come from API
const CITIES = ['New Cairo', 'North Coast', '6th October', 'Sheikh Zayed', 'Ain Sokhna'];
const AREAS: Record<string, string[]> = {
  'New Cairo': ['Palm Hills', 'Sodic East', 'Zed East', 'Madinaty', 'Hyde Park'],
  'North Coast': ['Marina', 'Marassi', 'Hacienda', 'Telal'],
  '6th October': ['Zayed', 'Beverly Hills', 'Palm Parks'],
  'Sheikh Zayed': ['Allegria', 'Sodic West', 'Palm Valley'],
  'Ain Sokhna': ['La Vista', 'Azha', 'Monte Galala'],
};
const TAGS = ['Luxury', 'Sea View', 'Golf View', 'Investment', 'Family Home', 'New Launch', 'Smart Home'];
const FINISHING_OPTIONS: { value: FinishingType; label: string }[] = [
  { value: 'core_shell', label: 'Core & Shell' },
  { value: 'semi_finished', label: 'Semi-Finished' },
  { value: 'fully_finished', label: 'Fully Finished' },
  { value: 'furnished', label: 'Furnished' },
];

const FilterSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-left group">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const FiltersContent = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: PropertyFiltersDrawerProps) => {
  const selectedCity = filters.city;
  const availableAreas = selectedCity ? AREAS[selectedCity] || [] : [];

  return (
    <div className="space-y-2">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-destructive hover:text-destructive/80"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All ({activeFilterCount})
          </Button>
        </div>
      )}

      {/* Location */}
      <FilterSection title="Location" icon={MapPin}>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">City</Label>
            <Select
              value={filters.city || ''}
              onValueChange={(value) => {
                onFilterChange('city', value || undefined);
                onFilterChange('area', undefined); // Reset area when city changes
              }}
            >
              <SelectTrigger className="mt-1 bg-secondary/50 border-border/50">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/50">
                <SelectItem value="">All cities</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCity && availableAreas.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Area</Label>
              <Select
                value={filters.area || ''}
                onValueChange={(value) => onFilterChange('area', value || undefined)}
              >
                <SelectTrigger className="mt-1 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  <SelectItem value="">All areas</SelectItem>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Min Price</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max Price</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 bg-secondary/50 border-border/50"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Prices in EGP
          </p>
        </div>
      </FilterSection>

      {/* Property Size */}
      <FilterSection title="Property Size" icon={Ruler}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Min Area (m²)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minArea || ''}
              onChange={(e) => onFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max Area (m²)</Label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.maxArea || ''}
              onChange={(e) => onFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 bg-secondary/50 border-border/50"
            />
          </div>
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title="Bedrooms" icon={Bed}>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={filters.bedrooms === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('bedrooms', filters.bedrooms === num ? undefined : num)}
              className={cn(
                'min-w-[3rem]',
                filters.bedrooms === num && 'bg-primary text-primary-foreground'
              )}
            >
              {num}+
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Bathrooms */}
      <FilterSection title="Bathrooms" icon={Bath}>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((num) => (
            <Button
              key={num}
              variant={filters.bathrooms === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('bathrooms', filters.bathrooms === num ? undefined : num)}
              className={cn(
                'min-w-[3rem]',
                filters.bathrooms === num && 'bg-primary text-primary-foreground'
              )}
            >
              {num}+
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Finishing */}
      <FilterSection title="Finishing" icon={Paintbrush}>
        <div className="space-y-2">
          {FINISHING_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`finishing-${option.value}`}
                checked={filters.finishing === option.value}
                onCheckedChange={(checked) => 
                  onFilterChange('finishing', checked ? option.value : undefined)
                }
              />
              <Label
                htmlFor={`finishing-${option.value}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Tags */}
      <FilterSection title="Features & Tags" icon={Tag}>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isSelected = filters.tags?.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                    : 'hover:bg-secondary'
                )}
                onClick={() => {
                  const currentTags = filters.tags || [];
                  const newTags = isSelected
                    ? currentTags.filter((t) => t !== tag)
                    : [...currentTags, tag];
                  onFilterChange('tags', newTags.length > 0 ? newTags : undefined);
                }}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
};

// Mobile Drawer
const PropertyFiltersDrawer = (props: PropertyFiltersDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger */}
      <div className={cn('lg:hidden', props.className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {props.activeFilterCount > 0 && (
                <Badge className="bg-primary text-primary-foreground ml-1">
                  {props.activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-card border-border/20 w-[320px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="font-display">Filters</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] py-4 pr-2 -mr-2">
              <FiltersContent {...props} />
            </div>
            <SheetFooter className="pt-4 border-t border-border/20">
              <Button onClick={() => setIsOpen(false)} className="w-full btn-gold">
                Show Results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:block', props.className)}>
        <div className="glass-card p-6 border border-border/20 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Filters
            </h3>
            {props.activeFilterCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {props.activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 -mr-2 scrollbar-hide">
            <FiltersContent {...props} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyFiltersDrawer;
