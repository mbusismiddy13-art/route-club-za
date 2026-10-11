import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, MapPin, CheckCircle2, XCircle, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Section } from "@/components/AppShell";
import { DriverPricingEditor, type DriverPricing } from "@/components/DriverPricingEditor";

type Driver = {
  id: string;
  user_id: string;
  full_name: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  is_online: boolean;
  current_location: string | null;
  seats: number;
};

type Request = {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  pickup: string;
  dropoff: string;
  notes: string | null;
  status: string;
  created_at: string;
};

export function DriverInbox() {
  const { user, loading: authLoading } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_plate: "",
    current_location: "",
  });

  // Load driver record
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setDriver((data as Driver) ?? null);
      setLoading(false);
    })();
  }, [user]);

  // Load + subscribe to incoming requests
  useEffect(() => {
    if (!driver) return;
    const load = async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("*")
        .or(`driver_id.eq.${driver.id},driver_id.is.null`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setRequests((data ?? []) as Request[]);
    };
    load();
    const ch = supabase
      .channel(`driver-inbox-${driver.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ride_requests" },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [driver]);

  const becomeDriver = async () => {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        user_id: user.id,
        full_name: form.full_name || user.email || "Driver",
        vehicle_make: form.vehicle_make || null,
        vehicle_model: form.vehicle_model || null,
        vehicle_plate: form.vehicle_plate || null,
        current_location: form.current_location || null,
        is_online: true,
      })
      .select()
      .single();
    setCreating(false);
    if (!error) setDriver(data as Driver);
  };

  const toggleOnline = async () => {
    if (!driver) return;
    const { data } = await supabase
      .from("drivers")
      .update({ is_online: !driver.is_online })
      .eq("id", driver.id)
      .select()
      .single();
    if (data) setDriver(data as Driver);
  };

  const respond = async (id: string, status: "accepted" | "declined") => {
    if (!driver) return;
    await supabase
      .from("ride_requests")
      .update({ status, driver_id: driver.id })
      .eq("id", id);
  };

  if (authLoading || loading) return null;

  if (!user) {
    return (
      <Section title="Driver inbox">
        <p className="text-sm text-muted-foreground">Sign in as a driver to receive ride requests.</p>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Sign in
        </Link>
      </Section>
    );
  }

  if (!driver) {
    return (
      <Section title="Become a driver">
        <p className="text-sm text-muted-foreground">
          Register your vehicle to start receiving ride requests.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { k: "full_name", l: "Full name" },
            { k: "vehicle_make", l: "Vehicle make" },
            { k: "vehicle_model", l: "Vehicle model" },
            { k: "vehicle_plate", l: "Plate number" },
            { k: "current_location", l: "Current area" },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.l}</span>
              <input
                value={(form as Record<string, string>)[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
        <button
          onClick={becomeDriver}
          disabled={creating}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
        >
          {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Register & go online
        </button>
      </Section>
    );
  }

  return (
    <Section
      title="Incoming ride requests"
      action={
        <button
          onClick={toggleOnline}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
            driver.is_online
              ? "border-success/30 bg-success/15 text-success"
              : "border-border bg-surface-elevated text-muted-foreground"
          }`}
        >
          <Power className="h-3.5 w-3.5" />
          {driver.is_online ? "Online" : "Go online"}
        </button>
      }
    >
      <DriverPricingEditor driver={driver as unknown as DriverPricing} />
      {!driver.is_online && (
        <p className="mb-3 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          You're offline — passengers can't see you. Toggle online to receive requests.
        </p>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
          No pending requests. New ones appear here in real time.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-border bg-surface-elevated p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    <MapPin className="mr-1 inline h-3.5 w-3.5 text-primary-glow" />
                    {r.pickup}
                  </p>
                  <p className="mt-1 text-sm">
                    <MapPin className="mr-1 inline h-3.5 w-3.5 text-warning" />
                    {r.dropoff}
                  </p>
                  {r.notes && (
                    <p className="mt-2 text-[11px] text-muted-foreground">Note: {r.notes}</p>
                  )}
                  <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {r.driver_id === driver.id ? "Direct request" : "Broadcast"} ·{" "}
                    {new Date(r.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => respond(r.id, "accepted")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, "declined")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs hover:bg-background"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
