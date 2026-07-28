import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Perfil do Portador — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Ajuste o nome do Portador, avatar e preferências rituais do seu Fragmento.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      setDisplayName(
        (u.user_metadata?.display_name as string | undefined) ??
          (u.user_metadata?.full_name as string | undefined) ??
          "",
      );
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Fragmento atualizado.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div
        className="space-y-10"
        style={{ animation: "fade-up 0.8s var(--ease-out-expo) both" }}
      >
        <header className="space-y-3">
          <Link
            to="/dashboard"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
          >
            ← Retornar ao portal
          </Link>
          <p className="ritual-eyebrow">Fragmento pessoal</p>
          <h1 className="ritual-title text-4xl text-foreground md:text-5xl">
            Perfil do Portador
          </h1>
        </header>

        <form onSubmit={handleSave} className="glass-panel space-y-6 rounded-2xl p-8">
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
              Nome do Portador
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kaelen Thorne"
              className="w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:border-prismatic/40 focus:outline-none focus:ring-1 focus:ring-prismatic/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
              Essência Digital
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-white/50"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors hover:bg-ritual-gold disabled:opacity-50"
            >
              {saving ? "Selando…" : "Selar mudanças"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-corruption/30 px-6 py-3 text-xs uppercase tracking-[0.25em] text-corruption transition-colors hover:bg-corruption/10"
            >
              Desconectar
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] uppercase tracking-widest text-white/30">
          Mais configurações rituais serão liberadas em fases futuras.
        </p>
      </div>
    </div>
  );
}
