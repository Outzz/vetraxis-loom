import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { queueCreature } from "@/lib/combat";
import { prepareCharacterPortrait } from "@/lib/character-image";
import {
  BEHAVIORS,
  CREATURES,
  THREATS,
  type Behavior,
  type Creature,
  type ThreatLevel,
} from "@/lib/bestiary";
import {
  deleteCreature,
  isAnomalyAdmin,
  loadCreatures,
  saveCreature,
  slugify,
} from "@/lib/creatures-store";
import { ELEMENTS, type CosmicElement } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/bestiario")({
  validateSearch: z.object({ campaign: z.string().uuid().optional() }),
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

const BLANK: Creature = {
  id: "",
  name: "",
  epithet: "",
  threat: Object.keys(THREATS)[0] as ThreatLevel,
  element: Object.keys(ELEMENTS)[0] as CosmicElement,
  behavior: Object.keys(BEHAVIORS)[0] as Behavior,
  hp: 20,
  ca: 12,
  initiative: "1d20+2",
  sanityDC: 12,
  corruption: 1,
  attacks: [{ name: "Ataque", roll: "+4", damage: "1d6+2", note: "" }],
  traits: [],
  lore: "",
  image: null,
};

function Bestiario() {
  const { campaign } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [threat, setThreat] = useState<Filter<ThreatLevel>>("all");
  const [element, setElement] = useState<Filter<CosmicElement>>("all");
  const [behavior, setBehavior] = useState<Filter<Behavior>>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creatures, setCreatures] = useState<Creature[]>(CREATURES);
  const [admin, setAdmin] = useState(false);
  const [draft, setDraft] = useState<Creature | null>(null);

  async function refresh() {
    setCreatures(await loadCreatures());
  }

  useEffect(() => {
    refresh();
    isAnomalyAdmin().then(setAdmin);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return creatures.filter((c) => {
      if (threat !== "all" && c.threat !== threat) return false;
      if (element !== "all" && c.element !== element) return false;
      if (behavior !== "all" && c.behavior !== behavior) return false;
      if (q && !`${c.name} ${c.epithet} ${c.lore}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [creatures, query, threat, element, behavior]);

  const active = results.find((c) => c.id === selectedId) ?? null;

  async function remove(c: Creature) {
    if (!confirm(`Apagar a anomalia "${c.name}"?`)) return;
    try {
      await deleteCreature(c.id);
      toast.success("Anomalia apagada.");
      setSelectedId(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível apagar.");
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-16">
      <Link
        to="/dashboard"
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
      >
        ← Portal
      </Link>

      <header
        className="mt-4 mb-10 flex flex-wrap items-end justify-between gap-6"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <div className="space-y-3">
          <p className="ritual-eyebrow">Catálogo de Anomalias</p>
          <h1 className="ritual-title text-6xl text-foreground">Bestiário</h1>
          <p className="max-w-2xl text-sm italic text-white/60">
            "Nomear uma anomalia não a torna menos real — apenas mais fácil de temer com
            precisão." — Arquivo de Campo, Vetraxis
          </p>
        </div>
        {admin && (
          <button
            onClick={() => setDraft({ ...BLANK })}
            className="rounded-md bg-ritual-gold px-5 py-3 text-[10px] uppercase tracking-widest text-abyss hover:bg-ritual-gold/90"
          >
            + Nova Anomalia
          </button>
        )}
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
          {results.length} de {creatures.length} criaturas catalogadas
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
              onSelect={() => setSelectedId(active?.id === c.id ? null : c.id)}
            />
          ))}
          {results.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
              Nenhuma anomalia corresponde a esses parâmetros. O vazio permanece silencioso.
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          {active ? (
            <CreatureDetail
              creature={active}
              campaignId={campaign}
              admin={admin}
              onEdit={() => setDraft({ ...active })}
              onDelete={() => remove(active)}
            />
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-sm text-white/40">
              Selecione uma criatura para consultar a ficha completa.
            </div>
          )}
        </aside>
      </div>

      {draft && (
        <CreatureEditor
          draft={draft}
          setDraft={setDraft}
          onClose={() => setDraft(null)}
          onSaved={(id) => {
            setDraft(null);
            setSelectedId(id);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
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
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: th.color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {c.image && (
            <img
              src={c.image}
              alt={c.name}
              className="size-14 shrink-0 rounded-lg border border-white/10 object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="ritual-title truncate text-2xl text-foreground">{c.name}</h3>
            <p className="truncate text-xs italic text-white/45">{c.epithet}</p>
          </div>
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

function CreatureDetail({
  creature: c,
  campaignId,
  admin,
  onEdit,
  onDelete,
}: {
  creature: Creature;
  campaignId?: string;
  admin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const el = ELEMENTS[c.element];
  const th = THREATS[c.threat];
  return (
    <div
      className="glass-panel space-y-6 rounded-2xl p-6"
      style={{ animation: "fade-up 0.4s var(--ease-out-expo) both" }}
    >
      {c.image && (
        <img
          src={c.image}
          alt={c.name}
          className="h-48 w-full rounded-xl border border-white/10 object-cover"
        />
      )}
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
          navigate({ to: "/combate", search: campaignId ? { campaign: campaignId } : {} });
        }}
        className="w-full rounded-md bg-ritual-gold py-3 text-xs uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-ritual-gold/90"
      >
        Enviar para Combate
      </button>

      {admin && (
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 rounded-md border border-prismatic/40 py-2.5 text-[10px] uppercase tracking-widest text-prismatic hover:bg-prismatic/10"
          >
            Editar anomalia
          </button>
          <button
            onClick={onDelete}
            className="rounded-md border border-corruption/40 px-4 py-2.5 text-[10px] uppercase tracking-widest text-corruption hover:bg-corruption/10"
          >
            Apagar
          </button>
        </div>
      )}
    </div>
  );
}

function CreatureEditor({
  draft,
  setDraft,
  onClose,
  onSaved,
}: {
  draft: Creature;
  setDraft: (c: Creature) => void;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Creature>(key: K, value: Creature[K]) {
    setDraft({ ...draft, [key]: value });
  }

  async function save() {
    if (!draft.name.trim()) {
      toast.error("A anomalia precisa de um nome.");
      return;
    }
    setSaving(true);
    try {
      const id = draft.id || slugify(draft.name);
      await saveCreature({ ...draft, id, name: draft.name.trim() });
      toast.success("Anomalia registrada no Bestiário.");
      onSaved(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-6 backdrop-blur-sm">
      <div className="glass-panel my-8 w-full max-w-3xl space-y-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="ritual-eyebrow">Escudo do Mestre</p>
            <h2 className="ritual-title text-3xl text-foreground">
              {draft.id ? "Editar anomalia" : "Nova anomalia"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-corruption">
            ✕
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-black/30 p-3">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-abyss text-2xl text-white/25">
            {draft.image ? (
              <img src={draft.image} alt="Prévia" className="h-full w-full object-cover" />
            ) : (
              "◇"
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer rounded-md border border-white/10 px-3 py-2 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold">
              {uploading ? "Preparando…" : "Escolher imagem"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    set("image", await prepareCharacterPortrait(file));
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Imagem inválida.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
            {draft.image && (
              <button
                onClick={() => set("image", null)}
                className="block text-[10px] uppercase tracking-widest text-corruption/70 hover:text-corruption"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Text label="Nome" value={draft.name} onChange={(v) => set("name", v)} />
          <Text label="Epíteto" value={draft.epithet} onChange={(v) => set("epithet", v)} />
          <Select
            label="Ameaça"
            value={draft.threat}
            options={(Object.keys(THREATS) as ThreatLevel[]).map((k) => [k, THREATS[k].name])}
            onChange={(v) => set("threat", v as ThreatLevel)}
          />
          <Select
            label="Elemento"
            value={draft.element}
            options={(Object.keys(ELEMENTS) as CosmicElement[]).map((k) => [k, ELEMENTS[k].name])}
            onChange={(v) => set("element", v as CosmicElement)}
          />
          <Select
            label="Comportamento"
            value={draft.behavior}
            options={(Object.keys(BEHAVIORS) as Behavior[]).map((k) => [k, BEHAVIORS[k].name])}
            onChange={(v) => set("behavior", v as Behavior)}
          />
          <Text
            label="Iniciativa (fórmula)"
            value={draft.initiative}
            onChange={(v) => set("initiative", v)}
          />
          <Num label="PV" value={draft.hp} onChange={(v) => set("hp", v)} />
          <Num label="CA" value={draft.ca} onChange={(v) => set("ca", v)} />
          <Num label="Sanidade CD" value={draft.sanityDC} onChange={(v) => set("sanityDC", v)} />
          <Num label="Corrupção" value={draft.corruption} onChange={(v) => set("corruption", v)} />
        </div>

        <div>
          <p className="ml-1 text-[10px] uppercase tracking-widest text-white/40">Lenda</p>
          <textarea
            value={draft.lore}
            onChange={(e) => set("lore", e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Ataques</p>
            <button
              onClick={() =>
                set("attacks", [...draft.attacks, { name: "", roll: "+0", damage: "1d6" }])
              }
              className="text-[10px] uppercase tracking-widest text-ritual-gold hover:underline"
            >
              + Adicionar
            </button>
          </div>
          {draft.attacks.map((a, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-white/5 p-3 md:grid-cols-4">
              <Text
                label="Nome"
                value={a.name}
                onChange={(v) =>
                  set("attacks", draft.attacks.map((x, j) => (j === i ? { ...x, name: v } : x)))
                }
              />
              <Text
                label="Rolagem"
                value={a.roll}
                onChange={(v) =>
                  set("attacks", draft.attacks.map((x, j) => (j === i ? { ...x, roll: v } : x)))
                }
              />
              <Text
                label="Dano"
                value={a.damage}
                onChange={(v) =>
                  set("attacks", draft.attacks.map((x, j) => (j === i ? { ...x, damage: v } : x)))
                }
              />
              <div className="flex items-end gap-2">
                <Text
                  label="Nota"
                  value={a.note ?? ""}
                  onChange={(v) =>
                    set("attacks", draft.attacks.map((x, j) => (j === i ? { ...x, note: v } : x)))
                  }
                />
                <button
                  onClick={() => set("attacks", draft.attacks.filter((_, j) => j !== i))}
                  className="mb-2 text-white/30 hover:text-corruption"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Traços / Habilidades</p>
            <button
              onClick={() => set("traits", [...draft.traits, { name: "", description: "" }])}
              className="text-[10px] uppercase tracking-widest text-ritual-gold hover:underline"
            >
              + Adicionar
            </button>
          </div>
          {draft.traits.map((t, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-white/5 p-3 md:grid-cols-[1fr_2fr_auto]">
              <Text
                label="Nome"
                value={t.name}
                onChange={(v) =>
                  set("traits", draft.traits.map((x, j) => (j === i ? { ...x, name: v } : x)))
                }
              />
              <Text
                label="Descrição"
                value={t.description}
                onChange={(v) =>
                  set("traits", draft.traits.map((x, j) => (j === i ? { ...x, description: v } : x)))
                }
              />
              <button
                onClick={() => set("traits", draft.traits.filter((_, j) => j !== i))}
                className="mb-2 self-end text-white/30 hover:text-corruption"
              >
                ✕
              </button>
            </div>
          ))}
        </section>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-white/10 px-5 py-2.5 text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving || uploading}
            className="rounded-md bg-ritual-gold px-5 py-2.5 text-[10px] uppercase tracking-widest text-abyss hover:bg-ritual-gold/90 disabled:opacity-50"
          >
            {saving ? "Selando…" : "Salvar anomalia"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="ml-1 text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
      />
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="ml-1 text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="ml-1 text-[10px] uppercase tracking-widest text-white/40">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-white/5 bg-abyss px-3 py-2 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
      >
        {options.map(([k, name]) => (
          <option key={k} value={k}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
