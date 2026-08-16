REVOKE EXECUTE ON FUNCTION public.is_anomaly_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_anomaly_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_anomaly_admin() TO authenticated;