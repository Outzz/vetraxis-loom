import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

type Mode = "login" | "signup" | "recover";

function passwordChecks(value: string) {
  return {
    minLength: value.length >= 8,
    hasUpper: /[A-Z]/.test(value),
    hasNumber: /\d/.test(value),
    hasSymbol: /[^A-Za-z0-9]/.test(value),
  };
}

export function PasswordStrength({ value }: { value: string }) {
  const checks = useMemo(() => passwordChecks(value), [value]);
  const items: { key: keyof ReturnType<typeof passwordChecks>; label: string }[] = [
    { key: "minLength", label: "8+ caracteres" },
    { key: "hasUpper", label: "1 maiúscula" },
    { key: "hasNumber", label: "1 número" },
    { key: "hasSymbol", label: "1 símbolo" },
  ];
  const score = items.filter((i) => checks[i.key]).length;
  const label = ["Frágil", "Frágil", "Instável", "Sólida", "Ritual"][score];
  const color =
    score <= 1
      ? "var(--color-corruption)"
      : score === 2
        ? "#d19a3a"
        : score === 3
          ? "#8ab4f8"
          : "var(--color-ritual-gold)";

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i < score ? color : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[10px] uppercase tracking-widest" style={{ color }}>
          {value ? label : "—"}
        </span>
        {items.map((i) => (
          <span
            key={i.key}
            className={`text-[10px] ${checks[i.key] ? "text-ritual-gold" : "text-white/30"}`}
          >
            {checks[i.key] ? "✓" : "○"} {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function AuthPage() {
  const { mode: initialMode, next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const destination = safeNext(next);

  function goToDestination() {
    if (destination) {
      window.location.href = destination;
      return;
    }
    navigate({ to: "/dashboard" });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (destination) window.location.href = destination;
        else navigate({ to: "/dashboard" });
      }
    });
  }, [navigate, destination]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setRecoverySent(true);
        toast.success("Enviamos um link de recuperação para sua essência digital.");
        return;
      }

      if (mode === "signup") {
        const checks = passwordChecks(password);
        if (!Object.values(checks).every(Boolean)) {
          toast.error(
            "A Chave Ritual precisa de no mínimo 8 caracteres, incluindo uma letra maiúscula, um número e um símbolo.",
          );
          return;
        }
        if (password !== confirmPassword) {
          toast.error("As Chaves Rituais não coincidem.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + (destination ?? "/dashboard"),
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Pacto selado. Consciência sincronizada.");
        if (data.session) goToDestination();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Consciência sincronizada.");
        goToDestination();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const eyebrow =
    mode === "login"
      ? "Sincronizar Consciência"
      : mode === "signup"
        ? "Iniciar Ritual"
        : "Restaurar Chave Ritual";

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
            <p className="ritual-eyebrow">{eyebrow}</p>
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

              {mode !== "recover" && (
                <Field
                  label="Chave Ritual"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              )}

              {mode === "signup" && (
                <>
                  <PasswordStrength value={password} />
                  <Field
                    label="Confirmar Chave Ritual"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  {confirmPassword.length > 0 && (
                    <p
                      className={`ml-1 text-[10px] uppercase tracking-widest ${
                        confirmPassword === password ? "text-ritual-gold" : "text-corruption"
                      }`}
                    >
                      {confirmPassword === password
                        ? "✓ As chaves coincidem"
                        : "As chaves não coincidem"}
                    </p>
                  )}
                </>
              )}

              {mode === "recover" && (
                <p className="ml-1 text-[11px] leading-relaxed text-white/40">
                  {recoverySent
                    ? "Se essa essência existir, o link de restauração já foi enviado. Verifique sua caixa de entrada e o spam."
                    : "Enviaremos um link para você definir uma nova Chave Ritual."}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-foreground py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors duration-500 hover:bg-ritual-gold disabled:opacity-50"
              >
                {loading
                  ? "Canalizando…"
                  : mode === "login"
                    ? "Manifestar"
                    : mode === "signup"
                      ? "Selar o Pacto"
                      : "Enviar link"}
              </button>
            </form>

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("recover")}
                className="mt-4 w-full text-center text-[11px] text-white/40 hover:text-ritual-gold"
              >
                Esqueceu a Chave Ritual?
              </button>
            )}

            {mode !== "recover" && (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    Ou via Profundeza
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <button
                  type="button"
                  disabled
                  title="Integração Discord será liberada em uma fase futura"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border border-[#5865F2]/20 bg-[#5865F2]/5 py-3 text-xs uppercase tracking-widest text-[#5865F2]/50"
                >
                  Discord · em breve
                </button>
              </>
            )}

            <p className="mt-8 text-center text-xs text-white/40">
              {mode === "recover" ? (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-ritual-gold hover:underline"
                >
                  ← Voltar para o acesso
                </button>
              ) : (
                <>
                  {mode === "login" ? "Novo aqui?" : "Já possui um pacto?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-ritual-gold hover:underline"
                  >
                    {mode === "login" ? "Iniciar Ritual" : "Sincronizar"}
                  </button>
                </>
              )}
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
