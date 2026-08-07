import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ELEMENTS, RELICS, corruptionTier, type CosmicElement, type Relic } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/characters/")({
  head: () => ({
    meta: [
      { title: "Portadores — Anomalia Cósmica" },
      {
        name: "description",
        content: "Fichas de personagens do universo de Vetraxis.",
      },
    ],
  }),
  component: CharactersPage,
});

type Character = {
  id: string;
  name: string;
  concept: string | null;
  level: number;
  element: CosmicElement | null;
  relic: Relic | null;
  hp_current: number;
  hp_max: number;
  sanity_current: number;
  sanity_max: number;
  pa_current: number;
  pa_max: number;
  corruption: number;
  campaign_id: string | null;
  portrait_url: string | null;
};

function CharactersPage() {
  const [chars, setChars] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("owner_id", u.user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setChars((data as Character[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <header
        className="mb-12 flex flex-wrap items-end justify-between gap-6"
        style={{ animation: "fade-up 0.8s var(--ease-out-expo) both" }}
      >
        <div>
          <Link
            to="/dashboard"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
          >
            ← Portal
          </Link>
          <p className="ritual-eyebrow mt-2">Fragmentos Vivos</p>
          <h1 className="ritual-title mt-2 text-5xl text-foreground">Portadores</h1>
        </div>
        <Link
          to="/characters/new"
          className="rounded-md bg-ritual-gold px-5 py-2.5 text-xs uppercase tracking-widest text-abyss hover:bg-ritual-gold/90"
        >
          + Novo Portador
        </Link>
      </header>

      {loading ? (
        <p className="ritual-eyebrow animate-pulse">Convocando…</p>
      ) : chars.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <p className="ritual-eyebrow">Nenhuma alma vinculada</p>
          <h2 className="ritual-title mt-4 text-2xl text-foreground">
            Crie seu primeiro Portador
          </h2>
          <Link
            to="/characters/new"
            className="mt-6 inline-block rounded-md bg-ritual-gold px-5 py-2.5 text-xs uppercase tracking-widest text-abyss hover:bg-ritual-gold/90"
          >
            Iniciar Ritual
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chars.map((c, i) => (
            <CharCard key={c.id} c={c} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function CharCard({ c, i }: { c: Character; i: number }) {
  const el = c.element ? ELEMENTS[c.element] : null;
  const relic = c.relic ? RELICS[c.relic] : null;
  const tier = corruptionTier(c.corruption);
  return (
    <Link
      to="/characters/$id"
      params={{ id: c.id }}
      className="group glass-panel block rounded-2xl p-6 transition-all hover:border-ritual-gold/40"
      style={{
        animation: "fade-up 0.8s var(--ease-out-expo) both",
        animationDelay: `${i * 80}ms`,
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-abyss text-white/25">
          {c.portrait_url ? <img src={c.portrait_url} alt="" className="h-full w-full object-cover" /> : "◇"}
        </div>
        <h3 className="min-w-0 flex-1 truncate ritual-title text-2xl text-foreground group-hover:text-ritual-gold">
          {c.name}
        </h3>
        <span className="font-mono text-[10px] uppercase text-white/40">Nv {c.level}</span>
      </div>
      {c.concept && <p className="text-xs italic text-white/50">{c.concept}</p>}
      {el && (
        <p
          className="mt-2 text-[10px] uppercase tracking-widest"
          style={{ color: el.color }}
        >
          {el.name} · {el.epithet}
        </p>
      )}
      {relic && (
        <p className="mt-1 text-[10px] uppercase tracking-widest text-ritual-gold/70">
          ⟡ {relic.name}
        </p>
      )}
      <div className="mt-4 space-y-1.5">
        <Bar label="PV" value={c.hp_current} max={c.hp_max} color="#84cc16" />
        <Bar label="PS" value={c.sanity_current} max={c.sanity_max} color="#38bdf8" />
        <Bar label="PA" value={c.pa_current} max={c.pa_max} color="#a78bfa" />
        <Bar
          label="Corrupção"
          value={c.corruption}
          max={100}
          color={tier.color}
          inverse
        />
      </div>
      <p
        className="mt-3 text-[10px] uppercase tracking-widest"
        style={{ color: tier.color }}
      >
        {tier.name}
      </p>
    </Link>
  );
}

function Bar({
  label,
  value,
  max,
  color,
  inverse,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  inverse?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] text-white/50">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full transition-all"
          style={{
            width: `${inverse ? pct : pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
