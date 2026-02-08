-- Tighten notifications INSERT: only service_role (used by SECURITY DEFINER triggers) can insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Tighten settings SELECT: require authentication  
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
CREATE POLICY "Authenticated users can view settings" 
  ON public.settings 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);