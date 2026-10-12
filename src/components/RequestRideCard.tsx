import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Car, MapPin, Star, Loader2, X, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Section } from "@/components/AppShell";
import { AiDriverMatch } from "@/components/AiDriverMatch";

type Driver = {
  id: string;
  full_name: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  rating: number;
  current_location: string | null;
  seats: number;
  is_online: boolean;
  is_in_house?: boolean;
  bio?: string | null;
  service_areas?: string | null;
  price_per_trip?: number | null;
  retainer_weekly?: number | null;
  retainer_monthly?: number | null;
};

const rand = (v?: number | null) => (v == null ? "—" : `R${Number(v).toLocaleString("en-ZA")}`);
type Filter = "all" | "inhouse" | "independent";

type RideRequest = {
  id: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  pickup: string;
  dropoff: string;
  driver_id: string | null;
  created_at: string;
};

export function RequestRideCard() {
  const { user, loading: authLoading } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeRequests, setActiveRequests] = useState<RideRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const shown = drivers.filter((d) =>
    filter === "all" ? true : filter === "inhouse" ? d.is_in_house : !d.is_in_house,
  );

  // Load online drivers + subscribe to changes
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .order("is_online", { ascending: false })
        .order("rating", { ascending: false });
      setDrivers((data ?? []) as unknown as Driver[]);
    };
    load();
    const ch = supabase
      .channel("online-drivers")
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  // Load own requests + subscribe
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("passenger_id", user.id)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false });
      setActiveRequests((data ?? []) as RideRequest[]);
    };
    load();
    const ch = supabase
      .channel("my-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ride_requests", filter: `passenger_id=eq.${user.id}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const submit = async (driverId: string | null, pu = pickup, dr = dropoff) => {
    if (!user) return;
    if (!pu.trim() || !dr.trim()) {
      setError("Please enter pickup and drop-off locations.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: insErr } = await supabase.from("ride_requests").insert({
      passenger_id: user.id,
      driver_id: driverId,
      pickup: pu.trim(),
      dropoff: dr.trim(),
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setSelectedDriver(null);
  };

  const cancelRequest = async (id: string) => {
    await supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", id);
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <Section title="Request a ride">
        <p className="text-sm text-muted-foreground">
          Sign in to request a verified driver from The Transport Club network.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Sign in to continue
        </Link>
      </Section>
    );
  }

  return (
    <Section title="Request a ride">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Pickup</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 focus-within:border-primary">
            <MapPin className="h-4 w-4 text-primary-glow" />
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. 12 Vilakazi St, Soweto"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Drop‑off</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 focus-within:border-primary">
            <MapPin className="h-4 w-4 text-primary-glow" />
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="e.g. Alice Lane, Sandton"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Notes (optional)</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Luggage, child seat, etc."
          className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <AiDriverMatch
        drivers={drivers}
        onRequest={(id, pu, dr) => {
          setPickup(pu);
          setDropoff(dr);
          setSelectedDriver(id);
          submit(id, pu, dr);
        }}
      />

      <div className="mt-5 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] text-muted-foreground">
        <span className="text-foreground">NalaFlow in‑house</span> drivers are covered by your subscription.{" "}
        <span className="text-foreground">Independent providers</span> set their own prices — you pay them via a
        direct client‑to‑provider retainer.
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(["all", "inhouse", "independent"] as Filter[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-3 py-1 text-xs ${
                filter === k ? "bg-primary text-primary-foreground" : "border border-border bg-surface-elevated"
              }`}
            >
              {k === "all" ? `All (${drivers.length})` : k === "inhouse" ? "In‑house" : "Independent"}
            </button>
          ))}
        </div>
        <button
          onClick={() => submit(null)}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs hover:bg-background disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Broadcast to all
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            No drivers in this group yet.
          </div>
        )}
        {shown.map((d) => {
          const selected = selectedDriver === d.id;
          return (
            <div
              key={d.id}
              className={`flex flex-col rounded-2xl border p-4 transition ${
                selected ? "border-primary bg-surface-elevated shadow-glow" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    <span className={`h-2 w-2 rounded-full ${d.is_online ? "bg-success" : "bg-muted-foreground/40"}`} />
                    {d.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[d.vehicle_make, d.vehicle_model].filter(Boolean).join(" ") || "Vehicle"}
                    {d.vehicle_plate ? ` · ${d.vehicle_plate}` : ""}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
                  <Star className="h-3 w-3" /> {Number(d.rating).toFixed(1)}
                </span>
              </div>
              <span
                className={`mt-2 w-fit rounded-full px-2 py-0.5 text-[10px] ${
                  d.is_in_house ? "bg-primary/15 text-primary-glow" : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                {d.is_in_house ? "NalaFlow in‑house · subscription" : "Independent · direct retainer"}
              </span>
              {d.bio && <p className="mt-2 text-xs text-muted-foreground">{d.bio}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <Car className="h-3.5 w-3.5" /> {d.seats} seats
                {(d.service_areas || d.current_location) && (
                  <>
                    <span>·</span>
                    <MapPin className="h-3.5 w-3.5" /> {d.service_areas || d.current_location}
                  </>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                {[
                  ["Trip", d.price_per_trip],
                  ["Week", d.retainer_weekly],
                  ["Month", d.retainer_monthly],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg border border-border bg-surface-elevated px-1 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{l as string}</p>
                    <p className="text-xs font-medium">{rand(v as number | null)}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedDriver(d.id);
                  submit(d.id);
                }}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {d.is_online ? "Request this driver" : "Request (offline — will be notified)"}
              </button>
            </div>
          );
        })}
      </div>

      {activeRequests.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Your active requests</p>
          <div className="mt-2 space-y-2">
            {activeRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2.5"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {r.pickup} → {r.dropoff}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    {r.status === "accepted" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-success" /> Driver accepted
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-warning" /> Waiting for driver
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => cancelRequest(r.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] hover:bg-background"
                >
                  <X className="h-3 w-3" /> Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
