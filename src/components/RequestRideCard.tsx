import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Car, MapPin, Star, Loader2, X, CheckCircle2, Clock, Search, Users, ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  verified?: boolean;
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
  const [previewDriver, setPreviewDriver] = useState<Driver | null>(null);
  const [showAi, setShowAi] = useState(false);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const shown = drivers.filter((d) =>
    filter === "all" ? true : filter === "inhouse" ? d.is_in_house : !d.is_in_house,
  );

  // Preserve visibility of all providers, ordered online first and then by rating.
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error: loadError } = await supabase
        .from("drivers")
        .select("*")
        .order("is_online", { ascending: false })
        .order("rating", { ascending: false });
      setDrivers((data ?? []) as unknown as Driver[]);
      setDriversError(loadError ? "Drivers could not be loaded. Please try again shortly." : null);
      setDriversLoading(false);
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
    return true;
  };

  const cancelRequest = async (id: string) => {
    await supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", id);
  };

  if (authLoading) return null;

  return (
    <section aria-label="Find a driver">
      <div className="-mx-4 bg-primary px-4 pb-7 pt-2 lg:mx-0 lg:rounded-b-3xl lg:px-6">
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!pickup.trim() || !dropoff.trim()) {
            setError("Please enter pickup and drop-off locations.");
            return;
          }
          setError(null);
          document.getElementById("available-providers")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        }}>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5 shadow-soft">
            <label className="flex min-w-0 items-center gap-4 py-5">
              <span className="h-3 w-3 shrink-0 rounded-full bg-success" />
              <input aria-label="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Pickup location" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
              <MapPin className="h-5 w-5 shrink-0 text-primary-glow" />
            </label>
            <label className="flex min-w-0 items-center gap-4 py-5">
              <span className="h-3 w-3 shrink-0 rounded-sm bg-destructive" />
              <input aria-label="Drop-off location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Drop-off / Work location" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
            </label>
          </div>
          <Button type="submit" className="mt-4 h-14 w-full rounded-xl bg-surface-elevated text-base text-foreground shadow-soft hover:bg-surface"><Search />Find providers</Button>
        </form>
      </div>

      <div id="available-providers" className="scroll-mt-4 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0"><h2 className="font-display text-xl font-semibold">Available providers</h2><p className="mt-1 text-xs text-muted-foreground">{drivers.length} providers · online first</p></div>
          <Button variant="ghost" size="icon" aria-label="AI driver matching" title="AI driver matching" onClick={() => setShowAi(!showAi)}><Sparkles className="text-primary-glow" /></Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Provider type">
          {(["all", "inhouse", "independent"] as Filter[]).map((k) => <Button key={k} size="sm" variant={filter === k ? "default" : "secondary"} aria-pressed={filter === k} onClick={() => setFilter(k)} className="rounded-full">{k === "all" ? "All providers" : k === "inhouse" ? "NalaFlow in-house" : "Independent"}</Button>)}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        {!user && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-5"><p className="text-sm text-muted-foreground">Sign in to view providers and request your commute.</p><Button asChild><Link to="/login">Sign in <ArrowRight /></Link></Button></div>}
        {user && driversLoading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading providers…</div>}
        {driversError && <p role="alert" className="mt-5 text-sm text-destructive">{driversError}</p>}
        {user && !driversLoading && !driversError && shown.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No providers in this group yet.</p>}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {shown.map((d) => (
            <article key={d.id} className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-card">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/15 sm:h-16 sm:w-16"><Car className="h-7 w-7 text-primary-glow" /></div>
                <div className="min-w-0">
                  <h3 className="break-words font-display text-lg font-semibold">{d.full_name}</h3>
                  <p className="mt-1 break-words text-sm text-muted-foreground">{[d.vehicle_make, d.vehicle_model].filter(Boolean).join(" ") || "Vehicle details pending"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm"><Star className="h-4 w-4 fill-warning text-warning" /><span>{Number(d.rating).toFixed(1)}</span><span className="text-muted-foreground">·</span><span className={`text-xs ${d.is_online ? "text-success" : "text-muted-foreground"}`}>{d.is_online ? "Online" : "Offline"}</span></div>
                  <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-primary-glow" /><span className="break-words">{d.service_areas || d.current_location || "Service areas not listed"}</span></p>
                </div>
                {d.verified && <BadgeCheck aria-label="Verified driver" className="h-5 w-5 shrink-0 text-primary-glow" />}
              </div>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-4">
                <div className="min-w-0"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 shrink-0" />{d.seats} seats</p><span className={`mt-2 inline-block rounded-md px-2 py-1 text-[11px] ${d.is_in_house ? "bg-primary/15 text-primary-glow" : "bg-warning/10 text-warning"}`}>{d.is_in_house ? "In-house · subscription" : "Independent · retainer"}</span></div>
                <div className="text-right"><p className="font-display text-xl font-semibold text-primary-glow">{d.retainer_monthly != null ? rand(d.retainer_monthly) : d.price_per_trip != null ? rand(d.price_per_trip) : "Not listed"}</p><p className="text-[11px] text-muted-foreground">{d.retainer_monthly != null ? "per month" : d.price_per_trip != null ? "per trip" : "Pricing"}</p></div>
              </div>
              <Button variant="outline" className="mt-4 h-10 w-full rounded-lg" onClick={() => { setPreviewDriver(d); setError(null); }}>View provider <ArrowRight /></Button>
            </article>
          ))}
        </div>
        {user && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="max-w-lg text-xs leading-relaxed text-muted-foreground">Subscriptions are for NalaFlow in-house drivers. Independent providers set their own direct retainer prices.</p><Button variant="secondary" size="sm" disabled={submitting} onClick={() => submit(null)}>Broadcast to all</Button></div>}
        {showAi && user && <AiDriverMatch drivers={drivers} onRequest={(id, pu, dr) => { setPickup(pu); setDropoff(dr); setSelectedDriver(id); submit(id, pu, dr); }} />}
      </div>

      <Dialog open={previewDriver !== null} onOpenChange={(open) => { if (!open) setPreviewDriver(null); }}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-surface">
          {previewDriver && <>
            <DialogHeader><DialogTitle className="pr-6">{previewDriver.full_name}</DialogTitle><DialogDescription>{[previewDriver.vehicle_make, previewDriver.vehicle_model, previewDriver.vehicle_plate].filter(Boolean).join(" · ") || "Vehicle details pending"}</DialogDescription></DialogHeader>
            <div className="flex flex-wrap gap-4 text-sm"><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-warning" />{Number(previewDriver.rating).toFixed(1)}</span><span>{previewDriver.seats} seats</span><span className={previewDriver.is_online ? "text-success" : "text-muted-foreground"}>{previewDriver.is_online ? "Online" : "Offline"}</span></div>
            {previewDriver.bio && <p className="break-words text-sm text-muted-foreground">{previewDriver.bio}</p>}
            <p className="break-words text-sm"><MapPin className="mr-2 inline h-4 w-4 text-primary-glow" />{previewDriver.service_areas || previewDriver.current_location || "Service areas not listed"}</p>
            <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-4 text-center">{[["Per trip", previewDriver.price_per_trip], ["Per week", previewDriver.retainer_weekly], ["Per month", previewDriver.retainer_monthly]].map(([label, value]) => <div key={String(label)} className="min-w-0 px-1"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{rand(value as number | null)}</p></div>)}</div>
            <p className="text-xs text-muted-foreground">{previewDriver.is_in_house ? "NalaFlow in-house · subscription" : "Independent provider · direct retainer"}</p>
            <label className="text-xs text-muted-foreground">Pickup<input aria-label="Request pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Pickup location" className="mt-1 block w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" /></label>
            <label className="text-xs text-muted-foreground">Drop-off<input aria-label="Request drop-off" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Drop-off location" className="mt-1 block w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" /></label>
            <label className="text-xs text-muted-foreground">Notes (optional)<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Luggage, child seat, etc." className="mt-1 block w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary" /></label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button disabled={submitting} className="h-auto min-h-11 whitespace-normal rounded-lg" onClick={async () => { setSelectedDriver(previewDriver.id); const success = await submit(previewDriver.id); if (success) setPreviewDriver(null); }}>{submitting && selectedDriver === previewDriver.id ? <Loader2 className="animate-spin" /> : <ArrowRight />}{previewDriver.is_online ? "Request this driver" : "Request driver · currently offline"}</Button>
          </>}
        </DialogContent>
      </Dialog>

      {activeRequests.length > 0 && <div id="active-requests" className="scroll-mt-4 border-t border-border py-5"><h2 className="font-display text-lg font-semibold">Your active requests</h2><div className="mt-3 space-y-2">{activeRequests.map((r) => <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-surface-elevated p-4"><div className="min-w-0"><p className="break-words text-sm font-medium">{r.pickup} → {r.dropoff}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">{r.status === "accepted" ? <><CheckCircle2 className="h-3 w-3 text-success" />Driver accepted</> : <><Clock className="h-3 w-3 text-warning" />Waiting for driver</>}</p></div><Button variant="outline" size="sm" onClick={() => cancelRequest(r.id)}><X />Cancel</Button></div>)}</div></div>}
    </section>
  );
}
