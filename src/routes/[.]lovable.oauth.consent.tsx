import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackground } from "@/components/CosmicBackground";

type OAuthResult = {
  data?: {
    client?: { name?: string } | null;
    redirect_url?: string;
    redirect_to?: string;
  } | null;
  error?: { message: string } | null;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id:
      typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get(
      "authorization_id",
    )!;
    const { data, error } = await oauthApi().getAuthorizationDetails(
      authorizationId,
    );
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data ?? null;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <Shell>
      <p className="text-sm text-white/60">
        Não foi possível carregar este pedido de autorização:{" "}
        {String((error as Error)?.message ?? error)}
      </p>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel w-full max-w-md space-y-6 rounded-2xl p-8 text-center shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "um aplicativo";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("O servidor de autorização não retornou um redirecionamento.");
      return;
    }
    window.location.href = target;
  }

  return (
    <Shell>
      <p className="ritual-eyebrow">Pacto de Acesso</p>
      <h1 className="ritual-title text-3xl italic text-foreground">
        Conectar {clientName}
      </h1>
      <p className="text-sm text-white/50">
        Isto permite que {clientName} leia e atualize suas campanhas,
        personagens e recursos em Vetraxis agindo como você.
      </p>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(true)}
          className="w-full rounded-md bg-foreground py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors duration-500 hover:bg-ritual-gold disabled:opacity-50"
        >
          {busy ? "Selando…" : "Aprovar"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide(false)}
          className="w-full rounded-md border border-white/10 bg-white/5 py-3 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          Recusar
        </button>
      </div>
    </Shell>
  );
}
