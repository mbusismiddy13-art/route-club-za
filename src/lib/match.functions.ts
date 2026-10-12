import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  schedule: z.string().trim().min(1).max(500),
  pickup: z.string().trim().min(1).max(200),
  dropoff: z.string().trim().min(1).max(200),
  budget: z.string().trim().max(100).optional().default(""),
});

export type Recommendation = { driver_id: string; score: number; reason: string; suggested_plan: string };
export type MatchResult = { summary: string; recommendations: Recommendation[]; error?: string };

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "recommendations"],
  properties: {
    summary: { type: "string" },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["driver_id", "score", "reason", "suggested_plan"],
        properties: {
          driver_id: { type: "string" },
          score: { type: "number" },
          reason: { type: "string" },
          suggested_plan: { type: "string" },
        },
      },
    },
  },
};

export const recommendDrivers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<MatchResult> => {
    const { data: drivers } = await context.supabase.from("drivers").select("*").limit(60);
    const list = (drivers ?? []).map((d: Record<string, unknown>) => ({
      id: d.id,
      name: d.full_name,
      online: d.is_online,
      in_house: d.is_in_house ?? false,
      rating: d.rating,
      seats: d.seats,
      vehicle: [d.vehicle_make, d.vehicle_model].filter(Boolean).join(" "),
      areas: d.service_areas ?? d.current_location,
      bio: d.bio,
      price_per_trip: d.price_per_trip,
      retainer_weekly: d.retainer_weekly,
      retainer_monthly: d.retainer_monthly,
    }));
    if (list.length === 0) return { summary: "No drivers are registered yet.", recommendations: [] };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { summary: "", recommendations: [], error: "AI is not configured." };

    const prompt = `You match South African commuters with transport drivers for NalaFlow.
NalaFlow in-house drivers are covered by NalaFlow subscriptions; independent drivers charge their own per-trip/weekly/monthly retainer (Rands).
Recommend up to 3 best-fit drivers from the list ONLY (use their exact id). Consider service-area overlap with pickup/drop-off, price vs budget, rating, seats and online status. score is 0-100. reason: one or two short sentences. suggested_plan: e.g. "Monthly retainer R1500" or "NalaFlow subscription". summary: one sentence.

Commuter:
Schedule: ${data.schedule}
Pickup: ${data.pickup}
Drop-off: ${data.dropoff}
Budget: ${data.budget || "not given"}

Drivers JSON:
${JSON.stringify(list)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name: "driver_matches", strict: true, schema } },
      }),
    });
    if (!res.ok || !res.body) {
      const msg =
        res.status === 429
          ? "Too many requests — please try again shortly."
          : res.status === 402
            ? "AI credits are exhausted for this workspace."
            : `AI request failed (${res.status}).`;
      return { summary: "", recommendations: [], error: msg };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let refused = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          if (ev.type === "response.refusal.delta") refused = true;
        } catch {
          /* partial */
        }
      }
    }
    if (refused) return { summary: "", recommendations: [], error: "The AI declined this request." };
    try {
      const parsed = JSON.parse(text) as MatchResult;
      const ids = new Set(list.map((d) => d.id));
      parsed.recommendations = parsed.recommendations.filter((r) => ids.has(r.driver_id)).slice(0, 3);
      return parsed;
    } catch {
      return { summary: "", recommendations: [], error: "Couldn't read the AI's answer. Please try again." };
    }
  });
