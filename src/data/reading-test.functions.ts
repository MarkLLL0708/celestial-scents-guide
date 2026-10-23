import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { testModels } from "@/lib/reading-test/fixtures";

export const readingTestAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { user_id: context.userId, role: "admin" });
    if (error || !data) throw new Error("Admin access required");
    return { admin: true, voiceBankReady: false as const };
  });
export const generateReadingTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ fixtureId: z.number().int().min(1).max(8), language: z.enum(["en", "vi"]), model: z.enum(testModels) }).strict())
  .handler(async ({ data, context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { user_id: context.userId, role: "admin" });
    if (error || !admin) throw new Error("Admin access required");
    const { runFixture } = await import("@/lib/reading-test/generate.server");
    return runFixture(data.fixtureId, data.language, data.model);
  });