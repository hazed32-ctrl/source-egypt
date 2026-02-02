import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Home, 
  DollarSign, 
  Ruler, 
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PropertyFinderProps {
  onComplete: (preferences: PropertyPreferences) => void;
  className?: string;
}

export interface PropertyPreferences {
  budgetMin: number;
  budgetMax: number;
  city: string;
  district: string;
  propertyType: string;
  areaSqm: number;
  paymentPreference: string;
}

const cities = [
  { value: 'cairo', labelEn: 'Cairo', labelAr: 'القاهرة' },
  { value: 'new-cairo', labelEn: 'New Cairo', labelAr: 'القاهرة الجديدة' },
  { value: 'october', labelEn: '6th October', labelAr: '6 أكتوبر' },
  { value: 'new-capital', labelEn: 'New Capital', labelAr: 'العاصمة الإدارية' },
  { value: 'north-coast', labelEn: 'North Coast', labelAr: 'الساحل الشمالي' },
  { value: 'ain-sokhna', labelEn: 'Ain Sokhna', labelAr: 'العين السخنة' },
];

const districts: Record<string, { value: string; labelEn: string; labelAr: string }[]> = {
  'new-cairo': [
    { value: 'fifth-settlement', labelEn: '5th Settlement', labelAr: 'التجمع الخامس' },
    { value: 'madinaty', labelEn: 'Madinaty', labelAr: 'مدينتي' },
    { value: 'el-shorouk', labelEn: 'El Shorouk', labelAr: 'الشروق' },
  ],
  'october': [
    { value: 'zayed', labelEn: 'Sheikh Zayed', labelAr: 'الشيخ زايد' },
    { value: 'beverly-hills', labelEn: 'Beverly Hills', labelAr: 'بيفرلي هيلز' },
    { value: 'palm-hills', labelEn: 'Palm Hills', labelAr: 'بالم هيلز' },
  ],
  'new-capital': [
    { value: 'r5', labelEn: 'R5', labelAr: 'R5' },
    { value: 'r7', labelEn: 'R7', labelAr: 'R7' },
    { value: 'r8', labelEn: 'R8', labelAr: 'R8' },
  ],
};

const propertyTypes = [
  { value: 'apartment', labelEn: 'Apartment', labelAr: 'شقة' },
  { value: 'villa', labelEn: 'Villa', labelAr: 'فيلا' },
  { value: 'townhouse', labelEn: 'Townhouse', labelAr: 'تاون هاوس' },
  { value: 'penthouse', labelEn: 'Penthouse', labelAr: 'بنتهاوس' },
  { value: 'duplex', labelEn: 'Duplex', labelAr: 'دوبلكس' },
  { value: 'studio', labelEn: 'Studio', labelAr: 'ستوديو' },
];

const paymentOptions = [
  { value: 'cash', labelEn: 'Cash', labelAr: 'كاش' },
  { value: 'installments', labelEn: 'Installments', labelAr: 'تقسيط' },
  { value: 'mortgage', labelEn: 'Mortgage', labelAr: 'تمويل عقاري' },
];

const steps = [
  { id: 'budget', icon: DollarSign, labelEn: 'Budget', labelAr: 'الميزانية' },
  { id: 'location', icon: MapPin, labelEn: 'Location', labelAr: 'الموقع' },
  { id: 'property', icon: Home, labelEn: 'Property', labelAr: 'العقار' },
  { id: 'payment', icon: CreditCard, labelEn: 'Payment', labelAr: 'الدفع' },
];

