-- Step 2: Add agent assignment columns

-- Add assigned_agent_id to profiles (links client to their agent)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES auth.users(id);

-- Add agent-related columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS budget_min numeric,
ADD COLUMN IF NOT EXISTS budget_max numeric,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS property_type text,
ADD COLUMN IF NOT EXISTS area_sqm numeric,
ADD COLUMN IF NOT EXISTS payment_preference text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'contact_form',
ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS agent_name text,
ADD COLUMN IF NOT EXISTS is_converted boolean DEFAULT false;

-- Create property_progress_status type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_progress_status') THEN
    CREATE TYPE property_progress_status AS ENUM ('off_plan', 'ready_to_deliver', 'ready_to_live');
  END IF;
END $$;

-- Add progress_status to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS progress_status text DEFAULT 'off_plan';

-- Create function to calculate progress percentage
CREATE OR REPLACE FUNCTION public.get_property_progress(status text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN status = 'off_plan' THEN 30
    WHEN status = 'ready_to_deliver' THEN 70
    WHEN status = 'ready_to_live' THEN 100
    ELSE 0
  END;
$$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_agent ON public.profiles(assigned_agent_id);

-- RLS policies for sales roles
-- Sales agents can view leads assigned to them
CREATE POLICY "Sales agents can view assigned leads"
ON public.leads
FOR SELECT
TO authenticated
USING (
  assigned_agent_id = auth.uid() 
  OR has_role(auth.uid(), 'sales_manager')
  OR has_role(auth.uid(), 'marketer')
  OR has_role(auth.uid(), 'admin')
);

-- Sales agents can update their assigned leads
CREATE POLICY "Sales agents can update assigned leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  assigned_agent_id = auth.uid() 
  OR has_role(auth.uid(), 'sales_manager')
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  assigned_agent_id = auth.uid() 
  OR has_role(auth.uid(), 'sales_manager')
  OR has_role(auth.uid(), 'admin')
);