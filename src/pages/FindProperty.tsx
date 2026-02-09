import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, EyeOff, MapPin, Home, DollarSign } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PropertyFinder, { PropertyPreferences } from '@/components/property/PropertyFinder';
import LeadCaptureModal from '@/components/property/LeadCaptureModal';
import PropertyProgressBar from '@/components/property/PropertyProgressBar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// Mock search results
const mockResults = [
  {
    id: '1',
    title: 'Palm Hills Residence',
    location: 'New Cairo, Egypt',
    price: 5500000,
    beds: 4,
    baths: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    progressStatus: 'ready_to_deliver' as const,
  },
  {
    id: '2',
    title: 'Marina Bay Penthouse',
    location: 'North Coast, Egypt',
    price: 12000000,
    beds: 5,
    baths: 4,
    area: 450,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    progressStatus: 'off_plan' as const,
  },
  {
    id: '3',
    title: 'Garden View Villa',
    location: '6th October City, Egypt',
    price: 8500000,
    beds: 5,
    baths: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    progressStatus: 'ready_to_live' as const,
  },
];

const FindProperty = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'finder' | 'results'>('finder');
  const [preferences, setPreferences] = useState<PropertyPreferences | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleFinderComplete = (prefs: PropertyPreferences) => {
    setPreferences(prefs);
    setStep('results');
    setShowLeadModal(true);
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
                  {language === 'ar' 
                    ? `وجدنا ${mockResults.length} عقارات تطابق معاييرك`
                    : `We found ${mockResults.length} properties matching your criteria`}
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockResults.map((property, index) => (
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
                        src={property.image}
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
                        {property.location}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <PropertyProgressBar 
                          status={property.progressStatus} 
                          size="sm"
                          showLabel={isUnlocked}
                        />
                      </div>

                      {/* Details */}
                      <div className={cn(
                        "flex items-center justify-between text-sm text-muted-foreground mb-4",
                        !isUnlocked && "blur-sm"
                      )}>
                        <span>{property.beds} beds</span>
                        <span>{property.baths} baths</span>
                        <span>{property.area} m²</span>
                      </div>

                      {/* Price */}
                      <div className={cn(
                        "flex items-center justify-between",
                        !isUnlocked && "blur-sm"
                      )}>
                        <p className="text-xl font-semibold text-gold-gradient">
                          {formatCurrency(property.price)}
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

              {/* Unlock CTA */}
              {!isUnlocked && (
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
