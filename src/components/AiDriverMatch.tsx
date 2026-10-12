import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { recommendDrivers, type MatchResult } from "@/lib/match.functions";

type D = { id: string; full_name: string };

export function AiDriverMatch({
  drivers,
  onRequest,
}: {
  drivers: D[];
  onRequest: (driverId: string) => void;
}) {
  const run = useServerFn(recommendDrivers);
  const [f, setF] = useState({ schedule: "", pickup: "", dropoff: "", budget: "" });
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<MatchResult | null>(null);

  const go = async () => {
    if (!f.schedule.trim() || !f.pickup.trim() || !f.dropoff.trim()) {
      setRes({ summary: "", recommendations: [], error: "Please fill in schedule, pickup and drop-off." });
      return;
    }
    setLoading(true);
    setRes(null);
    try {
      setRes(await run({ data: f }));
    } catch (e) {
      setRes({ summary: "", recommendations: [], error: e instanceof Error ? e.message : "Something went wrong." });
    }
    setLoading(false);
  };

  const input = (k: keyof typeof f, l: string, ph: string) => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</span>
      <input
        value={f[k]}
        placeholder={ph}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );

  const name = (id: string) => drivers.find((d) => d.id === id)?.full_name ?? "Driver";

  return (
    <div className="mt-5 rounded-2xl border border-primary/30 bg-surface-elevated p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="h-4 w-4 text-primary-glow" /> Find my best driver with AI
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Describe your commute and budget — we'll suggest drivers who fit your route and price.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {input("schedule", "Commute schedule", "Mon–Fri, leave 06:30, return 17:00")}
        {input("budget", "Budget", "e.g. R1200 per month")}
        {input("pickup", "Pickup area", "Soweto")}
        {input("dropoff", "Drop-off area", "Sandton CBD")}
      </div>
      <button
        onClick={go}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? "Finding matches…" : "Recommend drivers"}
      </button>

      {res?.error && <p className="mt-3 text-xs text-destructive">{res.error}</p>}
      {res && !res.error && (
        <div className="mt-4 space-y-2">
          {res.summary && <p className="text-xs text-muted-foreground">{res.summary}</p>}
          {res.recommendations.map((r) => (
            <div key={r.driver_id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{name(r.driver_id)}</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary-glow">
                  {Math.round(r.score)}% match
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px]">{r.suggested_plan}</p>
                <button
                  onClick={() => onRequest(r.driver_id)}
                  className="rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-medium text-primary-foreground"
                >
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
