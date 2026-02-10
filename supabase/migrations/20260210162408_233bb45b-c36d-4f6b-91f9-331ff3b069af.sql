
-- ============ CMS Pages Table ============
CREATE TABLE public.cms_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL DEFAULT '',
  meta_description_en TEXT,
  meta_description_ar TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published CMS pages"
  ON public.cms_pages FOR SELECT
  USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage CMS pages"
  ON public.cms_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ CMS Popups Table ============
CREATE TABLE public.cms_popups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  trigger TEXT NOT NULL DEFAULT 'delay',
  trigger_value INTEGER,
  show_once BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active popups"
  ON public.cms_popups FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage popups"
  ON public.cms_popups FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ Sync Logs Table ============
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  rows_processed INTEGER NOT NULL DEFAULT 0,
  rows_updated INTEGER NOT NULL DEFAULT 0,
  rows_failed INTEGER NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync logs"
  ON public.sync_logs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_popups_updated_at
  BEFORE UPDATE ON public.cms_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default CMS pages
INSERT INTO public.cms_pages (slug, title_en, title_ar, meta_description_en, meta_description_ar, sections, is_published)
VALUES 
  ('home', 'Home', 'الرئيسية', 'Source EG - Luxury Real Estate in Egypt', 'سورس إيجي - العقارات الفاخرة في مصر',
   '[{"id":"sec-1","pageId":"page-home","type":"hero","order":1,"isVisible":true,"content":{"en":{"headline":"Discover Luxury Living","subheadline":"Premium properties across Egypt","ctaText":"Explore Properties","ctaLink":"/properties"},"ar":{"headline":"اكتشف الحياة الفاخرة","subheadline":"عقارات مميزة في أنحاء مصر","ctaText":"استكشف العقارات","ctaLink":"/properties"}},"settings":{"backgroundImage":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920","overlayOpacity":0.6}},{"id":"sec-2","pageId":"page-home","type":"properties","order":2,"isVisible":true,"content":{"en":{"title":"Featured Properties","subtitle":"Handpicked for you"},"ar":{"title":"العقارات المميزة","subtitle":"مختارة خصيصاً لك"}},"settings":{"limit":6,"featured":true}}]'::jsonb,
   true),
  ('about', 'About Us', 'من نحن', null, null, '[]'::jsonb, true);
