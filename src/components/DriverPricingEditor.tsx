import { useState } from "react";
import { Loader2, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type DriverPricing = {
  id: string;
  is_in_house?: boolean;
  bio?: string | null;
  service_areas?: string | null;
  price_per_trip?: number | null;
  retainer_weekly?: number | null;
  retainer_monthly?: number | null;
};

const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function DriverPricingEditor({ driver }: { driver: DriverPricing }) {
  const [f, setF] = useState({
    bio: driver.bio ?? "",
    service_areas: driver.service_areas ?? "",
    price_per_trip: driver.price_per_trip?.toString() ?? "",
    retainer_weekly: driver.retainer_weekly?.toString() ?? "",
    retainer_monthly: driver.retainer_monthly?.toString() ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("drivers")
      .update({
        bio: f.bio || null,
        service_areas: f.service_areas || null,
        price_per_trip: num(f.price_per_trip),
        retainer_weekly: num(f.retainer_weekly),
        retainer_monthly: num(f.retainer_monthly),
      } as never)
      .eq("id", driver.id);
    setSaving(false);
    setMsg(error ? error.message : "Saved — passengers now see your updated rates.");
  };

  const field = (k: keyof typeof f, l: string, ph: string, type = "text") => (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={f[k]}
        placeholder={ph}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );

  return (
    <div className="mb-5 rounded-2xl border border-border bg-surface-elevated p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Your rates & profile</p>
        {driver.is_in_house ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary-glow">
            <BadgeCheck className="h-3 w-3" /> NalaFlow in‑house
          </span>
        ) : (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
            Independent provider
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {driver.is_in_house
          ? "You serve NalaFlow subscription members. Rates below apply to direct retainer clients."
          : "You set your own prices. Clients agree a retainer directly with you — no platform subscription."}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {field("price_per_trip", "Per trip (R)", "e.g. 45", "number")}
        {field("retainer_weekly", "Weekly retainer (R)", "e.g. 400", "number")}
        {field("retainer_monthly", "Monthly retainer (R)", "e.g. 1500", "number")}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {field("service_areas", "Service areas", "Soweto, Sandton, Randburg")}
        {field("bio", "About you", "10 years experience, school runs…")}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save rates
        </button>
        {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      </div>
    </div>
  );
}
