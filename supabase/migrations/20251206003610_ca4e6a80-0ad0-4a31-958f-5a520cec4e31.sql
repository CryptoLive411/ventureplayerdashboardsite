-- Create table for pending staff/admin requests
CREATE TABLE public.pending_admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pending_admin_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage requests
CREATE POLICY "Admins can view all requests"
ON public.pending_admin_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update requests"
ON public.pending_admin_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete requests"
ON public.pending_admin_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to create their own request
CREATE POLICY "Users can create own request"
ON public.pending_admin_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own request status
CREATE POLICY "Users can view own request"
ON public.pending_admin_requests
FOR SELECT
USING (auth.uid() = user_id);