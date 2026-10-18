import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Section } from "@/components/AppShell";

type Txn = { id: string; type: string; status: string; amount_cents: number; description: string | null; created_at: string };
const zar = (c: number) => `R${(c / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

export function WalletCard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: w } = await supabase.from("wallets").select("balance_cents").eq("user_id", user.id).maybeSingle();
      setBalance(w?.balance_cents ?? 0);
      const { data: t } = await supabase
        .from("wallet_transactions")
        .select("id,type,status,amount_cents,description,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTxns((t ?? []) as Txn[]);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <Section title="Wallet">
      <div className="flex items-center justify-between rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
        <div>
          <p className="text-[10px] uppercase tracking-wider opacity-80">Balance</p>
          <p className="mt-1 font-display text-2xl font-semibold">{balance == null ? "…" : zar(balance)}</p>
        </div>
        <Wallet className="h-6 w-6 opacity-80" />
      </div>
      <button
        disabled
        title="Card payments will be switched on once payments are connected"
        className="mt-3 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs opacity-60"
      >
        Top up (card payments coming soon)
      </button>
      <div className="mt-4 space-y-2">
        {txns.length === 0 && <p className="text-xs text-muted-foreground">No transactions yet.</p>}
        {txns.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="capitalize">{t.description || t.type.replace("_", " ")}</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString("en-ZA")} · {t.status}
              </p>
            </div>
            <span className={t.amount_cents >= 0 ? "text-success" : ""}>{zar(t.amount_cents)}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
