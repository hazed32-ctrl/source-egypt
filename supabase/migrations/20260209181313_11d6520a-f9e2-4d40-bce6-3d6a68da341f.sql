
-- Create property_photos table
CREATE TABLE public.property_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  note TEXT,
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage property photos"
ON public.property_photos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Clients can view photos for their assigned properties only
CREATE POLICY "Clients can view photos for assigned properties"
ON public.property_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_photos.property_id
      AND p.assigned_user_id = auth.uid()
  )
);

-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', false);

-- Admin can upload photos
CREATE POLICY "Admins can upload property photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Admin can manage (update/delete) property photos
CREATE POLICY "Admins can manage property photo files"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'property-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'property-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Clients can view photos in folders matching their assigned property IDs
CREATE POLICY "Clients can view their property photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'property-photos'
  AND EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.assigned_user_id = auth.uid()
      AND (storage.foldername(name))[1] = p.id::text
  )
);
