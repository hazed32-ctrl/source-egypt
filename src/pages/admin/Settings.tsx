import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Phone, Save, Loader2, BarChart3, Plug, Search } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="max-w-4xl space-y-6">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/analytics">
            <Card className="glass-card border-border/20 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Analytics</h3>
                  <p className="text-xs text-muted-foreground">View traffic & conversions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/integrations">
            <Card className="glass-card border-border/20 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Plug className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Integrations</h3>
                  <p className="text-xs text-muted-foreground">GA4, Pixels, Clarity</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/seo">
            <Card className="glass-card border-border/20 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">SEO Analyzer</h3>
                  <p className="text-xs text-muted-foreground">Check page optimization</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
