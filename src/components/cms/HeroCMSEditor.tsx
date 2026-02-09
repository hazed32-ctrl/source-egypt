import { useState, useEffect } from 'react';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HeroContent, defaultHeroContent } from './HeroContentType';

const HeroCMSEditor = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<HeroContent>(defaultHeroContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'cms_home_hero')
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        setContent({ ...defaultHeroContent, ...JSON.parse(data.value) });
      }
    } catch (err) {
      console.error('Failed to fetch hero content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: JSON.stringify(content) })
        .eq('key', 'cms_home_hero');

      if (error) throw error;
      toast({ title: 'Success', description: 'Home hero content saved.' });
    } catch (err) {
      console.error('Failed to save hero content:', err);
      toast({ title: 'Error', description: 'Failed to save hero content.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index: number, field: string, value: string | number) => {
    const newStats = [...content.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setContent({ ...content, stats: newStats });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading hero content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Headline */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Headline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Headline Text</Label>
              <Input
                value={content.headline}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
                className="input-luxury"
                placeholder="Make It"
              />
            </div>
            <div className="space-y-2">
              <Label>Highlighted Word (gold gradient)</Label>
              <Input
                value={content.highlightWord}
                onChange={(e) => setContent({ ...content, highlightWord: e.target.value })}
                className="input-luxury"
                placeholder="Yours"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={content.subtitle}
              onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
              className="input-luxury min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* CTAs */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Call-to-Action Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary CTA Label</Label>
              <Input
                value={content.primaryCta.label}
                onChange={(e) => setContent({ ...content, primaryCta: { ...content.primaryCta, label: e.target.value } })}
                className="input-luxury"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary CTA Link</Label>
              <Input
                value={content.primaryCta.link}
                onChange={(e) => setContent({ ...content, primaryCta: { ...content.primaryCta, link: e.target.value } })}
                className="input-luxury"
              />
            </div>
          </div>
          <Separator className="border-border/30" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Secondary CTA Label</Label>
              <Input
                value={content.secondaryCta.label}
                onChange={(e) => setContent({ ...content, secondaryCta: { ...content.secondaryCta, label: e.target.value } })}
                className="input-luxury"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary CTA Link</Label>
              <Input
                value={content.secondaryCta.link}
                onChange={(e) => setContent({ ...content, secondaryCta: { ...content.secondaryCta, link: e.target.value } })}
                className="input-luxury"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) => updateStat(i, 'value', parseInt(e.target.value) || 0)}
                  className="input-luxury"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Suffix</Label>
                <Input
                  value={stat.suffix}
                  onChange={(e) => updateStat(i, 'suffix', e.target.value)}
                  className="input-luxury"
                  placeholder="+"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={stat.label}
                  onChange={(e) => updateStat(i, 'label', e.target.value)}
                  className="input-luxury"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hero Size */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">Hero Size</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={content.heroSize} onValueChange={(v) => setContent({ ...content, heroSize: v as 'small' | 'default' })}>
            <SelectTrigger className="input-luxury w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/50">
              <SelectItem value="default">Default (75vh)</SelectItem>
              <SelectItem value="small">Small (60vh)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="btn-gold gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Hero Content
        </Button>
        <Button variant="outline" onClick={() => { setContent(defaultHeroContent); }} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default HeroCMSEditor;
