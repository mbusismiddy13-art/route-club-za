import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — The Transport Club" }] }),
});

function LoginPage() {
  const [mode, setMode] = useState<"phone" | "email">("email");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (mode === "phone") {
      setMsg("Phone OTP coming soon — please use email for now.");
      return;
    }
    setBusy(true);
    if (authMode === "signup") {
      const redirectUrl = `${window.location.origin}/passenger`;
      const { error } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      setMsg("Account created. Check your email to confirm, then sign in.");
      setAuthMode("signin");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      navigate({ to: "/passenger" });
    }
  };


  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-between px-6 py-8 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary-glow" /> OTP + facial verification
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your commute, subscription and trips.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-border bg-surface p-1 text-xs">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 capitalize transition ${
                  mode === m
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "phone" ? "Phone OTP" : "Email"}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                {mode === "phone" ? "Mobile number" : "Email address"}
              </span>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 focus-within:border-primary">
                {mode === "phone" ? (
                  <Phone className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-muted-foreground" />
                )}
                <input
                  type={mode === "phone" ? "tel" : "email"}
                  placeholder={mode === "phone" ? "+27 71 234 5678" : "you@company.co.za"}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>

            {mode === "email" && (
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
            )}

            <button
              type="button"
              className="w-full rounded-xl bg-gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95"
            >
              {mode === "phone" ? "Send OTP" : "Sign in"}
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium hover:bg-surface-elevated"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/" className="text-primary-glow underline-offset-4 hover:underline">
              Create a Transport Club account
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          By continuing you agree to our POPIA‑aligned terms. We never sell your data.
        </p>
      </div>

      {/* Right: visual */}
      <div className="relative hidden overflow-hidden bg-hero lg:block">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <blockquote className="max-w-md font-display text-2xl font-semibold leading-snug tracking-tight">
            "Cut my taxi fare by 62%. Same time every morning. Same driver. I budget my
            month again."
          </blockquote>
          <div className="rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                NK
              </span>
              <div>
                <p className="text-sm font-medium">Naledi K.</p>
                <p className="text-xs text-muted-foreground">
                  Pretoria → Sandton · Commuter+
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
