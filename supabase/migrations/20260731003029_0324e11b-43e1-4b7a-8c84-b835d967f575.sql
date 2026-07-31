-- Allow any authenticated user to join a campaign via invite code
CREATE OR REPLACE FUNCTION public.join_campaign_by_code(_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _campaign_id UUID;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT id INTO _campaign_id
  FROM public.campaigns
  WHERE upper(invite_code) = upper(btrim(_code));

  IF _campaign_id IS NULL THEN
    RAISE EXCEPTION 'Código de convite inválido';
  END IF;

  INSERT INTO public.campaign_members (campaign_id, user_id, role)
  VALUES (_campaign_id, _uid, 'player')
  ON CONFLICT (campaign_id, user_id) DO NOTHING;

  RETURN _campaign_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_campaign_by_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_campaign_by_code(TEXT) TO authenticated;

-- Members of a campaign can see characters belonging to that campaign
DROP POLICY IF EXISTS "characters_select_owner_or_master" ON public.characters;
CREATE POLICY "characters_select_owner_or_campaign"
  ON public.characters FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_member(campaign_id, auth.uid()))
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id, auth.uid()))
  );