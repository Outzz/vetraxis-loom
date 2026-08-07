ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_str_score_check;
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_dex_score_check;
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_int_score_check;
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_res_score_check;
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_cha_score_check;
ALTER TABLE public.characters DROP CONSTRAINT IF EXISTS characters_per_score_check;
ALTER TABLE public.characters ADD CONSTRAINT characters_str_score_check CHECK (str_score BETWEEN 0 AND 30);
ALTER TABLE public.characters ADD CONSTRAINT characters_dex_score_check CHECK (dex_score BETWEEN 0 AND 30);
ALTER TABLE public.characters ADD CONSTRAINT characters_int_score_check CHECK (int_score BETWEEN 0 AND 30);
ALTER TABLE public.characters ADD CONSTRAINT characters_res_score_check CHECK (res_score BETWEEN 0 AND 30);
ALTER TABLE public.characters ADD CONSTRAINT characters_cha_score_check CHECK (cha_score BETWEEN 0 AND 30);
ALTER TABLE public.characters ADD CONSTRAINT characters_per_score_check CHECK (per_score BETWEEN 0 AND 30);

CREATE TABLE public.campaign_encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL UNIQUE REFERENCES public.campaigns(id) ON DELETE CASCADE,
  state jsonb NOT NULL DEFAULT '{"round":1,"turnIndex":0,"started":false,"combatants":[],"log":[]}'::jsonb,
  updated_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_encounters TO authenticated;
GRANT ALL ON public.campaign_encounters TO service_role;
ALTER TABLE public.campaign_encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_encounters_select_members" ON public.campaign_encounters FOR SELECT TO authenticated USING (public.is_campaign_member(campaign_id, auth.uid()) OR public.is_campaign_master(campaign_id, auth.uid()));
CREATE POLICY "campaign_encounters_insert_members" ON public.campaign_encounters FOR INSERT TO authenticated WITH CHECK ((public.is_campaign_member(campaign_id, auth.uid()) OR public.is_campaign_master(campaign_id, auth.uid())) AND updated_by = auth.uid());
CREATE POLICY "campaign_encounters_update_members" ON public.campaign_encounters FOR UPDATE TO authenticated USING (public.is_campaign_member(campaign_id, auth.uid()) OR public.is_campaign_master(campaign_id, auth.uid())) WITH CHECK ((public.is_campaign_member(campaign_id, auth.uid()) OR public.is_campaign_master(campaign_id, auth.uid())) AND updated_by = auth.uid());
CREATE POLICY "campaign_encounters_delete_master" ON public.campaign_encounters FOR DELETE TO authenticated USING (public.is_campaign_master(campaign_id, auth.uid()));
CREATE TRIGGER trg_campaign_encounters_updated BEFORE UPDATE ON public.campaign_encounters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_encounters;