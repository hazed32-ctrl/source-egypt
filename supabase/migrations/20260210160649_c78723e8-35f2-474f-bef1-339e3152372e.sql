
-- Add property_type and tags columns to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_type text;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_tags ON public.properties USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties (price);
