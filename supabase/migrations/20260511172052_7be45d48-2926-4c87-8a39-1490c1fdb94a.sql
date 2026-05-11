
-- 1. Restrict pending_admin_requests inserts to status='pending'
DROP POLICY IF EXISTS "Users can create own request" ON public.pending_admin_requests;
CREATE POLICY "Users can create own request"
ON public.pending_admin_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 2. Add UPDATE policies for player_documents (table)
CREATE POLICY "Athletes can update own documents"
ON public.player_documents
FOR UPDATE
TO authenticated
USING (
  uploaded_by_type = 'player' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = player_documents.player_id AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  uploaded_by_type = 'player' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = player_documents.player_id AND profiles.user_id = auth.uid()
  )
);

-- 3. Add UPDATE policy for player-documents storage bucket
CREATE POLICY "Players can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'player-documents' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (profiles.id)::text = (storage.foldername(objects.name))[1]
      AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'player-documents' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (profiles.id)::text = (storage.foldername(objects.name))[1]
      AND profiles.user_id = auth.uid()
  )
);

-- 4. Restrict Realtime channel subscriptions: only allow users to join their own user-scoped topics.
-- The app uses postgres_changes on messages/notifications (already RLS-protected on the source tables),
-- but enabling RLS on realtime.messages with a default-deny policy ensures broadcast/presence channels
-- cannot be used to exfiltrate data across users.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive postgres_changes" ON realtime.messages;
CREATE POLICY "Authenticated users can receive postgres_changes"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow postgres_changes (extension = 'postgres_changes') for any authenticated user;
  -- per-row visibility is enforced by RLS on the source tables (messages, notifications).
  -- Block broadcast/presence channels by default.
  extension = 'postgres_changes'
);
