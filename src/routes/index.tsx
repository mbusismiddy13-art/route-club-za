import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Briefcase,
  GraduationCap,
  MapPin,
  Sparkles,
  Repeat,
  Wallet,
  Bell,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "The Transport Club — Subscribe to your commute" },
      {
        name: "description",
        content:
          "Affordable monthly commuter subscriptions and shared routes for workers, students and schools in South Africa.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              Built for the South African commuter
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Subscribe to your <span className="text-gradient">commute</span>.
              <br />Skip the ride‑hailing tax.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Monthly commuter plans, shared‑route matching and verified drivers — for
              workers, students, schools and businesses. Predictable pricing.
              Real‑time tracking. POPIA‑safe.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/passenger"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95"
              >
                Open passenger app <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/driver"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-surface"
              >
                I'm a driver
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { k: "R649", v: "Monthly commute" },
                { k: "23k+", v: "Verified seats" },
                { k: "98.4%", v: "On‑time rate" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-semibold tracking-tight">
                    {s.k}
                  </dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual mock */}
          <HeroMock />
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Who it's for
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              One platform. Four commuters.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            We optimise for recurring routes — not one‑off rides. That's how we keep
            seats full and prices low.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Briefcase,
              title: "Daily commuters",
              copy: "Lock in a monthly seat to work. Same driver, same time, no surge.",
            },
            {
              icon: GraduationCap,
              title: "Students & parents",
              copy: "Verified school routes with live tracking and parent share‑trip.",
            },
            {
              icon: Users,
              title: "Businesses",
              copy: "Staff transport contracts, billed monthly, with HR dashboards.",
            },
            {
              icon: ShieldCheck,
              title: "Schools",
              copy: "Manage every learner, vehicle and pickup window in one place.",
            },
          ].map((a) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition hover:border-border-strong"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-primary-glow">
                <a.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "1. Set your route",
              copy: "Tell us where home, work or school is. We cluster commuters going the same way.",
            },
            {
              icon: Repeat,
              title: "2. Subscribe monthly",
              copy: "Pick a 5‑day or 7‑day plan. Pay by EFT, card, debit order or wallet.",
            },
            {
              icon: ShieldCheck,
              title: "3. Ride with verified drivers",
              copy: "Every driver is FICA‑checked. Every vehicle is roadworthy‑verified.",
            },
          ].map((s) => (
            <div key={s.title} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.copy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Plans
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Predictable monthly pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Cancel any month. Roll over unused trips for up to 30 days.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              name: "Commuter",
              price: "R649",
              tag: "5 days / week",
              perks: [
                "Shared route, fixed pickup window",
                "Live GPS tracking + share trip",
                "SOS panic button",
                "Up to 22 trips / month",
              ],
            },
            {
              name: "Commuter+",
              price: "R899",
              tag: "Most popular",
              featured: true,
              perks: [
                "Everything in Commuter",
                "Reserved seat, no rotation",
                "Priority pickup ordering",
                "30 trips + 4 weekend trips",
              ],
            },
            {
              name: "Scholar",
              price: "R549",
              tag: "School term",
              perks: [
                "Verified school routes",
                "Parent share‑trip + alerts",
                "Approved driver pool only",
                "Pause during holidays",
              ],
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-6 shadow-card ${
                p.featured
                  ? "border-primary/60 bg-surface ring-glow"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                    p.featured
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-surface-elevated text-muted-foreground"
                  }`}
                >
                  {p.tag}
                </span>
              </div>
              <p className="mt-5 font-display text-4xl font-semibold tracking-tight">
                {p.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / month
                </span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  p.featured
                    ? "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
                    : "border border-border bg-background hover:bg-surface-elevated"
                }`}
              >
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Safety & trust
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Designed around the SA commuter — not investors.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Every driver is background‑verified, every vehicle is compliance‑checked,
              and every trip is logged. We never sell personal data — only anonymised
              demand insights.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { i: ShieldCheck, t: "FICA + criminal verification" },
              { i: PhoneCall, t: "24/7 SOS control room" },
              { i: Bell, t: "Live trip alerts to family" },
              { i: Wallet, t: "Encrypted SA payments" },
            ].map((f) => (
              <li
                key={f.t}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface-elevated text-primary-glow">
                  <f.i className="h-4 w-4" />
                </span>
                <span className="text-sm">{f.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-primary p-10 text-center shadow-glow">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
            Ready to take back your commute?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80">
            Join the early access list — first 1,000 commuters get their first month
            free.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-surface"
            >
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/corporate"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} The Transport Club · Made in South Africa</p>
          <p>POPIA‑compliant · Insurance partners · No data sold</p>
        </div>
      </footer>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl" />
      <div className="relative rounded-[2rem] border border-border bg-surface p-4 shadow-glow">
        <div className="flex items-center justify-between rounded-2xl bg-surface-elevated px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Tomorrow · Mon
            </p>
            <p className="font-display text-sm font-semibold">Soweto → Sandton CBD</p>
          </div>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-success">
            On‑time
          </span>
        </div>

        <div className="relative mt-3 h-72 overflow-hidden rounded-2xl bg-[oklch(0.16_0.04_270)]">
          <svg viewBox="0 0 400 300" className="h-full w-full">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path
                  d="M32 0H0V32"
                  fill="none"
                  stroke="oklch(0.27 0.04 270)"
                  strokeWidth="0.5"
                />
              </pattern>
              <linearGradient id="route" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.21 275)" />
                <stop offset="100%" stopColor="oklch(0.74 0.18 280)" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grid)" />
            <path
              d="M40 250 C 110 200, 130 160, 200 150 S 320 110, 360 50"
              fill="none"
              stroke="url(#route)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* stops */}
            {[
              [40, 250],
              [200, 150],
              [360, 50],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="9" fill="oklch(0.18 0.04 270)" />
                <circle cx={x} cy={y} r="5" fill="oklch(0.74 0.18 280)" />
              </g>
            ))}
            {/* vehicle */}
            <circle cx="200" cy="150" r="14" fill="oklch(0.62 0.21 275)" opacity="0.25" />
            <circle cx="200" cy="150" r="7" fill="oklch(0.74 0.18 280)" />
          </svg>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-border bg-background/80 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[10px] font-semibold text-primary-foreground">
                SM
              </span>
              <div className="leading-tight">
                <p className="text-xs font-medium">Sipho M. · Quantum</p>
                <p className="text-[10px] text-muted-foreground">★ 4.9 · ND 23 ABC GP</p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              ETA 6 min
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: "Seats", v: "11 / 14" },
            { l: "Fare", v: "R29" },
            { l: "CO₂ saved", v: "1.8 kg" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl bg-surface-elevated px-3 py-2 text-center"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.l}
              </p>
              <p className="font-display text-sm font-semibold">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
