import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const ROLES = ["passenger", "driver", "admin", "corporate_admin"] as const;

// Testing-only: instant sign-in as a demo account. Works only on the editor preview / localhost.
export const testLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ role: z.enum(ROLES) }).parse(d))
  .handler(async ({ data }) => {
    const host = (getRequestHeader("x-forwarded-host") ?? getRequestHeader("host") ?? "").toLowerCase();
    const allowed = host.startsWith("localhost") || host.startsWith("id-preview--") || host.includes("-preview--");
    if (!allowed) throw new Error("Test sign-in is only available in the preview.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = `test-${data.role.replace("_", "-")}@nalaflow.test`;
    const password = `Test-${data.role}-Nala2026!`;
    const names: Record<string, string> = {
      passenger: "Test Passenger",
      driver: "Test Driver",
      admin: "Test Admin",
      corporate_admin: "Test Company Admin",
    };

    let { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let user = list?.users.find((u) => u.email === email);
    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: names[data.role] },
      });
      if (error) throw new Error(error.message);
      user = created.user!;
    }
    await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: data.role }, { onConflict: "user_id,role" });

    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const anon = createClient(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: s, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || !s.session) throw new Error(error?.message ?? "Sign-in failed");
    list = null;
    return { access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
