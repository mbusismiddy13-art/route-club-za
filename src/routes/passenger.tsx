import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Calendar,
  Wallet,
  MapPin,
  ShieldAlert,
  Settings,
  Repeat,
  Share2,
  Star,
  Clock,
  Users,
  TrendingDown,
} from "lucide-react";
import { AppShell, Section, StatCard } from "@/components/AppShell";
import { RequestRideCard } from "@/components/RequestRideCard";
import { ActiveRideChat } from "@/components/ActiveRideChat";

export const Route = createFileRoute("/passenger")({
  component: PassengerDashboard,
  head: () => ({ meta: [{ title: "Passenger — The Transport Club" }] }),
});

const nav = [
  { to: "/passenger", label: "Home", icon: Home },
  { to: "/passenger", label: "My trips", icon: Calendar },
  { to: "/passenger", label: "Wallet", icon: Wallet },
  { to: "/passenger", label: "Subscription", icon: Repeat },
  { to: "/passenger", label: "Settings", icon: Settings },
];

function PassengerDashboard() {
  return (
    <AppShell
      items={nav}
      title="Sawubona, Thando 👋"
      subtitle="Your morning ride to Sandton CBD is confirmed for 06:45."
      badge="Commuter+ active"
    >
      <div className="mb-5">
        <RequestRideCard />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Live trip */}
        <Section
          title="Next trip"
          className="xl:col-span-2"
          action={
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs hover:bg-background">
                <Share2 className="h-3.5 w-3.5" /> Share trip
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground">
                <ShieldAlert className="h-3.5 w-3.5" /> SOS
              </button>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <div className="relative h-72 overflow-hidden rounded-2xl bg-[oklch(0.15_0.04_270)]">
              <svg viewBox="0 0 500 320" className="h-full w-full">
                <defs>
                  <pattern id="g2" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path
                      d="M28 0H0V28"
                      fill="none"
                      stroke="oklch(0.27 0.04 270)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                  <linearGradient id="r2" x1="0" x2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.21 275)" />
                    <stop offset="100%" stopColor="oklch(0.74 0.18 280)" />
                  </linearGradient>
                </defs>
                <rect width="500" height="320" fill="url(#g2)" />
                <path
                  d="M30 280 C 100 220, 160 240, 230 180 S 380 110, 470 60"
                  fill="none"
                  stroke="url(#r2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {[
                  [30, 280, "Home"],
                  [230, 180, "Pickup #3"],
                  [470, 60, "Office"],
                ].map(([x, y, l], i) => (
                  <g key={i}>
                    <circle cx={x as number} cy={y as number} r="10" fill="oklch(0.18 0.04 270)" />
                    <circle cx={x as number} cy={y as number} r="5.5" fill="oklch(0.74 0.18 280)" />
                    <text
                      x={(x as number) + 14}
                      y={(y as number) + 4}
                      fontSize="11"
                      fill="oklch(0.85 0.02 260)"
                      fontFamily="DM Sans"
                    >
                      {l}
                    </text>
                  </g>
                ))}
                <circle cx="290" cy="160" r="18" fill="oklch(0.62 0.21 275)" opacity="0.25" />
                <circle cx="290" cy="160" r="8" fill="oklch(0.74 0.18 280)" />
              </svg>
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-[10px] backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
              </span>
            </div>

            <div className="space-y-3">
              {[
                { l: "Pickup", v: "06:45", sub: "12 Vilakazi St, Soweto" },
                { l: "Driver", v: "Sipho M. ★ 4.9", sub: "Toyota Quantum · ND 23 ABC GP" },
                { l: "Seat", v: "B2 (window)", sub: "Reserved · Commuter+" },
                { l: "Drop‑off", v: "07:38", sub: "Alice Lane, Sandton CBD" },
              ].map((r) => (
                <div
                  key={r.l}
                  className="flex items-start justify-between rounded-xl border border-border bg-surface-elevated p-3"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {r.l}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{r.v}</p>
                    <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Subscription */}
        <Section title="Subscription">
          <div className="rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
            <p className="text-[10px] uppercase tracking-wider opacity-80">Current plan</p>
            <p className="mt-1 font-display text-2xl font-semibold">Commuter+</p>
            <p className="mt-1 text-sm opacity-80">R899 / month · renews 28 May</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="h-full w-[72%] rounded-full bg-primary-foreground/80" />
            </div>
            <p className="mt-2 text-xs opacity-80">22 of 30 trips used this cycle</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs hover:bg-background">
              Manage plan
            </button>
            <button className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs hover:bg-background">
              Pause month
            </button>
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            {[
              { i: TrendingDown, l: "Saved vs ride‑hail", v: "R1 240" },
              { i: Star, l: "Driver rating", v: "4.92" },
              { i: Clock, l: "On‑time rate", v: "98%" },
            ].map((s) => (
              <div key={s.l} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <s.i className="h-4 w-4 text-primary-glow" /> {s.l}
                </span>
                <span className="font-medium">{s.v}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="This month" value="R899" delta="paid · next 28 May" icon={Wallet} />
        <StatCard label="Trips taken" value="22" delta="of 30 in cycle" icon={Calendar} tone="primary" />
        <StatCard label="CO₂ saved" value="42 kg" delta="vs solo driving" icon={MapPin} tone="success" />
        <StatCard label="Co‑riders" value="11" delta="repeat fellow commuters" icon={Users} />
      </div>

      {/* Recent trips */}
      <Section title="Recent trips" className="mt-5">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Fri 16 May", "Soweto → Sandton CBD", "Sipho M.", "R29", "Completed"],
                ["Thu 15 May", "Sandton CBD → Soweto", "Sipho M.", "R29", "Completed"],
                ["Thu 15 May", "Soweto → Sandton CBD", "Lerato P.", "R29", "Completed"],
                ["Wed 14 May", "Sandton CBD → Soweto", "Sipho M.", "R29", "Late 4 min"],
              ].map((r, i) => (
                <tr key={i} className="hover:bg-surface-elevated/60">
                  <td className="px-4 py-3 text-muted-foreground">{r[0]}</td>
                  <td className="px-4 py-3 font-medium">{r[1]}</td>
                  <td className="px-4 py-3">{r[2]}</td>
                  <td className="px-4 py-3">{r[3]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        r[4] === "Completed"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {r[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
}
