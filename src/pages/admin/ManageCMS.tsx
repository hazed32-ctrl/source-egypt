/**
 * Admin - CMS Management
 * Manage pages, sections, and popups
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Layout,
  MessageSquare,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Settings2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import HeroCMSEditor from '@/components/cms/HeroCMSEditor';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CMSSection {
  id: string;
  pageId: string;
  type: 'hero' | 'features' | 'cta' | 'gallery' | 'text' | 'properties' | 'contact' | 'custom';
  order: number;
  isVisible: boolean;
  content: { en: Record<string, unknown>; ar: Record<string, unknown> };
  settings: Record<string, unknown>;
}

interface CMSPageRow {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  meta_description_en: string | null;
  meta_description_ar: string | null;
  sections: CMSSection[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface CMSPopupRow {
  id: string;
  name: string;
  content: {
    en: { title: string; body: string; ctaText?: string; ctaUrl?: string };
    ar: { title: string; body: string; ctaText?: string; ctaUrl?: string };
  };
  image_url: string | null;
  trigger: string;
  trigger_value: number | null;
  show_once: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const sectionTypeLabels: Record<CMSSection['type'], string> = {
  hero: 'Hero Section',
  features: 'Features',
  cta: 'Call to Action',
  gallery: 'Gallery',
  text: 'Text Block',
  properties: 'Properties Grid',
  contact: 'Contact Form',
  custom: 'Custom HTML',
};

const emptyPopup: CMSPopupRow = {
  id: '',
  name: '',
  content: { en: { title: '', body: '' }, ar: { title: '', body: '' } },
  image_url: null,
  trigger: 'delay',
  trigger_value: 3000,
  show_once: true,
  is_active: false,
  created_at: '',
  updated_at: '',
};

const ManageCMS = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<CMSPageRow[]>([]);
  const [popups, setPopups] = useState<CMSPopupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPopup, setSelectedPopup] = useState<CMSPopupRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, popupsRes] = await Promise.all([
        supabase.from('cms_pages').select('*').order('created_at'),
        supabase.from('cms_popups').select('*').order('created_at'),
      ]);

      if (pagesRes.error) throw pagesRes.error;
      if (popupsRes.error) throw popupsRes.error;

      // Cast sections from Json to our typed array
      const typedPages = (pagesRes.data || []).map((p: any) => ({
        ...p,
        sections: (p.sections || []) as CMSSection[],
      }));

      const typedPopups = (popupsRes.data || []).map((p: any) => ({
        ...p,
        content: (p.content || { en: { title: '', body: '' }, ar: { title: '', body: '' } }) as CMSPopupRow['content'],
      }));

      setPages(typedPages);
      setPopups(typedPopups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch CMS data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionVisibility = async (pageId: string, sectionId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    const updatedSections = page.sections.map((section) =>
      section.id === sectionId ? { ...section, isVisible: !section.isVisible } : section
    );

    const { error } = await supabase
      .from('cms_pages')
      .update({ sections: updatedSections as any })
      .eq('id', pageId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setPages(pages.map((p) => (p.id === pageId ? { ...p, sections: updatedSections } : p)));
    toast({ title: 'Success', description: 'Section visibility updated' });
  };

  const togglePopupActive = async (popupId: string) => {
    const popup = popups.find((p) => p.id === popupId);
    if (!popup) return;

    const { error } = await supabase
      .from('cms_popups')
      .update({ is_active: !popup.is_active })
      .eq('id', popupId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setPopups(popups.map((p) => (p.id === popupId ? { ...p, is_active: !p.is_active } : p)));
    toast({ title: 'Success', description: 'Popup status updated' });
  };

  const openCreatePopup = () => {
    setSelectedPopup({ ...emptyPopup });
    setIsCreating(true);
  };

  const savePopup = async () => {
    if (!selectedPopup) return;
    setSaving(true);
    try {
      const payload = {
        name: selectedPopup.name,
        content: selectedPopup.content as any,
        image_url: selectedPopup.image_url,
        trigger: selectedPopup.trigger,
        trigger_value: selectedPopup.trigger_value,
        show_once: selectedPopup.show_once,
        is_active: selectedPopup.is_active,
      };

      if (isCreating) {
        const { data, error } = await supabase.from('cms_popups').insert(payload).select().single();
        if (error) throw error;
        const typed = { ...data, content: data.content as CMSPopupRow['content'] };
        setPopups([...popups, typed]);
        toast({ title: 'Success', description: 'Popup created' });
      } else {
        const { error } = await supabase.from('cms_popups').update(payload).eq('id', selectedPopup.id);
        if (error) throw error;
        setPopups(popups.map((p) => (p.id === selectedPopup.id ? { ...p, ...payload, content: payload.content as CMSPopupRow['content'] } : p)));
        toast({ title: 'Success', description: 'Popup updated' });
      }
      setSelectedPopup(null);
      setIsCreating(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updatePopupField = (field: string, value: any) => {
    if (!selectedPopup) return;
    setSelectedPopup({ ...selectedPopup, [field]: value });
  };

  const updatePopupContent = (lang: 'en' | 'ar', field: string, value: string) => {
    if (!selectedPopup) return;
    setSelectedPopup({
      ...selectedPopup,
      content: {
        ...selectedPopup.content,
        [lang]: { ...selectedPopup.content[lang], [field]: value },
      },
    });
  };

  return (
    <PortalLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            CMS Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage website pages, sections, and marketing popups
          </p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="glass-card border-border/30">
            <TabsTrigger value="hero" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Home Hero
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="w-4 h-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="popups" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Popups
            </TabsTrigger>
          </TabsList>

          {/* Home Hero Tab */}
          <TabsContent value="hero">
            <HeroCMSEditor />
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pages configured yet.</div>
            ) : (
              pages.map((page) => (
                <Card key={page.id} className="glass-card border-border/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {page.title_en}
                        <Badge
                          variant="outline"
                          className={
                            page.is_published
                              ? 'border-success/50 text-success'
                              : 'border-warning/50 text-warning'
                          }
                        >
                          {page.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Button size="sm" className="gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Slug: /{page.slug}
                    </p>

                    {/* Sections */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Sections ({page.sections.length})
                      </p>
                      {page.sections.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No sections configured
                        </p>
                      ) : (
                        page.sections.map((section) => (
                          <motion.div
                            key={section.id}
                            layout
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              <Layout className="w-4 h-4 text-primary" />
                              <span className="font-medium text-foreground">
                                {sectionTypeLabels[section.type] || section.type}
                              </span>
                              <Badge variant="outline" className="border-border/50">
                                Order: {section.order}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {section.isVisible ? (
                                  <Eye className="w-4 h-4 text-success" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                                <Switch
                                  checked={section.isVisible}
                                  onCheckedChange={() =>
                                    toggleSectionVisibility(page.id, section.id)
                                  }
                                />
                              </div>
                              <Button size="sm" variant="ghost">
                                <Settings2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Plus className="w-4 h-4" />
                      Add Section
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}

            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Page
            </Button>
          </TabsContent>

          {/* Popups Tab */}
          <TabsContent value="popups" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4">
                {popups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No popups configured yet.</div>
                )}
                {popups.map((popup) => (
                  <Card key={popup.id} className="glass-card border-border/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {popup.image_url && (
                            <img
                              src={popup.image_url}
                              alt={popup.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-foreground">{popup.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {popup.content?.en?.title || '—'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="border-border/50">
                                Trigger: {popup.trigger}
                                {popup.trigger_value &&
                                  popup.trigger === 'delay' &&
                                  ` (${popup.trigger_value}ms)`}
                              </Badge>
                              {popup.show_once && (
                                <Badge variant="outline" className="border-border/50">
                                  Show Once
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {popup.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <Switch
                              checked={popup.is_active}
                              onCheckedChange={() => togglePopupActive(popup.id)}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPopup(popup)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button className="gap-2" onClick={openCreatePopup}>
                  <Plus className="w-4 h-4" />
                  Create New Popup
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Popup Create/Edit Dialog */}
        <Dialog open={!!selectedPopup} onOpenChange={(open) => { if (!open) { setSelectedPopup(null); setIsCreating(false); } }}>
          <DialogContent className="glass-card border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Create Popup' : 'Edit Popup'}</DialogTitle>
            </DialogHeader>
            {selectedPopup && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Popup Name</Label>
                  <Input
                    value={selectedPopup.name}
                    onChange={(e) => updatePopupField('name', e.target.value)}
                    placeholder="e.g. Welcome Offer"
                    className="input-luxury"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={selectedPopup.content?.en?.title || ''}
                      onChange={(e) => updatePopupContent('en', 'title', e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic)</Label>
                    <Input
                      value={selectedPopup.content?.ar?.title || ''}
                      onChange={(e) => updatePopupContent('ar', 'title', e.target.value)}
                      className="input-luxury"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Body (English)</Label>
                    <Textarea
                      value={selectedPopup.content?.en?.body || ''}
                      onChange={(e) => updatePopupContent('en', 'body', e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body (Arabic)</Label>
                    <Textarea
                      value={selectedPopup.content?.ar?.body || ''}
                      onChange={(e) => updatePopupContent('ar', 'body', e.target.value)}
                      className="input-luxury"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setSelectedPopup(null); setIsCreating(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={savePopup} disabled={saving || !selectedPopup.name.trim()}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isCreating ? 'Create' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ManageCMS;
