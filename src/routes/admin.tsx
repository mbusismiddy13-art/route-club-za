import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Users,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  Map,
} from "lucide-react";
import { AppShell, Section, StatCard } from "@/components/AppShell";
import { DriverApprovals } from "@/components/DriverApprovals";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — The Transport Club" }] }),
});

const nav = [
  { to: "/admin", label: "Overview", icon: Home },
  { to: "/admin", label: "Drivers", icon: Users },
  { to: "/admin", label: "Compliance", icon: ShieldCheck },
  { to: "/admin", label: "Incidents", icon: AlertTriangle },
  { to: "/admin", label: "Demand map", icon: Map },
  { to: "/admin", label: "Reports", icon: FileText },
  { to: "/admin", label: "Settings", icon: Settings },
];

function AdminDashboard() {
  return (
    <AppShell
      items={nav}
      title="Operations control"
      subtitle="Live overview · Gauteng region · 14 active routes"
      badge="Admin · Tier 1"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active subscribers" value="4 218" delta="+182 this week" icon={Users} tone="primary" />
        <StatCard label="Live trips now" value="38" delta="across 14 routes" icon={Map} tone="success" />
        <StatCard label="Open incidents" value="2" delta="1 SOS · 1 dispute" icon={AlertTriangle} tone="warning" />
        <StatCard label="MRR" value="R 3.41M" delta="+8.2% MoM" icon={TrendingUp} tone="success" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <DriverApprovals />

        {/* Incidents */}
        <Section title="Incident feed">
          <ul className="space-y-2.5">
            {[
              {
                t: "06:12",
                lvl: "SOS",
                tone: "destructive",
                msg: "Passenger SOS · Route SOW‑01 · dispatched team",
              },
              {
                t: "05:48",
                lvl: "Dispute",
                tone: "warning",
                msg: "Fare dispute · Driver Lerato P. · under review",
              },
              {
                t: "05:30",
                lvl: "Compliance",
                tone: "warning",
                msg: "Vehicle ND 12 XYZ GP · roadworthy expires in 7 days",
              },
              {
                t: "Yesterday",
                lvl: "Resolved",
                tone: "success",
                msg: "Late arrival refund issued · 4 commuters",
              },
            ].map((i, k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface-elevated p-3"
              >
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    i.tone === "destructive"
                      ? "bg-destructive/20 text-destructive"
                      : i.tone === "warning"
                        ? "bg-warning/15 text-warning"
                        : "bg-success/15 text-success"
                  }`}
                >
                  {i.lvl}
                </span>
                <div className="flex-1 leading-snug">
                  <p className="text-sm">{i.msg}</p>
                  <p className="text-[10px] text-muted-foreground">{i.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Demand heatmap */}
      <Section title="Demand heatmap — next 7 days" className="mt-5">
        <div className="grid grid-cols-[auto_repeat(24,_minmax(0,1fr))] items-center gap-1 text-[10px] text-muted-foreground">
          <span />
          {Array.from({ length: 24 }).map((_, h) => (
            <span key={h} className="text-center">
              {h % 6 === 0 ? h : ""}
            </span>
          ))}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, di) => (
            <RowFragment key={d} day={d} di={di} />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Darker = predicted seat demand. AI cluster suggests adding 2 vans on
          Khayelitsha → Cape Town CBD (Tue/Thu, 06:00–07:00).
        </p>
      </Section>
    </AppShell>
  );
}

function RowFragment({ day, di }: { day: string; di: number }) {
  return (
    <>
      <span className="pr-2 text-right text-muted-foreground">{day}</span>
      {Array.from({ length: 24 }).map((_, h) => {
        // Fake but deterministic intensity, peaks at commute hours
        const peak = Math.exp(-Math.pow(h - 7, 2) / 4) + Math.exp(-Math.pow(h - 17, 2) / 4);
        const wknd = di >= 5 ? 0.35 : 1;
        const v = Math.min(1, peak * wknd + ((di * 7 + h) % 5) * 0.04);
        const alpha = (0.08 + v * 0.85).toFixed(2);
        return (
          <span
            key={h}
            className="aspect-square rounded-[3px]"
            style={{ background: `oklch(0.62 0.21 275 / ${alpha})` }}
          />
        );
      })}
    </>
  );
}
