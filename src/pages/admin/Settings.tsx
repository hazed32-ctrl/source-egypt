import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Phone, Save, Loader2 } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'whatsapp_number')
          .maybeSingle();

        if (error) throw error;
        setWhatsappNumber(data?.value || '');
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'whatsapp_number',
          value: whatsappNumber,
        }, {
          onConflict: 'key',
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Settings" subtitle="Configure platform settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Settings" subtitle="Configure platform settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <div className="glass-card p-8 border border-border/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                General Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure your platform settings
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                WhatsApp Business Number
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                This number will be used for resale request communications
              </p>
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+201234567890"
                className="input-luxury"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the full international number including country code (e.g., +201234567890)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-gold gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default Settings;
