import { createFileRoute } from "@tanstack/react-router";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

export const Route = createFileRoute("/api/public/write-reading")({
  server: {
    handlers: {
      OPTIONS: async () => new Response("ok", { headers: CORS }),
      POST: async ({ request }) => {
        const { handleWriteReading } = await import("@/lib/reading/write-reading.server");
        return handleWriteReading(request);
      },
    },
  },
});
