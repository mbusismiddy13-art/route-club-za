import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { RideChat } from "./RideChat";

/**
 * Picks the most recent ride for the current user (as passenger or driver)
 * and mounts the chat against it.
 */
export function ActiveRideChat({ role }: { role: "passenger" | "driver" }) {
  const { user } = useAuth();
  const [rideId, setRideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      let query = supabase
        .from("ride_requests")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (role === "passenger") {
        query = query.eq("passenger_id", user.id);
      } else {
        const { data: driver } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!driver) {
          if (active) setLoading(false);
          return;
        }
        query = query.eq("driver_id", driver.id);
      }

      const { data } = await query.maybeSingle();
      if (active) {
        setRideId(data?.id ?? null);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, role]);

  if (!user) return null;
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
        Loading chat…
      </div>
    );
  }
  if (!rideId) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
        No active ride to chat about yet.
      </div>
    );
  }

  return (
    <RideChat
      rideRequestId={rideId}
      counterpartName={role === "passenger" ? "Your driver" : "Your passenger"}
    />
  );
}
