import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Section } from "@/components/AppShell";

type Company = { id: string; name: string };
type Member = { id: string; user_id: string; is_admin: boolean; created_at: string };

export function CompanyMembers() {
  const { user, loading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: mine } = await supabase.from("company_members").select("company_id").eq("user_id", user.id).limit(1);
    const cid = mine?.[0]?.company_id;
    if (!cid) return setCompany(null);
    const { data: c } = await supabase.from("companies").select("id,name").eq("id", cid).single();
    setCompany(c);
    const { data: m } = await supabase.from("company_members").select("*").eq("company_id", cid).order("created_at");
    setMembers((m ?? []) as Member[]);
    const ids = (m ?? []).map((x) => x.user_id);
    const { data: p } = await supabase.from("profiles").select("user_id,full_name").in("user_id", ids);
    setNames(Object.fromEntries((p ?? []).map((x) => [x.user_id, x.full_name ?? ""])));
    const { data: e } = await supabase.rpc("company_member_emails", { _company: cid });
    setEmails(Object.fromEntries(((e ?? []) as { user_id: string; email: string }[]).map((x) => [x.user_id, x.email])));
  };
  useEffect(() => {
    load();
  }, [user]);

  const create = async () => {
    if (!user || !newName.trim()) return;
    setBusy(true);
    setErr(null);
    const { data: c, error } = await supabase
      .from("companies")
      .insert({ name: newName.trim(), created_by: user.id })
      .select()
      .single();
    if (!error && c) {
      const { error: e2 } = await supabase.from("company_members").insert({ company_id: c.id, user_id: user.id, is_admin: true });
      if (e2) setErr(e2.message);
    } else if (error) setErr(error.message);
    setBusy(false);
    load();
  };

  const add = async () => {
    if (!company || !email.trim()) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc("add_company_member_by_email", { _company: company.id, _email: email.trim() });
    setBusy(false);
    if (error) return setErr(error.message);
    setEmail("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("company_members").delete().eq("id", id);
    if (error) setErr(error.message);
    load();
  };

  if (loading) return null;
  if (!user)
    return (
      <Section title="Staff & learners">
        <Link to="/login" className="text-sm text-primary-glow underline">
          Sign in to manage your company
        </Link>
      </Section>
    );

  if (!company)
    return (
      <Section title="Set up your company">
        <p className="text-sm text-muted-foreground">Create your company or school to start enrolling staff or learners.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Company or school name"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={create}
            disabled={busy}
            className="rounded-xl bg-gradient-primary px-4 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Create
          </button>
        </div>
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
      </Section>
    );

  return (
    <Section title={`${company.name} — members (${members.length})`}>
      <div className="flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add member by email"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-primary px-4 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="flex items-center gap-1.5 font-medium">
                {names[m.user_id] || emails[m.user_id] || "Member"}
                {m.is_admin && <Shield className="h-3.5 w-3.5 text-primary-glow" />}
              </p>
              <p className="text-[11px] text-muted-foreground">{emails[m.user_id]}</p>
            </div>
            {m.user_id !== user.id && (
              <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
