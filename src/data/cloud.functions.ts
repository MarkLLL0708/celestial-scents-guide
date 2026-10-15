import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { privateChartSchema, prefsSchema } from "./chart-privacy";
import { parseCatalogue } from "@/lib/match/catalogue";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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
