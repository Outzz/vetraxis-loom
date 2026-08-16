import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackground } from "@/components/CosmicBackground";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
  next: z.string().optional(),
});

/** Only same-origin relative paths may be used as a post-login destination. */
function safeNext(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}


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
  const { mode: initialMode, next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = safeNext(next);

  function goToDestination() {
    if (destination) {
      window.location.href = destination;
      return;
    }
    navigate({ to: "/dashboard" });
  }

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (destination) window.location.href = destination;
        else navigate({ to: "/dashboard" });
      }
    });
  }, [navigate, destination]);

  function validatePassword(value: string) {
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const minLength = value.length >= 8;
    return { valid: hasUpper && hasNumber && hasSymbol && minLength, hasUpper, hasNumber, hasSymbol, minLength };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const validation = validatePassword(password);
        if (!validation.valid) {
          toast.error(
            "A Chave Ritual precisa de no mínimo 8 caracteres, incluindo uma letra maiúscula, um número e um símbolo."
          );
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              window.location.origin + (destination ?? "/dashboard"),
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Pacto selado. Consciência sincronizada.");
        if (data.session) goToDestination();

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Consciência sincronizada.");
        goToDestination();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(message);
    } finally {
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
