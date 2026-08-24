CREATE TABLE public.campaign_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Sessão',
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recordings TO authenticated;
GRANT ALL ON public.campaign_recordings TO service_role;

ALTER TABLE public.campaign_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY campaign_recordings_select_members ON public.campaign_recordings
  FOR SELECT TO authenticated
  USING (public.is_campaign_member(campaign_id, auth.uid()) OR public.is_campaign_master(campaign_id, auth.uid()));

CREATE POLICY campaign_recordings_insert_master ON public.campaign_recordings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_campaign_master(campaign_id, auth.uid()) AND recorded_by = auth.uid());

CREATE POLICY campaign_recordings_update_master ON public.campaign_recordings
  FOR UPDATE TO authenticated
  USING (public.is_campaign_master(campaign_id, auth.uid()))
  WITH CHECK (public.is_campaign_master(campaign_id, auth.uid()));

CREATE POLICY campaign_recordings_delete_master ON public.campaign_recordings
  FOR DELETE TO authenticated
  USING (public.is_campaign_master(campaign_id, auth.uid()));

CREATE TRIGGER trg_campaign_recordings_updated
  BEFORE UPDATE ON public.campaign_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_campaign_recordings_campaign ON public.campaign_recordings(campaign_id, created_at DESC);

CREATE POLICY "recordings_read_members" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'session-recordings'
    AND (
      public.is_campaign_member(((storage.foldername(name))[1])::uuid, auth.uid())
      OR public.is_campaign_master(((storage.foldername(name))[1])::uuid, auth.uid())
    )
  );

CREATE POLICY "recordings_insert_master" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'session-recordings'
    AND public.is_campaign_master(((storage.foldername(name))[1])::uuid, auth.uid())
  );

CREATE POLICY "recordings_delete_master" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'session-recordings'
    AND public.is_campaign_master(((storage.foldername(name))[1])::uuid, auth.uid())
  );