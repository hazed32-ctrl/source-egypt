-- Add policy for public property viewing (for listings pages)
-- This allows anyone to view properties without authentication
CREATE POLICY "Anyone can view public properties"
ON public.properties
FOR SELECT
USING (true);