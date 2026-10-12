import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { testLogin } from "@/lib/test-login.functions";

const opts = [
  { role: "passenger", label: "Passenger", to: "/passenger" },
  { role: "driver", label: "Driver", to: "/driver" },
  { role: "admin", label: "Admin", to: "/admin" },
  { role: "corporate_admin", label: "Company", to: "/corporate" },
] as const;

export function TestLoginButtons() {
  const run = useServerFn(testLogin);
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const go = async (o: (typeof opts)[number]) => {
    setBusy(o.role);
    setErr(null);
    try {
      const s = await run({ data: { role: o.role } });
      await supabase.auth.setSession(s);
      navigate({ to: o.to });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Test sign-in failed");
    }
    setBusy(null);
  };

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-warning/50 bg-warning/5 p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-warning">
        <FlaskConical className="h-3.5 w-3.5" /> Testing: continue as a test user
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button
            key={o.role}
            onClick={() => go(o)}
            disabled={!!busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs hover:bg-background disabled:opacity-50"
          >
            {busy === o.role && <Loader2 className="h-3 w-3 animate-spin" />} {o.label}
          </button>
        ))}
      </div>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
