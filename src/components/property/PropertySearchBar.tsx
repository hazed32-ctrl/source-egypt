import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface PropertySearchBarProps {
  onSearch?: (filters: Record<string, unknown>) => void;
}

const PropertySearchBar = ({ onSearch }: PropertySearchBarProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [areaRange, setAreaRange] = useState([0, 500]);
  const [bedrooms, setBedrooms] = useState('any');
  const [status, setStatus] = useState('any');
  const [propertyType, setPropertyType] = useState('any');

  const handleSearch = () => {
    onSearch?.({
      query: searchQuery,
      priceRange,
      areaRange,
      bedrooms,
      status,
      propertyType,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 10000000]);
    setAreaRange([0, 500]);
    setBedrooms('any');
    setStatus('any');
    setPropertyType('any');
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const hasActiveFilters =
    bedrooms !== 'any' ||
    status !== 'any' ||
    propertyType !== 'any' ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000000 ||
    areaRange[0] > 0 ||
    areaRange[1] < 500;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="glass-card p-2 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          {/* Search Icon + Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent pl-12 h-14 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-11 w-11 shrink-0 rounded-xl transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>

          {/* Search Button */}
          <Button onClick={handleSearch} className="btn-gold h-11 px-6 rounded-xl shrink-0">
            <Search className="w-4 h-4 mr-2" />
            {t('common.search')}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Dropdown */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="origin-top mt-3"
          >
            <div className="glass-card p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Property Type */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {t('search.propertyType')}
                  </label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="input-luxury h-11">
                      <SelectValue placeholder={t('search.any')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="any">{t('search.any')}</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {t('search.bedrooms')}
                  </label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="input-luxury h-11">
                      <SelectValue placeholder={t('search.any')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="any">{t('search.any')}</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {t('search.status')}
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="input-luxury h-11">
                      <SelectValue placeholder={t('search.any')} />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="any">{t('search.any')}</SelectItem>
                      <SelectItem value="available">{t('property.status.available')}</SelectItem>
                      <SelectItem value="reserved">{t('property.status.reserved')}</SelectItem>
                      <SelectItem value="sold">{t('property.status.sold')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {t('search.priceRange')}
                  </label>
                  <div className="px-1 pt-1">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      step={100000}
                    />
                    <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])} {t('common.currency')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Area Range + Clear */}
              <div className="mt-5 flex flex-col sm:flex-row items-end gap-5">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    {t('search.areaRange')}
                  </label>
                  <div className="px-1 pt-1">
                    <Slider
                      value={areaRange}
                      onValueChange={setAreaRange}
                      max={500}
                      step={10}
                    />
                    <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                      <span>{areaRange[0]} {t('property.sqm')}</span>
                      <span>{areaRange[1]} {t('property.sqm')}</span>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('search.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertySearchBar;
