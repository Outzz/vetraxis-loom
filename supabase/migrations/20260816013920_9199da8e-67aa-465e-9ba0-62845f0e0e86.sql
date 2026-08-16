CREATE OR REPLACE FUNCTION public.is_anomaly_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce((auth.jwt() ->> 'email'), '')) = 'blueoutz.kka@gmail.com';
$$;

GRANT EXECUTE ON FUNCTION public.is_anomaly_admin() TO authenticated;

CREATE TABLE public.custom_creatures (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_creatures TO authenticated;
GRANT ALL ON public.custom_creatures TO service_role;

ALTER TABLE public.custom_creatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_creatures_select_authenticated ON public.custom_creatures
  FOR SELECT TO authenticated USING (true);

CREATE POLICY custom_creatures_insert_admin ON public.custom_creatures
  FOR INSERT TO authenticated WITH CHECK (public.is_anomaly_admin() AND created_by = auth.uid());

CREATE POLICY custom_creatures_update_admin ON public.custom_creatures
  FOR UPDATE TO authenticated USING (public.is_anomaly_admin()) WITH CHECK (public.is_anomaly_admin());

CREATE POLICY custom_creatures_delete_admin ON public.custom_creatures
  FOR DELETE TO authenticated USING (public.is_anomaly_admin());

CREATE TRIGGER trg_custom_creatures_updated
  BEFORE UPDATE ON public.custom_creatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();