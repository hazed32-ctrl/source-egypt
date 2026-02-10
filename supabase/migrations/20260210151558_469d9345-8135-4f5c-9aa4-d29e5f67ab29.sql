
-- Allow sales agents to update properties they created
CREATE POLICY "Agents can update their own properties"
ON public.properties
FOR UPDATE
USING (created_by = auth.uid() AND has_role(auth.uid(), 'sales_agent'::app_role))
WITH CHECK (created_by = auth.uid() AND has_role(auth.uid(), 'sales_agent'::app_role));