export const PropertyFinder = ({ onComplete, className }: PropertyFinderProps) => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [preferences, setPreferences] = useState<PropertyPreferences>({
    budgetMin: 1000000,
    budgetMax: 5000000,
    city: '',
    district: '',
    propertyType: '',
    areaSqm: 150,
    paymentPreference: '',
  });

  const getLabel = (item: { labelEn: string; labelAr: string }) => {
    return language === 'ar' ? item.labelAr : item.labelEn;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M EGP`;
    }
    return `${(value / 1000).toFixed(0)}K EGP`;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(preferences);
    setIsSubmitting(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return preferences.budgetMax > preferences.budgetMin;
      case 1: return preferences.city !== '';
      case 2: return preferences.propertyType !== '';
      case 3: return preferences.paymentPreference !== '';
      default: return true;
    }
  };

  const availableDistricts = preferences.city ? districts[preferences.city] || [] : [];

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted 
                    ? 'hsl(var(--primary))' 
                    : isActive 
                      ? 'hsl(var(--primary) / 0.2)' 
                      : 'hsl(var(--secondary))'
                }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  "border-2 transition-colors",
                  isCompleted ? "border-primary" : isActive ? "border-primary" : "border-border/50"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 md:w-20 h-0.5 mx-2",
                  isCompleted ? "bg-primary" : "bg-border/50"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Budget */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'ما هي ميزانيتك؟' : "What's your budget?"}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'حدد نطاق السعر المناسب لك' : 'Set your preferred price range'}
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-3xl font-display font-semibold text-gold-gradient">
                      {formatCurrency(preferences.budgetMin)} - {formatCurrency(preferences.budgetMax)}
                    </p>
                  </div>

                  <div className="px-4">
                    <Label className="text-sm text-muted-foreground mb-4 block">
                      {language === 'ar' ? 'الحد الأدنى' : 'Minimum Budget'}
                    </Label>
                    <Slider
                      value={[preferences.budgetMin]}
                      onValueChange={([value]) => setPreferences({ ...preferences, budgetMin: value })}
                      min={500000}
                      max={preferences.budgetMax - 500000}
                      step={100000}
                      className="mb-6"
                    />

                    <Label className="text-sm text-muted-foreground mb-4 block">
                      {language === 'ar' ? 'الحد الأقصى' : 'Maximum Budget'}
                    </Label>
                    <Slider
                      value={[preferences.budgetMax]}
                      onValueChange={([value]) => setPreferences({ ...preferences, budgetMax: value })}
                      min={preferences.budgetMin + 500000}
                      max={50000000}
                      step={100000}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'أين تريد السكن؟' : 'Where do you want to live?'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'اختر المدينة والمنطقة' : 'Choose your preferred city and area'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'المدينة' : 'City'}</Label>
                    <Select 
                      value={preferences.city} 
                      onValueChange={(value) => setPreferences({ ...preferences, city: value, district: '' })}
                    >
                      <SelectTrigger className="input-luxury mt-2">
                        <SelectValue placeholder={language === 'ar' ? 'اختر المدينة' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border/50">
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {getLabel(city)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {availableDistricts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <Label>{language === 'ar' ? 'المنطقة' : 'District'}</Label>
                      <Select 
                        value={preferences.district} 
                        onValueChange={(value) => setPreferences({ ...preferences, district: value })}
                      >
                        <SelectTrigger className="input-luxury mt-2">
                          <SelectValue placeholder={language === 'ar' ? 'اختر المنطقة' : 'Select district'} />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-border/50">
                          {availableDistricts.map((district) => (
                            <SelectItem key={district.value} value={district.value}>
                              {getLabel(district)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Property Type & Size */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'ما نوع العقار المطلوب؟' : 'What type of property?'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'حدد نوع العقار والمساحة' : 'Choose property type and size'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>{language === 'ar' ? 'نوع العقار' : 'Property Type'}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setPreferences({ ...preferences, propertyType: type.value })}
                          className={cn(
                            "p-4 rounded-xl border text-center transition-all",
                            preferences.propertyType === type.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {getLabel(type)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>{language === 'ar' ? 'المساحة (م²)' : 'Area (sqm)'}</span>
                      <span className="text-primary font-semibold">{preferences.areaSqm} m²</span>
                    </Label>
                    <Slider
                      value={[preferences.areaSqm]}
                      onValueChange={([value]) => setPreferences({ ...preferences, areaSqm: value })}
                      min={50}
                      max={1000}
                      step={10}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>50 m²</span>
                      <span>1000 m²</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment Preference */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                    {language === 'ar' ? 'طريقة الدفع المفضلة' : 'Payment Preference'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'كيف تفضل الدفع؟' : 'How would you like to pay?'}
                  </p>
                </div>

                <div className="grid gap-4">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences({ ...preferences, paymentPreference: option.value })}
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-xl border text-left transition-all",
                        preferences.paymentPreference === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        preferences.paymentPreference === option.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      )}>
                        {preferences.paymentPreference === option.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className={cn(
                        "font-medium",
                        preferences.paymentPreference === option.value
                          ? "text-primary"
                          : "text-foreground"
                      )}>
                        {getLabel(option)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {language === 'ar' ? 'السابق' : 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="btn-gold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'ar' ? 'جاري البحث...' : 'Finding...'}
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Search className="w-4 h-4" />
                {language === 'ar' ? 'ابحث الآن' : 'Find Properties'}
              </>
            ) : (
              <>
                {language === 'ar' ? 'التالي' : 'Next'}
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFinder;
