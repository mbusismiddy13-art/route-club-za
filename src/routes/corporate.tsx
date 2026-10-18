import { createFileRoute } from "@tanstack/react-router";
import {
  Home,
  Users,
  Building2,
  FileText,
  Wallet,
  Settings,
  Plus,
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import { AppShell, Section, StatCard } from "@/components/AppShell";
import { CompanyMembers } from "@/components/CompanyMembers";

export const Route = createFileRoute("/corporate")({
  component: CorporateDashboard,
  head: () => ({ meta: [{ title: "Corporate — The Transport Club" }] }),
});

const nav = [
  { to: "/corporate", label: "Dashboard", icon: Home },
  { to: "/corporate", label: "Staff & learners", icon: Users },
  { to: "/corporate", label: "Routes", icon: Building2 },
  { to: "/corporate", label: "Invoices", icon: Wallet },
  { to: "/corporate", label: "Contracts", icon: FileText },
  { to: "/corporate", label: "Settings", icon: Settings },
];

function CorporateDashboard() {
  return (
    <AppShell
      items={nav}
      title="Sasol Sandton — staff transport"
      subtitle="142 staff enrolled across 6 routes · contract renews 1 Aug"
      badge="Enterprise"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled staff" value="142" delta="+12 this month" icon={Users} tone="primary" />
        <StatCard label="Active routes" value="6" delta="JHB metro" icon={Building2} />
        <StatCard label="Attendance lift" value="+9.2%" delta="vs last quarter" icon={TrendingUp} tone="success" />
        <StatCard label="Monthly invoice" value="R127 580" delta="due 25 May" icon={Wallet} />
      </div>

      <div className="mt-5">
        <CompanyMembers />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Section
          title="Routes"
          className="xl:col-span-2"
          action={
            <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow">
              <Plus className="h-3.5 w-3.5" /> Add route
            </button>
          }
        >
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Riders</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">On‑time</th>
                  <th className="px-4 py-3">Cost / mo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Soweto → Sandton", "28", "Sipho M.", "98%", "R 24 360"],
                  ["Tembisa → Sandton", "22", "Lerato P.", "96%", "R 19 470"],
                  ["Alex → Sandton", "31", "Bongani N.", "99%", "R 26 110"],
                  ["Diepsloot → Sandton", "18", "Refilwe S.", "94%", "R 16 220"],
                  ["Pretoria → Sandton", "24", "Themba O.", "97%", "R 22 980"],
                  ["Randburg → Sandton", "19", "Nokuthula D.", "98%", "R 18 440"],
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-surface-elevated/60">
                    <td className="px-4 py-3 font-medium">{r[0]}</td>
                    <td className="px-4 py-3">{r[1]}</td>
                    <td className="px-4 py-3">{r[2]}</td>
                    <td className="px-4 py-3 text-success">{r[3]}</td>
                    <td className="px-4 py-3">{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Contract">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="font-display text-base font-semibold">Annual staff transport</p>
            <p className="text-xs text-muted-foreground">
              Signed 2 Aug 2024 · auto‑renews
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Term
                </dt>
                <dd className="mt-0.5 font-medium">12 months</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Billing
                </dt>
                <dd className="mt-0.5 font-medium">Monthly EFT</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  SLA
                </dt>
                <dd className="mt-0.5 font-medium">≥ 95% on‑time</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Volume
                </dt>
                <dd className="mt-0.5 font-medium">≤ 180 staff</dd>
              </div>
            </dl>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs hover:bg-surface">
              <FileText className="h-3.5 w-3.5" /> View signed contract
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Next billing
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">R 127 580</p>
            <p className="text-xs text-muted-foreground">25 May 2026 · debit order</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[10px] text-success">
              <CalendarCheck className="h-3 w-3" /> Auto‑pay enabled
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
