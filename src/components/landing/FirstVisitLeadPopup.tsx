import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useApiAuth } from '@/contexts/ApiAuthContext';
import sourceLogo from '@/assets/logo-b-secondary.svg';

const LS_KEY = 'source_lead_popup_shown';

const BUDGET_OPTIONS = [
  { value: 'under-2m', label: 'Under 2M EGP' },
  { value: '2m-5m', label: '2M – 5M EGP' },
  { value: '5m-10m', label: '5M – 10M EGP' },
  { value: '10m-20m', label: '10M – 20M EGP' },
  { value: 'above-20m', label: 'Above 20M EGP' },
];

const PREFERENCE_OPTIONS = [
  { id: 'new-cairo', label: 'New Cairo' },
  { id: '6th-october', label: '6th October' },
  { id: 'north-coast', label: 'North Coast' },
  { id: 'new-capital', label: 'New Capital' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'villa', label: 'Villa' },
  { id: 'duplex', label: 'Duplex' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: '1-2-beds', label: '1–2 Bedrooms' },
  { id: '3-4-beds', label: '3–4 Bedrooms' },
  { id: '5-plus-beds', label: '5+ Bedrooms' },
  { id: 'installments', label: 'Installment Plan' },
  { id: 'cash', label: 'Cash Payment' },
  { id: 'ready-to-move', label: 'Ready to Move' },
  { id: 'off-plan', label: 'Off-Plan (Future Delivery)' },
];

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(10, 'Phone number is required').max(20),
});

export const FirstVisitLeadPopup = () => {
  const { user, isLoading: authLoading, isAdmin, isClient, isAgent } = useApiAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    notes: '',
  });
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;

    // Don't show for authenticated users with roles
    if (user && (isAdmin || isClient || isAgent)) return;

    // Check localStorage
    if (localStorage.getItem(LS_KEY)) return;

    // Show after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(LS_KEY, 'true');
    }, 2500);

    return () => clearTimeout(timer);
  }, [authLoading, user, isAdmin, isClient, isAgent]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = leadSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const prefLabels = preferences.map(id => PREFERENCE_OPTIONS.find(p => p.id === id)?.label).filter(Boolean);

      const { error } = await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: 'landing_popup',
        message: [
          form.budget ? `Budget: ${BUDGET_OPTIONS.find(b => b.value === form.budget)?.label}` : '',
          prefLabels.length ? `Preferences: ${prefLabels.join(', ')}` : '',
          form.notes ? `Notes: ${form.notes}` : '',
        ].filter(Boolean).join(' | ') || null,
        status: 'new',
      });

      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => setIsOpen(false), 3000);
    } catch (err) {
      console.error('Error submitting lead:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/30 max-w-lg p-0 overflow-hidden [&>button]:hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={sourceLogo}
            alt=""
            className="w-[400px] h-[400px] opacity-[0.015] blur-[2px]"
          />
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 p-10 flex flex-col items-center text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                Thank you!
              </h3>
              <p className="text-muted-foreground">
                Our team will reach out to you shortly with personalized recommendations.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground leading-tight">
                      Tired of searching?{' '}
                      <span className="text-gold-gradient">Let our agents find the perfect match.</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tell us what you're looking for — we'll contact you shortly.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Name */}
                <div>
                  <Label htmlFor="popup-name" className="text-xs">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="popup-name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="input-luxury pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="popup-phone" className="text-xs">Phone *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="popup-phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+20 xxx xxx xxxx"
                      className="input-luxury pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="popup-email" className="text-xs">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="popup-email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="input-luxury pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label className="text-xs">Budget Range</Label>
                  <Select value={form.budget} onValueChange={v => setForm({ ...form, budget: v })}>
                    <SelectTrigger className="input-luxury mt-1">
                      <SelectValue placeholder="Select your budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferences */}
                <div>
                  <Label className="text-xs">Preferences</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PREFERENCE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => togglePreference(opt.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          preferences.includes(opt.id)
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="popup-notes" className="text-xs">Additional Notes</Label>
                  <Textarea
                    id="popup-notes"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any specific requirements..."
                    className="input-luxury mt-1 min-h-[60px] text-sm"
                    maxLength={500}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-gold h-11 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Get Matched'
                  )}
                </Button>

                {/* Not now */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Not now
                </button>

                <p className="text-[10px] text-center text-muted-foreground/60">
                  Your data is secure and will not be shared with third parties.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default FirstVisitLeadPopup;
