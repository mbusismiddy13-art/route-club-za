import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Bell, Search } from "lucide-react";
import { Logo } from "./Logo";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function AppShell({
  items,
  title,
  subtitle,
  badge,
  children,
}: {
  items: NavItem[];
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-5 lg:px-6">
        {/* Sidebar */}
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-64 shrink-0 flex-col rounded-3xl border border-border bg-surface p-4 shadow-card lg:flex">
          <div className="px-1">
            <Logo />
          </div>
          {badge && (
            <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {badge}
            </span>
          )}
          <nav className="mt-6 flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                activeProps={{
                  className:
                    "bg-surface-elevated text-foreground shadow-soft border border-border",
                }}
                activeOptions={{ exact: item.to.endsWith("/") || !item.to.includes("/", 1) }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="text-xs font-medium text-foreground">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              24/7 control room · POPIA compliant · SOS ready
            </p>
            <button className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface">
              Open support
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface px-5 py-4 shadow-card">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-muted-foreground sm:flex">
                <Search className="h-3.5 w-3.5" />
                <input
                  placeholder="Search routes, drivers, riders…"
                  className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button className="relative rounded-full border border-border bg-background p-2.5 text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <div className="flex items-center gap-2.5 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
                  TC
                </span>
                <span className="text-sm font-medium">Thando C.</span>
              </div>
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "primary";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "primary"
          ? "text-primary-glow"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg bg-surface-elevated ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs ${toneCls}`}>{delta}</p>
      )}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border bg-surface p-5 shadow-card ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
