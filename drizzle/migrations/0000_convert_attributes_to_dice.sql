CREATE OR REPLACE FUNCTION pg_temp.to_die(v integer) RETURNS integer LANGUAGE sql AS $$
  SELECT CASE WHEN v <= 0 THEN 4 WHEN v = 1 THEN 6 WHEN v = 2 THEN 8 WHEN v = 3 THEN 10 ELSE 12 END $$;
UPDATE public.characters SET
  str_score = pg_temp.to_die(GREATEST(str_score, dex_score, res_score)),
  int_score = pg_temp.to_die(int_score),
  cha_score = pg_temp.to_die(cha_score),
  skills = '{}'::jsonb;
UPDATE public.characters SET dex_score = str_score, res_score = str_score;
ALTER TABLE public.characters ALTER COLUMN str_score SET DEFAULT 6, ALTER COLUMN dex_score SET DEFAULT 6, ALTER COLUMN int_score SET DEFAULT 6, ALTER COLUMN res_score SET DEFAULT 6, ALTER COLUMN cha_score SET DEFAULT 6;