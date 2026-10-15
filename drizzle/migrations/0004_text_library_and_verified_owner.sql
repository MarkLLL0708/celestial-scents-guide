CREATE TABLE public.text_library (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('reading_section','today_block','trait_line','day_summary','ask_answer')), key text NOT NULL, lang text NOT NULL CHECK(lang IN ('en','vi')), body text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved')), flags text[] NOT NULL DEFAULT '{}', model text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(kind,key,lang), CHECK(status <> 'approved' OR cardinality(flags)=0)
);
GRANT SELECT ON public.text_library TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.text_library TO authenticated;
GRANT ALL ON public.text_library TO service_role;
ALTER TABLE public.text_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY approved_library ON public.text_library FOR SELECT TO anon,authenticated USING(status='approved');
CREATE POLICY admin_library ON public.text_library FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.library_generation_state (id text PRIMARY KEY DEFAULT 'library', lease_until timestamptz, pause_reason text);
GRANT SELECT,INSERT,UPDATE ON public.library_generation_state TO authenticated;
GRANT ALL ON public.library_generation_state TO service_role;
ALTER TABLE public.library_generation_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_generation_state ON public.library_generation_state FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.acquire_library_generation() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 INSERT INTO public.library_generation_state(id) VALUES('library') ON CONFLICT DO NOTHING;
 UPDATE public.library_generation_state SET lease_until=now()+interval '10 minutes' WHERE id='library' AND pause_reason IS NULL AND (lease_until IS NULL OR lease_until<now());
 RETURN FOUND; END $$;
REVOKE ALL ON FUNCTION public.acquire_library_generation() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.acquire_library_generation() TO authenticated;
CREATE FUNCTION public.assign_verified_natal_owner() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF lower(NEW.email)='marklyy0708@gmail.com' AND NEW.email_confirmed_at IS NOT NULL THEN
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'admin') ON CONFLICT DO NOTHING;
 END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.assign_verified_natal_owner() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER assign_verified_natal_owner AFTER INSERT OR UPDATE OF email_confirmed_at,email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_verified_natal_owner();