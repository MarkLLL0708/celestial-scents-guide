CREATE TABLE public.ask_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  source text NOT NULL CHECK (source IN ('library','ai','fallback','limited')),
  lang text NOT NULL CHECK (lang IN ('en','vi')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ask_usage TO authenticated;
GRANT ALL ON public.ask_usage TO service_role;
ALTER TABLE public.ask_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX ask_usage_subject_time ON public.ask_usage (subject, created_at DESC);
CREATE INDEX ask_usage_time ON public.ask_usage (created_at DESC);
CREATE POLICY "Admins read ask usage" ON public.ask_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));