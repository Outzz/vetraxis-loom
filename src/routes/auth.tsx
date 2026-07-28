import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { CosmicBackground } from "@/components/CosmicBackground";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sincronizar Consciência — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Acesse o portal de Vetraxis. Entre com sua conta de Portador para gerenciar campanhas, personagens e ritos.",
      },
      {
        property: "og:title",
        content: "Sincronizar Consciência — Anomalia Cósmica",
      },
      {
        property: "og:description",
        content: "Portal de acesso ao universo de Vetraxis.",
      },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Ritual iniciado. Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Consciência sincronizada.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div
          className="w-full max-w-md space-y-10"
          style={{ animation: "fade-up 1s var(--ease-out-expo) both" }}
        >
          <header className="space-y-4 text-center">
            <Link
              to="/"
              className="ritual-title text-5xl italic uppercase text-foreground transition-colors hover:text-ritual-gold"
            >
              Vetraxis
            </Link>
            <div className="mx-auto h-px w-24 bg-ritual-gold/40" />
            <p className="ritual-eyebrow">
              {mode === "login" ? "Sincronizar Consciência" : "Iniciar Ritual"}
            </p>
          </header>

          <div className="glass-panel rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <Field
                  label="Nome do Portador"
                  type="text"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="Kaelen Thorne"
                />
              )}
              <Field
                label="Essência Digital"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="portador@void.com"
                required
              />
              <Field
                label="Chave Ritual"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-foreground py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors duration-500 hover:bg-ritual-gold disabled:opacity-50"
              >
                {loading
                  ? "Canalizando…"
                  : mode === "login"
                    ? "Manifestar"
                    : "Selar o Pacto"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] uppercase tracking-widest text-white/30">
                Ou via Profundeza
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/5 py-3 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <GoogleGlyph />
                Sincronizar Google
              </button>

              <button
                type="button"
                disabled
                title="Integração Discord será liberada em uma fase futura"
                className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-[#5865F2]/20 bg-[#5865F2]/5 py-3 text-xs uppercase tracking-widest text-[#5865F2]/50"
              >
                Discord · em breve
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-white/40">
              {mode === "login" ? "Novo aqui?" : "Já possui um pacto?"}{" "}
              <button
                type="button"
                onClick={() =>
                  setMode((m) => (m === "login" ? "signup" : "login"))
                }
                className="text-ritual-gold hover:underline"
              >
                {mode === "login" ? "Iniciar Ritual" : "Sincronizar"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
        {props.label}
      </label>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        minLength={props.minLength}
        className="w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:border-prismatic/40 focus:outline-none focus:ring-1 focus:ring-prismatic/40"
      />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.3 0-5.9-2.7-5.9-6.1s2.6-6.1 5.9-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2z"
      />
    </svg>
  );
}
