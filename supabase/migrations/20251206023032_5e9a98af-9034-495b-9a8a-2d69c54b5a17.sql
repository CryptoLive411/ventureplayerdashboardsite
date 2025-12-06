-- Create storage bucket for player documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-documents', 'player-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for player documents bucket
-- Players can upload their own documents
CREATE POLICY "Players can upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'player-documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::text = (storage.foldername(name))[1] 
    AND profiles.user_id = auth.uid()
  )
);

-- Players can view their own documents
CREATE POLICY "Players can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'player-documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::text = (storage.foldername(name))[1] 
    AND profiles.user_id = auth.uid()
  )
);

-- Players can delete their own documents
CREATE POLICY "Players can delete own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'player-documents' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id::text = (storage.foldername(name))[1] 
    AND profiles.user_id = auth.uid()
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all player documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'player-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Create documents table to track metadata
CREATE TABLE public.player_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES public.checklist_items(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_by_type TEXT NOT NULL CHECK (uploaded_by_type IN ('player', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_documents ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own documents
CREATE POLICY "Athletes can view own documents"
ON public.player_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = player_documents.player_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Athletes can upload their own documents
CREATE POLICY "Athletes can upload own documents"
ON public.player_documents
FOR INSERT
WITH CHECK (
  uploaded_by_type = 'player' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = player_documents.player_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Athletes can delete their own documents
CREATE POLICY "Athletes can delete own documents"
ON public.player_documents
FOR DELETE
USING (
  uploaded_by_type = 'player'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = player_documents.player_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
ON public.player_documents
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));