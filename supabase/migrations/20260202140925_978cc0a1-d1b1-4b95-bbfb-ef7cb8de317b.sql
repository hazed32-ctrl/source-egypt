-- Add UTM and attribution columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS referrer_domain TEXT,
ADD COLUMN IF NOT EXISTS landing_page TEXT,
ADD COLUMN IF NOT EXISTS last_page_before_submit TEXT,
ADD COLUMN IF NOT EXISTS lead_device_type TEXT,
ADD COLUMN IF NOT EXISTS browser_language TEXT,
ADD COLUMN IF NOT EXISTS last_events_summary JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Create indexes for faster attribution queries
CREATE INDEX IF NOT EXISTS idx_leads_session ON public.leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);

-- Create a table to store session events for attribution (privacy-safe, minimal data)
CREATE TABLE IF NOT EXISTS public.session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_path TEXT,
  entity_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert session events (for tracking)
CREATE POLICY "Anyone can insert session events"
ON public.session_events FOR INSERT
WITH CHECK (true);

-- Only analytics roles can view session events
CREATE POLICY "Analytics roles can view session events"
ON public.session_events FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'marketer'::app_role) OR 
  has_role(auth.uid(), 'sales_manager'::app_role)
);

-- Sales agents can view events for their assigned leads
CREATE POLICY "Sales agents can view events for assigned leads"
ON public.session_events FOR SELECT
USING (
  has_role(auth.uid(), 'sales_agent'::app_role) AND
  session_id IN (
    SELECT l.session_id FROM public.leads l WHERE l.assigned_agent_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_session_events_session ON public.session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created ON public.session_events(created_at DESC);

-- Auto-cleanup old session events (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_session_events()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.session_events 
  WHERE created_at < now() - interval '30 days';
$$;