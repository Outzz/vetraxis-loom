import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { queueCreature } from "@/lib/combat";
import {
  BEHAVIORS,
  CREATURES,
  THREATS,
  type Behavior,
  type Creature,
  type ThreatLevel,
} from "@/lib/bestiary";
import { ELEMENTS, type CosmicElement } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/bestiario")({
  head: () => ({
    meta: [
      { title: "Bestiário de Vetraxis — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Consulte todas as criaturas de Vetraxis: filtre por nível de ameaça, elemento cósmico e comportamento, com estatísticas completas de combate.",
      },
      { property: "og:title", content: "Bestiário de Vetraxis — Anomalia Cósmica" },
      {
        property: "og:description",
        content:
          "Anomalias, parasitas e arautos do vazio catalogados por ameaça, elemento e comportamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bestiario,
});

type Filter<T> = T | "all";

function Bestiario() {
  const [query, setQuery] = useState("");
  const [threat, setThreat] = useState<Filter<ThreatLevel>>("all");
  const [element, setElement] = useState<Filter<CosmicElement>>("all");
  const [behavior, setBehavior] = useState<Filter<Behavior>>("all");
  const [selected, setSelected] = useState<Creature | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREATURES.filter((c) => {
      if (threat !== "all" && c.threat !== threat) return false;
      if (element !== "all" && c.element !== element) return false;
      if (behavior !== "all" && c.behavior !== behavior) return false;
      if (
        q &&
        !`${c.name} ${c.epithet} ${c.lore}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [query, threat, element, behavior]);

  const active = selected && results.includes(selected) ? selected : null;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-16">
      <Link
        to="/dashboard"
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
      >
        ← Portal
      </Link>

      <header
        className="mt-4 mb-10 space-y-3"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <p className="ritual-eyebrow">Catálogo de Anomalias</p>
        <h1 className="ritual-title text-6xl text-foreground">Bestiário</h1>
        <p className="max-w-2xl text-sm italic text-white/60">
          "Nomear uma anomalia não a torna menos real — apenas mais fácil de
          temer com precisão." — Arquivo de Campo, Vetraxis
        </p>
      </header>

      {/* Filtros */}
      <div className="glass-panel mb-8 space-y-5 rounded-2xl p-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, epíteto ou lenda…"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-white/25 focus:border-prismatic/60"
        />

        <FilterRow label="Ameaça">
          <Chip active={threat === "all"} onClick={() => setThreat("all")}>
            Todas
          </Chip>
          {(Object.keys(THREATS) as ThreatLevel[]).map((k) => (
            <Chip
              key={k}
              active={threat === k}
              color={THREATS[k].color}
              onClick={() => setThreat(threat === k ? "all" : k)}
            >
              {THREATS[k].name}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Elemento">
          <Chip active={element === "all"} onClick={() => setElement("all")}>
            Todos
          </Chip>
          {(Object.keys(ELEMENTS) as CosmicElement[]).map((k) => (
            <Chip
              key={k}
              active={element === k}
              color={ELEMENTS[k].color}
              onClick={() => setElement(element === k ? "all" : k)}
            >
              {ELEMENTS[k].name}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Comportamento">
          <Chip active={behavior === "all"} onClick={() => setBehavior("all")}>
            Todos
          </Chip>
          {(Object.keys(BEHAVIORS) as Behavior[]).map((k) => (
            <Chip
              key={k}
              active={behavior === k}
              onClick={() => setBehavior(behavior === k ? "all" : k)}
            >
              {BEHAVIORS[k].name}
            </Chip>
          ))}
        </FilterRow>

        <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
          {results.length} de {CREATURES.length} criaturas catalogadas
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((c, i) => (
            <CreatureCard
              key={c.id}
              creature={c}
              index={i}
              selected={active?.id === c.id}
              onSelect={() => setSelected(active?.id === c.id ? null : c)}
            />
          ))}
          {results.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
              Nenhuma anomalia corresponde a esses parâmetros. O vazio permanece
              silencioso.
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          {active ? (
            <CreatureDetail creature={active} />
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-sm text-white/40">
              Selecione uma criatura para consultar a ficha completa.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-white/35">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors",
        active
          ? "border-transparent text-abyss"
          : "border-white/10 text-white/55 hover:border-white/30 hover:text-foreground",
      ].join(" ")}
      style={
        active
          ? { backgroundColor: color ?? "var(--color-ritual-gold)" }
          : color
            ? { borderColor: `${color}55`, color }
            : undefined
      }
    >
      {children}
    </button>
  );
}

function CreatureCard({
  creature: c,
  index,
  selected,
  onSelect,
}: {
  creature: Creature;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const el = ELEMENTS[c.element];
  const th = THREATS[c.threat];
  return (
    <button
      onClick={onSelect}
      className={[
        "glass-panel group relative overflow-hidden rounded-2xl p-5 text-left transition-all",
        selected ? "border-ritual-gold/60" : "hover:border-white/25",
      ].join(" ")}
      style={{
        animation: "fade-up 0.5s var(--ease-out-expo) both",
        animationDelay: `${Math.min(index, 12) * 45}ms`,
      }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: th.color }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="ritual-title text-2xl text-foreground">{c.name}</h3>
          <p className="text-xs italic text-white/45">{c.epithet}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-1 text-[9px] uppercase tracking-widest"
          style={{ backgroundColor: `${th.color}22`, color: th.color }}
        >
          {th.name}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
        <span
          className="rounded-full border px-2 py-1"
          style={{ borderColor: `${el.color}55`, color: el.color }}
        >
          {el.name}
        </span>
        <span className="rounded-full border border-white/10 px-2 py-1 text-white/50">
          {BEHAVIORS[c.behavior].name}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 font-mono text-[11px]">
        <Stat label="PV" value={c.hp} />
        <Stat label="CA" value={c.ca} />
        <Stat label="SAN" value={`CD ${c.sanityDC}`} />
        <Stat label="COR" value={`+${c.corruption}`} />
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/30 p-2 text-center">
      <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function CreatureDetail({ creature: c }: { creature: Creature }) {
  const navigate = useNavigate();
  const el = ELEMENTS[c.element];
  const th = THREATS[c.threat];
  return (
    <div
      className="glass-panel space-y-6 rounded-2xl p-6"
      style={{ animation: "fade-up 0.4s var(--ease-out-expo) both" }}
    >
      <header className="space-y-1">
        <p className="ritual-eyebrow">Ficha de Anomalia</p>
        <h2 className="ritual-title text-3xl text-foreground">{c.name}</h2>
        <p className="text-xs italic text-white/45">{c.epithet}</p>
      </header>

      <p className="text-sm italic text-white/60">"{c.lore}"</p>

      <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest">
        <div className="rounded-lg p-2" style={{ backgroundColor: `${th.color}18`, color: th.color }}>
          Ameaça · {th.name}
        </div>
        <div className="rounded-lg p-2" style={{ backgroundColor: `${el.color}18`, color: el.color }}>
          {el.name}
        </div>
        <div className="col-span-2 rounded-lg border border-white/10 p-2 text-white/55">
          {BEHAVIORS[c.behavior].name} — {BEHAVIORS[c.behavior].description}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <Stat label="PV" value={c.hp} />
        <Stat label="CA" value={c.ca} />
        <Stat label="INIC" value={c.initiative} />
      </div>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-white/35">Ataques</p>
        {c.attacks.map((a) => (
          <div key={a.name} className="rounded-lg border border-white/5 bg-black/30 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-foreground">{a.name}</span>
              <span className="font-mono text-xs text-ritual-gold">{a.roll}</span>
            </div>
            <p className="font-mono text-xs text-white/60">{a.damage}</p>
            {a.note && <p className="mt-1 text-xs text-white/40">{a.note}</p>}
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-white/35">Traços</p>
        {c.traits.map((t) => (
          <div key={t.name} className="rounded-lg border border-white/5 p-3">
            <p className="text-sm text-prismatic">{t.name}</p>
            <p className="text-xs text-white/55">{t.description}</p>
          </div>
        ))}
      </section>

      <p className="text-[10px] uppercase tracking-widest text-white/35">
        Sanidade CD {c.sanityDC} · Corrupção +{c.corruption} ao derrotar
      </p>

      <button
        onClick={() => {
          queueCreature(c.id);
          navigate({ to: "/combate" });
        }}
        className="w-full rounded-md bg-ritual-gold py-3 text-xs uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-ritual-gold/90"
      >
        Enviar para Combate
      </button>
    </div>
  );
}
