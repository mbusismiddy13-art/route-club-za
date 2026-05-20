import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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

  const signInWithGoogle = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/passenger",
    });
    if (result.error) {
      setBusy(false);
      return setErr(result.error.message ?? "Google sign-in failed");
    }
    if (result.redirected) return;
    setBusy(false);
    navigate({ to: "/passenger" });
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

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-elevated disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z"/>
            </svg>
            Continue with Google
          </button>
          <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

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

          <form className="mt-6 space-y-4" onSubmit={submit}>
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
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
            )}

            {err && <p className="text-xs text-destructive">{err}</p>}
            {msg && <p className="text-xs text-success">{msg}</p>}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "phone" ? "Send OTP" : authMode === "signin" ? "Sign in" : "Create account"}
            </button>

            {mode === "email" && (
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {authMode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            )}
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            By continuing you agree to our POPIA‑aligned terms.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          We never sell your data.
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
