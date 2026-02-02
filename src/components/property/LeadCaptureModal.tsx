import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Phone, Mail, User, Loader2, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { PropertyPreferences } from './PropertyFinder';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preferences?: PropertyPreferences;
}

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(10, 'Phone number is required').max(20),
});

export const LeadCaptureModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preferences 
}: LeadCaptureModalProps) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = leadSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: 'property_finder',
        budget_min: preferences?.budgetMin,
        budget_max: preferences?.budgetMax,
        city: preferences?.city,
        district: preferences?.district,
        property_type: preferences?.propertyType,
        area_sqm: preferences?.areaSqm,
        payment_preference: preferences?.paymentPreference,
        status: 'new',
      });

      if (error) throw error;

      toast.success(
        language === 'ar' 
          ? 'شكراً لك! سنتواصل معك قريباً' 
          : 'Thank you! We will contact you soon.'
      );
      onSuccess();
    } catch (err) {
      console.error('Error submitting lead:', err);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى' 
          : 'Failed to submit. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            {language === 'ar' ? 'افتح النتائج' : 'Unlock Your Results'}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Unlock className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Description */}
          <p className="text-center text-muted-foreground">
            {language === 'ar' 
              ? 'أدخل بياناتك لمشاهدة العقارات المطابقة لمعاييرك'
              : 'Enter your details to view properties matching your criteria'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="lead-name">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lead-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                  className="input-luxury pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lead-email">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lead-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={language === 'ar' ? 'بريدك@email.com' : 'your@email.com'}
                  className="input-luxury pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lead-phone">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lead-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+20 xxx xxx xxxx"
                  className="input-luxury pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold h-12 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  {language === 'ar' ? 'افتح النتائج' : 'Unlock Results'}
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            {language === 'ar' 
              ? 'بيانتك آمنة معنا ولن يتم مشاركتها مع أي طرف ثالث'
              : 'Your data is secure and will not be shared with third parties'}
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
