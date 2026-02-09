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
import { CMSPage, CMSPopup, CMSSection, mockCMSApi } from '@/lib/api';

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

const ManageCMS = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [popups, setPopups] = useState<CMSPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<CMSPopup | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesData, popupsData] = await Promise.all([
        mockCMSApi.getPages(),
        mockCMSApi.getPopups(),
      ]);
      setPages(pagesData);
      setPopups(popupsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch CMS data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSectionVisibility = (pageId: string, sectionId: string) => {
    setPages(
      pages.map((page) => {
        if (page.id === pageId) {
          return {
            ...page,
            sections: page.sections.map((section) =>
              section.id === sectionId
                ? { ...section, isVisible: !section.isVisible }
                : section
            ),
          };
        }
        return page;
      })
    );
    toast({
      title: 'Success',
      description: 'Section visibility updated',
    });
  };

  const togglePopupActive = (popupId: string) => {
    setPopups(
      popups.map((popup) =>
        popup.id === popupId ? { ...popup, isActive: !popup.isActive } : popup
      )
    );
    toast({
      title: 'Success',
      description: 'Popup status updated',
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
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              pages.map((page) => (
                <Card key={page.id} className="glass-card border-border/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {page.title.en}
                        <Badge
                          variant="outline"
                          className={
                            page.isPublished
                              ? 'border-success/50 text-success'
                              : 'border-warning/50 text-warning'
                          }
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
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
                                {sectionTypeLabels[section.type]}
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
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid gap-4">
                {popups.map((popup) => (
                  <Card key={popup.id} className="glass-card border-border/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {popup.imageUrl && (
                            <img
                              src={popup.imageUrl}
                              alt={popup.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-foreground">{popup.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {popup.content.en.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="border-border/50">
                                Trigger: {popup.trigger}
                                {popup.triggerValue &&
                                  popup.trigger === 'delay' &&
                                  ` (${popup.triggerValue}ms)`}
                              </Badge>
                              {popup.showOnce && (
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
                              {popup.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <Switch
                              checked={popup.isActive}
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

                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Popup
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Popup Edit Dialog */}
        <Dialog open={!!selectedPopup} onOpenChange={() => setSelectedPopup(null)}>
          <DialogContent className="glass-card border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Popup</DialogTitle>
            </DialogHeader>
            {selectedPopup && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title (English)</Label>
                    <Input
                      value={selectedPopup.content.en.title}
                      className="input-luxury"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (Arabic)</Label>
                    <Input
                      value={selectedPopup.content.ar.title}
                      className="input-luxury"
                      dir="rtl"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Body (English)</Label>
                  <Textarea
                    value={selectedPopup.content.en.body}
                    className="input-luxury"
                    readOnly
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Full editing capabilities coming soon. This is a preview of the CMS
                  interface.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default ManageCMS;
