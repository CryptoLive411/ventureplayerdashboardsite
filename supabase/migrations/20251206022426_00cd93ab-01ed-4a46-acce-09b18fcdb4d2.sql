-- Add player_notes and player_files columns to checklist_items for athlete responses
ALTER TABLE public.checklist_items 
ADD COLUMN IF NOT EXISTS player_notes text,
ADD COLUMN IF NOT EXISTS player_files text[];

-- Update RLS policy to allow athletes to update their assigned tasks
CREATE POLICY "Athletes can update assigned tasks"
ON public.checklist_items
FOR UPDATE
USING (
  assigned_to_player = true AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = checklist_items.player_id
    AND profiles.user_id = auth.uid()
  )
);