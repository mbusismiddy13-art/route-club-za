import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow animate-[float_4s_ease-in-out_infinite]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-primary-foreground"
          aria-hidden
        >
          <path
            d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="14.5" r="1.2" fill="currentColor" />
          <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-tight">
          The Transport Club
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Commute · Subscribe · Save
        </span>
      </span>
    </Link>
  );
}
