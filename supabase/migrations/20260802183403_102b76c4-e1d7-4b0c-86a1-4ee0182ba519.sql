CREATE OR REPLACE FUNCTION public.shares_campaign_with(_other_user_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaign_members a
    JOIN public.campaign_members b ON a.campaign_id = b.campaign_id
    WHERE a.user_id = _user_id AND b.user_id = _other_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.shares_campaign_with(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_campaign_with(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_self_or_shared_campaign"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.shares_campaign_with(id, auth.uid())
  );

-- user_roles: explicitly deny client-side role modification
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

DROP POLICY IF EXISTS "user_roles_no_client_insert" ON public.user_roles;
CREATE POLICY "user_roles_no_client_insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "user_roles_no_client_update" ON public.user_roles;
CREATE POLICY "user_roles_no_client_update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "user_roles_no_client_delete" ON public.user_roles;
CREATE POLICY "user_roles_no_client_delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (false);