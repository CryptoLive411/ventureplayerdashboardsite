-- Add assigned_to_player column to checklist_items
ALTER TABLE public.checklist_items 
ADD COLUMN IF NOT EXISTS assigned_to_player boolean DEFAULT false;