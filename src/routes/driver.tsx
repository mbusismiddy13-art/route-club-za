import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Route as RouteIcon,
  Wallet,
  Users,
  Settings,
  TrendingUp,
  Clock,
  Fuel,
  Star,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import { AppShell, Section, StatCard } from "@/components/AppShell";

export const Route = createFileRoute("/driver")({
  component: DriverDashboard,
  head: () => ({ meta: [{ title: "Driver — The Transport Club" }] }),
});

const nav = [
  { to: "/driver", label: "Today", icon: Home },
  { to: "/driver", label: "My routes", icon: RouteIcon },
  { to: "/driver", label: "Passengers", icon: Users },
  { to: "/driver", label: "Earnings", icon: Wallet },
  { to: "/driver", label: "Settings", icon: Settings },
];

function DriverDashboard() {
  return (
    <AppShell
      items={nav}
      title="Good morning, Sipho"
      subtitle="Your Sandton route departs in 38 minutes. 11 of 14 seats confirmed."
      badge="Verified · Tier 2"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's earnings" value="R1 240" delta="+R180 vs avg Mon" icon={TrendingUp} tone="success" />
        <StatCard label="This month" value="R28 470" delta="84% to target" icon={Wallet} tone="primary" />
        <StatCard label="Occupancy" value="93%" delta="above provincial avg" icon={Users} />
        <StatCard label="Rating" value="4.92" delta="last 30 trips" icon={Star} tone="warning" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Section
          title="Today's route — Soweto loop"
          className="xl:col-span-2"
          action={
            <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow">
              <Navigation className="h-3.5 w-3.5" /> Start navigation
            </button>
          }
        >
          <ol className="space-y-2.5">
            {[
              { t: "06:30", n: "Vilakazi St", p: "Thando C., Lerato M.", s: "Confirmed" },
              { t: "06:38", n: "Maponya Mall", p: "+3 passengers", s: "Confirmed" },
              { t: "06:52", n: "Diepkloof Sq", p: "+4 passengers", s: "Confirmed" },
              { t: "07:05", n: "M1 onramp", p: "Express to Sandton", s: "—" },
              { t: "07:38", n: "Alice Lane drop‑off", p: "11 passengers", s: "Pending" },
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-background font-display text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {s.t} · {s.n}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.p}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    s.s === "Confirmed"
                      ? "bg-success/15 text-success"
                      : s.s === "Pending"
                        ? "bg-warning/15 text-warning"
                        : "bg-surface text-muted-foreground"
                  }`}
                >
                  {s.s}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Vehicle & compliance">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="font-display text-base font-semibold">Toyota Quantum 2.5</p>
            <p className="text-xs text-muted-foreground">ND 23 ABC GP · 14 seats</p>
            <div className="mt-4 space-y-2 text-sm">
              {[
                { l: "Roadworthy", v: "Valid · expires Aug", ok: true },
                { l: "Insurance", v: "Hollard PSV", ok: true },
                { l: "Driver PrDP", v: "Valid · expires Mar 2026", ok: true },
                { l: "Service", v: "Due in 1 240 km", ok: false },
              ].map((c) => (
                <div key={c.l} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{c.l}</span>
                  <span
                    className={`flex items-center gap-1.5 text-xs ${
                      c.ok ? "text-success" : "text-warning"
                    }`}
                  >
                    {c.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {c.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-surface-elevated p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <Fuel className="inline h-3 w-3" /> Fuel
              </p>
              <p className="mt-1 font-display text-lg font-semibold">R 412</p>
              <p className="text-[10px] text-muted-foreground">est. today</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-elevated p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <Clock className="inline h-3 w-3" /> On road
              </p>
              <p className="mt-1 font-display text-lg font-semibold">3h 12m</p>
              <p className="text-[10px] text-muted-foreground">today</p>
            </div>
          </div>
        </Section>
      </div>

      {/* Earnings chart */}
      <Section title="Weekly earnings" className="mt-5">
        <div className="flex items-end gap-3 px-2 pb-2 pt-4">
          {[
            ["Mon", 1240, true],
            ["Tue", 1310, false],
            ["Wed", 980, false],
            ["Thu", 1410, false],
            ["Fri", 1620, false],
            ["Sat", 740, false],
            ["Sun", 0, false],
          ].map(([d, v, today]) => {
            const h = Math.max(8, Math.round(((v as number) / 1700) * 160));
            return (
              <div key={d as string} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg ${
                    today
                      ? "bg-gradient-primary shadow-glow"
                      : "bg-surface-elevated"
                  }`}
                  style={{ height: `${h}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{d as string}</span>
              </div>
            );
          })}
        </div>
      </Section>
    </AppShell>
  );
}
