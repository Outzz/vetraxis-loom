import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackground } from "@/components/CosmicBackground";
import { PasswordStrength } from "./auth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Restaurar Chave Ritual — Anomalia Cósmica" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta de Portador em Vetraxis.",
      },
      { property: "og:title", content: "Restaurar Chave Ritual — Anomalia Cósmica" },
      {
        property: "og:description",
        content: "Página de redefinição de senha do portal de Vetraxis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
    if (!ok) {
      toast.error("Mínimo 8 caracteres, com 1 maiúscula, 1 número e 1 símbolo.");
      return;
    }
    if (password !== confirm) {
      toast.error("As Chaves Rituais não coincidem.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Chave Ritual restaurada.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <header className="space-y-4 text-center">
            <Link
              to="/"
              className="ritual-title text-5xl italic uppercase text-foreground hover:text-ritual-gold"
            >
              Vetraxis
            </Link>
            <p className="ritual-eyebrow">Restaurar Chave Ritual</p>
          </header>

          <div className="glass-panel rounded-2xl p-8">
            {!ready ? (
              <p className="text-center text-sm text-white/50">
                Abra esta página pelo link enviado ao seu e-mail para redefinir a senha.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
                    Nova Chave Ritual
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
                  />
                </div>
                <PasswordStrength value={password} />
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
                    Confirmar
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-foreground py-3 text-xs uppercase tracking-[0.25em] text-abyss hover:bg-ritual-gold disabled:opacity-50"
                >
                  {saving ? "Selando…" : "Definir nova chave"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
