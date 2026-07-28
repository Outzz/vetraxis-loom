import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Portal do Portador — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Painel principal do Portador. Acesse campanhas, personagens, criaturas, relíquias e o Códice de Vetraxis.",
      },
    ],
  }),
  component: Dashboard,
});

type Module = {
  key: string;
  eyebrow: string;
  title: string;
  desc: string;
  size: "wide" | "square";
  variant?: "prismatic";
  glyph: React.ReactNode;
  meta?: string;
};

const MODULES: Module[] = [
  {
    key: "campanhas",
    eyebrow: "Ecos da Eternidade",
    title: "Campanhas",
    desc: "Navegue pelas crônicas do horror que definem sua existência.",
    size: "wide",
    glyph: <span className="ritual-title text-8xl italic text-ritual-gold/20">01</span>,
  },
  {
    key: "personagens",
    eyebrow: "",
    title: "Personagens",
    desc: "",
    size: "square",
    meta: "Portadores ativos",
    glyph: <div className="size-2 rotate-45 bg-white" />,
  },
  {
    key: "criaturas",
    eyebrow: "",
    title: "Bestiário",
    desc: "",
    size: "square",
    meta: "Entidades",
    glyph: <div className="size-1.5 rounded-full bg-prismatic" />,
  },
  {
    key: "reliquias",
    eyebrow: "",
    title: "Relíquias",
    desc: "",
    size: "square",
    meta: "Artefatos",
    glyph: <div className="h-px w-4 bg-ritual-gold" />,
  },
  {
    key: "codice",
    eyebrow: "",
    title: "O Códice",
    desc: "As leis fundamentais que regem o colapso da realidade.",
    size: "wide",
    variant: "prismatic",
    glyph: null,
  },
  {
    key: "missoes",
    eyebrow: "",
    title: "Missões",
    desc: "",
    size: "square",
    meta: "Pendentes",
    glyph: <div className="size-3 rounded-full ring-1 ring-white/50" />,
  },
  {
    key: "eventos",
    eyebrow: "",
    title: "Eventos",
    desc: "",
    size: "square",
    meta: "Eclipse iminente",
    glyph: <div className="size-1 animate-pulse bg-white" />,
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Portador");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      const name =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Portador";
      setDisplayName(name);
      setEmail(user.email ?? "");
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Consciência desconectada.");
    navigate({ to: "/" });
  }

  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-16">
      <nav
        className="mb-16 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8"
        style={{ animation: "fade-up 0.8s var(--ease-out-expo) both" }}
      >
        <div className="flex items-center gap-5">
          <div className="group relative size-14">
            <div className="absolute inset-0 rounded-full bg-prismatic/40 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            <div className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-void-blue text-lg ritual-title text-ritual-gold ring-2 ring-ritual-gold/30">
              {avatarInitial}
            </div>
          </div>
          <div>
            <p className="ritual-eyebrow">Portador do Fragmento</p>
            <h1 className="ritual-title mt-1 text-2xl text-foreground md:text-3xl">
              {displayName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden text-right md:block">
            <p className="font-mono text-[10px] uppercase text-white/40">
              Frequência Cósmica
            </p>
            <p className="font-mono text-xs text-foreground">
              442.92 Hz · <span className="text-ritual-gold">STABLE</span>
            </p>
          </div>
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/5"
            title="Perfil e configurações"
          >
            <span className="size-1 rounded-full bg-white shadow-[0_0_8px_white]" />
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-md border border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-white/60 transition-colors hover:border-corruption/50 hover:text-corruption"
          >
            Desconectar
          </button>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {MODULES.map((m, i) => (
          <ModuleCard key={m.key} module={m} index={i} />
        ))}
      </div>

      <footer className="mx-auto mt-24 flex max-w-7xl flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-tighter text-white/20">
        <div>Lat: 41.24.03 · Long: -2.10.88</div>
        <div className="hidden md:block">© Vetraxis Protocol 2.8.4</div>
        <div>Void-State: Stable · {email}</div>
      </footer>
    </div>
  );
}

function ModuleCard({ module: m, index }: { module: Module; index: number }) {
  const wide = m.size === "wide";
  const prismatic = m.variant === "prismatic";

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl p-8 transition-all",
        wide ? "md:col-span-2 aspect-[2/1]" : "aspect-square",
        prismatic
          ? "border border-prismatic/25 bg-prismatic/10 backdrop-blur-xl hover:border-prismatic/60"
          : "glass-panel hover:border-ritual-gold/40",
        "flex flex-col",
        wide ? "justify-end" : "justify-between",
      ].join(" ")}
      style={{
        animation: `card-float ${6 + (index % 4) * 0.5}s ease-in-out infinite, fade-up 0.8s var(--ease-out-expo) both`,
        animationDelay: `${index * 120}ms, ${index * 100}ms`,
      }}
    >
      {/* Prismatic scanline */}
      {prismatic && (
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-1 w-full animate-[scanline_5s_linear_infinite] bg-white/60" />
        </div>
      )}

      {/* Big index for wide cards */}
      {wide && !prismatic && (
        <div className="pointer-events-none absolute right-0 top-0 select-none p-6">
          {m.glyph}
        </div>
      )}

      {/* Glyph for squares */}
      {!wide && (
        <div className="flex size-11 items-center justify-center rounded-full border border-white/15 transition-transform group-hover:scale-110">
          {m.glyph}
        </div>
      )}

      <div className="relative z-10 space-y-2">
        {m.eyebrow && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-prismatic">
            {m.eyebrow}
          </span>
        )}
        <h3
          className={[
            "ritual-title text-foreground",
            wide ? "text-4xl" : "text-2xl",
          ].join(" ")}
        >
          {m.title}
        </h3>
        {m.desc && (
          <p className="max-w-xs text-sm text-white/50">{m.desc}</p>
        )}
        {m.meta && (
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            {m.meta}
          </p>
        )}
      </div>
    </div>
  );
}
