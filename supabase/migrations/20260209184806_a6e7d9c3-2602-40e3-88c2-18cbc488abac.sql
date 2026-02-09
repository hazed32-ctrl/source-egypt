-- Allow public (anonymous) read access to CMS settings
CREATE POLICY "Public can read CMS settings"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (key LIKE 'cms_%');

-- Seed the home hero CMS content
INSERT INTO public.settings (key, value) VALUES (
  'cms_home_hero',
  '{"headline":"Make It","highlightWord":"Yours","subtitle":"Discover luxury living with Source Egypt''s curated collection of premium properties","primaryCta":{"label":"Explore Properties","link":"/properties"},"secondaryCta":{"label":"Find your property","link":"/find-property"},"stats":[{"value":500,"suffix":"+","label":"Properties"},{"value":2421,"suffix":"+","label":"Happy Clients"},{"value":15,"suffix":"+","label":"Years Experience"},{"value":98,"suffix":"%","label":"Satisfaction Rate"}],"heroSize":"default"}'
) ON CONFLICT (key) DO NOTHING;