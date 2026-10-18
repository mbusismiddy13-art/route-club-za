import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/AppShell";

type Row = {
  id: string;
  full_name: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  service_areas: string | null;
  current_location: string | null;
  approval_status: string;
  is_in_house: boolean;
  created_at: string;
};

export function DriverApprovals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [docs, setDocs] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("drivers").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    const { data: d } = await supabase.from("driver_documents").select("driver_id");
    const c: Record<string, number> = {};
    (d ?? []).forEach((x) => (c[x.driver_id] = (c[x.driver_id] ?? 0) + 1));
    setDocs(c);
  };
  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, patch: Record<string, unknown>) => {
    setErr(null);
    const { error } = await supabase
      .from("drivers")
      .update({ ...patch, reviewed_at: new Date().toISOString() } as never)
      .eq("id", id);
    if (error) setErr(error.message);
    load();
  };

  const shown = rows.filter((r) => r.approval_status === tab);
  const count = (s: string) => rows.filter((r) => r.approval_status === s).length;

  return (
    <Section
      title="Driver applications"
      className="xl:col-span-2"
      action={<span className="text-xs text-muted-foreground">{count("pending")} pending review</span>}
    >
      <div className="mb-3 flex gap-1.5">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "border border-border bg-surface-elevated"
            }`}
          >
            {t} ({count(t)})
          </button>
        ))}
      </div>
      {err && <p className="mb-2 text-xs text-destructive">{err}</p>}
      <div className="space-y-2.5">
        {shown.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing here.
          </p>
        )}
        {shown.map((d) => (
          <div
            key={d.id}
            className="grid items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-4 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {d.full_name}
                {d.is_in_house && <BadgeCheck className="h-3.5 w-3.5 text-primary-glow" />}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {[d.vehicle_make, d.vehicle_model].filter(Boolean).join(" ") || "Vehicle not set"}
                {d.vehicle_plate ? ` · ${d.vehicle_plate}` : ""} · {d.service_areas || d.current_location || "No area"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {docs[d.id] ?? 0} documents uploaded · applied {new Date(d.created_at).toLocaleDateString("en-ZA")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => update(d.id, { is_in_house: !d.is_in_house })}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface"
              >
                {d.is_in_house ? "Remove in‑house" : "Make in‑house"}
              </button>
              {d.approval_status !== "rejected" && (
                <button
                  onClick={() => update(d.id, { approval_status: "rejected", is_online: false })}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface"
                >
                  <XCircle className="h-3.5 w-3.5 text-destructive" /> Reject
                </button>
              )}
              {d.approval_status !== "approved" && (
                <button
                  onClick={() => update(d.id, { approval_status: "approved" })}
                  className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
