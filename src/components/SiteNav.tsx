import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const links = [
  { to: "/passenger", label: "Passenger" },
  { to: "/driver", label: "Driver" },
  { to: "/corporate", label: "Corporate" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground"
              activeProps={{ className: "bg-surface text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
