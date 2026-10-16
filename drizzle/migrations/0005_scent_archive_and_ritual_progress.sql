ALTER TABLE public.perfumes ADD COLUMN IF NOT EXISTS name_vi text, ADD COLUMN IF NOT EXISTS story_hook text, ADD COLUMN IF NOT EXISTS story_vi text, ADD COLUMN IF NOT EXISTS review_note text, ADD COLUMN IF NOT EXISTS bestseller_rank integer, ADD COLUMN IF NOT EXISTS details_pending boolean NOT NULL DEFAULT false;
ALTER TABLE public.saved_rituals ADD COLUMN IF NOT EXISTS completed_steps integer NOT NULL DEFAULT 0;
CREATE TABLE public.saved_capsules (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, chart_id text NOT NULL, perfume_ids text[] NOT NULL, ritual_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,chart_id,ritual_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.saved_capsules TO authenticated;
GRANT ALL ON public.saved_capsules TO service_role;
ALTER TABLE public.saved_capsules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their capsules" ON public.saved_capsules FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE FUNCTION public.clear_natal_capsules() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN DELETE FROM public.saved_capsules WHERE user_id=OLD.id; RETURN OLD; END; $$;
CREATE TRIGGER clear_natal_capsules_on_profile_delete BEFORE DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.clear_natal_capsules();