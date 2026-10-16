import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { privateChartSchema, prefsSchema } from "./chart-privacy";
import { parseCatalogue } from "@/lib/match/catalogue";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ritualFor } from "./astro-mock";

export const publicPerfumes = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Cloud configuration missing");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${key}` && key.startsWith("sb_"))
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await client.from("perfumes").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
});

export const savedCharts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_charts")
      .select("id,nickname,chart,prefs,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });
export const saveChartRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        id: z.string().max(100),
        nickname: z.string().max(60),
        chart: privateChartSchema,
        prefs: prefsSchema,
      })
      .strict(),
  )
  .handler(async ({ data, context }) => {
    const row = {
      ...data,
      chart: JSON.parse(JSON.stringify(data.chart)),
      prefs: JSON.parse(JSON.stringify(data.prefs)),
      user_id: context.userId,
    };
    const { error } = await context.supabase.from("saved_charts").upsert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const savedRitualIds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("saved_rituals").select("ritual_id");
    if (error) throw new Error(error.message);
    return data.map((r) => r.ritual_id);
  });
export const saveRitualRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().min(1).max(100) }).strict())
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_rituals")
      .upsert({ user_id: context.userId, ritual_id: data.id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const deleteMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const removed = await context.supabase.from("saved_capsules").delete().eq("user_id", context.userId);
    if (removed.error) throw new Error(removed.error.message);
    const { error } = await context.supabase.rpc("delete_my_natal_data");
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const accountInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("display_name,language")
      .eq("id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    const { data: admin } = await context.supabase.rpc("has_role", {
      user_id: context.userId,
      role: "admin",
    });
    return { profile, admin: admin === true };
  });
export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ display_name: z.string().max(60), language: z.enum(["en", "vi"]) }).strict(),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const importCatalogue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ csv: z.string().max(2000000) }).strict())
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      user_id: context.userId,
      role: "admin",
    });
    if (!admin) throw new Error("Forbidden");
    const parsed = parseCatalogue(data.csv);
    if (parsed.errors.length) return { imported: 0, errors: parsed.errors };
    if (parsed.perfumes.length) {
      const { error } = await context.supabase.from("perfumes").upsert(parsed.perfumes);
      if (error) throw new Error(error.message);
    }
    return { imported: parsed.perfumes.length, errors: [] };
  });

export const capsuleSchema = z.object({ chartId: z.string().min(1).max(100), ritualId: z.string().min(1).max(100), perfumeIds: z.array(z.string().min(1).max(100)).min(3).max(5).refine((ids) => new Set(ids).size === ids.length) }).strict();
export const saveCapsuleRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(capsuleSchema)
  .handler(async ({ data, context }) => {
    if (!ritualFor(data.ritualId, "en")) throw new Error("Invalid ritual");
    const { error } = await context.supabase.from("saved_capsules").upsert({ user_id: context.userId, chart_id: data.chartId, ritual_id: data.ritualId, perfume_ids: data.perfumeIds }, { onConflict: "user_id,chart_id,ritual_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const savedCapsuleRecords = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("saved_capsules").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
});
export const getRitualProgress = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().min(1).max(100) }).strict()).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from("saved_rituals").select("completed_steps").eq("ritual_id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  return row?.completed_steps ?? 0;
});
export const setRitualProgress = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().min(1).max(100), completed: z.number().int().min(0) }).strict()).handler(async ({ data, context }) => {
  const ritual = ritualFor(data.id, "en");
  if (!ritual || data.completed > ritual.steps.length) throw new Error("Invalid progress");
  const { error } = await context.supabase.from("saved_rituals").upsert({ user_id: context.userId, ritual_id: data.id, completed_steps: data.completed });
  if (error) throw new Error(error.message);
  return { ok: true };
});
