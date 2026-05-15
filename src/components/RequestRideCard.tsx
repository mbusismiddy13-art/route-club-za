import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Car, MapPin, Star, Loader2, X, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Section } from "@/components/AppShell";

type Driver = {
  id: string;
  full_name: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  rating: number;
  current_location: string | null;
  seats: number;
};

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

  // Load online drivers + subscribe to changes
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("is_online", true)
        .order("rating", { ascending: false });
      setDrivers((data ?? []) as Driver[]);
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

  const submit = async (driverId: string | null) => {
    if (!user) return;
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Please enter pickup and drop-off locations.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: insErr } = await supabase.from("ride_requests").insert({
      passenger_id: user.id,
      driver_id: driverId,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
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

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Available drivers ({drivers.length})
        </p>
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
        {drivers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
            No drivers online right now. Try broadcasting — drivers will be notified when they come online.
          </div>
        )}
        {drivers.map((d) => {
          const selected = selectedDriver === d.id;
          return (
            <div
              key={d.id}
              className={`rounded-2xl border p-4 transition ${
                selected ? "border-primary bg-surface-elevated shadow-glow" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{d.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[d.vehicle_make, d.vehicle_model].filter(Boolean).join(" ") || "Vehicle"}
                    {d.vehicle_plate ? ` · ${d.vehicle_plate}` : ""}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] text-warning">
                  <Star className="h-3 w-3" /> {Number(d.rating).toFixed(1)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Car className="h-3.5 w-3.5" /> {d.seats} seats
                {d.current_location && (
                  <>
                    <span>·</span>
                    <MapPin className="h-3.5 w-3.5" /> {d.current_location}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedDriver(d.id);
                  submit(d.id);
                }}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
              >
                Request this driver
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
