import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, EyeOff, MapPin, Home, DollarSign, Loader2, SearchX } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyFinder, { PropertyPreferences } from '@/components/property/PropertyFinder';
import LeadCaptureModal from '@/components/property/LeadCaptureModal';
import PropertyProgressBar from '@/components/property/PropertyProgressBar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface FinderResult {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  image_url: string | null;
  progress_status: string | null;
}

const FindProperty = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'finder' | 'results'>('finder');
  const [preferences, setPreferences] = useState<PropertyPreferences | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [results, setResults] = useState<FinderResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async (prefs: PropertyPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('properties')
        .select('id, title, location, price, beds, baths, area, image_url, progress_status')
        .order('created_at', { ascending: false })
        .limit(12);

      // Budget filter
      if (prefs.budgetMin) {
        query = query.gte('price', prefs.budgetMin);
      }
      if (prefs.budgetMax) {
        query = query.lte('price', prefs.budgetMax);
      }

      // Location filter – match city label against location column
      if (prefs.city) {
        // Map city key to searchable term
        const cityMap: Record<string, string> = {
          'cairo': 'Cairo',
          'new-cairo': 'New Cairo',
          'october': 'October',
          'new-capital': 'New Capital',
          'north-coast': 'North Coast',
          'ain-sokhna': 'Ain Sokhna',
        };
        const cityTerm = cityMap[prefs.city] || prefs.city;
        query = query.ilike('location', `%${cityTerm}%`);
      }

      // Property type filter – match against property_type column
      if (prefs.propertyType) {
        query = query.eq('property_type', prefs.propertyType);
      }

      // Area filter – minimum area
      if (prefs.areaSqm && prefs.areaSqm > 50) {
        query = query.gte('area', prefs.areaSqm);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('FindProperty query error:', fetchError);
        setError(fetchError.message);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error('FindProperty unexpected error:', err);
      setError('An unexpected error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinderComplete = (prefs: PropertyPreferences) => {
    setPreferences(prefs);
    setStep('results');
    setShowLeadModal(true);
    fetchResults(prefs);
  };

  const handleLeadSuccess = () => {
    setShowLeadModal(false);
    setIsUnlocked(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          {step === 'finder' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                >
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {language === 'ar' ? 'ابحث عن عقارك' : 'Find your property'}
                  </span>
                </motion.div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
                  {language === 'ar' ? (
                    <>اعثر على <span className="text-gold-gradient">منزل أحلامك</span></>
                  ) : (
                    <>Find Your <span className="text-gold-gradient">Dream Home</span></>
                  )}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {language === 'ar' 
                    ? 'أجب على بعض الأسئلة البسيطة وسنجد لك العقارات المناسبة'
                    : 'Answer a few simple questions and we\'ll find properties that match your needs'}
                </p>
              </div>

              <PropertyFinder onComplete={handleFinderComplete} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              {/* Results Header */}
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                  {language === 'ar' ? 'العقارات المطابقة' : 'Matching Properties'}
                </h2>
                <p className="text-muted-foreground">
                  {isLoading
                    ? (language === 'ar' ? 'جارٍ البحث...' : 'Searching...')
                    : results.length > 0
                      ? (language === 'ar' 
                          ? `وجدنا ${results.length} عقارات تطابق معاييرك`
                          : `We found ${results.length} properties matching your criteria`)
                      : (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                  }
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'جارٍ البحث عن العقارات...' : 'Searching for properties...'}
                  </p>
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <div className="text-center py-20">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button variant="outline" onClick={() => preferences && fetchResults(preferences)}>
                    {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <SearchX className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'لم يتم العثور على عقارات' : 'No properties found'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md text-center">
                    {language === 'ar'
                      ? 'حاول تعديل معايير البحث للحصول على نتائج أفضل'
                      : 'Try adjusting your search criteria for better results'}
                  </p>
                  <Button variant="outline" onClick={() => setStep('finder')}>
                    {language === 'ar' ? 'تعديل البحث' : 'Modify Search'}
                  </Button>
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && !error && results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-2xl overflow-hidden border border-border/30 group"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={property.image_url || '/placeholder.svg'}
                          alt={property.title}
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                            !isUnlocked && "blur-md"
                          )}
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="text-center">
                              <EyeOff className="w-8 h-8 text-white mx-auto mb-2" />
                              <p className="text-white text-sm font-medium">
                                {language === 'ar' ? 'افتح لعرض التفاصيل' : 'Unlock to view'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className={cn(
                          "font-display text-lg font-semibold text-foreground mb-1",
                          !isUnlocked && "blur-sm"
                        )}>
                          {property.title}
                        </h3>
                        
                        <div className={cn(
                          "flex items-center gap-1 text-muted-foreground text-sm mb-3",
                          !isUnlocked && "blur-sm"
                        )}>
                          <MapPin className="w-3.5 h-3.5" />
                          {property.location || '—'}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <PropertyProgressBar 
                            status={(property.progress_status as 'off_plan' | 'ready_to_deliver' | 'ready_to_live') || 'off_plan'} 
                            size="sm"
                            showLabel={isUnlocked}
                          />
                        </div>

                        {/* Details */}
                        <div className={cn(
                          "flex items-center justify-between text-sm text-muted-foreground mb-4",
                          !isUnlocked && "blur-sm"
                        )}>
                          <span>{property.beds ?? '—'} beds</span>
                          <span>{property.baths ?? '—'} baths</span>
                          <span>{property.area ?? '—'} m²</span>
                        </div>

                        {/* Price */}
                        <div className={cn(
                          "flex items-center justify-between",
                          !isUnlocked && "blur-sm"
                        )}>
                          <p className="text-xl font-semibold text-gold-gradient">
                            {property.price ? formatCurrency(property.price) : '—'}
                          </p>
                          {isUnlocked && (
                            <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                              {language === 'ar' ? 'التفاصيل' : 'Details'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Unlock CTA */}
              {!isLoading && results.length > 0 && !isUnlocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-12"
                >
                  <Button
                    onClick={() => setShowLeadModal(true)}
                    className="btn-gold text-lg px-8 py-6 gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    {language === 'ar' ? 'افتح جميع النتائج' : 'Unlock All Results'}
                  </Button>
                </motion.div>
              )}

              {/* Back Button */}
              <div className="text-center mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setStep('finder')}
                  className="text-muted-foreground"
                >
                  {language === 'ar' ? 'ابدأ بحثاً جديداً' : 'Start New Search'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSuccess={handleLeadSuccess}
        preferences={preferences || undefined}
      />
    </Layout>
  );
};

export default FindProperty;
