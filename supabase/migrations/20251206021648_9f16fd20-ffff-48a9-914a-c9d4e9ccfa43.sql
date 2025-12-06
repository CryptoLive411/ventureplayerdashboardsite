-- Create college_messages table for college-specific messaging between admin and player
CREATE TABLE public.college_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_tracking_id uuid NOT NULL REFERENCES public.college_tracking(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'player')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.college_messages ENABLE ROW LEVEL SECURITY;

-- Admins can manage all college messages
CREATE POLICY "Admins can manage all college messages"
ON public.college_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Athletes can view messages for their own colleges
CREATE POLICY "Athletes can view own college messages"
ON public.college_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = college_messages.player_id
  AND profiles.user_id = auth.uid()
));

-- Athletes can send messages for their own colleges
CREATE POLICY "Athletes can send college messages"
ON public.college_messages
FOR INSERT
WITH CHECK (
  sender_type = 'player' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = college_messages.player_id
    AND profiles.user_id = auth.uid()
  )
);